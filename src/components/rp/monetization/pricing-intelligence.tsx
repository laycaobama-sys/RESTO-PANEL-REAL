"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/components/rp/app/nav-store";
import {
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Crown,
  Sparkles,
  Calculator,
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
  Zap,
  Info,
  Star,
  MessageSquare,
  Phone,
  Mail,
  Send,
  ShieldCheck,
  BadgePercent,
  Layers,
  Building2,
  Bot,
  Plug,
  BarChart3,
  Truck,
  Megaphone,
  Instagram,
  Smartphone,
  Code2,
  FileText,
  Plus,
  ArrowRight,
  PiggyBank,
  Target,
  CircleAlert,
} from "lucide-react";

/* =====================================================================
 * Pricing Intelligence Module — RestoPanel
 * Tab-based pricing experience: Planes · Calculadoras · Comparativa · Add-ons · FAQ
 * All data demo. Never present savings/ROI as guarantees — always "estimado".
 * ===================================================================== */

type PlanId = "starter" | "growth" | "enterprise";
type BillingCycle = "monthly" | "annual";

type CellValue = boolean | string;

interface FeatureRow {
  category: string;
  label: string;
  starter: CellValue;
  growth: CellValue;
  enterprise: CellValue;
  note?: string;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  compatible: "Growth+" | "Enterprise";
  icon: React.ComponentType<{ className?: string }>;
  tag?: "popular" | "new" | "beta";
}

interface FaqItem {
  q: string;
  a: string;
}

interface CompetitorRow {
  label: string;
  rp: CellValue;
  cover: CellValue;
  seven: CellValue;
  opentable: CellValue;
  excel: CellValue;
  whatsapp: CellValue;
  note?: string;
}

/* ---------- Demo data ---------- */

