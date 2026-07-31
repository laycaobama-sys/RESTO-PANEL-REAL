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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Users,
  UserCog,
  Coffee,
  Activity,
  Star,
  Clock,
  Euro,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Info,
  BrainCircuit,
  Sparkles,
  MapPin,
  Armchair,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  BarChart3,
  Pause,
  Play,
  ArrowRightLeft,
  Eye,
  Timer,
  Receipt,
  Award,
  CircleDot,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type StaffStatus = "active" | "break" | "off" | "training";

interface FloorStaffMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  zone: string;
  tablesAssigned: string[];
  openOrders: number;
  avgServiceTime: number;
  avgTicket: number;
  rating: number;
  totalSales: number;
  status: StaffStatus;
  loadScore: number;
  loadFactors: { factor: string; value: string; weight: number }[];
}

interface ZoneSummary {
  zone: string;
  staffCount: number;
  tablesAssigned: number;
  avgLoad: number;
  capacity: number;
  demand: number;
  color: string;
}

/* =========================================================
 * Status meta
 * =======================================================*/
const STATUS_META: Record<
  StaffStatus,
  { label: string; dot: string; text: string; border: string; bg: string }
> = {
  active: {
    label: "En servicio",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    border: "border-emerald-400/40",
    bg: "bg-emerald-400/10",
  },
  break: {
    label: "En pausa",
    dot: "bg-amber-400",
    text: "text-amber-300",
    border: "border-amber-400/40",
    bg: "bg-amber-400/10",
  },
  off: {
    label: "Fuera",
    dot: "bg-zinc-500",
    text: "text-zinc-400",
    border: "border-zinc-500/40",
    bg: "bg-zinc-500/10",
  },
  training: {
    label: "Formación",
    dot: "bg-[var(--teal)]",
    text: "rp-teal-text",
    border: "border-[var(--teal)]/40",
    bg: "bg-[var(--teal)]/10",
  },
};

/* =========================================================
 * Zone meta
 * =======================================================*/
const ZONE_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; text: string }
> = {
  Sala: {
    label: "Sala",
    color: "var(--gold)",
    bg: "bg-[var(--gold)]/10",
    border: "border-[var(--gold)]/40",
    text: "text-[var(--gold-soft)]",
  },
  Terraza: {
    label: "Terraza",
    color: "var(--teal)",
    bg: "bg-[var(--teal)]/10",
    border: "border-[var(--teal)]/40",
    text: "rp-teal-text",
  },
  VIP: {
    label: "VIP",
    color: "#C084FC",
    bg: "bg-purple-400/10",
    border: "border-purple-400/40",
    text: "text-purple-300",
  },
  Barra: {
    label: "Barra",
    color: "#F59E0B",
    bg: "bg-amber-400/10",
    border: "border-amber-400/40",
    text: "text-amber-300",
  },
  Todas: {
    label: "Todas",
    color: "var(--gold)",
    bg: "bg-foreground/[0.06]",
    border: "border-border/50",
    text: "text-muted-foreground",
  },
};

/* =========================================================
 * Demo data — staff
 * =======================================================*/
