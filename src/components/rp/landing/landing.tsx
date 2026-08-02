"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useNav, type Section } from "@/components/rp/app/nav-store";
import { BrandMark, Logo } from "@/components/rp/app/brand";
import { HeroDashboard, TrustLogos, BeforeAfter, WhyBento, AnimatedCounter } from "@/components/rp/marketing";
import { DemoFloor, DemoCrm, DemoAi, DemoReviews, RoiCalculator, FaqSection } from "@/components/rp/marketing";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  PlayCircle,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  LayoutGrid,
  Users,
  Megaphone,
  Workflow,
  Star,
  BarChart3,
  Bot,
  Hourglass,
  Store,
  Plug,
  CalendarX,
  CalendarClock,
  UserX,
  Database,
  Hand,
  Unplug,
  TrendingDown,
  Check,
  ChevronRight,
  Circle,
  Clock,
  Zap,
  Quote,
  RefreshCw,
  Share2,
  LifeBuoy,
  Bell,
  type LucideIcon,
} from "lucide-react";

/* ===================================================================== *
 *  RestoPanel · Landing premium (dark, gold #D4AF37, turquoise #3DD6C9) *
 * ===================================================================== */

const NAV_LINKS = [
  "Producto",
  "Soluciones",
  "Reservas",
  "CRM",
  "IA",
  "Analytics",
  "Integraciones",
  "Precios",
  "Recursos",
  "Blog",
  "Centro de ayuda",
] as const;

/* ------------------------------ helpers ------------------------------ */

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

function useInView<T extends HTMLElement>(opts?: IntersectionObserverInit) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          ob.disconnect();
        }
      },
      opts ?? { threshold: 0.2 },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [opts]);
  return { ref, inView };
}

function useCountUp(target: number, run: boolean, duration = 1400) {
  const reduced = useReducedMotion();
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!run) return;
    if (reduced) {
      setVal(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, reduced, duration]);
  return val;
}


/* ------------------------------ Landing ------------------------------ */

export function Landing() {
  return (
    <div className="bg-background overflow-x-hidden">
      <LandingHeader />
      <main id="landing-top">
        <Hero />
        <SocialProofV2 />
        <Problems />
        <Platform />
        <DemoFloor />
        <DemoCrm />
        <DemoAi />
        <DemoReviews />
        <SectionRulesAuto />
        <SectionRealTime />
        <SectionCrmVip />
        <SectionPartner />
        <RoiCalculator />
        <WhyBento />
        <Pricing />
        <FaqSection />
        <FinalCTA />
      </main>
    </div>
  );
}

/* ------------------------------ Header ------------------------------- */