const PLANS: {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  recommended?: boolean;
  highlight?: boolean;
  features: { label: string; included: boolean }[];
  cta: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Para restaurantes que empiezan a digitalizar reservas",
    monthly: 49,
    annual: 470,
    cta: "Empezar con Starter",
    icon: Target,
    features: [
      { label: "Reservas online ilimitadas", included: true },
      { label: "Plano de mesas inteligente", included: true },
      { label: "CRM básico (hasta 1.000 clientes)", included: true },
      { label: "Confirmaciones por email", included: true },
      { label: "Google Reviews (lectura)", included: true },
      { label: "Lista de espera manual", included: true },
      { label: "Dashboard operativo", included: true },
      { label: "Estadísticas básicas", included: true },
      { label: "IA limitada (50 consultas/mes)", included: true },
      { label: "Automatizaciones (1.000/mes)", included: true },
      { label: "1.000 automatizaciones / mes", included: true },
      { label: "Soporte por email", included: true },
      { label: "WhatsApp Business", included: false },
      { label: "SMS", included: false },
      { label: "Predicción de no-shows", included: false },
      { label: "Campañas y segmentación", included: false },
      { label: "Multi-local", included: false },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Para restaurantes en crecimiento con varios canales",
    monthly: 99,
    annual: 950,
    recommended: true,
    highlight: true,
    cta: "Empezar con Growth",
    icon: TrendingUp,
    features: [
      { label: "Todo lo de Starter", included: true },
      { label: "CRM avanzado (clientes ilimitados)", included: true },
      { label: "WhatsApp Business integrado", included: true },
      { label: "SMS (recordatorios)", included: true },
      { label: "Google Reviews con IA", included: true },
      { label: "Lista de espera inteligente", included: true },
      { label: "Estadísticas avanzadas", included: true },
      { label: "IA avanzada (consultas ilimitadas)", included: true },
      { label: "Predicción de no-shows", included: true },
      { label: "Upselling automático", included: true },
      { label: "Campañas y segmentación", included: true },
      { label: "Analytics avanzado", included: true },
      { label: "Automatizaciones ilimitadas", included: true },
      { label: "Turnos y equipo", included: true },
      { label: "Multi-local (hasta 5)", included: true },
      { label: "Soporte prioritario", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Para grupos y cadas con múltiples locales y necesidades avanzadas",
    monthly: 249,
    annual: 2490,
    cta: "Contactar ventas",
    icon: Building2,
    features: [
      { label: "Todo lo de Growth", included: true },
      { label: "Business Intelligence (BI)", included: true },
      { label: "API Enterprise + webhooks", included: true },
      { label: "Cloud privado dedicado", included: true },
      { label: "SLA 99,9% uptime", included: true },
      { label: "White label completo", included: true },
      { label: "Multiempresa (multi-org)", included: true },
      { label: "Marketplace de integraciones", included: true },
      { label: "Locales ilimitados", included: true },
      { label: "Formación prioritaria", included: true },
      { label: "Account Manager dedicado", included: true },
      { label: "Soporte 24/7 dedicado", included: true },
      { label: "Onboarding personalizado", included: true },
      { label: "Auditoría de seguridad", included: true },
      { label: "Personalización de marca", included: true },
    ],
  },
];

const FEATURE_MATRIX: FeatureRow[] = [
  { category: "Reservas", label: "Reservas online", starter: true, growth: true, enterprise: true, note: "Motor de reservas con calendario y disponibilidad en tiempo real" },
  { category: "Reservas", label: "Plano inteligente", starter: true, growth: true, enterprise: true, note: "Editor visual de mesas con asignación automática por comensales" },
  { category: "Reservas", label: "Lista de espera (manual)", starter: true, growth: true, enterprise: true },
  { category: "Reservas", label: "Lista de espera (inteligente)", starter: false, growth: true, enterprise: true, note: "Predice cancelaciones y reordena automáticamente" },
  { category: "Reservas", label: "Confirmaciones", starter: true, growth: true, enterprise: true, note: "Confirmación automática por email y canal preferido" },

  { category: "CRM", label: "CRM básico", starter: "1.000 clientes", growth: "Ilimitado", enterprise: "Ilimitado", note: "Ficha de cliente con historial y preferencias" },
  { category: "CRM", label: "CRM avanzado", starter: false, growth: true, enterprise: true, note: "Segmentación, etiquetas, scoring y RFM" },
  { category: "CRM", label: "Segmentación", starter: false, growth: true, enterprise: true },

  { category: "Canales", label: "Emails", starter: "1.000/mes", growth: "Ilimitado", enterprise: "Ilimitado" },
  { category: "Canales", label: "WhatsApp", starter: false, growth: true, enterprise: true, note: "Confirmaciones, reconfirmaciones y mensajes bidireccionales" },
  { category: "Canales", label: "SMS", starter: false, growth: true, enterprise: true, note: "Recordatorios y alertas críticas (depósito, no-show)" },
  { category: "Canales", label: "Reservas Instagram", starter: false, growth: true, enterprise: true, note: "Add-on disponible" },
  { category: "Canales", label: "Reservas TikTok", starter: false, growth: true, enterprise: true, note: "Beta — add-on disponible" },

  { category: "Reputación", label: "Google Reviews (lectura)", starter: true, growth: true, enterprise: true, note: "Sincronización y respuesta desde panel" },
  { category: "Reputación", label: "Google Reviews con IA", starter: false, growth: true, enterprise: true, note: "Respuestas sugeridas y análisis de sentimiento" },

  { category: "Analítica", label: "Dashboard", starter: true, growth: true, enterprise: true },
  { category: "Analítica", label: "Estadísticas básicas", starter: true, growth: true, enterprise: true },
  { category: "Analítica", label: "Estadísticas avanzadas", starter: false, growth: true, enterprise: true, note: "Cohortes, RFM, ADR, RevPAS" },
  { category: "Analítica", label: "Analytics", starter: false, growth: true, enterprise: true },
  { category: "Analítica", label: "Business Intelligence (BI)", starter: false, growth: false, enterprise: true, note: "Dashboards avanzados, forecast y benchmarking" },

  { category: "IA", label: "IA (limitada)", starter: "50 consultas/mes", growth: "Ilimitada", enterprise: "Ilimitada", note: "Copiloto IA contextual con rol y permisos" },
  { category: "IA", label: "IA (avanzada)", starter: false, growth: true, enterprise: true, note: "RAG, predicciones, recomendaciones" },
  { category: "IA", label: "Predicción no-shows", starter: false, growth: true, enterprise: true, note: "Modelo entrenado por local y franja" },
  { category: "IA", label: "Upselling", starter: false, growth: true, enterprise: true },

  { category: "Marketing", label: "Campañas", starter: false, growth: true, enterprise: true },
  { category: "Marketing", label: "Marketing", starter: false, growth: true, enterprise: true },
  { category: "Marketing", label: "Multiidioma", starter: false, growth: true, enterprise: true, note: "ES, EN, FR, DE, IT, PT" },

  { category: "API", label: "API (básica)", starter: true, growth: true, enterprise: true, note: "Lectura de reservas, clientes y disponibilidad" },
  { category: "API", label: "API (Enterprise)", starter: false, growth: false, enterprise: true, note: "Webhooks, SDK, rate limits elevados" },

  { category: "Operación", label: "Automatizaciones", starter: "1.000/mes", growth: "Ilimitadas", enterprise: "Ilimitadas", note: "Workflows con triggers y acciones" },
  { category: "Operación", label: "Chat interno", starter: true, growth: true, enterprise: true },
  { category: "Operación", label: "Turnos", starter: false, growth: true, enterprise: true },
  { category: "Operación", label: "Integraciones", starter: "3", growth: "Ilimitadas", enterprise: "Ilimitadas", note: "TPV, delivery, calendar, etc." },
  { category: "Operación", label: "Formación", starter: false, growth: "Básica", enterprise: "Prioritaria" },

  { category: "Infraestructura", label: "Cloud privado", starter: false, growth: false, enterprise: true, note: "Despliegue dedicado aislado" },
  { category: "Infraestructura", label: "SLA", starter: false, growth: "99,5%", enterprise: "99,9%" },
  { category: "Infraestructura", label: "White label", starter: false, growth: false, enterprise: true },
  { category: "Infraestructura", label: "Multiempresa", starter: false, growth: false, enterprise: true, note: "Multi-organización y grupos" },
  { category: "Infraestructura", label: "Marketplace", starter: false, growth: false, enterprise: true },

  { category: "Soporte", label: "Soporte", starter: "Email", growth: "Prioritario", enterprise: "Dedicado 24/7" },
  { category: "Soporte", label: "Account Manager", starter: false, growth: false, enterprise: true },
];

const ADDONS: AddOn[] = [
  { id: "wa-business", name: "WhatsApp Business", price: 29, priceLabel: "€29/mes", description: "Confirmaciones y mensajes bidireccionales por WhatsApp", compatible: "Growth+", icon: MessageSquare, tag: "popular" },
  { id: "sms", name: "SMS", price: 19, priceLabel: "€19/mes", description: "Recordatorios y alertas SMS (depósito, no-show, cambios)", compatible: "Growth+", icon: Smartphone },
  { id: "ia-premium", name: "IA Premium", price: 49, priceLabel: "€49/mes", description: "Predicciones avanzadas, IA ejecutiva y RAG sobre tu data", compatible: "Growth+", icon: Bot, tag: "popular" },
  { id: "tpv", name: "TPV Integration", price: 39, priceLabel: "€39/mes", description: "Sincronización con Revo, Square y Lightspeed", compatible: "Growth+", icon: Plug },
  { id: "bi", name: "Business Intelligence", price: 59, priceLabel: "€59/mes", description: "Dashboards avanzados, forecast y benchmarking", compatible: "Growth+", icon: BarChart3 },
  { id: "delivery", name: "Delivery", price: 49, priceLabel: "€49/mes", description: "Integración con Uber Eats, Glovo y Just Eat", compatible: "Growth+", icon: Truck },
  { id: "mkt-pro", name: "Marketing Pro", price: 39, priceLabel: "€39/mes", description: "Campañas avanzadas, A/B testing y atribución", compatible: "Growth+", icon: Megaphone },
  { id: "instagram", name: "Reservas Instagram", price: 19, priceLabel: "€19/mes", description: "Reservas directas desde Instagram sin salir de la app", compatible: "Growth+", icon: Instagram },
  { id: "tiktok", name: "Reservas TikTok", price: 19, priceLabel: "€19/mes", description: "Reservas directas desde TikTok (beta)", compatible: "Growth+", icon: Smartphone, tag: "beta" },
  { id: "api-adv", name: "API Avanzada", price: 99, priceLabel: "€99/mes", description: "API completa + webhooks + SDK oficial", compatible: "Growth+", icon: Code2 },
  { id: "reports", name: "Reportes Avanzados", price: 29, priceLabel: "€29/mes", description: "Exportación PDF/Excel/Power BI + programación", compatible: "Growth+", icon: FileText },
];

const FAQS: FaqItem[] = [
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí. Los cambios de plan se aplican al instante y prorrateamos el importe del ciclo actual. Si subes de plan, el incremento se cobra inmediatamente; si bajas, el cambio entra en vigor al inicio del siguiente ciclo.",
  },
  {
    q: "¿Hay permanencia?",
    a: "No. Trabajamos sin permanencia en todos los planes. Puedes cancelar cuando quieras desde Configuración → Facturación sin penalizaciones ni costes ocultos.",
  },
  {
    q: "¿Qué incluye la prueba gratuita?",
    a: "14 días de plan Growth con todas las funciones activas, sin tarjeta y sin compromiso. Incluye onboarding guiado, importación de reservas y soporte prioritario para que veas valor real antes de decidir.",
  },
  {
    q: "¿Los add-ons requieren un plan específico?",
    a: "Sí. La mayoría de add-ons (WhatsApp, SMS, IA Premium, TPV, BI, Marketing Pro) requieren plan Growth o superior. Esto se debe a que dependen de automatizaciones y módulos no disponibles en Starter.",
  },
  {
    q: "¿Cómo se calcula el ROI?",
    a: "El ROI combina tres fuentes: recuperación estimada de no-shows (40-60% de reducción), valor de horas ahorradas en tareas manuales (a tu coste horario) y sustitución de herramientas actuales. Las estimaciones se basan en datos agregados de la industria y no son garantías.",
  },
  {
    q: "¿Qué pasa si supero el límite de automatizaciones del plan Starter?",
    a: "Cuando superas las 1.000 automatizaciones/mes en Starter, te avisamos por email y notificación. Las automatizaciones adicionales se pausan hasta el siguiente ciclo o puedes hacer upgrade a Growth (automatizaciones ilimitadas) en cualquier momento.",
  },
  {
    q: "¿El plan Enterprise incluye implementación?",
    a: "Sí. Enterprise incluye onboarding personalizado de 4-8 semanas con consultor dedicado, migración de datos desde tu sistema actual, integraciones a medida y formación del equipo on-site u online.",
  },
  {
    q: "¿Puedo usar RestoPanel sin TPV?",
    a: "Sí. RestoPanel funciona de forma independiente al TPV. Sin integración TPV no tendrás sincronización de comandas ni cierre de caja automático, pero el resto de módulos (reservas, CRM, marketing) funcionan con normalidad.",
  },
  {
    q: "¿Hay descuento anual?",
    a: "Sí. Pagando anualmente ahorras ~2 meses respecto al pago mensual: Starter €470/año (ahorras €118), Growth €950/año (ahorras €238) y Enterprise €2.490/año (ahorras €498).",
  },
  {
    q: "¿Qué métodos de pago aceptáis?",
    a: "Aceptamos tarjeta (Visa, Mastercard, Amex), SEPA (iban) y transferencia bancaria para planes anuales. Enterprise también admite pago por factura con net-30.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí, sin permanencia ni penalizaciones. La cancelación entra en vigor al final del ciclo facturado en curso. Mantienes acceso hasta esa fecha y puedes exportar todos tus datos antes.",
  },
  {
    q: "¿Los precios incluyen IVA?",
    a: "No. Todos los precios mostrados son sin IVA (IVA no incluido). El IVA aplicable (21% en España) se añade en la factura final. Para empresas fuera de España, se aplica la normativa de IVA intracomunitario.",
  },
];

const COMPETITORS: CompetitorRow[] = [
  { label: "Precio desde", rp: "€99/mes", cover: "~€120/mes", seven: "~€250/mes", opentable: "~€240/mes", excel: "€0", whatsapp: "€0", note: "Plan comparable Growth. Verificar precios actuales con cada proveedor." },
  { label: "Reservas online", rp: true, cover: true, seven: true, opentable: true, excel: "Manual", whatsapp: "Manual" },
  { label: "Plano de mesas", rp: true, cover: true, seven: true, opentable: true, excel: false, whatsapp: false },
  { label: "CRM", rp: true, cover: "Básico", seven: true, opentable: "Básico", excel: "Manual", whatsapp: false },
  { label: "IA avanzada", rp: true, cover: false, seven: "Limitada", opentable: false, excel: false, whatsapp: false },
  { label: "WhatsApp", rp: true, cover: "Add-on", seven: "Limitado", opentable: false, excel: false, whatsapp: true },
  { label: "Google Reviews IA", rp: true, cover: false, seven: "Lectura", opentable: false, excel: false, whatsapp: false },
  { label: "Automatizaciones", rp: "Ilimitadas", cover: "Limitadas", seven: "Limitadas", opentable: "Limitadas", excel: false, whatsapp: false },
  { label: "Predicción no-shows", rp: true, cover: "Limitada", seven: true, opentable: "Limitada", excel: false, whatsapp: false },
  { label: "Analytics", rp: true, cover: true, seven: true, opentable: true, excel: "Manual", whatsapp: false },
  { label: "API", rp: true, cover: "Add-on", seven: true, opentable: "Add-on", excel: false, whatsapp: false },
  { label: "Multi-local", rp: true, cover: "Add-on", seven: true, opentable: true, excel: "Manual", whatsapp: false },
  { label: "App móvil", rp: true, cover: true, seven: true, opentable: true, excel: false, whatsapp: true },
  { label: "Marketplace", rp: "Enterprise", cover: false, seven: "Limitado", opentable: true, excel: false, whatsapp: false },
  { label: "Soporte", rp: "Prioritario", cover: "Estándar", seven: "Dedicado", opentable: "Estándar", excel: "—", whatsapp: "—" },
];

/* =====================================================================
 * Helpers
 * ===================================================================== */

const euro = (n: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

const euroCents = (n: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);

const annualSavings = (monthly: number, annual: number) => monthly * 12 - annual;

/* =====================================================================
 * Cell — feature matrix cell with tooltip
 * ===================================================================== */

function Cell({ value, note }: { value: CellValue; note?: string }) {
  const isBool = typeof value === "boolean";
  const content = (
    <span className="inline-flex items-center justify-center">
      {isBool ? (
        value ? (
          <Check className="h-4 w-4 text-[var(--gold)]" aria-hidden />
        ) : (
          <X className="h-4 w-4 text-muted-foreground/50" aria-hidden />
        )
      ) : (
        <span className="text-xs font-mono text-foreground/85">{value}</span>
      )}
    </span>
  );

  if (!note) {
    return (
      <span className="inline-flex justify-center" role="cell">
        {content}
      </span>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex justify-center rounded p-1 transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50"
            aria-label={note}
          >
            <span className="inline-flex items-center gap-1">
              {content}
              <Info className="h-3 w-3 text-muted-foreground/60" aria-hidden />
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
          {note}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* =====================================================================
 * PlanCard
 * ===================================================================== */

function PlanCard({
  plan,
  billing,
  index,
}: {
  plan: (typeof PLANS)[number];
  billing: BillingCycle;
  index: number;
}) {
  const reduced = useReducedMotion();
  const savings = annualSavings(plan.monthly, plan.annual);
  const price = billing === "monthly" ? plan.monthly : Math.round(plan.annual / 12);
  const { toast } = useToast();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className={cn(
        "relative flex flex-col rounded-2xl p-6 sm:p-7",
        plan.highlight
          ? "rp-glass-strong rp-glow-gold border-[var(--gold)]/40"
          : "rp-glass"
      )}
    >
      {plan.recommended ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/60 bg-[var(--gold)]/15 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
            <Crown className="h-3 w-3" aria-hidden /> Recomendado
          </span>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            plan.highlight
              ? "bg-[var(--gold)]/15 text-[var(--gold)]"
              : "bg-foreground/5 text-foreground/70"
          )}
        >
          <plan.icon className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h3 className="font-display text-xl font-medium tracking-tight">
            {plan.name}
          </h3>
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {plan.id === "enterprise" ? "Desde" : "Plan"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {plan.tagline}
      </p>

      <div className="mt-5 flex items-end gap-2">
        <span className="font-display text-4xl sm:text-5xl font-light tracking-tight">
          {plan.id === "enterprise" ? "€249" : euro(price)}
        </span>
        <span className="mb-1 text-sm text-muted-foreground">/mes</span>
      </div>

      <div className="mt-2 min-h-[24px]">
        {billing === "annual" ? (
          <span className="inline-flex items-center gap-1.5 text-xs">
            <BadgePercent className="h-3.5 w-3.5 text-[var(--teal)]" aria-hidden />
            <span className="text-muted-foreground">
              Facturado {euro(plan.annual)}/año ·{" "}
              <span className="rp-teal-text font-medium">Ahorras {euro(savings)}/año</span>
            </span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Facturación mensual · sin permanencia
          </span>
        )}
      </div>

      <Button
        type="button"
        size="lg"
        onClick={() => {
          if (plan.id === "enterprise") {
            toast({
              title: "Contactando con ventas",
              description: "Un Account Manager se pondrá en contacto en menos de 24h.",
            });
          } else {
            useNav.getState().setView("app");
          }
        }}
        className={cn(
          "mt-6 min-h-[44px] w-full justify-center gap-2",
          plan.highlight
            ? "bg-gradient-to-r from-[var(--gold-soft)] to-[var(--gold)] text-black hover:from-[var(--gold)] hover:to-[var(--gold-deep)] hover:text-black"
            : ""
        )}
        variant={plan.highlight ? "default" : "outline"}
      >
        {plan.cta}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>

      <div className="mt-6 border-t border-border/40 pt-5">
        <ul className="space-y-2.5" aria-label={`Características de ${plan.name}`}>
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              {f.included ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" aria-hidden />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" aria-hidden />
              )}
              <span className={f.included ? "text-foreground/90" : "text-muted-foreground/50 line-through"}>
                {f.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/* =====================================================================
 * FeatureMatrixTable — sticky first column, scrollable
 * ===================================================================== */

function FeatureMatrixTable() {
  // Group rows by category for section headers
  const groups: { category: string; rows: FeatureRow[] }[] = [];
  for (const row of FEATURE_MATRIX) {
    const last = groups[groups.length - 1];
    if (last && last.category === row.category) {
      last.rows.push(row);
    } else {
      groups.push({ category: row.category, rows: [row] });
    }
  }

  return (
    <div className="rp-glass rounded-2xl">
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full border-collapse text-sm min-w-[640px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-card/95 backdrop-blur">
              <th className="sticky left-0 z-20 bg-card/95 backdrop-blur px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Función
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Starter
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-mono uppercase tracking-wider rp-gold-text bg-[var(--gold)]/5">
                Growth
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Enterprise
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <React.Fragment key={group.category}>
                <tr className="bg-foreground/[0.03]">
                  <td
                    colSpan={4}
                    className="sticky left-0 z-10 bg-foreground/[0.03] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground"
                  >
                    {group.category}
                  </td>
                </tr>
                {group.rows.map((row, i) => (
                  <tr
                    key={`${group.category}-${i}`}
                    className="border-b border-border/40 last:border-0 transition-colors hover:bg-foreground/[0.025]"
                  >
                    <td className="sticky left-0 z-10 bg-card/95 backdrop-blur px-4 py-3 text-left font-medium text-foreground/90 whitespace-nowrap">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Cell value={row.starter} note={row.note} />
                    </td>
                    <td className="px-4 py-3 text-center bg-[var(--gold)]/[0.04]">
                      <Cell value={row.growth} note={row.note} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Cell value={row.enterprise} note={row.note} />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =====================================================================
 * SliderRow — labeled slider with value display
 * ===================================================================== */

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
  format,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  unit?: string;
  format?: (n: number) => string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-foreground/90">{label}</label>
        <span className="font-mono text-sm rp-gold-text">
          {format ? format(value) : value}
          {unit ? <span className="ml-0.5 text-muted-foreground">{unit}</span> : null}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        className="cursor-pointer"
      />
      {hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/* =====================================================================
 * FormulaBlock — collapsible formula display
 * ===================================================================== */

function FormulaBlock({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
        >
          <ChevronDown
            className={cn("h-3 w-3 transition-transform", open ? "rotate-180" : "")}
            aria-hidden
          />
          {title}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 rounded-lg border border-border/40 bg-card/40 p-3 text-xs leading-relaxed text-muted-foreground">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* =====================================================================
 * OutputCard — output metric card with formula
 * ===================================================================== */

function OutputCard({
  label,
  value,
  sub,
  accent = "gold",
  formula,
  defaultOpen = false,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: "gold" | "teal" | "fg";
  formula?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const color =
    accent === "gold"
      ? "rp-gold-text"
      : accent === "teal"
      ? "rp-teal-text"
      : "text-foreground";
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1.5 font-display text-xl sm:text-2xl font-light", color)}>
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
      {formula ? (
        <div className="mt-2">
          <FormulaBlock title="Ver fórmula" defaultOpen={defaultOpen}>
            {formula}
          </FormulaBlock>
        </div>
      ) : null}
    </div>
  );
}

/* =====================================================================
 * LeadFormDialog — capture real data form
 * ===================================================================== */

function LeadFormDialog({
  open,
  onOpenChange,
  context,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  context?: string;
}) {
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [restaurante, setRestaurante] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast({
        title: "Faltan datos",
        description: "Indica al menos tu nombre y email.",
      });
      return;
    }
    toast({
      title: "Solicitud enviada",
      description: "Te contactaremos en menos de 24h para un análisis personalizado.",
    });
    onOpenChange(false);
    setName("");
    setEmail("");
    setPhone("");
    setRestaurante("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            Calcular con mis datos reales
          </DialogTitle>
          <DialogDescription>
            Un consultor revisará tu caso y preparará una proyección personalizada.
            {context ? <span className="block mt-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{context}</span> : null}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="lead-name" className="text-xs">Nombre *</Label>
            <Input
              id="lead-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="María García"
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-email" className="text-xs">Email *</Label>
            <Input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@restaurante.com"
              className="min-h-[44px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lead-phone" className="text-xs">Teléfono</Label>
              <Input
                id="lead-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-rest" className="text-xs">Restaurante</Label>
              <Input
                id="lead-rest"
                value={restaurante}
                onChange={(e) => setRestaurante(e.target.value)}
                placeholder="El Burladero"
                className="min-h-[44px]"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full min-h-[44px] gap-2 bg-gradient-to-r from-[var(--gold-soft)] to-[var(--gold)] text-black hover:from-[var(--gold)] hover:to-[var(--gold-deep)] hover:text-black"
            >
              <Send className="h-4 w-4" aria-hidden /> Solicitar análisis
            </Button>
          </DialogFooter>
          <p className="text-[11px] text-muted-foreground">
            Al enviar aceptas la política de privacidad. Demo: no se envían datos reales.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * ROICalculator — the star
 * ===================================================================== */

function ROICalculator() {
  const [reservas, setReservas] = React.useState(500);
  const [ticket, setTicket] = React.useState(38);
  const [noShowPct, setNoShowPct] = React.useState(12);
  const [costeNoShow, setCosteNoShow] = React.useState(38);
  const [horasManuales, setHorasManuales] = React.useState(20);
  const [costeHora, setCosteHora] = React.useState(15);
  const [herramientas, setHerramientas] = React.useState(80);
  const [leadOpen, setLeadOpen] = React.useState(false);

  // Calculations
  const noShowsMes = (reservas * noShowPct) / 100;
  const totalNoShowLoss = noShowsMes * costeNoShow;
  const recoveredLow = totalNoShowLoss * 0.667; // ~67% recovery (40% no-show reduction + waitlist refill + upselling)
  const recoveredHigh = totalNoShowLoss * 1.0; // ~100% recovery (60% reduction + waitlist + max upselling)
  const hoursSaved = Math.round(horasManuales * 0.7); // 70% automation estimated
  const hoursValueMonthly = hoursSaved * 4.33 * costeHora;
  const planCost = 99; // Growth monthly
  const roiLow = Math.round(
    ((recoveredLow + hoursValueMonthly + herramientas - planCost) / planCost) * 100
  );
  const paybackDays = Math.max(1, Math.round((planCost / (recoveredLow + herramientas)) * 30));

  return (
    <div className="space-y-6">
      <div className="rp-glass-strong rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-[var(--gold)]" aria-hidden />
          <h3 className="font-display text-lg sm:text-xl font-medium">
            Calculadora de ROI
          </h3>
          <span className="ml-auto rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
            Estimado
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajusta los sliders con los datos de tu restaurante para ver una proyección estimada del retorno.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SliderRow label="Reservas mensuales" value={reservas} min={50} max={3000} step={10} onChange={setReservas} unit=" /mes" hint="Total de reservas confirmadas + walk-ins" />
          <SliderRow label="Ticket medio" value={ticket} min={10} max={150} step={1} onChange={setTicket} format={(n) => euro(n)} hint="Ingresos medios por reserva" />
          <SliderRow label="No-show actual" value={noShowPct} min={0} max={40} step={1} onChange={setNoShowPct} unit=" %" hint="% de reservas que no se presentan" />
          <SliderRow label="Coste por no-show" value={costeNoShow} min={5} max={150} step={1} onChange={setCosteNoShow} format={(n) => euro(n)} hint="Ingresos perdidos por cada no-show" />
          <SliderRow label="Horas manuales / semana" value={horasManuales} min={2} max={80} step={1} onChange={setHorasManuales} unit=" h" hint="Reservas, WhatsApp, Excel, llamadas" />
          <SliderRow label="Coste por hora" value={costeHora} min={8} max={40} step={1} onChange={setCosteHora} format={(n) => euro(n)} hint="Coste laboral del personal" />
          <SliderRow label="Herramientas actuales" value={herramientas} min={0} max={500} step={5} onChange={setHerramientas} format={(n) => euro(n)} unit=" /mes" hint="Suscripciones que reemplazarías (WhatsApp Business, Excel 365, etc.)" />
        </div>
      </div>

      {/* Outputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <OutputCard
          label="Ingresos recuperados"
          accent="gold"
          value={
            <span>
              {euro(recoveredLow)} - {euro(recoveredHigh)}
              <span className="ml-1 text-sm text-muted-foreground">/mes</span>
            </span>
          }
          sub="Estimado · reducción 40-60% no-shows + upselling"
          defaultOpen
          formula={
            <div className="space-y-1">
              <div>No-shows/mes = reservas × no-show% = {reservas} × {noShowPct}% = <span className="font-mono rp-teal-text">{noShowsMes.toFixed(0)}</span></div>
              <div>Pérdida total = {noShowsMes.toFixed(0)} × {euro(costeNoShow)} = <span className="font-mono rp-teal-text">{euro(totalNoShowLoss)}</span></div>
              <div>Recuperación estimada (rango 67-100%):</div>
              <div className="pl-2">· 67% × {euro(totalNoShowLoss)} = <span className="font-mono rp-gold-text">{euro(recoveredLow)}</span></div>
              <div className="pl-2">· 100% × {euro(totalNoShowLoss)} = <span className="font-mono rp-gold-text">{euro(recoveredHigh)}</span></div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                Supuestos: confirmaciones automáticas + reconfirmaciones + depósitos reducen no-shows 40-60%. Lista de espera inteligente recupera mesas. Upselling añade ingresos extra.
              </div>
            </div>
          }
        />

        <OutputCard
          label="Horas ahorradas"
          accent="teal"
          value={
            <span>
              {hoursSaved}h<span className="ml-1 text-sm text-muted-foreground">/sem</span>
              <span className="mx-2 text-muted-foreground">·</span>
              {Math.round(hoursSaved * 4.33)}h<span className="ml-1 text-sm text-muted-foreground">/mes</span>
            </span>
          }
          sub={`Estimado · 70% automatización sobre ${horasManuales}h actuales`}
          formula={
            <div className="space-y-1">
              <div>Horas ahorradas = horas_manuales × 70% = {horasManuales} × 0,7 = <span className="font-mono rp-teal-text">{hoursSaved}h</span></div>
              <div>Valor económico = {hoursSaved}h × 4,33 sem/mes × {euro(costeHora)}/h = <span className="font-mono rp-gold-text">{euro(hoursValueMonthly)}/mes</span></div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                Tareas automatizadas: confirmaciones, reconfirmaciones, lista de espera, reporting, agenda, recordatorios.
              </div>
            </div>
          }
        />

        <OutputCard
          label="Herramientas reemplazadas"
          value={
            <span>
              {euro(herramientas)}
              <span className="ml-1 text-sm text-muted-foreground">/mes</span>
            </span>
          }
          sub="Ahorro directo en suscripciones"
          formula={
            <div>
              Suscripciones que ya no necesitarías: WhatsApp Business API, Excel/Sheets premium, agenda externa, herramientas de email marketing básico, etc. Total estimado: <span className="font-mono rp-gold-text">{euro(herramientas)}/mes</span>.
            </div>
          }
        />

        <OutputCard
          label="ROI estimado"
          accent="gold"
          value={`${roiLow.toLocaleString("es-ES")}%`}
          sub={`Basado en plan Growth ${euro(planCost)}/mes`}
          formula={
            <div className="space-y-1">
              <div>Beneficio mensual = ingresos_recuperados (low) + horas_valor + herramientas - plan = </div>
              <div className="pl-2 font-mono">{euro(recoveredLow)} + {euro(hoursValueMonthly)} + {euro(herramientas)} - {euro(planCost)} = <span className="rp-gold-text">{euro(recoveredLow + hoursValueMonthly + herramientas - planCost)}</span></div>
              <div className="mt-1">ROI = beneficio / plan × 100 = <span className="font-mono rp-gold-text">{roiLow.toLocaleString("es-ES")}%</span></div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                Conservador: usa el límite inferior de ingresos recuperados. Sin contar upselling adicional ni valor de marca.
              </div>
            </div>
          }
        />

        <OutputCard
          label="Payback"
          accent="teal"
          value={
            <span>
              &lt; {paybackDays}
              <span className="ml-1 text-sm text-muted-foreground">días</span>
            </span>
          }
          sub="Tiempo hasta recuperar la inversión del primer mes"
          formula={
            <div>
              Payback = (plan_cost / (recuperación_low + herramientas)) × 30 días = ({euro(planCost)} / ({euro(recoveredLow)} + {euro(herramientas)})) × 30 ≈ <span className="font-mono rp-teal-text">{paybackDays} días</span>
            </div>
          }
        />

        <OutputCard
          label="Beneficio neto anual"
          accent="gold"
          value={euro((recoveredLow + hoursValueMonthly + herramientas - planCost) * 12)}
          sub="Estimado conservador · sin upselling adicional"
          formula={
            <div>
              Beneficio mensual × 12 = {euro(recoveredLow + hoursValueMonthly + herramientas - planCost)} × 12 = <span className="font-mono rp-gold-text">{euro((recoveredLow + hoursValueMonthly + herramientas - planCost) * 12)}</span>/año
            </div>
          }
        />
      </div>

      <div className="rp-glass rounded-xl border-l-2 border-amber-400/50 p-4">
        <div className="flex items-start gap-2.5">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Aviso:</span> Estimaciones basadas en datos de la industria (media de reducción de no-shows del 40-60% con sistemas de confirmación + depósito). No son garantías. Los resultados reales dependen del restaurante, su volumen, disciplina del equipo y configuración. Las predicciones mejoran tras 30-60 días de uso con datos propios.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          ¿Quieres una proyección con tus datos reales?
        </p>
        <Button
          type="button"
          onClick={() => setLeadOpen(true)}
          className="min-h-[44px] gap-2 bg-gradient-to-r from-[var(--gold-soft)] to-[var(--gold)] text-black hover:from-[var(--gold)] hover:to-[var(--gold-deep)] hover:text-black"
        >
          <Calculator className="h-4 w-4" aria-hidden /> Calcular con mis datos reales
        </Button>
      </div>

      <LeadFormDialog open={leadOpen} onOpenChange={setLeadOpen} context="Contexto: Calculadora ROI" />
    </div>
  );
}

/* =====================================================================
 * NoShowCalculator — before/after bar chart
 * ===================================================================== */

function NoShowCalculator() {
  const [reservas, setReservas] = React.useState(500);
  const [noShowPct, setNoShowPct] = React.useState(12);
  const [deposito, setDeposito] = React.useState(10);

  const noShows = (reservas * noShowPct) / 100;
  const totalLoss = noShows * deposito;
  const reducedLow = noShows * 0.4; // 60% reduction
  const reducedHigh = noShows * 0.6; // 40% reduction
  const savingsLow = totalLoss * 0.4;
  const savingsHigh = totalLoss * 0.6;

  // Bar chart geometry
  const chartH = 180;
  const barWidth = 80;
  const gap = 40;
  const maxValue = Math.max(totalLoss, 1);

  const bars = [
    { label: "Actual", value: totalLoss, color: "var(--destructive)", sub: "Pérdida/mes" },
    { label: "Con RestoPanel (low)", value: totalLoss - savingsLow, color: "var(--teal)", sub: `−40%` },
    { label: "Con RestoPanel (high)", value: totalLoss - savingsHigh, color: "var(--gold)", sub: `−60%` },
  ];

  return (
    <div className="rp-glass-strong rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-[var(--teal)]" aria-hidden />
        <h3 className="font-display text-lg sm:text-xl font-medium">
          Calculadora de reducción de no-shows
        </h3>
        <span className="ml-auto rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
          Estimado
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Con RestoPanel, se estima una reducción del 40-60% en no-shows mediante confirmaciones automáticas, reconfirmaciones y depósitos.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <SliderRow label="Reservas/mes" value={reservas} min={50} max={3000} step={10} onChange={setReservas} />
        <SliderRow label="No-show actual" value={noShowPct} min={0} max={40} step={1} onChange={setNoShowPct} unit=" %" />
        <SliderRow label="Depósito medio" value={deposito} min={0} max={50} step={1} onChange={setDeposito} format={(n) => euro(n)} hint="Coste perdido por no-show" />
      </div>

      {/* Chart */}
      <div className="mt-6 overflow-x-auto rp-scroll-thin">
        <svg
          width={bars.length * (barWidth + gap) + gap}
          height={chartH + 60}
          role="img"
          aria-label={`Pérdida actual ${euro(totalLoss)}/mes vs con RestoPanel ${euro(totalLoss - savingsHigh)}-${euro(totalLoss - savingsLow)}/mes`}
          className="min-w-[420px]"
        >
          {/* Y axis grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const y = chartH - chartH * p + 10;
            return (
              <g key={i}>
                <line x1={gap / 2} y1={y} x2={bars.length * (barWidth + gap) + gap / 2} y2={y} stroke="currentColor" strokeOpacity={0.06} strokeWidth={1} />
                <text x={gap / 2} y={y - 4} fontSize={10} fill="currentColor" fillOpacity={0.5} className="font-mono">
                  {euro(maxValue * p)}
                </text>
              </g>
            );
          })}
          {bars.map((b, i) => {
            const x = gap + i * (barWidth + gap);
            const h = (b.value / maxValue) * chartH;
            const y = chartH - h + 10;
            return (
              <g key={i}>
                <rect x={x} y={10} width={barWidth} height={chartH} rx={4} fill="currentColor" fillOpacity={0.04} />
                <rect x={x} y={y} width={barWidth} height={h} rx={4} fill={b.color} fillOpacity={0.85} />
                <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize={12} fill={b.color} className="font-mono font-medium">
                  {euro(b.value)}
                </text>
                <text x={x + barWidth / 2} y={chartH + 30} textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.7}>
                  {b.label}
                </text>
                <text x={x + barWidth / 2} y={chartH + 46} textAnchor="middle" fontSize={10} fill={b.color} className="font-mono">
                  {b.sub}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-5 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-4">
        <p className="text-sm leading-relaxed">
          <span className="font-medium rp-gold-text">Ahorro estimado:</span>{" "}
          <span className="font-mono font-medium">{euro(savingsLow)} - {euro(savingsHigh)}/mes</span>
          {" "}({euro(savingsLow * 12)} - {euro(savingsHigh * 12)}/año)
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Reducción de {reducedLow.toFixed(0)}-{reducedHigh.toFixed(0)} no-shows/mes sobre {noShows.toFixed(0)} actuales.
          Basado en confirmaciones automáticas + reconfirmación 24h antes + depósito reembolsable.
        </p>
      </div>

      <div className="mt-4">
        <FormulaBlock title="Ver fórmula y supuestos">
          <div className="space-y-1.5">
            <div>No-shows/mes = {reservas} reservas × {noShowPct}% = <span className="font-mono rp-teal-text">{noShows.toFixed(0)}</span></div>
            <div>Pérdida actual = {noShows.toFixed(0)} × {euro(deposito)} = <span className="font-mono rp-teal-text">{euro(totalLoss)}/mes</span></div>
            <div>Reducción estimada: 40-60% (industry benchmark con depósito + reconfirmación).</div>
            <div className="pl-2">· Reducción 40% → {noShows.toFixed(0)} × 0,4 = <span className="font-mono rp-gold-text">{reducedLow.toFixed(0)} no-shows evitados</span></div>
            <div className="pl-2">· Reducción 60% → {noShows.toFixed(0)} × 0,6 = <span className="font-mono rp-gold-text">{reducedHigh.toFixed(0)} no-shows evitados</span></div>
            <div className="mt-2 text-[11px]">
              Supuestos: industria HORECA, sistemas con depósito reembolsable + doble confirmación.
              RestoPanel no garantiza estos porcentajes — la reducción real depende de tu mercado, perfil de cliente y configuración.
            </div>
          </div>
        </FormulaBlock>
      </div>
    </div>
  );
}

/* =====================================================================
 * HoursSavedCalculator — time breakdown chart
 * ===================================================================== */

function HoursSavedCalculator() {
  const [reservas, setReservas] = React.useState(8);
  const [whatsapp, setWhatsapp] = React.useState(6);
  const [excel, setExcel] = React.useState(4);
  const [llamadas, setLlamadas] = React.useState(2);

  const totalManual = reservas + whatsapp + excel + llamadas;
  const automationRate = 0.7; // 70% automation
  const savedReservas = Math.round(reservas * automationRate);
  const savedWhatsapp = Math.round(whatsapp * automationRate);
  const savedExcel = Math.round(excel * automationRate);
  const savedLlamadas = Math.round(llamadas * automationRate);
  const totalSaved = savedReservas + savedWhatsapp + savedExcel + savedLlamadas;
  const valueMonthly = totalSaved * 4.33 * 15;

  const tasks = [
    { label: "Reservas manuales", color: "var(--gold)", total: reservas, saved: savedReservas },
    { label: "WhatsApp", color: "var(--teal)", total: whatsapp, saved: savedWhatsapp },
    { label: "Excel/reporting", color: "#E8C766", total: excel, saved: savedExcel },
    { label: "Llamadas", color: "#2BA89E", total: llamadas, saved: savedLlamadas },
  ];

  const maxValue = Math.max(totalManual, 1);
  const chartW = 360;
  const chartH = 180;
  const barH = 28;
  const gap = 12;

  return (
    <div className="rp-glass-strong rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-[var(--teal)]" aria-hidden />
        <h3 className="font-display text-lg sm:text-xl font-medium">
          Calculadora de horas ahorradas
        </h3>
        <span className="ml-auto rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
          Estimado
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        RestoPanel automatiza tareas manuales repetitivas. Estima cuánto tiempo dedicas hoy a cada una.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SliderRow label="Reservas manuales" value={reservas} min={0} max={40} step={1} onChange={setReservas} unit=" h/sem" />
        <SliderRow label="WhatsApp" value={whatsapp} min={0} max={30} step={1} onChange={setWhatsapp} unit=" h/sem" />
        <SliderRow label="Excel / reporting" value={excel} min={0} max={20} step={1} onChange={setExcel} unit=" h/sem" />
        <SliderRow label="Llamadas" value={llamadas} min={0} max={15} step={1} onChange={setLlamadas} unit=" h/sem" />
      </div>

      {/* Chart */}
      <div className="mt-6 overflow-x-auto rp-scroll-thin">
        <svg
          width={chartW + 140}
          height={tasks.length * (barH + gap) + 40}
          role="img"
          aria-label={`Horas ahorradas estimadas: ${totalSaved}h/semana = ${Math.round(totalSaved * 4.33)}h/mes`}
          className="min-w-[420px]"
        >
          {tasks.map((t, i) => {
            const y = i * (barH + gap) + 10;
            const totalW = (t.total / maxValue) * chartW;
            const savedW = (t.saved / maxValue) * chartW;
            return (
              <g key={i}>
                <text x={0} y={y + barH / 2 + 4} fontSize={11} fill="currentColor" fillOpacity={0.8}>
                  {t.label}
                </text>
                <rect x={130} y={y} width={chartW} height={barH} rx={4} fill="currentColor" fillOpacity={0.04} />
                <rect x={130} y={y} width={totalW} height={barH} rx={4} fill={t.color} fillOpacity={0.25} />
                <rect x={130} y={y} width={savedW} height={barH} rx={4} fill={t.color} fillOpacity={0.9} />
                <text x={130 + savedW + 6} y={y + barH / 2 + 4} fontSize={11} fill={t.color} className="font-mono">
                  {t.saved}h / {t.total}h
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rp-glass rounded-xl p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Horas ahorradas</div>
          <div className="mt-1 font-display text-2xl font-light rp-teal-text">
            {totalSaved}h<span className="ml-1 text-sm text-muted-foreground">/sem</span>
          </div>
          <div className="text-xs text-muted-foreground">= {Math.round(totalSaved * 4.33)}h/mes</div>
        </div>
        <div className="rp-glass rounded-xl p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Valor económico</div>
          <div className="mt-1 font-display text-2xl font-light rp-gold-text">
            {euro(valueMonthly)}<span className="ml-1 text-sm text-muted-foreground">/mes</span>
          </div>
          <div className="text-xs text-muted-foreground">a €15/h</div>
        </div>
        <div className="rp-glass rounded-xl p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Tasa de automatización</div>
          <div className="mt-1 font-display text-2xl font-light">70%</div>
          <div className="text-xs text-muted-foreground">estimado media industria</div>
        </div>
      </div>

      <div className="mt-4">
        <FormulaBlock title="Ver fórmula y supuestos">
          <div className="space-y-1.5">
            <div>Total manual = {reservas} + {whatsapp} + {excel} + {llamadas} = <span className="font-mono rp-teal-text">{totalManual}h/sem</span></div>
            <div>Automatización estimada: 70% sobre cada tarea (confirmaciones automáticas, plantillas, integraciones, reporting automático).</div>
            <div>Horas ahorradas = {totalManual} × 0,7 = <span className="font-mono rp-gold-text">{totalSaved}h/sem</span></div>
            <div>Valor mensual = {totalSaved} × 4,33 sem/mes × €15/h = <span className="font-mono rp-gold-text">{euro(valueMonthly)}/mes</span></div>
            <div className="mt-2 text-[11px]">
              Supuestos: 70% de automatización es la mediana observada en restaurantes que implementan RestoPanel con sus flujos activos. Resto del tiempo se mantiene para excepciones, atención personal y supervisión.
            </div>
          </div>
        </FormulaBlock>
      </div>
    </div>
  );
}

/* =====================================================================
 * PlanRecommender
 * ===================================================================== */

function PlanRecommender() {
  const [locales, setLocales] = React.useState(1);
  const [usuarios, setUsuarios] = React.useState(3);
  const [reservas, setReservas] = React.useState(500);
  const [whatsapp, setWhatsapp] = React.useState(true);
  const [ia, setIa] = React.useState(true);
  const [api, setApi] = React.useState(false);
  const { toast } = useToast();

  // Recommendation logic
  const recommend = React.useMemo((): { plan: PlanId; reasoning: string } => {
    const needsEnterprise =
      locales > 5 || usuarios > 25 || api || reservas > 2000;
    const needsGrowth =
      locales > 1 || usuarios > 3 || reservas > 500 || whatsapp || ia;

    if (needsEnterprise) {
      const reasons: string[] = [];
      if (locales > 5) reasons.push(`${locales} locales (límite Growth: 5)`);
      if (usuarios > 25) reasons.push(`${usuarios} usuarios`);
      if (api) reasons.push("necesitas API Enterprise + webhooks");
      if (reservas > 2000) reasons.push(`${reservas} reservas/mes (volumen alto)`);
      return {
        plan: "enterprise",
        reasoning: `Basado en ${reasons.join(", ")}, te conviene Enterprise. Incluye multi-local ilimitado, API completa, BI, cloud privado, SLA 99,9% y Account Manager dedicado.`,
      };
    }

    if (needsGrowth) {
      const reasons: string[] = [];
      if (locales > 1) reasons.push(`${locales} locales`);
      if (usuarios > 3) reasons.push(`${usuarios} usuarios`);
      if (reservas > 500) reasons.push(`${reservas} reservas/mes`);
      if (whatsapp) reasons.push("WhatsApp");
      if (ia) reasons.push("IA avanzada");
      return {
        plan: "growth",
        reasoning: `Basado en ${reasons.join(", ")}, Growth cubre tus necesidades. Enterprise sería excesivo para tu volumen actual (${reservas} reservas/mes, ${locales} ${locales === 1 ? "local" : "locales"}).`,
      };
    }

    return {
      plan: "starter",
      reasoning: `Con ${locales} ${locales === 1 ? "local" : "locales"}, ${usuarios} ${usuarios === 1 ? "usuario" : "usuarios"} y ${reservas} reservas/mes sin necesidades avanzadas (WhatsApp/IA/API), Starter es suficiente. Puedes hacer upgrade cuando lo necesites.`,
    };
  }, [locales, usuarios, reservas, whatsapp, ia, api]);

  const recommendedPlan = PLANS.find((p) => p.id === recommend.plan)!;

  return (
    <div className="rp-glass-strong rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[var(--gold)]" aria-hidden />
        <h3 className="font-display text-lg sm:text-xl font-medium">
          Recomendador de plan
        </h3>
        <span className="ml-auto rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
          Inteligente
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Responde 6 preguntas para obtener una recomendación personalizada con razonamiento.
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <SliderRow label="Número de locales" value={locales} min={1} max={50} step={1} onChange={setLocales} unit={locales === 1 ? " local" : " locales"} />
        <SliderRow label="Usuarios" value={usuarios} min={1} max={100} step={1} onChange={setUsuarios} unit={usuarios === 1 ? " usuario" : " usuarios"} />
        <SliderRow label="Reservas/mes" value={reservas} min={50} max={5000} step={50} onChange={setReservas} />
        <div className="space-y-3 pt-2">
          <ToggleRow label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
          <ToggleRow label="IA avanzada" value={ia} onChange={setIa} />
          <ToggleRow label="API" value={api} onChange={setApi} />
        </div>
      </div>

      <div
        className={cn(
          "mt-6 rounded-xl border p-5",
          recommend.plan === "growth"
            ? "border-[var(--gold)]/40 bg-[var(--gold)]/5"
            : recommend.plan === "enterprise"
            ? "border-[var(--teal)]/40 bg-[var(--teal)]/5"
            : "border-border/50 bg-card/40"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              recommend.plan === "growth"
                ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                : recommend.plan === "enterprise"
                ? "bg-[var(--teal)]/15 text-[var(--teal)]"
                : "bg-foreground/10 text-foreground/70"
            )}
          >
            <recommendedPlan.icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Plan recomendado
            </div>
            <div className="font-display text-xl font-medium">
              {recommendedPlan.name}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="font-display text-2xl font-light rp-gold-text">
              {recommend.plan === "enterprise" ? "€249+" : euro(recommendedPlan.monthly)}
            </div>
            <div className="text-xs text-muted-foreground">/mes</div>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {recommend.reasoning}
        </p>
        <Button
          type="button"
          onClick={() => {
            if (recommend.plan === "enterprise") {
              toast({
                title: "Contactando con ventas",
                description: "Un Account Manager se pondrá en contacto en menos de 24h.",
              });
            } else {
              useNav.getState().setView("app");
            }
          }}
          className={cn(
            "mt-4 min-h-[44px] gap-2",
            recommend.plan === "growth"
              ? "bg-gradient-to-r from-[var(--gold-soft)] to-[var(--gold)] text-black hover:from-[var(--gold)] hover:to-[var(--gold-deep)] hover:text-black"
              : ""
          )}
          variant={recommend.plan === "growth" ? "default" : "outline"}
        >
          {recommend.plan === "enterprise" ? "Contactar ventas" : `Ver plan ${recommendedPlan.name}`}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Recomendación automática basada en tus respuestas. Es orientativa — el plan final depende de tu caso específico.
      </p>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-card/30 px-3 py-2.5">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

/* =====================================================================
 * CompetitorComparison
 * ===================================================================== */

function CompetitorComparison() {
  const competitors = [
    { id: "rp", label: "RestoPanel", highlight: true, sub: "Growth €99/mes" },
    { id: "cover", label: "CoverManager", sub: "~€120/mes" },
    { id: "seven", label: "SevenRooms", sub: "~€250/mes" },
    { id: "opentable", label: "OpenTable", sub: "~€240/mes" },
    { id: "excel", label: "Excel", sub: "€0" },
    { id: "whatsapp", label: "WhatsApp", sub: "€0" },
  ];

  return (
    <div className="space-y-5">
      {/* Price comparison callout */}
      <div className="rp-glass-strong rounded-2xl border-l-2 border-[var(--gold)]/50 p-5">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 rp-gold-text" aria-hidden />
          <h3 className="font-display text-base sm:text-lg font-medium">
            Comparativa de precios
          </h3>
          <span className="ml-auto rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
            Demo
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          <span className="rp-gold-text font-medium">RestoPanel Growth €99/mes</span> vs CoverManager <span className="font-mono">~€120/mes</span> vs SevenRooms <span className="font-mono">~€250/mes</span> vs OpenTable <span className="font-mono">~€240/mes</span>.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Precios de competidores basados en información pública (2024). Verificar precios actuales directamente con cada proveedor. <span className="text-amber-400">Pendiente de validación.</span>
        </p>
      </div>

      {/* Matrix */}
      <div className="rp-glass rounded-2xl">
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full border-collapse text-sm min-w-[820px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-card/95 backdrop-blur">
                <th className="sticky left-0 z-20 bg-card/95 backdrop-blur px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Característica
                </th>
                {competitors.map((c) => (
                  <th
                    key={c.id}
                    className={cn(
                      "px-3 py-3 text-center text-[11px] font-mono uppercase tracking-wider",
                      c.highlight
                        ? "rp-gold-text bg-[var(--gold)]/8 border-x border-[var(--gold)]/30"
                        : "text-muted-foreground"
                    )}
                  >
                    <div className="font-display text-sm normal-case tracking-tight">
                      {c.label}
                    </div>
                    <div className={cn("mt-0.5 text-[10px]", c.highlight ? "rp-gold-text" : "text-muted-foreground")}>
                      {c.sub}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/40 last:border-0 transition-colors hover:bg-foreground/[0.025]"
                >
                  <td className="sticky left-0 z-10 bg-card/95 backdrop-blur px-4 py-3 text-left font-medium text-foreground/90 whitespace-nowrap">
                    {row.label}
                  </td>
                  <td className="px-3 py-3 text-center bg-[var(--gold)]/[0.05] border-x border-[var(--gold)]/30">
                    <Cell value={row.rp} note={row.note} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Cell value={row.cover} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Cell value={row.seven} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Cell value={row.opentable} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Cell value={row.excel} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Cell value={row.whatsapp} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Información basada en análisis comparativo interno (demo). No constituye una recomendación oficial. Los competidores pueden haber actualizado sus planes desde la elaboración de esta tabla.
      </p>
    </div>
  );
}

/* =====================================================================
 * AddOnsGrid
 * ===================================================================== */

function AddOnsGrid() {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const toggle = (id: string, name: string) => {
    setSelected((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        toast({ title: "Add-on añadido", description: `${name} añadido a tu suscripción.` });
      } else {
        toast({ title: "Add-on eliminado", description: `${name} eliminado.` });
      }
      return next;
    });
  };

  const total = ADDONS.reduce((sum, a) => sum + (selected[a.id] ? a.price : 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg sm:text-xl font-medium">
            Add-ons disponibles
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Amplía RestoPanel con módulos especializados. Todos requieren plan Growth o superior.
          </p>
        </div>
        <div className="rp-glass-strong rounded-xl px-4 py-3 text-right">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Total add-ons seleccionados
          </div>
          <div className="mt-0.5 font-display text-2xl font-light rp-gold-text">
            {euro(total)}<span className="ml-1 text-sm text-muted-foreground">/mes</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {Object.values(selected).filter(Boolean).length} de {ADDONS.length}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADDONS.map((a, i) => {
          const isSel = !!selected[a.id];
          return (
            <motion.div
              key={a.id}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className={cn(
                "relative flex flex-col rounded-2xl p-5 transition-all",
                isSel
                  ? "rp-glass-strong border-[var(--gold)]/40"
                  : "rp-glass hover:border-foreground/20"
              )}
            >
              {a.tag ? (
                <span
                  className={cn(
                    "absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                    a.tag === "popular"
                      ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                      : "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
                  )}
                >
                  {a.tag === "popular" ? <Star className="h-2.5 w-2.5" aria-hidden /> : <Zap className="h-2.5 w-2.5" aria-hidden />}
                  {a.tag === "popular" ? "Popular" : a.tag}
                </span>
              ) : null}

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground/5 text-foreground/70">
                <a.icon className="h-5 w-5" aria-hidden />
              </div>

              <h4 className="mt-3 font-display text-base font-medium">{a.name}</h4>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {a.description}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="font-display text-xl font-light rp-gold-text">
                  {euro(a.price)}
                </span>
                <span className="text-xs text-muted-foreground">/mes</span>
              </div>

              <div className="mt-2 inline-flex w-fit items-center gap-1 rounded-md border border-foreground/10 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                <Layers className="h-3 w-3" aria-hidden />
                {a.compatible}
              </div>

              <Button
                type="button"
                onClick={() => toggle(a.id, a.name)}
                variant={isSel ? "default" : "outline"}
                className={cn(
                  "mt-4 min-h-[44px] w-full gap-1.5",
                  isSel
                    ? "bg-gradient-to-r from-[var(--gold-soft)] to-[var(--gold)] text-black hover:from-[var(--gold)] hover:to-[var(--gold-deep)] hover:text-black"
                    : ""
                )}
              >
                {isSel ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden /> Añadido
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" aria-hidden /> Añadir
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <div className="rp-glass rounded-xl border-l-2 border-[var(--teal)]/50 p-4">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" aria-hidden />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Los add-ons se facturan mensualmente junto a tu suscripción principal. Puedes activarlos y desactivarlos cuando quieras. Los cambios entran en vigor al inicio del siguiente ciclo.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
 * FAQSection
 * ===================================================================== */

function FAQSection() {
  const { toast } = useToast();
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-lg sm:text-xl font-medium">
          Preguntas frecuentes sobre precios
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Respuestas concretas a las dudas más habituales. Si necesitas algo más específico, contacta con ventas.
        </p>
      </div>

      <div className="rp-glass rounded-2xl p-4 sm:p-6">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border/40">
              <AccordionTrigger className="text-left text-sm sm:text-base hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="rp-glass-strong rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--gold)]/15 text-[var(--gold)]">
              <Phone className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h4 className="font-display text-base font-medium">
                ¿Tienes dudas específicas?
              </h4>
              <p className="text-sm text-muted-foreground">
                Un especialista te ayuda a elegir el plan ideal en menos de 24h.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px] gap-2"
              onClick={() =>
                toast({
                  title: "Abriendo email",
                  description: "ventas@restopanel.com — te responderemos en 24h.",
                })
              }
            >
              <Mail className="h-4 w-4" aria-hidden /> Email
            </Button>
            <Button
              type="button"
              className="min-h-[44px] gap-2 bg-gradient-to-r from-[var(--gold-soft)] to-[var(--gold)] text-black hover:from-[var(--gold)] hover:to-[var(--gold-deep)] hover:text-black"
              onClick={() =>
                toast({
                  title: "Solicitud enviada",
                  description: "Te llamaremos en menos de 24h.",
                })
              }
            >
              <Phone className="h-4 w-4" aria-hidden /> Contactar ventas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
 * Main component — PricingIntelligence
 * ===================================================================== */

const TABS = [
  { id: "planes", label: "Planes", icon: Crown },
  { id: "calculadoras", label: "Calculadoras", icon: Calculator },
  { id: "comparativa", label: "Comparativa", icon: BarChart3 },
  { id: "addons", label: "Add-ons", icon: Layers },
  { id: "faq", label: "FAQ", icon: Info },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PricingIntelligence() {
  const reduced = useReducedMotion();
  const [tab, setTab] = React.useState<TabId>("planes");
  const [billing, setBilling] = React.useState<BillingCycle>("monthly");

  return (
    <section
      id="pricing"
      className="relative scroll-mt-24 py-12 sm:py-16"
      aria-label="Pricing Intelligence Module"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">07</span>
            <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
            <span>Pricing Intelligence</span>
            <span className="inline-flex items-center gap-1 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2 py-0.5 text-[10px] text-[var(--gold-soft)]">
              <ShieldCheck className="h-3 w-3" aria-hidden /> demo
            </span>
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-balance">
            Elige tu plan con{" "}
            <span className="rp-gold-gradient">inteligencia</span>
          </h2>
          <p className="mt-4 max-w-3xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            Precios transparentes. Sin permanencia. Calcula tu ROI estimado, compara con alternativas
            y elige solo lo que necesitas. <span className="text-foreground/80">Todos los cálculos son estimaciones orientativas</span> — no garantías.
          </p>
        </header>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)} className="w-full">
          <div className="overflow-x-auto rp-scroll-thin pb-1">
            <TabsList className="h-auto bg-card/40 border border-border/60 p-1 inline-flex w-max min-w-full">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="min-h-[40px] gap-1.5 px-3 sm:px-4 data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)]"
                >
                  <t.icon className="h-4 w-4" aria-hidden />
                  <span>{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Planes tab */}
          <TabsContent value="planes" className="mt-6 sm:mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key="planes-content"
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                {/* Billing toggle */}
                <div className="flex items-center justify-center gap-3">
                  <span className={cn("text-sm", billing === "monthly" ? "text-foreground" : "text-muted-foreground")}>
                    Mensual
                  </span>
                  <Switch
                    checked={billing === "annual"}
                    onCheckedChange={(c) => setBilling(c ? "annual" : "monthly")}
                    aria-label="Cambiar facturación mensual/anual"
                  />
                  <span className={cn("text-sm", billing === "annual" ? "text-foreground" : "text-muted-foreground")}>
                    Anual
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
                    <BadgePercent className="h-3 w-3" aria-hidden /> 2 meses gratis
                  </span>
                </div>

                {/* Plan cards */}
                <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
                  {PLANS.map((plan, i) => (
                    <PlanCard key={plan.id} plan={plan} billing={billing} index={i} />
                  ))}
                </div>

                {/* Feature comparison table */}
                <div>
                  <div className="mb-3 flex items-baseline justify-between">
                    <h3 className="font-display text-lg sm:text-xl font-medium">
                      Comparativa completa de funciones
                    </h3>
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      {FEATURE_MATRIX.length} funciones
                    </span>
                  </div>
                  <FeatureMatrixTable />
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Calculadoras tab */}
          <TabsContent value="calculadoras" className="mt-6 sm:mt-8 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key="calc-content"
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="rp-glass rounded-xl border-l-2 border-[var(--gold)]/50 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">4 calculadoras interactivas.</span> Ajusta los parámetros y obtén estimaciones en tiempo real. Todas las cifras son <span className="rp-teal-text font-medium">estimadas</span> y basadas en benchmarks de la industria.
                  </p>
                </div>

                <ROICalculator />
                <NoShowCalculator />
                <HoursSavedCalculator />
                <PlanRecommender />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Comparativa tab */}
          <TabsContent value="comparativa" className="mt-6 sm:mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key="comp-content"
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <CompetitorComparison />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Add-ons tab */}
          <TabsContent value="addons" className="mt-6 sm:mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key="addons-content"
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <AddOnsGrid />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* FAQ tab */}
          <TabsContent value="faq" className="mt-6 sm:mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key="faq-content"
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <FAQSection />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        {/* Disclaimer footer */}
        <div className="mt-10 rp-glass rounded-xl p-4 sm:p-5">
          <div className="flex items-start gap-2.5">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Aviso sobre estimaciones:</span> Todas las cifras de ROI, ahorro y reducción de no-shows mostradas en este módulo son <span className="font-medium">estimaciones</span> basadas en datos agregados de la industria HORECA. No constituyen garantías de resultados. Los resultados reales dependen del restaurante, su configuración, disciplina del equipo y volumen. RestoPanel no se hace responsable de desviaciones respecto a las estimaciones mostradas. Consulta con ventas para una proyección personalizada con tus datos reales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingIntelligence;
