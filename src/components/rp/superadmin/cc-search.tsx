"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Building2,
  Store,
  Users,
  CalendarCheck,
  FileText,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  X,
  SlidersHorizontal,
  Star,
  TrendingUp,
} from "lucide-react";

/* ---------------- shared bits ---------------- */
function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider",
        className
      )}
    >
      demo
    </Badge>
  );
}

/* ---------------- types ---------------- */
type EntityType =
  | "org"
  | "local"
  | "cliente"
  | "reserva"
  | "factura"
  | "incidencia"
  | "doc";

interface SearchResult {
  id: string;
  type: EntityType;
  title: string;
  subtitle: string;
  metadata: string;
  meta2?: string;
  tags?: string[];
}

/* ---------------- demo data ---------------- */
const DATA: SearchResult[] = [
  // Organizaciones (3)
  {
    id: "o1",
    type: "org",
    title: "Ramses Group",
    subtitle: "Plan Enterprise · 6 locales",
    metadata: "MRR 1.490€ · activa",
    meta2: "Owner: Ana Martínez",
    tags: ["VIP", "Enterprise"],
  },
  {
    id: "o2",
    type: "org",
    title: "Sakura Sushi Chain",
    subtitle: "Plan Enterprise · 12 locales",
    metadata: "MRR 2.980€ · activa",
    meta2: "Owner: Hiroshi Tanaka",
    tags: ["Enterprise"],
  },
  {
    id: "o3",
    type: "org",
    title: "Beach Club Marbella",
    subtitle: "Plan Professional · 3 locales",
    metadata: "MRR 447€ · activa",
    meta2: "Owner: Carlos Pérez",
    tags: ["Professional"],
  },
  // Locales (2)
  {
    id: "l1",
    type: "local",
    title: "Ramses Barcelona Eixample",
    subtitle: "Ramses Group · Barcelona",
    metadata: "Operativo · 84 mesas",
    tags: ["VIP"],
  },
  {
    id: "l2",
    type: "local",
    title: "Sakura Ginza Premium",
    subtitle: "Sakura Sushi Chain · Madrid",
    metadata: "Operativo · 56 mesas",
  },
  // Clientes (4)
  {
    id: "c1",
    type: "cliente",
    title: "Elena Marín Ruiz",
    subtitle: "elena.marin@example.com",
    metadata: "Ramses Group · 24 visitas",
    meta2: "LTV 1.840€",
    tags: ["VIP"],
  },
  {
    id: "c2",
    type: "cliente",
    title: "Andrés Vidal Soto",
    subtitle: "andres.vidal@example.com",
    metadata: "Beach Club Marbella · 18 visitas",
    meta2: "LTV 1.320€",
    tags: ["VIP"],
  },
  {
    id: "c3",
    type: "cliente",
    title: "Lucía Ferrer Gil",
    subtitle: "lucia.ferrer@example.com",
    metadata: "Ramses Group · 31 visitas",
    meta2: "LTV 2.450€ · VIP Gold",
    tags: ["VIP", "Gold"],
  },
  {
    id: "c4",
    type: "cliente",
    title: "Familia Ruiz Ortega",
    subtitle: "familia.ruiz@example.com",
    metadata: "Sakura Sushi · 12 visitas",
    meta2: "LTV 980€",
  },
  // Reservas (2)
  {
    id: "r1",
    type: "reserva",
    title: "RES-2025-4821",
    subtitle: "Lucía Ferrer · Ramses Barcelona",
    metadata: "Hoy 21:30 · 4 pax · Mesa VIP-2",
    tags: ["VIP", "confirmada"],
  },
  {
    id: "r2",
    type: "reserva",
    title: "RES-2025-4822",
    subtitle: "Andrés Vidal · Beach Club Marbella",
    metadata: "Mañana 14:00 · 2 pax · Terraza",
    tags: ["pendiente"],
  },
  // Facturas (1)
  {
    id: "f1",
    type: "factura",
    title: "FAC-2025-0918",
    subtitle: "Ramses Group · Enterprise mensual",
    metadata: "1.490€ · pagada · 01 oct 2025",
    tags: ["pagada"],
  },
  // Incidencias (1)
  {
    id: "i1",
    type: "incidencia",
    title: "INC-2025-001",
    subtitle: "Pico de errores 500 en API",
    metadata: "Crítica · Investigando · 3 orgs afectadas",
    tags: ["critical", "investigating"],
  },
  // Documentación (2)
  {
    id: "d1",
    type: "doc",
    title: "Guía de integración Stripe — webhooks",
    subtitle: "Documentación técnica",
    metadata: "Actualizada hace 4 días · 12 min lectura",
    tags: ["guía"],
  },
  {
    id: "d2",
    type: "doc",
    title: "Política de no-shows y cancelaciones",
    subtitle: "Documentación operativa",
    metadata: "Actualizada hace 2 semanas · 6 min lectura",
    tags: ["política"],
  },
];

