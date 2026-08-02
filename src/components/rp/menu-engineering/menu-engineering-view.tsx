"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, useReducedMotion } from "framer-motion";
import {
  Star, ArrowUpRight, Sparkles, Lightbulb, Calculator,
  TrendingUp, Filter, Utensils, Target, Crown, AlertTriangle,
  Pencil, Trash2, ChevronRight, Flame,
} from "lucide-react";
import { useInView, useEntranceProgress, CursorTooltip } from "@/components/rp/charts";

/* =========================================================
 * Types
 * =======================================================*/

export type Classification = "ESTRELLA" | "VACA" | "PUZZLE" | "PERRO";

export interface Dish {
  id: string;
  name: string;
  category: string;
  price: number; // €
  cost: number; // €
  popularity: number; // % of menu mix
  units: number; // sold in period
  classification: Classification;
}

export interface QuadrantMeta {
  id: Classification;
  label: string;
  color: string;
  bg: string;
  border: string;
  text: string;
  icon: React.ElementType;
  recommendation: string;
  actions: string[];
}

/* =========================================================
 * Mock data
 * =======================================================*/

const DISHES: Dish[] = [
  // ESTRELLA — high pop, high margin
  { id: "d1", name: "Paella Valenciana", category: "Arroces", price: 9.5, cost: 1.48, popularity: 12.0, units: 184, classification: "ESTRELLA" },
  { id: "d2", name: "Risotto Trufa Negra", category: "Pastas", price: 16, cost: 3.44, popularity: 7.5, units: 115, classification: "ESTRELLA" },
  { id: "d3", name: "Hamburguesa Clásica", category: "Casuales", price: 12.5, cost: 3.04, popularity: 14.0, units: 215, classification: "ESTRELLA" },
  { id: "d4", name: "Croquetas de Jamón", category: "Raciones", price: 8, cost: 2.1, popularity: 11.0, units: 168, classification: "ESTRELLA" },
  // VACA — high pop, low margin
  { id: "d5", name: "Patatas Bravas", category: "Raciones", price: 5.5, cost: 1.8, popularity: 13.0, units: 200, classification: "VACA" },
  { id: "d6", name: "Ensalada César", category: "Entrantes", price: 7.5, cost: 3.0, popularity: 9.0, units: 138, classification: "VACA" },
  { id: "d7", name: "Pollo Asado", category: "Carnes", price: 14, cost: 6.0, popularity: 8.0, units: 122, classification: "VACA" },
  // PUZZLE — low pop, high margin
  { id: "d8", name: "Lubina Salvaje", category: "Pescados", price: 24, cost: 6.2, popularity: 4.0, units: 61, classification: "PUZZLE" },
  { id: "d9", name: "Tartar de Atún Rojo", category: "Entrantes", price: 18, cost: 4.5, popularity: 5.0, units: 76, classification: "PUZZLE" },
  { id: "d10", name: "Cordero Asado", category: "Carnes", price: 26, cost: 6.5, popularity: 3.0, units: 46, classification: "PUZZLE" },
  { id: "d11", name: "Foie Micuit", category: "Entrantes", price: 16, cost: 3.8, popularity: 2.0, units: 31, classification: "PUZZLE" },
  // PERRO — low pop, low margin
  { id: "d12", name: "Sopa del Día", category: "Primeros", price: 6, cost: 2.8, popularity: 2.0, units: 31, classification: "PERRO" },
  { id: "d13", name: "Flan Casero", category: "Postres", price: 4.5, cost: 1.8, popularity: 4.0, units: 62, classification: "PERRO" },
  { id: "d14", name: "Ensalada Mixta", category: "Entrantes", price: 6.5, cost: 2.6, popularity: 3.0, units: 46, classification: "PERRO" },
  { id: "d15", name: "Helado Artesano", category: "Postres", price: 4, cost: 1.7, popularity: 5.0, units: 76, classification: "PERRO" },
];

const QUADRANTS: Record<
  Classification,
  QuadrantMeta
