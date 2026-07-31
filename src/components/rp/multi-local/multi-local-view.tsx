"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Store,
  Crown,
  Lock,
  Unlock,
  Plus,
  TreePine,
  Map,
  ChefHat,
  FileBarChart,
  TrendingUp,
  Users,
  DollarSign,
  Percent,
  Layers,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Wallet,
  ScrollText,
  Wand2,
  Eye,
  GitBranch,
  Factory,
  Globe2,
  ArrowLeftRight,
  Building2,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type Plan = "Starter" | "Professional" | "Enterprise";
type LockKey = "carta" | "precios" | "promos" | "design" | "policies";

interface LocalNode {
  id: string;
  name: string;
  brandId: string;
  city: string;
  mrr: number;
  seats: number;
  health: number; // 0-100
  status: "operativo" | "degradado" | "inactivo";
}

interface BrandNode {
  id: string;
  name: string;
  color: string;
  currency: string;
  royalty: number; // %
  locals: LocalNode[];
}

interface OrgNode {
  id: string;
  name: string;
  plan: Plan;
  brands: BrandNode[];
}

interface CentralProduct {
  id: string;
  name: string;
  category: "Entrantes" | "Principales" | "Postres" | "Bebidas";
  basePrice: number;
  priceSets: { setId: string; price: number; locked: boolean }[];
  allergens: string[];
  active: boolean;
}

interface PriceSet {
  id: string;
  name: string;
  description: string;
  multiplier: number;
}

/* =========================================================
 * Mock data
 * =======================================================*/
const ORG: OrgNode = {
  id: "org-1",
  name: "Ramses Hospitality Group",
  plan: "Enterprise",
  brands: [
    {
      id: "b1",
      name: "Ramses Premium",
      color: "var(--rp-emerald)",
      currency: "EUR",
      royalty: 6,
      locals: [
        { id: "l1", name: "Ramses Madrid Centro", brandId: "b1", city: "Madrid", mrr: 14800, seats: 120, health: 92, status: "operativo" },
        { id: "l2", name: "Ramses Barcelona Eixample", brandId: "b1", city: "Barcelona", mrr: 13200, seats: 110, health: 87, status: "operativo" },
        { id: "l3", name: "Ramses Valencia Mar", brandId: "b1", city: "Valencia", mrr: 9800, seats: 90, health: 74, status: "degradado" },
      ],
    },
    {
      id: "b2",
      name: "Ramses Bistro",
      color: "var(--rp-yellow)",
      currency: "EUR",
      royalty: 4,
      locals: [
        { id: "l4", name: "Bistro Sevilla", brandId: "b2", city: "Sevilla", mrr: 6200, seats: 60, health: 81, status: "operativo" },
        { id: "l5", name: "Bistro Málaga", brandId: "b2", city: "Málaga", mrr: 5400, seats: 55, health: 68, status: "degradado" },
      ],
    },
    {
      id: "b3",
      name: "Sakura by Ramses",
      color: "var(--rp-violet)",
      currency: "EUR",
      royalty: 8,
      locals: [
        { id: "l6", name: "Sakura Madrid", brandId: "b3", city: "Madrid", mrr: 11200, seats: 80, health: 95, status: "operativo" },
        { id: "l7", name: "Sakura Lisboa", brandId: "b3", city: "Lisboa", mrr: 9100, seats: 70, health: 88, status: "operativo" },
      ],
    },
  ],
};

const PRICE_SETS: PriceSet[] = [
  { id: "ps1", name: "Centro", description: "Madrid · Barcelona", multiplier: 1.0 },
  { id: "ps2", name: "Levante", description: "Valencia · costas", multiplier: 0.92 },
  { id: "ps3", name: "Internacional", description: "Lisboa · autres", multiplier: 1.08 },
];