const DEMO_STAFF: FloorStaffMember[] = [
  {
    id: "S1",
    name: "Carlos Mendoza",
    role: "Camarero",
    zone: "Terraza",
    tablesAssigned: ["M3", "M7", "M12", "T2"],
    openOrders: 3,
    avgServiceTime: 88,
    avgTicket: 42,
    rating: 4.6,
    totalSales: 420,
    status: "active",
    loadScore: 85,
    loadFactors: [
      { factor: "Mesas asignadas", value: "4", weight: 30 },
      { factor: "Personas totales", value: "18", weight: 25 },
      { factor: "Pedidos abiertos", value: "3", weight: 20 },
      { factor: "Complejidad servicio", value: "Alta", weight: 15 },
      { factor: "Incidencias", value: "1", weight: 10 },
    ],
  },
  {
    id: "S2",
    name: "María García",
    role: "Camarero",
    zone: "Sala",
    tablesAssigned: ["M1", "M5", "M9"],
    openOrders: 2,
    avgServiceTime: 76,
    avgTicket: 38,
    rating: 4.8,
    totalSales: 280,
    status: "active",
    loadScore: 45,
    loadFactors: [
      { factor: "Mesas asignadas", value: "3", weight: 30 },
      { factor: "Personas totales", value: "11", weight: 25 },
      { factor: "Pedidos abiertos", value: "2", weight: 20 },
      { factor: "Complejidad servicio", value: "Media", weight: 15 },
      { factor: "Incidencias", value: "0", weight: 10 },
    ],
  },
  {
    id: "S3",
    name: "Juan Ruiz",
    role: "Camarero",
    zone: "VIP",
    tablesAssigned: ["V1", "V2"],
    openOrders: 1,
    avgServiceTime: 102,
    avgTicket: 96,
    rating: 4.2,
    totalSales: 640,
    status: "active",
    loadScore: 52,
    loadFactors: [
      { factor: "Mesas asignadas", value: "2", weight: 30 },
      { factor: "Personas totales", value: "8", weight: 25 },
      { factor: "Pedidos abiertos", value: "1", weight: 20 },
      { factor: "Complejidad servicio", value: "Alta (VIP)", weight: 15 },
      { factor: "Incidencias", value: "0", weight: 10 },
    ],
  },
  {
    id: "S4",
    name: "Laura Torres",
    role: "Maître",
    zone: "Sala",
    tablesAssigned: [],
    openOrders: 0,
    avgServiceTime: 0,
    avgTicket: 0,
    rating: 4.9,
    totalSales: 0,
    status: "active",
    loadScore: 30,
    loadFactors: [
      { factor: "Mesas asignadas", value: "0 (supervisión)", weight: 30 },
      { factor: "Personas totales", value: "0", weight: 25 },
      { factor: "Pedidos abiertos", value: "0", weight: 20 },
      { factor: "Complejidad servicio", value: "Supervisión", weight: 15 },
      { factor: "Incidencias", value: "0", weight: 10 },
    ],
  },
  {
    id: "S5",
    name: "Pedro Sánchez",
    role: "Runner",
    zone: "Todas",
    tablesAssigned: [],
    openOrders: 5,
    avgServiceTime: 0,
    avgTicket: 0,
    rating: 4.0,
    totalSales: 0,
    status: "active",
    loadScore: 68,
    loadFactors: [
      { factor: "Mesas asignadas", value: "0 (runner)", weight: 30 },
      { factor: "Personas totales", value: "0", weight: 25 },
      { factor: "Pedidos abiertos", value: "5", weight: 20 },
      { factor: "Complejidad servicio", value: "Media (logística)", weight: 15 },
      { factor: "Incidencias", value: "1", weight: 10 },
    ],
  },
  {
    id: "S6",
    name: "Ana López",
    role: "Camarero",
    zone: "Barra",
    tablesAssigned: ["B1", "B3", "B5"],
    openOrders: 2,
    avgServiceTime: 64,
    avgTicket: 22,
    rating: 4.5,
    totalSales: 190,
    status: "break",
    loadScore: 58,
    loadFactors: [
      { factor: "Mesas asignadas", value: "3", weight: 30 },
      { factor: "Personas totales", value: "9", weight: 25 },
      { factor: "Pedidos abiertos", value: "2", weight: 20 },
      { factor: "Complejidad servicio", value: "Baja (barra)", weight: 15 },
      { factor: "Incidencias", value: "0", weight: 10 },
    ],
  },
];

/* =========================================================
 * Zone summaries
 * =======================================================*/
