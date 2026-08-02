"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Globe2, MapPin, ZoomIn, ZoomOut, RotateCcw, Building2, DollarSign,
  TrendingUp, AlertTriangle, Users, ChevronRight, Maximize2, Crosshair,
  Layers,
} from "lucide-react";

/* ---------------- shared bits ---------------- */


/* ---------------- types ---------------- */
type LocStatus = "healthy" | "warning" | "critical";
type Plan = "Starter" | "Pro" | "Enterprise";

interface MapLoc {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  org: string;
  lat: number;
  lon: number;
  revenue: number;        // €/mes
  reservations: number;   // last 30 days
  plan: Plan;
  churnRisk: "bajo" | "medio" | "alto" | "crítico";
  status: LocStatus;
  occupancy: number;      // %
}

/* ---------------- lat/long → svg ---------------- */
function project(lat: number, lon: number): { x: number; y: number } {
  // equirectangular, viewBox 1000x500
  const x = (lon + 180) * (1000 / 360);
  const y = (90 - lat) * (500 / 180);
  return { x, y };
}

/* ---------------- demo locations ---------------- */
const LOCATIONS: MapLoc[] = [
  { id: "l1",  city: "Madrid",       country: "España",   countryCode: "ES", org: "Ramses Group",         lat: 40.4,  lon: -3.7,  revenue: 18400, reservations: 384, plan: "Pro",        churnRisk: "bajo",    status: "healthy",  occupancy: 92 },
  { id: "l2",  city: "Barcelona",    country: "España",   countryCode: "ES", org: "Ramses Group",         lat: 41.4,  lon: 2.2,   revenue: 12200, reservations: 312, plan: "Pro",        churnRisk: "medio",   status: "warning",  occupancy: 78 },
  { id: "l3",  city: "Valencia",     country: "España",   countryCode: "ES", org: "Ramses Group",         lat: 39.5,  lon: -0.4,  revenue: 8100,  reservations: 248, plan: "Starter",    churnRisk: "bajo",    status: "healthy",  occupancy: 84 },
  { id: "l4",  city: "Sevilla",      country: "España",   countryCode: "ES", org: "El Club del Chef",     lat: 37.4,  lon: -6.0,  revenue: 4200,  reservations: 142, plan: "Starter",    churnRisk: "bajo",    status: "healthy",  occupancy: 71 },
  { id: "l5",  city: "Bilbao",       country: "España",   countryCode: "ES", org: "Mar & Sol",            lat: 43.3,  lon: -2.9,  revenue: 6800,  reservations: 198, plan: "Pro",        churnRisk: "bajo",    status: "healthy",  occupancy: 81 },
  { id: "l6",  city: "Lisboa",       country: "Portugal", countryCode: "PT", org: "Café Central",         lat: 38.7,  lon: -9.1,  revenue: 3400,  reservations: 96,  plan: "Starter",    churnRisk: "medio",   status: "warning",  occupancy: 64 },
  { id: "l7",  city: "París",        country: "Francia",  countryCode: "FR", org: "Brasserie Lumière",    lat: 48.9,  lon: 2.4,   revenue: 11500, reservations: 287, plan: "Pro",        churnRisk: "bajo",    status: "healthy",  occupancy: 88 },
  { id: "l8",  city: "Londres",      country: "UK",       countryCode: "UK", org: "Wok Republic",         lat: 51.5,  lon: -0.1,  revenue: 22300, reservations: 478, plan: "Enterprise", churnRisk: "bajo",    status: "healthy",  occupancy: 94 },
  { id: "l9",  city: "Roma",         country: "Italia",   countryCode: "IT", org: "Trattoria Bellini",    lat: 41.9,  lon: 12.5,  revenue: 5600,  reservations: 124, plan: "Starter",    churnRisk: "crítico", status: "critical", occupancy: 52 },
  { id: "l10", city: "Milano",       country: "Italia",   countryCode: "IT", org: "Trattoria Bellini",    lat: 45.5,  lon: 9.2,   revenue: 4900,  reservations: 108, plan: "Starter",    churnRisk: "alto",    status: "warning",  occupancy: 58 },
  { id: "l11", city: "México DF",    country: "México",   countryCode: "MX", org: "Grupo Gastrolateral",  lat: 19.4,  lon: -99.1, revenue: 14200, reservations: 342, plan: "Pro",        churnRisk: "bajo",    status: "healthy",  occupancy: 89 },
  { id: "l12", city: "Guadalajara",  country: "México",   countryCode: "MX", org: "Taco Loco",            lat: 20.7,  lon: -103.3,revenue: 7800,  reservations: 218, plan: "Pro",        churnRisk: "bajo",    status: "healthy",  occupancy: 82 },
  { id: "l13", city: "Buenos Aires", country: "Argentina",countryCode: "AR", org: "La Tagliatella",       lat: -34.6, lon: -58.4, revenue: 9800,  reservations: 234, plan: "Pro",        churnRisk: "crítico", status: "critical", occupancy: 48 },
  { id: "l14", city: "Córdoba",      country: "Argentina",countryCode: "AR", org: "Parrilla Sur",         lat: -31.4, lon: -64.2, revenue: 2400,  reservations: 62,  plan: "Starter",    churnRisk: "crítico", status: "critical", occupancy: 41 },
  { id: "l15", city: "Bogotá",       country: "Colombia", countryCode: "CO", org: "Sushi Bar Tokyo",      lat: 4.7,   lon: -74.1, revenue: 6400,  reservations: 174, plan: "Starter",    churnRisk: "bajo",    status: "healthy",  occupancy: 76 },
  { id: "l16", city: "Medellín",     country: "Colombia", countryCode: "CO", org: "Sushi Bar Tokyo",      lat: 6.2,   lon: -75.6, revenue: 5200,  reservations: 152, plan: "Starter",    churnRisk: "medio",   status: "warning",  occupancy: 69 },
  { id: "l17", city: "Santiago",     country: "Chile",    countryCode: "CL", org: "Beach Club",           lat: -33.4, lon: -70.6, revenue: 7200,  reservations: 196, plan: "Pro",        churnRisk: "medio",   status: "warning",  occupancy: 73 },
  { id: "l18", city: "São Paulo",    country: "Brasil",   countryCode: "BR", org: "Fogo & Fogo",          lat: -23.5, lon: -46.6, revenue: 13600, reservations: 328, plan: "Pro",        churnRisk: "bajo",    status: "healthy",  occupancy: 86 },
  { id: "l19", city: "Miami",        country: "USA",      countryCode: "US", org: "Casa Havana",          lat: 25.8,  lon: -80.2, revenue: 16800, reservations: 412, plan: "Enterprise", churnRisk: "bajo",    status: "healthy",  occupancy: 91 },
  { id: "l20", city: "Tokio",        country: "Japón",    countryCode: "JP", org: "Sakura Sushi",         lat: 35.7,  lon: 139.7, revenue: 19400, reservations: 467, plan: "Enterprise", churnRisk: "bajo",    status: "healthy",  occupancy: 93 },
];

