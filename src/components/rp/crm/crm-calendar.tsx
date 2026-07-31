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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  TreePine,
  Heart,
  Flower2,
  ShoppingBag,
  PartyPopper,
  Flame,
  Gift,
  Crown,
  Plus,
  Sparkles,
  Mail,
  MessageSquare,
  Smartphone,
  Pencil,
  CalendarClock,
  CheckCircle2,
  Send,
  FileEdit,
  Brain,
  ChevronDown,
  Wand2,
  Clock,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type CampaignStatus = "suggested" | "draft" | "approved" | "scheduled" | "sent";
type Channel = "Email" | "WhatsApp" | "SMS";

interface AISuggestion {
  campaign: string;
  audience: string;
  channel: Channel;
  offer: string;
  confidence: number;
}

interface CalendarCampaign {
  id: string;
  name: string;
  occasion: string;
  date: string; // ISO
  channel: Channel;
  audience: string;
  status: CampaignStatus;
  estimatedBudget: string;
  expectedResult: string;
  aiSuggestion?: AISuggestion;
}

/* =========================================================
 * Meta: status, channel, occasion icon
 * =======================================================*/
const STATUS_META: Record<
  CampaignStatus,
  { label: string; badge: string; icon: React.ElementType }
> = {
  suggested: {
    label: "Sugerida",
    badge: "border-dashed border-[var(--gold)]/50 bg-[var(--gold)]/5 text-[var(--gold-soft)]",
    icon: Sparkles,
  },
  draft: {
    label: "Borrador",
    badge: "border-border bg-muted/40 text-muted-foreground",
    icon: FileEdit,
  },
  approved: {
    label: "Aprobada",
    badge: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
    icon: CheckCircle2,
  },
  scheduled: {
    label: "Programada",
    badge: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    icon: CalendarClock,
  },
  sent: {
    label: "Enviada",
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    icon: Send,
  },
};

const CHANNEL_META: Record<Channel, { icon: React.ElementType; badge: string }> = {
  Email: { icon: Mail, badge: "border-border/60 bg-muted/40 text-foreground/80" },
  WhatsApp: {
    icon: MessageSquare,
    badge: "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]",
  },
  SMS: { icon: Smartphone, badge: "border-border/60 bg-muted/40 text-foreground/80" },
};

const OCCASION_ICON: Record<string, React.ElementType> = {
  "Reyes Magos": Crown,
  "San Valentín": Heart,
  "Día de la Madre": Flower2,
  "Black Friday": ShoppingBag,
  Carnaval: PartyPopper,
  Candelaria: Flame,
  Cumpleaños: Gift,
  Navidad: TreePine,
  Default: CalendarDays,
};

function occasionIcon(name: string): React.ElementType {
  return OCCASION_ICON[name] ?? OCCASION_ICON.Default;
}

/* =========================================================
 * Demo data
 * =======================================================*/
const INITIAL_CAMPAIGNS: CalendarCampaign[] = [
  {
    id: "c1",
    name: "Menú especial Reyes",
    occasion: "Reyes Magos",
    date: "2025-01-06T10:00:00.000Z",
    channel: "Email",
    audience: "Todos los clientes",
    status: "scheduled",
    estimatedBudget: "€200",
    expectedResult: "+45 reservas",
  },
  {
    id: "c2",
    name: "Cena romántica San Valentín",
    occasion: "San Valentín",
    date: "2025-02-14T20:00:00.000Z",
    channel: "WhatsApp",
    audience: "Parejas + VIP",
    status: "approved",
    estimatedBudget: "€350",
    expectedResult: "+80 reservas, +€3.200",
  },
  {
    id: "c3",
    name: "Carnaval: noche de tapas",
    occasion: "Carnaval",
    date: "2025-02-13T20:00:00.000Z",
    channel: "WhatsApp",
    audience: "Jóvenes 25-40",
    status: "suggested",
    estimatedBudget: "€180",
    expectedResult: "+30 reservas estimadas",
    aiSuggestion: {
      campaign: "Noche de tapas con playlist carnavalera y 2ª ronda gratis",
      audience: "Segmento Jóvenes 25-40 con ≥2 visitas último trimestre",
      channel: "WhatsApp",
      offer: "2ª ronda de tapas gratis para grupos de 4+",
      confidence: 78,
    },
  },
  {
    id: "c4",
    name: "Día de la Candelaria",
    occasion: "Candelaria",
    date: "2025-02-02T13:00:00.000Z",
    channel: "Email",
    audience: "Familias",
    status: "suggested",
    estimatedBudget: "€120",
    expectedResult: "+15 reservas familia",
    aiSuggestion: {
      campaign: "Comida familiar con postre tradicional",
      audience: "Segmento Familias con niños",
      channel: "Email",
      offer: "Menú infantil gratis para grupos familiares de 4+",
      confidence: 65,
    },
  },
  {
    id: "c5",
    name: "Black Friday: 2x1 en reservas",
    occasion: "Black Friday",
    date: "2024-11-28T10:00:00.000Z",
    channel: "Email",
    audience: "Todos los clientes",
    status: "sent",
    estimatedBudget: "€500",
    expectedResult: "+120 reservas",
  },
];