const CENTRAL_PRODUCTS: CentralProduct[] = [
  { id: "p1", name: "Tartar de atún rojo", category: "Entrantes", basePrice: 18.5, priceSets: [{ setId: "ps1", price: 18.5, locked: true }, { setId: "ps2", price: 17.0, locked: false }, { setId: "ps3", price: 20.0, locked: false }], allergens: ["pescado", "sésamo"], active: true },
  { id: "p2", name: "Croquetas de jamón ibérico", category: "Entrantes", basePrice: 9.5, priceSets: [{ setId: "ps1", price: 9.5, locked: true }, { setId: "ps2", price: 8.75, locked: false }, { setId: "ps3", price: 10.25, locked: false }], allergens: ["gluten", "lactosa"], active: true },
  { id: "p3", name: "Secreto ibérico", category: "Principales", basePrice: 22.0, priceSets: [{ setId: "ps1", price: 22.0, locked: true }, { setId: "ps2", price: 20.24, locked: false }, { setId: "ps3", price: 23.76, locked: false }], allergens: ["sulfitos"], active: true },
  { id: "p4", name: "Risotto trufa negra", category: "Principales", basePrice: 19.5, priceSets: [{ setId: "ps1", price: 19.5, locked: true }, { setId: "ps2", price: 17.94, locked: true }, { setId: "ps3", price: 21.06, locked: false }], allergens: ["lactosa"], active: true },
  { id: "p5", name: "Bao de panceta glaseada", category: "Entrantes", basePrice: 12.0, priceSets: [{ setId: "ps1", price: 12.0, locked: false }, { setId: "ps2", price: 11.04, locked: false }, { setId: "ps3", price: 12.96, locked: false }], allergens: ["gluten", "soja"], active: true },
  { id: "p6", name: "Salmón teriyaki", category: "Principales", basePrice: 21.0, priceSets: [{ setId: "ps1", price: 21.0, locked: true }, { setId: "ps2", price: 19.32, locked: false }, { setId: "ps3", price: 22.68, locked: false }], allergens: ["pescado", "soja", "sésamo"], active: true },
  { id: "p7", name: "Tarta de queso japonesa", category: "Postres", basePrice: 7.5, priceSets: [{ setId: "ps1", price: 7.5, locked: true }, { setId: "ps2", price: 6.9, locked: false }, { setId: "ps3", price: 8.1, locked: false }], allergens: ["lactosa", "huevo"], active: true },
  { id: "p8", name: "Moelleux de chocolate", category: "Postres", basePrice: 8.0, priceSets: [{ setId: "ps1", price: 8.0, locked: true }, { setId: "ps2", price: 7.36, locked: false }, { setId: "ps3", price: 8.64, locked: false }], allergens: ["lactosa", "huevo", "gluten"], active: true },
  { id: "p9", name: "Vino tinto Ribera", category: "Bebidas", basePrice: 4.5, priceSets: [{ setId: "ps1", price: 4.5, locked: false }, { setId: "ps2", price: 4.14, locked: false }, { setId: "ps3", price: 4.86, locked: false }], allergens: ["sulfitos"], active: true },
  { id: "p10", name: "Cóctel signature", category: "Bebidas", basePrice: 11.0, priceSets: [{ setId: "ps1", price: 11.0, locked: true }, { setId: "ps2", price: 10.12, locked: false }, { setId: "ps3", price: 11.88, locked: false }], allergens: [], active: true },
  { id: "p11", name: "Bao vegano de tofu", category: "Entrantes", basePrice: 10.5, priceSets: [{ setId: "ps1", price: 10.5, locked: false }, { setId: "ps2", price: 9.66, locked: false }, { setId: "ps3", price: 11.34, locked: false }], allergens: ["soja", "gluten"], active: true },
  { id: "p12", name: "Wagyu A5", category: "Principales", basePrice: 48.0, priceSets: [{ setId: "ps1", price: 48.0, locked: true }, { setId: "ps2", price: 44.16, locked: true }, { setId: "ps3", price: 51.84, locked: false }], allergens: [], active: false },
];

const SPAIN_REGIONS = [
  { id: "mad", name: "Madrid", x: 340, y: 200, r: 18, value: 26600, locals: 2 },
  { id: "bcn", name: "Barcelona", x: 402, y: 165, r: 14, value: 13200, locals: 1 },
  { id: "val", name: "Valencia", x: 380, y: 210, r: 11, value: 9800, locals: 1 },
  { id: "sev", name: "Sevilla", x: 265, y: 255, r: 10, value: 6200, locals: 1 },
  { id: "mal", name: "Málaga", x: 280, y: 275, r: 9, value: 5400, locals: 1 },
  { id: "lis", name: "Lisboa", x: 200, y: 215, r: 10, value: 9100, locals: 1 },
];

const FRANCHISE_LOCKS: { key: LockKey; label: string; desc: string; icon: React.ElementType; inherited: boolean }[] = [
  { key: "carta", label: "Carta central", desc: "Productos, descripciones, alérgenos y fotos del catálogo maestro.", icon: ChefHat, inherited: true },
  { key: "precios", label: "Estructura de precios", desc: "Sets de precios por zona y overrides aprobados por HQ.", icon: DollarSign, inherited: true },
  { key: "promos", label: "Promociones globales", desc: "Campañas y descuentos creados desde marca.", icon: Percent, inherited: false },
  { key: "design", label: "Identidad visual", desc: "Logos, paleta, tipografías, plantillas de carta digital.", icon: Sparkles, inherited: true },
  { key: "policies", label: "Políticas operativas", desc: "Cancelación, no-show, reservas, allergy workflow.", icon: ShieldCheck, inherited: false },
];

const ROYALTIES = [
  { brand: "Ramses Premium", rate: 6, monthly: 2880, collected: 2880, status: "al día" },
  { brand: "Ramses Bistro", rate: 4, monthly: 464, collected: 432, status: "al día" },
  { brand: "Sakura by Ramses", rate: 8, monthly: 1624, collected: 1624, status: "al día" },
];

