"use client";

/* ============================================================================
 * RestoPanel · Marketplace de aplicaciones (Plataforma Abierta · Fase 8)
 * App store estilo Shopify: categorías, featured, grid, instalación con
 * consentimiento de permisos OAuth-style, publicar app para desarrolladores.
 * FASE8-MKT-WH-AI · demo-navegable · dark theme (gold #D4AF37 / teal #3DD6C9)
 * ========================================================================== */

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  Store,
  Star,
  BadgeCheck,
  CheckCircle2,
  Download,
  Settings,
  Trash2,
  Plus,
  Shield,
  ShieldAlert,
  Code2,
  Sparkles,
  ArrowRight,
  X,
  Lock,
  CreditCard,
  ScanLine,
  Bike,
  Brain,
  Users,
  Boxes,
  FileText,
  Contact,
  MessageSquare,
  Mail,
  BarChart3,
  CalendarDays,
  Package,
  Cog,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */

type VerifyKind = "Oficial" | "Verificado" | "No verificado";

interface DemoApp {
  id: string;
  name: string;
  developer: string;
  verify: VerifyKind;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  shortDesc: string;
  longDesc?: string;
  icon: LucideIcon;
  gradient: string; // tailwind gradient classes for icon circle
  permissions: string[];
  featured?: boolean;
  installed?: boolean;
}

/* --------------------------------------------------------------------------
 * Static catalog
 * ------------------------------------------------------------------------ */

const CATEGORIES = [
  "Todas",
  "Marketing",
  "TPV",
  "IA",
  "Delivery",
  "RRHH",
  "ERP",
  "Facturación",
  "CRM",
  "SMS",
  "WhatsApp",
  "Email",
  "BI",
  "Eventos",
  "Inventario",
  "Operaciones",
  "Fidelización",
  "Pagos",
] as const;

const CATEGORY_ICON: Record<string, LucideIcon> = {
  Marketing: Sparkles,
  TPV: ScanLine,
  IA: Brain,
  Delivery: Bike,
  RRHH: Users,
  ERP: Boxes,
  Facturación: FileText,
  CRM: Contact,
  SMS: MessageSquare,
  WhatsApp: MessageSquare,
  Email: Mail,
  BI: BarChart3,
  Eventos: CalendarDays,
  Inventario: Package,
  Operaciones: Cog,
  Fidelización: Heart,
  Pagos: CreditCard,
};

const ALL_PERMISSIONS = [
  "read:reservations",
  "write:reservations",
  "read:customers",
  "write:customers",
  "read:reviews",
  "write:reviews",
  "read:payments",
  "read:inventory",
  "write:inventory",
  "send:email",
  "send:sms",
  "send:whatsapp",
  "read:reports",
  "write:crm",
  "manage:staff",
  "manage:billing",
];

