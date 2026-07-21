"use client";

import * as React from "react";
import {
  Section,
  GlassCard,
  Pill,
  H3,
  Lead,
  DataTable,
  GoldList,
  Callout,
  Stat,
} from "@/components/rp/primitives";

/* ============================================================ */
/*  Shared helpers                                              */
/* ============================================================ */

function DemoBadge({ label = "demo" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300"
      title="Datos de demostración — no son cifras reales"
    >
      <span className="h-1 w-1 rounded-full bg-amber-400" />
      {label}
    </span>
  );
}

function Check() {
  return (
    <span className="font-mono text-[var(--gold)]" aria-label="incluido">
      ✓
    </span>
  );
}

function Dash() {
  return (
    <span className="text-muted-foreground/40" aria-label="no incluido">
      —
    </span>
  );
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex group/tt align-middle">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150 group-hover/tt:translate-y-0 group-hover/tt:opacity-100">
        <span className="block w-56 rounded-lg border border-border/70 bg-popover/95 px-3 py-2 text-[11px] leading-relaxed text-foreground/85 shadow-lg backdrop-blur">
          {text}
        </span>
      </span>
    </span>
  );
}

function InfoDot({ text }: { text: string }) {
  return (
    <Tooltip text={text}>
      <span className="inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-foreground/30 text-[9px] font-mono text-muted-foreground">
        i
      </span>
    </Tooltip>
  );
}

/* ============================================================ */
/*  09 — PRICING (calculadora interactiva)                      */
/* ============================================================ */

type PlanId = "starter" | "professional" | "enterprise";
type Billing = "monthly" | "annual";

const PLAN_CONFIG: Record<
  PlanId,
  {
    name: string;
    monthly: number;
    annual: number;
    locLimit: number;
    locIncluded: number;
    cta: string;
    accent: "teal" | "gold" | "gold-soft";
    tagline: string;
  }
> = {
  starter: {
    name: "Starter",
    monthly: 69,
    annual: 690,
    locLimit: 1,
    locIncluded: 1,
    cta: "Crear cuenta Starter",
    accent: "teal",
    tagline: "Restaurantes independientes",
  },
  professional: {
    name: "Professional",
    monthly: 149,
    annual: 1490,
    locLimit: 5,
    locIncluded: 5,
    cta: "Crear cuenta Pro",
    accent: "gold",
    tagline: "Cadenas pequeñas y grupos en crecimiento",
  },
  enterprise: {
    name: "Enterprise",
    monthly: 399,
    annual: 3990,
    locLimit: 50,
    locIncluded: 10,
    cta: "Solicitar demo Enterprise",
    accent: "gold-soft",
    tagline: "Grupos grandes y operaciones multi-país",
  },
};

const ACCENT_RING: Record<string, string> = {
  teal: "border-[var(--teal)]/60 bg-[var(--teal)]/10 rp-glow-teal",
  gold: "border-[var(--gold)]/60 bg-[var(--gold)]/10 rp-glow-gold",
  "gold-soft": "border-[var(--gold-soft)]/60 bg-[var(--gold-soft)]/10 rp-glow-gold",
};

const ACCENT_TEXT: Record<string, string> = {
  teal: "rp-teal-text",
  gold: "rp-gold-text",
  "gold-soft": "text-[var(--gold-soft)]",
};

type FeatureRow = {
  id: string;
  feat: string;
  tip?: string;
  s: boolean;
  p: boolean;
  e: boolean;
};

const FEATURES_MATRIX: FeatureRow[] = [
  { id: "reservas", feat: "Reservas", s: true, p: true, e: true },
  { id: "plano", feat: "Plano de mesas", s: true, p: true, e: true },
  { id: "crm-basic", feat: "CRM básico", s: true, p: true, e: true },
  { id: "emails", feat: "Emails y confirmaciones", s: true, p: true, e: true },
  { id: "dashboard", feat: "Dashboard operativo", s: true, p: true, e: true },
  { id: "reviews-lectura", feat: "Lectura Google Reviews", s: true, p: true, e: true },
  { id: "analytics-basic", feat: "Analytics básico", s: true, p: true, e: true },
  { id: "whatsapp", feat: "WhatsApp Business", s: false, p: true, e: true },
  { id: "motor-ia", feat: "Motor IA", s: false, p: true, e: true },
  { id: "crm-adv", feat: "CRM avanzado + segmentos", s: false, p: true, e: true },
  { id: "marketing", feat: "Marketing y campañas", s: false, p: true, e: true },
  { id: "automatizaciones", feat: "Automatizaciones", s: false, p: true, e: true },
  { id: "plano-intel", feat: "Plano inteligente", s: false, p: true, e: true },
  { id: "analytics-adv", feat: "Analytics avanzado", s: false, p: true, e: true },
  { id: "reviews-ia", feat: "Google Reviews con IA", s: false, p: true, e: true },
  { id: "api-basic", feat: "API básica", s: false, p: true, e: true },
  { id: "api-full", feat: "API completa + webhooks", s: false, p: false, e: true },
  { id: "sso", feat: "SSO / SAML", tip: "Requiere implementación real antes de venderse", s: false, p: false, e: true },
  { id: "rbac", feat: "RBAC granular", tip: "Requiere implementación real antes de venderse", s: false, p: false, e: true },
  { id: "white-label", feat: "White label", tip: "Requiere implementación real antes de venderse", s: false, p: false, e: true },
  { id: "bi", feat: "BI ejecutivo", s: false, p: false, e: true },
  { id: "copilot", feat: "Copilot Ejecutivo IA", s: false, p: false, e: true },
  { id: "marketplace", feat: "Marketplace de integraciones", s: false, p: false, e: true },
  { id: "cf-enterprise", feat: "Cloudflare Enterprise", tip: "Requiere implementación real antes de venderse", s: false, p: false, e: true },
  { id: "sla", feat: "SLA 99.95%", tip: "Requiere implementación real antes de venderse", s: false, p: false, e: true },
  { id: "account-mgr", feat: "Account Manager", s: false, p: false, e: true },
  { id: "soporte-247", feat: "Soporte 24/7", tip: "Requiere implementación real antes de venderse", s: false, p: false, e: true },
];