const CONSOLIDATED_PNL = [
  { item: "Ingresos brutos", value: 145800, pct: 100, tone: "emerald" as const },
  { item: "Coste mercancía", value: -43740, pct: 30, tone: "red" as const },
  { item: "Personal", value: -52500, pct: 36, tone: "red" as const },
  { item: "Royalties franquicia", value: -4968, pct: 3.4, tone: "yellow" as const },
  { item: "Alquiler + utilities", value: -15600, pct: 10.7, tone: "red" as const },
  { item: "Software + suscripciones", value: -2840, pct: 1.9, tone: "violet" as const },
  { item: "EBITDA", value: 26152, pct: 17.9, tone: "emerald" as const },
];

/* =========================================================
 * Helpers
 * =======================================================*/
const euro = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const euroC = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);

const TONE = {
  emerald: "var(--rp-emerald)",
  yellow: "var(--rp-yellow)",
  blue: "var(--rp-blue)",
  red: "var(--rp-red)",
  violet: "var(--rp-violet)",
};

function HealthDot({ score }: { score: number }) {
  const color = score >= 85 ? "bg-[var(--rp-emerald)]" : score >= 70 ? "bg-[var(--rp-yellow)]" : "bg-[var(--rp-red)]";
  return <span className={cn("inline-block h-2 w-2 rounded-full", color)} aria-hidden />;
}

function StatusPill({ status }: { status: "operativo" | "degradado" | "inactivo" }) {
  const map = {
    operativo: { label: "Operativo", cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald)]" },
    degradado: { label: "Degradado", cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow)]" },
    inactivo: { label: "Inactivo", cls: "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red)]" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px]", map.cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {map.label}
    </span>
  );
}

/* =========================================================
 * Spain Map SVG
 * =======================================================*/
