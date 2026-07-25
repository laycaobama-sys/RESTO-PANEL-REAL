"use client";

/* ============================================================
 * RestoPanel · DemoCrm — CRM interactivo
 * ------------------------------------------------------------
 * Demo en vivo para el landing.
 *  - Listado de 6 clientes (izquierda) con VIP, visitas, última visita
 *  - Perfil seleccionado (derecha):
 *      avatar gradiente, nombre, VIP, LTV grande dorado, ticket medio
 *      timeline vertical (4-5 visitas) con stagger
 *      preferencias (chips): alérgenos, mesa favorita, zona preferida
 *      "Próximo cumpleaños: N días"
 *      notas internas
 *  - Segment builder (abajo): chips de regla, count recalculado en vivo
 *  - Badge "demo"
 *  - Animaciones transform+opacity, respeta prefers-reduced-motion
 * ============================================================ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Star,
  CalendarClock,
  Cake,
  MapPin,
  Armchair,
  AlertTriangle,
  StickyNote,
  ChevronRight,
  Users,
  Filter,
  Utensils,
} from "lucide-react";

/* ---------- Types ---------- */
interface Visit {
  date: string;
  partySize: number;
  table: string;
  rating: number; // 0-5
}

interface Customer {
  id: string;
  name: string;
  initials: string;
  vip: boolean;
  visits: number;
  lastVisit: string;
  ltv: number;
  avgTicket: number;
  allergens: string[];
  favoriteTable: string;
  preferredZone: string;
  nextBirthdayDays: number;
  notes: string[];
  timeline: Visit[];
}

/* ---------- Demo data ---------- */
const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Elena Marín",
    initials: "EM",
    vip: true,
    visits: 24,
    lastVisit: "Hace 4 días",
    ltv: 4180,
    avgTicket: 64,
    allergens: ["Gluten", "Frutos secos"],
    favoriteTable: "M5 · Sala",
    preferredZone: "Sala principal",
    nextBirthdayDays: 23,
    notes: [
      "Prefiere mesa junto a la ventana.",
      "Suele pedir vino Rioja reserva.",
    ],
    timeline: [
      { date: "12 oct 2025", partySize: 4, table: "M5", rating: 5 },
      { date: "28 ago 2025", partySize: 2, table: "M5", rating: 5 },
      { date: "14 jul 2025", partySize: 6, table: "M5", rating: 4 },
      { date: "02 jun 2025", partySize: 2, table: "M5", rating: 5 },
      { date: "19 may 2025", partySize: 4, table: "M2", rating: 5 },
    ],
  },
  {
    id: "c2",
    name: "Javier Ruiz",
    initials: "JR",
    vip: true,
    visits: 18,
    lastVisit: "Hace 12 días",
    ltv: 3120,
    avgTicket: 58,
    allergens: ["Marisco"],
    favoriteTable: "M12 · Terraza",
    preferredZone: "Terraza",
    nextBirthdayDays: 41,
    notes: ["Aniversario el 12 de junio."],
    timeline: [
      { date: "07 oct 2025", partySize: 2, table: "M12", rating: 5 },
      { date: "21 ago 2025", partySize: 4, table: "M12", rating: 5 },
      { date: "10 jun 2025", partySize: 2, table: "M12", rating: 5 },
      { date: "03 may 2025", partySize: 6, table: "M11", rating: 4 },
    ],
  },
  {
    id: "c3",
    name: "Lucía Fernández",
    initials: "LF",
    vip: false,
    visits: 9,
    lastVisit: "Hace 21 días",
    ltv: 1140,
    avgTicket: 42,
    allergens: ["Lactosa"],
    favoriteTable: "M3 · Sala",
    preferredZone: "Sala principal",
    nextBirthdayDays: 67,
    notes: ["Solicita siempre la carta de vinos dulces."],
    timeline: [
      { date: "25 sep 2025", partySize: 2, table: "M3", rating: 4 },
      { date: "12 ago 2025", partySize: 3, table: "M3", rating: 5 },
      { date: "01 jul 2025", partySize: 2, table: "M4", rating: 4 },
      { date: "18 may 2025", partySize: 4, table: "M3", rating: 5 },
    ],
  },
  {
    id: "c4",
    name: "Marcos Ortega",
    initials: "MO",
    vip: true,
    visits: 31,
    lastVisit: "Hace 2 días",
    ltv: 6840,
    avgTicket: 78,
    allergens: [],
    favoriteTable: "M11 · Terraza",
    preferredZone: "Terraza",
    nextBirthdayDays: 12,
    notes: ["Cliente desde 2022.", "Suele invitar a grupos de 6-8."],
    timeline: [
      { date: "14 oct 2025", partySize: 8, table: "M11", rating: 5 },
      { date: "02 oct 2025", partySize: 6, table: "M11", rating: 5 },
      { date: "19 sep 2025", partySize: 4, table: "M11", rating: 5 },
      { date: "01 ago 2025", partySize: 8, table: "M12", rating: 4 },
      { date: "12 jul 2025", partySize: 6, table: "M11", rating: 5 },
    ],
  },
  {
    id: "c5",
    name: "Carmen Vidal",
    initials: "CV",
    vip: false,
    visits: 5,
    lastVisit: "Hace 38 días",
    ltv: 460,
    avgTicket: 38,
    allergens: ["Gluten"],
    favoriteTable: "M7 · Terraza",
    preferredZone: "Terraza",
    nextBirthdayDays: 89,
    notes: ["Riesgo de fuga: sin visita en 38 días."],
    timeline: [
      { date: "08 sep 2025", partySize: 2, table: "M7", rating: 4 },
      { date: "15 jul 2025", partySize: 2, table: "M7", rating: 3 },
      { date: "02 jun 2025", partySize: 3, table: "M8", rating: 4 },
    ],
  },
  {
    id: "c6",
    name: "Andrés Soler",
    initials: "AS",
    vip: true,
    visits: 27,
    lastVisit: "Hace 6 días",
    ltv: 5210,
    avgTicket: 71,
    allergens: ["Frutos secos"],
    favoriteTable: "M1 · Sala",
    preferredZone: "Sala principal",
    nextBirthdayDays: 4,
    notes: ["Sumiller aficionado, le encanta la carta de vinos."],
    timeline: [
      { date: "11 oct 2025", partySize: 4, table: "M1", rating: 5 },
      { date: "28 ago 2025", partySize: 2, table: "M1", rating: 5 },
      { date: "16 jul 2025", partySize: 6, table: "M5", rating: 5 },
      { date: "03 jun 2025", partySize: 2, table: "M1", rating: 4 },
      { date: "19 abr 2025", partySize: 4, table: "M1", rating: 5 },
    ],
  },
];

