"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  AlertOctagon,
  Wrench,
  UtensilsCrossed,
  Wine,
  MessageSquareWarning,
  Bandage,
  Search,
  Users,
  Sparkles,
  Paperclip,
  AtSign,
  Send,
  Plus,
  Eye,
  UserPlus,
  CheckCircle2,
  Clock3,
  Hash,
  TimerReset,
  History,
  Pencil,
  Zap,
  ShieldCheck,
  Bot,
  ChefHat,
  LayoutGrid,
  Crown,
  Inbox,
  ListChecks,
  ArrowRight,
  Pause,
  PlayCircle,
  ChevronDown,
  Info,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type IncidentType =
  | "CustomerConflict"
  | "BrokenTable"
  | "EquipmentFailure"
  | "KitchenDelay"
  | "BarDelay"
  | "Complaint"
  | "Accident"
  | "LostProperty"
  | "StaffShortage"
  | "CleaningDelay"
  | "Other";

type IncidentSeverity = "critical" | "high" | "medium" | "low";
type IncidentStatus = "open" | "investigating" | "resolving" | "resolved" | "closed";

interface FloorIncident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  tableId?: string;
  zone?: string;
  reservationId?: string;
  reportedBy: string;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  slaMinutes: number;
  slaRemaining: number;
  comments: { at: string; by: string; text: string }[];
  cause?: string;
  resolution?: string;
  mentions: string[];
}

interface ChatMessage {
  id: string;
  sender: string;
  initials: string;
  text: string;
  at: string;
  tableRef?: string;
  incidentRef?: string;
}

interface Automation {
  id: string;
  name: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  active: boolean;
  executions: number;
  lastRun: string;
}

/* =========================================================
 * Meta maps
 * =======================================================*/
const TYPE_META: Record<
  IncidentType,
  { label: string; icon: React.ElementType }
> = {
  CustomerConflict: { label: "Conflicto cliente", icon: Users },
  BrokenTable: { label: "Mesa rota", icon: Wrench },
  EquipmentFailure: { label: "Fallo equipo", icon: AlertTriangle },
  KitchenDelay: { label: "Retraso cocina", icon: UtensilsCrossed },
  BarDelay: { label: "Retraso barra", icon: Wine },
  Complaint: { label: "Queja", icon: MessageSquareWarning },
  Accident: { label: "Accidente", icon: Bandage },
  LostProperty: { label: "Objeto perdido", icon: Search },
  StaffShortage: { label: "Personal insuficiente", icon: UserPlus },
  CleaningDelay: { label: "Limpieza retrasada", icon: Sparkles },
  Other: { label: "Otra", icon: AlertTriangle },
};

const SEVERITY_META: Record<
  IncidentSeverity,
  { label: string; border: string; badge: string; dot: string; icon: React.ElementType }
> = {
  critical: {
    label: "Crítica",
    border: "bg-destructive",
    badge: "border-destructive/45 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
    icon: AlertOctagon,
  },
  high: {
    label: "Alta",
    border: "bg-amber-400",
    badge: "border-amber-400/45 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    icon: AlertTriangle,
  },
  medium: {
    label: "Media",
    border: "bg-[var(--gold)]",
    badge: "border-[var(--gold)]/45 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    dot: "bg-[var(--gold)]",
    icon: AlertTriangle,
  },
  low: {
    label: "Baja",
    border: "bg-muted-foreground/50",
    badge: "border-border/60 bg-foreground/5 text-muted-foreground",
    dot: "bg-muted-foreground/60",
    icon: AlertTriangle,
  },
};

const STATUS_META: Record<
  IncidentStatus,
  { label: string; badge: string; dot: string }