const ZONE_SUMMARIES: ZoneSummary[] = [
  {
    zone: "Sala",
    staffCount: 2,
    tablesAssigned: 9,
    avgLoad: 42,
    capacity: 36,
    demand: 30,
    color: "var(--gold)",
  },
  {
    zone: "Terraza",
    staffCount: 1,
    tablesAssigned: 8,
    avgLoad: 85,
    capacity: 32,
    demand: 38,
    color: "var(--teal)",
  },
  {
    zone: "VIP",
    staffCount: 1,
    tablesAssigned: 2,
    avgLoad: 52,
    capacity: 12,
    demand: 8,
    color: "#C084FC",
  },
  {
    zone: "Barra",
    staffCount: 1,
    tablesAssigned: 3,
    avgLoad: 58,
    capacity: 12,
    demand: 8,
    color: "#F59E0B",
  },
];

/* =========================================================
 * AI reassignment suggestions
 * =======================================================*/
interface ReassignSuggestion {
  id: string;
  fromStaff: string;
  toStaff: string;
  table: string;
  reason: string;
  fromLoad: number;
  toLoad: number;
  projectedFromLoad: number;
  projectedToLoad: number;
}

const SUGGESTIONS: ReassignSuggestion[] = [
  {
    id: "R1",
    fromStaff: "Carlos Mendoza",
    toStaff: "María García",
    table: "M12",
    reason:
      "Carlos tiene 85% de carga. María tiene 45%. Reasignar M12 equilibra el servicio en Terraza/Sala.",
    fromLoad: 85,
    toLoad: 45,
    projectedFromLoad: 68,
    projectedToLoad: 62,
  },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function loadColor(score: number) {
  if (score >= 75) return { text: "text-destructive", bg: "bg-destructive", ring: "ring-destructive/40" };
  if (score >= 50) return { text: "rp-gold-text", bg: "bg-[var(--gold)]", ring: "ring-[var(--gold)]/40" };
  return { text: "text-emerald-300", bg: "bg-emerald-400", ring: "ring-emerald-400/40" };
}

function loadLabel(score: number) {
  if (score >= 75) return "Alta";
  if (score >= 50) return "Media";
  return "Baja";
}

function initials(name: string) {
  const parts = name.split(" ");
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

function avatarGradient(name: string) {
  const grads = [
    "from-amber-400/80 to-[var(--gold-deep)]",
    "from-[var(--teal)]/80 to-[var(--teal-deep)]",
    "from-purple-400/80 to-purple-700",
    "from-rose-400/80 to-rose-700",
    "from-sky-400/80 to-sky-700",
    "from-emerald-400/80 to-emerald-700",
  ];
  const idx = name.charCodeAt(0) % grads.length;
  return grads[idx];
}

/* =========================================================
 * Circular load meter
 * =======================================================*/
function LoadMeter({
  score,
  size = 92,
  reduce,
}: {
  score: number;
  size?: number;
  reduce: boolean;
}) {
  const stroke = 7;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const lc = loadColor(score);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-foreground/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={lc.text}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display text-2xl font-light tabular-nums", lc.text)}>
          {score}
          <span className="text-xs text-muted-foreground">%</span>
        </span>
        <span className="mt-0.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
          {loadLabel(score)}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
 * Stars rating
 * =======================================================*/
function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
      <span className="font-mono text-xs tabular-nums text-foreground">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

/* =========================================================
 * Staff card
 * =======================================================*/
function StaffCard({
  member,
  index,
  onDetail,
  onToggleStatus,
  onReassign,
}: {
  member: FloorStaffMember;
  index: number;
  onDetail: () => void;
  onToggleStatus: () => void;
  onReassign: (zone: string) => void;
}) {
  const reduce = useReducedMotion();
  const [factorsOpen, setFactorsOpen] = React.useState(false);
  const status = STATUS_META[member.status];
  const zone = ZONE_META[member.zone] ?? ZONE_META.Todas;
  const lc = loadColor(member.loadScore);

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: reduce ? 0 : index * 0.05 }}
      className={cn(
        "rp-glass flex flex-col rounded-2xl p-4 sm:p-5",
        member.loadScore >= 75 && "rp-glow-gold ring-1 ring-destructive/30",
        member.loadScore >= 50 && member.loadScore < 75 && "ring-1 ring-[var(--gold)]/30",
      )}
    >
      {/* Top: avatar + name + role + status */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br font-display text-lg font-medium text-[#0a0a0a]",
            avatarGradient(member.name),
          )}
          aria-label={`Avatar de ${member.name}`}
        >
          {initials(member.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">
                {member.name}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  <UserCog className="h-2.5 w-2.5" />
                  {member.role}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                    zone.border,
                    zone.bg,
                    zone.text,
                  )}
                >
                  <MapPin className="h-2.5 w-2.5" />
                  {zone.label}
                </span>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                    status.border,
                    status.bg,
                    status.text,
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", status.dot, member.status === "active" && "animate-pulse")} />
                  {status.label}
                </span>
              </TooltipTrigger>
              <TooltipContent>Estado actual del empleado</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Load meter + quick metrics */}
      <div className="mt-4 flex items-center gap-4">
        <LoadMeter score={member.loadScore} reduce={reduce} />
        <div className="flex-1 space-y-1.5">
          <MetricLine
            icon={Timer}
            label="T. servicio"
            value={member.avgServiceTime > 0 ? `${member.avgServiceTime}min` : "—"}
          />
          <MetricLine
            icon={Receipt}
            label="Ticket medio"
            value={member.avgTicket > 0 ? `€${member.avgTicket}` : "—"}
          />
          <MetricLine
            icon={Euro}
            label="Ventas hoy"
            value={member.totalSales > 0 ? `€${member.totalSales}` : "—"}
          />
          <MetricLine
            icon={Activity}
            label="Pedidos abiertos"
            value={`${member.openOrders}`}
          />
        </div>
      </div>

      {/* Rating */}
      <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
        <Stars rating={member.rating} />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Valoración
        </span>
      </div>

      {/* Tables assigned chips */}
      <div className="mt-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Mesas asignadas
        </div>
        {member.tablesAssigned.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {member.tablesAssigned.map((t) => (
              <span
                key={t}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-mono",
                  zone.border,
                  zone.bg,
                  zone.text,
                )}
              >
                <Armchair className="h-2.5 w-2.5" />
                {t}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-1.5 text-xs text-muted-foreground">
            {member.role === "Maître"
              ? "Supervisión general"
              : member.role === "Runner"
              ? "Atención logística (todas las mesas)"
              : "Sin asignación"}
          </div>
        )}
      </div>

      {/* Load factors collapsible */}
      <Collapsible open={factorsOpen} onOpenChange={setFactorsOpen} className="mt-3">
        <CollapsibleTrigger asChild>
          <button
            className="flex w-full items-center justify-between rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2 text-left transition-colors hover:bg-foreground/[0.05] min-h-11"
            aria-expanded={factorsOpen}
          >
            <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <Layers className="h-3 w-3" />
              Desglose de carga
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform",
                factorsOpen && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <AnimatePresence initial={false}>
            {factorsOpen && (
              <motion.div
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduce ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-2 overflow-hidden"
              >
                {member.loadFactors.map((f, i) => (
                  <div
                    key={i}
                    className="rp-glass flex items-center justify-between gap-2 rounded-lg px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs text-foreground">{f.factor}</div>
                      <div className="mt-0.5 text-[10px] font-mono text-muted-foreground">
                        Peso {f.weight}%
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-foreground">
                      {f.value}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 min-h-11 px-3 text-xs">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Reasignar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Cambiar zona
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(ZONE_META).map(([key, z]) => (
              <DropdownMenuItem
                key={key}
                onSelect={() => onReassign(key)}
                disabled={key === member.zone}
                className="gap-2 text-xs"
              >
                <span className={cn("h-2 w-2 rounded-full")} style={{ background: z.color }} />
                {z.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="h-10 min-h-11 px-3 text-xs"
          onClick={onToggleStatus}
        >
          {member.status === "active" ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              Pausa
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Activar
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-10 min-h-11 px-3 text-xs"
          onClick={onDetail}
        >
          <Eye className="h-3.5 w-3.5" />
          Detalle
        </Button>
      </div>
    </motion.article>
  );
}

/* =========================================================
 * Metric line
 * =======================================================*/
function MetricLine({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <span className="font-mono tabular-nums text-foreground">{value}</span>
    </div>
  );
}

/* =========================================================
 * Zone summary card
 * =======================================================*/
function ZoneCard({ zone, index }: { zone: ZoneSummary; index: number }) {
  const reduce = useReducedMotion();
  const meta = ZONE_META[zone.zone] ?? ZONE_META.Todas;
  const loadCls = loadColor(zone.avgLoad);
  const utilization = Math.round((zone.demand / zone.capacity) * 100);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: reduce ? 0 : index * 0.04 }}
      className="rp-glass rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider",
            meta.border,
            meta.bg,
            meta.text,
          )}
        >
          <MapPin className="h-3 w-3" />
          {meta.label}
        </span>
        <span className={cn("text-[10px] font-mono uppercase tracking-wider", loadCls.text)}>
          Carga {zone.avgLoad}%
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="Personal" value={`${zone.staffCount}`} icon={Users} />
        <Stat label="Mesas" value={`${zone.tablesAssigned}`} icon={Armchair} />
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <span>Demanda vs capacidad</span>
          <span className="tabular-nums">{utilization}%</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
          <motion.div
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${utilization}%` }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.1 + index * 0.04, ease: "easeOut" }}
            className={cn("h-full rounded-full", loadCls.bg)}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>Demanda {zone.demand} pax</span>
          <span>Cap. {zone.capacity} pax</span>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-foreground/[0.03] px-2.5 py-1.5">
      <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </div>
      <div className="mt-0.5 font-display text-lg font-light tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
 * AI suggestion card
 * =======================================================*/
function SuggestionCard({
  suggestion,
  onApply,
  onReject,
  reduce,
}: {
  suggestion: ReassignSuggestion;
  onApply: () => void;
  onReject: () => void;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rp-glass-strong rp-glow-gold rounded-2xl p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10">
            <BrainCircuit className="h-4 w-4 text-[var(--gold-soft)]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                Sugerencia IA
              </span>
              <Badge
                variant="outline"
                className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[9px] font-mono uppercase tracking-wider"
              >
                <Sparkles className="mr-1 h-2.5 w-2.5" />
                Reasignación
              </Badge>
            </div>
            <div className="mt-0.5 text-[10px] font-mono text-muted-foreground">
              glm-4-flash · confianza 87%
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground">
        <span className="font-medium">{suggestion.fromStaff}</span> tiene{" "}
        <span className="font-mono text-destructive">{suggestion.fromLoad}%</span> de carga.{" "}
        <span className="font-medium">{suggestion.toStaff}</span> tiene{" "}
        <span className="font-mono text-emerald-300">{suggestion.toLoad}%</span>. Considera
        reasignar la mesa{" "}
        <span className="inline-flex items-center gap-0.5 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-1.5 py-0.5 font-mono text-xs text-[var(--gold-soft)]">
          <Armchair className="h-2.5 w-2.5" />
          {suggestion.table}
        </span>{" "}
        de <span className="font-medium">{suggestion.fromStaff}</span> a{" "}
        <span className="font-medium">{suggestion.toStaff}</span>.
      </p>

      {/* Projection */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rp-glass rounded-lg p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {suggestion.fromStaff} (proyección)
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-mono text-sm text-destructive">{suggestion.fromLoad}%</span>
            <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-sm text-emerald-300">{suggestion.projectedFromLoad}%</span>
          </div>
        </div>
        <div className="rp-glass rounded-lg p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {suggestion.toStaff} (proyección)
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-mono text-sm text-emerald-300">{suggestion.toLoad}%</span>
            <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-sm text-amber-300">{suggestion.projectedToLoad}%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          className="h-10 min-h-11 bg-[var(--gold)] px-4 text-[#0a0a0a] hover:bg-[var(--gold-soft)]"
          onClick={onApply}
        >
          <CheckCircle2 className="h-4 w-4" />
          Aplicar reasignación
        </Button>
        <Button variant="ghost" size="sm" className="h-10 min-h-11 px-4" onClick={onReject}>
          <XCircle className="h-4 w-4" />
          Rechazar
        </Button>
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Staff detail dialog
 * =======================================================*/
function StaffDetailDialog({
  member,
  open,
  onOpenChange,
}: {
  member: FloorStaffMember | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const reduce = useReducedMotion();
  if (!member) return null;
  const status = STATUS_META[member.status];
  const zone = ZONE_META[member.zone] ?? ZONE_META.Todas;
  const lc = loadColor(member.loadScore);

  // Synthetic history
  const history = [
    { service: "Comida · 12:30", tables: 4, sales: 320, rating: 4.7, incidents: 0 },
    { service: "Cena · 20:30", tables: 5, sales: 480, rating: 4.5, incidents: 1 },
    { service: "Comida · 12:30 (ayer)", tables: 4, sales: 290, rating: 4.8, incidents: 0 },
    { service: "Cena · 20:30 (ayer)", tables: 5, sales: 510, rating: 4.4, incidents: 0 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br font-display text-base font-medium text-[#0a0a0a]",
                avatarGradient(member.name),
              )}
            >
              {initials(member.name)}
            </div>
            <div>
              <div>{member.name}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs font-normal text-muted-foreground">
                <span>{member.role}</span>
                <span>·</span>
                <span className={zone.text}>{zone.label}</span>
                <span>·</span>
                <span className={status.text}>{status.label}</span>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalle completo del empleado {member.name}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto rp-scroll-thin pr-1">
          {/* Load + metrics summary */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <LoadMeter score={member.loadScore} size={120} reduce={reduce} />
            <div className="grid flex-1 grid-cols-2 gap-2">
              <DetailStat label="T. servicio medio" value={member.avgServiceTime > 0 ? `${member.avgServiceTime}min` : "—"} icon={Timer} />
              <DetailStat label="Ticket medio" value={member.avgTicket > 0 ? `€${member.avgTicket}` : "—"} icon={Receipt} />
              <DetailStat label="Pedidos abiertos" value={`${member.openOrders}`} icon={Activity} />
              <DetailStat label="Ventas hoy" value={member.totalSales > 0 ? `€${member.totalSales}` : "—"} icon={Euro} />
              <DetailStat label="Valoración" value={`${member.rating.toFixed(1)} / 5`} icon={Star} />
              <DetailStat label="Mesas activas" value={`${member.tablesAssigned.length}`} icon={Armchair} />
            </div>
          </div>

          {/* Load factors */}
          <div className="mt-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Factores de carga (con pesos)
            </div>
            <div className="mt-2 space-y-1.5">
              {member.loadFactors.map((f, i) => (
                <div key={i} className="rp-glass flex items-center gap-3 rounded-lg px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-foreground">{f.factor}</div>
                    <div className="mt-0.5 text-[10px] font-mono text-muted-foreground">
                      Peso {f.weight}%
                    </div>
                  </div>
                  <span className="font-mono text-sm tabular-nums text-foreground">{f.value}</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-foreground/[0.06]">
                    <div
                      className={cn("h-full rounded-full", lc.bg)}
                      style={{ width: `${f.weight}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent service history */}
          <div className="mt-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Historial reciente
            </div>
            <div className="mt-2 overflow-hidden rounded-xl border border-border/40">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-foreground/[0.04] text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 text-left">Servicio</th>
                    <th className="px-3 py-2 text-right">Mesas</th>
                    <th className="px-3 py-2 text-right">Ventas</th>
                    <th className="px-3 py-2 text-right">Rating</th>
                    <th className="px-3 py-2 text-right">Incid.</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-t border-border/30">
                      <td className="px-3 py-2 text-foreground">{h.service}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{h.tables}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">€{h.sales}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-2.5 w-2.5 fill-[var(--gold)] text-[var(--gold)]" />
                          {h.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {h.incidents > 0 ? (
                          <span className="text-destructive">{h.incidents}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rp-glass rounded-lg px-3 py-2">
      <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </div>
      <div className="mt-0.5 font-display text-base font-light tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
 * Summary bar
 * =======================================================*/
function SummaryBar({ staff }: { staff: FloorStaffMember[] }) {
  const reduce = useReducedMotion();
  const active = staff.filter((s) => s.status === "active").length;
  const onBreak = staff.filter((s) => s.status === "break").length;
  const tablesAssigned = staff.reduce((a, s) => a + s.tablesAssigned.length, 0);
  const avgLoad = Math.round(
    staff.filter((s) => s.role !== "Maître").reduce((a, s) => a + s.loadScore, 0) /
      Math.max(1, staff.filter((s) => s.role !== "Maître").length),
  );

  const items = [
    { label: "Camareros activos", value: `${active}`, icon: Users, accent: "text-emerald-300" },
    { label: "En pausa", value: `${onBreak}`, icon: Coffee, accent: "text-amber-300" },
    { label: "Mesas asignadas", value: `${tablesAssigned}`, icon: Armchair, accent: "rp-gold-text" },
    { label: "Carga media", value: `${avgLoad}%`, icon: BarChart3, accent: loadColor(avgLoad).text },
  ];

  return (
    <div className="rp-glass grid grid-cols-2 gap-2 rounded-2xl p-3 sm:grid-cols-4 sm:gap-3 sm:p-4">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div
            key={it.label}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: reduce ? 0 : i * 0.04 }}
            className="flex items-center gap-2.5 rounded-xl bg-foreground/[0.03] px-3 py-2"
          >
            <Icon className={cn("h-4 w-4 shrink-0", it.accent)} />
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">
                {it.label}
              </div>
              <div className={cn("font-display text-lg font-light tabular-nums sm:text-xl", it.accent)}>
                {it.value}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function FloorStaff() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [staff, setStaff] = React.useState<FloorStaffMember[]>(DEMO_STAFF);
  const [suggestions, setSuggestions] = React.useState<ReassignSuggestion[]>(SUGGESTIONS);
  const [loadExplainOpen, setLoadExplainOpen] = React.useState(false);
  const [detail, setDetail] = React.useState<FloorStaffMember | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const handleToggleStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "active" ? "break" : "active" }
          : s,
      ),
    );
    const m = staff.find((s) => s.id === id);
    toast({
      title: m?.status === "active" ? "Pausa iniciada" : "Vuelta al servicio",
      description: `${m?.name} · estado actualizado (demo)`,
    });
  };

  const handleReassign = (id: string, zone: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, zone } : s)),
    );
    const m = staff.find((s) => s.id === id);
    toast({
      title: "Zona reasignada",
      description: `${m?.name} ahora en ${zone} (demo)`,
    });
  };

  const handleDetail = (m: FloorStaffMember) => {
    setDetail(m);
    setDetailOpen(true);
  };

  const handleApplySuggestion = (id: string) => {
    const sg = suggestions.find((s) => s.id === id);
    if (!sg) return;
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    toast({
      title: "Reasignación aplicada",
      description: `${sg.table}: ${sg.fromStaff} → ${sg.toStaff} (demo)`,
    });
  };

  const handleRejectSuggestion = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    toast({
      title: "Sugerencia rechazada",
      description: "La sugerencia IA se ha descartado (demo)",
    });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-labelledby="floor-staff-title" className="flex flex-col gap-5">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2
                id="floor-staff-title"
                className="font-display text-2xl font-light tracking-tight text-foreground sm:text-3xl"
              >
                Personal de sala
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] font-mono uppercase tracking-wider"
              >
                demo
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Gestión de personal con cálculo real de carga (no solo número de mesas).
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300">
              En servicio
            </span>
          </div>
        </header>

        {/* Summary bar */}
        <SummaryBar staff={staff} />

        {/* Staff grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((m, i) => (
            <StaffCard
              key={m.id}
              member={m}
              index={i}
              onDetail={() => handleDetail(m)}
              onToggleStatus={() => handleToggleStatus(m.id)}
              onReassign={(zone) => handleReassign(m.id, zone)}
            />
          ))}
        </div>

        {/* Load calculation explanation */}
        <Collapsible open={loadExplainOpen} onOpenChange={setLoadExplainOpen}>
          <div className="rp-glass rounded-2xl p-4 sm:p-5">
            <CollapsibleTrigger asChild>
              <button
                className="flex w-full items-center justify-between gap-2 text-left"
                aria-expanded={loadExplainOpen}
              >
                <span className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--teal)]/40 bg-[var(--teal)]/10">
                    <Info className="h-4 w-4 rp-teal-text" />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Cómo se calcula la carga
                  </span>
                </span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    loadExplainOpen && "rotate-90",
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <AnimatePresence initial={false}>
                {loadExplainOpen && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduce ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      La carga se calcula usando:{" "}
                      <span className="text-foreground">número de mesas (30%)</span>,{" "}
                      <span className="text-foreground">personas totales (25%)</span>,{" "}
                      <span className="text-foreground">pedidos abiertos (20%)</span>,{" "}
                      <span className="text-foreground">complejidad del servicio (15%)</span>,{" "}
                      <span className="text-foreground">incidencias activas (10%)</span>. No se
                      usa únicamente el número de mesas.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {[
                        { f: "Mesas", w: 30 },
                        { f: "Personas", w: 25 },
                        { f: "Pedidos", w: 20 },
                        { f: "Complejidad", w: 15 },
                        { f: "Incidencias", w: 10 },
                      ].map((x) => (
                        <div
                          key={x.f}
                          className="rp-glass rounded-lg px-3 py-2 text-center"
                        >
                          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            {x.f}
                          </div>
                          <div className="mt-0.5 font-display text-lg font-light tabular-nums rp-gold-text">
                            {x.w}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Zone load summary */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground sm:text-base">
              Carga por zona
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {ZONE_SUMMARIES.map((z, i) => (
              <ZoneCard key={z.zone} zone={z} index={i} />
            ))}
          </div>
        </div>

        {/* AI reassignment suggestions */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--gold-soft)]" />
            <h3 className="text-sm font-medium text-foreground sm:text-base">
              Sugerencias IA
            </h3>
            <Badge
              variant="outline"
              className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] font-mono uppercase tracking-wider"
            >
              {suggestions.length} activa{suggestions.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          {suggestions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {suggestions.map((sg) => (
                  <motion.div
                    key={sg.id}
                    layout
                    initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SuggestionCard
                      suggestion={sg}
                      reduce={reduce}
                      onApply={() => handleApplySuggestion(sg.id)}
                      onReject={() => handleRejectSuggestion(sg.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="rp-glass rounded-2xl p-6 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" />
              <p className="mt-2 text-sm text-muted-foreground">
                Sin sugerencias pendientes. La carga está equilibrada.
              </p>
            </div>
          )}
        </div>

        {/* Staff detail dialog */}
        <StaffDetailDialog
          member={detail}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </section>
    </TooltipProvider>
  );
}
