"use client";

/* =========================================================
 * RestoPanel · Landing dinámica por plan
 * ---------------------------------------------------------
 * Fase 3 · Entregable 3.5
 * 3 planes (Starter / Professional / Enterprise) que cambian
 * TODO en la landing: accent, hero, dashboard preview,
 * features, precio, CTA y testimonial. URL #plan=….
 * Animaciones con Framer Motion AnimatePresence.
 * =======================================================*/

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Sparkles,
  Store,
  TrendingUp,
  Building2,
  Zap,
  ShieldCheck,
  Quote,
  Share2,
  LayoutGrid,
  CalendarDays,
  Users,
  Receipt,
  Bell,
  RotateCw,
  Wallet,
  Target,
  Utensils,
  ChefHat,
  CreditCard,
  Bike,
  Gift,
  Megaphone,
  Star,
  Workflow,
  BarChart3,
  Package,
  Brain,
  Plug,
  Globe,
  Map as MapIcon,
  GitCompare,
  Gauge,
  Activity,
  AlertTriangle,
  Database,
  FileCheck,
  KeyRound,
  ClipboardList,
  ServerCog,
  type LucideIcon,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/

type PlanId = "starter" | "professional" | "enterprise";

interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  headline: string;
  subhead: string;
  price: string;
  priceDetail: string;
  cta: string;
  accent: "teal" | "gold" | "purple";
  accentHex: string;
  testimonial: {
    quote: string;
    author: string;
    role: string;
    location: string;
    rating: number;
  };
  dashboard: DashboardWidget[];
  features: { category: string; label: string; icon: LucideIcon }[];
}

interface DashboardWidget {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: LucideIcon;
  tone?: "primary" | "neutral" | "warning";
}

/* =========================================================
 * Plan configs
 * =======================================================*/