function LandingHeader() {
  const setView = useNav((s) => s.setView);
  const openAuth = useNav((s) => s.openAuth);
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goApp = () => {
    setOpen(false);
    setView("app");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "rp-glass-strong border-b border-border/60"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="#landing-top"
          className="flex items-center gap-2.5"
          aria-label="RestoPanel — inicio"
        >
          <BrandMark className="h-8 w-8" />
          <span className="font-display text-lg tracking-tight">RestoPanel</span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="ml-4 hidden 2xl:flex items-center gap-0.5 min-w-0"
        >
          {NAV_LINKS.map((label) => (
            <Link
              key={label}
              href="#p-plataforma"
              className="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/5 whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="sm" onClick={() => openAuth("login")}>
            Iniciar sesión
          </Button>
          <Button variant="outline" size="sm" onClick={goApp}>
            Entrar al panel
          </Button>
          <Button
            size="sm"
            onClick={() => { setOpen(false); openAuth("signup"); }}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black"
          >
            Crear cuenta
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>

        {/* Mobile CTA (compact) — visible below lg */}
        <Button
          size="sm"
          onClick={() => openAuth("signup")}
          className="ml-auto bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black lg:hidden"
        >
          Crear cuenta
        </Button>

        {/* Hamburger — visible below xl (covers lg–xl where desktop nav is hidden) */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Abrir menú"
              className="2xl:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88%] sm:max-w-sm rp-glass-strong">
            <SheetHeader className="px-5 pt-5">
              <SheetTitle className="text-left">
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav
              aria-label="Navegación móvil"
              className="flex-1 overflow-y-auto rp-scroll-thin px-3 py-4"
            >
              <ul className="space-y-0.5">
                {NAV_LINKS.map((label) => (
                  <li key={label}>
                    <SheetClose asChild>
                      <Link
                        href="#p-plataforma"
                        className="flex items-center justify-between rounded-md px-3 py-3 min-h-11 text-sm text-foreground/85 hover:bg-foreground/5 hover:text-foreground"
                      >
                        {label}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-border/60 p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => { setOpen(false); openAuth("login"); }}>
                Iniciar sesión
              </Button>
              <Button variant="outline" className="w-full justify-center" onClick={goApp}>
                Entrar al panel
              </Button>
              <Button
                className="w-full justify-center bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black"
                onClick={() => { setOpen(false); openAuth("signup"); }}
              >
                Crear cuenta
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

/* ------------------------------- Hero -------------------------------- */

function Hero() {
  const setView = useNav((s) => s.setView);
  const openAuth = useNav((s) => s.openAuth);

  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Background layers */}
      <div
        className="absolute inset-0 -z-10 rp-grid-bg opacity-60"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(900px 500px at 12% 8%, color-mix(in oklab, var(--gold) 18%, transparent) 0%, transparent 60%)," +
            "radial-gradient(800px 500px at 92% 22%, color-mix(in oklab, var(--teal) 16%, transparent) 0%, transparent 55%)," +
            "radial-gradient(700px 700px at 50% 100%, color-mix(in oklab, var(--gold) 8%, transparent) 0%, transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40"
        aria-hidden
        style={{
          background:
            "linear-gradient(to top, var(--background) 0%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-10 items-center">
          {/* Left: copy */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/8 px-3 py-1 text-xs font-mono uppercase tracking-wider text-[var(--gold-soft)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              SaaS Enterprise para restaurantes
            </div>

            <h1
              id="hero-title"
              className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight text-balance"
            >
              Software para restaurantes que convierte{" "}
              <span className="rp-gold-gradient font-normal">cada servicio</span>{" "}
              en más ingresos
            </h1>

            <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-xl">
              Gestiona reservas, mesas, clientes, marketing, reputación y
              rendimiento desde una única plataforma diseñada para crecer con tu
              restaurante.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => openAuth("signup")}
                className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black"
              >
                Crear cuenta
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setView("app")}
              >
                Explorar RestoPanel
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setView("app")}
              >
                <PlayCircle className="h-4 w-4" aria-hidden />
                Ver cómo funciona
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[var(--teal)]" aria-hidden />
                Sin tarjeta para probar
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[var(--teal)]" aria-hidden />
                Onboarding en 24-48h
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[var(--teal)]" aria-hidden />
                Datos migrados desde TheFork y POS
              </span>
            </div>
          </div>

          {/* Right: dashboard preview */}
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  const reduced = useReducedMotion();
  return (
    <div className="relative min-w-0">
      <div
        className={cn(
          "relative rounded-2xl rp-glass-strong p-4 sm:p-5",
          !reduced && "animate-in fade-in slide-in-from-bottom-4 duration-700",
        )}
        style={{
          boxShadow:
            "0 0 0 1px color-mix(in oklab, var(--gold) 25%, transparent)," +
            "0 30px 80px -30px color-mix(in oklab, var(--gold) 40%, transparent)",
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-2.5 w-2.5">
              <span
                className={cn(
                  "absolute inset-0 rounded-full bg-[var(--teal)]",
                  !reduced && "animate-ping opacity-75",
                )}
                aria-hidden
              />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--teal)]" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Servicio · viernes 21:14
            </span>
          </div>
          
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <PreviewKpi label="Reservas hoy" value="47" delta="+12%" tone="gold" />
          <PreviewKpi label="Ocupación" value="78%" delta="+5pp" tone="teal" />
          <PreviewKpi label="Ticket medio" value="38€" delta="+2€" tone="gold" />
          <PreviewKpi label="No-shows" value="3" delta="-1" tone="teal" invert />
        </div>

        {/* Reservations mini list */}
        <div className="mt-3 rounded-xl border border-border/50 bg-background/40 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Próximas reservas
            </span>
            <span className="text-[11px] text-muted-foreground">3 de 47</span>
          </div>
          <ul className="divide-y divide-border/40">
            {HERO_RESERVATIONS.map((r, i) => (
              <li
                key={r.name}
                className="flex items-center gap-3 px-3 py-2"
                style={{
                  animation: reduced
                    ? undefined
                    : `rp-fade-in 0.5s ease-out ${0.2 + i * 0.12}s both`,
                }}
              >
                <span className="text-xs font-mono text-[var(--gold-soft)] w-12">
                  {r.time}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.pax} pax · {r.table}
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                    r.status === "Confirmada" &&
                      "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
                    r.status === "Pendiente" &&
                      "border-amber-400/40 bg-amber-400/10 text-amber-300",
                    r.status === "En mesa" &&
                      "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
                  )}
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Floor plan mini */}
        <div className="mt-3 rounded-xl border border-border/50 bg-background/40 p-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Plano de sala
            </span>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <LegendDot className="bg-[var(--gold)]" label="Ocupada" />
              <LegendDot className="bg-[var(--teal)]" label="Reservada" />
              <LegendDot className="bg-foreground/25" label="Libre" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {HERO_TABLES.map((t, i) => (
              <div
                key={t.id}
                className={cn(
                  "rounded-md border px-2 py-2 text-center text-[11px] font-mono",
                  t.state === "ocupada" &&
                    "border-[var(--gold)]/45 bg-[var(--gold)]/12 text-[var(--gold-soft)]",
                  t.state === "reservada" &&
                    "border-[var(--teal)]/45 bg-[var(--teal)]/12 text-[var(--teal)]",
                  t.state === "libre" &&
                    "border-border/50 bg-foreground/[0.03] text-muted-foreground",
                )}
                style={{
                  animation: reduced
                    ? undefined
                    : `rp-fade-in 0.4s ease-out ${0.4 + i * 0.06}s both`,
                }}
              >
                <div className="text-[10px] uppercase tracking-wider opacity-70">
                  {t.id}
                </div>
                <div className="mt-0.5 text-sm">{t.pax}p</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating chip */}
      <div
        className={cn(
          "absolute -left-4 top-1/3 hidden sm:flex rp-glass-strong rounded-lg px-3 py-2 items-center gap-2",
          !reduced && "animate-in fade-in slide-in-from-left-4 duration-700 delay-300",
        )}
        style={{
          boxShadow:
            "0 0 0 1px color-mix(in oklab, var(--teal) 30%, transparent)",
        }}
      >
        <Bot className="h-4 w-4 text-[var(--teal)]" aria-hidden />
        <div className="text-[11px] leading-tight">
          <div className="text-muted-foreground">IA Copilot</div>
          <div className="font-medium">Mesa 7 rinde -18%</div>
        </div>
      </div>
    </div>
  );
}

function PreviewKpi({
  label,
  value,
  delta,
  tone,
  invert,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "gold" | "teal";
  invert?: boolean;
}) {
  const isPositive = !invert;
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-2xl font-light">{value}</span>
        <span
          className={cn(
            "text-xs font-mono",
            tone === "gold"
              ? "text-[var(--gold-soft)]"
              : "text-[var(--teal)]",
            !isPositive && "text-[var(--teal)]",
          )}
        >
          {delta}
        </span>
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("h-1.5 w-1.5 rounded-full", className)} aria-hidden />
      {label}
    </span>
  );
}

const HERO_RESERVATIONS = [
  { time: "21:30", name: "Familia Ortega", pax: 4, table: "Mesa 12", status: "Confirmada" as const },
  { time: "21:45", name: "Sra. Velasco", pax: 2, table: "Mesa 5", status: "Pendiente" as const },
  { time: "22:00", name: "Cumple Lara", pax: 6, table: "Mesa 18", status: "En mesa" as const },
];

const HERO_TABLES = [
  { id: "M1", pax: 2, state: "ocupada" as const },
  { id: "M2", pax: 2, state: "libre" as const },
  { id: "M3", pax: 4, state: "reservada" as const },
  { id: "M5", pax: 2, state: "reservada" as const },
  { id: "M7", pax: 4, state: "ocupada" as const },
  { id: "M9", pax: 6, state: "libre" as const },
];

/* --------------------------- Social proof ---------------------------- */

const METRICS: {
  label: string;
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: (v: number) => string;
}[] = [
  { label: "Reservas gestionadas", target: 1.2, format: (v) => `${v.toFixed(1)}M` },
  { label: "Restaurantes activos", target: 3400, format: (v) => Math.round(v).toLocaleString("es-ES") },
  { label: "No-shows reducidos", target: -42, format: (v) => `${Math.round(v)}%` },
  { label: "Horas ahorradas", target: 180, format: (v) => `${Math.round(v)}k/mes` },
  { label: "Clientas fidelizadas", target: 2.1, format: (v) => `${v.toFixed(1)}M` },
  { label: "Mejora media valoración", target: 0.6, format: (v) => `+${v.toFixed(1)}★` },
];

function SocialProofV2() {
  return (
    <section className="border-t border-border/60 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Con la confianza de 1.200+ restaurantes
          </p>
        </div>
        <TrustLogos />
      </div>
    </section>
  );
}

function SocialProof() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section className="border-t border-border/40 bg-background/60 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            La plataforma en cifras
          </p>
          
        </div>
        <div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6"
        >
          {METRICS.map((m, i) => (
            <MetricCard key={m.label} metric={m} run={inView} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  metric,
  run,
  delay,
}: {
  metric: (typeof METRICS)[number];
  run: boolean;
  delay: number;
}) {
  const val = useCountUp(metric.target, run);
  const reduced = useReducedMotion();
  return (
    <div
      className={cn(
        "rp-glass rounded-xl p-4 sm:p-5",
        !reduced && "animate-in fade-in slide-in-from-bottom-2 duration-500",
      )}
      style={{ animationDelay: reduced ? undefined : `${delay}ms` }}
    >
      <div className="font-display text-2xl sm:text-3xl font-light rp-gold-text">
        {metric.format(val)}
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground leading-snug">
        {metric.label}
      </div>
    </div>
  );
}

/* ----------------------------- Problems ------------------------------ */

type Problem = {
  icon: LucideIcon;
  title: string;
  desc: string;
  sol: string;
  section: Section;
};

const PROBLEMS: Problem[] = [
  {
    icon: CalendarX,
    title: "Reservas dispersas",
    desc: "WhatsApp, teléfono, TheFork y web sin una sola fuente de verdad.",
    sol: "Reservas inteligentes",
    section: "reservas",
  },
  {
    icon: CalendarClock,
    title: "Mesas vacías",
    desc: "Turnos sin optimizar y plano de sala sin visibilidad de ocupación real.",
    sol: "Plano de mesas",
    section: "reservas",
  },
  {
    icon: UserX,
    title: "No-shows",
    desc: "Huecos imprevistos que cuestan hasta el 15% de la facturación mensual.",
    sol: "Reservas inteligentes",
    section: "reservas",
  },
  {
    icon: Database,
    title: "Datos de clientes perdidos",
    desc: "Histórico, preferencias y alergias repartidos en cuadernos y teléfonos.",
    sol: "CRM",
    section: "crm",
  },
  {
    icon: Star,
    title: "Reseñas sin responder",
    desc: "Cada reseña sin respuesta es un cliente que no vuelve.",
    sol: "Google Reviews",
    section: "reviews",
  },
  {
    icon: Hand,
    title: "Procesos manuales",
    desc: "Confirmaciones, recordatorios y cumpleaños gestionados a mano.",
    sol: "Automatizaciones",
    section: "automatizaciones",
  },
  {
    icon: Unplug,
    title: "Herramientas desconectadas",
    desc: "POS, delivery, reservas y marketing en silos que no comparten datos.",
    sol: "Integraciones",
    section: "integraciones",
  },
  {
    icon: TrendingDown,
    title: "Sin visibilidad de rentabilidad",
    desc: "Decisiones sin datos: no sabes qué plato, turno o camarero pierde dinero.",
    sol: "Analytics",
    section: "analytics",
  },
];

function Problems() {
  const go = useNav((s) => s.go);
  return (
    <section className="border-t border-border/60 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 sm:mb-14 max-w-3xl">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">01</span>
            <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
            <span>El problema</span>
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-balance">
            Ocho problemas que cuestan dinero cada servicio
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
            Cada cuello de botella se traduce en reservas perdidas, mesas vacías
            o clientes que no vuelven. RestoPanel ataca cada uno con un módulo
            concreto.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROBLEMS.map((p) => (
            <div
              key={p.title}
              className="group rp-glass rounded-2xl p-5 transition-all hover:border-[var(--gold)]/30 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-foreground/5 text-muted-foreground group-hover:text-[var(--gold-soft)] group-hover:border-[var(--gold)]/40 transition-colors">
                  <p.icon className="h-5 w-5" aria-hidden />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                  problema
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-medium tracking-tight">
                {p.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {p.desc}
              </p>
              <button
                onClick={() => go(p.section)}
                className="mt-4 inline-flex items-center gap-1.5 min-h-11 text-xs font-medium text-[var(--gold-soft)] hover:text-[var(--gold)]"
              >
                <span className="text-muted-foreground">→ Solución:</span>
                <span>{p.sol}</span>
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Platform ------------------------------ */

type Module = {
  name: string;
  benefit: string;
  icon: LucideIcon;
  status: "Disponible" | "Próximamente";
  section: Section;
};

const MODULES: Module[] = [
  {
    name: "Reservas inteligentes",
    benefit: "Calendario, timeline y confirmaciones automáticas que reducen no-shows.",
    icon: CalendarCheck,
    status: "Disponible",
    section: "reservas",
  },
  {
    name: "Plano de mesas",
    benefit: "Drag & drop de mesas en tiempo real con estados y turnos.",
    icon: LayoutGrid,
    status: "Disponible",
    section: "reservas",
  },
  {
    name: "CRM",
    benefit: "Historial, preferencias, alergias, VIP y consentimiento por cliente.",
    icon: Users,
    status: "Disponible",
    section: "crm",
  },
  {
    name: "Marketing",
    benefit: "Campañas SMS y email segmentadas y medibles desde el CRM.",
    icon: Megaphone,
    status: "Disponible",
    section: "marketing",
  },
  {
    name: "Automatizaciones",
    benefit: "Reglas if-this-then-that para reservas, no-shows y cumpleaños.",
    icon: Workflow,
    status: "Disponible",
    section: "automatizaciones",
  },
  {
    name: "Google Reviews",
    benefit: "Solicita reseñas en el momento justo y responde desde un buzón único.",
    icon: Star,
    status: "Disponible",
    section: "reviews",
  },
  {
    name: "Analytics",
    benefit: "Rentabilidad por servicio, plato, camarero y horario en tiempo real.",
    icon: BarChart3,
    status: "Disponible",
    section: "analytics",
  },
  {
    name: "IA Copilot",
    benefit: "Pregunta en lenguaje natural y actúa: “¿Qué mesa rinde menos?”.",
    icon: Bot,
    status: "Disponible",
    section: "dashboard",
  },
  {
    name: "Lista de espera",
    benefit: "Clientes sin reserva con SMS de aviso y estimación de espera en vivo.",
    icon: Hourglass,
    status: "Próximamente",
    section: "reservas",
  },
  {
    name: "Marketplace",
    benefit: "Conecta con proveedores y servicios para restaurantes.",
    icon: Store,
    status: "Próximamente",
    section: "integraciones",
  },
  {
    name: "Integraciones",
    benefit: "Stripe, WhatsApp, Google Business, SumUp, TheFork y más.",
    icon: Plug,
    status: "Disponible",
    section: "integraciones",
  },
];

function Platform() {
  const go = useNav((s) => s.go);
  return (
    <section
      id="p-plataforma"
      className="border-t border-border/60 py-16 sm:py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 sm:mb-14 max-w-3xl">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">02</span>
            <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
            <span>La plataforma</span>
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-balance">
            Una plataforma conectada, no una colección de herramientas
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
            Once módulos que comparten los mismos datos, los mismos permisos y la
            misma identidad de cliente. Lo que cambia en reservas aparece al
            instante en CRM, analytics y marketing.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MODULES.map((m) => (
            <div
              key={m.name}
              className="group flex flex-col rp-glass rounded-2xl p-5 transition-all hover:border-[var(--gold)]/30 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/8 text-[var(--gold-soft)]">
                  <m.icon className="h-5 w-5" aria-hidden />
                </div>
                <StatusPill status={m.status} />
              </div>
              <h3 className="mt-4 font-display text-lg font-medium tracking-tight">
                {m.name}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {m.benefit}
              </p>
              <button
                onClick={() => go(m.section)}
                className="mt-4 inline-flex items-center gap-1.5 min-h-11 text-xs font-medium text-[var(--gold-soft)] hover:text-[var(--gold)] self-start"
                aria-label={`Explorar módulo ${m.name}`}
              >
                Explorar
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: "Disponible" | "Próximamente" }) {
  if (status === "Disponible") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" aria-hidden />
        Disponible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-foreground/15 bg-foreground/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" aria-hidden />
      Próximamente
    </span>
  );
}

/* ----------------------- Deep dive: Reservas ------------------------- */

function DeepDiveReservas() {
  const go = useNav((s) => s.go);
  return (
    <section className="border-t border-border/60 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              <span className="rp-gold-text">03</span>
              <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
              <span>Reservas y plano inteligente</span>
            </div>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-light tracking-tight text-balance">
              Calendario, timeline y drag &amp; drop de mesas en una sola vista
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Cada reserva entra al sistema una sola vez y aparece en el
              calendario, en el plano y en el CRM. Las confirmaciones y
              recordatorios se envían solos, y las reglas anti-no-show deciden
              cuándo pedir depósito o tarjeta.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Calendario por turnos con filtros de servicio, zona y pax.",
                "Timeline horizontal con drag & drop entre mesas y horas.",
                "Confirmaciones automáticas por SMS y WhatsApp con idempotencia.",
                "Reglas anti-no-show: depósito, pre-autorización o lista de espera.",
                "Sustitución de última hora con reasignación inteligente de mesas.",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" aria-hidden />
                  <span className="text-foreground/85">{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                onClick={() => go("reservas")}
                className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black"
              >
                Explorar reservas
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button variant="outline" onClick={() => go("reservas")}>
                Ver plano en vivo
              </Button>
            </div>
          </div>

          <ReservationsMock />
        </div>
      </div>
    </section>
  );
}

function ReservationsMock() {
  const hours = ["13:00", "13:30", "14:00", "14:30", "15:00"];
  const lanes = ["Mesa 5", "Mesa 7", "Mesa 12"];
  const blocks: Record<string, { start: number; span: number; name: string; pax: number; tone: "gold" | "teal" | "muted" }> = {
    "Mesa 5": { start: 0, span: 2, name: "Sra. Velasco", pax: 2, tone: "teal" },
    "Mesa 7": { start: 1, span: 3, name: "Familia Ortega", pax: 4, tone: "gold" },
    "Mesa 12": { start: 2, span: 2, name: "Cumple Lara", pax: 6, tone: "gold" },
  };

  return (
    <div className="rp-glass-strong rounded-2xl p-4 sm:p-5 relative min-w-0">
      
      <div className="flex items-center gap-2 mb-4">
        <CalendarCheck className="h-4 w-4 text-[var(--gold-soft)]" aria-hidden />
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Timeline · viernes · servicio de comida
        </span>
      </div>

      {/* Calendar header — horizontally scrollable on narrow viewports */}
      <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
      <div className="grid gap-2 min-w-[520px]" style={{ gridTemplateColumns: `120px repeat(${hours.length}, 1fr)` }}>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground" />
        {hours.map((h) => (
          <div
            key={h}
            className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground text-center"
          >
            {h}
          </div>
        ))}

        {lanes.map((lane) => (
          <React.Fragment key={lane}>
            <div className="text-xs text-foreground/80 font-medium py-3">
              {lane}
            </div>
            {hours.map((_, hi) => {
              const b = blocks[lane];
              const isStart = b && hi === b.start;
              const isInside = b && hi > b.start && hi < b.start + b.span;
              if (isStart) {
                return (
                  <div
                    key={`${lane}-${hi}`}
                    className={cn(
                      "rounded-md border px-2 py-2 text-xs h-14 flex flex-col justify-center",
                      b.tone === "gold" &&
                        "border-[var(--gold)]/45 bg-[var(--gold)]/12 text-[var(--gold-soft)]",
                      b.tone === "teal" &&
                        "border-[var(--teal)]/45 bg-[var(--teal)]/12 text-[var(--teal)]",
                      b.tone === "muted" &&
                        "border-border/50 bg-foreground/5 text-muted-foreground",
                    )}
                    style={{ gridColumn: `span ${b.span}` }}
                  >
                    <div className="font-medium truncate">{b.name}</div>
                    <div className="text-[10px] opacity-80">{b.pax} pax</div>
                  </div>
                );
              }
              if (isInside) return null;
              return (
                <div
                  key={`${lane}-${hi}`}
                  className="h-14 rounded-md border border-dashed border-border/40 bg-background/30"
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-md border border-border/50 bg-background/40 p-2">
          <div className="text-muted-foreground font-mono uppercase tracking-wider text-[10px]">
            Confirmadas
          </div>
          <div className="mt-1 font-display text-lg text-[var(--gold-soft)]">
            47
          </div>
        </div>
        <div className="rounded-md border border-border/50 bg-background/40 p-2">
          <div className="text-muted-foreground font-mono uppercase tracking-wider text-[10px]">
            Pendientes
          </div>
          <div className="mt-1 font-display text-lg text-amber-300">5</div>
        </div>
        <div className="rounded-md border border-border/50 bg-background/40 p-2">
          <div className="text-muted-foreground font-mono uppercase tracking-wider text-[10px]">
            Riesgo no-show
          </div>
          <div className="mt-1 font-display text-lg text-[var(--teal)]">2</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Deep dive: CRM ---------------------------- */

function DeepDiveCRM() {
  const go = useNav((s) => s.go);
  return (
    <section className="border-t border-border/60 py-16 sm:py-24 bg-foreground/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <CrmMock />
          <div className="lg:order-2">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              <span className="rp-gold-text">04</span>
              <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
              <span>CRM que recuerda</span>
            </div>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-light tracking-tight text-balance">
              Cada cliente con su historia, no solo con su teléfono
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              El CRM de RestoPanel recuerda cada visita, cada preferencia y cada
              alergia. Cuando el cliente vuelve, el equipo de sala sabe
              exactamente cómo atenderle — y el marketing sabe qué mensaje
              enviarle.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                { k: "Visitas", v: "Historial completo por cliente" },
                { k: "Frecuencia", v: "Cadencia y última visita" },
                { k: "Ticket medio", v: "Gasto acumulado y por servicio" },
                { k: "Preferencias", v: "Mesa favorita, platos, vino" },
                { k: "Alergias", v: "Avisos en sala y en cocina" },
                { k: "Cumpleaños", v: "Campañas automáticas" },
                { k: "Etiquetas", v: "VIP, business, regular, famoso" },
                { k: "Consentimiento", v: "RGPD y preferencias de canal" },
              ].map((it) => (
                <div
                  key={it.k}
                  className="rp-glass rounded-lg p-3"
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                    {it.k}
                  </div>
                  <div className="mt-1 text-sm text-foreground/85">{it.v}</div>
                </div>
              ))}
            </div>
            <Button
              className="mt-7 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black"
              onClick={() => go("crm")}
            >
              Explorar CRM
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CrmMock() {
  return (
    <div className="rp-glass-strong rounded-2xl p-5 relative min-w-0">
      
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black text-lg font-medium">
          EV
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-medium">Elena Velasco</h3>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/45 bg-[var(--gold)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
              <Star className="h-3 w-3" aria-hidden />
              VIP
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Cliente desde 2022 · +34 6•• ••• ••8
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Visitas" value="28" />
        <MiniStat label="Freq." value="2,1/mes" />
        <MiniStat label="Ticket" value="42€" />
      </div>

      <div className="mt-4 rounded-xl border border-border/50 bg-background/40 p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Preferencias
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Mesa 5 (ventana)", "Vino tinto Rioja", "Sin gluten", "Cumple 14/03"].map((t) => (
            <span
              key={t}
              className="rounded-md border border-border/60 bg-foreground/5 px-2 py-0.5 text-[11px]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/8 p-3">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-amber-300">
          <ShieldCheck className="h-3 w-3" aria-hidden />
          Alergias
        </div>
        <div className="mt-1 text-sm text-amber-200">
          Apio · Mariscos (anafilaxia)
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border/50 bg-background/40 p-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          Últimas visitas
        </div>
        <ul className="space-y-1.5 text-xs">
          {[
            { d: "12 mar", t: "Comida · 2p · 44€" },
            { d: "28 feb", t: "Cena · 4p · 168€" },
            { d: "14 feb", t: "Cena · 2p · 38€" },
          ].map((v) => (
            <li key={v.d} className="flex items-center gap-3">
              <span className="font-mono text-[var(--gold-soft)] w-12">{v.d}</span>
              <span className="text-foreground/80">{v.t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/40 p-2 text-center">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-display text-base text-[var(--gold-soft)]">
        {value}
      </div>
    </div>
  );
}

/* ------------------------- Deep dive: IA ----------------------------- */

function DeepDiveIA() {
  const go = useNav((s) => s.go);
  const [active, setActive] = React.useState(0);
  const reduced = useReducedMotion();

  return (
    <section className="border-t border-border/60 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              <span className="rp-gold-text">05</span>
              <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
              <span>IA Copilot</span>
            </div>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-light tracking-tight text-balance">
              Pregunta en lenguaje natural. Recibe respuestas con fuentes y
              confianza.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              El Copilot lee tus datos de reservas, CRM y analytics y responde
              con un nivel de confianza, las fuentes que usó y las acciones que
              puedes ejecutar directamente desde el chat.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {IA_QUERIES.map((q, i) => (
                <button
                  key={q}
                  onClick={() => setActive(i)}
                  className={cn(
                    "inline-flex items-center min-h-11 rounded-full border px-3 py-2 text-xs transition-colors text-left",
                    active === i
                      ? "border-[var(--teal)]/50 bg-[var(--teal)]/10 text-[var(--teal)]"
                      : "border-border/60 bg-foreground/5 text-muted-foreground hover:text-foreground hover:border-foreground/30",
                  )}
                >
                  {q}
                </button>
              ))}
            </div>

            <Button
              className="mt-7 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black"
              onClick={() => go("dashboard")}
            >
              Hablar con el Copilot
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          <div className="rp-glass-strong rounded-2xl p-5 relative">
            
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]">
                <Bot className="h-4 w-4" aria-hidden />
              </div>
              <div>
                <div className="text-sm font-medium">RestoPanel Copilot</div>
                <div className="text-[11px] text-muted-foreground">
                  Conectado a reservas · CRM · analytics
                </div>
              </div>
            </div>

            <div
              className="rounded-xl border border-border/50 bg-background/40 p-3 mb-3"
              aria-live="polite"
            >
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                <Quote className="h-3 w-3" aria-hidden />
                Pregunta
              </div>
              <div className="text-sm text-foreground/90">
                {IA_QUERIES[active]}
              </div>
            </div>

            <div
              key={active}
              className={cn(
                "rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/5 p-3",
                !reduced && "animate-in fade-in slide-in-from-bottom-2 duration-500",
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[var(--teal)]">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Respuesta
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-mono text-[var(--teal)]">
                  Confianza {IA_ANSWERS[active].confidence}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {IA_ANSWERS[active].text}
              </p>

              <div className="mt-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  Fuentes
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {IA_ANSWERS[active].sources.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-border/60 bg-foreground/5 px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {IA_ANSWERS[active].actions.map((a) => (
                  <button
                    key={a}
                    onClick={() => go("dashboard")}
                    className="inline-flex items-center gap-1.5 min-h-11 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2.5 py-2 text-xs text-[var(--gold-soft)] hover:bg-[var(--gold)]/20"
                  >
                    <Zap className="h-3 w-3" aria-hidden />
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const IA_QUERIES = [
  "¿Qué mesa rinde menos este mes?",
  "¿Cuánto nos han costado los no-shows en marzo?",
  "¿Qué clientes VIP no vienen desde hace 60 días?",
  "¿Qué turno conviene abrir más?",
];

const IA_ANSWERS: {
  confidence: string;
  text: string;
  sources: string[];
  actions: string[];
}[] = [
  {
    confidence: "92%",
    text: "La Mesa 7 rinde un 18% menos que la media del comedor en marzo: ocupa 4 pax pero solo factura 28€ por servicio, frente a los 42€ de media. Suele asignarse a parejas en horas valle (15:00-16:00).",
    sources: ["analytics.facturacion_por_mesa", "reservas.ocupacion_30d", "crm.ticket_medio"],
    actions: ["Reasignar Mesa 7 a 4 pax", "Bloquear en horas valle", "Ver historial completo"],
  },
  {
    confidence: "97%",
    text: "En marzo tuviste 14 no-shows con un coste estimado de 532€ (14 × 38€ ticket medio). El 71% ocurrió en viernes y sábados. Con depósito de 10€ en esas franjas reducirías el riesgo entre un 40-60%.",
    sources: ["reservas.no_shows", "analytics.ticket_medio", "automatizaciones.reglas"],
    actions: ["Activar depósito en fines de semana", "Ver lista de no-shows", "Crear regla anti-no-show"],
  },
  {
    confidence: "89%",
    text: "Detecto 12 clientes VIP sin visita en 60+ días. El de mayor valor histórico es Elena Velasco (28 visitas, 1.176€ acumulados), última visita el 12 de marzo. Sugerencia: campaña SMS personalizada con invitación a su mesa favorita (Mesa 5).",
    sources: ["crm.clientes_vip", "crm.visitas_60d", "reservas.preferencias"],
    actions: ["Lanzar campaña VIP", "Ver ficha completa", "Reservar Mesa 5"],
  },
  {
    confidence: "84%",
    text: "El viernes de 21:30 a 22:30 concentra el 38% de la demanda pero solo el 24% de la oferta de mesas. Abrir 4 mesas más en esa franja durante marzo y abril podría sumar unos 2.400€/mes adicionales.",
    sources: ["analytics.demanda_por_hora", "reservas.ocupacion", "crm.ticket_medio"],
    actions: ["Abrir 4 mesas extra", "Crear turno viernes-noche", "Ver proyección"],
  },
];

/* ----------------------------- Pricing ------------------------------- */

type PlanKey = "starter" | "professional" | "enterprise";

interface PlanData {
  name: string;
  monthly: number;
  annual: number;
  tagline: string;
  features: string[];
  baseLocals: number;
  maxLocals: number;
  baseUsers: number;
  unlimited?: boolean;
  highlight?: boolean;
}

const PLANS: Record<PlanKey, PlanData> = {
  starter: {
    name: "Starter",
    monthly: 49,
    annual: 470,
    tagline: "Para restaurantes independientes que empiezan a digitalizar su operación.",
    features: [
      "SLA 99.5%",
      "Backups diarios",
      "Infraestructura compartida",
      "Monitorización básica",
      "Soporte estándar",
    ],
    baseLocals: 1,
    maxLocals: 1,
    baseUsers: 3,
  },
  professional: {
    name: "Professional",
    monthly: 99,
    annual: 950,
    tagline: "Para grupos en crecimiento que necesitan analítica y prioridad.",
    features: [
      "SLA 99.9%",
      "Backups cada hora",
      "Mayor prioridad de procesamiento",
      "Analítica avanzada",
      "Monitorización avanzada",
      "Prioridad en Workers",
      "Soporte prioritario",
    ],
    baseLocals: 5,
    maxLocals: 5,
    baseUsers: 10,
    highlight: true,
  },
  enterprise: {
    name: "Enterprise",
    monthly: 249,
    annual: 2390,
    tagline: "Para cadenas y operaciones multi-país con requisitos críticos.",
    features: [
      "SLA 99.99%",
      "Infraestructura dedicada",
      "Multi región activa",
      "Failover automático",
      "IA dedicada",
      "Soporte 24/7",
      "Arquitecto técnico asignado",
      "Account Manager",
      "Auditorías de rendimiento",
      "Escalado personalizado",
    ],
    baseLocals: 1,
    maxLocals: 50,
    baseUsers: 0,
    unlimited: true,
  },
};

const COMPARISON: {
  feature: string;
  starter: string | boolean;
  professional: string | boolean;
  enterprise: string | boolean;
}[] = [
  { feature: "Locales incluidos", starter: "1", professional: "5", enterprise: "Ilimitado" },
  { feature: "Usuarios incluidos", starter: "3", professional: "10", enterprise: "Ilimitado" },
  { feature: "Reservas inteligentes", starter: true, professional: true, enterprise: true },
  { feature: "Plano de mesas", starter: true, professional: true, enterprise: true },
  { feature: "CRM", starter: true, professional: true, enterprise: true },
  { feature: "Marketing (SMS/email)", starter: "Pago por uso", professional: "5k incluidos", enterprise: "Ilimitado" },
  { feature: "Automatizaciones", starter: "5 activas", professional: "50 activas", enterprise: "Ilimitado" },
  { feature: "Google Reviews", starter: true, professional: true, enterprise: true },
  { feature: "Analytics avanzado", starter: false, professional: true, enterprise: true },
  { feature: "IA Copilot", starter: false, professional: true, enterprise: true },
  { feature: "Lista de espera", starter: false, professional: false, enterprise: true },
  { feature: "Marketplace", starter: false, professional: false, enterprise: true },
  { feature: "Integraciones (Stripe, POS…)", starter: "3", professional: "Ilimitado", enterprise: "Ilimitado + API" },
  { feature: "Soporte", starter: "Estándar", professional: "Prioritario", enterprise: "24/7 + CSM" },
  { feature: "Onboarding", starter: "Autoservicio", professional: "Guiado 24-48h", enterprise: "Personalizado" },
  { feature: "SLA", starter: "99.5%", professional: "99.9%", enterprise: "99.99%" },
  { feature: "Backups", starter: "Diarios", professional: "Cada hora", enterprise: "Continuos + DR" },
  { feature: "Infraestructura", starter: "Compartida", professional: "Compartida", enterprise: "Dedicada" },
];

/* ===================================================================== *
 *  Secciones con imágenes de producto reales (TASK LANDING-IMAGES)      *
 * ===================================================================== */

/** Wrapper consistente para imágenes de producto con marco premium. */
function ProductImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
  aspect = "aspect-[16/10]",
  objectPosition = "object-center sm:object-[center_30%]",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  aspect?: string;
  /**
   * Posición del objeto dentro del recorte. Por defecto centra en móvil y
   * sube el foco al 30% vertical en ≥sm para que salgan bien las personas
   * y la comida (suele estar en el tercio superior de la composición).
   */
  objectPosition?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rp-glass rounded-2xl border border-border/40 shadow-2xl shadow-[var(--gold)]/5",
        aspect,
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={cn("object-cover", objectPosition)}
      />
    </div>
  );
}

/* --------- Section A: Tú defines las reglas. RestoPanel hace el trabajo. --------- */

const RULES_FEATURES = [
  {
    icon: Bell,
    title: "Confirmaciones y reconfirmaciones automáticas",
    description:
      "Email, SMS o WhatsApp según el canal por el que llegó la reserva. Tú eliges cuándo y cuántas veces.",
    image: "/brand/product/confirmacion-reserva.jpg",
    alt: "Pareja en mesa de restaurante recibiendo notificación de confirmación de reserva en el móvil",
  },
  {
    icon: RefreshCw,
    title: "Reposicionamiento y listas de espera",
    description:
      "Si alguien cancela, el sistema reposiciona automáticamente a quien estaba en cola y le avisa.",
    image: "/brand/product/plano-mesas-calendario.jpg",
    alt: "Personal de sala con tablet viendo el plano de mesas con calendario y estados de mesa en tiempo real",
  },
  {
    icon: Share2,
    title: "Sincronización multicanal",
    description:
      "La disponibilidad se actualiza al instante en tu web, Google Maps y redes sociales. Nadie reserva una mesa que ya no existe.",
    image: "/brand/product/dashboard-reservas.jpg",
    alt: "Dashboard de reservas con botón nueva reserva, pestañas restaurante terraza y zona VIP, gráficos y perfil de cliente",
  },
] as const;

function SectionRulesAuto() {
  return (
    <section
      id="p-reglas"
      className="border-t border-border/60 py-16 sm:py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 sm:mb-14 max-w-3xl">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">·</span>
            <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
            <span>Automatización</span>
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-balance">
            Tú defines las reglas.{" "}
            <span className="rp-gold-gradient font-normal">RestoPanel hace el trabajo.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
            Configura una vez tus políticas de reserva, tiempos de mesa, cobros y
            recordatorios. El sistema se encarga de ejecutarlas sin que tengas
            que tocar nada más.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {RULES_FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="group flex flex-col rp-glass rounded-2xl p-4 sm:p-5 transition-all hover:border-[var(--gold)]/30 hover:-translate-y-0.5"
            >
              <ProductImage
                src={f.image}
                alt={f.alt}
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={i === 0}
                aspect="aspect-[4/3]"
                className="mb-5"
              />
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/8 text-[var(--gold-soft)]">
                  <f.icon className="h-4 w-4" aria-hidden />
                </span>
                <h3 className="font-display text-lg font-medium tracking-tight leading-tight">
                  {f.title}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-10 sm:mt-14 text-center font-display text-lg sm:text-xl font-light tracking-tight text-foreground/90 max-w-3xl mx-auto text-balance">
          Menos llamadas y WhatsApps improvisados.{" "}
          <span className="rp-gold-text">Más reservas confirmadas.</span>{" "}
          Más tiempo para cuidar la experiencia en sala.
        </p>
      </div>
    </section>
  );
}

/* --------- Section B: Reservas confirmadas en tiempo real --------- */

const REALTIME_BENEFITS = [
  "Cada confirmación se refleja al instante en el plano de mesas y en el calendario de sala.",
  "Email, SMS o WhatsApp al cliente sin que tengas que tocar nada: tú decides el canal y el momento.",
  "Si alguien cancela, la mesa queda libre y disponible para reposicionar a la siguiente reserva en cola.",
] as const;

function SectionRealTime() {
  return (
    <section
      id="p-tiempo-real"
      className="border-t border-border/60 py-16 sm:py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Imagen */}
          <div className="order-2 lg:order-1">
            <ProductImage
              src="/brand/product/dashboard-reservas.jpg"
              alt="Dashboard completo de reservas con botón nueva reserva, pestañas restaurante terraza y zona VIP, gráficos y perfil de cliente Elena García con 85 reservas"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              aspect="aspect-[16/10]"
            />
          </div>

          {/* Texto */}
          <div className="order-1 lg:order-2 max-w-xl">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              <span className="rp-gold-text">·</span>
              <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
              <span>Tiempo real</span>
            </div>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-balance">
              Reservas confirmadas en{" "}
              <span className="rp-gold-gradient font-normal">tiempo real</span>
            </h2>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
              Cada confirmación llega al instante. Tus clientes no esperan, tú no
              improvisas.
            </p>

            <ul className="mt-8 space-y-4">
              {REALTIME_BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
                    aria-hidden
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm sm:text-base leading-relaxed text-foreground/90">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------- Section C: Conoce a cada cliente como si fuera VIP --------- */

const CRM_BENEFITS = [
  "Historial completo de visitas, ticket medio, frecuencia y valor total aportado al restaurante.",
  "Preferencias, alergias y observaciones de sala accesibles en un clic desde la ficha de reserva.",
  "Segmentación automática por comportamiento para campañas de marketing que realmente convierten.",
] as const;

function SectionCrmVip() {
  return (
    <section
      id="p-crm-vip"
      className="border-t border-border/60 py-16 sm:py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Texto */}
          <div className="max-w-xl">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              <span className="rp-gold-text">·</span>
              <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
              <span>CRM</span>
            </div>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-balance">
              Conoce a cada cliente como si fuera{" "}
              <span className="rp-gold-gradient font-normal">VIP</span>
            </h2>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
              Historial de visitas, ticket medio, preferencias y alergias. Todo
              en una ficha.
            </p>

            <ul className="mt-8 space-y-4">
              {CRM_BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
                    aria-hidden
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm sm:text-base leading-relaxed text-foreground/90">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Imagen */}
          <div>
            <ProductImage
              src="/brand/product/crm-cliente-vip.jpg"
              alt="Widget CRM flotante sobre escenario real con avatar de cliente VIP, insignia cliente VIP, gráfico de donut con puntuación 85, valor total de 38 euros y valoración de 5 estrellas"
              sizes="(max-width: 1024px) 100vw, 50vw"
              aspect="aspect-[4/3]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------- Section D: Tu partner de operaciones, no solo tu software --------- */

const PARTNER_FEATURES = [
  {
    icon: Sparkles,
    title: "Onboarding guiado",
    description:
      "Configuramos contigo tu sala, tus turnos y tus canales. No empiezas desde cero.",
  },
  {
    icon: Workflow,
    title: "Recomendaciones de configuración",
    description:
      "Te sugerimos flujos de reserva, políticas de no-show y reglas de mesa probadas en hostelería real.",
  },
  {
    icon: LifeBuoy,
    title: "Soporte humano y recursos",
    description:
      "Equipo de soporte, guías, vídeos y base de conocimiento. Cuando tengas una duda, ahí estamos.",
  },
] as const;

function SectionPartner() {
  return (
    <section
      id="p-partner"
      className="border-t border-border/60 py-16 sm:py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 sm:mb-14 max-w-3xl">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">·</span>
            <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
            <span>Partner</span>
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-balance">
            Tu partner de operaciones,{" "}
            <span className="rp-gold-gradient font-normal">no solo tu software</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
            RestoPanel no se instala y se abandona. Te acompañamos para que
            saques el máximo desde el primer día.
          </p>
        </header>

        <ProductImage
          src="/brand/product/soporte-partner.jpg"
          alt="Equipo de soporte de RestoPanel con tres empleados con auriculares en un call center, atención de hospitalidad los 365 días"
          sizes="100vw"
          aspect="aspect-[16/9]"
          className="mb-8 sm:mb-10"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {PARTNER_FEATURES.map((f) => (
            <article
              key={f.title}
              className="group flex flex-col rp-glass rounded-2xl p-5 sm:p-6 transition-all hover:border-[var(--gold)]/30 hover:-translate-y-0.5"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/8 text-[var(--gold-soft)]">
                <f.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-display text-lg font-medium tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Animated counter: count-up from previous value to new value in 300ms */
function usePriceCountUp(value: number, duration = 300) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  const rafRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || fromRef.current === value) {
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (value - from) * eased);
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);
  return display;
}

function Pricing() {
  const setView = useNav((s) => s.setView);
  const openAuth = useNav((s) => s.openAuth);

  // Persist billing toggle in localStorage (per user request)
  const [annual, setAnnual] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("rp-pricing-annual") !== "false";
  });
  React.useEffect(() => {
    window.localStorage.setItem("rp-pricing-annual", String(annual));
  }, [annual]);

  const onCta = (planKey: PlanKey) => {
    if (planKey === "enterprise") {
      setView("app");
    } else {
      openAuth("signup");
    }
  };

  return (
    <section
      id="p-pricing"
      className="border-t border-border/60 py-16 sm:py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 sm:mb-14 max-w-3xl">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">06</span>
            <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
            <span>Suscripciones</span>
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-balance">
            Suscripciones
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
            Actualiza el valor de cada plan. Sin permanencia, sin coste oculto
            por usuario. Cambia o cancela cuando quieras.
          </p>
        </header>

        {/* Billing toggle */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <span
            className={cn(
              "text-sm transition-colors",
              !annual ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Mensual
          </span>
          <Switch
            checked={annual}
            onCheckedChange={setAnnual}
            aria-label="Cambiar facturación entre mensual y anual"
          />
          <span
            className={cn(
              "text-sm transition-colors",
              annual ? "text-[var(--gold-soft)]" : "text-muted-foreground",
            )}
          >
            Anual
          </span>
          <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
            -20%
          </span>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {(Object.keys(PLANS) as PlanKey[]).map((k) => {
            const p = PLANS[k];
            const isEnterprise = k === "enterprise";
            const isPro = k === "professional";

            // Annual billing: 20% discount on monthly price
            const monthlyBase = p.monthly;
            const monthlyAnnual = Math.round(p.monthly * 0.8); // 20% off
            const displayedMonthly = annual ? monthlyAnnual : monthlyBase;
            const annualTotal = monthlyAnnual * 12;
            const monthlyEquiv = monthlyBase * 12;
            const savings = Math.max(0, monthlyEquiv - annualTotal);

            return (
              <PlanCard
                key={k}
                planKey={k}
                name={p.name}
                tagline={p.tagline}
                features={p.features}
                highlight={p.highlight}
                monthlyBase={monthlyBase}
                displayedMonthly={displayedMonthly}
                annualTotal={annualTotal}
                savings={savings}
                annual={annual}
                isEnterprise={isEnterprise}
                isPro={isPro}
                onCta={() => onCta(k)}
              />
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="mt-12 rp-glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto rp-scroll-thin">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border/60 bg-foreground/[0.03]">
                  <th className="px-5 py-4 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Característica
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Starter
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                    Professional · popular
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.02]"
                  >
                    <td className="px-5 py-3 font-medium">{row.feature}</td>
                    <Cell value={row.starter} />
                    <Cell value={row.professional} highlight />
                    <Cell value={row.enterprise} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Plan card with animated count-up price */
function PlanCard({
  name,
  tagline,
  features,
  highlight,
  monthlyBase,
  displayedMonthly,
  annualTotal,
  savings,
  annual,
  isEnterprise,
  isPro,
  onCta,
}: {
  planKey: PlanKey;
  name: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
  monthlyBase: number;
  displayedMonthly: number;
  annualTotal: number;
  savings: number;
  annual: boolean;
  isEnterprise: boolean;
  isPro: boolean;
  onCta: () => void;
}) {
  const animatedPrice = usePriceCountUp(displayedMonthly, 300);
  return (
    <article
      className={cn(
        "relative flex flex-col rp-glass rounded-2xl p-6 sm:p-7 transition-all",
        isPro
          ? "border-[var(--gold)]/50 rp-glow-gold lg:-translate-y-2"
          : "border-border/60 hover:border-[var(--gold)]/30 hover:-translate-y-0.5",
      )}
      aria-label={`Plan ${name}`}
    >
      {highlight && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--teal)] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-black">
          popular
        </span>
      )}

      {/* Plan name + tagline */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-medium">{name}</h3>
        
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed min-h-[2.5rem]">
        {tagline}
      </p>

      {/* Price — animated count-up + strikethrough original when annual */}
      <div className="mt-5 flex items-baseline gap-1.5 flex-wrap">
        {annual && monthlyBase !== displayedMonthly && (
          <span className="font-display text-2xl sm:text-3xl font-light text-muted-foreground/60 line-through tabular-nums">
            {monthlyBase}
          </span>
        )}
        <span className="font-display text-4xl sm:text-5xl font-light rp-gold-text tabular-nums">
          {animatedPrice}
        </span>
        <span className="text-base text-muted-foreground">€</span>
        <span className="text-xs text-muted-foreground">/mes</span>
      </div>
      <div className="mt-1 text-sm tabular-nums text-muted-foreground rp-fade-in" key={annual ? "annual" : "monthly"}>
        {annual ? (
          <span>
            <span className="text-[var(--gold-soft)]">{annualTotal.toLocaleString("es-ES")} €/año</span>
            <span className="text-muted-foreground/70"> · facturado anualmente</span>
          </span>
        ) : (
          <span>facturado mensualmente</span>
        )}
      </div>
      {annual && savings > 0 && (
        <div className="mt-2 inline-flex items-center gap-1.5 self-start rounded-full border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-2.5 py-0.5 text-[10px] text-[var(--teal)] rp-fade-in">
          <Check className="h-3 w-3" aria-hidden />
          Ahorras {savings.toLocaleString("es-ES")} €/año
        </div>
      )}

      {/* CTA */}
      <Button
        size="lg"
        onClick={onCta}
        className={cn(
          "mt-6 w-full justify-center",
          isEnterprise
            ? "bg-[var(--teal)] text-black hover:bg-[var(--teal)]/80"
            : "bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black",
        )}
      >
        {isEnterprise ? "Hablar con ventas" : `Crear cuenta ${name}`}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>

      {/* Features list */}
      <div className="mt-6">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Incluye:
        </div>
        <ul className="space-y-2.5">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5 text-sm text-foreground/90"
            >
              <Check
                className="h-4 w-4 text-[var(--teal)] mt-0.5 shrink-0"
                aria-hidden
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 pt-5 border-t border-border/40 text-center text-[11px] text-muted-foreground">
        {isEnterprise
          ? "Un especialista diseña la propuesta a tu medida."
          : "Sin permanencia. Cancela cuando quieras."}
      </p>
    </article>
  );
}

function Cell({
  value,
  highlight,
}: {
  value: string | boolean;
  highlight?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-5 py-3",
        highlight && "bg-[var(--gold)]/[0.04]",
      )}
    >
      {typeof value === "boolean" ? (
        value ? (
          <Check className="h-4 w-4 text-[var(--teal)]" aria-label="incluido" />
        ) : (
          <X className="h-4 w-4 text-muted-foreground/50" aria-label="no incluido" />
        )
      ) : (
        <span className={cn(highlight && "text-[var(--gold-soft)]")}>{value}</span>
      )}
    </td>
  );
}

/* ------------------------------- FAQ --------------------------------- */

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "¿Qué es un software de gestión para restaurantes?",
    a: "Es una plataforma que centraliza las operaciones diarias del restaurante: reservas, plano de mesas, clientes, marketing, reputación y análisis de rentabilidad. RestoPanel reúne todo eso en una sola herramienta, en lugar de tener cuatro o cinco apps desconectadas que no comparten datos.",
  },
  {
    q: "¿Cómo ayuda RestoPanel a reducir los no-shows?",
    a: "Con confirmaciones y recordatorios automáticos por SMS y WhatsApp, reglas configurables de depósito o pre-autorización para franjas de riesgo, y lista de espera inteligente para reasignar mesas en cuanto un hueco se libera. Los restaurantes que lo usan reducen los no-shows una media del 42%.",
  },
  {
    q: "¿Puedo gestionar varios restaurantes?",
    a: "Sí. RestoPanel está diseñado multi-local desde el primer día: cada restaurante tiene sus propios datos, turnos, equipo y plano, y un panel de grupo permite comparar rentabilidad entre locales. El plan Pro incluye hasta 5 locales y Enterprise, sin límite.",
  },
  {
    q: "¿Qué integraciones ofrece?",
    a: "Stripe para pagos, WhatsApp Cloud API, Google Business Profile y Google Reviews, SumUp y los principales POS del mercado, TheFork para importar reservas históricas, y un proveedor SMS europeo. Enterprise añade API REST y webhooks para integraciones a medida.",
  },
  {
    q: "¿Cómo funciona el CRM?",
    a: "Cada reserva, visita y pago alimenta automáticamente la ficha del cliente: histórico, frecuencia, ticket medio, mesa favorita, alergias, cumpleaños, etiquetas (VIP, business) y consentimiento RGPD por canal. El equipo de sala y el marketing ven exactamente la misma información.",
  },
  {
    q: "¿Puedo importar mis clientes?",
    a: "Sí. Importamos desde TheFork, tu POS y un CSV o Excel estándar con plantilla guiada. El proceso deduplica por teléfono y email, respeta el consentimiento existente y conserva el histórico de visitas si está disponible. Suele tardar entre 24 y 48 horas.",
  },
  {
    q: "¿Cómo se protege la información?",
    a: "Cada organización vive en su propia celda de datos con aislamiento a nivel de aplicación (Tenant Enforcement Layer). Todo el tráfico va cifrado, los accesos quedan en una auditoría append-only, y los datos personales siguen RGPD con consentimiento por canal y derecho de supresión en un clic.",
  },
  {
    q: "¿Tiene API?",
    a: "Sí, en el plan Enterprise. REST con webhooks para reservas, clientes, pagos y eventos de automation. Hay SDKs oficiales para JavaScript y Python, y un sandbox completo para desarrollo. La API respeta los mismos permisos y aislamiento que la interfaz.",
  },
  {
    q: "¿Puedo cambiar de plan?",
    a: "Sí, en cualquier momento y sin penalización. Si subes de plan, prorrateamos lo que ya has pagado. Si bajas, el cambio se aplica al siguiente ciclo de facturación. Los locales y usuarios adicionales se facturan también de forma prorrateada.",
  },
  {
    q: "¿Cómo funciona la prueba?",
    a: "No ofrecemos trial libre indefinido: creas cuenta en segundos, accedes al dashboard con datos demo navegables y, si quieres verlo con tus datos reales, agendamos un onboarding guiado de 24-48 horas en el que migramos clientes y reservas contigo. Sin tarjeta para empezar.",
  },
];

function FAQ() {
  return (
    <section
      id="p-faq"
      className="border-t border-border/60 py-16 sm:py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">07</span>
            <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
            <span>Preguntas frecuentes</span>
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-balance">
            Todo lo que necesitas saber antes de empezar
          </h2>
        </header>

        <Accordion type="single" collapsible className="rp-glass rounded-2xl px-5 sm:px-6">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ----------------------------- Final CTA ----------------------------- */

function FinalCTA() {
  const setView = useNav((s) => s.setView);
  const openAuth = useNav((s) => s.openAuth);
  return (
    <section className="border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl rp-glass-strong p-8 sm:p-12 lg:p-16 text-center"
          style={{
            background:
              "radial-gradient(700px 400px at 50% 0%, color-mix(in oklab, var(--gold) 18%, transparent) 0%, transparent 65%)," +
              "radial-gradient(500px 400px at 50% 100%, color-mix(in oklab, var(--teal) 12%, transparent) 0%, transparent 60%)",
            boxShadow:
              "0 0 0 1px color-mix(in oklab, var(--gold) 25%, transparent)," +
              "0 40px 100px -30px color-mix(in oklab, var(--gold) 35%, transparent)",
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/8 px-3 py-1 text-xs font-mono uppercase tracking-wider text-[var(--gold-soft)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Empieza hoy
          </div>
          <h2 className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-balance">
            Empieza a convertir cada servicio en{" "}
            <span className="rp-gold-gradient font-normal">más ingresos</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            Crea tu cuenta en segundos, explora el dashboard con datos demo y, si
            quieres verlo con tus datos, te lo migramos en 24-48 horas.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => openAuth("signup")}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] hover:text-black"
            >
              Crear cuenta
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView("app")}
            >
              Explorar RestoPanel
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[var(--teal)]" aria-hidden />
              Sin tarjeta para probar
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[var(--teal)]" aria-hidden />
              Onboarding en 24-48h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[var(--teal)]" aria-hidden />
              Cancela cuando quieras
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