function PlanCard({
  id,
  selected,
  onSelect,
}: {
  id: PlanId;
  selected: boolean;
  onSelect: (id: PlanId) => void;
}) {
  const c = PLAN_CONFIG[id];
  const accent = ACCENT_TEXT[c.accent];
  const ring = selected ? ACCENT_RING[c.accent] : "border-border/50 hover:border-foreground/30";
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      className={`group text-left rounded-2xl border p-5 transition-all duration-200 ${ring} ${
        selected ? "scale-[1.01]" : "hover:scale-[1.005]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`font-display text-lg font-medium ${accent}`}>{c.name}</span>
          {id === "enterprise" && (
            <Pill tone="outline" className="text-[10px]">
              desde
            </Pill>
          )}
        </div>
        <span
          className={`h-4 w-4 rounded-full border-2 transition-colors ${
            selected
              ? "border-[var(--gold)] bg-[var(--gold)]"
              : "border-foreground/30 bg-transparent"
          }`}
        />
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-3xl font-light text-foreground">
          {c.monthly}€
        </span>
        <span className="text-xs text-muted-foreground">/mes</span>
      </div>
      <div className="mt-0.5 text-[11px] font-mono text-muted-foreground">
        o {c.annual}€/año · {c.locLimit === 50 ? "hasta 50 locales" : `${c.locLimit} ${c.locLimit === 1 ? "local" : "locales"}`}
      </div>
      <p className="mt-2 text-xs text-muted-foreground/85 leading-relaxed">{c.tagline}</p>
    </button>
  );
}

export function ProductoPricing() {
  const [plan, setPlan] = React.useState<PlanId>("professional");
  const [billing, setBilling] = React.useState<Billing>("annual");
  const [locations, setLocations] = React.useState(3);

  const cfg = PLAN_CONFIG[plan];

  function selectPlan(id: PlanId) {
    setPlan(id);
    const next = PLAN_CONFIG[id];
    // Clamp locations to new plan limit
    if (locations > next.locLimit) setLocations(next.locLimit);
  }

  // Compute monthly cost (base + extra locations for Enterprise)
  const extraLocs = Math.max(0, locations - cfg.locIncluded);
  const extraMonthly = plan === "enterprise" ? extraLocs * 25 : 0; // 25€ per extra loc
  const monthlyCost = cfg.monthly + extraMonthly;

  const annualCost = Math.round(monthlyCost * 12 * 0.9);
  const annualListPrice = cfg.annual + extraMonthly * 12 * 0.9; // listed annual with extras
  const monthlyEquivalentAnnual = monthlyCost * 12;
  const savings = Math.round(monthlyEquivalentAnnual - annualCost);

  const displayCost = billing === "monthly" ? monthlyCost : annualCost;
  const periodLabel = billing === "monthly" ? "/mes" : "/año";

  const wantsUpgrade = plan !== "enterprise" && locations >= cfg.locLimit;
  const accentClass = ACCENT_TEXT[cfg.accent];
  const cta = cfg.cta;

  // Comparison table
  const compHead = [
    "Característica",
    "Starter",
    "Professional",
    "Enterprise",
  ];
  const compRows = FEATURES_MATRIX.map((f) => [
    <span key={`feat-${f.id}`} className="inline-flex items-center gap-1.5">
      {f.feat}
      {f.tip ? <InfoDot text={f.tip} /> : null}
    </span>,
    <span key={`s-${f.id}`} className="flex justify-center">
      {f.s ? <Check /> : <Dash />}
    </span>,
    <span key={`p-${f.id}`} className="flex justify-center">
      {f.p ? <Check /> : <Dash />}
    </span>,
    <span key={`e-${f.id}`} className="flex justify-center">
      {f.e ? <Check /> : <Dash />}
    </span>,
  ]);

  // Plan details table
  const detailsHead = ["Plan", "Precio mensual", "Precio anual", "Perfil", "Incluye"];
  const detailsRows: React.ReactNode[][] = [
    [
      <span key="d-starter-name" className={ACCENT_TEXT.teal}>
        Starter
      </span>,
      <span key="d-starter-m">69€</span>,
      <span key="d-starter-a">690€</span>,
      <span key="d-starter-p">Restaurantes independientes</span>,
      <span key="d-starter-i" className="text-xs text-muted-foreground">
        Reservas, Plano de mesas, CRM básico, Emails, Confirmaciones, Dashboard, Lectura Google
        Reviews, Analytics básico, 1 local, 3 usuarios, Soporte estándar.
      </span>,
    ],
    [
      <span key="d-pro-name" className={ACCENT_TEXT.gold}>
        Professional
      </span>,
      <span key="d-pro-m">149€</span>,
      <span key="d-pro-a">1.490€</span>,
      <span key="d-pro-p">Cadenas pequeñas en crecimiento</span>,
      <span key="d-pro-i" className="text-xs text-muted-foreground">
        Todo Starter + WhatsApp, Motor IA, CRM avanzado, Marketing, Automatizaciones, Plano
        inteligente, Analytics avanzado, Google Reviews IA, API básica, 5 locales, 10 usuarios,
        Soporte prioritario.
      </span>,
    ],
    [
      <span key="d-ent-name" className={ACCENT_TEXT["gold-soft"]}>
        Enterprise
      </span>,
      <span key="d-ent-m">
        desde <span className="font-medium">399€</span>
      </span>,
      <span key="d-ent-a">
        desde <span className="font-medium">3.990€</span>
      </span>,
      <span key="d-ent-p">Grupos grandes y multi-país</span>,
      <span key="d-ent-i" className="text-xs text-muted-foreground">
        Todo Professional + locales ilimitados, usuarios ilimitados, Marketplace, API completa,
        SSO, RBAC, White label, BI, Copilot Ejecutivo, integraciones ilimitadas, Cloudflare
        Enterprise, SLA, Account Manager, Soporte 24/7.
      </span>,
    ],
  ];

  return (
    <Section
      id="p-pricing"
      index="09"
      eyebrow="Pricing (calculadora interactiva)"
      title="Calculadora de pricing: Starter, Professional, Enterprise."
      intro={
        <>
          No son tres cards estáticas. Es una calculadora real: elige plan, alterna mensual/anual,
          ajusta locales y observa cómo el precio, el ahorro y el CTA cambian en tiempo real. Sin
          comisiones ocultas; los límites están documentados en cada tooltip.
        </>
      }
    >
      {/* === Plan selector === */}
      <div className="grid gap-4 sm:grid-cols-3">
        <PlanCard id="starter" selected={plan === "starter"} onSelect={selectPlan} />
        <PlanCard id="professional" selected={plan === "professional"} onSelect={selectPlan} />
        <PlanCard id="enterprise" selected={plan === "enterprise"} onSelect={selectPlan} />
      </div>

      {/* === Calculator === */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <GlassCard variant="strong" className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <H3>Calculadora</H3>
            <DemoBadge />
          </div>

          {/* Billing toggle */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Facturación
            </span>
            <div className="inline-flex rounded-lg border border-border/60 bg-foreground/[0.03] p-1">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`rounded-md px-3 py-1 text-xs transition-colors ${
                  billing === "monthly"
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => setBilling("annual")}
                className={`rounded-md px-3 py-1 text-xs transition-colors ${
                  billing === "annual"
                    ? "bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Anual
                <span className="ml-1.5 text-[10px] text-[var(--gold-soft)]">−10%</span>
              </button>
            </div>
          </div>

          {/* Locations selector */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label
                htmlFor="loc-slider"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground"
              >
                Locales
                <InfoDot
                  text={`El plan ${cfg.name} incluye hasta ${cfg.locIncluded} ${cfg.locIncluded === 1 ? "local" : "locales"}. Enterprise añade 25€/mes por local adicional sobre los 10 incluidos.`}
                />
              </label>
              <span className={`font-mono text-sm ${accentClass}`}>
                {locations} / {cfg.locLimit === 50 ? "50" : cfg.locLimit}
              </span>
            </div>
            <input
              id="loc-slider"
              type="range"
              min={1}
              max={cfg.locLimit}
              step={1}
              value={locations}
              onChange={(e) => setLocations(Number(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-[var(--gold)]"
              aria-label="Número de locales"
            />
            <div className="mt-1 flex justify-between text-[10px] font-mono text-muted-foreground/70">
              <span>1</span>
              <span>{cfg.locLimit}</span>
            </div>
            {wantsUpgrade && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-300">
                <span>⚠</span>
                Has alcanzado el límite de {cfg.locLimit} locales del plan {cfg.name}.
                <button
                  type="button"
                  onClick={() =>
                    selectPlan(plan === "starter" ? "professional" : "enterprise")
                  }
                  className="ml-1 underline underline-offset-2 hover:text-amber-200"
                >
                  Subir de plan para más locales
                </button>
              </div>
            )}
          </div>

          {/* Price display */}
          <div className="mt-6 rounded-xl border border-border/50 bg-foreground/[0.02] p-5">
            <div className="flex items-end gap-2">
              <span className={`font-display text-5xl font-light ${accentClass} sm:text-6xl`}>
                {plan === "enterprise" && <span className="text-2xl align-top mr-1 text-muted-foreground">desde</span>}
                {displayCost.toLocaleString("es-ES")}€
              </span>
              <span className="mb-1.5 text-sm text-muted-foreground">{periodLabel}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>
                Plan <strong className="text-foreground/90">{cfg.name}</strong> · {locations}{" "}
                {locations === 1 ? "local" : "locales"}
              </span>
              <span className="text-foreground/20">·</span>
              <span>
                {billing === "annual"
                  ? `Equivale a ${monthlyCost.toLocaleString("es-ES")}€/mes`
                  : `Anual: ${annualCost.toLocaleString("es-ES")}€/año`}
              </span>
            </div>

            {billing === "annual" && savings > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1.5 text-xs text-[var(--gold-soft)]">
                <span>★</span>
                Ahorras {savings.toLocaleString("es-ES")}€/año vs. facturación mensual
              </div>
            )}
            {plan === "enterprise" && extraLocs > 0 && (
              <div className="mt-3 text-[11px] text-muted-foreground">
                Incluye {cfg.locIncluded} locales · {extraLocs} adicionales × 25€/mes
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            type="button"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--gold)] px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-[var(--gold-soft)]"
          >
            {cta}
            <span aria-hidden>→</span>
          </button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {plan === "enterprise"
              ? "No autopago: un especialista valida tu caso antes de activar Enterprise."
              : "Sin permanencia. Cancela cuando quieras desde el panel de billing."}
          </p>
        </GlassCard>

        {/* Side: comparison + quick rules */}
        <div className="space-y-4">
          <GlassCard variant="gold" className="p-5">
            <div className="flex items-center justify-between">
              <H3 className="text-base">Reglas de pricing</H3>
              <Pill tone="gold">transparencia</Pill>
            </div>
            <GoldList
              className="mt-4"
              items={[
                "No prometer características legales, fiscales o de soporte no implementadas.",
                "Enterprise se muestra como 'desde 399€' con CTA 'Solicitar demo', nunca precio fijo en checkout.",
                "Cada límite (locales, usuarios, llamadas API) se explica en un tooltip en la calculadora.",
                "Sin comisiones ocultas: lo que ves en la calculadora es lo que se cobra en Stripe.",
                "La conversión anual muestra explícitamente el ahorro en euros, no solo un porcentaje.",
                "Pro y Enterprise añaden locales extra con precio por unidad visible, no por defecto.",
              ]}
            />
          </GlassCard>
          <Callout kind="warn" title="No prometer lo no implementado">
            SSO, RBAC granular, White label, SLA 99.95%, Cloudflare Enterprise y Soporte 24/7 son
            features Enterprise que requieren implementación real antes de venderse. En la demo se
            muestran como “incluido en Enterprise” pero el CTA es <strong>Solicitar demo</strong>,
            no autopago. Mientras no estén listas, ningún cliente Enterprise entra por checkout
            automático.
          </Callout>
        </div>
      </div>

      {/* === Plan details === */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <H3 className="text-base">Detalle por plan</H3>
          <span className="h-px flex-1 bg-border/40" />
          <Pill tone="outline">3 planes</Pill>
        </div>
        <DataTable head={detailsHead} rows={detailsRows} />
      </div>

      {/* === Comparison matrix === */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <H3 className="text-base">Comparativa de características</H3>
          <span className="h-px flex-1 bg-border/40" />
          <DemoBadge label="27 filas" />
        </div>
        <DataTable head={compHead} rows={compRows} />
        <p className="mt-3 text-[11px] text-muted-foreground">
          El icono{" "}
          <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-foreground/30 font-mono text-[9px]">
            i
          </span>{" "}
          indica una característica que requiere implementación real antes de venderse (Enterprise
          con CTA demo).
        </p>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  10 — DASHBOARD (widgets vivos)                              */
/* ============================================================ */

type TrendDir = "up" | "down" | "flat";

function TrendPill({ dir, value }: { dir: TrendDir; value: string }) {
  const tone =
    dir === "up"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : dir === "down"
      ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
      : "border-foreground/20 bg-foreground/5 text-muted-foreground";
  const sym = dir === "up" ? "▲" : dir === "down" ? "▼" : "■";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono ${tone}`}
    >
      <span className="text-[8px]">{sym}</span>
      {value}
    </span>
  );
}