const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Para empezar a operar mejor hoy",
    headline: "Empieza a operar mejor hoy",
    subhead:
      "Sustituye 3 herramientas por menos de lo que pagas por una. Reservas, carta digital y caja — sin curva de aprendizaje.",
    price: "49€",
    priceDetail: "/ mes · 1 local · IVA no incl.",
    cta: "Crear cuenta Starter",
    accent: "teal",
    accentHex: "#3DD6C9",
    testimonial: {
      quote:
        "Llevábamos una libreta para las reservas y un Excel para la caja. Con RestoPanel Starter lo tengo todo en 5 minutos al día.",
      author: "Marta Soler",
      role: "Propietaria",
      location: "Cafetería Bon Dia · Girona",
      rating: 5,
    },
    dashboard: [
      { id: "ventas", label: "Ventas hoy", value: "1.284€", delta: "+8%", deltaPositive: true, icon: Wallet, tone: "primary" },
      { id: "reservas", label: "Reservas hoy", value: "37", delta: "+5", deltaPositive: true, icon: CalendarDays },
      { id: "ocupacion", label: "Ocupación", value: "72%", delta: "+4pts", deltaPositive: true, icon: Users },
      { id: "tickets", label: "Tickets abiertos", value: "6", icon: Receipt },
      { id: "alertas", label: "Alertas", value: "2", delta: "—1", deltaPositive: true, icon: Bell, tone: "warning" },
    ],
    features: [
      { category: "Operación", label: "Reservas online + calendario", icon: CalendarDays },
      { category: "Operación", label: "Plano de mesas interactivo", icon: LayoutGrid },
      { category: "Operación", label: "Carta digital con QR", icon: Receipt },
      { category: "Operación", label: "Caja y tickets", icon: Wallet },
      { category: "Operación", label: "Clientes básicos", icon: Users },
      { category: "Operación", label: "Equipo (5 usuarios)", icon: ShieldCheck },
      { category: "Operación", label: "1 local incluido", icon: Store },
      { category: "Operación", label: "App móvil (iOS/Android)", icon: Zap },
      { category: "Operación", label: "Soporte email (48h)", icon: Sparkles },
      { category: "Operación", label: "Sin permanencia", icon: Check },
    ],
  },

  professional: {
    id: "professional",
    name: "Professional",
    tagline: "Para hacer crecer la facturación",
    headline: "Haz crecer la facturación",
    subhead:
      "El ahorro en comisiones de delivery suele pagar el plan entero. CRM, marketing, food cost y analítica para multiplicar el margen.",
    price: "99€",
    priceDetail: "/ mes · hasta 3 locales · IVA no incl.",
    cta: "Crear cuenta Professional",
    accent: "gold",
    accentHex: "#D4AF37",
    testimonial: {
      quote:
        "El ahorro en comisiones de delivery nos paga el plan 4 veces. En 90 días subimos el ticket medio un 14% con el ranking de platos.",
      author: "Adrián Ruiz",
      role: "Gerente",
      location: "Bistró Central · Valencia",
      rating: 5,
    },
    dashboard: [
      { id: "rotacion", label: "Rotación mesa", value: "2.8", delta: "+0.7", deltaPositive: true, icon: RotateCw, tone: "primary" },
      { id: "ticket-canal", label: "Ticket por canal", value: "32€", delta: "+14%", deltaPositive: true, icon: CreditCard },
      { id: "roi-campanas", label: "ROI campañas", value: "4.2x", delta: "+0.8", deltaPositive: true, icon: Target },
      { id: "food-cost", label: "Food cost", value: "28%", delta: "—3pts", deltaPositive: true, icon: Utensils },
      { id: "ranking", label: "Top plato", value: "Secreto ibérico", icon: ChefHat },
      { id: "personal", label: "Coste personal", value: "3.840€", delta: "—6%", deltaPositive: true, icon: Users },
    ],
    features: [
      { category: "Operación", label: "Todo lo de Starter", icon: Check },
      { category: "Operación", label: "Sala: comandas y turnos", icon: LayoutGrid },
      { category: "Operación", label: "Cocina: KDS con tickets", icon: ChefHat },
      { category: "Operación", label: "Order & Pay en mesa (QR)", icon: CreditCard },
      { category: "Operación", label: "Delivery propio + agregadores", icon: Bike },
      { category: "CRM", label: "CRM avanzado (segmentos, RFM)", icon: Users },
      { category: "CRM", label: "Fidelización con sellos", icon: Gift },
      { category: "Marketing", label: "Campañas email + WhatsApp", icon: Megaphone },
      { category: "Marketing", label: "Reseñas (Google, Instagram)", icon: Star },
      { category: "Marketing", label: "Automatizaciones (15 triggers)", icon: Workflow },
      { category: "Analítica", label: "Analítica avanzada", icon: BarChart3 },
      { category: "Analítica", label: "Inventario + escandallos", icon: Package },
      { category: "Analítica", label: "Personal: turnos y costes", icon: Users },
      { category: "IA", label: "Copilot IA (chat operativo)", icon: Brain },
      { category: "IA", label: "Menu engineering", icon: Utensils },
      { category: "Integraciones", label: "Google Business", icon: Globe },
      { category: "Integraciones", label: "Instagram + WhatsApp", icon: Megaphone },
      { category: "Integraciones", label: "Stripe (pagos)", icon: CreditCard },
      { category: "Operación", label: "Hasta 3 locales", icon: Building2 },
      { category: "Operación", label: "Usuarios ilimitados", icon: Users },
      { category: "Operación", label: "Soporte chat (24h)", icon: Sparkles },
      { category: "Operación", label: "Sin permanencia", icon: Check },
    ],
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Para escalar sin perder el control",
    headline: "Escala sin perder el control",
    subhead:
      "Un solo panel para todo el grupo. BI consolidado, forecast, App Store, API y webhooks, SSO y auditoría completa.",
    price: "Hablar con ventas",
    priceDetail: "· grupos +5 locales · SLA dedicado",
    cta: "Hablar con ventas",
    accent: "purple",
    accentHex: "#A78BFA",
    testimonial: {
      quote:
        "Gestionamos 14 locales desde un único panel. El forecast de compra nos ha bajado el desperdicio un 22% en un trimestre.",
      author: "Núria Costa",
      role: "COO",
      location: "Ramses Group · Barcelona",
      rating: 5,
    },
    dashboard: [
      { id: "mapa", label: "Locales activos", value: "14/14", icon: MapIcon, tone: "primary" },
      { id: "comparativa", label: "Comparativa", value: "+12%", delta: "vs LM", deltaPositive: true, icon: GitCompare },
      { id: "forecast", label: "Forecast 7d", value: "98.4k€", delta: "+6%", deltaPositive: true, icon: TrendingUp },
      { id: "anomalias", label: "Anomalías", value: "1", icon: AlertTriangle, tone: "warning" },
      { id: "api", label: "Consumo API", value: "84%", delta: "—2pts", deltaPositive: true, icon: Database },
      { id: "sla", label: "SLA mes", value: "99.97%", icon: Gauge },
      { id: "health", label: "Health Score", value: "86", delta: "+5", deltaPositive: true, icon: Activity },
    ],
    features: [
      { category: "Multi-local", label: "Todo lo de Professional", icon: Check },
      { category: "Multi-local", label: "Dashboard global consolidado", icon: BarChart3 },
      { category: "Multi-local", label: "Locales ilimitados", icon: Building2 },
      { category: "Multi-local", label: "Franquicias y permisos", icon: Store },
      { category: "Multi-local", label: "Carta centralizada por grupo", icon: Utensils },
      { category: "BI", label: "BI y forecast propio", icon: TrendingUp },
      { category: "BI", label: "Data Warehouse export", icon: Database },
      { category: "BI", label: "Anomaly detection", icon: AlertTriangle },
      { category: "Plataforma", label: "App Store (marketplace)", icon: Plug },
      { category: "Plataforma", label: "API pública + Webhooks", icon: Workflow },
      { category: "Plataforma", label: "SSO (SAML, OIDC)", icon: KeyRound },
      { category: "Plataforma", label: "Auditoría completa", icon: ClipboardList },
      { category: "Plataforma", label: "Monitorización SLA", icon: ServerCog },
      { category: "Plataforma", label: "DPA + residencia UE", icon: FileCheck },
      { category: "Plataforma", label: "Onboarding dedicado", icon: Sparkles },
      { category: "Plataforma", label: "CSM asignado", icon: Users },
      { category: "Plataforma", label: "Soporte 24/7 prioritario", icon: ShieldCheck },
      { category: "Plataforma", label: "Pentest anual", icon: ShieldCheck },
      { category: "Plataforma", label: "Backup dedicado", icon: Database },
      { category: "Operación", label: "Health Score por local", icon: Activity },
      { category: "Operación", label: "Playbook engine", icon: Workflow },
      { category: "Operación", label: "Multi-idioma / multi-divisa", icon: Globe },
      { category: "Operación", label: "Roles personalizados", icon: ShieldCheck },
      { category: "Operación", label: "SSO + 2FA obligatorio", icon: KeyRound },
      { category: "Operación", label: "Audit log 7 años", icon: ClipboardList },
      { category: "Operación", label: "Personalización branding", icon: Sparkles },
      { category: "Operación", label: "API rate limits altos", icon: Zap },
      { category: "Operación", label: "Sandbox dedicado", icon: Database },
      { category: "Operación", label: "Migración asistida", icon: Workflow },
      { category: "Operación", label: "Formación on-site", icon: Users },
      { category: "Operación", label: "Quarterly business review", icon: TrendingUp },
      { category: "Operación", label: "SLA 99.95%+", icon: Gauge },
      { category: "Operación", label: "Sin permanencia", icon: Check },
    ],
  },
};