function SpainMap() {
  const max = Math.max(...SPAIN_REGIONS.map(r => r.value));
  return (
    <svg viewBox="0 0 520 320" className="w-full h-auto" role="img" aria-label="Mapa de España con locales por región">
      <defs>
        <radialGradient id="rg-emerald" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={TONE.emerald} stopOpacity="0.7" />
          <stop offset="100%" stopColor={TONE.emerald} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M180 130 Q200 100 250 95 L320 95 Q380 100 430 130 L460 170 Q470 210 440 250 L390 290 Q330 305 270 295 L220 280 Q180 260 165 220 Q155 180 180 130 Z"
        fill="currentColor"
        fillOpacity="0.04"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1"
      />
      <path
        d="M180 200 Q165 195 155 215 Q150 240 175 250 Q200 255 210 240 Q215 215 200 205 Q190 200 180 200 Z"
        fill="currentColor"
        fillOpacity="0.04"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1"
      />
      {SPAIN_REGIONS.map((r) => {
        const intensity = r.value / max;
        return (
          <g key={r.id}>
            <circle cx={r.x} cy={r.y} r={r.r * 1.8} fill="url(#rg-emerald)" opacity={0.4 + intensity * 0.6} />
            <circle cx={r.x} cy={r.y} r={r.r * 0.45} fill={TONE.emerald} />
            <text x={r.x} y={r.y - r.r - 4} fontSize="10" fill="currentColor" fillOpacity="0.75" textAnchor="middle" fontFamily="var(--font-jetbrains)">
              {r.name}
            </text>
            <text x={r.x} y={r.y + r.r + 14} fontSize="9" fill="currentColor" fillOpacity="0.45" textAnchor="middle" fontFamily="var(--font-jetbrains)">
              {r.locals} local{r.locals > 1 ? "es" : ""} · {euro(r.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* =========================================================
 * Org Tree (left)
 * =======================================================*/
function OrgTree({
  selectedLocalId, onSelectLocal, expandedBrands, onToggleBrand,
}: {
  selectedLocalId: string | null;
  onSelectLocal: (id: string) => void;
  expandedBrands: Record<string, boolean>;
  onToggleBrand: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-md border border-[var(--rp-emerald)]/30 bg-[var(--rp-emerald)]/5 px-3 py-2">
        <Building2 className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{ORG.name}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{ORG.plan} · {ORG.brands.length} marcas</div>
        </div>
        <Badge variant="outline" className="border-[var(--rp-emerald)]/40 text-[var(--rp-emerald)] text-[10px]">HQ</Badge>
      </div>

      <div className="pl-3 border-l border-border/60 space-y-1.5">
        {ORG.brands.map((b) => {
          const isOpen = expandedBrands[b.id] ?? true;
          const totalMrr = b.locals.reduce((s, l) => s + l.mrr, 0);
          return (
            <div key={b.id} className="space-y-1">
              <button
                type="button"
                onClick={() => onToggleBrand(b.id)}
                className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-foreground/5 transition-colors text-left"
                aria-expanded={isOpen}
                aria-label={`Toggle ${b.name}`}
              >
                {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />}
                <span className="h-2 w-2 rounded-sm" style={{ background: b.color }} aria-hidden />
                <span className="flex-1 text-sm truncate">{b.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{b.locals.length}L</span>
                <span className="text-[10px] font-mono text-foreground/70">{euro(totalMrr)}</span>
              </button>
              {isOpen && (
                <div className="pl-5 space-y-1">
                  {b.locals.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => onSelectLocal(l.id)}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                        selectedLocalId === l.id ? "bg-foreground/10 ring-1 ring-foreground/20" : "hover:bg-foreground/5"
                      )}
                    >
                      <Store className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      <span className="flex-1 text-xs truncate">{l.name}</span>
                      <HealthDot score={l.health} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button variant="outline" size="sm" className="w-full border-dashed text-xs h-8">
        <Plus className="h-3.5 w-3.5 mr-1" aria-hidden /> Añadir marca o local
      </Button>
    </div>
  );
}

/* =========================================================
 * Global dashboard
 * =======================================================*/
function GlobalDashboard() {
  const totalMrr = ORG.brands.reduce((s, b) => s + b.locals.reduce((ss, l) => ss + l.mrr, 0), 0);
  const totalLocals = ORG.brands.reduce((s, b) => s + b.locals.length, 0);
  const totalSeats = ORG.brands.reduce((s, b) => s + b.locals.reduce((ss, l) => ss + l.seats, 0), 0);
  const avgHealth = Math.round(
    ORG.brands.reduce((s, b) => s + b.locals.reduce((ss, l) => ss + l.health, 0), 0) / totalLocals
  );

  const kpis = [
    { label: "MRR consolidado", value: euro(totalMrr), icon: DollarSign, tone: "emerald", trend: "+6.2% MoM" },
    { label: "Locales activos", value: `${totalLocals}`, icon: Store, tone: "blue", trend: "+2 este mes" },
    { label: "Plazas totales", value: `${totalSeats}`, icon: Users, tone: "violet", trend: "estable" },
    { label: "Health score medio", value: `${avgHealth}/100`, icon: ShieldCheck, tone: avgHealth >= 85 ? "emerald" : "yellow", trend: "-1.2 pts" },
  ];

  const allLocals = ORG.brands.flatMap(b => b.locals.map(l => ({ ...l, brandName: b.name, brandColor: b.color })));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const color = TONE[k.tone];
          const Icon = k.icon;
          return (
            <div key={k.label} className="rp-glass rounded-xl p-3.5 border border-border/60">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{k.label}</div>
                <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden />
              </div>
              <div className="mt-1.5 text-xl font-display font-medium" style={{ color }}>{k.value}</div>
              <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{k.trend}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Map className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden />
            <h4 className="text-sm font-medium">Distribución geográfica</h4>
          </div>
          <SpainMap />
          <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--rp-emerald)]" aria-hidden /> Tamaño = MRR local · Punto = local activo
          </div>
        </div>

        <div className="lg:col-span-3 rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileBarChart className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden />
              <h4 className="text-sm font-medium">Comparativa por local</h4>
            </div>
            <Badge variant="outline" className="text-[10px]">{allLocals.length} locales</Badge>
          </div>
          <div className="overflow-x-auto rp-scroll-thin -mx-2 px-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/40">
                  <th className="py-2 pr-2 font-medium">Local</th>
                  <th className="py-2 px-2 font-medium">Marca</th>
                  <th className="py-2 px-2 font-medium text-right">MRR</th>
                  <th className="py-2 px-2 font-medium text-right">Plazas</th>
                  <th className="py-2 pl-2 font-medium text-right">Health</th>
                </tr>
              </thead>
              <tbody>
                {allLocals.map((l) => (
                  <tr key={l.id} className="border-b border-border/30 hover:bg-foreground/[0.02]">
                    <td className="py-2 pr-2">
                      <div className="font-medium truncate max-w-[160px]">{l.name}</div>
                      <div className="text-[10px] text-muted-foreground">{l.city}</div>
                    </td>
                    <td className="py-2 px-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm" style={{ background: l.brandColor }} aria-hidden />
                        <span className="text-[11px]">{l.brandName}</span>
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono">{euro(l.mrr)}</td>
                    <td className="py-2 px-2 text-right font-mono">{l.seats}</td>
                    <td className="py-2 pl-2 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <span className="font-mono text-[11px]">{l.health}</span>
                        <HealthDot score={l.health} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Central carta
 * =======================================================*/
function CentralCarta() {
  const [products, setProducts] = React.useState<CentralProduct[]>(() => CENTRAL_PRODUCTS.map(p => ({ ...p, priceSets: p.priceSets.map(ps => ({ ...ps })) })));
  const [filter, setFilter] = React.useState<"all" | CentralProduct["category"]>("all");
  const [showOnlyLocked, setShowOnlyLocked] = React.useState(false);

  const filtered = products.filter(p => {
    if (filter !== "all" && p.category !== filter) return false;
    if (showOnlyLocked && !p.priceSets.some(ps => ps.locked)) return false;
    return true;
  });

  const toggleLock = (productId: string, setId: string) => {
    setProducts(prev => prev.map(p => p.id !== productId ? p : {
      ...p,
      priceSets: p.priceSets.map(ps => ps.setId !== setId ? ps : { ...ps, locked: !ps.locked }),
    }));
  };

  const toggleActive = (productId: string) => {
    setProducts(prev => prev.map(p => p.id !== productId ? p : { ...p, active: !p.active }));
  };

  const lockedCount = products.reduce((s, p) => s + p.priceSets.filter(ps => ps.locked).length, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {(["all", "Entrantes", "Principales", "Postres", "Bebidas"] as const).map((c) => (
            <Button
              key={c}
              size="sm"
              variant={filter === c ? "default" : "outline"}
              className={cn("h-7 text-[11px]", filter === c && "bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90")}
              onClick={() => setFilter(c)}
            >
              {c === "all" ? "Todas" : c}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="locked-filter" className="text-[11px] text-muted-foreground">Solo con locks</Label>
          <Switch id="locked-filter" checked={showOnlyLocked} onCheckedChange={setShowOnlyLocked} />
        </div>
        <Badge variant="outline" className="border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow)]">
          <Lock className="h-3 w-3 mr-1" aria-hidden /> {lockedCount} locks activos
        </Badge>
      </div>

      <div className="rp-glass rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs">
            <thead className="bg-foreground/[0.03]">
              <tr className="text-left text-muted-foreground border-b border-border/40">
                <th className="py-2.5 px-3 font-medium">Producto</th>
                <th className="py-2.5 px-2 font-medium">Cat.</th>
                {PRICE_SETS.map(ps => (
                  <th key={ps.id} className="py-2.5 px-2 font-medium text-center">
                    <div className="font-medium">{ps.name}</div>
                    <div className="text-[9px] text-muted-foreground font-mono">×{ps.multiplier}</div>
                  </th>
                ))}
                <th className="py-2.5 px-2 font-medium text-center">Activo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/30 hover:bg-foreground/[0.02]">
                  <td className="py-2 px-3">
                    <div className="font-medium">{p.name}</div>
                    {p.allergens.length > 0 && (
                      <div className="text-[9px] text-[var(--rp-red)] mt-0.5">{p.allergens.join(" · ")}</div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{p.category.slice(0, 4)}</td>
                  {PRICE_SETS.map(ps => {
                    const cell = p.priceSets.find(x => x.setId === ps.id);
                    if (!cell) return <td key={ps.id} className="py-2 px-2 text-center text-muted-foreground">—</td>;
                    return (
                      <td key={ps.id} className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggleLock(p.id, ps.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-border/50 px-1.5 py-0.5 hover:bg-foreground/5 transition-colors"
                          aria-label={`${cell.locked ? "Desbloquear" : "Bloquear"} precio ${ps.name} para ${p.name}`}
                        >
                          <span className={cn("font-mono text-[11px]", !p.active && "line-through text-muted-foreground")}>{euroC(cell.price)}</span>
                          {cell.locked
                            ? <Lock className="h-3 w-3 text-[var(--rp-yellow)]" aria-hidden />
                            : <Unlock className="h-3 w-3 text-muted-foreground" aria-hidden />}
                        </button>
                      </td>
                    );
                  })}
                  <td className="py-2 px-2 text-center">
                    <Switch checked={p.active} onCheckedChange={() => toggleActive(p.id)} aria-label={`Activar ${p.name}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground flex items-center gap-2">
        <Lock className="h-3 w-3 text-[var(--rp-yellow)]" aria-hidden />
        Los locks impiden que los locales franquiciados sobreescriban el precio. Click en una celda para (des)bloquear.
      </p>
    </div>
  );
}

/* =========================================================
 * Modo Franquicia
 * =======================================================*/
function FranchiseMode() {
  const { toast } = useToast();
  const [locks, setLocks] = React.useState<Record<LockKey, boolean>>({
    carta: true,
    precios: true,
    promos: false,
    design: true,
    policies: false,
  });
  const [wizardOpen, setWizardOpen] = React.useState(false);

  const toggle = (k: LockKey) => setLocks(prev => ({ ...prev, [k]: !prev[k] }));

  const applyAll = () => {
    toast({ title: "Locks propagados", description: "Configuración heredada por 7 locales franquiciados." });
  };

  return (
    <div className="space-y-5">
      <div className="rp-glass rounded-xl border border-[var(--rp-violet)]/30 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[var(--rp-violet)]/15 p-2">
            <Factory className="h-5 w-5 text-[var(--rp-violet)]" aria-hidden />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium">Modo Franquicia activado</h4>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Control centralizado de marca. Los locales franquiciados heredan configuración bloqueada; no pueden sobreescribirla localmente.
            </p>
          </div>
          <Badge variant="outline" className="border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/10 text-[var(--rp-violet)]">7 locales · 3 marcas</Badge>
        </div>
      </div>

      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-[var(--rp-yellow)]" aria-hidden /> Locks heredables (5)
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Define qué se hereda automáticamente desde marca.</p>
          </div>
          <Button size="sm" className="h-7 bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90" onClick={applyAll}>
            <GitBranch className="h-3.5 w-3.5 mr-1" aria-hidden /> Propagar a 7 locales
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {FRANCHISE_LOCKS.map((lk) => {
            const Icon = lk.icon;
            const active = locks[lk.key];
            return (
              <div key={lk.key} className={cn(
                "rounded-lg border p-3 transition-colors",
                active ? "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/[0.04]" : "border-border/50 bg-foreground/[0.02]"
              )}>
                <div className="flex items-start gap-3">
                  <Icon className={cn("h-4 w-4 mt-0.5", active ? "text-[var(--rp-yellow)]" : "text-muted-foreground")} aria-hidden />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{lk.label}</span>
                      {lk.inherited && active && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 border-[var(--rp-emerald)]/40 text-[var(--rp-emerald)]">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" aria-hidden /> heredado
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{lk.desc}</p>
                  </div>
                  <Switch checked={active} onCheckedChange={() => toggle(lk.key)} aria-label={`Heredar ${lk.label}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> Royalties
          </h4>
          <Badge variant="outline" className="text-[10px]">cobro mensual · día 1</Badge>
        </div>
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border/40">
                <th className="py-2 pr-2 font-medium">Marca</th>
                <th className="py-2 px-2 font-medium text-right">% Royalty</th>
                <th className="py-2 px-2 font-medium text-right">Mensual</th>
                <th className="py-2 px-2 font-medium text-right">Cobrado (mes)</th>
                <th className="py-2 pl-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ROYALTIES.map((r) => (
                <tr key={r.brand} className="border-b border-border/30">
                  <td className="py-2 pr-2 font-medium">{r.brand}</td>
                  <td className="py-2 px-2 text-right font-mono">{r.rate}%</td>
                  <td className="py-2 px-2 text-right font-mono">{euro(r.monthly)}</td>
                  <td className="py-2 px-2 text-right font-mono text-[var(--rp-emerald)]">{euro(r.collected)}</td>
                  <td className="py-2 pl-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-[var(--rp-emerald)]">
                      <CheckCircle2 className="h-3 w-3" aria-hidden /> {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ScrollText className="h-4 w-4 text-[var(--rp-blue)]" aria-hidden />
            <h4 className="text-sm font-medium">Plantillas de alta</h4>
          </div>
          <div className="space-y-2">
            {[
              { name: "Plantilla Premium · España", steps: 12, used: 3 },
              { name: "Plantilla Bistro · Intl", steps: 14, used: 1 },
              { name: "Plantilla Sakura · Iberia", steps: 11, used: 2 },
            ].map((t) => (
              <div key={t.name} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm truncate">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{t.steps} pasos · usada {t.used}× este mes</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]"><Eye className="h-3.5 w-3.5 mr-1" aria-hidden />Ver</Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px]"><Copy className="h-3.5 w-3.5 mr-1" aria-hidden />Duplicar</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rp-glass rounded-xl border border-[var(--rp-violet)]/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="h-4 w-4 text-[var(--rp-violet)]" aria-hidden />
            <h4 className="text-sm font-medium">Asistente de nueva franquicia</h4>
          </div>
          <p className="text-[12px] text-muted-foreground mb-3">
            Crea un nuevo local franquiciado en 5 pasos: datos del franquiciado, ubicación, marca, contrato de royalty y provisioning técnico.
          </p>
          <ol className="space-y-1.5 text-[12px]">
            {["Franquiciado (CIF, contacto, banco)", "Local (dirección, CP, aforo)", "Marca + plantilla", "Contrato + royalty %", "Provisioning + invitación"].map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--rp-violet)]/15 text-[var(--rp-violet)] text-[10px] font-mono">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <Button className="w-full mt-3 bg-[var(--rp-violet)] hover:bg-[var(--rp-violet)]/90 text-white" onClick={() => setWizardOpen(true)}>
            <Wand2 className="h-4 w-4 mr-1" aria-hidden /> Iniciar asistente
          </Button>
        </div>
      </div>

      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-[var(--rp-violet)]" aria-hidden /> Asistente de franquicia
            </DialogTitle>
            <DialogDescription>Demo · 5 pasos. En producción se conecta con Legal y Provisioning.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-md bg-foreground/[0.03] p-3 text-[12px]">
              <div className="font-medium mb-1">Paso 1 de 5 · Datos del franquiciado</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Razón social</Label>
                  <Input placeholder="Ramses Franchise SL" className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-[10px]">CIF</Label>
                  <Input placeholder="B12345678" className="h-8 text-xs" />
                </div>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground">Próximos pasos: ubicación, marca, contrato, provisioning.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWizardOpen(false)}>Cancelar</Button>
            <Button className="bg-[var(--rp-violet)] hover:bg-[var(--rp-violet)]/90 text-white" onClick={() => { setWizardOpen(false); toast({ title: "Franquiciado creado (demo)", description: "Contrato draft disponible en Legal." }); }}>Continuar →</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================
 * Informes consolidados P&L
 * =======================================================*/
function ConsolidatedPnL() {
  const { toast } = useToast();
  const max = Math.max(...CONSOLIDATED_PNL.map(p => Math.abs(p.value)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">P&L consolidado · noviembre 2025</h4>
          <p className="text-[11px] text-muted-foreground">Agrega 7 locales en 3 marcas · EUR</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => toast({ title: "Exportando P&L", description: "XLSX generado · enviado a finance@ramses.com" })}>
            <FileBarChart className="h-3.5 w-3.5 mr-1" aria-hidden /> Exportar XLSX
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => toast({ title: "PDF generado", description: "P&L mensual firmado disponible." })}>
            <ScrollText className="h-3.5 w-3.5 mr-1" aria-hidden /> PDF firmado
          </Button>
        </div>
      </div>

      <div className="rp-glass rounded-xl border border-border/60 p-4 space-y-2">
        {CONSOLIDATED_PNL.map((row) => {
          const isEbitda = row.item === "EBITDA";
          const isIncome = row.value > 0;
          const color = TONE[row.tone];
          const widthPct = (Math.abs(row.value) / max) * 100;
          return (
            <div key={row.item} className={cn("grid grid-cols-12 gap-2 items-center py-1.5", isEbitda && "border-t border-border/40 mt-1 pt-2")}>
              <div className="col-span-5 sm:col-span-4 text-xs">{row.item}</div>
              <div className="col-span-5 sm:col-span-6">
                <div className="relative h-5 rounded-md bg-foreground/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-md"
                    style={{
                      width: `${widthPct}%`,
                      background: isIncome
                        ? `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 50%, transparent))`
                        : `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 50%, transparent))`,
                      marginLeft: isIncome ? 0 : "auto",
                    }}
                  />
                </div>
              </div>
              <div className="col-span-2 text-right font-mono text-xs" style={{ color: isEbitda ? color : isIncome ? "var(--rp-emerald)" : "var(--rp-red)" }}>
                {isIncome ? "+" : "−"}{euro(Math.abs(row.value))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <h4 className="text-sm font-medium mb-3">Margen por marca</h4>
        <div className="space-y-3">
          {ORG.brands.map((b) => {
            const localMrr = b.locals.reduce((s, l) => s + l.mrr, 0);
            const royalty = (localMrr * b.royalty) / 100;
            const margin = Math.round(localMrr * 0.62 - royalty);
            const marginPct = Math.round((margin / localMrr) * 100);
            return (
              <div key={b.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm" style={{ background: b.color }} aria-hidden />
                    <span className="font-medium">{b.name}</span>
                    <span className="text-muted-foreground">{b.locals.length} locales</span>
                  </span>
                  <span className="font-mono text-[var(--rp-emerald)]">{euro(margin)} · {marginPct}%</span>
                </div>
                <Progress value={marginPct} className="h-1.5" style={{ ["--progress-foreground" as string]: b.color }} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rp-glass rounded-xl border border-[var(--rp-emerald)]/30 p-3">
          <TrendingUp className="h-4 w-4 text-[var(--rp-emerald)] mb-1" aria-hidden />
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Mejor local</div>
          <div className="text-sm font-medium">Sakura Madrid</div>
          <div className="text-[11px] text-[var(--rp-emerald)]">+8.4% vs mes anterior</div>
        </div>
        <div className="rp-glass rounded-xl border border-[var(--rp-yellow)]/30 p-3">
          <AlertTriangle className="h-4 w-4 text-[var(--rp-yellow)] mb-1" aria-hidden />
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Atención</div>
          <div className="text-sm font-medium">Bistro Málaga</div>
          <div className="text-[11px] text-[var(--rp-yellow)]">Margen 12% · bajo umbral (15%)</div>
        </div>
        <div className="rp-glass rounded-xl border border-[var(--rp-violet)]/30 p-3">
          <Layers className="h-4 w-4 text-[var(--rp-violet)] mb-1" aria-hidden />
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Marca más rentable</div>
          <div className="text-sm font-medium">Sakura by Ramses</div>
          <div className="text-[11px] text-[var(--rp-violet)]">Margen 68% · 2 locales</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Local detail sheet
 * =======================================================*/
interface LocalDetail extends LocalNode {
  brandName: string;
  brandColor: string;
  royalty: number;
}

function LocalDetailSheet({ localId, onClose }: { localId: string | null; onClose: () => void }) {
  const local = React.useMemo<LocalDetail | null>(() => {
    if (!localId) return null;
    for (const b of ORG.brands) {
      const match = b.locals.find(l => l.id === localId);
      if (match) {
        const detail: LocalDetail = {
          ...match,
          brandName: b.name,
          brandColor: b.color,
          royalty: b.royalty,
        };
        return detail;
      }
    }
    return null;
  }, [localId]);

  return (
    <Sheet open={!!localId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto rp-scroll-thin">
        {local && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-3 w-3 rounded-sm" style={{ background: local.brandColor }} aria-hidden />
                <SheetTitle className="text-base">{local.name}</SheetTitle>
              </div>
              <SheetDescription>
                {local.brandName} · {local.city} · royalty {local.royalty}%
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-6 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md bg-foreground/[0.04] p-2">
                  <div className="text-[10px] uppercase text-muted-foreground font-mono">MRR</div>
                  <div className="text-sm font-medium text-[var(--rp-emerald)]">{euro(local.mrr)}</div>
                </div>
                <div className="rounded-md bg-foreground/[0.04] p-2">
                  <div className="text-[10px] uppercase text-muted-foreground font-mono">Plazas</div>
                  <div className="text-sm font-medium">{local.seats}</div>
                </div>
                <div className="rounded-md bg-foreground/[0.04] p-2">
                  <div className="text-[10px] uppercase text-muted-foreground font-mono">Health</div>
                  <div className="text-sm font-medium flex items-center gap-1"><HealthDot score={local.health} />{local.health}</div>
                </div>
              </div>
              <Separator />
              <div>
                <h5 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">Estado operativo</h5>
                <StatusPill status={local.status} />
              </div>
              <Separator />
              <div>
                <h5 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">Inheritance (locks)</h5>
                <div className="space-y-1.5">
                  {FRANCHISE_LOCKS.map((lk) => (
                    <div key={lk.key} className="flex items-center gap-2 text-[12px]">
                      {lk.inherited
                        ? <Lock className="h-3 w-3 text-[var(--rp-yellow)]" aria-hidden />
                        : <Unlock className="h-3 w-3 text-muted-foreground" aria-hidden />}
                      <span className="flex-1">{lk.label}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{lk.inherited ? "heredado" : "override local"}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90">
                  <ArrowLeftRight className="h-3.5 w-3.5 mr-1" aria-hidden /> Impersonar
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Globe2 className="h-3.5 w-3.5 mr-1" aria-hidden /> Abrir local
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function MultiLocalView() {
  const [expandedBrands, setExpandedBrands] = React.useState<Record<string, boolean>>({ b1: true, b2: true, b3: true });
  const [selectedLocalId, setSelectedLocalId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("dashboard");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--rp-emerald)]/15 p-2">
            <Building2 className="h-5 w-5 text-[var(--rp-emerald)]" aria-hidden />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight">Multi-local &amp; Franquicia</h2>
            <p className="text-xs text-muted-foreground">Gestiona marca, locales y red de franquicias con carta central y P&amp;L consolidado.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="border-[var(--rp-emerald)]/40 text-[var(--rp-emerald)]">
            <Crown className="h-3 w-3 mr-1" aria-hidden /> {ORG.plan}
          </Badge>
          <Badge variant="outline">{ORG.brands.length} marcas · {ORG.brands.reduce((s, b) => s + b.locals.length, 0)} locales</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        <aside className="rp-glass rounded-xl border border-border/60 p-3 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto rp-scroll-thin">
          <div className="flex items-center gap-2 mb-3">
            <TreePine className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden />
            <h3 className="text-sm font-medium">Jerarquía</h3>
          </div>
          <OrgTree
            selectedLocalId={selectedLocalId}
            onSelectLocal={setSelectedLocalId}
            expandedBrands={expandedBrands}
            onToggleBrand={(id) => setExpandedBrands(prev => ({ ...prev, [id]: !(prev[id] ?? true) }))}
          />
        </aside>

        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto rp-scroll-thin h-9">
              <TabsTrigger value="dashboard" className="text-xs">
                <Globe2 className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Dashboard global
              </TabsTrigger>
              <TabsTrigger value="carta" className="text-xs">
                <ChefHat className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Carta central
              </TabsTrigger>
              <TabsTrigger value="franquicia" className="text-xs">
                <Factory className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Modo franquicia
              </TabsTrigger>
              <TabsTrigger value="pnl" className="text-xs">
                <FileBarChart className="h-3.5 w-3.5 mr-1.5" aria-hidden /> P&amp;L consolidado
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-4">
              <GlobalDashboard />
            </TabsContent>
            <TabsContent value="carta" className="mt-4">
              <CentralCarta />
            </TabsContent>
            <TabsContent value="franquicia" className="mt-4">
              <FranchiseMode />
            </TabsContent>
            <TabsContent value="pnl" className="mt-4">
              <ConsolidatedPnL />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <LocalDetailSheet localId={selectedLocalId} onClose={() => setSelectedLocalId(null)} />
    </div>
  );
}

export default MultiLocalView;
