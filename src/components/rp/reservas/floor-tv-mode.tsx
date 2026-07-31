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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Armchair,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Info,
  Maximize2,
  Minimize2,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Timer,
  Utensils,
  Users,
  Wifi,
  WifiOff,
  XCircle,
  Layers,
  Ban,
  Sparkles,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
interface TableStateBlock {
  label: string;
  count: number;
  dotClass: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  icon: React.ElementType;
}

interface UpcomingArrival {
  id: string;
  time: string;
  partySize: number;
  zone: string;
}

interface CriticalAlert {
  id: string;
  tableLabel: string;
  message: string;
  minutesLate: number;
}

interface ZoneLoadBar {
  zone: string;
  loadPct: number;
  state: "IDLE" | "OPTIMAL" | "HEAVY" | "OVERLOADED";
  filledBlocks: number;
}

interface ServiceKPI {
  label: string;
  value: string;
  icon: React.ElementType;
}

type TVTheme = "dark" | "light" | "high-contrast";
type TVFontSize = "normal" | "large" | "xl";
type TVRefreshInterval = 5 | 10 | 30;

/* =========================================================
 * Demo data — GDPR-sanitized (NO PII)
 * =======================================================*/
const DEMO_OCCUPANCY_PCT = 78;

const DEMO_TABLE_STATES: TableStateBlock[] = [
  {
    label: "Disponibles",
    count: 4,
    dotClass: "bg-emerald-400",
    bgClass: "bg-emerald-400/15",
    borderClass: "border-emerald-400/40",
    textClass: "text-emerald-300",
    icon: CheckCircle2,
  },
  {
    label: "Reservadas",
    count: 3,
    dotClass: "bg-amber-400",
    bgClass: "bg-amber-400/15",
    borderClass: "border-amber-400/40",
    textClass: "text-amber-300",
    icon: Bell,
  },
  {
    label: "Sentadas",
    count: 12,
    dotClass: "bg-sky-400",
    bgClass: "bg-sky-400/15",
    borderClass: "border-sky-400/40",
    textClass: "text-sky-300",
    icon: Users,
  },
  {
    label: "Comiendo",
    count: 8,
    dotClass: "bg-[var(--teal)]",
    bgClass: "bg-[var(--teal)]/15",
    borderClass: "border-[var(--teal)]/40",
    textClass: "rp-teal-text",
    icon: Utensils,
  },
  {
    label: "No-show",
    count: 1,
    dotClass: "bg-red-400",
    bgClass: "bg-red-400/15",
    borderClass: "border-red-400/40",
    textClass: "text-red-300",
    icon: XCircle,
  },
  {
    label: "Bloqueadas",
    count: 2,
    dotClass: "bg-zinc-500",
    bgClass: "bg-zinc-500/15",
    borderClass: "border-zinc-500/40",
    textClass: "text-zinc-400",
    icon: Ban,
  },
];

const DEMO_WAITLIST = {
  groups: 7,
  etaMinutes: 18,
};

const DEMO_UPCOMING: UpcomingArrival[] = [
  { id: "UA1", time: "21:30", partySize: 4, zone: "Terraza" },
  { id: "UA2", time: "21:45", partySize: 2, zone: "Sala" },
  { id: "UA3", time: "22:00", partySize: 6, zone: "VIP" },
  { id: "UA4", time: "22:15", partySize: 3, zone: "Terraza" },
];

const DEMO_ALERTS: CriticalAlert[] = [
  {
    id: "CA1",
    tableLabel: "MESA 14",
    message: "Retraso cocina",
    minutesLate: 18,
  },
  {
    id: "CA2",
    tableLabel: "MESA 8",
    message: "Limpieza pendiente",
    minutesLate: 10,
  },
];

const DEMO_ZONE_LOAD: ZoneLoadBar[] = [
  { zone: "Terraza", loadPct: 85, state: "OVERLOADED", filledBlocks: 8 },
  { zone: "Sala", loadPct: 45, state: "OPTIMAL", filledBlocks: 4 },
  { zone: "VIP", loadPct: 30, state: "IDLE", filledBlocks: 3 },
  { zone: "Barra", loadPct: 58, state: "OPTIMAL", filledBlocks: 6 },
];

