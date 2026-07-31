"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNav, type Section } from "@/components/rp/app/nav-store";
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
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Cpu,
  Database,
  Activity,
  PauseCircle,
  Plus,
  Trash2,
  Pencil,
  Download,
  FileText,
  ChevronRight,
  ChevronDown,
  ListChecks,
  Brain,
  Layers,
  Lock,
  Zap,
  BarChart3,
  Map as MapIcon,
  Settings2,
  Megaphone,
  Star,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  Crown,
  AlertOctagon,
  History,
  RefreshCw,
  ArrowRight,
  Eye,
  MessageSquare,
  Boxes,
  Gauge,
  MapPin,
  Loader2,
  Lightbulb,
  Shield,
  CircleDot,
  Wrench,
  Ban,
  Play,
  Hourglass,
  type LucideIcon,
} from "lucide-react";

/* ============================================================
   Types
============================================================ */

type ResponseSectionKind =
  | "confirmed"
  | "predictions"
  | "recommendations"
  | "pending"
  | "executed";

type TableState = "occupied" | "cleaning" | "free";
type StaffStatus = "active" | "overloaded" | "idle";
type AlertSeverity = "critical" | "medium" | "low";
type Risk = "Ninguno" | "Bajo" | "Medio";
type ConfidenceLabel = "Alta" | "Media" | "Baja";

interface ResponseSection {
  kind: ResponseSectionKind;
  title: string;
  items: string[];
}

interface TableDot {
  id: number;
  state: TableState;
}

interface StaffLoad {
  id: string;
  name: string;
  role: string;
  zone: string;
  load: number;
  status: StaffStatus;
}

interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  desc: string;
  time: string;
}

interface Recommendation {
  id: string;
  problem: string;
  impact: string;
  impactValue: string;
  recommendation: string;
  justification: string[];
  confidence: number;
  confidenceLabel: ConfidenceLabel;
  risk: Risk;
  agent: string;
  reasoning: string;
}

interface AgentStrip {
  id: string;
  name: string;
  status: "active" | "idle" | "warning";
  task: string;
  output: number;
  outputLabel: string;
  icon: LucideIcon;
  detail: {
    objective: string;
    tools: string[];
    recentOutputs: string[];
  };
}

interface Memory {
  id: string;
  content: string;
  type: "Preferencia" | "Regla operativa" | "Restricción" | "Instrucción temporal";
  createdBy: string;
  date: string;
  expires?: string;
  active: boolean;
}

interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  actorType: "agent" | "user" | "system";
  action: string;
  resource: string;
  result: "executed" | "pending" | "rejected" | "auto" | "completed";
  resultLabel: string;
}

interface QuickAction {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  variant: "primary" | "secondary";
  action: "navigate" | "stream" | "dialog";
  target?: Section;
}

/* ============================================================
   Demo data
============================================================ */

const DEMO_QUERY = "¿Cómo va mi restaurante hoy?";

const DEMO_RESPONSE_SECTIONS: ResponseSection[] = [
  {
    kind: "confirmed",
    title: "Estado confirmado",
    items: [
      "Ocupación actual: 84%",
      "Facturación estimada: €4.380",
      "Reservas pendientes de confirmar: 17",
      "Mesas ocupadas: 20/24",
      "Lista de espera: 5 grupos",
    ],
  },
  {
    kind: "predictions",
    title: "Predicciones",
    items: [
      "Riesgo de no-show: 3 mesas (confianza 82%)",
      "Ocupación prevista 22:00: 92% (confianza 85%)",
      "Facturación prevista cierre: €5.100 (confianza 78%)",
    ],
  },
  {
    kind: "recommendations",
    title: "Recomendaciones",
    items: [
      "Activar waitlist automática — 5 grupos esperando, 2 mesas en limpieza",
      "Mover 2 mesas de Carlos a Laura — Carlos OVERLOADED (58pts)",
      "Responder 4 reseñas prioritarias — Google Rating bajó 0.3 puntos",
    ],
  },
  {
    kind: "pending",
    title: "Acciones pendientes",
    items: [
      "¿Activar waitlist automática? [Confirmar] [Rechazar]",
      "¿Reasignar M8 + M12 a Laura? [Confirmar] [Rechazar]",
    ],
  },
  {
    kind: "executed",
    title: "Ejecutado",
    items: ["Dashboard actualizado con datos en tiempo real"],
  },
];

const DEMO_SOURCES =
  "D1 + Durable Objects + CRM + Reviews API · Actualizado hace 12s";

const DEMO_SUMMARY_TEXT =
  "Hoy el servicio va bien: 84% de ocupación, facturación estimada en €4.380 y 5 grupos en lista de espera. Detecto 3 riesgos de no-show y un empleado sobrecargado. Te propongo 3 acciones concretas.";

// 24 tables in a 4x6 grid (4 cols, 6 rows)
const DEMO_TABLES: TableDot[] = (() => {
  const arr: TableDot[] = [];
  // 20 occupied (gold), 2 cleaning (amber), 2 free (gray)
  // We interleave free/cleaning mid-grid for visual variety
  for (let i = 1; i <= 24; i++) {
    let state: TableState = "occupied";
    if (i === 9 || i === 14) state = "cleaning";
    if (i === 18 || i === 23) state = "free";
    arr.push({ id: i, state });
  }
  return arr;
})();

const DEMO_STAFF: StaffLoad[] = [
  { id: "s1", name: "Carlos M.", role: "Camarero", zone: "Sala interior", load: 92, status: "overloaded" },
  { id: "s2", name: "Laura P.", role: "Camarera", zone: "Terraza", load: 58, status: "active" },
  { id: "s3", name: "Diego R.", role: "Camarero", zone: "Sala exterior", load: 44, status: "active" },
  { id: "s4", name: "Marta L.", role: "Hostess", zone: "Entrada", load: 67, status: "active" },
  { id: "s5", name: "Iván S.", role: "Sommelier", zone: "Sala interior", load: 35, status: "active" },
  { id: "s6", name: "Nora V.", role: "Camarera", zone: "Barra", load: 28, status: "idle" },
];

const DEMO_ALERTS: AlertItem[] = [
  {
    id: "a1",
    severity: "critical",
    title: "Saturación en sala interior",
    desc: "Carlos M. con 92% de carga. 4 mesas pendientes de atención.",
    time: "hace 2 min",
  },
  {
    id: "a2",
    severity: "medium",
    title: "Google Rating bajó 0.3 puntos",
    desc: "4 reseñas negativas sin responder en últimos 7 días.",
    time: "hace 18 min",
  },
  {
    id: "a3",
    severity: "medium",
    title: "Riesgo de no-show 21:30",
    desc: "3 mesas con probabilidad de no-show > 60%.",
    time: "hace 31 min",
  },
];