> = {
  ESTRELLA: {
    id: "ESTRELLA",
    label: "Estrella",
    color: "#10b981",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/40",
    text: "text-emerald-300",
    icon: Star,
    recommendation: "Mantener calidad, proteger visibilidad en carta.",
    actions: [
      "Mantener receta y proveedores estables",
      "Posicionar en zona alta de la carta",
      "Proteger foto y descripción",
      "Vigilar food cost semanalmente",
    ],
  },
  VACA: {
    id: "VACA",
    label: "Vaca",
    color: "#f59e0b",
    bg: "bg-amber-400/10",
    border: "border-amber-400/40",
    text: "text-amber-300",
    icon: ArrowUpRight,
    recommendation: "Subir precio 5-10%, reducir coste con escandallo.",
    actions: [
      "Subir precio +5-10% (test A/B)",
      "Renegociar proveedor o sustituir ingrediente",
      "Revisar escandallo y mermas",
      "Reducir ración sin sacrificar percepción",
    ],
  },
  PUZZLE: {
    id: "PUZZLE",
    label: "Puzzle",
    color: "var(--teal)",
    bg: "bg-[var(--teal)]/10",
    border: "border-[var(--teal)]/40",
    text: "text-[var(--teal)]",
    icon: Sparkles,
    recommendation: "Reposicionar en carta, renombrar, foto profesional, destacar.",
    actions: [
      "Mover a zona de alta visibilidad",
      "Renombrar con storytelling",
      "Foto profesional y badges",
      "Sugerir en upsell de camareros",
    ],
  },
  PERRO: {
    id: "PERRO",
    label: "Perro",
    color: "#ef4444",
    bg: "bg-rose-500/10",
    border: "border-rose-500/40",
    text: "text-rose-300",
    icon: AlertTriangle,
    recommendation: "Considerar retirar de carta o rediseñar receta.",
    actions: [
      "Marcar como candidato a retirar",
      "Rediseñar receta o presentación",
      "Si se retira, liberar 12% de la carta",
      "Revisar en 30 días antes de decidir",
    ],
  },
};

const CATEGORIES = [
  "Todas",
  "Arroces",
  "Carnes",
  "Pescados",
  "Pastas",
  "Raciones",
  "Casuales",
  "Entrantes",
  "Primeros",
  "Postres",
];

const CLASSIFICATIONS: { id: "Todas" | Classification; label: string }[] = [
  { id: "Todas", label: "Todas" },
  { id: "ESTRELLA", label: "Estrella" },
  { id: "VACA", label: "Vaca" },
  { id: "PUZZLE", label: "Puzzle" },
  { id: "PERRO", label: "Perro" },
];

/* =========================================================
 * Helpers
 * =======================================================*/

function marginEur(d: Dish): number {
  return d.price - d.cost;
}
function marginPct(d: Dish): number {
  return (d.price - d.cost) / d.price * 100;
}
function fmtEUR(n: number, decimals = 2): string {
  return n.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
function fmtPct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

/* =========================================================
 * Shared atoms
 * =======================================================*/


function SectionCard({
  title,
  desc,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  desc?: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rp-glass rounded-2xl overflow-hidden flex flex-col min-w-0", className)}>
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-foreground/[0.05] text-[var(--gold)] shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg leading-tight truncate">{title}</h2>
            {desc && <p className="text-[11px] text-muted-foreground truncate">{desc}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4 flex-1 min-w-0">{children}</div>
    </section>
  );
}

function ClassBadge({ c }: { c: Classification }) {
  const q = QUADRANTS[c];
  const Icon = q.icon;
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] uppercase tracking-wider font-mono gap-1", q.bg, q.border, q.text)}
    >
      <Icon className="h-3 w-3" />
      {q.label}
    </Badge>
  );
}

/* =========================================================
 * 4-quadrant matrix (SVG)
 * =======================================================*/