const DEMO_KPIS: ServiceKPI[] = [
  { label: "Reservas hoy", value: "47", icon: Calendar },
  { label: "Completadas", value: "38", icon: CheckCircle2 },
  { label: "En curso", value: "9", icon: Utensils },
  { label: "Tiempo medio", value: "92min", icon: Timer },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function occupancyColor(pct: number): string {
  if (pct < 60) return "text-emerald-300";
  if (pct <= 80) return "rp-gold-text";
  return "text-red-300";
}

function occupancyBg(pct: number): string {
  if (pct < 60) return "from-emerald-500/20 to-emerald-500/5";
  if (pct <= 80) return "from-[var(--gold)]/20 to-[var(--gold)]/5";
  return "from-red-500/20 to-red-500/5";
}

function zoneStateMeta(state: ZoneLoadBar["state"]) {
  switch (state) {
    case "IDLE":
      return { text: "text-emerald-300", bar: "bg-emerald-400" };
    case "OPTIMAL":
      return { text: "rp-teal-text", bar: "bg-[var(--teal)]" };
    case "HEAVY":
      return { text: "rp-gold-text", bar: "bg-[var(--gold)]" };
    case "OVERLOADED":
      return { text: "text-red-300", bar: "bg-red-400" };
  }
}

function fontScaleClass(size: TVFontSize): {
  clock: string;
  occupancy: string;
  block: string;
  kpi: string;
} {
  switch (size) {
    case "normal":
      return {
        clock: "text-3xl sm:text-4xl",
        occupancy: "text-5xl sm:text-7xl",
        block: "text-3xl sm:text-4xl",
        kpi: "text-2xl sm:text-3xl",
      };
    case "large":
      return {
        clock: "text-4xl sm:text-5xl",
        occupancy: "text-6xl sm:text-8xl",
        block: "text-4xl sm:text-5xl",
        kpi: "text-3xl sm:text-4xl",
      };
    case "xl":
      return {
        clock: "text-5xl sm:text-6xl",
        occupancy: "text-7xl sm:text-9xl",
        block: "text-5xl sm:text-6xl",
        kpi: "text-4xl sm:text-5xl",
      };
  }
}

function themeClass(theme: TVTheme): string {
  switch (theme) {
    case "dark":
      return "bg-background text-foreground";
    case "light":
      return "bg-zinc-100 text-zinc-900";
    case "high-contrast":
      return "bg-black text-white";
  }
}

/* =========================================================
 * Live clock
 * =======================================================*/
function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now
    ? now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "--:--:--";
  return (
    <span
      className={cn(
        "font-display font-light tabular-nums tracking-tight",
        className,
      )}
      suppressHydrationWarning
    >
      {time}
    </span>
  );
}

/* =========================================================
 * Connection indicator
 * =======================================================*/
function ConnectionIndicator({ online }: { online: boolean }) {
  if (online) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="font-mono text-xs uppercase tracking-wider text-emerald-300">
          EN DIRECTO
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-1.5">
      <WifiOff className="h-3.5 w-3.5 text-red-300" />
      <span className="font-mono text-xs uppercase tracking-wider text-red-300">
        SIN CONEXIÓN
      </span>
    </div>
  );
}

/* =========================================================
 * Occupancy indicator
 * =======================================================*/