/* ---------------- region summary (platform-wide) ---------------- */
const REGIONS = [
  { country: "España",   flag: "🇪🇸", locales: 187, revenue: 412800, occupancy: 84, churnRisk: "bajo" as const },
  { country: "México",   flag: "🇲🇽", locales: 89,  revenue: 198400, occupancy: 81, churnRisk: "bajo" as const },
  { country: "Argentina",flag: "🇦🇷", locales: 45,  revenue: 84200,  occupancy: 54, churnRisk: "crítico" as const },
  { country: "Colombia", flag: "🇨🇴", locales: 32,  revenue: 64800,  occupancy: 72, churnRisk: "medio" as const },
  { country: "Chile",    flag: "🇨🇱", locales: 18,  revenue: 38600,  occupancy: 68, churnRisk: "medio" as const },
];

/* ---------------- status helpers ---------------- */
function statusColor(s: LocStatus) {
  return s === "healthy" ? "#10b981" : s === "warning" ? "#f59e0b" : "#f43f5e";
}
function statusLabel(s: LocStatus) {
  return s === "healthy" ? "Saludable" : s === "warning" ? "Atención" : "Crítico";
}
function riskCls(r: MapLoc["churnRisk"]) {
  return r === "bajo" ? "text-emerald-300"
    : r === "medio" ? "text-amber-300"
    : r === "alto" ? "text-orange-300"
    : "text-rose-300";
}