const DEMO_APPS: DemoApp[] = [
  {
    id: "app_google_reviews_ai",
    name: "Google Reviews AI",
    developer: "RestoPanel",
    verify: "Oficial",
    category: "IA",
    rating: 4.6,
    reviews: 89,
    price: "Gratis",
    shortDesc: "Respuestas automáticas a reseñas con IA",
    icon: Brain,
    gradient: "from-amber-400 to-[var(--gold)]",
    permissions: ["read:reviews", "write:reviews", "read:customers"],
    featured: true,
  },
  {
    id: "app_whatsapp_business",
    name: "WhatsApp Business",
    developer: "Meta",
    verify: "Verificado",
    category: "WhatsApp",
    rating: 4.4,
    reviews: 127,
    price: "Gratis",
    shortDesc: "Mensajería y plantillas oficiales",
    icon: MessageSquare,
    gradient: "from-emerald-400 to-teal-500",
    permissions: ["send:whatsapp", "read:customers", "write:crm"],
    featured: true,
  },
  {
    id: "app_stripe_sync",
    name: "Stripe Sync",
    developer: "Stripe",
    verify: "Oficial",
    category: "Pagos",
    rating: 4.8,
    reviews: 203,
    price: "Gratis",
    shortDesc: "Sincroniza cobros y facturación",
    icon: CreditCard,
    gradient: "from-fuchsia-400 to-purple-500",
    permissions: ["read:payments", "read:customers", "read:reports"],
    featured: true,
  },
  {
    id: "app_revo_pos",
    name: "Revo POS Bridge",
    developer: "Revo Systems",
    verify: "Verificado",
    category: "TPV",
    rating: 4.2,
    reviews: 45,
    price: "19€/mes",
    shortDesc: "Sincronización bidireccional con Revo",
    icon: ScanLine,
    gradient: "from-[var(--teal)] to-cyan-500",
    permissions: ["read:reservations", "write:reservations", "read:inventory", "write:inventory"],
  },
  {
    id: "app_uber_eats_hub",
    name: "Uber Eats Hub",
    developer: "Community dev",
    verify: "No verificado",
    category: "Delivery",
    rating: 3.8,
    reviews: 23,
    price: "29€/mes",
    shortDesc: "Centraliza pedidos de Uber Eats",
    icon: Bike,
    gradient: "from-slate-400 to-slate-600",
    permissions: ["read:reservations", "read:inventory", "write:crm"],
  },
  {
    id: "app_glovo_delivery",
    name: "Glovo Delivery",
    developer: "Community dev",
    verify: "No verificado",
    category: "Delivery",
    rating: 3.5,
    reviews: 12,
    price: "29€/mes",
    shortDesc: "Integración de pedidos Glovo",
    icon: Bike,
    gradient: "from-yellow-400 to-amber-500",
    permissions: ["read:reservations", "write:reservations"],
  },
  {
    id: "app_forecast_ia",
    name: "Forecast IA",
    developer: "RestoPanel",
    verify: "Oficial",
    category: "IA",
    rating: 4.7,
    reviews: 67,
    price: "Desde 39€/mes",
    shortDesc: "Predicción de demanda y ocupación",
    icon: Brain,
    gradient: "from-[var(--gold)] to-amber-600",
    permissions: ["read:reservations", "read:reports"],
  },
  {
    id: "app_gift_cards_pro",
    name: "Gift Cards Pro",
    developer: "GiftLoop",
    verify: "Verificado",
    category: "Fidelización",
    rating: 4.3,
    reviews: 34,
    price: "12€/mes",
    shortDesc: "Tarjetas regalo digitales",
    icon: Heart,
    gradient: "from-rose-400 to-pink-500",
    permissions: ["read:customers", "write:crm", "read:payments"],
  },
  {
    id: "app_kitchen_display",
    name: "Kitchen Display",
    developer: "Community dev",
    verify: "No verificado",
    category: "Operaciones",
    rating: 4.1,
    reviews: 18,
    price: "25€/mes",
    shortDesc: "Monitor de cocina conectado",
    icon: Cog,
    gradient: "from-orange-400 to-red-500",
    permissions: ["read:reservations", "manage:staff"],
  },
  {
    id: "app_mailchimp_sync",
    name: "Mailchimp Sync",
    developer: "Intuit",
    verify: "Verificado",
    category: "Email",
    rating: 4.5,
    reviews: 56,
    price: "Gratis",
    shortDesc: "Sincroniza tu CRM con Mailchimp",
    icon: Mail,
    gradient: "from-yellow-400 to-amber-500",
    permissions: ["read:customers", "send:email", "write:crm"],
  },
  {
    id: "app_holded_erp",
    name: "Holded ERP",
    developer: "Community dev",
    verify: "No verificado",
    category: "ERP",
    rating: 3.9,
    reviews: 8,
    price: "35€/mes",
    shortDesc: "Facturación y contabilidad",
    icon: Boxes,
    gradient: "from-indigo-300 to-indigo-500",
    permissions: ["read:payments", "read:reports", "manage:billing"],
  },
  {
    id: "app_tiktok_booking",
    name: "TikTok Booking",
    developer: "Community dev",
    verify: "No verificado",
    category: "Marketing",
    rating: 3.2,
    reviews: 5,
    price: "Gratis",
    shortDesc: "Reservas desde TikTok (beta)",
    icon: Sparkles,
    gradient: "from-fuchsia-400 to-rose-500",
    permissions: ["read:reservations", "write:reservations", "read:customers"],
  },
];

/* Pre-install 2 apps as "Instalada" so the user sees both states */
DEMO_APPS[0].installed = true; // Google Reviews AI
DEMO_APPS[2].installed = true; // Stripe Sync

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

function stars(rating: number): { full: number; half: boolean; empty: number } {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
}