const AVATAR_GRADIENTS: Record<string, string> = {
  c1: "from-amber-300 to-rose-400",
  c2: "from-teal-300 to-cyan-500",
  c3: "from-fuchsia-300 to-purple-500",
  c4: "from-amber-300 to-orange-500",
  c5: "from-emerald-300 to-teal-500",
  c6: "from-rose-300 to-fuchsia-500",
};

/* Segment rule chips */
type RuleId = "vip" | "noVisit30" | "ticket60" | "allergenGluten" | "zoneTerraza";

const RULES: { id: RuleId; label: string; fn: (c: Customer) => boolean }[] = [
  { id: "vip", label: "VIP", fn: (c) => c.vip },
  { id: "noVisit30", label: "Sin visita 30d", fn: (c) => c.lastVisit.includes("38 días") },
  { id: "ticket60", label: "Ticket > 60€", fn: (c) => c.avgTicket > 60 },
  { id: "allergenGluten", label: "Alergia gluten", fn: (c) => c.allergens.includes("Gluten") },
  { id: "zoneTerraza", label: "Zona Terraza", fn: (c) => c.preferredZone === "Terraza" },
];

/* Base count (sin filtros): clientes demo en el sistema */
const TOTAL_DEMO_CLIENTS = 2_180;

/* ============================================================
 * Component
 * ============================================================ */