/* ---------------- continent paths (stylized) ---------------- */
const CONTINENTS = (
  <g fill="currentColor" opacity={0.9}>
    {/* North America */}
    <path d="M 110,95 Q 140,80 180,82 L 230,88 Q 260,92 275,110 L 282,140 Q 278,165 265,185 L 250,205 Q 230,218 205,220 L 175,215 Q 150,205 130,185 L 115,160 Q 105,135 108,115 Z" />
    {/* Central America */}
    <path d="M 220,200 Q 235,210 248,225 L 255,240 Q 250,248 240,245 L 225,235 Q 218,220 220,205 Z" />
    {/* South America */}
    <path d="M 268,232 Q 295,228 318,238 L 340,255 Q 348,280 350,310 L 345,350 Q 335,390 315,420 L 295,438 Q 278,432 272,410 L 268,380 Q 262,340 260,300 L 262,260 Z" />
    {/* Europe */}
    <path d="M 462,108 Q 485,102 510,104 L 540,108 Q 558,118 560,138 L 555,158 Q 540,172 515,175 L 488,172 Q 468,162 462,145 L 460,125 Z" />
    {/* Africa */}
    <path d="M 478,182 Q 510,178 545,184 L 575,200 Q 585,225 582,255 L 575,290 Q 560,320 535,335 L 510,332 Q 488,318 480,290 L 475,255 Q 472,220 475,195 Z" />
    {/* Asia */}
    <path d="M 560,92 Q 620,82 690,86 L 760,95 Q 820,108 845,130 L 840,165 Q 820,195 780,210 L 730,215 Q 690,212 650,200 L 605,185 Q 575,170 565,145 L 558,118 Z" />
    {/* Southeast Asia / India peninsula */}
    <path d="M 660,210 Q 690,225 705,250 L 700,270 Q 685,275 672,265 L 660,245 Z" />
    {/* Oceania */}
    <path d="M 790,318 Q 820,312 855,318 L 880,330 Q 885,348 875,365 L 850,372 Q 815,370 795,358 L 785,340 Z" />
    {/* Japan */}
    <path d="M 880,142 Q 892,148 895,160 L 892,172 Q 884,176 880,168 L 876,155 Z" />
    {/* UK / Ireland */}
    <path d="M 492,108 Q 500,105 504,112 L 502,122 Q 496,125 491,120 Z" />
  </g>
);

/* ---------------- WorldMap ---------------- */
interface Cluster {
  x: number;
  y: number;
  count: number;
  status: LocStatus;
  locs: MapLoc[];
  country: string;
}

function buildClusters(locs: MapLoc[]): Cluster[] {
  // cluster by country
  const byCountry = new Map<string, MapLoc[]>();
  for (const l of locs) {
    const arr = byCountry.get(l.country) || [];
    arr.push(l);
    byCountry.set(l.country, arr);
  }
  const clusters: Cluster[] = [];
  for (const [country, group] of byCountry) {
    const avgX = group.reduce((a, l) => a + project(l.lat, l.lon).x, 0) / group.length;
    const avgY = group.reduce((a, l) => a + project(l.lat, l.lon).y, 0) / group.length;
    // cluster status = worst status in group
    const status: LocStatus = group.some((l) => l.status === "critical") ? "critical"
      : group.some((l) => l.status === "warning") ? "warning"
      : "healthy";
    clusters.push({ x: avgX, y: avgY, count: group.length, status, locs: group, country });
  }
  return clusters;
}

function revenueToRadius(revenue: number) {
  // €2k → 4px, €25k → 11px
  const min = 2000, max = 25000;
  const t = Math.max(0, Math.min(1, (revenue - min) / (max - min)));
  return 4 + t * 7;
}

