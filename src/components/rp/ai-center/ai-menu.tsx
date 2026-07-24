"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Sparkles, TrendingUp, TrendingDown, Minus, Star, DollarSign,
  AlertTriangle, Package, Brain, Lightbulb, Zap, ArrowRight,
  Utensils, Wine, GlassWater, Cake, Salad, ShoppingCart,
  Check, X, ChevronRight, BarChart3, Target, Percent, Receipt,
  ThumbsUp, ThumbsDown, Eye, Clock,
} from "lucide-react";

/* ============================================================
   Types
============================================================ */

type MenuCategory = "starters" | "mains" | "desserts" | "drinks" | "wine" | "cocktails";
type MenuItemStatus = "star" | "profitable" | "popular_low_margin" | "problematic" | "underutilized";

interface MenuItemAnalysis {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;        // cents
  cost: number;         // cents
  margin: number;       // percentage
  popularity: number;   // orders last 30 days
  revenue: number;      // cents last 30 days
  rating: number | null; // 1-5 or null
  status: MenuItemStatus;
  aiRecommendation: string;
  crossSellCandidates: string[];
  trend: "up" | "down" | "stable";
  reasoning?: string;
  monthlySales?: number[];
}

interface AiRecommendation {
  id: string;
  title: string;
  impact: string;
  impactTone: "positive" | "neutral";
  confidence: number;
  category: "price" | "menu" | "promo" | "combo" | "replace" | "autosuggest";
  reasoning: string;
  data: string[];
}

interface CrossSellSuggestion {
  id: string;
  itemA: string;
  itemB: string;
  affinity: number;
  comboPrice: number; // cents
  saving: number;     // cents
  impact: string;
}

/* ============================================================
   Demo data
============================================================ */