const DEMO_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r1",
    problem: "Franja 21:30-22:30 al 95% con riesgo de saturación",
    impact: "+€340 ingresos estimados",
    impactValue: "+€340",
    recommendation:
      "Activar reservas dobles en zona interior (M5, M6, M11) entre 21:30 y 22:30. Ticket medio estimado €55 por mesa.",
    justification: ["Histórico viernes", "Ocupación actual 84%", "Capacidad disponible 4 mesas"],
    confidence: 84,
    confidenceLabel: "Alta",
    risk: "Bajo",
    agent: "Revenue Agent",
    reasoning:
      "El análisis del histórico de los últimos 6 viernes muestra que la franja 21:30-22:30 supera sistemáticamente el 90% de ocupación. La capacidad libre actual en zona interior (4 mesas) permite absorber la demanda sin penalizar la experiencia. Con un ticket medio de €55 y una rotación esperada de 1.5× en la franja, el ingreso incremental estimado es +€340 (intervalo €280-€420, confianza 84%). Riesgo bajo: no requiere cambios de personal, solo habilitar la franja en el sistema de reservas.",
  },
  {
    id: "r2",
    problem: "Carlos M. sobrecargado (92%) — 4 mesas pendientes",
    impact: "Tiempo de espera -4 min",
    impactValue: "-4 min",
    recommendation:
      "Reasignar M8 y M12 de Carlos a Laura (58% de carga actual). Laura absorbe carga sin entrar en zona de riesgo (<80%).",
    justification: ["Carga Carlos 92%", "Carga Laura 58%", "Misma zona"],
    confidence: 88,
    confidenceLabel: "Alta",
    risk: "Ninguno",
    agent: "Operations Agent",
    reasoning:
      "Carlos opera en sala interior con 92% de carga, lo que históricamente eleva el tiempo medio de atención en +4 minutos y aumenta el riesgo de reclamaciones. Laura, en la misma zona, está al 58% de carga con capacidad demostrada para absorber 2 mesas adicionales sin superar el umbral de riesgo del 80%. La reasignación es instantánea y reversible.",
  },
  {
    id: "r3",
    problem: "Google Rating bajó 0.3 puntos — 4 reseñas sin responder",
    impact: "+0.2 puntos en 7 días",
    impactValue: "+0.2 pts",
    recommendation:
      "Responder 4 reseñas prioritarias (1★ y 2★) con plantilla personalizada. Tono empático, propuesta de compensación y derivación a canal privado.",
    justification: ["4 reseñas pendientes", "Rating actual 4.1", "Ventana 7 días"],
    confidence: 76,
    confidenceLabel: "Media",
    risk: "Bajo",
    agent: "Reputation Agent",
    reasoning:
      "Responder reseñas negativas dentro de las 48h reduce la probabilidad de reseñas negativas futuras en 23% (estudio interno). Con 4 respuestas bien redactadas, el rating puede recuperar ~0.2 puntos en 7 días. Borradores ya generados por el Reputation Agent, requieren aprobación antes de publicar.",
  },
  {
    id: "r4",
    problem: "14 clientes VIP inactivos más de 90 días",
    impact: "+€1.840 facturación estimada",
    impactValue: "+€1.840",
    recommendation:
      "Lanzar campaña 'Recuperación VIP' con invitación a experiencia exclusiva. ROI esperado 800% basado en histórico.",
    justification: ["14 VIPs inactivos", "Ticket medio VIP €120", "Tasa respuesta 22%"],
    confidence: 68,
    confidenceLabel: "Media",
    risk: "Medio",
    agent: "Marketing Agent",
    reasoning:
      "14 clientes VIP llevan más de 90 días sin reserva. Históricamente, las campañas de recuperación VIP tienen una tasa de respuesta del 22% y un ticket medio de €120. Inversión estimada €230 (email + SMS personalizado), facturación esperada €1.840. Requiere aprobación por tratarse de comunicación saliente.",
  },
];

const DEMO_AGENTS_STRIP: AgentStrip[] = [
  {
    id: "revenue",
    name: "Revenue Agent",
    status: "active",
    task: "Analizando facturación...",
    output: 3,
    outputLabel: "recomendaciones generadas",
    icon: TrendingUp,
    detail: {
      objective: "Maximizar ingresos por servicio mediante pricing y gestión de capacidad",
      tools: ["query_revenue", "query_reservations", "create_recommendation", "open_capacity_slot"],
      recentOutputs: [
        "Reservas dobles zona interior 21:30-22:30",
        "Upsell postres en mesas con ticket < €40",
        "Promoción vino por copas en franja 22:00+",
      ],
    },
  },
  {
    id: "marketing",
    name: "Marketing Agent",
    status: "active",
    task: "Segmentando 14 VIPs inactivos...",
    output: 2,
    outputLabel: "campañas sugeridas",
    icon: Megaphone,
    detail: {
      objective: "Activar y fidelizar clientes mediante campañas personalizadas",
      tools: ["query_customers", "create_campaign", "create_segment", "send_communication"],
      recentOutputs: [
        "Campaña 'Recuperación VIP' (14 destinatarios)",
        "Campaña 'Cumpleaños febrero' (8 destinatarios)",
      ],
    },
  },
  {
    id: "reputation",
    name: "Reputation Agent",
    status: "active",
    task: "4 reseñas analizadas, respuestas generadas",
    output: 4,
    outputLabel: "respuestas generadas",
    icon: Star,
    detail: {
      objective: "Proteger y mejorar la reputación online respondiendo reseñas",
      tools: ["query_reviews", "draft_response", "analyze_sentiment", "publish_response"],
      recentOutputs: [
        "Respuesta a reseña 1★ de 'María G.'",
        "Respuesta a reseña 2★ de 'Javier P.'",
        "Respuesta a reseña 1★ de 'Ana R.'",
        "Respuesta a reseña 2★ de 'Luis M.'",
      ],
    },
  },
  {
    id: "operations",
    name: "Operations Agent",
    status: "warning",
    task: "1 alerta de saturación: Carlos OVERLOADED",
    output: 1,
    outputLabel: "alerta de saturación",
    icon: Settings,
    detail: {
      objective: "Optimizar flujo de operación del restaurante en tiempo real",
      tools: ["query_staff_load", "reassign_table", "open_zone", "create_alert"],
      recentOutputs: ["Reasignar M8 + M12 de Carlos a Laura"],
    },
  },
  {
    id: "finance",
    name: "Finance Agent",
    status: "active",
    task: "Calculando márgenes...",
    output: 2,
    outputLabel: "productos con bajo margen",
    icon: DollarSign,
    detail: {
      objective: "Vigilar y mejorar márgenes de platos y bebidas",
      tools: ["query_billing", "query_recipes", "create_margin_alert", "recost_dish"],
      recentOutputs: [
        "Bajo margen en 'Risotto trufa' (18% vs target 30%)",
        "Bajo margen en 'Vino casa tinto' (22% vs target 40%)",
      ],
    },
  },
  {
    id: "hr",
    name: "HR Agent",
    status: "idle",
    task: "Monitoreando carga personal...",
    output: 1,
    outputLabel: "sobrecarga detectada",
    icon: Users,
    detail: {
      objective: "Equilibrar la carga del personal y prevenir burnout",
      tools: ["query_staff_load", "create_recommendation", "shift_alert"],
      recentOutputs: ["Carlos M. sobrecargado — reasignación sugerida"],
    },
  },
];