function Sparkline({ color, points }: { color: string; points: number[] }) {
  const w = 80;
  const h = 24;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const d =
    points
      .map((p, i) => {
        const x = i * step;
        const y = h - ((p - min) / range) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-80" aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

type Kpi = {
  id: string;
  label: string;
  value: string;
  trend: TrendDir;
  trendValue: string;
  spark: number[];
  color: string;
};

const KPIS: Kpi[] = [
  {
    id: "res",
    label: "Reservas hoy",
    value: "47",
    trend: "up",
    trendValue: "+12% vs ayer",
    spark: [30, 32, 35, 40, 38, 44, 47],
    color: "var(--gold)",
  },
  {
    id: "occ",
    label: "Ocupación",
    value: "78%",
    trend: "up",
    trendValue: "+5pp",
    spark: [60, 65, 70, 68, 72, 75, 78],
    color: "var(--teal)",
  },
  {
    id: "ticket",
    label: "Ticket medio",
    value: "38€",
    trend: "up",
    trendValue: "+2€",
    spark: [33, 34, 35, 36, 36, 37, 38],
    color: "var(--gold)",
  },
  {
    id: "noshow",
    label: "No-shows",
    value: "3",
    trend: "down",
    trendValue: "−1",
    spark: [6, 5, 5, 4, 4, 4, 3],
    color: "#f59e0b",
  },
  {
    id: "new",
    label: "Clientes nuevos",
    value: "8",
    trend: "up",
    trendValue: "+2",
    spark: [4, 5, 6, 5, 7, 6, 8],
    color: "var(--teal)",
  },
  {
    id: "rating",
    label: "Google Rating",
    value: "4.6★",
    trend: "flat",
    trendValue: "estable",
    spark: [4.5, 4.5, 4.6, 4.6, 4.6, 4.6, 4.6],
    color: "var(--gold)",
  },
];

type Res = {
  id: string;
  time: string;
  name: string;
  party: number;
  status: "confirmada" | "pendiente" | "cancelada" | "lista-espera";
  table?: string;
};

const TODAY_RES: Res[] = [
  { id: "r1", time: "13:00", name: "Familia Ortiz", party: 4, status: "confirmada", table: "M3" },
  { id: "r2", time: "13:30", name: "Carlos Méndez", party: 2, status: "confirmada", table: "M1" },
  { id: "r3", time: "14:00", name: "Reunión RSE", party: 8, status: "pendiente", table: "M9" },
  { id: "r4", time: "20:30", name: "Ana Vidal", party: 2, status: "confirmada", table: "M2" },
  { id: "r5", time: "21:00", name: "Cumple Laura", party: 6, status: "confirmada", table: "M7" },
  { id: "r6", time: "21:30", name: "Walk-in Smith", party: 3, status: "lista-espera" },
];

const RES_STATUS_TONE: Record<Res["status"], string> = {
  confirmada: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
  pendiente: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  cancelada: "border-destructive/50 bg-destructive/10 text-destructive",
  "lista-espera": "border-foreground/20 bg-foreground/5 text-muted-foreground",
};

type TimelineEv = { id: string; time: string; title: string; desc: string; tone: string };
const TIMELINE: TimelineEv[] = [
  { id: "t1", time: "12:00", title: "Apertura", desc: "Servicio de mediodía iniciado · 24 mesas libres", tone: "var(--teal)" },
  { id: "t2", time: "13:15", title: "Primer servicio", desc: "M1, M3, M9 ocupadas · 3 reservas confirmadas", tone: "var(--gold)" },
  { id: "t3", time: "14:30", title: "Pico de comida", desc: "Ocupación 92% · cola de espera 2 grupos", tone: "#f59e0b" },
  { id: "t4", time: "16:00", title: "Valle", desc: "Servicio termina · 6 mesas por limpiar", tone: "var(--teal)" },
  { id: "t5", time: "20:00", title: "Apertura cena", desc: "Servicio de noche iniciado · 18 reservas", tone: "var(--gold)" },
  { id: "t6", time: "22:30", title: "Pico de cena", desc: "Ocupación 85% · 1 reasignación manual", tone: "#f59e0b" },
  { id: "t7", time: "00:30", title: "Cierre", desc: "Caja cerrada · backup automático completado", tone: "var(--teal)" },
];

type ActivityEv = { id: string; icon: string; text: string; time: string; tone: string };
const ACTIVITY: ActivityEv[] = [
  { id: "a1", icon: "✚", text: "Nueva reserva · Familia Ortiz · 13:00 · 4 pax", time: "hace 3 min", tone: "var(--teal)" },
  { id: "a2", icon: "★", text: "Cliente VIP check-in · Carlos Méndez (visita #12)", time: "hace 8 min", tone: "var(--gold)" },
  { id: "a3", icon: "✉", text: "Reseña recibida · 5★ · “Servicio impecable”", time: "hace 22 min", tone: "var(--gold)" },
  { id: "a4", icon: "⚡", text: "Campaña enviada · “Menú degustación otoño” · 248 destinatarios", time: "hace 1 h", tone: "var(--teal)" },
  { id: "a5", icon: "⚠", text: "No-show marcado · 21:00 · política aplicada", time: "hace 2 h", tone: "#f59e0b" },
];

type AiRec = { id: string; title: string; desc: string; confidence: number };
const AI_RECS: AiRec[] = [
  {
    id: "ai1",
    title: "Ofrecer menú degustación a M7",
    desc: "Cumple Laura (6 pax) tiene historial de pedidos premium. Sugiere menú degustación + maridaje. Impacto estimado: +120€.",
    confidence: 82,
  },
  {
    id: "ai2",
    title: "Reconfirmar reserva 21:00 (M9)",
    desc: "La reserva de 8 pax a las 14:00 sigue pendiente y el riesgo de no-show es medio. Envía WhatsApp de reconfirmación.",
    confidence: 71,
  },
  {
    id: "ai3",
    title: "Sugerir overbooking controlado 20:30",
    desc: "Histórico muestra 18% no-show en este slot. Aceptar 1 reserva extra con política de lista de espera aumentaría ingresos.",
    confidence: 64,
  },
];

export function ProductoDashboard() {
  const [period, setPeriod] = React.useState<"hoy" | "semana" | "mes">("hoy");
  const [showGoogleRating, setShowGoogleRating] = React.useState(true);
  const [showNoShows, setShowNoShows] = React.useState(true);
  const [showAI, setShowAI] = React.useState(true);

  const visibleKpis = KPIS.filter((k) => {
    if (k.id === "noshow" && !showNoShows) return false;
    if (k.id === "rating" && !showGoogleRating) return false;
    return true;
  });

  const topBar = (
    <div className="rp-glass rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Org selector */}
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-foreground/[0.03] px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />
          <span className="text-xs font-medium">Ramses Madrid</span>
          <span className="text-[10px] text-muted-foreground">▾</span>
        </div>
        {/* Restaurant selector */}
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-foreground/[0.03] px-3 py-1.5">
          <span className="text-[10px] font-mono text-muted-foreground">REST</span>
          <span className="text-xs">Ramses Centro</span>
          <span className="text-[10px] text-muted-foreground">▾</span>
        </div>
        {/* Period selector */}
        <div className="inline-flex rounded-lg border border-border/60 bg-foreground/[0.03] p-0.5">
          {(["hoy", "semana", "mes"] as const).map((p) => (
            <button
              key={`period-${p}`}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-md px-2.5 py-1 text-[11px] capitalize transition-colors ${
                period === p
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="ml-auto flex items-center gap-2 rounded-lg border border-border/60 bg-foreground/[0.03] px-3 py-1.5 text-xs text-muted-foreground">
          <span aria-hidden>⌕</span>
          <span className="hidden sm:inline">Buscar reservas, clientes, mesas…</span>
          <kbd className="hidden md:inline rounded bg-foreground/10 px-1.5 py-0.5 text-[9px] font-mono">
            ⌘K
          </kbd>
        </div>
        {/* Bell */}
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative rounded-lg border border-border/60 bg-foreground/[0.03] p-1.5 text-sm hover:border-[var(--gold)]/50"
        >
          <span aria-hidden>🔔</span>
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--gold)]" />
        </button>
        {/* Profile */}
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-foreground/[0.03] px-2 py-1">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)]" />
          <span className="hidden sm:inline text-xs">Marta (Owner)</span>
        </div>
      </div>
    </div>
  );

  // Widgets available table
  const widgetRows: { id: string; w: string; perm: string; def: boolean }[] = [
    { id: "w1", w: "reservations_today", perm: "reservations.read", def: true },
    { id: "w2", w: "occupancy", perm: "reports.read", def: true },
    { id: "w3", w: "avg_ticket", perm: "billing.read", def: true },
    { id: "w4", w: "no_shows", perm: "reservations.read", def: true },
    { id: "w5", w: "new_customers", perm: "customers.read", def: true },
    { id: "w6", w: "google_rating", perm: "reviews.read", def: true },
    { id: "w7", w: "ai_recommendations", perm: "ai.read", def: false },
    { id: "w8", w: "revenue", perm: "billing.read", def: true },
    { id: "w9", w: "day_timeline", perm: "reservations.read", def: true },
    { id: "w10", w: "recent_activity", perm: "audit.read", def: true },
    { id: "w11", w: "upcoming", perm: "reservations.read", def: true },
    { id: "w12", w: "pending_tasks", perm: "tasks.read", def: false },
    { id: "w13", w: "integration_status", perm: "integrations.read", def: false },
  ];

  const widgetHead = ["Widget", "Permiso requerido", "Default"];
  const widgetTableRows = widgetRows.map((r) => [
    <span key={`wid-${r.id}`} className="font-mono text-xs">
      {r.w}
    </span>,
    <span key={`wperm-${r.id}`} className="font-mono text-xs text-muted-foreground">
      {r.perm}
    </span>,
    <span key={`wdef-${r.id}`} className="flex justify-center">
      {r.def ? <Check /> : <Dash />}
    </span>,
  ]);

  return (
    <Section
      id="p-dashboard"
      index="10"
      eyebrow="Dashboard (widgets vivos)"
      title="Información útil inmediatamente después del login."
      intro={
        <>
          Tras el login, el usuario ve información accionable al instante: KPIs del servicio,
          reservas de hoy, timeline del día, actividad reciente y recomendaciones de IA. Cada
          widget es configurable por rol y por usuario; las vistas guardadas persisten. Los datos
          son demo y están etiquetados.
        </>
      }
    >
      {/* Top bar mockup */}
      {topBar}

      {/* Widget visibility toggle */}
      <div className="mt-4 rp-glass rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <span>Configurar widgets</span>
            <DemoBadge />
          </div>
          {[
            { id: "gr", label: "Mostrar Google Rating", st: showGoogleRating, set: setShowGoogleRating },
            { id: "ns", label: "Mostrar No-shows", st: showNoShows, set: setShowNoShows },
            { id: "ai", label: "Mostrar Recomendaciones IA", st: showAI, set: setShowAI },
          ].map((t) => (
            <label
              key={`tog-${t.id}`}
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground/85"
            >
              <input
                type="checkbox"
                checked={t.st}
                onChange={(e) => t.set(e.target.checked)}
                className="h-4 w-4 rounded border-foreground/30 bg-transparent accent-[var(--gold)]"
              />
              {t.label}
            </label>
          ))}
          <span className="ml-auto text-[11px] text-muted-foreground">
            Los cambios se guardan en la vista del usuario (demo: en memoria)
          </span>
        </div>
      </div>

      {/* KPI row */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {visibleKpis.map((k) => (
          <div key={`kpi-${k.id}`} className="rp-glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {k.label}
              </span>
              <DemoBadge />
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <span
                className="font-display text-2xl font-light"
                style={{ color: k.color }}
              >
                {k.value}
              </span>
              <Sparkline color={k.color} points={k.spark} />
            </div>
            <div className="mt-2">
              <TrendPill dir={k.trend} value={k.trendValue} />
            </div>
          </div>
        ))}
      </div>
      {visibleKpis.length < KPIS.length && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          {KPIS.length - visibleKpis.length} widget(s) oculto(s) por configuración de usuario.
        </p>
      )}

      {/* Two-column grid: reservations + timeline + activity + AI */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Reservas de hoy */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <H3 className="text-base">Reservas de hoy</H3>
            <DemoBadge />
          </div>
          <ul className="space-y-2 max-h-80 overflow-y-auto rp-scroll-thin pr-1">
            {TODAY_RES.map((r) => (
              <li
                key={`res-${r.id}`}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-foreground/[0.02] px-3 py-2.5"
              >
                <span className="font-mono text-xs text-[var(--gold)] w-12">{r.time}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground/90 truncate">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.party} pax{r.table ? ` · ${r.table}` : " · sin mesa"}
                  </div>
                </div>
                <span
                  className={`rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${RES_STATUS_TONE[r.status]}`}
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Timeline del día */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <H3 className="text-base">Timeline del día</H3>
            <DemoBadge />
          </div>
          <ol className="relative space-y-4 max-h-80 overflow-y-auto rp-scroll-thin pr-1 before:absolute before:left-[5px] before:top-1 before:bottom-1 before:w-px before:bg-border/60">
            {TIMELINE.map((ev) => (
              <li key={`tl-${ev.id}`} className="relative pl-6">
                <span
                  className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-background"
                  style={{ background: ev.tone }}
                />
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{ev.time}</span>
                  <span className="text-sm font-medium text-foreground/90">{ev.title}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{ev.desc}</p>
              </li>
            ))}
          </ol>
        </GlassCard>

        {/* Actividad reciente */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <H3 className="text-base">Actividad reciente</H3>
            <DemoBadge />
          </div>
          <ul className="space-y-3 max-h-72 overflow-y-auto rp-scroll-thin pr-1">
            {ACTIVITY.map((a) => (
              <li key={`act-${a.id}`} className="flex items-start gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs"
                  style={{ borderColor: `color-mix(in oklab, ${a.tone} 40%, transparent)`, color: a.tone }}
                >
                  {a.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/85 leading-snug">{a.text}</p>
                  <p className="text-[11px] text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Recomendaciones IA */}
        {showAI ? (
          <GlassCard variant="teal" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <H3 className="text-base">Recomendaciones de IA</H3>
              <div className="flex items-center gap-2">
                <DemoBadge />
                <Pill tone="teal">Copilot</Pill>
              </div>
            </div>
            <ul className="space-y-3 max-h-72 overflow-y-auto rp-scroll-thin pr-1">
              {AI_RECS.map((rec) => (
                <li
                  key={`ai-${rec.id}`}
                  className="rounded-lg border border-border/40 bg-foreground/[0.02] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-foreground/90">{rec.title}</span>
                    <span
                      className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-mono ${
                        rec.confidence >= 80
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                          : rec.confidence >= 70
                          ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                          : "border-amber-400/40 bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {rec.confidence}% confianza
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">
              <span className="text-amber-300">⚠</span> Revisar antes de ejecutar: la IA propone, el
              operador decide. Toda acción queda auditada.
            </p>
          </GlassCard>
        ) : (
          <GlassCard className="p-5 flex items-center justify-center text-center">
            <div>
              <div className="text-3xl mb-2 opacity-30">🤖</div>
              <p className="text-sm text-muted-foreground">
                Widget de IA oculto por configuración de usuario.
              </p>
              <button
                type="button"
                onClick={() => setShowAI(true)}
                className="mt-3 text-xs text-[var(--teal)] underline underline-offset-2 hover:text-[var(--teal)]/80"
              >
                Mostrar recomendaciones
              </button>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Widgets disponibles table */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <H3 className="text-base">Widgets disponibles</H3>
          <span className="h-px flex-1 bg-border/40" />
          <Pill tone="outline">13 widgets · 8 default on</Pill>
        </div>
        <DataTable head={widgetHead} rows={widgetTableRows} />
      </div>

      {/* Shell rules + Callout */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <GlassCard variant="gold" className="p-5">
          <div className="flex items-center justify-between mb-4">
            <H3 className="text-base">Shell de aplicación</H3>
            <Pill tone="gold">núcleo UX</Pill>
          </div>
          <GoldList
            items={[
              "Sidebar configurable (colapsable, favoritos por rol, secciones por permiso).",
              "Selector org → restaurante → periodo en la barra superior, con estado persistente.",
              "Búsqueda global (⌘K) con accesos a reservas, clientes, mesas, campañas y ajustes.",
              "Centro de notificaciones con filtros por severidad y acción directa desde la campana.",
              "Ayuda contextual por sección (tooltips, tours guiados, docs embebidas).",
              "Perfil con preferencias: idioma, tema, zona horaria, formato de moneda y unidades.",
              "Breadcrumbs generados por ruta + sección activa; navegación con teclado completo.",
              "Command palette para acciones frecuentes (crear reserva, mover mesa, lanzar campaña).",
              "Atajos de teclado documentados (j/k navegar, / buscar, n nueva reserva, ? ayuda).",
              "Widgets movibles y ocultables por usuario; las posiciones se guardan en preferencias.",
              "Vistas guardadas por usuario y por rol: recepción, cocina, marketing, contabilidad.",
            ]}
          />
        </GlassCard>
        <Callout kind="ok" title="Widgets por rol">
          El dashboard no es una pantalla única: cada rol ve los widgets para los que tiene permiso.
          Recepción ve reservas y plano; Marketing ve CRM y campañas; Contabilidad ve ingresos y
          facturación; Owner ve todo. Los widgets sin permiso no se ocultan con CSS, se filtran en
          servidor desde el catálogo RBAC. Esto evita filtrar datos a roles no autorizados aunque
          inspeccionen el DOM.
        </Callout>
      </div>
    </Section>
  );
}

/* ============================================================ */
/*  11 — RESERVAS Y PLANO DE MESAS                             */
/* ============================================================ */

type TableStatus = "free" | "reserved" | "occupied" | "blocked";

const STATUS_META: Record<
  TableStatus,
  { label: string; bg: string; border: string; text: string; dot: string }
> = {
  free: {
    label: "libre",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/40",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  reserved: {
    label: "reservada",
    bg: "bg-[var(--gold)]/10",
    border: "border-[var(--gold)]/40",
    text: "rp-gold-text",
    dot: "bg-[var(--gold)]",
  },
  occupied: {
    label: "ocupada",
    bg: "bg-[var(--teal)]/10",
    border: "border-[var(--teal)]/40",
    text: "rp-teal-text",
    dot: "bg-[var(--teal)]",
  },
  blocked: {
    label: "bloqueada",
    bg: "bg-foreground/5",
    border: "border-foreground/20",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

const STATUS_CYCLE: TableStatus[] = ["free", "reserved", "occupied", "blocked"];

type FloorTable = {
  id: string;
  name: string;
  seats: number;
  zone: string;
};

const INITIAL_TABLES: FloorTable[] = [
  { id: "M1", name: "M1", seats: 2, zone: "Ventana" },
  { id: "M2", name: "M2", seats: 2, zone: "Ventana" },
  { id: "M3", name: "M3", seats: 4, zone: "Ventana" },
  { id: "M4", name: "M4", seats: 4, zone: "Centro" },
  { id: "M5", name: "M5", seats: 4, zone: "Centro" },
  { id: "M6", name: "M6", seats: 6, zone: "Centro" },
  { id: "M7", name: "M7", seats: 6, zone: "Centro" },
  { id: "M8", name: "M8", seats: 2, zone: "Barra" },
  { id: "M9", name: "M9", seats: 8, zone: "Privado" },
  { id: "M10", name: "M10", seats: 4, zone: "Terraza" },
  { id: "M11", name: "M11", seats: 4, zone: "Terraza" },
  { id: "M12", name: "M12", seats: 6, zone: "Terraza" },
];

const INITIAL_STATUSES: Record<string, TableStatus> = {
  M1: "occupied",
  M2: "free",
  M3: "reserved",
  M4: "occupied",
  M5: "free",
  M6: "free",
  M7: "reserved",
  M8: "occupied",
  M9: "reserved",
  M10: "free",
  M11: "blocked",
  M12: "free",
};

type DemoRes = {
  id: string;
  time: string;
  name: string;
  party: number;
  status: "confirmada" | "pendiente" | "lista-espera";
};

const FLOOR_RES: DemoRes[] = [
  { id: "fr1", time: "13:00", name: "Familia Ortiz", party: 4, status: "confirmada" },
  { id: "fr2", time: "13:30", name: "Carlos Méndez", party: 2, status: "confirmada" },
  { id: "fr3", time: "14:00", name: "Reunión RSE", party: 8, status: "pendiente" },
  { id: "fr4", time: "20:30", name: "Ana Vidal", party: 2, status: "confirmada" },
  { id: "fr5", time: "21:00", name: "Cumple Laura", party: 6, status: "confirmada" },
  { id: "fr6", time: "21:30", name: "Walk-in Smith", party: 3, status: "lista-espera" },
];

export function ProductoReservas() {
  const [statuses, setStatuses] = React.useState<Record<string, TableStatus>>(INITIAL_STATUSES);
  const [selected, setSelected] = React.useState<string | null>("M3");
  const [pendingRes, setPendingRes] = React.useState<string | null>(null);

  function cycleStatus(id: string) {
    setSelected(id);
    setStatuses((prev) => {
      const cur = prev[id];
      const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(cur) + 1) % STATUS_CYCLE.length];
      // If we have a pending reservation selected and we set a table to free,
      // we don't auto-assign here; that's a separate explicit action.
      return { ...prev, [id]: next };
    });
  }

  function assignToTable(tableId: string) {
    if (!pendingRes) return;
    if (statuses[tableId] !== "free") return;
    setStatuses((prev) => ({ ...prev, [tableId]: "reserved" }));
    setPendingRes(null);
    setSelected(tableId);
  }

  function onTableClick(id: string) {
    if (pendingRes && statuses[id] === "free") {
      assignToTable(id);
    } else {
      cycleStatus(id);
    }
  }

  const selectedTable = INITIAL_TABLES.find((t) => t.id === selected) ?? null;
  const selectedStatus = selected ? statuses[selected] : null;
  const pendingResObj = FLOOR_RES.find((r) => r.id === pendingRes) ?? null;

  // Status counts
  const counts = INITIAL_TABLES.reduce(
    (acc, t) => {
      acc[statuses[t.id]] = (acc[statuses[t.id]] || 0) + 1;
      return acc;
    },
    {} as Record<TableStatus, number>
  );

  // Estados de mesa table
  const statesHead = ["Estado", "Color", "Significado"];
  const statesRows: React.ReactNode[][] = [
    [
      <span key="st-free" className="text-emerald-300">libre</span>,
      <span key="sc-free" className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-emerald-400" /> verde
      </span>,
      <span key="sd-free" className="text-xs text-muted-foreground">Mesa disponible para asignar reservas o walk-ins.</span>,
    ],
    [
      <span key="st-res" className="rp-gold-text">reservada</span>,
      <span key="sc-res" className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-[var(--gold)]" /> dorado
      </span>,
      <span key="sd-res" className="text-xs text-muted-foreground">Reserva confirmada para un slot concreto; mesa retenida.</span>,
    ],
    [
      <span key="st-occ" className="rp-teal-text">ocupada</span>,
      <span key="sc-occ" className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-[var(--teal)]" /> turquesa
      </span>,
      <span key="sd-occ" className="text-xs text-muted-foreground">Comensales sentados; servicio en curso.</span>,
    ],
    [
      <span key="st-blk" className="text-muted-foreground">bloqueada</span>,
      <span key="sc-blk" className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-muted-foreground" /> gris
      </span>,
      <span key="sd-blk" className="text-xs text-muted-foreground">No disponible: mantenimiento, evento privado o reserva manual.</span>,
    ],
    [
      <span key="st-cln" className="text-amber-300">por limpiar</span>,
      <span key="sc-cln" className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-amber-400" /> ámbar
      </span>,
      <span key="sd-cln" className="text-xs text-muted-foreground">Servicio terminado; pendiente de limpieza antes de liberar.</span>,
    ],
  ];

  // Funciones de reservas table
  const funcsHead = ["Función", "Descripción"];
  const funcsRows: React.ReactNode[][] = [
    [
      <span key="fn-cal" className="font-mono text-xs">calendario</span>,
      <span key="fd-cal" className="text-xs text-muted-foreground">Vista día / semana / mes con arrastre de reservas entre slots.</span>,
    ],
    [
      <span key="fn-tl" className="font-mono text-xs">timeline</span>,
      <span key="fd-tl" className="text-xs text-muted-foreground">Servicio por hora con bandas de apertura, pico, valle y cierre.</span>,
    ],
    [
      <span key="fn-dd" className="font-mono text-xs">drag &amp; drop</span>,
      <span key="fd-dd" className="text-xs text-muted-foreground">Mover reserva entre mesas con confirmación si la mesa destino está ocupada.</span>,
    ],
    [
      <span key="fn-flt" className="font-mono text-xs">filtros</span>,
      <span key="fd-flt" className="text-xs text-muted-foreground">Por local, zona, estado, número de comensales, fuente y etiqueta.</span>,
    ],
    [
      <span key="fn-conf" className="font-mono text-xs">confirmaciones</span>,
      <span key="fd-conf" className="text-xs text-muted-foreground">Automáticas por email/WhatsApp o manuales por el operador.</span>,
    ],
    [
      <span key="fn-pay" className="font-mono text-xs">pagos</span>,
      <span key="fd-pay" className="text-xs text-muted-foreground">Depósito o preautorización para grupos y slots de alta demanda.</span>,
    ],
    [
      <span key="fn-hist" className="font-mono text-xs">historial</span>,
      <span key="fd-hist" className="text-xs text-muted-foreground">Cambios auditados (quién, qué, cuándo) con reversión posible.</span>,
    ],
    [
      <span key="fn-reconf" className="font-mono text-xs">reconfirmaciones</span>,
      <span key="fd-reconf" className="text-xs text-muted-foreground">Recordatorio automático a T-24h por canal preferido del cliente.</span>,
    ],
    [
      <span key="fn-canc" className="font-mono text-xs">cancelaciones</span>,
      <span key="fd-canc" className="text-xs text-muted-foreground">Política configurable + penalización según antelación y plan.</span>,
    ],
    [
      <span key="fn-ns" className="font-mono text-xs">no-show</span>,
      <span key="fd-ns" className="text-xs text-muted-foreground">Marca de no-show + cálculo de riesgo del cliente para futuras reservas.</span>,
    ],
    [
      <span key="fn-wait" className="font-mono text-xs">lista de espera</span>,
      <span key="fd-wait" className="text-xs text-muted-foreground">Promoción automática cuando una mesa se libera dentro del slot.</span>,
    ],
  ];

  return (
    <Section
      id="p-reservas"
      index="11"
      eyebrow="Reservas y plano de mesas"
      title="Calendario, timeline, drag & drop y concurrencia en tiempo real."
      intro={
        <>
          El plano de mesas es interactivo: haz clic en una mesa para cambiar su estado (libre →
          reservada → ocupada → bloqueada) o selecciona una reserva pendiente y asígnala a una mesa
          libre. La concurrencia real se resuelve con Durable Objects en producción; este es un
          demo visual del comportamiento.
        </>
      }
    >
      {/* Floor plan + side panel */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Floor plan */}
        <GlassCard variant="strong" className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <H3 className="text-base">Plano de mesas · Ramses Centro</H3>
            <div className="flex items-center gap-2">
              <DemoBadge />
              <Pill tone="outline">12 mesas</Pill>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4 text-[11px]">
            {(Object.keys(STATUS_META) as TableStatus[]).map((s) => {
              const m = STATUS_META[s];
              return (
                <span key={`leg-${s}`} className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <span className={`h-2.5 w-2.5 rounded-sm ${m.dot}`} />
                  {m.label} ({counts[s] || 0})
                </span>
              );
            })}
          </div>

          {/* Pending reservation banner */}
          {pendingRes && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[var(--gold)]/50 bg-[var(--gold)]/10 px-3 py-2 text-xs text-[var(--gold-soft)]">
              <span>
                Asignando reserva <strong>{pendingResObj?.name}</strong> ({pendingResObj?.party} pax ·{" "}
                {pendingResObj?.time}) — haz clic en una mesa libre.
              </span>
              <button
                type="button"
                onClick={() => setPendingRes(null)}
                className="rounded px-2 py-0.5 hover:bg-[var(--gold)]/20"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Tables grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {INITIAL_TABLES.map((t) => {
              const st = statuses[t.id];
              const m = STATUS_META[st];
              const isSel = selected === t.id;
              const isAssignTarget = pendingRes && st === "free";
              return (
                <button
                  key={`tbl-${t.id}`}
                  type="button"
                  onClick={() => onTableClick(t.id)}
                  aria-label={`Mesa ${t.id}, ${m.label}, ${t.seats} comensales`}
                  className={`relative rounded-xl border p-3 text-left transition-all duration-150 ${m.bg} ${m.border} ${
                    isSel ? "ring-2 ring-[var(--gold)] ring-offset-2 ring-offset-background" : ""
                  } ${isAssignTarget ? "cursor-crosshair hover:scale-[1.03]" : "hover:border-foreground/40"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-medium">{t.name}</span>
                    <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{t.seats} comensales</div>
                  <div className={`mt-2 text-[10px] font-mono uppercase tracking-wider ${m.text}`}>
                    {m.label}
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground/70">{t.zone}</div>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground">
            <span className="text-foreground/70">Tip:</span> clic en una mesa para ciclar su estado.
            Para asignar una reserva: selecciónala en la lista de la derecha, luego haz clic en una
            mesa libre.
          </p>
        </GlassCard>

        {/* Side: selected + today reservations */}
        <div className="space-y-4">
          {/* Selected table */}
          <GlassCard variant="gold" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <H3 className="text-base">Mesa seleccionada</H3>
              <DemoBadge />
            </div>
            {selectedTable && selectedStatus ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-light rp-gold-text">
                    {selectedTable.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{selectedTable.zone}</span>
                </div>
                <dl className="text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Comensales</dt>
                    <dd>{selectedTable.seats}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Estado</dt>
                    <dd className={STATUS_META[selectedStatus].text}>
                      {STATUS_META[selectedStatus].label}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Reserva actual</dt>
                    <dd className="text-xs">
                      {selectedStatus === "reserved"
                        ? "Familia Ortiz · 13:00 · 4 pax"
                        : selectedStatus === "occupied"
                        ? "Servicio en curso · desde 13:18"
                        : selectedStatus === "blocked"
                        ? "Mantenimiento · hasta 16:00"
                        : "—"}
                    </dd>
                  </div>
                </dl>
                {/* Manual status buttons */}
                <div className="pt-3 border-t border-border/40">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Cambiar estado
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STATUS_CYCLE.map((s) => (
                      <button
                        key={`btn-${selectedTable.id}-${s}`}
                        type="button"
                        onClick={() =>
                          setStatuses((prev) => ({ ...prev, [selectedTable.id]: s }))
                        }
                        className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                          selectedStatus === s
                            ? `${STATUS_META[s].border} ${STATUS_META[s].bg} ${STATUS_META[s].text}`
                            : "border-border/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {STATUS_META[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Selecciona una mesa del plano para ver sus detalles.
              </p>
            )}
          </GlassCard>

          {/* Today reservations */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <H3 className="text-base">Reservas de hoy</H3>
              <DemoBadge />
            </div>
            <ul className="space-y-2 max-h-72 overflow-y-auto rp-scroll-thin pr-1">
              {FLOOR_RES.map((r) => {
                const isPending = pendingRes === r.id;
                return (
                  <li key={`fr-${r.id}`}>
                    <button
                      type="button"
                      onClick={() => setPendingRes(isPending ? null : r.id)}
                      className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                        isPending
                          ? "border-[var(--gold)]/60 bg-[var(--gold)]/10"
                          : "border-border/40 bg-foreground/[0.02] hover:border-[var(--gold)]/40"
                      }`}
                    >
                      <span className="font-mono text-xs text-[var(--gold)] w-12">{r.time}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{r.name}</div>
                        <div className="text-[11px] text-muted-foreground">{r.party} pax</div>
                      </div>
                      <span
                        className={`rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                          r.status === "confirmada"
                            ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
                            : r.status === "pendiente"
                            ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                            : "border-foreground/20 bg-foreground/5 text-muted-foreground"
                        }`}
                      >
                        {r.status}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Clic en una reserva para asignarla a una mesa libre del plano.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Tables estados + funciones */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <H3 className="text-base">Estados de mesa</H3>
            <span className="h-px flex-1 bg-border/40" />
            <Pill tone="outline">5 estados</Pill>
          </div>
          <DataTable head={statesHead} rows={statesRows} />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-4">
            <H3 className="text-base">Funciones de reservas</H3>
            <span className="h-px flex-1 bg-border/40" />
            <Pill tone="outline">11 funciones</Pill>
          </div>
          <DataTable head={funcsHead} rows={funcsRows} />
        </div>
      </div>

      {/* Concurrency + Callout */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <GlassCard variant="gold" className="p-5">
          <div className="flex items-center justify-between mb-4">
            <H3 className="text-base">Concurrencia en tiempo real</H3>
            <Pill tone="gold">Cloudflare DO</Pill>
          </div>
          <GoldList
            items={[
              "Durable Objects coordinan el plano: cada local tiene un DO que serializa las escrituras a mesas.",
              "Locks de slot (mesa + ventana horaria) evitan la doble reserva del mismo asiento.",
              "WebSocket sync entre dispositivos: el cambio se refleja en todos los puntos de venta en <200ms.",
              "D1 conserva el estado canónico: el DO es la autoridad efímera, D1 la fuente de verdad duradera.",
              "Tras una desconexión, el DO reconstruye el estado desde D1 + replay de eventos encolados.",
              "Conflictos resueltos por D1 UNIQUE constraint + lock del DO: gana el primero, el segundo recibe error accionable.",
              "Operaciones críticas (crear, mover, cancelar) son idempotentes con idempotency-key.",
            ]}
          />
        </GlassCard>
        <Callout kind="warn" title="Drag & drop con confirmación">
          Mover una reserva entre mesas es reversible pero audita: el operador, la mesa origen, la
          destino y el timestamp quedan registrados. Reasignar a una mesa ocupada requiere
          confirmación explícita (la reserva destino no se desaloja sin aviso). Bloquear una mesa
          requiere permiso <code className="font-mono text-xs rp-gold-text">tables.admin</code>: el
          bloqueo no es una preferencia visual, es un estado persistente con motivo y vigencia.
        </Callout>
      </div>
    </Section>
  );
}