function WorldMap({
  locations, zoom, onLocClick, hovered, setHovered,
}: {
  locations: MapLoc[];
  zoom: number;
  onLocClick: (l: MapLoc) => void;
  hovered: string | null;
  setHovered: (id: string | null) => void;
}) {
  const showClusters = zoom < 1.6;
  const clusters = React.useMemo(() => buildClusters(locations), [locations]);

  // transform origin ~ center of europe
  const cx = 500, cy = 220;
  const transform = `translate(${cx} ${cy}) scale(${zoom}) translate(${-cx} ${-cy})`;

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-auto"
        style={{ minHeight: 280 }}
        role="img"
        aria-label="Mapa global de locales RestoPanel"
      >
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="40%" r="80%">
            <stop offset="0%" stopColor="#0f1419" />
            <stop offset="100%" stopColor="#080a0e" />
          </radialGradient>
          <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ocean background */}
        <rect x="0" y="0" width="1000" height="500" fill="url(#oceanGrad)" />

        {/* subtle grid (lat/long lines) */}
        <g stroke="currentColor" strokeWidth="0.5" opacity={0.04} className="text-foreground">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} x1={i * 125} y1="0" x2={i * 125} y2="500" />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 125} x2="1000" y2={i * 125} />
          ))}
        </g>

        {/* continents */}
        <g transform={transform} className="text-foreground/12">
          {CONTINENTS}
        </g>

        {/* dots / clusters */}
        <g transform={transform}>
          {showClusters ? (
            clusters.map((c, i) => (
              <ClusterDot
                key={`c-${i}`}
                cluster={c}
                onHover={(h) => setHovered(h ? `cluster-${i}` : null)}
                isHovered={hovered === `cluster-${i}`}
                onClick={() => {
                  // open first loc in cluster as representative
                  if (c.locs[0]) onLocClick(c.locs[0]);
                }}
              />
            ))
          ) : (
            locations.map((l) => (
              <LocDot
                key={l.id}
                loc={l}
                onHover={(h) => setHovered(h ? l.id : null)}
                isHovered={hovered === l.id}
                onClick={() => onLocClick(l)}
              />
            ))
          )}
        </g>
      </svg>

      {/* hovered tooltip (HTML overlay for crispness) */}
      <AnimatePresence>
        {hovered && (
          <HoverTooltip
            loc={showClusters
              ? clusters.find((_, i) => `cluster-${i}` === hovered)?.locs[0] || null
              : locations.find((l) => l.id === hovered) || null
            }
            cluster={showClusters ? clusters.find((_, i) => `cluster-${i}` === hovered) ?? null : null}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Cluster dot ---------------- */
function ClusterDot({ cluster, onHover, isHovered, onClick }: {
  cluster: Cluster;
  onHover: (h: boolean) => void;
  isHovered: boolean;
  onClick: () => void;
}) {
  const r = 8 + Math.min(cluster.count, 6) * 1.5;
  const color = statusColor(cluster.status);
  return (
    <g
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      style={{ cursor: "pointer" }}
      tabIndex={0}
      role="button"
      aria-label={`${cluster.country}: ${cluster.count} locales`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      <circle cx={cluster.x} cy={cluster.y} r={r + 8} fill={color} opacity={0.12} />
      <circle cx={cluster.x} cy={cluster.y} r={r + 3} fill={color} opacity={0.25}>
        {isHovered && (
          <animate attributeName="r" values={`${r + 3};${r + 7};${r + 3}`} dur="1.6s" repeatCount="indefinite" />
        )}
      </circle>
      <circle
        cx={cluster.x}
        cy={cluster.y}
        r={r}
        fill={color}
        stroke="white"
        strokeWidth={1.5}
        filter="url(#dotGlow)"
      />
      <text
        x={cluster.x}
        y={cluster.y + 4}
        textAnchor="middle"
        className="font-mono"
        fontSize={r > 11 ? 11 : 9}
        fontWeight={700}
        fill="white"
      >
        {cluster.count}
      </text>
    </g>
  );
}

/* ---------------- Location dot ---------------- */
function LocDot({ loc, onHover, isHovered, onClick }: {
  loc: MapLoc;
  onHover: (h: boolean) => void;
  isHovered: boolean;
  onClick: () => void;
}) {
  const { x, y } = project(loc.lat, loc.lon);
  const r = revenueToRadius(loc.revenue);
  const color = statusColor(loc.status);
  return (
    <g
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      style={{ cursor: "pointer" }}
      tabIndex={0}
      role="button"
      aria-label={`${loc.city}, ${loc.country}: ${loc.org}, €${loc.revenue.toLocaleString("es-ES")}/mes`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      {/* halo */}
      <circle cx={x} cy={y} r={r + 6} fill={color} opacity={0.1} />
      <circle cx={x} cy={y} r={r + 2} fill={color} opacity={0.25}>
        {isHovered && (
          <animate attributeName="r" values={`${r + 2};${r + 6};${r + 2}`} dur="1.4s" repeatCount="indefinite" />
        )}
      </circle>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={color}
        stroke="white"
        strokeWidth={1.2}
        filter="url(#dotGlow)"
      />
      {isHovered && (
        <g pointerEvents="none">
          <text x={x} y={y - r - 6} textAnchor="middle" fontSize={10} className="font-mono" fill="white" stroke="#000" strokeWidth={3} paintOrder="stroke">
            {loc.city}
          </text>
        </g>
      )}
    </g>
  );
}

/* ---------------- Hover tooltip ---------------- */
function HoverTooltip({ loc, cluster }: { loc: MapLoc | null; cluster: Cluster | null }) {
  if (!loc) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className="absolute top-3 right-3 sm:left-3 sm:right-auto rp-glass-strong rounded-xl p-3 w-56 pointer-events-none shadow-2xl z-20"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2 w-2 rounded-full" style={{ background: statusColor(loc.status) }} />
        <span className="text-sm font-medium">{loc.city}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{loc.countryCode}</span>
      </div>
      <dl className="space-y-1.5 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Org</dt>
          <dd className="font-medium text-right">{loc.org}</dd>
        </div>
        {cluster && cluster.count > 1 && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Locales en {cluster.country}</dt>
            <dd className="font-mono">{cluster.count}</dd>
          </div>
        )}
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Ingresos</dt>
          <dd className="font-mono rp-gold-text">€{loc.revenue.toLocaleString("es-ES")}/mes</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Reservas 30d</dt>
          <dd className="font-mono">{loc.reservations}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="font-mono">{loc.plan}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Ocupación</dt>
          <dd className="font-mono">{loc.occupancy}%</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Riesgo churn</dt>
          <dd className={cn("font-mono capitalize", riskCls(loc.churnRisk))}>{loc.churnRisk}</dd>
        </div>
      </dl>
      <div className="mt-2 pt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground flex items-center gap-1">
        <MapPin className="h-2.5 w-2.5" aria-hidden />
        Click para ver ficha
      </div>
    </motion.div>
  );
}

/* ---------------- Location detail dialog ---------------- */
function LocDialog({ loc, open, onOpenChange }: { loc: MapLoc | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  if (!loc) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColor(loc.status) }} />
            {loc.city}
            <span className="text-[10px] font-mono text-muted-foreground">{loc.countryCode}</span>
            
          </DialogTitle>
          <DialogDescription>
            {loc.country} · {loc.org} · {statusLabel(loc.status)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Plan</span>
            <Badge variant="outline" className={cn(
              "text-[10px] font-mono",
              loc.plan === "Enterprise" ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
              : loc.plan === "Pro" ? "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]"
              : "border-border/60 bg-foreground/5 text-muted-foreground"
            )}>
              {loc.plan}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-foreground/[0.04] border border-border/30 px-2.5 py-2">
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Ingresos</div>
              <div className="text-sm font-mono rp-gold-text mt-0.5">€{loc.revenue.toLocaleString("es-ES")}</div>
              <div className="text-[10px] text-muted-foreground">por mes</div>
            </div>
            <div className="rounded-md bg-foreground/[0.04] border border-border/30 px-2.5 py-2">
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Reservas</div>
              <div className="text-sm font-mono rp-teal-text mt-0.5">{loc.reservations}</div>
              <div className="text-[10px] text-muted-foreground">últimos 30 días</div>
            </div>
            <div className="rounded-md bg-foreground/[0.04] border border-border/30 px-2.5 py-2">
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Ocupación</div>
              <div className="text-sm font-mono mt-0.5">{loc.occupancy}%</div>
              <div className="h-1 rounded-full bg-foreground/10 mt-1 overflow-hidden">
                <div className={cn("h-full rounded-full", loc.occupancy > 80 ? "bg-emerald-400" : loc.occupancy > 60 ? "bg-amber-400" : "bg-rose-400")} style={{ width: `${loc.occupancy}%` }} />
              </div>
            </div>
            <div className="rounded-md bg-foreground/[0.04] border border-border/30 px-2.5 py-2">
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Riesgo churn</div>
              <div className={cn("text-sm font-mono mt-0.5 capitalize", riskCls(loc.churnRisk))}>{loc.churnRisk}</div>
              <div className="text-[10px] text-muted-foreground">{statusLabel(loc.status)}</div>
            </div>
          </div>

          <div className="rounded-md border border-border/30 bg-foreground/[0.02] p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            <span className="font-mono">{loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}° · coordenadas demo</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cerrar</Button>
          <Button
            size="sm"
            className="bg-amber-500/90 hover:bg-amber-500 text-amber-950"
            onClick={() => {
              onOpenChange(false);
              toast({
                title: "Abriendo ficha de organización",
                description: <code className="font-mono text-xs">{loc.org}</code>,
              });
            }}
          >
            Ver ficha org
            <ChevronRight className="h-3.5 w-3.5 ml-1" aria-hidden />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Main export ---------------- */
export function CcWorldMap() {
  const [planFilter, setPlanFilter] = React.useState<"all" | Plan>("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | LocStatus>("all");
  const [countryFilter, setCountryFilter] = React.useState<string>("all");
  const [revenueRange, setRevenueRange] = React.useState<number[]>([0, 25000]);
  const [zoom, setZoom] = React.useState(1);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<MapLoc | null>(null);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const countries = React.useMemo(() => {
    const set = new Set(LOCATIONS.map((l) => l.country));
    return ["all", ...Array.from(set).sort()];
  }, []);

  const filtered = React.useMemo(() => {
    return LOCATIONS.filter((l) => {
      if (planFilter !== "all" && l.plan !== planFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (countryFilter !== "all" && l.country !== countryFilter) return false;
      if (l.revenue < revenueRange[0] || l.revenue > revenueRange[1]) return false;
      return true;
    });
  }, [planFilter, statusFilter, countryFilter, revenueRange]);

  const stats = React.useMemo(() => ({
    orgs: 324,
    locales: 487,
    countries: new Set(LOCATIONS.map((l) => l.country)).size,
    filteredCount: filtered.length,
  }), [filtered]);

  const handleLocClick = (l: MapLoc) => {
    setSelected(l);
    setPopoverOpen(true);
  };

  const resetView = () => {
    setZoom(1);
    setPlanFilter("all");
    setStatusFilter("all");
    setCountryFilter("all");
    setRevenueRange([0, 25000]);
  };

  return (
    <section aria-label="Mapa global" className="space-y-4">
      {/* Header */}
      <div className="rp-glass-strong rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-[var(--teal)]/10 border border-[var(--teal)]/25 text-[var(--teal)] flex items-center justify-center shrink-0">
              <Globe2 className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg sm:text-xl font-medium tracking-tight">Mapa global</h3>
                
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Distribución geográfica de locales · {stats.filteredCount} visibles
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2 text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Orgs</div>
              <div className="font-display text-xl font-light rp-gold-text">{stats.orgs}</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2 text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Locales</div>
              <div className="font-display text-xl font-light rp-teal-text">{stats.locales}</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2 text-center">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Países</div>
              <div className="font-display text-xl font-light text-foreground">{stats.countries}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rp-glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* plan */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5">Plan</label>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "Starter", "Pro", "Enterprise"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlanFilter(p)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-mono transition-colors min-h-[36px]",
                    planFilter === p
                      ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                      : "border-border/40 bg-foreground/[0.02] text-muted-foreground hover:bg-foreground/[0.05]"
                  )}
                >
                  {p === "all" ? "Todos" : p}
                </button>
              ))}
            </div>
          </div>
          {/* status */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5">Estado</label>
            <div className="flex flex-wrap gap-1.5">
              {([
                { v: "all", l: "Todos", c: "text-foreground", dot: "" },
                { v: "healthy", l: "Saludable", c: "text-emerald-300", dot: "bg-emerald-400" },
                { v: "warning", l: "Atención", c: "text-amber-300", dot: "bg-amber-400" },
                { v: "critical", l: "Crítico", c: "text-rose-300", dot: "bg-rose-400" },
              ] as const).map((s) => (
                <button
                  key={s.v}
                  onClick={() => setStatusFilter(s.v)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-mono transition-colors min-h-[36px] flex items-center gap-1.5",
                    statusFilter === s.v
                      ? "border-current bg-current/10"
                      : "border-border/40 bg-foreground/[0.02] text-muted-foreground hover:bg-foreground/[0.05]",
                    statusFilter === s.v && s.c
                  )}
                >
                  {s.v !== "all" && <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />}
                  {s.l}
                </button>
              ))}
            </div>
          </div>
          {/* country */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5">País</label>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="h-9" aria-label="Filtrar por país">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c === "all" ? "Todos los países" : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* revenue range */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5">
              Ingresos: €{revenueRange[0].toLocaleString("es-ES")} – €{revenueRange[1].toLocaleString("es-ES")}
            </label>
            <div className="pt-2.5 min-h-[36px]">
              <Slider
                value={revenueRange}
                min={0}
                max={25000}
                step={500}
                onValueChange={setRevenueRange}
                aria-label="Rango de ingresos"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Map + controls */}
      <div className="rp-glass rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Saludable</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Atención</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> Crítico</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground hidden sm:block">
            Tamaño ∝ ingresos
          </span>
        </div>

        <div className="relative overflow-x-auto rp-scroll-thin rounded-lg bg-background/40">
          <WorldMap
            locations={filtered}
            zoom={zoom}
            onLocClick={handleLocClick}
            hovered={hovered}
            setHovered={setHovered}
          />

          {/* Zoom controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-card/80 backdrop-blur-md border-border/60"
              onClick={() => setZoom((z) => Math.min(4, +(z + 0.5).toFixed(2)))}
              disabled={zoom >= 4}
              aria-label="Acercar"
            >
              <ZoomIn className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-card/80 backdrop-blur-md border-border/60"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(2)))}
              disabled={zoom <= 1}
              aria-label="Alejar"
            >
              <ZoomOut className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-card/80 backdrop-blur-md border-border/60"
              onClick={resetView}
              aria-label="Restablecer vista"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-3 right-3 z-10 rounded-md bg-card/80 backdrop-blur-md border border-border/60 px-2 py-1 text-[10px] font-mono text-muted-foreground">
            {zoom < 1.6 ? "Vista cluster" : `Zoom ${zoom.toFixed(1)}x`}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/60 backdrop-blur-sm">
              <div className="text-center">
                <Crosshair className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" aria-hidden />
                <p className="text-sm text-muted-foreground">No hay locales con los filtros actuales.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={resetView}>
                  <RotateCcw className="h-3 w-3 mr-1.5" aria-hidden />
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Maximize2 className="h-3 w-3" aria-hidden />
            Tamaño = ingresos mensuales
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/30" /> €2k
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3.5 w-3.5 rounded-full bg-foreground/40" /> €10k
            </span>
            <span className="flex items-center gap-1">
              <span className="h-4 w-4 rounded-full bg-foreground/50" /> €25k+
            </span>
          </span>
          <span className="sm:ml-auto flex items-center gap-1.5">
            <Layers className="h-3 w-3" aria-hidden />
            {zoom < 1.6 ? "Agrupado por país · zoom para ver locales" : "Locales individuales"}
          </span>
        </div>
      </div>

      {/* Regions summary */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Top 5 países · resumen regional (dato demo)
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {REGIONS.map((r, i) => (
            <motion.div
              key={r.country}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="rp-glass rounded-xl p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden>{r.flag}</span>
                  <span className="text-sm font-medium">{r.country}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-light rp-gold-text">{r.locales}</span>
                <span className="text-[10px] font-mono text-muted-foreground">locales</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" aria-hidden />
                    Ingresos
                  </span>
                  <span className="font-mono rp-gold-text">€{r.revenue.toLocaleString("es-ES")}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" aria-hidden />
                    Ocupación
                  </span>
                  <span className="font-mono">{r.occupancy}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" aria-hidden />
                    Churn
                  </span>
                  <span className={cn("font-mono capitalize", riskCls(r.churnRisk))}>{r.churnRisk}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-[11px] font-mono text-muted-foreground text-center pt-2 flex items-center justify-center gap-2">
        <Users className="h-3 w-3" aria-hidden />
        Mapa demo · 20 locales representativos · coordenadas aproximadas
      </div>

      {/* Dialog for selected location */}
      <LocDialog loc={selected} open={popoverOpen} onOpenChange={setPopoverOpen} />
    </section>
  );
}
