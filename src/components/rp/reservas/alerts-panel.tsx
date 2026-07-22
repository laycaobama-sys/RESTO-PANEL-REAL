"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  AlertTriangle, Info, XCircle, Crown, Clock3, UserCheck,
  UserX, Sparkles, Cake, Heart, Gift, TrendingUp, Plug,
  Scale, X, Phone, ArrowRight, Bell, ShieldAlert, RefreshCw,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type AlertSeverity = "info" | "warning" | "critical";

interface Alert {
  id: string;
  severity: AlertSeverity;
  category:
    | "vip"
    | "long_occupied"
    | "unconfirmed"
    | "no_show_risk"
    | "cleaning_pending"
    | "dissatisfied"
    | "cancellation_spike"
    | "birthday"
    | "anniversary"
    | "high_value"
    | "abnormal_occupancy"
    | "integration_error"
    | "discrepancy";
  title: string;
  description: string;
  tableId?: string;
  reservationId?: string;
  customerName?: string;
  actionLabel?: string;
  actionTarget?: string;
  createdAt: string;
}

/* =========================================================
 * Meta maps
 * =======================================================*/
const SEVERITY_META: Record<
  AlertSeverity,
  {
    icon: React.ElementType;
    color: string;
    ring: string;
    label: string;
    badge: string;
    glow: string;
  }
> = {
  critical: {
    icon: XCircle,
    color: "text-destructive",
    ring: "ring-destructive/40",
    label: "Crítica",
    badge:
      "border-destructive/40 bg-destructive/10 text-destructive",
    glow: "bg-destructive/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-300",
    ring: "ring-amber-400/40",
    label: "Advertencia",
    badge: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    glow: "bg-amber-400/10",
  },
  info: {
    icon: Info,
    color: "rp-teal-text",
    ring: "ring-[var(--teal)]/40",
    label: "Info",
    badge: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    glow: "bg-[var(--teal)]/10",
  },
};

const CATEGORY_META: Record<
  Alert["category"],
  { label: string; icon: React.ElementType }
> = {
  vip: { label: "VIP", icon: Crown },
  long_occupied: { label: "Ocupación", icon: Clock3 },
  unconfirmed: { label: "Sin confirmar", icon: UserCheck },
  no_show_risk: { label: "No-show", icon: UserX },
  cleaning_pending: { label: "Limpieza", icon: RefreshCw },
  dissatisfied: { label: "Satisfacción", icon: ShieldAlert },
  cancellation_spike: { label: "Cancelaciones", icon: TrendingUp },
  birthday: { label: "Cumpleaños", icon: Cake },
  anniversary: { label: "Aniversario", icon: Heart },
  high_value: { label: "Alto valor", icon: Gift },
  abnormal_occupancy: { label: "Ocupación anómala", icon: Scale },
  integration_error: { label: "Integración", icon: Plug },
  discrepancy: { label: "Discrepancia", icon: AlertTriangle },
};

/* =========================================================
 * Demo data
 * =======================================================*/
const NOW = Date.now();
const MIN = 60_000;