function OccupancyIndicator({
  pct,
  fontClasses,
}: {
  pct: number;
  fontClasses: { occupancy: string };
}) {
  const reduce = useReducedMotion();
  const color = occupancyColor(pct);
  return (
    <div
      className={cn(
        "rp-glass rounded-2xl bg-gradient-to-br p-6 sm:p-8",
        occupancyBg(pct),
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        <Eye className="h-3 w-3" />
        Ocupación global
      </div>
      <div
        className={cn(
          "mt-2 font-display font-light tabular-nums tracking-tight",
          color,
          fontClasses.occupancy,
        )}
      >
        {pct}
        <span className="text-3xl sm:text-4xl">%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/10">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", color.replace("text-", "bg-"))}
          style={{
            backgroundColor:
              pct < 60
                ? "#34d399"
                : pct <= 80
                  ? "var(--gold)"
                  : "#f87171",
          }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>0%</span>
        <span className={color}>
          {pct < 60 ? "Confortable" : pct <= 80 ? "Alto" : "Saturado"}
        </span>
        <span>100%</span>
      </div>
    </div>
  );
}

/* =========================================================
 * Table state block
 * =======================================================*/
function TableStateBig({
  block,
  fontClasses,
}: {
  block: TableStateBlock;
  fontClasses: { block: string };
}) {
  const Icon = block.icon;
  return (
    <div
      className={cn(
        "rp-glass rounded-xl border p-4 sm:p-5",
        block.borderClass,
        block.bgClass,
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider",
            block.textClass,
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", block.dotClass)} />
          {block.label}
        </span>
        <Icon className={cn("h-4 w-4", block.textClass)} />
      </div>
      <div
        className={cn(
          "mt-2 font-display font-light tabular-nums",
          block.textClass,
          fontClasses.block,
        )}
      >
        {block.count}
      </div>
    </div>
  );
}

/* =========================================================
 * Waitlist panel
 * =======================================================*/
function WaitlistPanel() {
  const reduce = useReducedMotion();
  return (
    <div className="rp-glass rounded-2xl border-l-2 border-amber-400/60 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <motion.span
          animate={reduce ? undefined : { opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="h-2.5 w-2.5 rounded-full bg-amber-400"
        />
        <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
          Lista de espera
        </span>
      </div>
      <div className="mt-2 font-display text-3xl font-light tabular-nums text-amber-300 sm:text-4xl">
        {DEMO_WAITLIST.groups}
        <span className="ml-2 text-base text-muted-foreground">grupos</span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        ~{DEMO_WAITLIST.etaMinutes}min tiempo medio de espera
      </div>
    </div>
  );
}

/* =========================================================
 * Upcoming arrivals
 * =======================================================*/
function UpcomingArrivals({ arrivals }: { arrivals: UpcomingArrival[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">
          Llegadas próximas (30 min)
        </h3>
        <Badge
          variant="outline"
          className="border-border/40 bg-foreground/[0.04] text-muted-foreground text-[10px] font-mono uppercase tracking-wider"
        >
          {arrivals.length} previstas
        </Badge>
      </div>
      <div className="mt-3 space-y-1.5">
        {arrivals.map((a, i) => (
          <motion.div
            key={a.id}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: reduce ? 0 : i * 0.05 }}
            className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <span className="font-display text-xl font-light tabular-nums text-foreground sm:text-2xl">
                {a.time}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {a.partySize} pax
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/[0.08] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
              <Armchair className="h-2.5 w-2.5" />
              {a.zone}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-border/40 bg-foreground/[0.02] px-2.5 py-1.5 text-[10px] text-muted-foreground">
        <ShieldCheck className="mr-1 inline h-2.5 w-2.5 rp-teal-text" />
        Sin nombres ni identificadores — solo hora, comensales y zona.
      </div>
    </div>
  );
}

/* =========================================================
 * Critical alerts
 * =======================================================*/
function CriticalAlerts({ alerts }: { alerts: CriticalAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rp-glass rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <h3 className="text-sm font-medium text-foreground">
            Alertas críticas
          </h3>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Sin alertas activas — servicio en nominal.
        </p>
      </div>
    );
  }
  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-300" />
        <h3 className="text-sm font-medium text-foreground">
          Alertas críticas
        </h3>
        <Badge
          variant="outline"
          className="border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider"
        >
          {alerts.length} activas
        </Badge>
      </div>
      <div className="mt-3 space-y-2">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-2.5 rounded-lg border border-amber-400/40 bg-amber-400/[0.08] p-3"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-display text-base font-medium text-amber-300 sm:text-lg">
                  {a.tableLabel}
                </span>
                <span className="text-xs text-foreground/85">
                  {a.message}
                </span>
              </div>
              <div className="mt-0.5 font-mono text-[11px] tabular-nums text-amber-300">
                +{a.minutesLate}min
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
 * Zone load bars
 * =======================================================*/
function ZoneLoadBars({ zones }: { zones: ZoneLoadBar[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">
          Carga de personal por zona
        </h3>
        <Badge
          variant="outline"
          className="border-border/40 bg-foreground/[0.04] text-muted-foreground text-[10px] font-mono uppercase tracking-wider"
        >
          anonimizado
        </Badge>
      </div>
      <div className="mt-4 space-y-3">
        {zones.map((z, i) => {
          const meta = zoneStateMeta(z.state);
          return (
            <div key={z.zone}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground sm:text-sm">
                  {z.zone}
                </span>
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums",
                    meta.text,
                  )}
                >
                  {z.loadPct}% · {z.state}
                </span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <motion.div
                    key={idx}
                    initial={
                      reduce ? false : { opacity: 0, scaleY: 0.4 }
                    }
                    animate={{
                      opacity: 1,
                      scaleY: 1,
                      backgroundColor:
                        idx < z.filledBlocks
                          ? z.state === "OVERLOADED"
                            ? "#f87171"
                            : z.state === "HEAVY"
                              ? "var(--gold)"
                              : z.state === "OPTIMAL"
                                ? "var(--teal)"
                                : "#34d399"
                          : "rgba(255,255,255,0.08)",
                    }}
                    transition={{
                      duration: 0.3,
                      delay: reduce ? 0 : i * 0.05 + idx * 0.03,
                    }}
                    className="h-3 flex-1 rounded-sm origin-bottom"
                    style={{
                      backgroundColor:
                        idx < z.filledBlocks ? undefined : "rgba(255,255,255,0.08)",
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * KPIs panel
 * =======================================================*/
function ServiceKPIs({
  kpis,
  fontClasses,
}: {
  kpis: ServiceKPI[];
  fontClasses: { kpi: string };
}) {
  const reduce = useReducedMotion();
  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 rp-gold-text" />
        <h3 className="text-sm font-medium text-foreground">
          KPIs del servicio
        </h3>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.05 }}
              className="rounded-xl border border-border/40 bg-foreground/[0.03] p-3 sm:p-4"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <Icon className="h-3 w-3" />
                {k.label}
              </div>
              <div
                className={cn(
                  "mt-1.5 font-display font-light tabular-nums rp-gold-text",
                  fontClasses.kpi,
                )}
              >
                {k.value}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * TV settings panel (admin)
 * =======================================================*/
interface TVSettings {
  refreshInterval: TVRefreshInterval;
  fontScale: TVFontSize;
  theme: TVTheme;
  autoRotate: boolean;
  showWaitlist: boolean;
  showAlerts: boolean;
  showUpcoming: boolean;
  showZoneLoad: boolean;
  showKPIs: boolean;
}

function TVSettingsPanel({
  settings,
  onChange,
  onToggleFullscreen,
  isFullscreen,
}: {
  settings: TVSettings;
  onChange: <K extends keyof TVSettings>(
    key: K,
    value: TVSettings[K],
  ) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const reduce = useReducedMotion();

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rp-glass rounded-2xl p-4 sm:p-5">
        <CollapsibleTrigger asChild>
          <button
            className="flex w-full items-center justify-between gap-2 text-left min-h-11"
            aria-expanded={open}
          >
            <span className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10">
                <Settings2 className="h-4 w-4 rp-gold-text" />
              </span>
              <span className="text-sm font-medium text-foreground">
                Ajustes de pantalla TV (admin)
              </span>
            </span>
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-90",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduce ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Refresh interval */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      <RefreshCw className="mr-1 inline h-3 w-3" />
                      Intervalo auto-refresh
                    </Label>
                    <Select
                      value={String(settings.refreshInterval)}
                      onValueChange={(v) =>
                        onChange(
                          "refreshInterval",
                          Number(v) as TVRefreshInterval,
                        )
                      }
                    >
                      <SelectTrigger className="min-h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 segundos</SelectItem>
                        <SelectItem value="10">10 segundos</SelectItem>
                        <SelectItem value="30">30 segundos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font size */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      Tamaño de fuente
                    </Label>
                    <Select
                      value={settings.fontScale}
                      onValueChange={(v) =>
                        onChange("fontScale", v as TVFontSize)
                      }
                    >
                      <SelectTrigger className="min-h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                        <SelectItem value="xl">Muy grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Theme */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      Tema
                    </Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(v) => onChange("theme", v as TVTheme)}
                    >
                      <SelectTrigger className="min-h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="high-contrast">
                          Alto contraste
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <ToggleRow
                    label="Rotación automática"
                    description="Ciclar entre vistas cada 30s"
                    checked={settings.autoRotate}
                    onCheckedChange={(v) => onChange("autoRotate", v)}
                  />
                  <ToggleRow
                    label="Mostrar lista de espera"
                    description="Sección de grupos en espera"
                    checked={settings.showWaitlist}
                    onCheckedChange={(v) => onChange("showWaitlist", v)}
                  />
                  <ToggleRow
                    label="Mostrar alertas"
                    description="Alertas críticas activas"
                    checked={settings.showAlerts}
                    onCheckedChange={(v) => onChange("showAlerts", v)}
                  />
                  <ToggleRow
                    label="Mostrar llegadas próximas"
                    description="Próximos 30 min"
                    checked={settings.showUpcoming}
                    onCheckedChange={(v) => onChange("showUpcoming", v)}
                  />
                  <ToggleRow
                    label="Mostrar carga por zona"
                    description="Barras anonimizadas"
                    checked={settings.showZoneLoad}
                    onCheckedChange={(v) => onChange("showZoneLoad", v)}
                  />
                  <ToggleRow
                    label="Mostrar KPIs"
                    description="Reservas, completadas, tiempo medio"
                    checked={settings.showKPIs}
                    onCheckedChange={(v) => onChange("showKPIs", v)}
                  />
                </div>

                {/* Fullscreen button */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={onToggleFullscreen}
                    className="min-h-11 border border-[var(--gold)]/40 bg-[var(--gold)]/15 text-[var(--gold-soft)] hover:bg-[var(--gold)]/25 hover:text-[var(--gold-soft)]"
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="mr-2 h-4 w-4" />
                        Salir de pantalla completa
                      </>
                    ) : (
                      <>
                        <Maximize2 className="mr-2 h-4 w-4" />
                        Pantalla completa
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2">
      <div className="min-w-0">
        <div className="text-xs font-medium text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/* =========================================================
 * Sanitization log
 * =======================================================*/
function SanitizationLog() {
  const items = [
    { label: "Nombres", value: 0 },
    { label: "Teléfonos", value: 0 },
    { label: "Emails", value: 0 },
    { label: "IDs cliente", value: 0 },
  ];
  return (
    <div className="rp-glass rounded-2xl border-l-2 border-[var(--teal)]/50 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 rp-teal-text" />
        <h3 className="text-sm font-medium text-foreground">
          Log de sanitización GDPR
        </h3>
        <Badge
          variant="outline"
          className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] font-mono uppercase tracking-wider"
        >
          compliance
        </Badge>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Datos filtrados en esta vista. Solo datos operativos visibles — ninguna
        información personal identificable (PII) se renderiza en pantallas TV.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/[0.05] px-2.5 py-2 text-center"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {it.label}
            </div>
            <div className="mt-0.5 font-display text-lg font-light tabular-nums rp-teal-text">
              {it.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
 * GDPR notice
 * =======================================================*/
function GDPRNotice() {
  return (
    <div className="rp-glass rounded-2xl border-l-2 border-[var(--teal)]/60 p-4 sm:p-5">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 rp-teal-text" />
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider rp-teal-text">
            Aviso GDPR
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Esta vista está diseñada para pantallas en cocina, pasillos y áreas
            públicas. No muestra nombres, teléfonos, emails ni identificadores de
            clientes. Solo datos operativos.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function FloorTvMode() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [online] = React.useState(true);
  const [lastRefresh, setLastRefresh] = React.useState<string>("");

  const [settings, setSettings] = React.useState<TVSettings>({
    refreshInterval: 10,
    fontScale: "normal",
    theme: "dark",
    autoRotate: false,
    showWaitlist: true,
    showAlerts: true,
    showUpcoming: true,
    showZoneLoad: true,
    showKPIs: true,
  });

  // Update "last refresh" timestamp + interval
  React.useEffect(() => {
    const update = () => {
      const d = new Date();
      setLastRefresh(
        d.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    update();
    const id = setInterval(update, settings.refreshInterval * 1000);
    return () => clearInterval(id);
  }, [settings.refreshInterval]);

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleChange = <K extends keyof TVSettings>(
    key: K,
    value: TVSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().then(
        () => setIsFullscreen(true),
        () => {
          toast({
            title: "No se pudo activar pantalla completa",
            description: "El navegador bloqueó la solicitud (demo)",
          });
        },
      );
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  };

  const fontClasses = fontScaleClass(settings.fontScale);

  return (
    <TooltipProvider delayDuration={150}>
      <section
        aria-labelledby="floor-tv-title"
        className="flex flex-col gap-5"
        ref={containerRef}
      >
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                id="floor-tv-title"
                className="font-display text-2xl font-light tracking-tight text-foreground sm:text-3xl"
              >
                Modo TV
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] font-mono uppercase tracking-wider"
              >
                demo
              </Badge>
              <Badge
                variant="outline"
                className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] font-mono uppercase tracking-wider"
              >
                GDPR Sanitizado
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Vista sanitizada para pantallas en cocina, pasillos y áreas
              públicas. Sin PII.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ConnectionIndicator online={online} />
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
              <RefreshCw className="h-2.5 w-2.5" />
              <span>Actualizado: {lastRefresh || "—"}</span>
            </div>
          </div>
        </header>

        {/* GDPR notice */}
        <GDPRNotice />

        {/* TV display */}
        <div
          className={cn(
            "rp-glass-strong rounded-2xl p-4 sm:p-6 lg:p-8",
            themeClass(settings.theme),
            isFullscreen && "min-h-screen rounded-none",
          )}
        >
          {/* Top bar: clock + connection */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Servicio en curso · {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              <div className="mt-1 font-display text-xl font-light text-foreground sm:text-2xl">
                RestoPanel · Smart Floor
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <LiveClock className={fontClasses.clock} />
              <ConnectionIndicator online={online} />
            </div>
          </div>

          {/* Main grid: occupancy + table states */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <OccupancyIndicator
              pct={DEMO_OCCUPANCY_PCT}
              fontClasses={fontClasses}
            />
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                <Armchair className="h-3 w-3" />
                Mesas por estado
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {DEMO_TABLE_STATES.map((b) => (
                  <TableStateBig
                    key={b.label}
                    block={b}
                    fontClasses={fontClasses}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Secondary row: waitlist + alerts */}
          {settings.showWaitlist || settings.showAlerts ? (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {settings.showWaitlist && <WaitlistPanel />}
              {settings.showAlerts && <CriticalAlerts alerts={DEMO_ALERTS} />}
            </div>
          ) : null}

          {/* Tertiary row: upcoming + zone load */}
          {settings.showUpcoming || settings.showZoneLoad ? (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {settings.showUpcoming && (
                <UpcomingArrivals arrivals={DEMO_UPCOMING} />
              )}
              {settings.showZoneLoad && <ZoneLoadBars zones={DEMO_ZONE_LOAD} />}
            </div>
          ) : null}

          {/* KPIs */}
          {settings.showKPIs && (
            <div className="mt-4">
              <ServiceKPIs kpis={DEMO_KPIS} fontClasses={fontClasses} />
            </div>
          )}
        </div>

        {/* Sanitization log */}
        <SanitizationLog />

        {/* Settings panel */}
        <TVSettingsPanel
          settings={settings}
          onChange={handleChange}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
        />

        {/* Auto-rotate notice */}
        {settings.autoRotate && (
          <div className="rp-glass flex items-center gap-2 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.05] px-3 py-2 text-[11px] text-[var(--gold-soft)]">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Rotación automática activa — ciclando entre vistas cada 30s (demo)
          </div>
        )}
      </section>
    </TooltipProvider>
  );
}