const UPCOMING_OCCASIONS: {
  name: string;
  date: string;
  daysAway: number;
}[] = [
  { name: "San Valentín", date: "14 feb 2025", daysAway: 18 },
  { name: "Carnaval", date: "13 feb 2025", daysAway: 17 },
  { name: "Día del Padre", date: "19 mar 2025", daysAway: 51 },
  { name: "Semana Santa", date: "13 abr 2025", daysAway: 76 },
  { name: "Día de la Madre", date: "4 may 2025", daysAway: 97 },
];

/* =========================================================
 * Calendar helpers
 * =======================================================*/
const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEKDAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  // JS: 0 = Sunday, 1 = Monday ...
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatCampaignDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCampaignDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function isUpcoming(iso: string, days = 30): boolean {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diff = target - now;
  return diff >= -24 * 60 * 60 * 1000 && diff <= days * 24 * 60 * 60 * 1000;
}

/* =========================================================
 * Component
 * =======================================================*/
export function CrmCalendar() {
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = React.useState<CalendarCampaign[]>(INITIAL_CAMPAIGNS);
  const [cursor, setCursor] = React.useState<Date>(new Date(2025, 0, 1)); // Jan 2025
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [generating, setGenerating] = React.useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const grid = React.useMemo(() => buildMonthGrid(year, month), [year, month]);

  const campaignsByDay = React.useMemo(() => {
    const map = new Map<string, CalendarCampaign[]>();
    for (const c of campaigns) {
      const d = new Date(c.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    return map;
  }, [campaigns]);

  const selectedDayCampaigns = React.useMemo(() => {
    if (!selectedDay) return [];
    const key = `${selectedDay.getFullYear()}-${selectedDay.getMonth()}-${selectedDay.getDate()}`;
    return campaignsByDay.get(key) ?? [];
  }, [selectedDay, campaignsByDay]);

  const upcomingCampaigns = React.useMemo(() => {
    return campaigns
      .filter((c) => isUpcoming(c.date, 30))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [campaigns]);

  const monthLabel = `${MONTHS_ES[month]} ${year}`;

  const goPrev = () => setCursor(new Date(year, month - 1, 1));
  const goNext = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => {
    setCursor(new Date(2025, 0, 1));
    setSelectedDay(null);
  };

  const generateAI = () => {
    setGenerating(true);
    setTimeout(() => {
      const newOnes: CalendarCampaign[] = [
        {
          id: `ai-${Date.now()}-1`,
          name: "Día del Padre: menú grill",
          occasion: "Día del Padre",
          date: "2025-03-19T13:00:00.000Z",
          channel: "Email",
          audience: "Familias + hombres 35-60",
          status: "suggested",
          estimatedBudget: "€240",
          expectedResult: "+40 reservas",
          aiSuggestion: {
            campaign: "Menú grill para padres con cerveza artesana de bienvenida",
            audience: "Segmento Familias + hombres 35-60 con visitas ≥3",
            channel: "Email",
            offer: "Cerveza artesana de bienvenida para el padre",
            confidence: 81,
          },
        },
        {
          id: `ai-${Date.now()}-2`,
          name: "Semana Santa: menú de vigilia",
          occasion: "Candelaria",
          date: "2025-04-17T13:00:00.000Z",
          channel: "WhatsApp",
          audience: "Clientes tradicionales",
          status: "suggested",
          estimatedBudget: "€300",
          expectedResult: "+55 reservas",
          aiSuggestion: {
            campaign: "Menú de vigilia con bacalao y postre tradicional",
            audience: "Segmento Tradicional + clientes ≥45 años",
            channel: "WhatsApp",
            offer: "Postre casero incluido en menú de vigilia",
            confidence: 73,
          },
        },
      ];
      setCampaigns((prev) => [...prev, ...newOnes]);
      setGenerating(false);
      toast({
        title: "Sugerencias IA generadas",
        description: "Se han añadido 2 campañas sugeridas para próximas ocasiones.",
      });
    }, 1500);
  };

  const handleCampaignAction = (campaign: CalendarCampaign, action: string) => {
    if (action === "create") {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? { ...c, status: "draft" } : c))
      );
      toast({
        title: "Campaña creada",
        description: `"${campaign.name}" movida a borradores.`,
      });
    } else if (action === "schedule") {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? { ...c, status: "scheduled" } : c))
      );
      toast({
        title: "Campaña programada",
        description: `"${campaign.name}" programada para ${formatCampaignDate(campaign.date)}.`,
      });
    } else if (action === "edit") {
      toast({
        title: "Abrir editor",
        description: `Editor de campaña: "${campaign.name}" (demo).`,
      });
    }
  };

  const handleCreateForOccasion = (name: string, date: string) => {
    toast({
      title: "Nueva campaña",
      description: `Crear campaña para ${name} (${date}) — demo.`,
    });
  };

  return (
    <TooltipProvider>
      <section aria-labelledby="cal-heading" className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] ring-1 ring-[var(--gold)]/20">
                <CalendarDays className="h-4.5 w-4.5" />
              </div>
              <h2
                id="cal-heading"
                className="font-display text-2xl sm:text-3xl tracking-tight text-foreground"
              >
                Calendario comercial
              </h2>
              <Badge className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]">
                demo
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Planifica campañas estacionales por ocasión y canal. La IA sugiere copy, audiencia y
              oferta para cada festividad relevante.
            </p>
          </div>
          <Button
            onClick={generateAI}
            disabled={generating}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black min-h-11"
          >
            <Wand2 className={cn("h-4 w-4", generating && "animate-pulse")} />
            {generating ? "Generando…" : "Generar sugerencias IA"}
          </Button>
        </div>

        {/* Main grid: calendar + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
          {/* Calendar card */}
          <div className="rp-glass rounded-xl p-4 sm:p-5">
            {/* Month selector */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goPrev}
                  aria-label="Mes anterior"
                  className="h-10 w-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goNext}
                  aria-label="Mes siguiente"
                  className="h-10 w-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-display text-xl text-foreground text-center flex-1">
                {monthLabel}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToday}
                className="text-muted-foreground hover:text-foreground min-h-10"
              >
                Hoy
              </Button>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-1 mb-1.5">
              {WEEKDAYS_ES.map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground py-1.5"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {grid.map((day, i) => {
                if (!day) return <div key={`e-${i}`} className="aspect-square" />;
                const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
                const dayCampaigns = campaignsByDay.get(key) ?? [];
                const hasCampaigns = dayCampaigns.length > 0;
                const isSelected = selectedDay && sameDay(day, selectedDay);
                const isToday = sameDay(day, new Date());
                const hasAI = dayCampaigns.some((c) => c.aiSuggestion);

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDay(day)}
                    aria-label={`${day.getDate()} ${MONTHS_ES[day.getMonth()]} ${day.getFullYear()}${hasCampaigns ? `, ${dayCampaigns.length} campañas` : ""}`}
                    className={cn(
                      "relative aspect-square rounded-lg border text-sm transition-all min-h-[44px] sm:min-h-[52px] flex flex-col items-center justify-center gap-1",
                      "hover:border-[var(--gold)]/40 hover:bg-foreground/5",
                      isSelected
                        ? "border-[var(--gold)]/60 bg-[var(--gold)]/10 rp-glow-gold"
                        : "border-border/50 bg-muted/20",
                      isToday && !isSelected && "ring-1 ring-[var(--teal)]/40"
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-sm",
                        isSelected ? "text-[var(--gold-soft)]" : "text-foreground/90"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {hasCampaigns && (
                      <span className="flex items-center gap-1 absolute bottom-1.5">
                        {dayCampaigns.slice(0, 3).map((c) => {
                          const meta = STATUS_META[c.status];
                          const dotColor =
                            c.status === "suggested"
                              ? "bg-[var(--gold)]"
                              : c.status === "approved"
                              ? "bg-[var(--teal)]"
                              : c.status === "scheduled"
                              ? "bg-[var(--gold-soft)]"
                              : "bg-emerald-400";
                          return (
                            <span
                              key={c.id}
                              className={cn("h-1.5 w-1.5 rounded-full", dotColor)}
                              title={`${c.name} — ${meta.label}`}
                            />
                          );
                        })}
                        {dayCampaigns.length > 3 && (
                          <span className="text-[9px] text-muted-foreground font-mono">
                            +{dayCampaigns.length - 3}
                          </span>
                        )}
                      </span>
                    )}
                    {hasAI && (
                      <span className="absolute top-1 right-1 text-[var(--teal)]">
                        <Sparkles className="h-2.5 w-2.5" />
                      </span>
                    )}
                    {isToday && (
                      <span className="absolute top-1 left-1 h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                Sugerida
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
                Aprobada
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold-soft)]" />
                Programada
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Enviada
              </span>
              <span className="inline-flex items-center gap-1.5 rp-teal-text">
                <Sparkles className="h-3 w-3" />
                IA
              </span>
            </div>
          </div>

          {/* Sidebar: upcoming occasions */}
          <div className="rp-glass rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 rp-teal-text" />
              <h3 className="font-display text-lg text-foreground">Próximas ocasiones</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Festividades relevantes para los próximos 3 meses. Crea una campaña para cada una.
            </p>
            <ul className="space-y-2 max-h-[360px] overflow-y-auto rp-scroll-thin pr-1">
              {UPCOMING_OCCASIONS.map((o) => {
                const Icon = OCCASION_ICON[o.name] ?? CalendarDays;
                return (
                  <li
                    key={o.name}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-2.5 hover:border-[var(--gold)]/40 transition-colors"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--gold)]/10 text-[var(--gold)]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-foreground truncate">{o.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.date} · {o.daysAway} días
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreateForOccasion(o.name, o.date)}
                      className="border-[var(--gold)]/30 text-[var(--gold-soft)] hover:bg-[var(--gold)]/10 hover:text-[var(--gold)] min-h-9 h-9"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Crear</span>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Selected day campaigns */}
        <AnimatePresence initial={false}>
          {selectedDay && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.24 }}
              className="rp-glass rounded-xl p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-display text-lg text-foreground">
                  Campañas del{" "}
                  <span className="rp-gold-text">
                    {selectedDay.toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedDay(null)}
                  className="text-muted-foreground hover:text-foreground h-9"
                >
                  Cerrar
                </Button>
              </div>
              {selectedDayCampaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hay campañas este día.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDayCampaigns.map((c) => (
                    <CampaignCard
                      key={c.id}
                      campaign={c}
                      compact
                      onAction={handleCampaignAction}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming campaigns list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl text-foreground">Próximas campañas</h3>
              <span className="text-xs text-muted-foreground">
                · próximos 30 días · {upcomingCampaigns.length} campaña(s)
              </span>
            </div>
          </div>
          {upcomingCampaigns.length === 0 ? (
            <div className="rp-glass rounded-xl p-8 text-center text-sm text-muted-foreground">
              No hay campañas en los próximos 30 días.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {upcomingCampaigns.map((c, idx) => (
                  <motion.div
                    key={c.id}
                    layout={!reduceMotion}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.26, delay: reduceMotion ? 0 : Math.min(idx * 0.04, 0.2) }}
                  >
                    <CampaignCard campaign={c} onAction={handleCampaignAction} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2.5 text-xs text-muted-foreground rp-glass rounded-lg p-3.5">
          <Brain className="h-4 w-4 mt-0.5 shrink-0 rp-teal-text" />
          <p>
            Las sugerencias de IA son propuestas iniciales basadas en ocasiones, segmentos e
            histórico de campañas. Revisa siempre copy, audiencia y oferta antes de programar.
          </p>
        </div>
      </section>
    </TooltipProvider>
  );
}

/* =========================================================
 * Campaign card
 * =======================================================*/
interface CampaignCardProps {
  campaign: CalendarCampaign;
  compact?: boolean;
  onAction: (campaign: CalendarCampaign, action: string) => void;
}

function CampaignCard({ campaign, compact = false, onAction }: CampaignCardProps) {
  const [open, setOpen] = React.useState(false);
  const Icon = OCCASION_ICON[campaign.occasion] ?? CalendarDays;
  const sMeta = STATUS_META[campaign.status];
  const cMeta = CHANNEL_META[campaign.channel];
  const hasAI = !!campaign.aiSuggestion;

  return (
    <article className="rp-glass rounded-xl border border-border/50 overflow-hidden h-full flex flex-col">
      <div className={cn("p-4 flex-1", compact && "p-3.5")}>
        {/* Top row */}
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] ring-1 ring-[var(--gold)]/15">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-display text-base text-foreground leading-tight">
              {campaign.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">{campaign.occasion}</p>
          </div>
          {hasAI && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--teal)] cursor-help">
                  <Sparkles className="h-3 w-3" />
                  IA · {campaign.aiSuggestion!.confidence}%
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">Sugerencia IA con confianza {campaign.aiSuggestion!.confidence}%</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Date prominent */}
        <div className="mt-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 rp-gold-text" />
          <span className="font-mono text-sm text-foreground">
            {formatCampaignDate(campaign.date)}
          </span>
        </div>

        {/* Tags row */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
              cMeta.badge
            )}
          >
            <cMeta.icon className="h-3 w-3" />
            {campaign.channel}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
              sMeta.badge
            )}
          >
            <sMeta.icon className="h-3 w-3" />
            {sMeta.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-foreground/80">
            <span className="h-1 w-1 rounded-full bg-current opacity-60" />
            {campaign.audience}
          </span>
        </div>

        {/* Budget + result */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
            <div className="text-muted-foreground text-[10px] uppercase tracking-wide">Presupuesto</div>
            <div className="font-mono text-sm text-foreground mt-0.5">{campaign.estimatedBudget}</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
            <div className="text-muted-foreground text-[10px] uppercase tracking-wide">Resultado esp.</div>
            <div className="font-mono text-sm rp-gold-text mt-0.5">{campaign.expectedResult}</div>
          </div>
        </div>

        {/* AI suggestion detail */}
        {hasAI && (
          <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
            <CollapsibleTrigger asChild>
              <button className="w-full inline-flex items-center justify-between gap-2 rounded-lg border border-[var(--teal)]/25 bg-[var(--teal)]/5 px-3 py-2 text-xs text-[var(--teal)] hover:bg-[var(--teal)]/10 transition-colors min-h-9">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Ver sugerencia IA
                </span>
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2 text-xs">
                <SuggestionRow label="Campaña" value={campaign.aiSuggestion!.campaign} />
                <SuggestionRow label="Audiencia" value={campaign.aiSuggestion!.audience} />
                <SuggestionRow
                  label="Canal"
                  value={campaign.aiSuggestion!.channel}
                  icon={CHANNEL_META[campaign.aiSuggestion!.channel].icon}
                />
                <SuggestionRow label="Oferta" value={campaign.aiSuggestion!.offer} />
                <div className="pt-1.5 border-t border-border/40 flex items-center justify-between">
                  <span className="text-muted-foreground">Confianza IA</span>
                  <span className="font-mono rp-teal-text">
                    {campaign.aiSuggestion!.confidence}%
                  </span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex flex-wrap gap-2 border-t border-border/40 pt-3">
        {campaign.status === "suggested" && (
          <Button
            size="sm"
            onClick={() => onAction(campaign, "create")}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black min-h-9"
          >
            <Plus className="h-3.5 w-3.5" />
            Crear campaña
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAction(campaign, "edit")}
          className="min-h-9"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>
        {(campaign.status === "approved" || campaign.status === "draft") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction(campaign, "schedule")}
            className="border-[var(--gold)]/30 text-[var(--gold-soft)] hover:bg-[var(--gold)]/10 hover:text-[var(--gold)] min-h-9"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Programar
          </Button>
        )}
      </div>
    </article>
  );
}

function SuggestionRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground min-w-[64px] shrink-0">{label}</span>
      <span className="text-foreground/90 flex-1 flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 rp-teal-text shrink-0" />}
        {value}
      </span>
    </div>
  );
}

export default CrmCalendar;