const PLAN_ORDER: PlanId[] = ["starter", "professional", "enterprise"];

/* =========================================================
 * Helpers
 * =======================================================*/


function parseHashPlan(): PlanId | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  const match = hash.match(/plan=(starter|professional|enterprise)/);
  return match ? (match[1] as PlanId) : null;
}

function writeHashPlan(plan: PlanId) {
  if (typeof window === "undefined") return;
  const newHash = `plan=${plan}`;
  if (window.location.hash !== `#${newHash}`) {
    history.replaceState(null, "", `#${newHash}`);
  }
}

function accentTextClass(accent: PlanConfig["accent"]): string {
  switch (accent) {
    case "teal":
      return "text-[var(--teal)]";
    case "gold":
      return "rp-gold-text";
    case "purple":
      return "text-[#C4B5FD]";
  }
}

function accentBorderClass(accent: PlanConfig["accent"]): string {
  switch (accent) {
    case "teal":
      return "border-[var(--teal)]/50";
    case "gold":
      return "border-[var(--gold)]/50";
    case "purple":
      return "border-[#A78BFA]/50";
  }
}

function accentBgClass(accent: PlanConfig["accent"]): string {
  switch (accent) {
    case "teal":
      return "bg-[var(--teal)]/10";
    case "gold":
      return "bg-[var(--gold)]/10";
    case "purple":
      return "bg-[#A78BFA]/10";
  }
}