> = {
  open: {
    label: "Abierta",
    badge: "border-rose-400/45 bg-rose-400/10 text-rose-300",
    dot: "bg-rose-400",
  },
  investigating: {
    label: "Investigando",
    badge: "border-amber-400/45 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  resolving: {
    label: "Resolviendo",
    badge: "border-[var(--gold)]/45 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    dot: "bg-[var(--gold)]",
  },
  resolved: {
    label: "Resuelta",
    badge: "border-emerald-400/45 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  closed: {
    label: "Cerrada",
    badge: "border-border/60 bg-foreground/5 text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
};

/* =========================================================
 * Helpers
 * =======================================================*/
function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

function slaStatus(remaining: number): {
  text: string;
  cls: string;
  icon: React.ElementType;
} {
  if (remaining < 0) {
    const over = Math.abs(remaining);
    return {
      text: `SLA incumplido (−${over} min)`,
      cls: "border-destructive/45 bg-destructive/10 text-destructive",
      icon: AlertOctagon,
    };
  }
  if (remaining <= 5) {
    return {
      text: `SLA: ${remaining} min restantes`,
      cls: "border-amber-400/45 bg-amber-400/10 text-amber-300",
      icon: Clock3,
    };
  }
  return {
    text: `SLA: ${remaining} min restantes`,
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    icon: TimerReset,
  };
}

function avatarColor(initials: string): string {
  const colors = [
    "bg-[var(--gold)]/15 text-[var(--gold-soft)]",
    "bg-[var(--teal)]/15 text-[var(--teal)]",
    "bg-emerald-400/15 text-emerald-300",
    "bg-amber-400/15 text-amber-300",
    "bg-rose-400/15 text-rose-300",
    "bg-fuchsia-400/15 text-fuchsia-300",
  ];
  const hash = initials
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/* =========================================================
 * Demo data
 * =======================================================*/
const NOW = Date.now();
const MIN = 60_000;

const INITIAL_INCIDENTS: FloorIncident[] = [
  {
    id: "INC-001",
    type: "KitchenDelay",
    severity: "high",
    status: "open",
    title: "Mesa 14: pedido retrasado 18 min",
    description:
      "Pedido de mesa 14 enviado a cocina hace 38 min. Tiempo medio histórico 20 min. Cliente pregunta por espera.",
    tableId: "M14",
    zone: "Sala",
    reservationId: "RES-2204",
    reportedBy: "Carlos (Camarero)",
    assignedTo: "Cocina",
    createdAt: new Date(NOW - 12 * MIN).toISOString(),
    slaMinutes: 25,
    slaRemaining: 7,
    comments: [
      {
        at: new Date(NOW - 12 * MIN).toISOString(),
        by: "Carlos",
        text: "Pedido enviado hace 38 min. Cliente ya pregunta.",
      },
      {
        at: new Date(NOW - 4 * MIN).toISOString(),
        by: "Cocina",
        text: "Sobrecarga en pass. Priorizamos mesa 14 ahora.",
      },
    ],
    mentions: ["@Cocina"],
  },
  {
    id: "INC-002",
    type: "Complaint",
    severity: "critical",
    status: "investigating",
    title: "Cliente M7: queja por servicio lento",
    description:
      "Cliente en mesa 7 (familia Ruiz, VIP recurrente) manifiesta queja por lentitud del servicio. Llevan 50 min sin segundo plato.",
    tableId: "M7",
    zone: "VIP",
    reservationId: "RES-2198",
    reportedBy: "Laura (Maître)",
    assignedTo: "Laura (Maître)",
    createdAt: new Date(NOW - 8 * MIN).toISOString(),
    slaMinutes: 10,
    slaRemaining: 2,
    comments: [
      {
        at: new Date(NOW - 8 * MIN).toISOString(),
        by: "Laura",
        text: "Cliente VIP molesto. Les he ofrecido bebida de cortesía.",
      },
      {
        at: new Date(NOW - 3 * MIN).toISOString(),
        by: "Dirección",
        text: "Aplica cortesía en postre también. Anota en ficha cliente.",
      },
    ],
    mentions: ["@Laura"],
  },
  {
    id: "INC-003",
    type: "BrokenTable",
    severity: "medium",
    status: "resolved",
    title: "Mesa 3: pata rota, bloqueada",
    description:
      "Pata de mesa 3 cedió durante el servicio. Mesa bloqueada y señalizada. Sustitución solicitada a mantenimiento.",
    tableId: "M3",
    zone: "Sala",
    reportedBy: "Marcos (Camarero)",
    assignedTo: "Mantenimiento",
    createdAt: new Date(NOW - 95 * MIN).toISOString(),
    resolvedAt: new Date(NOW - 25 * MIN).toISOString(),
    slaMinutes: 60,
    slaRemaining: 35,
    cause: "Desgaste estructural de pata (madera).",
    resolution:
      "Mesa sustituida por M3-bis. M3 enviada a taller para reparación. Estado actualizado a bloqueada en planificador.",
    comments: [
      {
        at: new Date(NOW - 95 * MIN).toISOString(),
        by: "Marcos",
        text: "Mesa 3 cedió. Afortunadamente sin clientes sentados.",
      },
      {
        at: new Date(NOW - 60 * MIN).toISOString(),
        by: "Mantenimiento",
        text: "Tengo mesa de reemplazo. Bajo en 5 min.",
      },
      {
        at: new Date(NOW - 25 * MIN).toISOString(),
        by: "Laura",
        text: "Mesa sustituida. M3 marcada como bloqueada en sistema.",
      },
    ],
    mentions: ["@Mantenimiento"],
  },
  {
    id: "INC-004",
    type: "CleaningDelay",
    severity: "low",
    status: "open",
    title: "Mesa 8: limpieza pendiente 10 min",
    description:
      "Mesa 8 finalizada hace 22 min, aún sin limpiar. Próxima reserva en 28 min. Riesgo bajo pero monitorizar.",
    tableId: "M8",
    zone: "Sala",
    reservationId: "RES-2210",
    reportedBy: "Sistema (automática)",
    assignedTo: undefined,
    createdAt: new Date(NOW - 5 * MIN).toISOString(),
    slaMinutes: 30,
    slaRemaining: 15,
    comments: [
      {
        at: new Date(NOW - 5 * MIN).toISOString(),
        by: "Sistema",
        text: "Detección automática: mesa finalizada hace 22 min sin cleaning.",
      },
    ],
    mentions: [],
  },
  {
    id: "INC-005",
    type: "EquipmentFailure",
    severity: "high",
    status: "resolving",
    title: "TPV barra no responde",
    description:
      "TPV principal de barra congelado. No procesa cobros. Reinicio en curso. Cobros alternativos en TPV móvil.",
    zone: "Barra",
    reportedBy: "Juan (Barra)",
    assignedTo: "Juan (Barra)",
    createdAt: new Date(NOW - 15 * MIN).toISOString(),
    slaMinutes: 20,
    slaRemaining: 5,
    comments: [
      {
        at: new Date(NOW - 15 * MIN).toISOString(),
        by: "Juan",
        text: "TPV barra no responde. Cobros con TPV móvil de momento.",
      },
      {
        at: new Date(NOW - 8 * MIN).toISOString(),
        by: "Juan",
        text: "Reinicio en curso. Soporte técnico avisado.",
      },
    ],
    mentions: ["@Juan"],
  },
  {
    id: "INC-006",
    type: "StaffShortage",
    severity: "medium",
    status: "closed",
    title: "Falta 1 camarero en terraza",
    description:
      "Baja de último minuto de Pablo (camarero terraza). Terraza con 3 camareros para 12 mesas activas. Cobertura cubierta por refuerzo.",
    zone: "Terraza",
    reportedBy: "Laura (Maître)",
    assignedTo: "Dirección",
    createdAt: new Date(NOW - 180 * MIN).toISOString(),
    resolvedAt: new Date(NOW - 130 * MIN).toISOString(),
    slaMinutes: 45,
    slaRemaining: 15,
    cause: "Baja médica no prevista.",
    resolution:
      "Refuerzo cubierto por Andrés (camarero sala). Turno reorganizado. Sin impacto en servicio.",
    comments: [
      {
        at: new Date(NOW - 180 * MIN).toISOString(),
        by: "Laura",
        text: "Pablo avisa baja. Terraza queda corta.",
      },
      {
        at: new Date(NOW - 130 * MIN).toISOString(),
        by: "Dirección",
        text: "Andrés cubre. Reorganizo turnos. Cierro incidencia.",
      },
    ],
    mentions: ["@Dirección"],
  },
  {
    id: "INC-007",
    type: "LostProperty",
    severity: "low",
    status: "open",
    title: "Mesa 12: cartera olvidada",
    description:
      "Cliente dejó cartera negra en mesa 12. Guardada en caja fuerte de caja. Pendiente localizar al cliente vía reserva.",
    tableId: "M12",
    zone: "Sala",
    reservationId: "RES-2215",
    reportedBy: "Marcos (Camarero)",
    assignedTo: "Recepción",
    createdAt: new Date(NOW - 18 * MIN).toISOString(),
    slaMinutes: 60,
    slaRemaining: 42,
    comments: [
      {
        at: new Date(NOW - 18 * MIN).toISOString(),
        by: "Marcos",
        text: "Cartera bajo mesa 12. La entrego a recepción.",
      },
    ],
    mentions: ["@Recepción"],
  },
];

const CHANNELS = [
  { id: "sala", label: "Sala", icon: LayoutGrid },
  { id: "cocina", label: "Cocina", icon: ChefHat },
  { id: "barra", label: "Barra", icon: Wine },
  { id: "direccion", label: "Dirección", icon: Crown },
] as const;

type ChannelId = (typeof CHANNELS)[number]["id"];

const CHANNEL_MESSAGES: Record<ChannelId, ChatMessage[]> = {
  sala: [
    {
      id: "s1",
      sender: "Laura (Maître)",
      initials: "LM",
      text: "Buenas noches equipo. Mesa 7 VIP con queja por lentitud. Aplicar cortesía en postre.",
      at: new Date(NOW - 28 * MIN).toISOString(),
      tableRef: "M7",
      incidentRef: "INC-002",
    },
    {
      id: "s2",
      sender: "Carlos",
      initials: "CA",
      text: "Entendido. Mesa 14 también acumula retraso de cocina, 18 min. Lo subo a cocina.",
      at: new Date(NOW - 22 * MIN).toISOString(),
      tableRef: "M14",
      incidentRef: "INC-001",
    },
    {
      id: "s3",
      sender: "Marcos",
      initials: "MA",
      text: "Mesa 3 sustituida por M3-bis. Ya disponible para asignar.",
      at: new Date(NOW - 25 * MIN).toISOString(),
      tableRef: "M3",
    },
    {
      id: "s4",
      sender: "Laura (Maître)",
      initials: "LM",
      text: "Perfecto Marcos. Reasigno la próxima reserva de 14:30 a M3-bis.",
      at: new Date(NOW - 23 * MIN).toISOString(),
    },
    {
      id: "s5",
      sender: "Sistema",
      initials: "SY",
      text: "Detección automática: mesa 8 lleva 22 min sin limpieza. Incidencia INC-004 creada.",
      at: new Date(NOW - 5 * MIN).toISOString(),
      tableRef: "M8",
      incidentRef: "INC-004",
    },
    {
      id: "s6",
      sender: "Carlos",
      initials: "CA",
      text: "Voy con mesa 8 ahora. 5 min.",
      at: new Date(NOW - 4 * MIN).toISOString(),
      tableRef: "M8",
    },
    {
      id: "s7",
      sender: "Marcos",
      initials: "MA",
      text: "Cartera encontrada en mesa 12. Entregada en recepción.",
      at: new Date(NOW - 18 * MIN).toISOString(),
      tableRef: "M12",
      incidentRef: "INC-007",
    },
    {
      id: "s8",
      sender: "Recepción",
      initials: "RE",
      text: "Recibido. Llamamos al cliente por teléfono de reserva.",
      at: new Date(NOW - 16 * MIN).toISOString(),
    },
    {
      id: "s9",
      sender: "Laura (Maître)",
      initials: "LM",
      text: "Reserva cumpleaños 21:30 en mesa 12. Confirmamos decoración.",
      at: new Date(NOW - 12 * MIN).toISOString(),
      tableRef: "M12",
    },
    {
      id: "s10",
      sender: "Marcos",
      initials: "MA",
      text: "Decoro mesa 12 a las 21:00. Globo y servilleta especial listos.",
      at: new Date(NOW - 10 * MIN).toISOString(),
    },
    {
      id: "s11",
      sender: "Carlos",
      initials: "CA",
      text: "Lista de espera en 4 grupos. ¿Abrimos zona VIP?",
      at: new Date(NOW - 6 * MIN).toISOString(),
    },
    {
      id: "s12",
      sender: "Laura (Maître)",
      initials: "LM",
      text: "Sí, abrimos VIP. 3 grupos compatibles. Aviso a dirección.",
      at: new Date(NOW - 5 * MIN).toISOString(),
    },
  ],
  cocina: [
    {
      id: "c1",
      sender: "Laura (Maître)",
      initials: "LM",
      text: "Pedido mesa 14 lleva 38 min. Clientes preguntando. Priorizar por favor.",
      at: new Date(NOW - 12 * MIN).toISOString(),
      tableRef: "M14",
      incidentRef: "INC-001",
    },
    {
      id: "c2",
      sender: "Jefe de cocina",
      initials: "JC",
      text: "Sobrecarga en pass. Priorizamos mesa 14 y mesa 7 (VIP).",
      at: new Date(NOW - 10 * MIN).toISOString(),
    },
    {
      id: "c3",
      sender: "Cocina",
      initials: "CO",
      text: "Mesa 7 fuera en 4 min. Mesa 14 en 6 min.",
      at: new Date(NOW - 8 * MIN).toISOString(),
      tableRef: "M7",
    },
    {
      id: "c4",
      sender: "Carlos",
      initials: "CA",
      text: "Mesa 5 pide segundo más. Lo añado al ticket.",
      at: new Date(NOW - 7 * MIN).toISOString(),
      tableRef: "M5",
    },
    {
      id: "c5",
      sender: "Jefe de cocina",
      initials: "JC",
      text: "Recibido. Anoto en cola.",
      at: new Date(NOW - 6 * MIN).toISOString(),
    },
    {
      id: "c6",
      sender: "Cocina",
      initials: "CO",
      text: "Pass limpio. Listos para siguientes pedidos.",
      at: new Date(NOW - 3 * MIN).toISOString(),
    },
    {
      id: "c7",
      sender: "Sistema",
      initials: "SY",
      text: "Alerta automática: 2 pedidos con >15 min en cocina. Revisar.",
      at: new Date(NOW - 2 * MIN).toISOString(),
    },
    {
      id: "c8",
      sender: "Jefe de cocina",
      initials: "JC",
      text: "Bajo control. Mesa 14 sale ya.",
      at: new Date(NOW - 1 * MIN).toISOString(),
      tableRef: "M14",
    },
  ],
  barra: [
    {
      id: "b1",
      sender: "Juan (Barra)",
      initials: "JU",
      text: "TPV barra no responde. Cobros con TPV móvil de momento.",
      at: new Date(NOW - 15 * MIN).toISOString(),
      incidentRef: "INC-005",
    },
    {
      id: "b2",
      sender: "Juan (Barra)",
      initials: "JU",
      text: "Reinicio en curso. Soporte técnico avisado.",
      at: new Date(NOW - 8 * MIN).toISOString(),
    },
    {
      id: "b3",
      sender: "Dirección",
      initials: "DI",
      text: "Si en 10 min no vuelve, derivamos todos los cobros a TPV móvil.",
      at: new Date(NOW - 6 * MIN).toISOString(),
    },
    {
      id: "b4",
      sender: "Juan (Barra)",
      initials: "JU",
      text: "Cócteles para mesa 5 listos. Subo a sala.",
      at: new Date(NOW - 5 * MIN).toISOString(),
      tableRef: "M5",
    },
    {
      id: "b5",
      sender: "Carlos",
      initials: "CA",
      text: "Recibido. Bajo a buscarlos.",
      at: new Date(NOW - 4 * MIN).toISOString(),
    },
    {
      id: "b6",
      sender: "Juan (Barra)",
      initials: "JU",
      text: "TPV responde de nuevo. Volviendo a operación normal.",
      at: new Date(NOW - 1 * MIN).toISOString(),
      incidentRef: "INC-005",
    },
  ],
  direccion: [
    {
      id: "d1",
      sender: "Dirección",
      initials: "DI",
      text: "Repaso turno: 22 mesas activas, 4 en lista de espera. Ocupación 86%.",
      at: new Date(NOW - 30 * MIN).toISOString(),
    },
    {
      id: "d2",
      sender: "Dirección",
      initials: "DI",
      text: "Laura: aplica cortesía en postre a mesa 7 (INC-002). Cliente VIP.",
      at: new Date(NOW - 22 * MIN).toISOString(),
      tableRef: "M7",
      incidentRef: "INC-002",
    },
    {
      id: "d3",
      sender: "Laura (Maître)",
      initials: "LM",
      text: "Aplicado. Cliente agradece el gesto.",
      at: new Date(NOW - 18 * MIN).toISOString(),
    },
    {
      id: "d4",
      sender: "Dirección",
      initials: "DI",
      text: "Revisión de incidencias críticas: INC-002 en curso. SLA 2 min. Mantener foco.",
      at: new Date(NOW - 6 * MIN).toISOString(),
      incidentRef: "INC-002",
    },
    {
      id: "d5",
      sender: "Dirección",
      initials: "DI",
      text: "Autorizo apertura zona VIP adicional. 3 grupos compatibles en lista de espera.",
      at: new Date(NOW - 4 * MIN).toISOString(),
    },
    {
      id: "d6",
      sender: "Laura (Maître)",
      initials: "LM",
      text: "Recibido. Reasigno camareros y abro V2 y V3.",
      at: new Date(NOW - 3 * MIN).toISOString(),
    },
    {
      id: "d7",
      sender: "Dirección",
      initials: "DI",
      text: "Recordatorio: comunicación interna NO sustituye incidencias formales. Usad «Nueva incidencia».",
      at: new Date(NOW - 2 * MIN).toISOString(),
    },
  ],
};

const AUTOMATIONS: Automation[] = [
  {
    id: "AUT-001",
    name: "Mesa termina → Limpieza automática",
    trigger: "ReservationCompleted",
    conditions: ["Mesa con estado Paid", "Sin incidencia abierta en la mesa"],
    actions: [
      "Crear tarea de limpieza",
      "Notificar a personal de sala",
      "Cambiar mesa a estado Cleaning",
      "Confirmar limpieza → cambiar a Available",
    ],
    active: true,
    executions: 47,
    lastRun: new Date(NOW - 12 * MIN).toISOString(),
  },
  {
    id: "AUT-002",
    name: "Retraso cocina >15 min → Alerta",
    trigger: "OrderDelay > 15 min",
    conditions: ["Pedido en estado Sent", "Sin incidencia KitchenDelay abierta para la mesa"],
    actions: ["Notificar a cocina", "Notificar a maître", "Crear incidencia KitchenDelay"],
    active: true,
    executions: 3,
    lastRun: new Date(NOW - 18 * MIN).toISOString(),
  },
  {
    id: "AUT-003",
    name: "Lista de espera >5 → Reforzar personal",
    trigger: "WaitlistCount > 5",
    conditions: ["En horario pico", "Zona con capacidad limitada"],
    actions: ["Sugerir refuerzo de personal", "Notificar a dirección", "Sugerir abrir zona adicional"],
    active: true,
    executions: 2,
    lastRun: new Date(NOW - 35 * MIN).toISOString(),
  },
  {
    id: "AUT-004",
    name: "VIP arrival → Notify maître",
    trigger: "VIPCheckedIn",
    conditions: ["Cliente etiquetado VIP", "Reserva confirmada"],
    actions: ["Notificar a maître", "Asignar mejor camarero disponible", "Sugerir mesa preferida"],
    active: true,
    executions: 8,
    lastRun: new Date(NOW - 65 * MIN).toISOString(),
  },
  {
    id: "AUT-005",
    name: "Mesa bloqueada >30 min → Alerta",
    trigger: "TableBlocked > 30 min",
    conditions: ["Mesa en estado Blocked", "Sin tarea de mantenimiento activa"],
    actions: ["Notificar a manager", "Sugerir inspección", "Crear incidencia si procede"],
    active: false,
    executions: 14,
    lastRun: new Date(NOW - 240 * MIN).toISOString(),
  },
];

/* =========================================================
 * Incident card
 * =======================================================*/
function IncidentCard({
  inc,
  index,
  onDetail,
  onAssign,
  onResolve,
}: {
  inc: FloorIncident;
  index: number;
  onDetail: () => void;
  onAssign: () => void;
  onResolve: () => void;
}) {
  const reduce = useReducedMotion();
  const sev = SEVERITY_META[inc.severity];
  const sm = STATUS_META[inc.status];
  const tm = TYPE_META[inc.type];
  const SevIcon = sev.icon;
  const TypeIcon = tm.icon;
  const sla = slaStatus(inc.slaRemaining);
  const SlaIcon = sla.icon;
  const lastComment = inc.comments[inc.comments.length - 1];

  const isClosed = inc.status === "resolved" || inc.status === "closed";

  return (
    <motion.article
      layout={reduce ? false : true}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, x: -10 }}
      transition={{ duration: 0.28, delay: reduce ? 0 : index * 0.03 }}
      className={cn(
        "rp-glass relative overflow-hidden rounded-xl",
        inc.severity === "critical" && inc.status !== "closed" && inc.status !== "resolved" && "ring-1 ring-destructive/30"
      )}
    >
      <span
        className={cn("absolute inset-y-0 left-0 w-1", sev.border)}
        aria-hidden="true"
      />

      <div className="p-4 pl-5 sm:p-5 sm:pl-6">
        {/* Top row: ID + type + severity + status */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{inc.id}</span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-foreground/[0.04] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground"
            )}
          >
            <TypeIcon className="h-3 w-3" />
            {tm.label}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
              sev.badge
            )}
          >
            <SevIcon className="h-3 w-3" />
            {sev.label}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
              sm.badge
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", sm.dot)} />
            {sm.label}
          </span>
        </div>

        {/* Title */}
        <h4 className="mt-2.5 text-base font-semibold leading-snug text-foreground">
          {inc.title}
        </h4>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {inc.description}
        </p>

        {/* Context row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {inc.tableId && (
            <span className="inline-flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Mesa <span className="font-mono">{inc.tableId}</span>
            </span>
          )}
          {inc.zone && (
            <span className="inline-flex items-center gap-1">
              <LayoutGrid className="h-3 w-3" />
              {inc.zone}
            </span>
          )}
          {inc.reservationId && (
            <span className="inline-flex items-center gap-1 font-mono">
              <ArrowRight className="h-3 w-3" />
              {inc.reservationId}
            </span>
          )}
        </div>

        {/* Reporter + assignee */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            Reportada por <span className="text-foreground/85">{inc.reportedBy}</span>
          </span>
          {inc.assignedTo && (
            <span className="inline-flex items-center gap-1">
              Asignada a <span className="text-foreground/85">{inc.assignedTo}</span>
            </span>
          )}
          <span className="opacity-80">{formatRelative(inc.createdAt)}</span>
        </div>

        {/* SLA timer */}
        <div className="mt-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider",
              sla.cls
            )}
          >
            <SlaIcon className="h-3 w-3" />
            {sla.text}
          </span>
        </div>

        {/* Last comment preview */}
        {lastComment && (
          <div className="mt-3 rounded-md border border-border/40 bg-foreground/[0.02] p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <MessageSquareWarning className="h-3 w-3" />
              Último comentario · {inc.comments.length}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-foreground/85">
              <span className="font-medium">{lastComment.by}:</span> {lastComment.text}
            </p>
          </div>
        )}

        {/* Mentions */}
        {inc.mentions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {inc.mentions.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-2 py-0.5 text-[11px] text-[var(--teal)]"
              >
                <AtSign className="h-3 w-3" />
                {m.replace("@", "")}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onDetail}
            className="h-9 border-border/50 bg-transparent"
          >
            <Eye className="h-4 w-4" />
            Ver detalle
          </Button>
          {!isClosed && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={onAssign}
                className="h-9 text-muted-foreground hover:text-foreground"
              >
                <UserPlus className="h-4 w-4" />
                Asignar
              </Button>
              <Button
                size="sm"
                onClick={onResolve}
                className="h-9 bg-[var(--gold)] text-[#1a1205] hover:bg-[var(--gold-soft)]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Resolver
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* =========================================================
 * Incident detail dialog
 * =======================================================*/
function IncidentDetailDialog({
  inc,
  onClose,
}: {
  inc: FloorIncident | null;
  onClose: () => void;
}) {
  if (!inc) return null;
  const sev = SEVERITY_META[inc.severity];
  const sm = STATUS_META[inc.status];
  const tm = TYPE_META[inc.type];
  const sla = slaStatus(inc.slaRemaining);

  return (
    <Dialog open={!!inc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rp-scroll-thin sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">{inc.id}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                sev.badge
              )}
            >
              {sev.label}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                sm.badge
              )}
            >
              {sm.label}
            </span>
          </div>
          <DialogTitle className="mt-2 font-display text-xl font-medium tracking-tight sm:text-2xl">
            {inc.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {inc.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          {/* Context + SLA */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rp-glass rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Tipo
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">{tm.label}</div>
            </div>
            <div className="rp-glass rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                SLA objetivo
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-xl font-light tabular-nums">
                  {inc.slaMinutes} min
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                    sla.cls
                  )}
                >
                  {sla.text}
                </span>
              </div>
            </div>
          </div>

          {/* Context */}
          <div className="rp-glass rounded-xl p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Contexto
            </div>
            <dl className="mt-2 space-y-1.5 text-xs">
              {inc.tableId && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Mesa</dt>
                  <dd className="font-mono text-foreground/90">{inc.tableId}</dd>
                </div>
              )}
              {inc.zone && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Zona</dt>
                  <dd className="text-foreground/90">{inc.zone}</dd>
                </div>
              )}
              {inc.reservationId && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Reserva</dt>
                  <dd className="font-mono text-foreground/90">{inc.reservationId}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Reportada por</dt>
                <dd className="text-foreground/90">{inc.reportedBy}</dd>
              </div>
              {inc.assignedTo && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Asignada a</dt>
                  <dd className="text-foreground/90">{inc.assignedTo}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Creada</dt>
                <dd className="font-mono text-foreground/90">
                  {new Date(inc.createdAt).toLocaleString("es-ES")}
                </dd>
              </div>
              {inc.resolvedAt && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Resuelta</dt>
                  <dd className="font-mono text-foreground/90">
                    {new Date(inc.resolvedAt).toLocaleString("es-ES")}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Cause + resolution */}
          {(inc.cause || inc.resolution) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {inc.cause && (
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-4">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                    Causa
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/85">{inc.cause}</p>
                </div>
              )}
              {inc.resolution && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] p-4">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                    Resolución
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/85">{inc.resolution}</p>
                </div>
              )}
            </div>
          )}

          {/* Comments / timeline */}
          <div className="rp-glass rounded-xl p-4">
            <div className="flex items-center gap-2">
              <MessageSquareWarning className="h-4 w-4 rp-teal-text" />
              <h4 className="text-sm font-medium">Comentarios · {inc.comments.length}</h4>
            </div>
            <ol className="mt-3 space-y-3">
              {inc.comments.map((c, i) => (
                <li key={i} className="relative pl-4">
                  <span
                    className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--teal)]"
                    aria-hidden
                  />
                  <div className="flex items-baseline gap-2 text-xs">
                    <span className="font-medium text-foreground/90">{c.by}</span>
                    <span className="text-[10px] text-muted-foreground">{formatRelative(c.at)}</span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{c.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * New incident dialog
 * =======================================================*/
function NewIncidentDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: IncidentType;
    severity: IncidentSeverity;
    title: string;
    description: string;
    tableId?: string;
    assignedTo?: string;
  }) => void;
}) {
  const [type, setType] = React.useState<IncidentType>("Complaint");
  const [severity, setSeverity] = React.useState<IncidentSeverity>("medium");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tableId, setTableId] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setType("Complaint");
      setSeverity("medium");
      setTitle("");
      setDescription("");
      setTableId("");
      setAssignedTo("");
    }
  }, [open]);

  const submit = () => {
    if (!title.trim() || !description.trim()) return;
    onSubmit({
      type,
      severity,
      title: title.trim(),
      description: description.trim(),
      tableId: tableId.trim() || undefined,
      assignedTo: assignedTo.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rp-scroll-thin sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-medium tracking-tight">
            Nueva incidencia
          </DialogTitle>
          <DialogDescription>
            Registra una incidencia formal. Quedará en el centro de incidencias con SLA y
            pista de auditoría.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="inc-type" className="text-xs">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as IncidentType)}>
                <SelectTrigger id="inc-type" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inc-sev" className="text-xs">Severidad</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as IncidentSeverity)}>
                <SelectTrigger id="inc-sev" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inc-title" className="text-xs">Título</Label>
            <Input
              id="inc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Mesa 9: cliente insatisfecho con tiempo de espera"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inc-desc" className="text-xs">Descripción</Label>
            <Textarea
              id="inc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla qué ha ocurrido, mesa, hora, personas implicadas..."
              className="min-h-[90px] resize-none rp-scroll-thin"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="inc-table" className="text-xs">Mesa (opcional)</Label>
              <Input
                id="inc-table"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                placeholder="Ej. M9"
                className="h-10 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inc-assign" className="text-xs">Asignar a (opcional)</Label>
              <Input
                id="inc-assign"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Ej. Laura (Maître)"
                className="h-10"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="h-9">Cancelar</Button>
          <Button
            onClick={submit}
            disabled={!title.trim() || !description.trim()}
            className="h-9 bg-[var(--gold)] text-[#1a1205] hover:bg-[var(--gold-soft)] disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Crear incidencia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Resolve dialog (cause + resolution + close)
 * =======================================================*/
function ResolveDialog({
  inc,
  onClose,
  onConfirm,
}: {
  inc: FloorIncident | null;
  onClose: () => void;
  onConfirm: (data: { cause: string; resolution: string }) => void;
}) {
  const [cause, setCause] = React.useState("");
  const [resolution, setResolution] = React.useState("");

  React.useEffect(() => {
    if (inc) {
      setCause(inc.cause ?? "");
      setResolution(inc.resolution ?? "");
    }
  }, [inc]);

  return (
    <Dialog open={!!inc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-medium tracking-tight">
            Resolver incidencia {inc?.id}
          </DialogTitle>
          <DialogDescription>
            Documenta causa y resolución. La incidencia quedará cerrada con auditoría.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="res-cause" className="text-xs">Causa raíz</Label>
            <Textarea
              id="res-cause"
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              placeholder="Ej. Sobrecarga en pass de cocina por pico de pedidos."
              className="min-h-[70px] resize-none rp-scroll-thin"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="res-resolution" className="text-xs">Resolución aplicada</Label>
            <Textarea
              id="res-resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Ej. Reorganizada cola de cocina. Mesa servida. Cortesía aplicada."
              className="min-h-[70px] resize-none rp-scroll-thin"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="h-9">Cancelar</Button>
          <Button
            onClick={() => onConfirm({ cause, resolution })}
            disabled={!cause.trim() || !resolution.trim()}
            className="h-9 bg-emerald-500 text-[#04201e] hover:bg-emerald-400 disabled:opacity-40"
          >
            <CheckCircle2 className="h-4 w-4" />
            Resolver y cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Chat channel
 * =======================================================*/
function ChatChannel({
  channelId,
  messages,
  onSend,
}: {
  channelId: ChannelId;
  messages: ChatMessage[];
  onSend: (text: string) => void;
}) {
  const [text, setText] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, channelId]);

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="rp-glass flex flex-col rounded-xl">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="max-h-[420px] min-h-[280px] overflow-y-auto rp-scroll-thin p-3 sm:p-4"
      >
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.01, 0.1) }}
              className={cn(
                "flex gap-2.5",
                m.sender === "Sistema" && "opacity-90"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0 border border-border/40">
                <AvatarFallback className={cn("text-[10px] font-medium", avatarColor(m.initials))}>
                  {m.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-xs font-medium text-foreground/90">{m.sender}</span>
                  <span className="text-[10px] text-muted-foreground">{formatRelative(m.at)}</span>
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-foreground/85">{m.text}</p>
                {(m.tableRef || m.incidentRef) && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {m.tableRef && (
                      <span className="inline-flex items-center gap-1 rounded border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-1.5 py-0.5 text-[10px] font-mono text-[var(--gold-soft)]">
                        <Hash className="h-2.5 w-2.5" />
                        {m.tableRef}
                      </span>
                    )}
                    {m.incidentRef && (
                      <span className="inline-flex items-center gap-1 rounded border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-1.5 py-0.5 text-[10px] font-mono text-[var(--teal)]">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {m.incidentRef}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/40 p-3 sm:p-4">
        <div className="flex items-end gap-2">
          <div className="flex min-h-[44px] flex-1 items-end gap-1.5 rounded-lg border border-border/50 bg-background/40 px-2 py-1.5">
            <button
              aria-label="Adjuntar"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              aria-label="Mencionar"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <AtSign className="h-4 w-4" />
            </button>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              placeholder={`Mensaje al canal ${channelId}…`}
              className="max-h-24 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none rp-scroll-thin"
            />
          </div>
          <Button
            size="sm"
            onClick={submit}
            disabled={!text.trim()}
            className="h-11 px-3 bg-[var(--gold)] text-[#1a1205] hover:bg-[var(--gold-soft)] disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="font-mono uppercase tracking-wider">Canal:</span>
          <span className="font-medium text-foreground/70">{channelId}</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Automation card
 * =======================================================*/
function AutomationCard({
  aut,
  index,
  onToggle,
  onHistory,
}: {
  aut: Automation;
  index: number;
  onToggle: () => void;
  onHistory: () => void;
}) {
  const reduce = useReducedMotion();
  const [historyOpen, setHistoryOpen] = React.useState(false);

  // Demo execution log
  const log = [
    { at: new Date(Date.now() - 12 * MIN).toISOString(), result: "OK", detail: "Ejecutada en 320ms" },
    { at: new Date(Date.now() - 47 * MIN).toISOString(), result: "OK", detail: "Ejecutada en 280ms" },
    { at: new Date(Date.now() - 95 * MIN).toISOString(), result: "OK", detail: "Ejecutada en 410ms" },
  ];

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: reduce ? 0 : index * 0.04 }}
      className={cn(
        "rp-glass rounded-xl p-4 sm:p-5",
        !aut.active && "opacity-80"
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
              aut.active
                ? "bg-[var(--gold)]/10 rp-gold-text"
                : "bg-foreground/5 text-muted-foreground"
            )}
          >
            <Bot className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold leading-snug text-foreground sm:text-base">
              {aut.name}
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-mono">{aut.id}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span className="tabular-nums">{aut.executions}</span> ejecuciones
              </span>
              <span aria-hidden>·</span>
              <span>última: {formatRelative(aut.lastRun)}</span>
            </div>
          </div>
        </div>

        {/* Status toggle */}
        <label className="inline-flex items-center gap-2 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
              aut.active
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-border/60 bg-foreground/5 text-muted-foreground"
            )}
          >
            {aut.active ? (
              <>
                <PlayCircle className="h-3 w-3" /> Activa
              </>
            ) : (
              <>
                <Pause className="h-3 w-3" /> Pausada
              </>
            )}
          </span>
          <Switch checked={aut.active} onCheckedChange={onToggle} aria-label={`Activar ${aut.name}`} />
        </label>
      </div>

      {/* Trigger + conditions + actions */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Trigger
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2 py-1 text-xs font-mono text-[var(--gold-soft)]">
            <Zap className="h-3 w-3" />
            {aut.trigger}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Condiciones
          </div>
          <ul className="mt-1.5 space-y-1">
            {aut.conditions.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/85">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--teal)]" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Acciones
          </div>
          <ol className="mt-1.5 space-y-1">
            {aut.actions.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/85">
                <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-foreground/5 font-mono text-[9px] text-muted-foreground">
                  {i + 1}
                </span>
                {a}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* History collapsible */}
      <Collapsible open={historyOpen} onOpenChange={setHistoryOpen} className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <CollapsibleTrigger asChild>
            <button
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-border/40 bg-foreground/[0.02] px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
            >
              <History className="h-3 w-3" />
              Ver historial
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", historyOpen && "rotate-180")}
              />
            </button>
          </CollapsibleTrigger>
          <Button
            size="sm"
            variant="ghost"
            onClick={onHistory}
            className="h-9 px-2.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
        </div>
        <CollapsibleContent className="mt-2">
          <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Últimas ejecuciones
            </div>
            <ul className="mt-2 space-y-1.5">
              {log.map((l, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                  <span className="font-mono text-foreground/85">{l.result}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{l.detail}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{formatRelative(l.at)}</span>
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.article>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function FloorIncidents() {
  const { toast } = useToast();
  const [incidents, setIncidents] = React.useState<FloorIncident[]>(INITIAL_INCIDENTS);
  const [sevFilter, setSevFilter] = React.useState<"all" | IncidentSeverity>("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "open" | "resolved">("all");
  const [detailInc, setDetailInc] = React.useState<FloorIncident | null>(null);
  const [resolveInc, setResolveInc] = React.useState<FloorIncident | null>(null);
  const [newOpen, setNewOpen] = React.useState(false);
  const [chatInput, setChatInput] = React.useState<Record<ChannelId, ChatMessage[]>>({
    sala: CHANNEL_MESSAGES.sala,
    cocina: CHANNEL_MESSAGES.cocina,
    barra: CHANNEL_MESSAGES.barra,
    direccion: CHANNEL_MESSAGES.direccion,
  });
  const [automations, setAutomations] = React.useState<Automation[]>(AUTOMATIONS);

  // Stats
  const stats = React.useMemo(() => {
    return {
      open: incidents.filter((i) => i.status === "open").length,
      investigating: incidents.filter((i) => i.status === "investigating").length,
      resolvedToday: incidents.filter(
        (i) => i.status === "resolved" || i.status === "closed"
      ).length,
      slaBreached: incidents.filter((i) => i.slaRemaining < 0).length,
    };
  }, [incidents]);

  // Filtered
  const visible = React.useMemo(() => {
    return incidents.filter((i) => {
      if (sevFilter !== "all" && i.severity !== sevFilter) return false;
      if (statusFilter === "open" && (i.status === "resolved" || i.status === "closed")) return false;
      if (statusFilter === "resolved" && i.status !== "resolved" && i.status !== "closed") return false;
      return true;
    });
  }, [incidents, sevFilter, statusFilter]);

  // Actions
  const handleCreate = (data: {
    type: IncidentType;
    severity: IncidentSeverity;
    title: string;
    description: string;
    tableId?: string;
    assignedTo?: string;
  }) => {
    const id = `INC-${String(incidents.length + 1).padStart(3, "0")}`;
    const newInc: FloorIncident = {
      id,
      type: data.type,
      severity: data.severity,
      status: "open",
      title: data.title,
      description: data.description,
      tableId: data.tableId,
      assignedTo: data.assignedTo,
      reportedBy: "Laura Pérez (Manager)",
      createdAt: new Date().toISOString(),
      slaMinutes: data.severity === "critical" ? 10 : data.severity === "high" ? 20 : 45,
      slaRemaining: data.severity === "critical" ? 10 : data.severity === "high" ? 20 : 45,
      comments: [],
      mentions: [],
    };
    setIncidents((prev) => [newInc, ...prev]);
    setNewOpen(false);
    toast({
      title: "Incidencia creada",
      description: `${id} · ${data.title}`,
    });
  };

  const handleAssign = (inc: FloorIncident) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === inc.id ? { ...i, assignedTo: "Laura Pérez (Manager)" } : i
      )
    );
    toast({
      title: "Incidencia asignada",
      description: `${inc.id} asignada a Laura Pérez.`,
    });
  };

  const handleResolveConfirm = (data: { cause: string; resolution: string }) => {
    if (!resolveInc) return;
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === resolveInc.id
          ? {
              ...i,
              status: "resolved",
              resolvedAt: new Date().toISOString(),
              cause: data.cause,
              resolution: data.resolution,
              comments: [
                ...i.comments,
                {
                  at: new Date().toISOString(),
                  by: "Laura Pérez (Manager)",
                  text: `Resuelta: ${data.resolution}`,
                },
              ],
            }
          : i
      )
    );
    toast({
      title: "Incidencia resuelta",
      description: `${resolveInc.id} cerrada con auditoría.`,
    });
    setResolveInc(null);
  };

  const handleSendChat = (channelId: ChannelId, text: string) => {
    const msg: ChatMessage = {
      id: `${channelId}-${Date.now()}`,
      sender: "Laura Pérez (Manager)",
      initials: "LP",
      text,
      at: new Date().toISOString(),
    };
    setChatInput((prev) => ({ ...prev, [channelId]: [...prev[channelId], msg] }));
  };

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
    const aut = automations.find((a) => a.id === id);
    toast({
      title: aut?.active ? "Automatización pausada" : "Automatización activada",
      description: `${id} · ${aut?.name}`,
    });
  };

  const SEV_FILTERS: { id: "all" | IncidentSeverity; label: string }[] = [
    { id: "all", label: "Todas" },
    { id: "critical", label: "Críticas" },
    { id: "high", label: "Altas" },
    { id: "medium", label: "Medias" },
    { id: "low", label: "Bajas" },
  ];

  const STATUS_FILTERS: { id: "all" | "open" | "resolved"; label: string }[] = [
    { id: "all", label: "Todas" },
    { id: "open", label: "Abiertas" },
    { id: "resolved", label: "Resueltas" },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <section aria-labelledby="floor-incidents-title" className="flex flex-col gap-5">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <AlertOctagon className="h-5 w-5" />
              </span>
              <h2
                id="floor-incidents-title"
                className="font-display text-xl sm:text-2xl font-medium tracking-tight"
              >
                Incidencias de sala
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono text-[10px] uppercase tracking-wider"
              >
                demo
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Centro unificado de incidencias con SLA, resolución y comunicación interna.
            </p>
          </div>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="incidents" className="gap-4">
          <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-foreground/[0.03] p-1">
            <TabsTrigger
              value="incidents"
              className="min-h-[40px] flex-1 data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)]"
            >
              <AlertTriangle className="h-4 w-4" />
              Incidencias
            </TabsTrigger>
            <TabsTrigger
              value="comm"
              className="min-h-[40px] flex-1 data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)]"
            >
              <MessageSquareWarning className="h-4 w-4" />
              Comunicación
            </TabsTrigger>
            <TabsTrigger
              value="automations"
              className="min-h-[40px] flex-1 data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)]"
            >
              <Bot className="h-4 w-4" />
              Automatizaciones
            </TabsTrigger>
          </TabsList>

          {/* ============ Incidents tab ============ */}
          <TabsContent value="incidents" className="flex flex-col gap-4 outline-none">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <StatPill
                label="Abiertas"
                value={stats.open}
                tone="rose"
                icon={Inbox}
              />
              <StatPill
                label="Investigando"
                value={stats.investigating}
                tone="amber"
                icon={Eye}
              />
              <StatPill
                label="Resueltas hoy"
                value={stats.resolvedToday}
                tone="emerald"
                icon={CheckCircle2}
              />
              <StatPill
                label="SLA incumplido"
                value={stats.slaBreached}
                tone="destructive"
                icon={AlertOctagon}
              />
            </div>

            {/* Filters + new */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <FilterDropdown
                  label="Severidad"
                  value={sevFilter}
                  options={SEV_FILTERS}
                  onChange={(v) => setSevFilter(v as "all" | IncidentSeverity)}
                />
                <FilterDropdown
                  label="Estado"
                  value={statusFilter}
                  options={STATUS_FILTERS}
                  onChange={(v) => setStatusFilter(v as "all" | "open" | "resolved")}
                />
              </div>
              <Button
                size="sm"
                onClick={() => setNewOpen(true)}
                className="h-10 bg-[var(--gold)] text-[#1a1205] hover:bg-[var(--gold-soft)]"
              >
                <Plus className="h-4 w-4" />
                Nueva incidencia
              </Button>
            </div>

            {/* List */}
            <div className="grid gap-2.5 lg:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {visible.map((inc, i) => (
                  <IncidentCard
                    key={inc.id}
                    inc={inc}
                    index={i}
                    onDetail={() => setDetailInc(inc)}
                    onAssign={() => handleAssign(inc)}
                    onResolve={() => setResolveInc(inc)}
                  />
                ))}
              </AnimatePresence>

              {visible.length === 0 && (
                <div className="rp-glass col-span-full rounded-xl p-8 text-center text-sm text-muted-foreground">
                  <Sparkles className="mx-auto mb-2 h-5 w-5 text-[var(--gold)]" />
                  No hay incidencias con estos filtros.
                </div>
              )}
            </div>
          </TabsContent>

          {/* ============ Communication tab ============ */}
          <TabsContent value="comm" className="flex flex-col gap-4 outline-none">
            <Tabs defaultValue="sala" className="gap-3">
              <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-foreground/[0.03] p-1">
                {CHANNELS.map((c) => {
                  const Icon = c.icon;
                  return (
                    <TabsTrigger
                      key={c.id}
                      value={c.id}
                      className="min-h-[40px] flex-1 data-[state=active]:bg-[var(--teal)]/10 data-[state=active]:text-[var(--teal)]"
                    >
                      <Icon className="h-4 w-4" />
                      {c.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {CHANNELS.map((c) => (
                <TabsContent key={c.id} value={c.id} className="outline-none">
                  <ChatChannel
                    channelId={c.id}
                    messages={chatInput[c.id]}
                    onSend={(text) => handleSendChat(c.id, text)}
                  />
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/40 bg-foreground/[0.02] p-3.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 rp-teal-text" />
              <p className="leading-relaxed">
                <span className="font-medium text-foreground/85">
                  La comunicación interna no sustituye el registro estructurado de incidencias.
                </span>{" "}
                Usa <span className="font-medium rp-gold-text">«Nueva incidencia»</span> para
                problemas formales que requieren SLA, asignación y pista de auditoría.
              </p>
            </div>
          </TabsContent>

          {/* ============ Automations tab ============ */}
          <TabsContent value="automations" className="flex flex-col gap-4 outline-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Flujos automáticos idempotentes, reintentables y auditables.
              </p>
              <Button
                size="sm"
                onClick={() =>
                  toast({
                    title: "Nueva automatización",
                    description: "Editor visual de automatizaciones (demo).",
                  })
                }
                className="h-10 bg-[var(--gold)] text-[#1a1205] hover:bg-[var(--gold-soft)]"
              >
                <Plus className="h-4 w-4" />
                Nueva automatización
              </Button>
            </div>

            <div className="grid gap-2.5 lg:grid-cols-2">
              {automations.map((a, i) => (
                <AutomationCard
                  key={a.id}
                  aut={a}
                  index={i}
                  onToggle={() => toggleAutomation(a.id)}
                  onHistory={() =>
                    toast({
                      title: "Editor de automatización",
                      description: `${a.id} · ${a.name} (demo).`,
                    })
                  }
                />
              ))}
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.04] p-3.5 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 rp-teal-text" />
              <p className="leading-relaxed">
                <span className="font-medium text-foreground/85">
                  Las automatizaciones son idempotentes, reintentables y auditables.
                </span>{" "}
                Pueden pausarse en cualquier momento sin afectar a los datos en curso.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Dialogs */}
      <IncidentDetailDialog inc={detailInc} onClose={() => setDetailInc(null)} />
      <ResolveDialog
        inc={resolveInc}
        onClose={() => setResolveInc(null)}
        onConfirm={handleResolveConfirm}
      />
      <NewIncidentDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSubmit={handleCreate}
      />
    </TooltipProvider>
  );
}

/* =========================================================
 * Stat pill
 * =======================================================*/
function StatPill({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "rose" | "amber" | "emerald" | "destructive";
  icon: React.ElementType;
}) {
  const tones: Record<string, string> = {
    rose: "text-rose-300 border-rose-400/30 bg-rose-400/[0.06]",
    amber: "text-amber-300 border-amber-400/30 bg-amber-400/[0.06]",
    emerald: "text-emerald-300 border-emerald-400/30 bg-emerald-400/[0.06]",
    destructive: "text-destructive border-destructive/40 bg-destructive/[0.06]",
  };
  return (
    <div className={cn("rp-glass rounded-xl p-3.5", tones[tone])}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 opacity-80" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-1.5 font-display text-2xl font-light tabular-nums sm:text-3xl">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
 * Filter dropdown
 * =======================================================*/
function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[130px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