const DEMO_MEMORIES: Memory[] = [
  {
    id: "m1",
    content: "Cocina cierra viernes a las 23:30",
    type: "Preferencia",
    createdBy: "Ana Martínez",
    date: "15 ene",
    active: true,
  },
  {
    id: "m2",
    content: "Terraza requiere reserva mínima 4 personas",
    type: "Regla operativa",
    createdBy: "Manager",
    date: "10 ene",
    active: true,
  },
  {
    id: "m3",
    content: "No aceptar reservas para 10+ sin depósito del 30%",
    type: "Restricción",
    createdBy: "Owner",
    date: "5 ene",
    active: true,
  },
  {
    id: "m4",
    content: "Evento privado sábado 25 — cerrar al público",
    type: "Instrucción temporal",
    createdBy: "Owner",
    date: "5 ene",
    expires: "26 ene",
    active: true,
  },
];

const DEMO_AUDIT: AuditEntry[] = [
  { id: "au1", ts: "14:32:01", actor: "Revenue Agent", actorType: "agent", action: "Generó recomendación", resource: "Reservas dobles zona interior", result: "auto", resultLabel: "Auto" },
  { id: "au2", ts: "14:31:48", actor: "User (Ana)", actorType: "user", action: "Aprobó acción", resource: "Reasignar M8 a Laura", result: "executed", resultLabel: "Executed" },
  { id: "au3", ts: "14:30:22", actor: "Marketing Agent", actorType: "agent", action: "Generó campaña", resource: "Recuperación VIPs inactivos", result: "pending", resultLabel: "Pending approval" },
  { id: "au4", ts: "14:28:15", actor: "Operations Agent", actorType: "agent", action: "Detectó alerta", resource: "Carlos OVERLOADED", result: "auto", resultLabel: "Auto" },
  { id: "au5", ts: "14:25:00", actor: "User (Ana)", actorType: "user", action: "Consulta", resource: "¿Cómo va mi restaurante hoy?", result: "completed", resultLabel: "Completed" },
  { id: "au6", ts: "14:22:33", actor: "Reputation Agent", actorType: "agent", action: "Generó respuesta", resource: "Reseña 1★ María G.", result: "pending", resultLabel: "Pending approval" },
  { id: "au7", ts: "14:18:09", actor: "Finance Agent", actorType: "agent", action: "Detectó bajo margen", resource: "Risotto trufa (18%)", result: "auto", resultLabel: "Auto" },
  { id: "au8", ts: "14:15:47", actor: "User (Manager)", actorType: "user", action: "Editó memoria", resource: "Terraza mín. 4 personas", result: "executed", resultLabel: "Executed" },
  { id: "au9", ts: "14:12:20", actor: "Revenue Agent", actorType: "agent", action: "Generó recomendación", resource: "Upsell postres mesas <€40", result: "auto", resultLabel: "Auto" },
  { id: "au10", ts: "14:08:55", actor: "User (Ana)", actorType: "user", action: "Rechazó acción", resource: "Campaña SMS masiva", result: "rejected", resultLabel: "Rejected" },
  { id: "au11", ts: "14:05:12", actor: "Operations Agent", actorType: "agent", action: "Generó recomendación", resource: "Reasignar M8+M12 a Laura", result: "pending", resultLabel: "Pending approval" },
  { id: "au12", ts: "14:00:00", actor: "System", actorType: "system", action: "Sincronización diaria", resource: "D1 + Durable Objects", result: "executed", resultLabel: "Executed" },
];

const QUICK_ACTIONS: QuickAction[] = [
  { id: "q1", label: "Resumen del día", desc: "Genera un resumen ejecutivo en streaming", icon: Sparkles, variant: "primary", action: "stream" },
  { id: "q2", label: "Responder reseñas", desc: "Abre el centro de reputación", icon: Star, variant: "secondary", action: "navigate", target: "reviews" },
  { id: "q3", label: "Crear campaña", desc: "Abre el editor de campañas", icon: Megaphone, variant: "secondary", action: "navigate", target: "campaigns" },
  { id: "q4", label: "Ver plano", desc: "Abre el plano de mesas en vivo", icon: MapIcon, variant: "secondary", action: "navigate", target: "reservas" },
  { id: "q5", label: "Generar informe", desc: "Crea un informe ejecutivo PDF", icon: FileText, variant: "primary", action: "dialog" },
  { id: "q6", label: "Configurar IA", desc: "Abre el Centro de IA", icon: Settings2, variant: "secondary", action: "navigate", target: "ai-center" },
];

const DAILY_REPORT_TEXT = `Resumen del servicio — Hoy viernes.

Servicio activo con 84% de ocupación actual y facturación estimada en €4.380. Se prevé cerrar el día con €5.100 (intervalo €4.700-€5.400, confianza 78%).

Acciones prioritarias detectadas:
1. Activar reservas dobles en zona interior 21:30-22:30 (+€340 estimados).
2. Reasignar 2 mesas de Carlos a Laura (Carlos sobrecargado 92%).
3. Responder 4 reseñas negativas (Google Rating bajó 0.3 puntos).

Estado del equipo:
- 6 miembros activos, 1 en sobrecarga.
- Carlos M. requiere redistribución de carga.

Reputación:
- 4 reseñas pendientes analizadas, respuestas redactadas por el Reputation Agent.
- Rating actual: 4.1★ (objetivo 4.3★).

Finanzas:
- 2 productos con margen inferior al target detectados por el Finance Agent.

Próximos pasos recomendados por el Executive Agent:
- Confirmar 2 acciones pendientes antes de las 15:00.
- Lanzar campaña 'Recuperación VIP' si se aprueba (ROI esperado 800%).`;

/* ============================================================
   Section component
============================================================ */