function QuadrantMatrix({ dishes }: { dishes: Dish[] }) {
  const reduce = useReducedMotion();
  const svgWrapRef = React.useRef<HTMLDivElement>(null);
  const { ref: viewRef, inView } = useInView<SVGSVGElement>({ threshold: 0.2 });
  const progress = useEntranceProgress(inView, 700);
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [mousePx, setMousePx] = React.useState<{ x: number; y: number } | null>(null);

  const width = 720;
  const height = 480;
  const padL = 56;
  const padR = 24;
  const padT = 24;
  const padB = 48;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  // Popularity scale: 0 - 15%
  const popMin = 0;
  const popMax = 15;
  const popMid = 7;
  // Margin scale: 50% - 85%
  const marMin = 50;
  const marMax = 85;
  const marMid = 70;

  function xAt(pop: number) {
    return padL + ((pop - popMin) / (popMax - popMin)) * innerW;
  }
  function yAt(mar: number) {
    return padT + innerH - ((mar - marMin) / (marMax - marMin)) * innerH;
  }

  const xMid = xAt(popMid);
  const yMid = yAt(marMid);

  // Max units for bubble sizing
  const maxUnits = Math.max(...DISHES.map((d) => d.units));

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setMousePx({ x: px, y: py });
  }

  const hovered = hoverId != null ? DISHES.find((d) => d.id === hoverId) ?? null : null;
  const visibleSet = new Set(dishes.map((d) => d.id));

  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-display text-base sm:text-lg">Matriz popularidad × rentabilidad</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Burbuja = plato · tamaño = volumen · color = cuadrante
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          {(Object.keys(QUADRANTS) as Classification[]).map((q) => {
            const m = QUADRANTS[q];
            const Icon = m.icon;
            return (
              <span
                key={q}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 border",
                  m.bg,
                  m.border,
                  m.text
                )}
              >
                <Icon className="h-3 w-3" />
                {m.label}
              </span>
            );
          })}
        </div>
      </div>

      <div
        ref={svgWrapRef}
        className="relative overflow-x-auto rp-scroll-thin -mx-1"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <svg
          ref={viewRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[680px]"
          role="img"
          aria-label="Matriz menu engineering"
          onMouseMove={onMove}
          onMouseLeave={() => {
            setHoverId(null);
            setMousePx(null);
          }}
        >
          {/* Quadrant backgrounds */}
          <rect
            x={padL}
            y={padT}
            width={xMid - padL}
            height={yMid - padT}
            fill="var(--teal)"
            fillOpacity={0.06}
          />
          <rect
            x={xMid}
            y={padT}
            width={padL + innerW - xMid}
            height={yMid - padT}
            fill="#10b981"
            fillOpacity={0.06}
          />
          <rect
            x={padL}
            y={yMid}
            width={xMid - padL}
            height={padT + innerH - yMid}
            fill="#ef4444"
            fillOpacity={0.06}
          />
          <rect
            x={xMid}
            y={yMid}
            width={padL + innerW - xMid}
            height={padT + innerH - yMid}
            fill="#f59e0b"
            fillOpacity={0.06}
          />

          {/* Quadrant labels */}
          <text x={padL + 8} y={padT + 18} className="fill-[var(--teal)] font-mono" fontSize="11" fontWeight="600">
            PUZZLE
          </text>
          <text x={padL + 8} y={padT + 32} className="fill-muted-foreground font-mono" fontSize="9">
            baja pop · alta magen
          </text>
          <text x={padL + innerW - 8} y={padT + 18} textAnchor="end" className="fill-emerald-300 font-mono" fontSize="11" fontWeight="600">
            ESTRELLA
          </text>
          <text x={padL + innerW - 8} y={padT + 32} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="9">
            alta pop · alta magen
          </text>
          <text x={padL + 8} y={padT + innerH - 8} className="fill-rose-300 font-mono" fontSize="11" fontWeight="600">
            PERRO
          </text>
          <text x={padL + 8} y={padT + innerH - 22} className="fill-muted-foreground font-mono" fontSize="9">
            baja pop · baja magen
          </text>
          <text x={padL + innerW - 8} y={padT + innerH - 8} textAnchor="end" className="fill-amber-300 font-mono" fontSize="11" fontWeight="600">
            VACA
          </text>
          <text x={padL + innerW - 8} y={padT + innerH - 22} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="9">
            alta pop · baja magen
          </text>

          {/* Median lines */}
          <line
            x1={xMid}
            x2={xMid}
            y1={padT}
            y2={padT + innerH}
            stroke="currentColor"
            className="text-foreground/30"
            strokeDasharray="4 4"
          />
          <line
            x1={padL}
            x2={padL + innerW}
            y1={yMid}
            y2={yMid}
            stroke="currentColor"
            className="text-foreground/30"
            strokeDasharray="4 4"
          />

          {/* Y axis ticks */}
          {[50, 60, 70, 80, 85].map((t) => {
            const y = yAt(t);
            return (
              <g key={t}>
                <line x1={padL - 4} x2={padL} y1={y} y2={y} stroke="currentColor" className="text-foreground/30" />
                <text x={padL - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="9">
                  {t}%
                </text>
              </g>
            );
          })}
          <text
            x={16}
            y={padT + innerH / 2}
            textAnchor="middle"
            className="fill-muted-foreground font-mono"
            fontSize="10"
            transform={`rotate(-90 16 ${padT + innerH / 2})`}
          >
            Margen %
          </text>

          {/* X axis ticks */}
          {[0, 5, 7, 10, 15].map((t) => {
            const x = xAt(t);
            return (
              <g key={t}>
                <line x1={x} x2={x} y1={padT + innerH} y2={padT + innerH + 4} stroke="currentColor" className="text-foreground/30" />
                <text x={x} y={padT + innerH + 16} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="9">
                  {t}%
                </text>
              </g>
            );
          })}
          <text
            x={padL + innerW / 2}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-foreground font-mono"
            fontSize="10"
          >
            Popularidad (% del mix de carta)
          </text>

          {/* Bubbles */}
          {DISHES.map((d, i) => {
            const x = xAt(d.popularity);
            const y = yAt(marginPct(d));
            const r = 8 + (d.units / maxUnits) * 18;
            const q = QUADRANTS[d.classification];
            const dim = !visibleSet.has(d.id) ? 0.15 : hoverId != null && hoverId !== d.id ? 0.35 : 1;
            return (
              <motion.circle
                key={d.id}
                cx={x}
                cy={y}
                r={r}
                fill={q.color}
                fillOpacity={0.45 * dim * progress}
                stroke={q.color}
                strokeWidth={hoverId === d.id ? 2.5 : 1.5}
                strokeOpacity={dim * progress}
                initial={reduce ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: dim }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
                style={{ transformOrigin: `${x}px ${y}px`, transformBox: "view-box", cursor: "pointer" } as React.CSSProperties}
                onMouseEnter={() => {
                  setHoverId(d.id);
                }}
                onMouseLeave={() => {
                  setHoverId(null);
                  setMousePx(null);
                }}
              />
            );
          })}
        </svg>

        {hovered && mousePx && (
          <CursorTooltip
            position={{ x: mousePx.x, y: mousePx.y }}
            containerRef={svgWrapRef}
            estimatedSize={{ width: 220, height: 140 }}
          >
            <div className="min-w-[180px] space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{hovered.name}</span>
                <ClassBadge c={hovered.classification} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {hovered.category} · {hovered.units} uds vendidas
              </div>
              <div className="h-px bg-border/40 my-1" />
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] font-mono">
                <span className="text-muted-foreground">Precio</span>
                <span className="text-right tabular-nums">{fmtEUR(hovered.price)}</span>
                <span className="text-muted-foreground">Coste</span>
                <span className="text-right tabular-nums">{fmtEUR(hovered.cost)}</span>
                <span className="text-muted-foreground">Margen €</span>
                <span className="text-right tabular-nums text-[var(--gold-soft)]">{fmtEUR(marginEur(hovered))}</span>
                <span className="text-muted-foreground">Margen %</span>
                <span className="text-right tabular-nums text-[var(--gold-soft)]">{fmtPct(marginPct(hovered))}</span>
                <span className="text-muted-foreground">Popularidad</span>
                <span className="text-right tabular-nums text-[var(--teal)]">{fmtPct(hovered.popularity)}</span>
              </div>
            </div>
          </CursorTooltip>
        )}
      </div>
    </div>
  );
}