const CATEGORY_META: Record<MenuCategory, { label: string; cls: string; icon: React.ElementType }> = {
  starters: { label: "Entrantes", cls: "border-amber-400/45 bg-amber-400/12 text-amber-300", icon: Salad },
  mains: { label: "Principales", cls: "border-[var(--gold)]/45 bg-[var(--gold)]/12 text-[var(--gold-soft)]", icon: Utensils },
  desserts: { label: "Postres", cls: "border-[var(--teal)]/45 bg-[var(--teal)]/12 text-[var(--teal)]", icon: Cake },
  drinks: { label: "Bebidas", cls: "border-sky-400/40 bg-sky-400/10 text-sky-300", icon: GlassWater },
  wine: { label: "Vinos", cls: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300", icon: Wine },
  cocktails: { label: "Cócteles", cls: "border-pink-400/45 bg-pink-400/12 text-pink-300", icon: GlassWater },
};

const STATUS_META: Record<MenuItemStatus, { label: string; emoji: string; cls: string }> = {
  star: { label: "Estrella", emoji: "⭐", cls: "border-emerald-400/45 bg-emerald-400/12 text-emerald-300" },
  profitable: { label: "Rentable", emoji: "💰", cls: "border-[var(--teal)]/45 bg-[var(--teal)]/12 text-[var(--teal)]" },
  popular_low_margin: { label: "Popular bajo margen", emoji: "⚠", cls: "border-amber-400/45 bg-amber-400/12 text-amber-300" },
  problematic: { label: "Problemático", emoji: "❌", cls: "border-destructive/50 bg-destructive/12 text-destructive" },
  underutilized: { label: "Infrautilizado", emoji: "📦", cls: "border-foreground/25 bg-foreground/8 text-muted-foreground" },
};

const DEMO_ITEMS: MenuItemAnalysis[] = [
  {
    id: "i1", name: "Risotto trufa", category: "mains", price: 2800, cost: 784, margin: 72,
    popularity: 89, revenue: 249200, rating: 4.8, status: "star", trend: "up",
    aiRecommendation: "Plato estrella. Considerar versión premium",
    crossSellCandidates: ["i10"], reasoning: "Margen 72% y popularidad alta. Tendencia ascendente (+18% últimos 30 días). Rating 4.8★ indica alta satisfacción. Existe demanda para una versión premium con trufa fresca.",
    monthlySales: [42, 48, 51, 55, 62, 68, 71, 75, 78, 82, 85, 89],
  },
  {
    id: "i2", name: "Solomillo wagyu", category: "mains", price: 4500, cost: 1440, margin: 68,
    popularity: 67, revenue: 301500, rating: 4.9, status: "star", trend: "up",
    aiRecommendation: "Mantener precio. Alta rentabilidad",
    crossSellCandidates: ["i10"], reasoning: "Margen 68% sobre precio premium. Rating 4.9★ (el más alto de la carta). Tendencia al alza. Cross-sell natural con vinos tintos (78% afinidad con Rioja Reserva).",
    monthlySales: [38, 41, 44, 47, 51, 54, 57, 60, 62, 64, 65, 67],
  },
  {
    id: "i3", name: "Tartar atún", category: "starters", price: 1800, cost: 450, margin: 75,
    popularity: 45, revenue: 81000, rating: 4.6, status: "profitable", trend: "stable",
    aiRecommendation: "Buen margen. Promocionar más",
    crossSellCandidates: ["i1"], reasoning: "Margen 75% (el mejor de entrantes). Popularidad moderada pero estable. Recomendado promocionar en menú degustación y como entrante estrella.",
    monthlySales: [40, 42, 41, 43, 44, 45, 45, 46, 45, 44, 45, 45],
  },
  {
    id: "i4", name: "Hamburguesa classic", category: "mains", price: 1400, cost: 910, margin: 35,
    popularity: 142, revenue: 198800, rating: 4.2, status: "popular_low_margin", trend: "down",
    aiRecommendation: "Popular pero bajo margen. Subir €2 o reducir coste ingredientes",
    crossSellCandidates: ["i5"], reasoning: "El plato más pedido (142 pedidos) pero con margen del 35% (muy bajo). Coste ingredientes 65% del precio. Subir €2 aumentaría margen a 49% sin impacto estimado en demanda. Alternativa: renegociar proveedor carne (-€0.40/ración).",
    monthlySales: [165, 162, 158, 155, 152, 150, 148, 146, 144, 143, 142, 142],
  },
  {
    id: "i5", name: "Patatas bravas", category: "starters", price: 800, cost: 480, margin: 40,
    popularity: 156, revenue: 124800, rating: 4.0, status: "popular_low_margin", trend: "stable",
    aiRecommendation: "Infrautilizado como entrante. Considerar versión premium",
    crossSellCandidates: ["i4"], reasoning: "El entrante más vendido pero con margen bajo (40%). Considerar versión premium con alioli trufado a €12 (margen proyectado 60%). Aparece en el 82% de pedidos con hamburguesa.",
    monthlySales: [150, 152, 154, 155, 156, 157, 156, 156, 155, 156, 156, 156],
  },
  {
    id: "i6", name: "Sopa del día", category: "starters", price: 900, cost: 630, margin: 30,
    popularity: 12, revenue: 10800, rating: 3.5, status: "problematic", trend: "down",
    aiRecommendation: "Eliminar del menú o reformular",
    crossSellCandidates: [], reasoning: "Solo 12 pedidos en 30 días, rating 3.5★ (el más bajo), margen 30%. Tendencia a la baja. Ocupa espacio en carta sin generar rentabilidad. Recomendado eliminar o reformular como 'crema del día' premium.",
    monthlySales: [25, 22, 20, 18, 16, 15, 14, 13, 13, 12, 12, 12],
  },
  {
    id: "i7", name: "Tiramisú casero", category: "desserts", price: 800, cost: 176, margin: 78,
    popularity: 98, revenue: 78400, rating: 4.7, status: "star", trend: "up",
    aiRecommendation: "Postre estrella. Cross-sell con café",
    crossSellCandidates: [], reasoning: "Mejor margen de postres (78%). Popularidad alta y creciente. Rating 4.7★. Cross-sell natural con café (65% afinidad). Recomendado combo postre+café €10.",
    monthlySales: [62, 68, 72, 76, 80, 84, 88, 90, 92, 94, 96, 98],
  },
  {
    id: "i8", name: "Cheesecake", category: "desserts", price: 700, cost: 196, margin: 72,
    popularity: 67, revenue: 46900, rating: 4.3, status: "profitable", trend: "stable",
    aiRecommendation: "Buen margen. Promocionar tras principales",
    crossSellCandidates: [], reasoning: "Margen 72% y popularidad estable. Sugerencia: posicionar en carta digital como sugerencia tras platos principales para aumentar conversión en postres.",
    monthlySales: [60, 62, 63, 64, 65, 66, 67, 67, 67, 67, 67, 67],
  },
  {
    id: "i9", name: "Panna cotta", category: "desserts", price: 700, cost: 210, margin: 70,
    popularity: 18, revenue: 12600, rating: 3.8, status: "underutilized", trend: "down",
    aiRecommendation: "Infrautilizado. Reemplazar o promocionar",
    crossSellCandidates: [], reasoning: "Solo 18 pedidos (vs 98 tiramisú). Rating 3.8★. Margen 70% (bueno) pero sin demanda. Recomendado reemplazar por 'Crema catalana' (proyección +€90/mes) o promocionar activamente.",
    monthlySales: [30, 28, 26, 24, 22, 21, 20, 19, 19, 18, 18, 18],
  },
  {
    id: "i10", name: "Vino Rioja Reserva", category: "wine", price: 3200, cost: 1120, margin: 65,
    popularity: 78, revenue: 249600, rating: 4.8, status: "star", trend: "up",
    aiRecommendation: "Vino estrella. Cross-sell con solomillo",
    crossSellCandidates: ["i2"], reasoning: "Vino con mayor facturación. 78% afinidad con solomillo wagyu. Combo solomillo+vino a €72 (ahorro €5) proyecta +€340/mes. Mantener precio y priorizar en upselling de carne.",
    monthlySales: [50, 55, 58, 62, 65, 68, 70, 72, 74, 75, 77, 78],
  },
  {
    id: "i11", name: "Gin-tonic premium", category: "cocktails", price: 1200, cost: 660, margin: 45,
    popularity: 112, revenue: 134400, rating: 4.5, status: "popular_low_margin", trend: "stable",
    aiRecommendation: "Popular, subir €1",
    crossSellCandidates: [], reasoning: "Cóctel más vendido. Margen 45% por debajo de la media de barra (55%). Subida €1 aumentaría margen a 52% sin impacto estimado en demanda (elasticidad -0.3).",
    monthlySales: [105, 108, 110, 111, 112, 112, 112, 112, 112, 112, 112, 112],
  },
  {
    id: "i12", name: "Agua mineral", category: "drinks", price: 200, cost: 30, margin: 85,
    popularity: 234, revenue: 46800, rating: null, status: "profitable", trend: "stable",
    aiRecommendation: "Alto volumen. Auto-suggest en reservas",
    crossSellCandidates: [], reasoning: "El producto más vendido (234 uds). Margen 85% (el más alto de la carta). Recomendado auto-suggest 'agua para la mesa' en flujo de reserva online. Proyección +€94/mes.",
    monthlySales: [220, 225, 228, 230, 232, 233, 234, 234, 234, 234, 234, 234],
  },
];

const REVENUE_BY_CATEGORY: { category: MenuCategory; revenue: number }[] = [
  { category: "mains", revenue: 749500 },
  { category: "wine", revenue: 249600 },
  { category: "starters", revenue: 216600 },
  { category: "cocktails", revenue: 134400 },
  { category: "desserts", revenue: 137900 },
  { category: "drinks", revenue: 46800 },
];

const PRICE_OPTIMIZATIONS = [
  { id: "po1", item: "Hamburguesa classic", current: 1400, suggested: 1600, impact: "+€284/mes", confidence: 88 },
  { id: "po2", item: "Gin-tonic premium", current: 1200, suggested: 1300, impact: "+€112/mes", confidence: 85 },
  { id: "po3", item: "Patatas bravas", current: 800, suggested: 1000, impact: "+€156/mes", confidence: 72 },
];

const RECOMMENDATIONS: AiRecommendation[] = [
  {
    id: "r1", title: "Subir precio Hamburguesa €14→€16", impact: "+€284/mes", impactTone: "positive", confidence: 88,
    category: "price", reasoning: "La hamburguesa es el 2º plato más pedido pero tiene margen 35%. La elasticidad-precio estimada es -0.3 (baja sensibilidad). Subir €2 llevaría margen a 49% con caída de demanda estimada <5%. Impacto neto: +€284/mes.",
    data: ["Demanda actual: 142 pedidos", "Margen actual: 35% → 49%", "Caída estimada: -7 pedidos", "Impacto neto: +€284/mes", "Confianza: 88% (basado en 6 cambios de precio históricos)"],
  },
  {
    id: "r2", title: "Eliminar Sopa del día", impact: "+€0 (libera espacio carta)", impactTone: "neutral", confidence: 92,
    category: "menu", reasoning: "Solo 12 pedidos/mes, rating 3.5★ (mínimo de la carta), tendencia bajando. Ocupa espacio mental y operativo. Eliminar libera cocina y simplifica carta. Reemplazo no inmediato.",
    data: ["Demanda: 12 pedidos/mes (mínimo carta)", "Rating: 3.5★ (mínimo carta)", "Tendencia: -52% últimos 90 días", "Ingreso perdido: €108/mes (despreciable)", "Espacio en carta liberado: 1 slot"],
  },
  {
    id: "r3", title: "Promocionar Tartar atún como entrante estrella", impact: "+€180/mes", impactTone: "positive", confidence: 75,
    category: "promo", reasoning: "Tartar tiene el mejor margen de entrantes (75%) pero solo 45 pedidos (vs 156 patatas). Promoción en carta digital y sugerencia de camareros proyecta +25 pedidos/mes. Margen 75% → +€180/mes.",
    data: ["Demanda actual: 45 pedidos", "Demanda proyectada: 70 pedidos (+25)", "Margen: 75% (mejor entrante)", "Ingreso adicional: €450/mes", "Coste promoción: €0 (carta digital)"],
  },
  {
    id: "r4", title: "Combo: Solomillo + Rioja Reserva (-€5)", impact: "+€340/mes", impactTone: "positive", confidence: 82,
    category: "combo", reasoning: "78% afinidad entre solomillo y Rioja Reserva. Combo a €72 (vs €77 por separado) incentiva upselling de vino. Aumento estimado de conversión de vino: +18%. Impacto neto tras descuento: +€340/mes.",
    data: ["Afinidad: 78% (más alta de la carta)", "Precio combo: €72 (ahorro €5)", "Conversión vino actual: 41% → 59%", "Pedidos combo proyectados: 24/mes", "Impacto neto: +€340/mes"],
  },
  {
    id: "r5", title: "Reemplazar Panna cotta por Crema catalana", impact: "+€90/mes", impactTone: "positive", confidence: 68,
    category: "replace", reasoning: "Panna cotta: 18 pedidos, rating 3.8★. Crema catalana tiene mejor percepción en mercado local y proyección de 38 pedidos/mes. Margen similar (70% → 72%).",
    data: ["Panna cotta: 18 pedidos, 3.8★", "Crema catalana proyectada: 38 pedidos", "Margen: 70% → 72%", "Diferencial de demanda: +20 pedidos", "Impacto: +€90/mes"],
  },
  {
    id: "r6", title: "Subir Gin-tonic €12→€13", impact: "+€112/mes", impactTone: "positive", confidence: 85,
    category: "price", reasoning: "Gin-tonic es el cóctel más vendido (112 uds) con margen 45% (bajo barra). Elasticidad -0.3. Subida €1 llevaría margen a 52% con caída <4 pedidos.",
    data: ["Demanda actual: 112 pedidos", "Margen actual: 45% → 52%", "Caída estimada: -4 pedidos", "Impacto neto: +€112/mes", "Confianza: 85%"],
  },
  {
    id: "r7", title: "Auto-suggest Agua mineral en reservas online", impact: "+€94/mes", impactTone: "positive", confidence: 90,
    category: "autosuggest", reasoning: "Agua mineral: margen 85% (más alto de la carta). Solo 60% de reservas online añaden agua. Auto-suggest en checkout proyecta +47 uds/mes. Margen 85% → +€94/mes.",
    data: ["Reservas online/mes: 380", "Conversión agua actual: 60% → 72%", "Pedidos adicionales: +47", "Margen: 85%", "Impacto: +€94/mes", "Coste implementación: 0 (ya en plan)"],
  },
  {
    id: "r8", title: "Cross-sell Tiramisú + café post-cena", impact: "+€78/mes", impactTone: "positive", confidence: 78,
    category: "combo", reasoning: "Tiramisú es postre estrella (98 uds). Afinidad con café 65%. Combo €10 (postre+café) en servicio de cena proyecta +39 combos/mes. Margen combinado 70%.",
    data: ["Tiramisú: 98 pedidos/mes", "Afinidad tiramisú-café: 65%", "Combos proyectados: 39/mes", "Precio combo: €10", "Impacto: +€78/mes"],
  },
];

const CROSS_SELL_SUGGESTIONS: CrossSellSuggestion[] = [
  { id: "cs1", itemA: "Solomillo wagyu", itemB: "Vino Rioja Reserva", affinity: 78, comboPrice: 7200, saving: 500, impact: "+€340/mes" },
  { id: "cs2", itemA: "Hamburguesa classic", itemB: "Patatas bravas", affinity: 82, comboPrice: 2000, saving: 200, impact: "+€156/mes" },
  { id: "cs3", itemA: "Tiramisú casero", itemB: "Café (post-cena)", affinity: 65, comboPrice: 1000, saving: 0, impact: "+€78/mes" },
];

// 8x8 affinity matrix (symmetric). Rows/cols: top 8 items by revenue.
const MATRIX_ITEMS = ["Solomillo wagyu", "Vino Rioja Reserva", "Risotto trufa", "Hamburguesa classic", "Gin-tonic premium", "Patatas bravas", "Tartar atún", "Tiramisú casero"];
const AFFINITY_MATRIX: number[][] = [
  [100, 78, 42, 18, 22, 12, 28, 35],
  [78, 100, 48, 14, 26, 10, 30, 22],
  [42, 48, 100, 24, 18, 32, 55, 40],
  [18, 14, 24, 100, 28, 82, 16, 20],
  [22, 26, 18, 28, 100, 20, 14, 30],
  [12, 10, 32, 82, 20, 100, 18, 15],
  [28, 30, 55, 16, 14, 18, 100, 25],
  [35, 22, 40, 20, 30, 15, 25, 100],
];

/* ============================================================
   Helpers
============================================================ */

function euro(cents: number): string {
  return `€${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

/* ============================================================
   Shared sub-components
============================================================ */

function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      demo
    </span>
  );
}

function CategoryBadge({ category }: { category: MenuCategory }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", meta.cls)}>
      <Icon className="h-3 w-3" aria-hidden />
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }: { status: MenuItemStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", meta.cls)}>
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}

function TrendArrow({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return (
    <span className="inline-flex items-center gap-0.5 text-emerald-300 text-xs" title="Tendencia al alza">
      <TrendingUp className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
  if (trend === "down") return (
    <span className="inline-flex items-center gap-0.5 text-destructive text-xs" title="Tendencia a la baja">
      <TrendingDown className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-muted-foreground text-xs" title="Tendencia estable">
      <Minus className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
}

function RatingStars({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-xs text-muted-foreground font-mono">N/A</span>;
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" aria-hidden />
      <span className="font-mono text-foreground/80">{rating.toFixed(1)}</span>
    </span>
  );
}

function SectionLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      <Icon className="h-3 w-3" aria-hidden />
      {children}
    </div>
  );
}

/* ============================================================
   Margin gauge (mini SVG)
============================================================ */

function MarginGauge({ cost, price, margin }: { cost: number; price: number; margin: number }) {
  const w = 100;
  const h = 8;
  const costPct = (cost / price) * 100;
  return (
    <div className="flex flex-col gap-1">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="rounded-full overflow-hidden" role="img" aria-label={`Margen ${margin}%. Coste ${costPct.toFixed(0)}% del precio.`}>
        <rect x={0} y={0} width={costPct} height={h} fill="color-mix(in oklab, var(--teal) 70%, transparent)" />
        <rect x={costPct} y={0} width={100 - costPct} height={h} fill="color-mix(in oklab, var(--gold) 85%, transparent)" />
      </svg>
      <div className="flex items-center justify-between text-[9px] font-mono">
        <span className="text-[var(--teal)]">coste {costPct.toFixed(0)}%</span>
        <span className="text-[var(--gold-soft)]">margen {margin}%</span>
      </div>
    </div>
  );
}

/* ============================================================
   Detail dialog (per-item)
============================================================ */

function ItemDetailDialog({ item, open, onOpenChange }: { item: MenuItemAnalysis | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!item) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto rp-scroll-thin rp-glass-strong">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Utensils className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            {item.name}
          </DialogTitle>
          <DialogDescription className="sr-only">Análisis completo del plato.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={item.category} />
            <StatusBadge status={item.status} />
            <span className="inline-flex items-center rounded-md border border-border/60 bg-foreground/[0.03] px-2 py-0.5 text-xs font-mono text-foreground">{euro(item.price)}</span>
            <span className="inline-flex items-center gap-1 text-xs"><TrendArrow trend={item.trend} /></span>
            <RatingStars rating={item.rating} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MiniMetric label="Margen" value={`${item.margin}%`} accent="gold" />
            <MiniMetric label="Pedidos 30d" value={String(item.popularity)} accent="teal" />
            <MiniMetric label="Ingresos 30d" value={euro(item.revenue)} accent="gold" />
            <MiniMetric label="Rating" value={item.rating ? `${item.rating.toFixed(1)}★` : "N/A"} accent="teal" />
          </div>

          <div className="rounded-lg border border-border/60 bg-foreground/[0.03] p-3">
            <SectionLabel icon={DollarSign}>Estructura de precio</SectionLabel>
            <div className="mt-2.5"><MarginGauge cost={item.cost} price={item.price} margin={item.margin} /></div>
            <div className="mt-2 flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>Coste ingredientes: <span className="text-[var(--teal)]">{euro(item.cost)}</span></span>
              <span>Precio venta: <span className="text-[var(--gold-soft)]">{euro(item.price)}</span></span>
              <span>Beneficio/ud: <span className="text-emerald-300">{euro(item.price - item.cost)}</span></span>
            </div>
          </div>

          {item.monthlySales && (
            <div className="rounded-lg border border-border/60 bg-foreground/[0.03] p-3">
              <SectionLabel icon={BarChart3}>Ventas últimos 12 meses</SectionLabel>
              <MiniBarChart data={item.monthlySales} />
            </div>
          )}

          <div className="rounded-lg border-l-2 border-[var(--gold)]/60 bg-[var(--gold)]/[0.06] p-3">
            <SectionLabel icon={Sparkles}>Recomendación IA</SectionLabel>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground">{item.aiRecommendation}</p>
          </div>

          {item.reasoning && (
            <div className="rounded-lg border border-border/60 bg-foreground/[0.03] p-3">
              <SectionLabel icon={Brain}>Razonamiento</SectionLabel>
              <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-foreground/85">{item.reasoning}</p>
            </div>
          )}

          {item.crossSellCandidates.length > 0 && (
            <div>
              <SectionLabel icon={Target}>Candidatos cross-sell</SectionLabel>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {item.crossSellCandidates.map((cid) => {
                  const c = DEMO_ITEMS.find((x) => x.id === cid);
                  if (!c) return null;
                  return (
                    <span key={cid} className="inline-flex items-center gap-1 rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/8 px-2 py-0.5 text-[11px] font-mono text-[var(--teal)]">
                      <Zap className="h-3 w-3" aria-hidden />
                      {c.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button className="min-h-[40px] rounded-md border border-border/60 bg-foreground/[0.03] px-4 text-sm hover:bg-foreground/[0.06] transition-colors">
              Cerrar
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MiniMetric({ label, value, accent }: { label: string; value: string; accent: "gold" | "teal" }) {
  return (
    <div className="rounded-md border border-border/60 bg-foreground/[0.03] p-2.5 text-center">
      <div className={cn("font-display text-lg", accent === "gold" ? "rp-gold-text" : "rp-teal-text")}>{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function MiniBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="mt-2 flex items-end gap-1 h-20">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
          <div
            className="w-full rounded-sm bg-gradient-to-t from-[var(--gold-deep)]/60 to-[var(--gold)]"
            style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
            title={`Mes ${i + 1}: ${v} pedidos`}
          />
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Menu item card
============================================================ */

function MenuItemCard({ item, onView }: { item: MenuItemAnalysis; onView: () => void }) {
  const reduced = useReducedMotion();
  const enter = reduced ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };
  return (
    <motion.div {...enter} transition={{ duration: 0.25 }}>
      <div className="rp-glass rounded-2xl p-4 sm:p-5 h-full flex flex-col gap-3 hover:border-[var(--gold)]/30 transition-colors">
        {/* Header: name + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-display text-base sm:text-lg font-medium text-foreground leading-tight">{item.name}</div>
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <CategoryBadge category={item.category} />
              <span className="font-mono text-sm text-[var(--gold-soft)]">{euro(item.price)}</span>
              <TrendArrow trend={item.trend} />
            </div>
          </div>
          <StatusBadge status={item.status} />
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Margen</div>
            <div className="font-mono text-sm rp-gold-text">{item.margin}%</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Pedidos</div>
            <div className="font-mono text-sm text-foreground/85">{item.popularity}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Ingresos</div>
            <div className="font-mono text-sm rp-teal-text">{euro(item.revenue)}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Rating</div>
            <div className="text-sm">{item.rating ? <RatingStars rating={item.rating} /> : <span className="text-xs text-muted-foreground">N/A</span>}</div>
          </div>
        </div>

        {/* Margin gauge */}
        <MarginGauge cost={item.cost} price={item.price} margin={item.margin} />

        {/* AI recommendation */}
        <div className="rounded-md border-l-2 border-[var(--gold)]/60 bg-[var(--gold)]/[0.06] px-3 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
            <Sparkles className="h-3 w-3" aria-hidden />IA
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-foreground/90">{item.aiRecommendation}</p>
        </div>

        <button
          onClick={onView}
          className="mt-auto min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-md border border-border/60 bg-foreground/[0.03] px-3 py-1.5 text-xs text-foreground/80 hover:border-[var(--gold)]/40 hover:text-[var(--gold-soft)] transition-colors"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden />
          Ver detalle
        </button>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Análisis tab
============================================================ */

function AnalisisTab() {
  const [detailItem, setDetailItem] = React.useState<MenuItemAnalysis | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_ITEMS.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onView={() => { setDetailItem(item); setDetailOpen(true); }}
          />
        ))}
      </div>
      <ItemDetailDialog item={detailItem} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}

/* ============================================================
   Rentabilidad tab
============================================================ */

function RentabilidadTab() {
  return (
    <div className="space-y-4">
      {/* Cost analysis summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryStat icon={Receipt} label="Coste ingredientes 30d" value="€4.892" accent="teal" />
        <SummaryStat icon={DollarSign} label="Ingresos 30d" value="€15.348" accent="gold" />
        <SummaryStat icon={Percent} label="Margen medio" value="68%" accent="gold" />
        <SummaryStat icon={TrendingUp} label="Beneficio bruto 30d" value="€10.456" accent="teal" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Scatter chart */}
        <div className="rp-glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h3 className="text-sm font-medium">Distribución por margen y popularidad</h3>
          </div>
          <ScatterChart items={DEMO_ITEMS} />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono">
            {([
              ["star", "Estrella", "text-emerald-300"],
              ["profitable", "Rentable", "text-[var(--teal)]"],
              ["popular_low_margin", "Popular bajo margen", "text-amber-300"],
              ["problematic", "Problemático", "text-destructive"],
              ["underutilized", "Infrautilizado", "text-muted-foreground"],
            ] as const).map(([k, l, c]) => (
              <span key={k} className={cn("inline-flex items-center gap-1", c)}>
                <span className="h-2 w-2 rounded-full bg-current" />{l}
              </span>
            ))}
          </div>
        </div>

        {/* Revenue by category */}
        <div className="rp-glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-[var(--teal)]" aria-hidden />
            <h3 className="text-sm font-medium">Ingresos por categoría · 30 días</h3>
          </div>
          <RevenueByCategoryChart />
        </div>
      </div>

      {/* Price optimization */}
      <div className="rp-glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
          <Sparkles className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <h3 className="text-sm font-medium">Optimización de precios sugerida por IA</h3>
        </div>
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-border/40 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2.5 text-left">Plato</th>
                <th className="px-5 py-2.5 text-right">Actual</th>
                <th className="px-5 py-2.5 text-right">Sugerido</th>
                <th className="px-5 py-2.5 text-right">Impacto</th>
                <th className="px-5 py-2.5 text-right">Confianza</th>
              </tr>
            </thead>
            <tbody>
              {PRICE_OPTIMIZATIONS.map((po) => (
                <tr key={po.id} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025]">
                  <td className="px-5 py-3 font-medium text-foreground">{po.item}</td>
                  <td className="px-5 py-3 text-right font-mono text-muted-foreground">{euro(po.current)}</td>
                  <td className="px-5 py-3 text-right font-mono text-[var(--gold-soft)]">{euro(po.suggested)}</td>
                  <td className="px-5 py-3 text-right font-mono text-emerald-300">{po.impact}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-mono text-xs text-foreground/80">{po.confidence}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent: "gold" | "teal" }) {
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5", accent === "gold" ? "text-[var(--gold)]" : "text-[var(--teal)]")} aria-hidden />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className={cn("mt-1.5 font-display text-2xl font-light", accent === "gold" ? "rp-gold-text" : "rp-teal-text")}>{value}</div>
    </div>
  );
}

const STATUS_COLOR: Record<MenuItemStatus, string> = {
  star: "#34D399",
  profitable: "#3DD6C9",
  popular_low_margin: "#FBBF24",
  problematic: "#F87171",
  underutilized: "#9CA3AF",
};

function ScatterChart({ items }: { items: MenuItemAnalysis[] }) {
  const w = 380;
  const h = 280;
  const padL = 38;
  const padB = 38;
  const padT = 16;
  const padR = 16;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const maxPop = Math.max(...items.map((i) => i.popularity));
  // X: popularity (0..maxPop), Y: margin (0..100)
  const x = (pop: number) => padL + (pop / maxPop) * innerW;
  const y = (m: number) => padT + innerH - (m / 100) * innerH;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Distribución de platos por margen y popularidad">
      {/* Quadrant background tints */}
      <rect x={padL} y={padT} width={innerW / 2} height={innerH / 2} fill="#3DD6C9" opacity="0.04" />
      <rect x={padL + innerW / 2} y={padT} width={innerW / 2} height={innerH / 2} fill="#34D399" opacity="0.05" />
      <rect x={padL} y={padT + innerH / 2} width={innerW / 2} height={innerH / 2} fill="#F87171" opacity="0.04" />
      <rect x={padL + innerW / 2} y={padT + innerH / 2} width={innerW / 2} height={innerH / 2} fill="#FBBF24" opacity="0.04" />
      {/* Axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="color-mix(in oklab, var(--foreground) 20%, transparent)" strokeWidth="1" />
      <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} stroke="color-mix(in oklab, var(--foreground) 20%, transparent)" strokeWidth="1" />
      {/* Median lines (quadrant dividers) */}
      <line x1={padL + innerW / 2} y1={padT} x2={padL + innerW / 2} y2={padT + innerH} stroke="color-mix(in oklab, var(--foreground) 10%, transparent)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1={padL} y1={padT + innerH / 2} x2={padL + innerW} y2={padT + innerH / 2} stroke="color-mix(in oklab, var(--foreground) 10%, transparent)" strokeWidth="1" strokeDasharray="3 3" />
      {/* Quadrant labels */}
      <text x={padL + 6} y={padT + 14} fontSize="9" className="fill-[var(--teal)] font-mono">Rentables</text>
      <text x={padL + innerW - 6} y={padT + 14} fontSize="9" textAnchor="end" className="fill-emerald-300 font-mono">Estrellas</text>
      <text x={padL + 6} y={padT + innerH - 4} fontSize="9" className="fill-destructive font-mono">Problemáticos</text>
      <text x={padL + innerW - 6} y={padT + innerH - 4} fontSize="9" textAnchor="end" className="fill-amber-300 font-mono">Populares b/margen</text>
      {/* Axis labels */}
      <text x={padL} y={h - 6} fontSize="9" className="fill-muted-foreground font-mono">Popularidad →</text>
      <text x={10} y={padT + 10} fontSize="9" className="fill-muted-foreground font-mono" transform={`rotate(-90 10 ${padT + 10})`}>Margen %</text>
      {/* Points */}
      {items.map((it) => (
        <g key={it.id}>
          <circle cx={x(it.popularity)} cy={y(it.margin)} r="6" fill={STATUS_COLOR[it.status]} fillOpacity="0.85" stroke={STATUS_COLOR[it.status]} strokeWidth="1.5" />
          <title>{`${it.name} · ${it.margin}% margen · ${it.popularity} pedidos`}</title>
        </g>
      ))}
    </svg>
  );
}

function RevenueByCategoryChart() {
  const max = Math.max(...REVENUE_BY_CATEGORY.map((r) => r.revenue));
  return (
    <ul className="space-y-2.5">
      {REVENUE_BY_CATEGORY.map((r) => {
        const meta = CATEGORY_META[r.category];
        const pct = (r.revenue / max) * 100;
        return (
          <li key={r.category} className="flex items-center gap-3">
            <span className="w-24 text-xs text-foreground/80 shrink-0">{meta.label}</span>
            <div className="flex-1 h-6 rounded-md bg-foreground/[0.04] overflow-hidden">
              <div
                className="h-full rounded-md bg-gradient-to-r from-[var(--gold-deep)]/70 to-[var(--gold)] flex items-center justify-end pr-2"
                style={{ width: `${pct}%`, minWidth: 4 }}
              >
                <span className="text-[10px] font-mono text-black/80">{euro(r.revenue)}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ============================================================
   Recomendaciones tab
============================================================ */

const RECO_CATEGORY_META: Record<AiRecommendation["category"], { label: string; cls: string }> = {
  price: { label: "Precio", cls: "border-[var(--gold)]/45 bg-[var(--gold)]/12 text-[var(--gold-soft)]" },
  menu: { label: "Carta", cls: "border-amber-400/45 bg-amber-400/12 text-amber-300" },
  promo: { label: "Promo", cls: "border-[var(--teal)]/45 bg-[var(--teal)]/12 text-[var(--teal)]" },
  combo: { label: "Combo", cls: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300" },
  replace: { label: "Reemplazo", cls: "border-pink-400/40 bg-pink-400/10 text-pink-300" },
  autosuggest: { label: "Auto-suggest", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
};

function RecomendacionesTab() {
  const { toast } = useToast();
  const [states, setStates] = React.useState<Record<string, "applied" | "rejected" | undefined>>({});
  const [detail, setDetail] = React.useState<AiRecommendation | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const reduced = useReducedMotion();

  const applied = Object.values(states).filter((s) => s === "applied").length;
  const total = RECOMMENDATIONS.length;

  const enter = reduced ? {} : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-4">
      <div className="rp-glass rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <span className="text-sm text-foreground/85">{total} recomendaciones activas</span>
          <span className="text-[11px] font-mono text-muted-foreground">· {applied} aplicadas</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-400/[0.06] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
          <AlertTriangle className="h-3 w-3" aria-hidden />Requieren aprobación
        </span>
      </div>

      <ul className="space-y-3">
        <AnimatePresence>
          {RECOMMENDATIONS.map((r, i) => {
            const st = states[r.id];
            const cat = RECO_CATEGORY_META[r.category];
            return (
              <motion.li
                key={r.id}
                {...enter}
                transition={{ duration: 0.2, delay: reduced ? 0 : i * 0.03 }}
                className="rp-glass rounded-xl p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", cat.cls)}>{cat.label}</span>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                        r.impactTone === "positive"
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                          : "border-foreground/25 bg-foreground/8 text-muted-foreground"
                      )}>
                        <TrendingUp className="h-3 w-3" aria-hidden />{r.impact}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-foreground/[0.03] px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-[var(--gold)]" aria-hidden />Confianza {r.confidence}%
                      </span>
                      {st && (
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                          st === "applied" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-destructive/40 bg-destructive/10 text-destructive"
                        )}>
                          {st === "applied" ? <Check className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3" aria-hidden />}
                          {st === "applied" ? "Aplicada" : "Rechazada"}
                        </span>
                      )}
                    </div>
                    <h4 className="mt-2 text-sm sm:text-base font-medium text-foreground leading-snug">{r.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => { setDetail(r); setDetailOpen(true); }}
                      className="min-h-[40px] inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-foreground/[0.03] px-3 py-1.5 text-xs text-foreground/80 hover:border-[var(--gold)]/40 hover:text-[var(--gold-soft)] transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden />Ver análisis
                    </button>
                    <button
                      onClick={() => {
                        setStates((s) => ({ ...s, [r.id]: "rejected" }));
                        toast({ title: "Recomendación rechazada", description: r.title });
                      }}
                      disabled={!!st}
                      className="min-h-[40px] inline-flex items-center justify-center w-10 rounded-md border border-border/60 bg-foreground/[0.03] text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Rechazar"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      onClick={() => {
                        setStates((s) => ({ ...s, [r.id]: "applied" }));
                        toast({ title: "Recomendación aplicada", description: `${r.title} · ${r.impact}` });
                      }}
                      disabled={!!st}
                      className="min-h-[40px] inline-flex items-center gap-1.5 rounded-md bg-[var(--gold)] px-3 py-1.5 text-xs font-medium text-black hover:bg-[var(--gold-soft)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden />Aplicar
                    </button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <div className="rp-glass rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-300" aria-hidden />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Las recomendaciones de IA no modifican precios ni platos automáticamente. Requieren aprobación del gerente.
        </p>
      </div>

      <RecommendationDetailDialog reco={detail} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}

function RecommendationDetailDialog({ reco, open, onOpenChange }: { reco: AiRecommendation | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!reco) return null;
  const cat = RECO_CATEGORY_META[reco.category];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rp-scroll-thin rp-glass-strong">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            Análisis de recomendación
          </DialogTitle>
          <DialogDescription className="sr-only">Detalle del razonamiento de la IA.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", cat.cls)}>{cat.label}</span>
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
              <TrendingUp className="h-3 w-3" aria-hidden />{reco.impact}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-foreground/[0.03] px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
              <Sparkles className="h-3 w-3 text-[var(--gold)]" aria-hidden />Confianza {reco.confidence}%
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-medium text-foreground leading-snug">{reco.title}</h4>

          <div className="rounded-lg border border-border/60 bg-foreground/[0.03] p-3">
            <SectionLabel icon={Brain}>Razonamiento</SectionLabel>
            <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-foreground/85">{reco.reasoning}</p>
          </div>

          <div>
            <SectionLabel icon={BarChart3}>Datos clave</SectionLabel>
            <ul className="mt-1.5 space-y-1.5">
              {reco.data.map((d, i) => (
                <li key={i} className="flex gap-2 text-xs text-foreground/85">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--gold)]" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button className="min-h-[40px] rounded-md border border-border/60 bg-foreground/[0.03] px-4 text-sm hover:bg-foreground/[0.06] transition-colors">
              Cerrar
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   Cross-selling tab
============================================================ */

function CrossSellingTab() {
  const { toast } = useToast();
  const [created, setCreated] = React.useState<Record<string, boolean>>({});
  const reduced = useReducedMotion();

  function affinityColor(pct: number): string {
    // 0 → transparent, 100 → deep teal/green
    if (pct >= 80) return "color-mix(in oklab, #34D399 55%, transparent)";
    if (pct >= 60) return "color-mix(in oklab, #3DD6C9 45%, transparent)";
    if (pct >= 40) return "color-mix(in oklab, #D4AF37 35%, transparent)";
    if (pct >= 20) return "color-mix(in oklab, var(--foreground) 18%, transparent)";
    return "color-mix(in oklab, var(--foreground) 8%, transparent)";
  }
  function affinityText(pct: number): string {
    if (pct >= 80) return "text-emerald-200";
    if (pct >= 60) return "text-[var(--teal)]";
    if (pct >= 40) return "text-[var(--gold-soft)]";
    return "text-muted-foreground";
  }

  const enter = reduced ? {} : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-4">
      {/* Heatmap */}
      <div className="rp-glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <h3 className="text-sm font-medium">Matriz de afinidad · top 8 platos</h3>
          <span className="ml-auto text-[11px] font-mono text-muted-foreground">% pedidos conjuntos</span>
        </div>
        <div className="overflow-x-auto rp-scroll-thin -mx-2 px-2">
          <table className="border-collapse mx-auto" style={{ minWidth: 460 }}>
            <thead>
              <tr>
                <th className="w-20"></th>
                {MATRIX_ITEMS.map((label) => (
                  <th key={label} className="px-1 pb-1 align-bottom">
                    <div className="text-[9px] font-mono text-muted-foreground text-center leading-tight" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", height: 64 }}>
                      {label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AFFINITY_MATRIX.map((row, ri) => (
                <tr key={ri}>
                  <td className="pr-2 text-right">
                    <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[80px]">{MATRIX_ITEMS[ri]}</div>
                  </td>
                  {row.map((val, ci) => {
                    const isDiag = ri === ci;
                    return (
                      <td key={ci} className="p-0.5">
                        <div
                          className={cn(
                            "h-9 w-9 sm:h-10 sm:w-10 rounded-md flex items-center justify-center text-[10px] font-mono",
                            isDiag ? "opacity-30" : ""
                          )}
                          style={{ backgroundColor: affinityColor(val) }}
                          title={`${MATRIX_ITEMS[ri]} + ${MATRIX_ITEMS[ci]}: ${val}%`}
                        >
                          <span className={cn(affinityText(val), isDiag && "text-muted-foreground/40")}>
                            {val}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-center gap-3 text-[10px] font-mono text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: affinityColor(10) }} />baja
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: affinityColor(50) }} />media
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: affinityColor(85) }} />alta
          </span>
        </div>
      </div>

      {/* AI suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <h3 className="text-sm font-medium">Sugerencias de combo por IA</h3>
        </div>
        <ul className="space-y-3">
          <AnimatePresence>
            {CROSS_SELL_SUGGESTIONS.map((cs, i) => (
              <motion.li
                key={cs.id}
                {...enter}
                transition={{ duration: 0.2, delay: reduced ? 0 : i * 0.04 }}
                className="rp-glass rounded-xl p-4 sm:p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{cs.itemA}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden />
                      <span className="font-medium text-sm text-foreground">{cs.itemB}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
                        <Target className="h-3 w-3" aria-hidden />{cs.affinity}% afinidad
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                        <Receipt className="h-3 w-3" aria-hidden />Combo {euro(cs.comboPrice)}
                      </span>
                      {cs.saving > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                          <DollarSign className="h-3 w-3" aria-hidden />ahorro {euro(cs.saving)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                        <TrendingUp className="h-3 w-3" aria-hidden />{cs.impact}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCreated((s) => ({ ...s, [cs.id]: true }));
                      toast({ title: "Combo creado", description: `${cs.itemA} + ${cs.itemB} · ${euro(cs.comboPrice)}` });
                    }}
                    disabled={!!created[cs.id]}
                    className="min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--gold)] px-4 py-1.5 text-xs font-medium text-black hover:bg-[var(--gold-soft)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {created[cs.id] ? (
                      <><Check className="h-3.5 w-3.5" aria-hidden />Combo creado</>
                    ) : (
                      <><Zap className="h-3.5 w-3.5" aria-hidden />Crear combo</>
                    )}
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}

/* ============================================================
   Main component
============================================================ */

export function AiMenu() {
  return (
    <div className="space-y-5">
      <header className="rp-glass-strong rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Utensils className="h-5 w-5 text-[var(--gold)]" aria-hidden />
              <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight">
                IA para Menú
              </h2>
              <DemoBadge />
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/8 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                <Utensils className="h-3 w-3" aria-hidden />12 platos analizados
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
              Analiza rentabilidad, popularidad, margen y oportunidades de cross-selling de cada plato. Recomendaciones accionables con estimación de impacto.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-foreground/[0.03] px-2 py-0.5 text-[11px] font-mono text-muted-foreground shrink-0">
            <Clock className="h-3 w-3" aria-hidden />Última actualización: hace 1h
          </span>
        </div>
      </header>

      <Tabs defaultValue="analisis" className="w-full">
        <TabsList className="bg-transparent p-0 h-auto flex flex-wrap gap-1 rp-glass rounded-xl w-full justify-start">
          {[
            { v: "analisis", l: "Análisis", i: Utensils },
            { v: "rentabilidad", l: "Rentabilidad", i: Percent },
            { v: "recomendaciones", l: "Recomendaciones", i: Lightbulb },
            { v: "crossselling", l: "Cross-selling", i: Target },
          ].map((t) => (
            <TabsTrigger
              key={t.v}
              value={t.v}
              className="min-h-[40px] data-[state=active]:bg-[var(--gold)]/12 data-[state=active]:text-[var(--gold-soft)] data-[state=active]:shadow-none rounded-lg px-3 sm:px-4 text-xs sm:text-sm"
            >
              <t.i className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              <span className="hidden sm:inline">{t.l}</span>
              <span className="sm:hidden">{t.l.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="analisis" className="mt-4 focus-visible:outline-none">
          <AnalisisTab />
        </TabsContent>
        <TabsContent value="rentabilidad" className="mt-4 focus-visible:outline-none">
          <RentabilidadTab />
        </TabsContent>
        <TabsContent value="recomendaciones" className="mt-4 focus-visible:outline-none">
          <RecomendacionesTab />
        </TabsContent>
        <TabsContent value="crossselling" className="mt-4 focus-visible:outline-none">
          <CrossSellingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AiMenu;