const INITIAL_ALERTS: Alert[] = [
  {
    id: "a1",
    severity: "critical",
    category: "vip",
    title: "Cliente VIP acaba de llegar",
    description:
      "Andrea Rossi (VIP oro) ha llegado 10 min antes de su reserva. Mesa 7 (Sala VIP) está libre y limpia.",
    tableId: "tbl-7",
    reservationId: "res-2204",
    customerName: "Andrea Rossi",
    actionLabel: "Sentar ahora",
    actionTarget: "tbl-7",
    createdAt: new Date(NOW - 1 * MIN).toISOString(),
  },
  {
    id: "a2",
    severity: "warning",
    category: "long_occupied",
    title: "Mesa 14 ocupada más de 2h",
    description:
      "Mesa 14 (Terraza) lleva 132 min ocupada. La próxima reserva en esa mesa es en 18 min. Considerar ofrecer café en barra.",
    tableId: "tbl-14",
    customerName: "M. Álvarez",
    actionLabel: "Ofrecer postre en barra",
    createdAt: new Date(NOW - 5 * MIN).toISOString(),
  },
  {
    id: "a3",
    severity: "warning",
    category: "unconfirmed",
    title: "3 reservas sin confirmar para esta noche",
    description:
      "Hay 3 reservas para el turno de cena (21:00–22:30) sin confirmar ni reconfirmar. Riesgo de no-show acumulado del 38%.",
    actionLabel: "Confirmar por WhatsApp",
    createdAt: new Date(NOW - 8 * MIN).toISOString(),
  },
  {
    id: "a4",
    severity: "critical",
    category: "no_show_risk",
    title: "Reserva con riesgo crítico de no-show",
    description:
      "Reserva de Marco Bellini (6p · 22:30) tiene un score de no-show de 82/100. Sin garantía activa.",
    reservationId: "res-2187",
    customerName: "Marco Bellini",
    actionLabel: "Solicitar depósito",
    createdAt: new Date(NOW - 3 * MIN).toISOString(),
  },
  {
    id: "a5",
    severity: "info",
    category: "cleaning_pending",
    title: "2 mesas pendientes de limpieza",
    description:
      "Mesas 3 y 9 (Sala) finalizaron hace 12 y 7 min respectivamente. Aún no se ha marcado el cleaning.",
    tableId: "tbl-3",
    actionLabel: "Asignar limpieza",
    createdAt: new Date(NOW - 12 * MIN).toISOString(),
  },
  {
    id: "a6",
    severity: "info",
    category: "birthday",
    title: "Cumpleaños hoy · Laura Pérez",
    description:
      "Laura Pérez cumple 32 años hoy. Tiene reserva confirmada a las 21:00 (2p, mesa 11). Mesa 11 lista con postre de cortesía.",
    customerName: "Laura Pérez",
    reservationId: "res-2198",
    actionLabel: "Preparar postre",
    createdAt: new Date(NOW - 22 * MIN).toISOString(),
  },
  {
    id: "a7",
    severity: "critical",
    category: "abnormal_occupancy",
    title: "Ocupación anómala en Terraza",
    description:
      "Terraza al 92% mientras Sala está al 41%. Histórico para viernes 22:00: Terraza 65% / Sala 78%. Posible causa: clima o evento cercano.",
    actionLabel: "Reasignar a Sala",
    createdAt: new Date(NOW - 15 * MIN).toISOString(),
  },
  {
    id: "a8",
    severity: "critical",
    category: "integration_error",
    title: "Sincronización con Google fallo",
    description:
      "El conector de Google Reservas no ha sincronizado en 14 min. Última sync OK a las 20:31. 2 reservas podrían no estar reflejadas.",
    actionLabel: "Reintentar sync",
    createdAt: new Date(NOW - 14 * MIN).toISOString(),
  },
  {
    id: "a9",
    severity: "warning",
    category: "cancellation_spike",
    title: "Pico de cancelaciones en 1h",
    description:
      "4 cancelaciones en la última hora (media histórica: 0.8/h). Posible causa: evento adverso o error en comunicación.",
    actionLabel: "Ver detalle",
    createdAt: new Date(NOW - 6 * MIN).toISOString(),
  },
  {
    id: "a10",
    severity: "info",
    category: "anniversary",
    title: "Aniversario de boda · Familia Ruiz",
    description:
      "Familia Ruiz celebra 25º aniversario. Reserva 4p · 20:30 · mesa 5 (Sala). Cliente recurrente LTV €3.840.",
    customerName: "Familia Ruiz",
    actionLabel: "Decorar mesa",
    createdAt: new Date(NOW - 28 * MIN).toISOString(),
  },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  return `hace ${h} h`;
}

type Filter = "all" | "critical" | "warning" | "info";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "critical", label: "Críticas" },
  { id: "warning", label: "Advertencias" },
  { id: "info", label: "Info" },
];

/* =========================================================
 * Alert card
 * =======================================================*/