function priceTone(price: string): string {
  if (/gratis/i.test(price)) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  return "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]";
}

function verifyMeta(v: VerifyKind): { icon: LucideIcon; tone: string; label: string } {
  switch (v) {
    case "Oficial":
      return { icon: ShieldCheck, tone: "text-[var(--gold)]", label: "Oficial" };
    case "Verificado":
      return { icon: BadgeCheck, tone: "text-[var(--teal)]", label: "Verificado" };
    default:
      return { icon: ShieldAlert, tone: "text-muted-foreground", label: "No verificado" };
  }
}

/* --------------------------------------------------------------------------
 * Demo badge
 * ------------------------------------------------------------------------ */


/* --------------------------------------------------------------------------
 * Star rating
 * ------------------------------------------------------------------------ */
function RatingStars({ value, count, compact = false }: { value: number; count: number; compact?: boolean }) {
  const { full, half, empty } = stars(value);
  const size = compact ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f${i}`} className={cn(size, "fill-[var(--gold)] text-[var(--gold)]")} />
        ))}
        {half ? <Star key="half" className={cn(size, "fill-[var(--gold)]/50 text-[var(--gold)]")} /> : null}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e${i}`} className={cn(size, "text-muted-foreground/40")} />
        ))}
      </div>
      <span className="font-mono text-xs text-foreground/80">{value.toFixed(1)}</span>
      <span className="font-mono text-[11px] text-muted-foreground">({count})</span>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Verify badge
 * ------------------------------------------------------------------------ */
function VerifyBadge({ kind }: { kind: VerifyKind }) {
  const m = verifyMeta(kind);
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", m.tone)}>
      <Icon className="h-3.5 w-3.5" />
      {m.label}
    </span>
  );
}

/* --------------------------------------------------------------------------
 * Permission chip
 * ------------------------------------------------------------------------ */
function PermissionChip({ code }: { code: string }) {
  const [scope, action] = code.split(":");
  const tone =
    action === "write" || action === "manage"
      ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
      : action === "send"
      ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
      : "border-foreground/15 bg-foreground/5 text-foreground/70";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px]",
        tone
      )}
    >
      <Lock className="h-3 w-3 opacity-70" />
      <span className="opacity-60">{scope}</span>
      <span className="opacity-40">:</span>
      <span>{action}</span>
    </span>
  );
}

/* --------------------------------------------------------------------------
 * App icon
 * ------------------------------------------------------------------------ */
function AppIcon({ app, size = "md" }: { app: DemoApp; size?: "md" | "lg" }) {
  const Icon = app.icon;
  const sz = size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const ic = size === "lg" ? "h-6 w-6" : "h-5 w-5";
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg shadow-black/30 ring-1 ring-white/10",
        sz,
        app.gradient
      )}
    >
      <Icon className={cn(ic, "drop-shadow")} />
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Main component
 * ------------------------------------------------------------------------ */