function SectionShell({
  index,
  eyebrow,
  title,
  desc,
  right,
  children,
}: {
  index: string;
  eyebrow: string;
  title: string;
  desc?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-24 py-8 sm:py-10 border-t border-border/40 first:border-t-0">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">{index}</span>
            <span className="h-px w-6 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="mt-2 font-display text-xl sm:text-2xl font-medium tracking-tight">{title}</h2>
          {desc ? <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl leading-relaxed">{desc}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children}
    </section>
  );
}

/* ============================================================
   Status / confidence badges
============================================================ */

const SECTION_BADGE_STYLES: Record<ResponseSectionKind, { label: string; cls: string; dot: string }> = {
  confirmed: {
    label: "Estado confirmado",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  predictions: {
    label: "Predicciones",
    cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    dot: "bg-[var(--teal)]",
  },
  recommendations: {
    label: "Recomendaciones",
    cls: "border-[var(--gold)]/45 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    dot: "bg-[var(--gold)]",
  },
  pending: {
    label: "Acciones pendientes",
    cls: "border-amber-400/45 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  executed: {
    label: "Ejecutado",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
};

function ResponseSectionCard({ section, delay }: { section: ResponseSection; delay: number }) {
  const s = SECTION_BADGE_STYLES[section.kind];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      className="rp-glass rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", s.cls)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
          {s.label}
        </span>
        {section.kind === "executed" ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
        ) : null}
      </div>
      <ul className="space-y-1.5">
        {section.items.map((it, i) => (
          <li key={i} className="text-sm text-foreground/85 leading-relaxed flex gap-2">
            <span className={cn("mt-2 h-1 w-1 shrink-0 rounded-full", s.dot)} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function ConfidenceBadge({ value, label }: { value: number; label: ConfidenceLabel }) {
  const tone =
    label === "Alta"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : label === "Media"
      ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
      : "border-rose-400/40 bg-rose-400/10 text-rose-300";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", tone)}>
      <Gauge className="h-3 w-3" aria-hidden />
      {label} {value}%
    </span>
  );
}

function RiskBadge({ level }: { level: Risk }) {
  const tone =
    level === "Ninguno"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : level === "Bajo"
      ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
      : "border-amber-400/45 bg-amber-400/10 text-amber-300";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", tone)}>
      <Shield className="h-3 w-3" aria-hidden />
      Riesgo {level}
    </span>
  );
}

function AgentBadge({ agent }: { agent: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-foreground/15 bg-foreground/[0.04] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
      <Cpu className="h-3 w-3" aria-hidden />
      Generado por: {agent}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const map = {
    critical: { label: "Crítica", cls: "border-rose-400/50 bg-rose-400/10 text-rose-300", dot: "bg-rose-400" },
    medium: { label: "Media", cls: "border-amber-400/45 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
    low: { label: "Baja", cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]", dot: "bg-[var(--teal)]" },
  } as const;
  const s = map[severity];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", s.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

function StatusDot({ status }: { status: "active" | "idle" | "warning" }) {
  const map = {
    active: { cls: "bg-emerald-400", label: "Active", text: "text-emerald-300" },
    idle: { cls: "bg-foreground/30", label: "Idle", text: "text-muted-foreground" },
    warning: { cls: "bg-amber-400", label: "Warning", text: "text-amber-300" },
  } as const;
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider">
      <span className="relative flex h-2 w-2">
        {status === "active" ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
        ) : null}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", s.cls)} />
      </span>
      <span className={s.text}>{s.label}</span>
    </span>
  );
}

function MemoryTypeBadge({ type }: { type: Memory["type"] }) {
  const map: Record<Memory["type"], string> = {
    Preferencia: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    "Regla operativa": "border-[var(--gold)]/45 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    Restricción: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    "Instrucción temporal": "border-amber-400/45 bg-amber-400/10 text-amber-300",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", map[type])}>
      {type}
    </span>
  );
}

function AuditResultPill({ result }: { result: AuditEntry["result"] }) {
  const map = {
    executed: { label: "Executed", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
    pending: { label: "Pending approval", cls: "border-amber-400/45 bg-amber-400/10 text-amber-300" },
    rejected: { label: "Rejected", cls: "border-rose-400/45 bg-rose-400/10 text-rose-300" },
    auto: { label: "Auto", cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]" },
    completed: { label: "Completed", cls: "border-foreground/20 bg-foreground/5 text-muted-foreground" },
  } as const;
  const s = map[result];
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", s.cls)}>
      {s.label}
    </span>
  );
}

/* ============================================================
   Mini floor plan (4x6 grid of colored dots)
============================================================ */

function MiniFloorPlan() {
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="grid grid-cols-6 gap-1.5" role="grid" aria-label="Mapa de mesas 4x6">
        {DEMO_TABLES.map((t) => {
          const color =
            t.state === "occupied"
              ? "bg-[var(--gold)]/85 ring-1 ring-[var(--gold)]/40"
              : t.state === "cleaning"
              ? "bg-amber-400/80 ring-1 ring-amber-400/40"
              : "bg-foreground/15 ring-1 ring-foreground/10";
          return (
            <div
              key={t.id}
              role="gridcell"
              aria-label={`Mesa ${t.id} ${t.state === "occupied" ? "ocupada" : t.state === "cleaning" ? "en limpieza" : "libre"}`}
              className={cn("aspect-square rounded-md", color)}
              title={`M${t.id} · ${t.state}`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--gold)]/85" />Ocupada</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-amber-400/80" />Limpieza</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-foreground/20" />Libre</span>
      </div>
    </div>
  );
}

/* ============================================================
   Mini timeline for reservations
============================================================ */

function MiniTimeline() {
  // Hours from 12 to 24 (lunch to late)
  const hours = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  // Reservation density per hour (demo)
  const density = [2, 5, 4, 1, 0, 1, 4, 9, 11, 7, 3];
  const max = Math.max(...density);
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="flex items-end gap-1 h-20" aria-label="Línea de tiempo de reservas por hora">
        {hours.map((h, i) => {
          const pct = max ? (density[i] / max) * 100 : 0;
          const peak = density[i] >= max - 1;
          return (
            <div key={h} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-full flex items-end">
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-all",
                    peak ? "bg-[var(--gold)]/85" : "bg-[var(--teal)]/55"
                  )}
                  style={{ height: `${Math.max(pct, 6)}%` }}
                  title={`${h}:00 — ${density[i]} reservas`}
                />
              </div>
              <span className="text-[9px] font-mono text-muted-foreground">{h}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        Pico 21:00 — 11 reservas · Próximo pico 22:00
      </div>
    </div>
  );
}

/* ============================================================
   Staff load bars
============================================================ */

function StaffLoadBars() {
  return (
    <div className="rp-glass rounded-xl p-4 space-y-2.5 max-h-72 overflow-y-auto rp-scroll-thin">
      {DEMO_STAFF.map((s) => {
        const barColor =
          s.status === "overloaded"
            ? "bg-rose-400/80"
            : s.status === "active"
            ? "bg-[var(--teal)]/70"
            : "bg-foreground/20";
        return (
          <div key={s.id}>
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{s.name}</span>
                {s.status === "overloaded" ? (
                  <span className="inline-flex items-center gap-1 rounded border border-rose-400/40 bg-rose-400/10 px-1.5 py-0 text-[9px] font-mono uppercase tracking-wider text-rose-300">
                    <AlertTriangle className="h-2.5 w-2.5" aria-hidden /> Overloaded
                  </span>
                ) : null}
              </div>
              <span className="font-mono text-muted-foreground text-[11px]">{s.load}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", barColor)}
                initial={{ width: 0 }}
                whileInView={{ width: `${s.load}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <div className="mt-0.5 text-[10px] font-mono text-muted-foreground">{s.role} · {s.zone}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   Alerts list
============================================================ */

function AlertsList() {
  return (
    <div className="rp-glass rounded-xl p-4 space-y-3 max-h-72 overflow-y-auto rp-scroll-thin">
      {DEMO_ALERTS.map((a) => (
        <div key={a.id} className="flex gap-2.5">
          <div className="mt-0.5 shrink-0">
            <AlertOctagon className={cn("h-4 w-4", a.severity === "critical" ? "text-rose-400" : "text-amber-300")} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium truncate">{a.title}</span>
              <SeverityBadge severity={a.severity} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{a.desc}</p>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Agent activity strip card
============================================================ */

function AgentStripCard({ agent, expanded, onToggle }: { agent: AgentStrip; expanded: boolean; onToggle: () => void }) {
  const statusTone =
    agent.status === "active" ? "text-emerald-300" : agent.status === "warning" ? "text-amber-300" : "text-muted-foreground";
  return (
    <div className="rp-glass rounded-xl p-4 min-h-[44px]">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 text-left"
        aria-expanded={expanded}
        aria-controls={`agent-strip-detail-${agent.id}`}
      >
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border", statusTone, "border-current/30 bg-current/5")}>
          <agent.icon className={cn("h-4 w-4", statusTone)} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm truncate">{agent.name}</span>
            <StatusDot status={agent.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground italic truncate">{agent.task}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-mono text-xs rp-gold-text">{agent.output}</span>
            <span className="text-[11px] text-muted-foreground">{agent.outputLabel}</span>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded ? "rotate-180" : "")} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            id={`agent-strip-detail-${agent.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-border/40 space-y-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Objetivo</div>
                <p className="text-xs text-foreground/85 leading-relaxed">{agent.detail.objective}</p>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Herramientas</div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.detail.tools.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded border border-foreground/15 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      <Wrench className="h-2.5 w-2.5" aria-hidden />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Outputs recientes</div>
                <ul className="space-y-1">
                  {agent.detail.recentOutputs.map((o, i) => (
                    <li key={i} className="text-xs text-foreground/85 flex gap-2 leading-relaxed">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--gold)]" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   Audit timeline entry
============================================================ */

function AuditEntryRow({ e }: { e: AuditEntry }) {
  const actorIcon =
    e.actorType === "agent" ? Cpu : e.actorType === "user" ? Users : Boxes;
  const ActorIcon = actorIcon;
  return (
    <div className="flex gap-3 sm:gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className="h-7 w-7 rounded-full rp-glass border border-border/60 flex items-center justify-center">
          <ActorIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        </div>
        <div className="w-px flex-1 bg-border/40 mt-1" />
      </div>
      <div className="min-w-0 flex-1 pb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-mono text-[10px] text-muted-foreground">{e.ts}</span>
            <span className="text-sm font-medium truncate">{e.actor}</span>
          </div>
          <AuditResultPill result={e.result} />
        </div>
        <div className="mt-1 text-sm text-foreground/85 leading-relaxed">
          <span className="text-muted-foreground">{e.action}:</span>{" "}
          <span className="text-foreground">{e.resource}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Main component
============================================================ */

export function AiOsDashboard() {
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();
  const go = useNav((s) => s.go);

  const [query, setQuery] = React.useState(DEMO_QUERY);
  const [submittedQuery, setSubmittedQuery] = React.useState<string | null>(DEMO_QUERY);
  const [typing, setTyping] = React.useState(false);
  const [streaming, setStreaming] = React.useState(false);
  const [streamedChars, setStreamedChars] = React.useState(0);
  const [visibleSections, setVisibleSections] = React.useState(DEMO_RESPONSE_SECTIONS.length);
  const [showResponseCard, setShowResponseCard] = React.useState(true);

  const [recommendationDialog, setRecommendationDialog] = React.useState<Recommendation | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = React.useState(false);
  const [dailySummaryOpen, setDailySummaryOpen] = React.useState(false);
  const [dailySummaryText, setDailySummaryText] = React.useState("");
  const [memories, setMemories] = React.useState<Memory[]>(DEMO_MEMORIES);
  const [newMemory, setNewMemory] = React.useState("");
  const [deleteMemoryId, setDeleteMemoryId] = React.useState<string | null>(null);
  const [expandedAgentId, setExpandedAgentId] = React.useState<string | null>("operations");

  // Reset to default demo state
  const resetDemoResponse = React.useCallback(() => {
    setSubmittedQuery(DEMO_QUERY);
    setShowResponseCard(true);
    setVisibleSections(DEMO_RESPONSE_SECTIONS.length);
    setStreamedChars(DEMO_SUMMARY_TEXT.length);
    setTyping(false);
    setStreaming(false);
  }, []);

  // Trigger streaming response simulation
  const triggerStreaming = React.useCallback(() => {
    setSubmittedQuery(query || DEMO_QUERY);
    setShowResponseCard(false);
    setVisibleSections(0);
    setStreamedChars(0);
    setTyping(true);
    setStreaming(true);
  }, [query]);

  // Typing -> stream summary text -> reveal sections progressively
  React.useEffect(() => {
    if (!typing) return;
    const typingTimer = window.setTimeout(() => {
      setTyping(false);
      // Now stream summary text char by char (~2s for full text)
      const text = DEMO_SUMMARY_TEXT;
      const total = text.length;
      const charDelay = Math.max(8, Math.floor(2000 / total));
      let i = 0;
      const interval = window.setInterval(() => {
        i += 2;
        setStreamedChars(Math.min(i, total));
        if (i >= total) {
          window.clearInterval(interval);
          // Reveal response card and progressively the sections
          setShowResponseCard(true);
          let n = 0;
          const sectionInterval = window.setInterval(() => {
            n += 1;
            setVisibleSections(n);
            if (n >= DEMO_RESPONSE_SECTIONS.length) {
              window.clearInterval(sectionInterval);
              setStreaming(false);
            }
          }, 220);
        }
      }, charDelay);
      return () => window.clearInterval(interval);
    }, 700);
    return () => window.clearTimeout(typingTimer);
  }, [typing]);

  const handleSend = () => {
    if (!query.trim()) {
      toast({
        title: "Consulta vacía",
        description: "Escribe una pregunta para el AI OS.",
      });
      return;
    }
    triggerStreaming();
  };

  const handleResetDemo = () => {
    setQuery(DEMO_QUERY);
    resetDemoResponse();
  };

  const handleQuickAction = (qa: QuickAction) => {
    if (qa.action === "navigate" && qa.target) {
      go(qa.target);
      toast({
        title: qa.label,
        description: `Abriendo ${qa.label.toLowerCase()}…`,
      });
      return;
    }
    if (qa.action === "dialog") {
      setReportDialogOpen(true);
      return;
    }
    if (qa.action === "stream") {
      setDailySummaryOpen(true);
      setDailySummaryText("");
      // stream the daily report text
      const text = DAILY_REPORT_TEXT;
      let i = 0;
      const interval = window.setInterval(() => {
        i += 3;
        setDailySummaryText(text.slice(0, i));
        if (i >= text.length) window.clearInterval(interval);
      }, 12);
      return () => window.clearInterval(interval);
    }
  };

  const handleAddMemory = () => {
    if (!newMemory.trim()) {
      toast({
        title: "Memoria vacía",
        description: "Escribe algo para que el AI OS recuerde.",
      });
      return;
    }
    const m: Memory = {
      id: `m-${Date.now()}`,
      content: newMemory.trim().replace(/^Recuerda que\s*/i, "").replace(/^recuerda que\s*/i, ""),
      type: "Preferencia",
      createdBy: "Ana Martínez",
      date: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
      active: true,
    };
    setMemories((prev) => [m, ...prev]);
    setNewMemory("");
    toast({
      title: "Memoria guardada",
      description: "Se aplicará en futuras recomendaciones del AI OS.",
    });
  };

  const handleConfirmPending = (text: string) => {
    toast({
      title: "Acción ejecutada",
      description: text,
    });
  };

  const handleRejectPending = (text: string) => {
    toast({
      title: "Acción rechazada",
      description: text,
    });
  };

  const handleExportAudit = () => {
    toast({
      title: "Auditoría exportada",
      description: "Se ha generado el fichero audit-2025-01-24.csv (12 entradas).",
    });
  };

  const handleEditMemory = (m: Memory) => {
    toast({
      title: "Editar memoria",
      description: `Abriendo editor para: "${m.content.slice(0, 40)}…"`,
    });
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setDeleteMemoryId(null);
    toast({
      title: "Memoria eliminada",
      description: "El AI OS ya no la aplicará en futuras recomendaciones.",
    });
  };

  const visibleSummaryText = DEMO_SUMMARY_TEXT.slice(0, streamedChars);

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
                AI OS Dashboard
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300">
                demo
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]">
                <Sparkles className="h-3 w-3" aria-hidden /> Cloudflare Workers AI
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Modelo: <span className="font-mono">@cf/meta/llama-3.1-8b-instruct</span> · ana.martinez@ramsesgroup.com
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => go("ai-center")} className="shrink-0">
          <Settings2 className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Configurar IA
        </Button>
      </header>

      {/* ============================================================
         Section 1: Executive Query Bar
      ============================================================ */}
      <section>
        <div className="rp-glass-strong rp-glow-gold rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Pregúntale al AI OS
            </span>
          </div>
          <div className="flex items-stretch gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ej. ¿Cómo va mi restaurante hoy? ¿Qué riesgo debería gestionar? ¿Qué acción debería tomar?"
              className="flex-1 h-12 text-sm sm:text-base bg-background/40"
              aria-label="Pregunta al AI OS"
            />
            <Button
              onClick={handleSend}
              disabled={streaming || typing}
              className="h-12 px-4 sm:px-6 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90"
            >
              {streaming || typing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
              <span className="ml-2 hidden sm:inline">Enviar</span>
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
            <span className="font-mono uppercase tracking-wider">Sugerencias:</span>
            {["¿Cómo va mi restaurante hoy?", "¿Qué riesgo debo gestionar?", "¿Qué acción debería tomar?"].map((s, i) => (
              <button
                key={i}
                onClick={() => setQuery(s)}
                className="rounded-md border border-border/60 bg-foreground/[0.02] px-2 py-1 text-xs hover:bg-foreground/5 hover:border-foreground/30 transition-colors"
              >
                {s}
              </button>
            ))}
            <button
              onClick={handleResetDemo}
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              aria-label="Restaurar demo"
            >
              <RefreshCw className="h-3 w-3" aria-hidden /> Restaurar demo
            </button>
          </div>
        </div>

        {/* Response card */}
        <AnimatePresence>
          {submittedQuery ? (
            <motion.div
              key="response-wrap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4"
            >
              <div className="rp-glass rounded-2xl p-4 sm:p-6">
                {/* User query echo */}
                <div className="flex items-start gap-2.5 mb-4">
                  <div className="h-7 w-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Consulta</div>
                    <p className="text-sm text-foreground/90">{submittedQuery}</p>
                  </div>
                </div>

                {/* AI response header */}
                <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-border/40">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center shrink-0">
                    <Cpu className="h-3.5 w-3.5 text-black" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">AI OS · @cf/meta/llama-3.1-8b-instruct</div>
                    <p className="text-sm font-medium">Respuesta estructurada</p>
                  </div>
                </div>

                {/* Typing indicator */}
                {typing ? (
                  <div className="flex items-center gap-2 py-4">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-2 w-2 rounded-full bg-[var(--gold)]"
                          animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">AI OS está pensando…</span>
                  </div>
                ) : null}

                {/* Streaming summary text */}
                {!typing && streaming ? (
                  <div className="py-2">
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {visibleSummaryText}
                      <span className="inline-block w-1.5 h-4 align-text-bottom ml-0.5 bg-[var(--gold)] animate-pulse" aria-hidden />
                    </p>
                  </div>
                ) : null}

                {/* Full structured response card */}
                {showResponseCard && !typing ? (
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Streaming summary still visible until done */}
                    {streaming && visibleSummaryText ? (
                      <p className="text-sm text-foreground/90 leading-relaxed">{visibleSummaryText}</p>
                    ) : null}

                    <div className="grid sm:grid-cols-2 gap-3">
                      {DEMO_RESPONSE_SECTIONS.map((section, i) => {
                        // reveal progressively based on visibleSections
                        const visible = i < visibleSections;
                        if (!visible) return null;
                        return (
                          <ResponseSectionCard key={section.kind} section={section} delay={i * 0.04} />
                        );
                      })}
                    </div>

                    {/* Pending actions CTAs */}
                    {visibleSections >= DEMO_RESPONSE_SECTIONS.length ? (
                      <motion.div
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="rp-glass rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-300" aria-hidden />
                          <span className="text-sm font-medium">Acciones pendientes de aprobación</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="rounded-lg border border-amber-400/30 bg-amber-400/[0.04] p-3">
                            <p className="text-xs text-foreground/90 mb-2">¿Activar waitlist automática?</p>
                            <div className="flex gap-2">
                              <Button size="sm" className="h-8 bg-[var(--gold)] text-black hover:opacity-90" onClick={() => handleConfirmPending("Waitlist automática activada — 5 grupos en cola.")}>
                                Confirmar
                              </Button>
                              <Button size="sm" variant="outline" className="h-8" onClick={() => handleRejectPending("Waitlist automática rechazada.")}>
                                Rechazar
                              </Button>
                            </div>
                          </div>
                          <div className="rounded-lg border border-amber-400/30 bg-amber-400/[0.04] p-3">
                            <p className="text-xs text-foreground/90 mb-2">¿Reasignar M8 + M12 a Laura?</p>
                            <div className="flex gap-2">
                              <Button size="sm" className="h-8 bg-[var(--gold)] text-black hover:opacity-90" onClick={() => handleConfirmPending("M8 + M12 reasignadas a Laura.")}>
                                Confirmar
                              </Button>
                              <Button size="sm" variant="outline" className="h-8" onClick={() => handleRejectPending("Reasignación M8 + M12 rechazada.")}>
                                Rechazar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}

                    {/* Sources */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                      <Database className="h-3.5 w-3.5" aria-hidden />
                      <span className="font-mono">{DEMO_SOURCES}</span>
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      {/* ============================================================
         Section 2: Real-time Operations Panel
      ============================================================ */}
      <SectionShell
        index="02"
        eyebrow="Tiempo real"
        title="Panel de operaciones en vivo"
        desc="Estado confirmado del servicio: mesas, reservas, personal y alertas activas."
        right={
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            En vivo · hace 12s
          </span>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Mesas */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-medium">Mesas</h3>
              <span className="text-[11px] font-mono text-muted-foreground">20/24 · 2 limpieza · 2 libres</span>
            </div>
            <MiniFloorPlan />
          </div>
          {/* Reservas */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-medium">Reservas</h3>
              <span className="text-[11px] font-mono text-muted-foreground">47 hoy · 38 ✓ · 5 pend · 4 espera</span>
            </div>
            <MiniTimeline />
          </div>
          {/* Personal */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-medium">Personal</h3>
              <span className="text-[11px] font-mono text-muted-foreground">6 activos · 1 OVERLOADED</span>
            </div>
            <StaffLoadBars />
          </div>
          {/* Alertas */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-medium">Alertas</h3>
              <span className="text-[11px] font-mono text-muted-foreground">3 activas · 1 crítica · 2 medias</span>
            </div>
            <AlertsList />
          </div>
        </div>
      </SectionShell>

      {/* ============================================================
         Section 3: AI Recommendations
      ============================================================ */}
      <SectionShell
        index="03"
        eyebrow="Recomendaciones"
        title="Acciones sugeridas por la IA"
        desc="Cada recomendación incluye problema detectado, impacto estimado, justificación con datos, confianza y riesgo."
        right={
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300">
            <ListChecks className="h-3 w-3" aria-hidden /> {DEMO_RECOMMENDATIONS.length} priorizadas
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DEMO_RECOMMENDATIONS.map((r, i) => (
            <motion.div
              key={r.id}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rp-glass rounded-xl p-4 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-foreground leading-snug">{r.problem}</p>
              </div>
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--gold)]/45 bg-[var(--gold)]/10 px-2 py-0.5 text-xs font-medium text-[var(--gold-soft)]">
                  <TrendingUp className="h-3 w-3" aria-hidden />
                  {r.impact}
                </span>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed mb-3">{r.recommendation}</p>
              <div className="mb-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Justificación</div>
                <div className="flex flex-wrap gap-1.5">
                  {r.justification.map((j, ji) => (
                    <span key={ji} className="inline-flex items-center gap-1 rounded border border-foreground/15 bg-foreground/[0.04] px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      <CircleDot className="h-2.5 w-2.5" aria-hidden />
                      {j}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <ConfidenceBadge value={r.confidence} label={r.confidenceLabel} />
                <RiskBadge level={r.risk} />
              </div>
              <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border/40">
                <AgentBadge agent={r.agent} />
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => setRecommendationDialog(r)}
                  >
                    <Eye className="h-3 w-3 mr-1" aria-hidden /> Análisis
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Posponer</Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground">Ignorar</Button>
                  <Button size="sm" className="h-7 px-3 text-xs bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90">
                    Ejecutar
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      {/* ============================================================
         Section 4: Agent Activity Panel
      ============================================================ */}
      <SectionShell
        index="04"
        eyebrow="Multi-agente"
        title="Panel de actividad de agentes"
        desc="6 agentes especializados trabajando en paralelo. Pulsa para ver objetivo, herramientas y outputs recientes."
        right={
          <Button variant="outline" size="sm" onClick={() => go("ai-center")}>
            Ver sistema multi-agente
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden />
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEMO_AGENTS_STRIP.map((a) => (
            <AgentStripCard
              key={a.id}
              agent={a}
              expanded={expandedAgentId === a.id}
              onToggle={() => setExpandedAgentId((prev) => (prev === a.id ? null : a.id))}
            />
          ))}
        </div>
      </SectionShell>

      {/* ============================================================
         Section 5: Memory & Context
      ============================================================ */}
      <SectionShell
        index="05"
        eyebrow="Memoria"
        title="Memoria y contexto del restaurante"
        desc="Reglas, preferencias y restricciones que el AI OS aplica a todas sus recomendaciones."
        right={
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]">
            <Brain className="h-3 w-3" aria-hidden /> {memories.length} memorias activas
          </span>
        }
      >
        <div className="space-y-3">
          {memories.map((m) => (
            <motion.div
              key={m.id}
              layout={reduceMotion ? false : true}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              className="rp-glass rounded-xl p-4 flex items-start gap-3"
            >
              <div className="h-9 w-9 rounded-lg bg-foreground/[0.04] border border-border/60 flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <MemoryTypeBadge type={m.type} />
                  <span className="text-[10px] font-mono text-muted-foreground">por {m.createdBy} · {m.date}</span>
                  {m.expires ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300">
                      <Clock className="h-2.5 w-2.5" aria-hidden /> Expira {m.expires}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-300">
                    <CheckCircle2 className="h-2.5 w-2.5" aria-hidden /> Activa
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{m.content}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEditMemory(m)}
                  aria-label={`Editar memoria: ${m.content}`}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-rose-300 hover:text-rose-400 hover:bg-rose-400/10"
                  onClick={() => setDeleteMemoryId(m.id)}
                  aria-label={`Eliminar memoria: ${m.content}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add new memory */}
        <div className="mt-4 rp-glass rounded-xl p-4">
          <label htmlFor="new-memory-input" className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
            Añadir memoria
          </label>
          <div className="flex items-stretch gap-2">
            <div className="flex items-center gap-2 flex-1 rounded-md border border-border/60 bg-background/40 px-3">
              <Plus className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
              <Input
                id="new-memory-input"
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMemory();
                  }
                }}
                placeholder="Recuerda que…"
                className="border-0 bg-transparent h-11 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button onClick={handleAddMemory} className="h-11 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90">
              Guardar memoria
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Las memorias se aplican automáticamente en las recomendaciones del AI OS. Marca el tipo adecuado al editar.
          </p>
        </div>
      </SectionShell>

      {/* ============================================================
         Section 6: Audit Timeline
      ============================================================ */}
      <SectionShell
        index="06"
        eyebrow="Auditoría"
        title="Timeline inmutable de acciones"
        desc="Registro completo de todas las acciones de la IA y de los usuarios. Toda acción queda auditada."
        right={
          <Button variant="outline" size="sm" onClick={handleExportAudit}>
            <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Exportar auditoría
          </Button>
        }
      >
        <div className="rp-glass rounded-xl p-4 max-h-[28rem] overflow-y-auto rp-scroll-thin">
          <div className="flex items-center gap-3 flex-wrap mb-4 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-400/80" />Executed</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-amber-400/80" />Pending</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-rose-400/80" />Rejected</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--teal)]/80" />Auto</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-foreground/20" />Completed</span>
          </div>
          <div>
            {DEMO_AUDIT.map((e) => (
              <AuditEntryRow key={e.id} e={e} />
            ))}
          </div>
        </div>
      </SectionShell>

      {/* ============================================================
         Section 7: Quick Actions
      ============================================================ */}
      <SectionShell
        index="07"
        eyebrow="Acciones rápidas"
        title="Acciones rápidas"
        desc="Genera, responde, crea o navega. Acceso directo a las tareas más frecuentes."
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((qa, i) => (
            <motion.button
              key={qa.id}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              onClick={() => handleQuickAction(qa)}
              className={cn(
                "min-h-[88px] rounded-xl p-4 text-left transition-colors border flex flex-col gap-1.5",
                qa.variant === "primary"
                  ? "rp-glass rp-glow-gold border-[var(--gold)]/40 hover:border-[var(--gold)]/60"
                  : "rp-glass border-border/60 hover:border-foreground/30"
              )}
            >
              <qa.icon className={cn("h-5 w-5", qa.variant === "primary" ? "rp-gold-text" : "text-muted-foreground")} aria-hidden />
              <div className="font-medium text-sm">{qa.label}</div>
              <div className="text-xs text-muted-foreground">{qa.desc}</div>
            </motion.button>
          ))}
        </div>
      </SectionShell>

      {/* ============================================================
         Footer: Plan limit + Security notice
      ============================================================ */}
      <footer className="mt-2 pt-6 border-t border-border/40 space-y-3">
        <div className="rp-glass rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold)]/40 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 rp-gold-text" aria-hidden />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Plan: Growth</div>
              <div className="text-sm">
                Consultas IA: <span className="font-mono rp-gold-text">1.847</span> / 5.000 este mes
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-40 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)]" style={{ width: "37%" }} />
            </div>
            <Button variant="outline" size="sm">Ver límites</Button>
          </div>
        </div>
        <div className="rp-glass rounded-xl p-4 flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--teal)]/10 border border-[var(--teal)]/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4 w-4 rp-teal-text" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium">Seguridad y aislamiento</div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              AI OS aislado por organización · Permisos validados · Toda acción queda auditada · Protección anti prompt injection activa.
            </p>
          </div>
        </div>
      </footer>

      {/* ============================================================
         Dialog: Recommendation analysis
      ============================================================ */}
      <Dialog open={!!recommendationDialog} onOpenChange={(o) => !o && setRecommendationDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 rp-gold-text" aria-hidden />
              Análisis de recomendación
            </DialogTitle>
            <DialogDescription>
              Razonamiento completo del agente. Datos confirmados, predicciones y nivel de confianza.
            </DialogDescription>
          </DialogHeader>
          {recommendationDialog ? (
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Problema detectado</div>
                <p className="text-sm font-medium leading-snug">{recommendationDialog.problem}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-md border border-[var(--gold)]/45 bg-[var(--gold)]/10 px-2 py-0.5 text-xs font-medium text-[var(--gold-soft)]">
                  <TrendingUp className="h-3 w-3" aria-hidden /> {recommendationDialog.impact}
                </span>
                <ConfidenceBadge value={recommendationDialog.confidence} label={recommendationDialog.confidenceLabel} />
                <RiskBadge level={recommendationDialog.risk} />
                <AgentBadge agent={recommendationDialog.agent} />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Recomendación</div>
                <p className="text-sm text-foreground/90 leading-relaxed">{recommendationDialog.recommendation}</p>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Justificación con datos</div>
                <div className="flex flex-wrap gap-1.5">
                  {recommendationDialog.justification.map((j, ji) => (
                    <span key={ji} className="inline-flex items-center gap-1 rounded border border-foreground/15 bg-foreground/[0.04] px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      <CircleDot className="h-2.5 w-2.5" aria-hidden /> {j}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Razonamiento del agente</div>
                <p className="text-sm text-foreground/85 leading-relaxed">{recommendationDialog.reasoning}</p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
            <Button className="bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90">
              Ejecutar ahora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================
         Dialog: Daily summary streaming
      ============================================================ */}
      <Dialog open={dailySummaryOpen} onOpenChange={setDailySummaryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 rp-gold-text" aria-hidden />
              Resumen del día
            </DialogTitle>
            <DialogDescription>
              Generado en streaming por el AI OS · Modelo @cf/meta/llama-3.1-8b-instruct
            </DialogDescription>
          </DialogHeader>
          <div className="rp-glass rounded-xl p-4 max-h-[60vh] overflow-y-auto rp-scroll-thin">
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed">
              {dailySummaryText}
              {dailySummaryText.length < DAILY_REPORT_TEXT.length ? (
                <span className="inline-block w-1.5 h-4 align-text-bottom ml-0.5 bg-[var(--gold)] animate-pulse" aria-hidden />
              ) : null}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDailySummaryOpen(false)}>Cerrar</Button>
            <Button className="bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90" disabled={dailySummaryText.length < DAILY_REPORT_TEXT.length}>
              <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Exportar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================
         Dialog: Executive report
      ============================================================ */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 rp-gold-text" aria-hidden />
              Informe ejecutivo — vista previa PDF
            </DialogTitle>
            <DialogDescription>
              Estructura del informe generado por el Executive Agent. Datos confirmados del servicio de hoy.
            </DialogDescription>
          </DialogHeader>
          <div className="rp-glass rounded-xl p-4 max-h-[60vh] overflow-y-auto rp-scroll-thin space-y-4">
            {[
              { t: "Resumen", v: "Servicio activo 84% ocupación · Facturación estimada €4.380 · Cierre previsto €5.100" },
              { t: "Reservas", v: "47 hoy (+12% vs ayer) · 38 confirmadas · 5 pendientes · 4 en lista de espera" },
              { t: "Ingresos", v: "Ticket medio €55 · Mesa top M12 €4.820/mes (+22% media) · Recomendación: reservas dobles 21:30-22:30 (+€340)" },
              { t: "Clientes", v: "8 VIPs con reserva hoy · 14 VIPs inactivos >90 días · Campaña recuperación ROI esperado 800%" },
              { t: "Reputación", v: "Google Rating 4.1★ (objetivo 4.3★) · 4 reseñas pendientes · Reputation Agent ha redactado respuestas" },
              { t: "Operaciones", v: "6 personal activo · 1 OVERLOADED (Carlos 92%) · 3 alertas activas (1 crítica)" },
              { t: "Recomendaciones prioritarias", v: "1) Activar reservas dobles 21:30-22:30 · 2) Reasignar M8+M12 a Laura · 3) Responder 4 reseñas · 4) Lanzar campaña VIP" },
            ].map((s, i) => (
              <div key={i} className="border-b border-border/40 last:border-0 pb-3 last:pb-0">
                <div className="text-[10px] font-mono uppercase tracking-wider rp-gold-text mb-1">{i + 1}. {s.t}</div>
                <p className="text-sm text-foreground/85 leading-relaxed">{s.v}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>Cerrar</Button>
            <Button className="bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90">
              <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Descargar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================
         Alert dialog: Delete memory confirm
      ============================================================ */}
      <AlertDialog open={!!deleteMemoryId} onOpenChange={(o) => !o && setDeleteMemoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar memoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El AI OS dejará de aplicar esta memoria en futuras recomendaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 hover:bg-rose-600 text-white"
              onClick={() => deleteMemoryId && handleDeleteMemory(deleteMemoryId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