function accentSoftTextClass(accent: PlanConfig["accent"]): string {
  switch (accent) {
    case "teal":
      return "text-[var(--teal)]";
    case "gold":
      return "text-[var(--gold-soft)]";
    case "purple":
      return "text-[#C4B5FD]";
  }
}

function accentGlowClass(accent: PlanConfig["accent"]): string {
  switch (accent) {
    case "teal":
      return "rp-glow-teal";
    case "gold":
      return "rp-glow-gold";
    case "purple":
      return "";
  }
}

function accentSolidButtonClass(accent: PlanConfig["accent"]): string {
  switch (accent) {
    case "teal":
      return "bg-[var(--teal)] text-black hover:bg-[var(--teal-deep)] hover:text-white";
    case "gold":
      return "bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]";
    case "purple":
      return "bg-[#A78BFA] text-black hover:bg-[#C4B5FD]";
  }
}

/* =========================================================
 * Main view
 * =======================================================*/
export function LandingDynamicView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();

  const initialPlan: PlanId = React.useMemo(() => {
    const fromHash = parseHashPlan();
    return fromHash ?? "professional";
  }, []);

  const [activePlan, setActivePlan] = React.useState<PlanId>(initialPlan);
  const config = PLANS[activePlan];

  /* Sync URL hash on change (client-side) */
  React.useEffect(() => {
    writeHashPlan(activePlan);
  }, [activePlan]);

  /* Listen to hash changes (e.g. user pastes share link) */
  React.useEffect(() => {
    const onHash = () => {
      const p = parseHashPlan();
      if (p && p !== activePlan) setActivePlan(p);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [activePlan]);

  const handleCta = (plan: PlanId) => {
    const c = PLANS[plan];
    if (plan === "enterprise") {
      toast({
        title: "Solicitud enviada a ventas",
        description: "Te contactamos en menos de 24h para montar una demo del grupo.",
      });
    } else {
      toast({
        title: `Cuenta ${c.name} creada`,
        description: `Plan ${c.price}${c.priceDetail}. Empezamos el onboarding IA.`,
      });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#plan=${activePlan}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `RestoPanel · ${config.name}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "URL copiada",
          description: `Enlace al plan ${config.name} listo para compartir.`,
        });
      }
    } catch {
      // user dismissed share dialog — no toast needed
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Landing dinámica por plan
            </h1>
            
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Un mismo landing que muta por plan. Elige un plan para ver cómo
            cambia hero, dashboard, features, precio y CTA.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleShare}
          className="border-border/60 min-h-11 shrink-0"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Compartir plan {config.name}</span>
          <span className="sm:hidden">Compartir</span>
        </Button>
      </header>

      {/* Plan selector */}
      <div className="rp-glass rounded-2xl p-3 sm:p-4">
        <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Selector de plan">
          {PLAN_ORDER.map((planId) => {
            const p = PLANS[planId];
            const active = activePlan === planId;
            return (
              <button
                key={planId}
                role="tab"
                aria-selected={active}
                onClick={() => setActivePlan(planId)}
                className={cn(
                  "relative rounded-xl border p-3 sm:p-4 text-left transition-all min-h-[80px] sm:min-h-[96px]",
                  active
                    ? cn(accentBorderClass(p.accent), accentBgClass(p.accent))
                    : "border-border/40 bg-foreground/[0.02] hover:bg-foreground/[0.04]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: p.accentHex }}
                  />
                  <span
                    className={cn(
                      "font-display text-base sm:text-lg font-medium",
                      active ? accentSoftTextClass(p.accent) : "text-foreground"
                    )}
                  >
                    {p.name}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2 hidden sm:block">
                  {p.tagline}
                </div>
                <div className="mt-1.5 text-xs font-mono">
                  {planId === "enterprise" ? (
                    <span className="text-muted-foreground">hablar con ventas</span>
                  ) : (
                    <span className={cn("font-medium", active ? accentSoftTextClass(p.accent) : "text-foreground")}>
                      {p.price}
                      <span className="text-muted-foreground font-normal">/mes</span>
                    </span>
                  )}
                </div>
                {active && (
                  <motion.div
                    layoutId="plan-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                    style={{ background: p.accentHex }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Globe className="h-3 w-3" />
          <span className="font-mono">
            #{`plan=${activePlan}`}
          </span>
          <span>· enlace compartible, mantiene el plan seleccionado</span>
        </div>
      </div>

      {/* AnimatePresence for plan transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePlan}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="space-y-5"
        >
          {/* Hero */}
          <HeroSection config={config} onCta={() => handleCta(activePlan)} />

          {/* Dashboard preview */}
          <DashboardPreview config={config} />

          {/* Features + price */}
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <FeaturesSection config={config} />
            <PriceCard config={config} onCta={() => handleCta(activePlan)} />
          </div>

          {/* Testimonial */}
          <TestimonialCard config={config} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
 * Hero section
 * =======================================================*/
function HeroSection({
  config,
  onCta,
}: {
  config: PlanConfig;
  onCta: () => void;
}) {
  return (
    <section
      className={cn(
        "rp-glass rounded-2xl p-5 sm:p-8 relative overflow-hidden",
        accentGlowClass(config.accent)
      )}
    >
      {/* Background glow */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: config.accentHex }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className={cn(
              "border-current/40 bg-current/10 text-[10px] uppercase tracking-wider",
              accentSoftTextClass(config.accent)
            )}
          >
            Plan {config.name}
          </Badge>
          <span className="text-xs text-muted-foreground">{config.tagline}</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight max-w-3xl">
          <span className={accentTextClass(config.accent)}>{config.headline}</span>
        </h2>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {config.subhead}
        </p>
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            onClick={onCta}
            className={cn(
              "min-h-12 h-12 px-6 text-base",
              accentSolidButtonClass(config.accent)
            )}
          >
            {config.cta}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className={cn("h-4 w-4", accentSoftTextClass(config.accent))} />
            Sin permanencia · cancela cuando quieras
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
 * Dashboard preview
 * =======================================================*/
function DashboardPreview({ config }: { config: PlanConfig }) {
  return (
    <section className="rp-glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border/40">
        <LayoutGrid className={cn("h-4 w-4", accentSoftTextClass(config.accent))} />
        <h3 className="font-display text-base font-medium">
          Dashboard {config.name}
        </h3>
        <span className="text-[11px] text-muted-foreground ml-auto font-mono">
          {config.dashboard.length} widgets
        </span>
      </div>
      <div className="p-4">
        {/* Fake browser chrome */}
        <div className="rounded-xl border border-border/60 bg-background overflow-hidden">
          <div className="flex items-center gap-1.5 p-2 border-b border-border/40 bg-foreground/[0.03]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
            <div className="flex-1 mx-2 h-5 rounded-sm bg-foreground/[0.05] text-[10px] flex items-center px-2 text-muted-foreground font-mono">
              app.restopanel.com/{config.id}
            </div>
            <Badge
              variant="outline"
              className={cn("border-current/40 text-[10px] uppercase", accentSoftTextClass(config.accent))}
            >
              {config.name}
            </Badge>
          </div>
          {/* Sidebar + content */}
          <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[160px_1fr]">
            <div className="hidden sm:flex flex-col gap-1 p-2 border-r border-border/40 bg-foreground/[0.02]">
              {["Inicio", "Reservas", "Carta", "Caja"].map((item, i) => (
                <div
                  key={item}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px]",
                    i === 0 ? cn(accentBgClass(config.accent), accentSoftTextClass(config.accent)) : "text-muted-foreground"
                  )}
                >
                  <div className="w-3 h-3 rounded-sm bg-current/40" />
                  <span className="hidden sm:inline">{item}</span>
                </div>
              ))}
              <div className="mt-auto pt-2 border-t border-border/40">
                <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-muted-foreground">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: config.accentHex }}
                  />
                  <span className="hidden sm:inline truncate">{config.name} plan</span>
                </div>
              </div>
            </div>
            {/* Mobile mini-sidebar */}
            <div className="flex sm:hidden flex-col gap-1 p-1 border-r border-border/40 bg-foreground/[0.02]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-6 h-6 rounded-md",
                    i === 0 ? accentBgClass(config.accent) : "bg-foreground/8"
                  )}
                />
              ))}
            </div>
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                    Resumen · hoy
                  </div>
                  <div className="font-display text-base font-medium">Dashboard</div>
                </div>
                <Badge
                  variant="outline"
                  className="border-border/60 text-[10px] uppercase tracking-wider"
                >
                  live
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {config.dashboard.map((w) => (
                  <DashboardWidgetCard key={w.id} widget={w} config={config} />
                ))}
              </div>
              <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-2">
                  Actividad semanal
                </div>
                <div className="flex items-end gap-1 h-16">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const h = 30 + ((i * 17 + 7) % 60);
                    return (
                      <div
                        key={`bar-${i}`}
                        className="flex-1 rounded-t-sm transition-all"
                        style={{
                          height: `${h}%`,
                          background:
                            i % 7 === 6
                              ? config.accentHex
                              : `color-mix(in oklab, ${config.accentHex} 35%, transparent)`,
                          opacity: 0.6 + (h / 100) * 0.4,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="mt-1 flex justify-between text-[9px] text-muted-foreground font-mono">
                  <span>lun</span>
                  <span>dom</span>
                  <span>lun</span>
                  <span>dom</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardWidgetCard({
  widget,
  config,
}: {
  widget: DashboardWidget;
  config: PlanConfig;
}) {
  const Icon = widget.icon;
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5 transition-colors",
        widget.tone === "warning"
          ? "border-amber-400/30 bg-amber-400/[0.06]"
          : widget.tone === "primary"
            ? cn(accentBorderClass(config.accent), accentBgClass(config.accent))
            : "border-border/40 bg-foreground/[0.02]"
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5", accentSoftTextClass(config.accent))} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
          {widget.label}
        </span>
      </div>
      <div className="mt-1 font-display text-base sm:text-lg font-medium text-foreground truncate">
        {widget.value}
      </div>
      {widget.delta && (
        <div
          className={cn(
            "text-[10px] font-mono",
            widget.deltaPositive ? "text-emerald-400" : "text-rose-400"
          )}
        >
          {widget.delta}
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * Features section
 * =======================================================*/
type FeatureItem = PlanConfig["features"][number];

function FeaturesSection({ config }: { config: PlanConfig }) {
  // group features by category
  const grouped: Array<[string, FeatureItem[]]> = React.useMemo(() => {
    const map: Record<string, FeatureItem[]> = {};
    for (const f of config.features) {
      const arr = map[f.category] ?? [];
      arr.push(f);
      map[f.category] = arr;
    }
    return Object.entries(map) as Array<[string, FeatureItem[]]>;
  }, [config]);

  return (
    <section className="rp-glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border/40">
        <Sparkles className={cn("h-4 w-4", accentSoftTextClass(config.accent))} />
        <h3 className="font-display text-base font-medium">
          Qué incluye {config.name}
        </h3>
        <Badge
          variant="outline"
          className={cn("border-current/40 text-[10px] uppercase ml-auto", accentSoftTextClass(config.accent))}
        >
          {config.features.length} features
        </Badge>
      </div>
      <div className="p-4 max-h-[460px] overflow-y-auto rp-scroll-thin space-y-4">
        {grouped.map(([category, items]) => (
          <div key={category}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-2">
              {category}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {items.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.label}
                    className="flex items-center gap-2 rounded-lg bg-foreground/[0.02] px-2.5 py-2"
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", accentSoftTextClass(config.accent))} />
                    <span className="text-xs text-foreground/90 flex-1 min-w-0 truncate">
                      {f.label}
                    </span>
                    <Check className={cn("h-3 w-3 shrink-0", accentSoftTextClass(config.accent))} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
 * Price card
 * =======================================================*/
function PriceCard({
  config,
  onCta,
}: {
  config: PlanConfig;
  onCta: () => void;
}) {
  return (
    <section
      className={cn(
        "rp-glass rounded-2xl p-5 lg:sticky lg:top-6 lg:self-start",
        accentGlowClass(config.accent)
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-medium">{config.name}</h3>
        <Badge
          variant="outline"
          className={cn("border-current/40 text-[10px] uppercase", accentSoftTextClass(config.accent))}
        >
          plan
        </Badge>
      </div>
      <div className="mt-4">
        {config.id === "enterprise" ? (
          <div className={cn("font-display text-3xl font-medium", accentTextClass(config.accent))}>
            {config.price}
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className={cn("font-display text-4xl sm:text-5xl font-medium", accentTextClass(config.accent))}>
              {config.price}
            </span>
            <span className="text-sm text-muted-foreground">{config.priceDetail}</span>
          </div>
        )}
        <div className="mt-1 text-xs text-muted-foreground">
          {config.id === "enterprise" ? config.priceDetail : "Sin permanencia"}
        </div>
      </div>

      <ul className="mt-5 space-y-2 text-sm">
        {[
          config.id === "starter" && "1 local incluido",
          config.id === "starter" && "5 usuarios",
          config.id === "professional" && "Hasta 3 locales",
          config.id === "professional" && "Usuarios ilimitados",
          config.id === "enterprise" && "Locales ilimitados",
          config.id === "enterprise" && "SSO + auditoría completa",
          config.id === "enterprise" && "SLA 99.95%+",
          config.id === "enterprise" && "CSM dedicado",
          config.id === "starter" && "Soporte email 48h",
          config.id === "professional" && "Soporte chat 24h",
          config.id === "enterprise" && "Soporte 24/7 prioritario",
        ]
          .filter(Boolean)
          .map((item) => (
            <li key={item as string} className="flex items-center gap-2">
              <Check className={cn("h-4 w-4 shrink-0", accentSoftTextClass(config.accent))} />
              <span className="text-foreground/90">{item as string}</span>
            </li>
          ))}
      </ul>

      <Button
        onClick={onCta}
        className={cn(
          "mt-5 w-full min-h-12 h-12 text-base",
          accentSolidButtonClass(config.accent)
        )}
      >
        {config.cta}
        <ArrowRight className="h-4 w-4" />
      </Button>

      <div className="mt-3 text-[11px] text-muted-foreground text-center">
        14 días de prueba · sin tarjeta
      </div>
    </section>
  );
}

/* =========================================================
 * Testimonial card
 * =========================================================*/
function TestimonialCard({ config }: { config: PlanConfig }) {
  const t = config.testimonial;
  return (
    <section
      className={cn(
        "rp-glass rounded-2xl p-5 sm:p-7 relative overflow-hidden",
        accentGlowClass(config.accent)
      )}
    >
      <Quote
        className={cn("absolute top-4 right-4 h-12 w-12 opacity-15", accentSoftTextClass(config.accent))}
      />
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star
            key={`star-${i}`}
            className={cn("h-4 w-4 fill-current", accentSoftTextClass(config.accent))}
          />
        ))}
        <span className="ml-2 text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
          caso real
        </span>
      </div>
      <blockquote className="font-display text-lg sm:text-xl font-medium leading-snug max-w-3xl">
        “{t.quote}”
      </blockquote>
      <div className="mt-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-medium text-background"
          style={{ background: config.accentHex }}
        >
          {t.author
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <div className="text-sm font-medium">{t.author}</div>
          <div className="text-xs text-muted-foreground">
            {t.role} · {t.location}
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn("ml-auto border-current/40 text-[10px] uppercase", accentSoftTextClass(config.accent))}
        >
          Plan {config.name}
        </Badge>
      </div>
    </section>
  );
}