/* =========================================================
 * Dish table
 * =======================================================*/

function DishTable({ dishes }: { dishes: Dish[] }) {
  return (
    <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
      <table className="w-full min-w-[920px] text-sm border-separate border-spacing-0">
        <thead>
          <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <th className="py-2 pr-3 font-normal">Plato</th>
            <th className="py-2 px-2 font-normal">Cat.</th>
            <th className="py-2 px-2 font-normal text-right">Precio</th>
            <th className="py-2 px-2 font-normal text-right">Coste</th>
            <th className="py-2 px-2 font-normal text-right">Margen €</th>
            <th className="py-2 px-2 font-normal text-right">Margen %</th>
            <th className="py-2 px-2 font-normal text-right">Pop.</th>
            <th className="py-2 px-2 font-normal text-right">Uds.</th>
            <th className="py-2 pl-2 font-normal">Clasif.</th>
            <th className="py-2 pl-2 font-normal">Acción</th>
          </tr>
        </thead>
        <tbody>
          {dishes.map((d) => {
            const q = QUADRANTS[d.classification];
            return (
              <tr
                key={d.id}
                className="border-t border-border/30 hover:bg-foreground/[0.02]"
              >
                <td className="py-2 pr-3 font-medium">{d.name}</td>
                <td className="py-2 px-2 text-muted-foreground text-xs">{d.category}</td>
                <td className="py-2 px-2 text-right font-mono tabular-nums">{fmtEUR(d.price)}</td>
                <td className="py-2 px-2 text-right font-mono tabular-nums text-muted-foreground">{fmtEUR(d.cost)}</td>
                <td className="py-2 px-2 text-right font-mono tabular-nums text-[var(--gold-soft)]">{fmtEUR(marginEur(d))}</td>
                <td className="py-2 px-2 text-right font-mono tabular-nums">
                  <span className={cn(
                    marginPct(d) >= 70 ? "text-emerald-300" : marginPct(d) >= 60 ? "text-amber-300" : "text-rose-300"
                  )}>
                    {fmtPct(marginPct(d))}
                  </span>
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums">
                  <span className={cn(
                    d.popularity >= 7 ? "text-[var(--teal)]" : "text-muted-foreground"
                  )}>
                    {fmtPct(d.popularity)}
                  </span>
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums">{d.units}</td>
                <td className="py-2 pl-2">
                  <ClassBadge c={d.classification} />
                </td>
                <td className="py-2 pl-2 text-[11px] text-muted-foreground leading-tight">
                  {q.recommendation}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
 * Action recommendations per quadrant
 * =======================================================*/

function QuadrantRecommendations() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {(Object.keys(QUADRANTS) as Classification[]).map((c) => {
        const q = QUADRANTS[c];
        const Icon = q.icon;
        const dishesInQ = DISHES.filter((d) => d.classification === c);
        return (
          <div
            key={c}
            className={cn("rounded-xl border p-4", q.border, q.bg)}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center bg-foreground/[0.06] shrink-0", q.text)}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={cn("font-display text-base", q.text)}>{q.label}</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider">
                {dishesInQ.length} platos
              </Badge>
            </div>
            <p className="text-[12px] text-foreground/80 mb-2 leading-snug">
              {q.recommendation}
            </p>
            <ul className="space-y-1">
              {q.actions.map((a, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <ChevronRight className={cn("h-3 w-3 mt-0.5 shrink-0", q.text)} />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * Impact calculator
 * =======================================================*/

function ImpactCalculator() {
  const { toast } = useToast();
  const [pct, setPct] = React.useState(8);
  const vacas = DISHES.filter((d) => d.classification === "VACA");
  const monthlyUnits = vacas.reduce((acc, d) => acc + d.units, 0);
  const extraRevenue = vacas.reduce((acc, d) => acc + (d.price * pct) / 100 * d.units, 0);
  const extraMargin = extraRevenue; // pure price increase = pure margin increase

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Subida de precio en vacas
          </label>
          <span className="font-display text-lg tabular-nums text-[var(--gold-soft)]">
            +{pct}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={15}
          step={1}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          className="w-full accent-[var(--gold)]"
          aria-label="Subida de precio en vacas (%)"
        />
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mt-1">
          <span>0%</span>
          <span>8% (recomendado)</span>
          <span>15%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border/40 bg-foreground/[0.03] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Vaca afectadas
          </div>
          <div className="font-display text-lg tabular-nums">{vacas.length}</div>
        </div>
        <div className="rounded-lg border border-border/40 bg-foreground/[0.03] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Uds/mes
          </div>
          <div className="font-display text-lg tabular-nums">{monthlyUnits}</div>
        </div>
        <div className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/[0.06] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
            Margen extra/mes
          </div>
          <div className="font-display text-lg tabular-nums text-[var(--gold-soft)]">
            +{fmtEUR(extraMargin, 0)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
        <span className="text-foreground font-medium">Proyección:</span> aplicar +{pct}% a las
        {" "}{vacas.length} vacas (que representan {monthlyUnits} uds/mes) generaría{" "}
        <span className="text-[var(--gold-soft)] font-mono">+{fmtEUR(extraMargin, 0)}/mes</span>{" "}
        de margen adicional sin coste extra. Anualizado:{" "}
        <span className="text-[var(--gold-soft)] font-mono">+{fmtEUR(extraMargin * 12, 0)}/año</span>.
      </div>

      <Button
        className="w-full bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-11"
        onClick={() =>
          toast({
            title: "Campaña de precios creada",
            description: `Subida +${pct}% en ${vacas.length} vacas proyectada: +${fmtEUR(extraMargin, 0)}/mes.`,
          })
        }
      >
        <Calculator className="h-4 w-4" /> Aplicar subida +{pct}%
      </Button>
    </div>
  );
}

/* =========================================================
 * AI suggestion
 * =======================================================*/

function AiSuggestion() {
  const perros = DISHES.filter((d) => d.classification === "PERRO");
  const totalPop = DISHES.reduce((acc, d) => acc + d.popularity, 0);
  const perrosPop = perros.reduce((acc, d) => acc + d.popularity, 0);
  const liberacionPct = (perrosPop / totalPop * 100).toFixed(0);

  return (
    <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-[var(--teal)]/15 text-[var(--teal)] shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-[var(--teal)] mb-1">
            Sugerencia IA · {perros.length} platos perro candidatos a retirar
          </div>
          <div className="text-[12px] text-muted-foreground leading-relaxed">
            Retirar <span className="text-foreground">{perros.map((d) => d.name).join(", ")}</span>{" "}
            liberaría el <span className="text-[var(--gold-soft)] font-mono">{liberacionPct}%</span>{" "}
            de la carta para novedades de mayor margen. Recomendación: revisar en 30 días
            con datos de temporada antes de decidir.
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {perros.map((d) => (
              <Badge
                key={d.id}
                variant="outline"
                className="border-rose-500/40 bg-rose-500/10 text-rose-300 text-[10px] gap-1"
              >
                <Trash2 className="h-3 w-3" />
                {d.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/

export function MenuEngineeringView() {
  const { toast } = useToast();
  const [catFilter, setCatFilter] = React.useState<string>("Todas");
  const [classFilter, setClassFilter] = React.useState<"Todas" | Classification>("Todas");

  const filtered = React.useMemo(() => {
    return DISHES.filter((d) => {
      if (catFilter !== "Todas" && d.category !== catFilter) return false;
      if (classFilter !== "Todas" && d.classification !== classFilter) return false;
      return true;
    });
  }, [catFilter, classFilter]);

  const totalUnits = DISHES.reduce((acc, d) => acc + d.units, 0);
  const totalRevenue = DISHES.reduce((acc, d) => acc + d.price * d.units, 0);
  const totalMargin = DISHES.reduce((acc, d) => acc + marginEur(d) * d.units, 0);

  const countByClass = (c: Classification) => DISHES.filter((d) => d.classification === c).length;

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Menu Engineering
            </h1>
            
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Matriz de popularidad × rentabilidad conectada a escandallos. Clasifica cada
            plato y recomienda acción inmediata. Datos demo · navegable.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Carta exportada",
                description: "PDF con matriz, tabla y recomendaciones por cuadrante.",
              })
            }
            className="min-h-11"
          >
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar carta</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
          <Button
            onClick={() =>
              toast({
                title: "Plan de acción creado",
                description: "Tareas asignadas: 4 vacas a revisar precio, 4 perros a observar 30 días.",
              })
            }
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-11"
          >
            <Pencil className="h-4 w-4" /> Generar plan
          </Button>
        </div>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rp-glass rounded-xl p-4 min-w-0">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Platos analizados</div>
          <div className="font-display text-2xl tabular-nums mt-1">{DISHES.length}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{countByClass("ESTRELLA")}★ · {countByClass("VACA")}▲ · {countByClass("PUZZLE")}◆ · {countByClass("PERRO")}●</div>
        </div>
        <div className="rp-glass rounded-xl p-4 min-w-0">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Uds. vendidas</div>
          <div className="font-display text-2xl tabular-nums mt-1">{totalUnits.toLocaleString("es-ES")}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">en el periodo</div>
        </div>
        <div className="rp-glass rounded-xl p-4 min-w-0">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Facturación</div>
          <div className="font-display text-2xl tabular-nums mt-1 text-[var(--gold-soft)]">{fmtEUR(totalRevenue, 0)}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">bruta del periodo</div>
        </div>
        <div className="rp-glass rounded-xl p-4 min-w-0">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Margen total</div>
          <div className="font-display text-2xl tabular-nums mt-1 text-[var(--teal)]">{fmtEUR(totalMargin, 0)}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{((totalMargin / totalRevenue) * 100).toFixed(1)}% sobre facturación</div>
        </div>
      </div>

      {/* Matrix */}
      <QuadrantMatrix dishes={filtered} />

      {/* AI suggestion */}
      <AiSuggestion />

      {/* Recommendations */}
      <SectionCard
        title="Recomendaciones por cuadrante"
        desc="4 categorías · acción recomendada + checklist"
        icon={Target}
      >
        <QuadrantRecommendations />
      </SectionCard>

      {/* Filters + table + impact calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] gap-4">
        <SectionCard
          title="Tabla de platos"
          desc={`${filtered.length} platos · ${DISHES.length} totales`}
          icon={Utensils}
          action={
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs" aria-label="Categoría">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={classFilter} onValueChange={(v) => setClassFilter(v as "Todas" | Classification)}>
                <SelectTrigger className="h-8 w-[120px] text-xs" aria-label="Clasificación">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSIFICATIONS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        >
          <DishTable dishes={filtered} />
        </SectionCard>

        <SectionCard
          title="Calculadora de impacto"
          desc="Subir precio en vacas → margen extra"
          icon={Calculator}
        >
          <ImpactCalculator />
        </SectionCard>
      </div>

      {/* Footer note */}
      <div className="rp-glass rounded-2xl p-4 flex items-start gap-3">
        <Flame className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Metodología:</span> cada plato se
          clasifica comparando su popularidad (% del mix de carta, mediana 7%) y margen %
          (mediana 70%) contra el resto de la carta. La matriz se alimenta automáticamente
          de los <span className="text-foreground">escandallos</span> y del TPV — no requiere
          introducción manual de datos.
        </div>
      </div>
    </div>
  );
}