export function DemoCrm() {
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = React.useState<string>("c1");
  const [activeRules, setActiveRules] = React.useState<Set<RuleId>>(new Set());

  const selected = React.useMemo(
    () => CUSTOMERS.find((c) => c.id === selectedId) ?? CUSTOMERS[0],
    [selectedId]
  );

  const toggleRule = (id: RuleId) => {
    setActiveRules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Live segment count — applies rules to demo customers then scales to base
  const segmentCount = React.useMemo(() => {
    if (activeRules.size === 0) return TOTAL_DEMO_CLIENTS;
    const matched = CUSTOMERS.filter((c) =>
      [...activeRules].every((rid) => RULES.find((r) => r.id === rid)?.fn(c))
    ).length;
    const ratio = matched / CUSTOMERS.length;
    return Math.max(1, Math.round(TOTAL_DEMO_CLIENTS * ratio));
  }, [activeRules]);

  return (
    <div className="rp-glass-strong rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight">
            CRM con perfil 360°
          </h3>
          <Badge variant="outline" className="border-[var(--gold)]/40 text-[var(--gold-soft)]">
            demo
          </Badge>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          2.180 clientes en base
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Customer list */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-1">
            Clientes
          </div>
          <div className="max-h-[440px] space-y-1.5 overflow-y-auto rp-scroll-thin pr-1">
            {CUSTOMERS.map((c, i) => (
              <motion.button
                key={c.id}
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors min-h-[56px]",
                  selectedId === c.id
                    ? "border-[var(--gold)]/50 bg-[var(--gold)]/[0.07]"
                    : "border-border/50 bg-foreground/[0.02] hover:bg-foreground/[0.05]"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-background",
                    AVATAR_GRADIENTS[c.id]
                  )}
                >
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{c.name}</span>
                    {c.vip && <Crown className="h-3 w-3 text-[var(--gold)]" />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{c.visits} visitas</span>
                    <span className="opacity-40">·</span>
                    <span>{c.lastVisit}</span>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-opacity",
                    selectedId === c.id ? "opacity-100 text-[var(--gold)]" : "opacity-30"
                  )}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Selected profile */}
        <div className="rounded-xl border border-border/60 bg-foreground/[0.02] p-4 sm:p-5">
          {/* Top: avatar + name + LTV */}
          <div className="flex flex-wrap items-start gap-4">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-lg font-semibold text-background",
                AVATAR_GRADIENTS[selected.id]
              )}
            >
              {selected.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-display text-lg sm:text-xl font-medium truncate">
                  {selected.name}
                </h4>
                {selected.vip && (
                  <Badge className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] hover:bg-[var(--gold)]/15">
                    <Crown className="mr-1 h-3 w-3" />
                    VIP
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{selected.visits} visitas</span>
                <span>·</span>
                <span>Última: {selected.lastVisit}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                LTV histórico
              </div>
              <div className="font-display text-2xl sm:text-3xl font-light rp-gold-text">
                €{selected.ltv.toLocaleString("es-ES")}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                Ticket medio {selected.avgTicket}€
              </div>
            </div>
          </div>

          {/* Preferences chips */}
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <PrefChip icon={AlertTriangle} label="Alérgenos" value={selected.allergens.join(", ") || "—"} />
            <PrefChip icon={Armchair} label="Mesa favorita" value={selected.favoriteTable} />
            <PrefChip icon={MapPin} label="Zona preferida" value={selected.preferredZone} />
          </div>

          {/* Birthday + notes */}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/[0.05] p-2.5 text-sm">
              <Cake className="h-4 w-4 text-[var(--teal)]" />
              <span className="text-muted-foreground">Próximo cumpleaños:</span>
              <span className="font-medium text-[var(--teal)]">
                {selected.nextBirthdayDays} días
              </span>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/[0.05] p-2.5">
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <div className="min-w-0">
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-200/80">
                  Notas internas
                </div>
                <ul className="mt-1 space-y-0.5 text-xs text-foreground/80">
                  {selected.notes.map((n, i) => (
                    <li key={i} className="truncate">
                      · {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              Historial de visitas
            </div>
            <div className="relative pl-5">
              {/* vertical line */}
              <div className="absolute left-1.5 top-1 bottom-1 w-px bg-gradient-to-b from-[var(--gold)]/40 via-border to-transparent" />
              <ul className="space-y-2.5">
                {selected.timeline.map((v, i) => (
                  <motion.li
                    key={i}
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="relative"
                  >
                    <span className="absolute -left-3.5 top-1.5 h-2 w-2 rounded-full bg-[var(--gold)] ring-2 ring-background" />
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="font-medium">{v.date}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{v.partySize} pax</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground font-mono">{v.table}</span>
                      <span className="ml-auto flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, s) => (
                          <Star
                            key={s}
                            className={cn(
                              "h-3 w-3",
                              s < v.rating
                                ? "fill-[var(--gold)] text-[var(--gold)]"
                                : "text-muted-foreground/40"
                            )}
                          />
                        ))}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Segment builder */}
      <div className="mt-5 rounded-xl border border-border/60 bg-foreground/[0.02] p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4 text-muted-foreground" />
          Constructor de segmentos
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Activa reglas para filtrar tu base de clientes. El recuento se actualiza al instante.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {RULES.map((r) => {
            const active = activeRules.has(r.id);
            return (
              <button
                key={r.id}
                onClick={() => toggleRule(r.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all min-h-[36px]",
                  active
                    ? "border-[var(--gold)]/60 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                    : "border-border/60 bg-foreground/[0.03] text-muted-foreground hover:bg-foreground/[0.07]"
                )}
                aria-pressed={active}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    active ? "bg-[var(--gold)]" : "bg-muted-foreground/40"
                  )}
                />
                {r.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border/60 bg-foreground/[0.03] px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <Utensils className="h-4 w-4 text-[var(--teal)]" />
            <span className="text-muted-foreground">Segmento resultante</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <motion.span
              key={segmentCount}
              initial={reduce ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="font-display text-2xl font-light rp-gold-text"
            >
              {segmentCount.toLocaleString("es-ES")}
            </motion.span>
            <span className="text-xs text-muted-foreground">clientes</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Datos de demostración. El CRM real sincroniza reservas, tickets, reseñas y campañas.
      </p>
    </div>
  );
}

/* ---------- Sub-components ---------- */
function PrefChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-foreground/[0.03] p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 truncate text-xs text-foreground/85">{value}</div>
    </div>
  );
}

export default DemoCrm;