function AlertCard({
  alert,
  index,
  onDismiss,
  onAction,
}: {
  alert: Alert;
  index: number;
  onDismiss: () => void;
  onAction: (a: Alert) => void;
}) {
  const reduce = useReducedMotion();
  const sev = SEVERITY_META[alert.severity];
  const cat = CATEGORY_META[alert.category];
  const SevIcon = sev.icon;
  const CatIcon = cat.icon;

  return (
    <motion.article
      layout={reduce ? false : true}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, x: -10 }}
      transition={{ duration: 0.28, delay: reduce ? 0 : index * 0.03 }}
      className={cn(
        "rp-glass relative overflow-hidden rounded-xl p-4",
        alert.severity === "critical" && "ring-1 ring-destructive/30"
      )}
    >
      {/* Accent bar */}
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          alert.severity === "critical"
            ? "bg-destructive"
            : alert.severity === "warning"
            ? "bg-amber-400"
            : "bg-[var(--teal)]"
        )}
        aria-hidden="true"
      />

      <div className="flex items-start gap-3 pl-2">
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1",
            sev.glow,
            sev.ring
          )}
        >
          <SevIcon className={cn("h-4.5 w-4.5", sev.color)} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                sev.badge
              )}
            >
              {sev.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-foreground/[0.04] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <CatIcon className="h-3 w-3" />
              {cat.label}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatRelative(alert.createdAt)}
            </span>
          </div>

          <h4 className="mt-1.5 text-sm font-medium text-foreground sm:text-[15px]">
            {alert.title}
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {alert.description}
          </p>

          {/* Context */}
          {(alert.tableId || alert.customerName) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              {alert.customerName && (
                <span className="inline-flex items-center gap-1">
                  <UserCheck className="h-3 w-3" />
                  {alert.customerName}
                </span>
              )}
              {alert.tableId && (
                <span className="inline-flex items-center gap-1">
                  <span className="font-mono">{alert.tableId}</span>
                </span>
              )}
              {alert.reservationId && (
                <span className="inline-flex items-center gap-1 font-mono">
                  · {alert.reservationId}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          {alert.actionLabel && (
            <div className="mt-3">
              <Button
                size="sm"
                className={cn(
                  "h-8 text-xs",
                  alert.severity === "critical"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : alert.severity === "warning"
                    ? "bg-amber-400 text-[#1a1205] hover:bg-amber-300"
                    : "bg-[var(--teal)] text-[#04201e] hover:bg-[var(--teal)]/90"
                )}
                onClick={() => onAction(alert)}
              >
                {alert.actionLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          aria-label="Descartar alerta"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function AlertsPanel() {
  const { toast } = useToast();
  const [alerts, setAlerts] = React.useState<Alert[]>(INITIAL_ALERTS);
  const [filter, setFilter] = React.useState<Filter>("all");

  const counts = React.useMemo(
    () => ({
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === "critical").length,
      warning: alerts.filter((a) => a.severity === "warning").length,
      info: alerts.filter((a) => a.severity === "info").length,
    }),
    [alerts]
  );

  const visible = React.useMemo(() => {
    if (filter === "all") return alerts;
    return alerts.filter((a) => a.severity === filter);
  }, [alerts, filter]);

  const dismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast({
      title: "Alerta descartada",
      description: "Se ha eliminado de la lista activa.",
    });
  };

  const onAction = (a: Alert) => {
    toast({
      title: `Acción: ${a.actionLabel}`,
      description: a.tableId
        ? `Aplicada a ${a.tableId}.`
        : a.customerName
        ? `Cliente: ${a.customerName}`
        : "Acción registrada (demo).",
    });
  };

  return (
    <section aria-labelledby="alerts-title" className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/10 text-destructive">
              <Bell className="h-5 w-5" />
            </span>
            <h2
              id="alerts-title"
              className="font-display text-xl sm:text-2xl font-medium tracking-tight"
            >
              Alertas operativas
            </h2>
            <Badge
              variant="outline"
              className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono text-[10px] uppercase tracking-wider"
            >
              demo
            </Badge>
            <Badge
              variant="outline"
              className="border-border/40 bg-foreground/5 font-mono text-xs tabular-nums"
            >
              {counts.total}
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Incidencias en tiempo real que requieren atención del equipo.
          </p>
        </div>

        {/* Severity count badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <SevCountBadge tone="critical" count={counts.critical} label="críticas" />
          <SevCountBadge tone="warning" count={counts.warning} label="adv." />
          <SevCountBadge tone="info" count={counts.info} label="info" />
        </div>
      </header>

      {/* Filters */}
      <div
        role="tablist"
        aria-label="Filtrar alertas por severidad"
        className="flex flex-wrap gap-1.5"
      >
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const count =
            f.id === "all"
              ? counts.total
              : f.id === "critical"
              ? counts.critical
              : f.id === "warning"
              ? counts.warning
              : counts.info;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex min-h-[36px] items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                  : "border-border/40 bg-foreground/[0.02] text-muted-foreground hover:bg-foreground/[0.05]"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-mono tabular-nums",
                  active ? "bg-[var(--gold)]/20" : "bg-foreground/5"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2.5">
        <AnimatePresence mode="popLayout">
          {visible.map((a, i) => (
            <AlertCard
              key={a.id}
              alert={a}
              index={i}
              onDismiss={() => dismiss(a.id)}
              onAction={onAction}
            />
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <div className="rp-glass rounded-xl p-8 text-center text-sm text-muted-foreground">
            <Sparkles className="mx-auto mb-2 h-5 w-5 text-[var(--gold)]" />
            No hay alertas en esta categoría.
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
 * Severity count badge
 * =======================================================*/
function SevCountBadge({
  tone,
  count,
  label,
}: {
  tone: "critical" | "warning" | "info";
  count: number;
  label: string;
}) {
  const map = {
    critical:
      "border-destructive/40 bg-destructive/10 text-destructive",
    warning: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    info: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-mono uppercase tracking-wider",
        map[tone]
      )}
    >
      <span className="tabular-nums">{count}</span>
      <span className="opacity-80">{label}</span>
    </span>
  );
}