const ENTITY_META: Record<
  EntityType,
  {
    label: string;
    plural: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
  }
> = {
  org: { label: "Organización", plural: "Organizaciones", icon: Building2, accent: "rp-gold-text" },
  local: { label: "Local", plural: "Locales", icon: Store, accent: "rp-teal-text" },
  cliente: { label: "Cliente", plural: "Clientes", icon: Users, accent: "rp-gold-text" },
  reserva: { label: "Reserva", plural: "Reservas", icon: CalendarCheck, accent: "rp-teal-text" },
  factura: { label: "Factura", plural: "Facturas", icon: FileText, accent: "rp-gold-text" },
  incidencia: { label: "Incidencia", plural: "Incidencias", icon: AlertTriangle, accent: "text-rose-300" },
  doc: { label: "Documento", plural: "Documentación", icon: BookOpen, accent: "text-muted-foreground" },
};

const RECENT_SEARCHES = [
  "Ramses",
  "VIP Gold",
  "INC-2025-001",
  "MRR < 1000",
  "no-shows Marbella",
];

const ENTITY_ORDER: EntityType[] = [
  "org",
  "local",
  "cliente",
  "reserva",
  "factura",
  "incidencia",
  "doc",
];

/* ---------------- helpers ---------------- */
function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const safe = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${safe})`, "ig"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.trim().toLowerCase() ? (
      <mark
        key={i}
        className="rounded-sm bg-[var(--gold)]/25 text-[var(--gold-soft)] px-0.5"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

function matchScore(item: SearchResult, q: string): number {
  if (!q.trim()) return 1;
  const ql = q.toLowerCase();
  const title = item.title.toLowerCase();
  const subtitle = item.subtitle.toLowerCase();
  const metadata = item.metadata.toLowerCase();
  if (title.includes(ql)) return 100 - title.indexOf(ql);
  if (subtitle.includes(ql)) return 60 - subtitle.indexOf(ql) * 0.2;
  if (metadata.includes(ql)) return 30 - metadata.indexOf(ql) * 0.1;
  // tag partial match
  if (item.tags?.some((t) => t.toLowerCase().includes(ql))) return 20;
  return 0;
}

/* ---------------- main component ---------------- */
export function CcSearch() {
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [recent, setRecent] = React.useState<string[]>(RECENT_SEARCHES);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // advanced filters
  const [fType, setFType] = React.useState<string>("all");
  const [fOrg, setFOrg] = React.useState<string>("all");
  const [fRange, setFRange] = React.useState<string>("all");

  // ⌘K listener
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // close on outside click
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // compute filtered + grouped results
  const q = query.trim();
  const filtered = React.useMemo(() => {
    let base = DATA;
    // advanced filters (apply when advanced dialog confirmed; for demo, apply live)
    if (fType !== "all") base = base.filter((d) => d.type === fType);
    if (fOrg !== "all")
      base = base.filter((d) =>
        d.subtitle.toLowerCase().includes(fOrg.toLowerCase())
      );
    if (fRange !== "all") {
      // demo: just shuffle metadata slightly; not real date filtering
      base = base.slice();
    }
    if (!q) return base;
    return base
      .map((d) => ({ d, s: matchScore(d, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.d);
  }, [q, fType, fOrg, fRange]);

  const grouped = React.useMemo(() => {
    const m = new Map<EntityType, SearchResult[]>();
    filtered.forEach((d) => {
      const arr = m.get(d.type) ?? [];
      arr.push(d);
      m.set(d.type, arr);
    });
    return m;
  }, [filtered]);

  // flat list for keyboard nav (only when query non-empty)
  const flatList = React.useMemo(
    () => (q ? filtered : DATA.slice(0, 5)),
    [q, filtered]
  );

  React.useEffect(() => {
    setActive(0);
  }, [q]);

  const onNavigate = (item: SearchResult) => {
    const meta = ENTITY_META[item.type];
    toast({
      title: `Navegando a ${meta.label.toLowerCase()}`,
      description: `${item.title} · ${item.subtitle}`,
    });
    // record recent
    if (q) {
      setRecent((prev) => [q, ...prev.filter((p) => p !== q)].slice(0, 5));
    }
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flatList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatList[active]) onNavigate(flatList[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const hasResults = filtered.length > 0;
  const activeId = flatList[active]?.id;

  return (
    <section aria-label="Búsqueda global" className="space-y-4">
      {/* Header */}
      <div className="rp-glass-strong rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/10 flex items-center justify-center shrink-0">
              <Search className="h-5 w-5 rp-teal-text" aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-lg sm:text-xl font-medium tracking-tight">
                  Búsqueda global
                </h3>
                <DemoBadge />
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
                  <Sparkles className="h-2.5 w-2.5" aria-hidden />
                  Búsqueda semántica activa (Vectorize)
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Busca organizaciones, locales, clientes, reservas, facturas, incidencias y
                documentación. Navegación con teclado.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => setAdvancedOpen(true)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Búsqueda avanzada
          </Button>
        </div>
      </div>

      {/* Search bar + dropdown */}
      <div ref={containerRef} className="relative">
        <div
          className={cn(
            "rp-glass-strong rounded-2xl transition-all",
            open ? "rp-glow-teal" : ""
          )}
        >
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4">
            <Search
              className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                open ? "rp-teal-text" : "text-muted-foreground"
              )}
              aria-hidden
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Buscar organizaciones, locales, clientes, reservas, facturas, incidencias…"
              className="flex-1 bg-transparent text-base sm:text-lg placeholder:text-muted-foreground focus:outline-none min-w-0"
              aria-label="Búsqueda global"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/50 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-2 rp-glass-strong rounded-2xl overflow-hidden z-40 shadow-2xl"
            >
              <div className="max-h-[70vh] overflow-y-auto rp-scroll-thin">
                {/* Empty query — recent searches */}
                {!q && (
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden />
                      Búsquedas recientes
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {recent.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          Sin búsquedas recientes.
                        </span>
                      ) : (
                        recent.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              setQuery(r);
                              inputRef.current?.focus();
                            }}
                            className="rounded-full border border-border/50 bg-foreground/[0.03] px-3 py-1.5 text-[11px] text-foreground/85 hover:border-[var(--teal)]/40 hover:bg-[var(--teal)]/5 transition-colors min-h-[32px]"
                          >
                            {r}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <Sparkles className="h-3 w-3 rp-gold-text" aria-hidden />
                      Sugerencias frecuentes
                    </div>
                    <ul className="space-y-1">
                      {DATA.slice(0, 5).map((item) => {
                        const meta = ENTITY_META[item.type];
                        const Icon = meta.icon;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => onNavigate(item)}
                              className="w-full text-left rounded-lg px-3 py-2 flex items-center gap-3 hover:bg-foreground/[0.04] transition-colors"
                            >
                              <Icon className={cn("h-4 w-4 shrink-0", meta.accent)} aria-hidden />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-foreground/90 truncate">
                                  {item.title}
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {item.subtitle}
                                </div>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* No results */}
                {q && !hasResults && (
                  <div className="p-8 sm:p-10 text-center">
                    <div className="h-12 w-12 mx-auto rounded-xl border border-border/40 bg-foreground/[0.03] flex items-center justify-center mb-3">
                      <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
                    </div>
                    <div className="text-sm font-medium text-foreground/90">
                      Sin resultados
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      No encontramos coincidencias para &quot;{q}&quot;. Prueba con otro término
                      o usa la búsqueda avanzada.
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 h-8"
                      onClick={() => setAdvancedOpen(true)}
                    >
                      <SlidersHorizontal className="h-3 w-3 mr-1.5" aria-hidden />
                      Búsqueda avanzada
                    </Button>
                  </div>
                )}

                {/* Grouped results */}
                {q && hasResults && (
                  <div className="p-2 sm:p-3">
                    {ENTITY_ORDER.map((type) => {
                      const items = grouped.get(type);
                      if (!items || items.length === 0) return null;
                      const meta = ENTITY_META[type];
                      const Icon = meta.icon;
                      return (
                        <div key={type} className="mb-2 last:mb-0">
                          <div className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            <Icon className={cn("h-3 w-3", meta.accent)} aria-hidden />
                            {meta.plural}
                            <span className="rounded-full border border-border/40 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                              {items.length}
                            </span>
                          </div>
                          <ul>
                            {items.map((item) => {
                              const isActive = item.id === activeId;
                              return (
                                <li key={item.id}>
                                  <button
                                    type="button"
                                    onMouseEnter={() => {
                                      const idx = flatList.findIndex(
                                        (f) => f.id === item.id
                                      );
                                      if (idx >= 0) setActive(idx);
                                    }}
                                    onClick={() => onNavigate(item)}
                                    className={cn(
                                      "w-full text-left rounded-lg px-2.5 py-2 flex items-center gap-3 transition-colors min-h-[44px]",
                                      isActive
                                        ? "bg-[var(--teal)]/[0.08] ring-1 ring-[var(--teal)]/30"
                                        : "hover:bg-foreground/[0.04]"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "h-8 w-8 shrink-0 rounded-lg flex items-center justify-center border",
                                        isActive
                                          ? "border-[var(--teal)]/40 bg-[var(--teal)]/10"
                                          : "border-border/40 bg-foreground/[0.03]"
                                      )}
                                    >
                                      <Icon
                                        className={cn("h-4 w-4", meta.accent)}
                                        aria-hidden
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-foreground/90 truncate">
                                        {highlight(item.title, q)}
                                      </div>
                                      <div className="text-[11px] text-muted-foreground truncate">
                                        {highlight(item.subtitle, q)}
                                      </div>
                                    </div>
                                    <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
                                      <div className="text-[11px] font-mono text-foreground/70">
                                        {highlight(item.metadata, q)}
                                      </div>
                                      {item.meta2 && (
                                        <div className="text-[10px] font-mono text-muted-foreground">
                                          {item.meta2}
                                        </div>
                                      )}
                                    </div>
                                    {item.tags?.includes("VIP") && (
                                      <span className="inline-flex items-center gap-0.5 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-1.5 py-0.5 text-[10px] font-mono text-[var(--gold)] shrink-0">
                                        <Star className="h-2.5 w-2.5" aria-hidden />
                                        VIP
                                      </span>
                                    )}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-border/40 px-3 py-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <kbd className="rounded border border-border/50 bg-foreground/[0.04] px-1 py-0.5">
                        <ArrowUp className="h-2.5 w-2.5 inline" aria-hidden />
                      </kbd>
                      <kbd className="rounded border border-border/50 bg-foreground/[0.04] px-1 py-0.5">
                        <ArrowDown className="h-2.5 w-2.5 inline" aria-hidden />
                      </kbd>
                      navegar
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <kbd className="rounded border border-border/50 bg-foreground/[0.04] px-1 py-0.5">
                        <CornerDownLeft className="h-2.5 w-2.5 inline" aria-hidden />
                      </kbd>
                      abrir
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <kbd className="rounded border border-border/50 bg-foreground/[0.04] px-1 py-0.5">
                        esc
                      </kbd>
                      cerrar
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="h-2.5 w-2.5 rp-teal-text" aria-hidden />
                    Vectorize · {filtered.length} resultados
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper chips below search */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="text-[10px] font-mono uppercase tracking-wider">Prueba con:</span>
        {["Ramses", "VIP", "INC-2025", "Beach Club", "FAC-2025"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuery(s);
              setOpen(true);
              inputRef.current?.focus();
            }}
            className="rounded-full border border-border/50 bg-foreground/[0.03] px-2.5 py-1 text-[11px] text-foreground/80 hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/5 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Advanced search dialog */}
      <Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 rp-gold-text" aria-hidden />
              Búsqueda avanzada
            </DialogTitle>
            <DialogDescription>
              Refina la búsqueda por tipo de entidad, organización y rango de fechas (demo).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Tipo de entidad
              </label>
              <Select value={fType} onValueChange={setFType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="org">Organizaciones</SelectItem>
                  <SelectItem value="local">Locales</SelectItem>
                  <SelectItem value="cliente">Clientes</SelectItem>
                  <SelectItem value="reserva">Reservas</SelectItem>
                  <SelectItem value="factura">Facturas</SelectItem>
                  <SelectItem value="incidencia">Incidencias</SelectItem>
                  <SelectItem value="doc">Documentación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Organización
              </label>
              <Select value={fOrg} onValueChange={setFOrg}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="ramses">Ramses Group</SelectItem>
                  <SelectItem value="sakura">Sakura Sushi Chain</SelectItem>
                  <SelectItem value="beach club">Beach Club Marbella</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Rango de fechas
              </label>
              <Select value={fRange} onValueChange={setFRange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Cualquiera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquiera</SelectItem>
                  <SelectItem value="24h">Últimas 24 h</SelectItem>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="90d">Últimos 90 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Términos adicionales
              </label>
              <Input placeholder="p. ej. VIP, MRR > 1000, canceladas" />
            </div>
            <div className="rounded-lg border border-[var(--teal)]/25 bg-[var(--teal)]/[0.05] p-3 flex items-start gap-2.5">
              <TrendingUp className="h-3.5 w-3.5 text-[var(--teal)] mt-0.5 shrink-0" aria-hidden />
              <div className="text-[11px] text-foreground/80 leading-relaxed">
                La búsqueda semántica (Vectorize) combina estos filtros con embeddings de
                significado. Resultados ordenados por relevancia combinada (demo).
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFType("all");
                setFOrg("all");
                setFRange("all");
              }}
            >
              Limpiar filtros
            </Button>
            <Button
              onClick={() => {
                setAdvancedOpen(false);
                setOpen(true);
                inputRef.current?.focus();
                toast({
                  title: "Filtros aplicados",
                  description: "Búsqueda refinada con los filtros seleccionados (demo).",
                });
              }}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            >
              Aplicar filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