export function Marketplace() {
  const prefersReduced = useReducedMotion();
  const fade = prefersReduced ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };
  const { toast } = useToast();

  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("Todas");
  const [installed, setInstalled] = React.useState<Record<string, boolean>>(
    Object.fromEntries(DEMO_APPS.map((a) => [a.id, !!a.installed]))
  );

  /* install consent dialog */
  const [installTarget, setInstallTarget] = React.useState<DemoApp | null>(null);
  const [uninstallTarget, setUninstallTarget] = React.useState<DemoApp | null>(null);

  /* publish dialog */
  const [publishOpen, setPublishOpen] = React.useState(false);

  /* filtered list */
  const filtered = React.useMemo(() => {
    return DEMO_APPS.filter((a) => {
      const matchCat = category === "Todas" ? true : a.category === category;
      const q = query.trim().toLowerCase();
      const matchQ =
        q.length === 0
          ? true
          : a.name.toLowerCase().includes(q) ||
            a.developer.toLowerCase().includes(q) ||
            a.shortDesc.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, category]);

  const featured = DEMO_APPS.filter((a) => a.featured);

  function confirmInstall() {
    if (!installTarget) return;
    setInstalled((s) => ({ ...s, [installTarget.id]: true }));
    toast({
      title: "App instalada (demo)",
      description: `${installTarget.name} se ha añadido a tu cuenta.`,
    });
    setInstallTarget(null);
  }

  function confirmUninstall() {
    if (!uninstallTarget) return;
    setInstalled((s) => ({ ...s, [uninstallTarget.id]: false }));
    toast({
      title: "App desinstalada (demo)",
      description: `${uninstallTarget.name} se ha eliminado. Revisa permisos revocados.`,
      variant: "destructive",
    });
    setUninstallTarget(null);
  }

  function handleConfigure(app: DemoApp) {
    toast({
      title: "Abriendo configuración…",
      description: `${app.name} · panel de ajustes (demo).`,
    });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* ---------------- Header ---------------- */}
        <motion.div
          {...fade}
          className="rp-glass-strong rounded-2xl p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/15 text-[var(--gold)] ring-1 ring-[var(--gold)]/30">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
                    Marketplace
                  </h2>
                  
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Amplía RestoPanel con integraciones oficiales y de comunidad. Instalación con consentimiento OAuth-style.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="border-foreground/15 bg-transparent"
                onClick={() => setPublishOpen(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Publicar app
              </Button>
            </div>
          </div>

          {/* search + dev banner */}
          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, desarrollador, categoría…"
                className="h-11 pl-9 font-mono text-sm"
                aria-label="Buscar apps"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--teal)]/25 bg-[var(--teal)]/5 px-3 py-2 text-xs text-muted-foreground">
              <Code2 className="h-4 w-4 text-[var(--teal)]" />
              <span>
                ¿Eres desarrollador?{" "}
                <button
                  type="button"
                  onClick={() => setPublishOpen(true)}
                  className="rp-teal-text font-medium underline-offset-2 hover:underline"
                >
                  Publica tu app
                </button>{" "}
                y llega a miles de restaurantes.
              </span>
            </div>
          </div>
        </motion.div>

        {/* ---------------- Category pills ---------------- */}
        <motion.div
          {...fade}
          transition={{ delay: 0.04 }}
          className="rp-glass rounded-2xl p-3"
        >
          <div className="flex items-center gap-2 overflow-x-auto rp-scroll-thin pb-1">
            {CATEGORIES.map((c) => {
              const active = category === c;
              const Icon = CATEGORY_ICON[c] ?? Store;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    "min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60",
                    active
                      ? "border-[var(--gold)]/40 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                      : "border-foreground/10 bg-foreground/[0.03] text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {c}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ---------------- Featured section ---------------- */}
        {featured.length > 0 && category === "Todas" && query.trim().length === 0 && (
          <motion.section
            {...fade}
            transition={{ delay: 0.08 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg font-medium">
                <Sparkles className="h-4 w-4 text-[var(--gold)]" />
                Destacadas
              </h3>
              <span className="text-xs text-muted-foreground">Selección RestoPanel · datos demo</span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featured.map((app, idx) => (
                <FeaturedAppCard
                  key={app.id}
                  app={app}
                  installed={!!installed[app.id]}
                  onInstall={() => setInstallTarget(app)}
                  onConfigure={() => handleConfigure(app)}
                  delay={idx * 0.06}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* ---------------- App grid ---------------- */}
        <motion.section
          {...fade}
          transition={{ delay: 0.12 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg font-medium">
              <Store className="h-4 w-4 text-[var(--teal)]" />
              Todas las apps
              <Badge variant="secondary" className="ml-1 font-mono text-[11px]">
                {filtered.length}
              </Badge>
            </h3>
            <span className="text-xs text-muted-foreground">
              {category !== "Todas" && `Categoría: ${category} · `}
              {query.trim() ? `Búsqueda: "${query.trim()}" · ` : ""}
              demo
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="rp-glass rounded-2xl p-10 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm text-muted-foreground">
                Sin resultados. Prueba con otra categoría o término.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((app, idx) => (
                <AppCard
                  key={app.id}
                  app={app}
                  installed={!!installed[app.id]}
                  onInstall={() => setInstallTarget(app)}
                  onConfigure={() => handleConfigure(app)}
                  onUninstall={() => setUninstallTarget(app)}
                  delay={idx * 0.03}
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* ---------------- Footer ---------------- */}
        <div className="rp-glass rounded-xl p-4 text-center text-xs text-muted-foreground">
          <Shield className="mx-auto mb-1 h-4 w-4 text-[var(--gold)]" />
          Las apps pasan por revisión antes de publicarse. Cada instalación requiere tu consentimiento explícito sobre los permisos solicitados. Marketplace demo.
        </div>
      </div>

      {/* ---------------- Install consent dialog ---------------- */}
      <Dialog open={!!installTarget} onOpenChange={(o) => !o && setInstallTarget(null)}>
        <DialogContent className="max-w-lg border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              {installTarget ? <AppIcon app={installTarget} /> : null}
              <span>
                Instalar {installTarget?.name}
              </span>
            </DialogTitle>
            <DialogDescription>
              {installTarget?.developer} solicita acceso a los siguientes recursos de tu cuenta RestoPanel. Revisa antes de autorizar.
            </DialogDescription>
          </DialogHeader>

          {installTarget ? (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-xs text-amber-200/90">
                <ShieldAlert className="mb-1 inline-block h-4 w-4 align-text-bottom" /> Esta app podrá{" "}
                <span className="font-medium">leer, modificar o enviar datos</span> en tu nombre. Puedes revocar el acceso en cualquier momento desde la configuración.
              </div>

              <div>
                <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Permisos requeridos ({installTarget.permissions.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {installTarget.permissions.map((p) => (
                    <PermissionChip key={p} code={p} />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-foreground/[0.02] p-3 text-xs text-muted-foreground">
                <div className="mb-1 font-medium text-foreground/80">Política de privacidad</div>
                Los datos se comparten únicamente con {installTarget.developer} según sus términos. RestoPanel no es responsable del tratamiento posterior.
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setInstallTarget(null)}>
              <X className="mr-1.5 h-4 w-4" /> Cancelar
            </Button>
            <Button
              onClick={confirmInstall}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
            >
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Autorizar e instalar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Uninstall confirm ---------------- */}
      <AlertDialog open={!!uninstallTarget} onOpenChange={(o) => !o && setUninstallTarget(null)}>
        <AlertDialogContent className="border-border/60 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Desinstalar {uninstallTarget?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se revocarán todos los permisos otorgados y se detendrá la sincronización. Esta acción no se puede deshacer. (demo)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUninstall}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, desinstalar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ---------------- Publish app dialog ---------------- */}
      <PublishAppDialog open={publishOpen} onOpenChange={setPublishOpen} />
    </TooltipProvider>
  );
}

/* --------------------------------------------------------------------------
 * Featured app card
 * ------------------------------------------------------------------------ */
function FeaturedAppCard({
  app,
  installed,
  onInstall,
  onConfigure,
  delay,
}: {
  app: DemoApp;
  installed: boolean;
  onInstall: () => void;
  onConfigure: () => void;
  delay: number;
}) {
  const prefersReduced = useReducedMotion();
  const Icon = app.icon;
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rp-glass-strong group relative flex flex-col overflow-hidden rounded-2xl"
    >
      {/* Mockup / screenshot area */}
      <div className="relative h-32 overflow-hidden border-b border-border/40 bg-gradient-to-br from-foreground/[0.06] to-transparent">
        <div
          className={cn(
            "absolute inset-0 opacity-30 bg-gradient-to-br",
            app.gradient
          )}
        />
        {/* faux UI mockup */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1.5 opacity-80">
            <Icon className="h-10 w-10 text-white drop-shadow-lg" />
            <div className="h-1.5 w-20 rounded-full bg-white/30" />
            <div className="h-1.5 w-14 rounded-full bg-white/20" />
          </div>
        </div>
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold)] backdrop-blur">
            <Sparkles className="h-3 w-3" /> Destacada
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AppIcon app={app} size="lg" />
            <div>
              <h4 className="font-display text-base font-medium leading-tight">{app.name}</h4>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{app.developer}</span>
                <VerifyBadge kind={app.verify} />
              </div>
            </div>
          </div>
        </div>

        <RatingStars value={app.rating} count={app.reviews} />

        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">{app.shortDesc}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-mono",
                priceTone(app.price)
              )}
            >
              {app.price}
            </span>
            <Badge variant="outline" className="border-foreground/15 font-mono text-[10px]">
              {app.category}
            </Badge>
          </div>

          {installed ? (
            <Button size="sm" variant="outline" onClick={onConfigure}>
              <Settings className="mr-1.5 h-3.5 w-3.5" /> Configurar
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onInstall}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Instalar
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------------------------------
 * App card (grid)
 * ------------------------------------------------------------------------ */
function AppCard({
  app,
  installed,
  onInstall,
  onConfigure,
  onUninstall,
  delay,
}: {
  app: DemoApp;
  installed: boolean;
  onInstall: () => void;
  onConfigure: () => void;
  onUninstall: () => void;
  delay: number;
}) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={prefersReduced ? undefined : { y: -3 }}
      className="rp-glass group relative flex flex-col gap-3 rounded-2xl p-5 transition-shadow hover:shadow-lg hover:shadow-black/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AppIcon app={app} />
          <div className="min-w-0">
            <h4 className="truncate font-display text-base font-medium leading-tight">{app.name}</h4>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="truncate text-xs text-muted-foreground">{app.developer}</span>
              <VerifyBadge kind={app.verify} />
            </div>
          </div>
        </div>
        {installed && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Instalada
          </span>
        )}
      </div>

      <RatingStars value={app.rating} count={app.reviews} compact />

      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-1">{app.shortDesc}</p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-mono",
              priceTone(app.price)
            )}
          >
            {app.price}
          </span>
          <Badge variant="outline" className="border-foreground/15 font-mono text-[10px]">
            {app.category}
          </Badge>
        </div>

        {installed ? (
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={onConfigure} className="h-8 px-2.5">
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configurar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onUninstall}
                  className="h-8 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Desinstalar</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={onInstall}
            className="h-8 bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> Instalar
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------------------------------
 * Publish app dialog
 * ------------------------------------------------------------------------ */
function PublishAppDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [category, setCategory] = React.useState("Marketing");
  const [perms, setPerms] = React.useState<string[]>([]);
  const [pricing, setPricing] = React.useState("gratis");
  const [submitting, setSubmitting] = React.useState(false);

  function reset() {
    setName("");
    setDesc("");
    setCategory("Marketing");
    setPerms([]);
    setPricing("gratis");
    setSubmitting(false);
  }

  function togglePerm(p: string) {
    setPerms((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  }

  function handleSubmit() {
    if (!name.trim() || !desc.trim()) {
      toast({
        title: "Faltan datos",
        description: "Indica nombre y descripción de tu app.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "App enviada a revisión (demo)",
        description: `"${name}" pasará por el proceso de aprobación antes de publicarse.`,
      });
      reset();
      onOpenChange(false);
    }, 700);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-xl border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Code2 className="h-5 w-5 text-[var(--teal)]" />
            Publicar aplicación
            
          </DialogTitle>
          <DialogDescription>
            Envía tu app al marketplace de RestoPanel. Pasará por un proceso de revisión técnica y de seguridad antes de publicarse.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto rp-scroll-thin py-2 pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="pa-name">Nombre de la app</Label>
            <Input
              id="pa-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Notificaciones Push Pro"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pa-desc">Descripción</Label>
            <Textarea
              id="pa-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="¿Qué hace tu app? ¿Qué problema resuelve?"
              rows={3}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c !== "Todas").map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Modelo de pricing</Label>
              <Select value={pricing} onValueChange={setPricing}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gratis">Gratis</SelectItem>
                  <SelectItem value="gratis_freemium">Freemium</SelectItem>
                  <SelectItem value="pago">Pago (suscripción)</SelectItem>
                  <SelectItem value="pago_uso">Pago por uso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Permisos solicitados{" "}
              <span className="font-mono text-[11px] text-muted-foreground">
                ({perms.length} seleccionados)
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {ALL_PERMISSIONS.map((p) => {
                const active = perms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePerm(p)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] transition-colors",
                      "min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50",
                      active
                        ? "border-[var(--gold)]/40 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                        : "border-foreground/15 bg-foreground/[0.03] text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Lock className="h-3 w-3 opacity-70" />
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-foreground/[0.02] p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mb-1 inline-block h-4 w-4 align-text-bottom text-[var(--teal)]" /> Tus credenciales OAuth se generarán tras la aprobación. La revisión técnica tarda entre 3-5 días laborables. (demo)
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
          >
            {submitting ? (
              <>
                <Sparkles className="mr-1.5 h-4 w-4 animate-pulse" /> Enviando…
              </>
            ) : (
              <>
                <ArrowRight className="mr-1.5 h-4 w-4" /> Enviar a revisión
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Marketplace;
