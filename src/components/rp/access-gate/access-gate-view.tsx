"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ShieldCheck, ShieldAlert, Lock, Server, Building2, Eye,
  Check, X, AlertTriangle, Ban, CreditCard, RefreshCw, Headphones,
  Settings, ChevronDown, KeyRound, Database, FileWarning,
  CalendarClock, Clock, Crown, Sparkles, CircleCheck, CircleAlert,
  CircleX, Lightbulb, Terminal, ArrowUpRight, Inbox,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete";

export interface StatusMeta {
  id: SubscriptionStatus;
  label: string;
  short: string;
  tone: "green" | "blue" | "amber" | "red" | "muted";
  description: string;
}

/* =========================================================
 * Mock data
 * =======================================================*/

const STATUSES: StatusMeta[] = [
  {
    id: "active",
    label: "Activa",
    short: "active",
    tone: "green",
    description: "Suscripción al corriente de pago · acceso completo.",
  },
  {
    id: "trialing",
    label: "Periodo de prueba",
    short: "trialing",
    tone: "blue",
    description: "Trial activo · sin tarjeta todavía.",
  },
  {
    id: "past_due",
    label: "Pago pendiente",
    short: "past_due",
    tone: "amber",
    description: "Renovación fallida · periodo de gracia en curso.",
  },
  {
    id: "canceled",
    label: "Cancelada",
    short: "canceled",
    tone: "red",
    description: "Cancelada por el usuario · datos conservados.",
  },
  {
    id: "unpaid",
    label: "Impagada",
    short: "unpaid",
    tone: "red",
    description: "Periodo de gracia agotado · acceso restringido.",
  },
  {
    id: "incomplete",
    label: "Configuración incompleta",
    short: "incomplete",
    tone: "muted",
    description: "Onboarding sin terminar · falta configurar pago.",
  },
];

const MIDDLEWARE_SNIPPET = `// middleware.ts — verificación en servidor, no solo UI
import { getOrgForRequest } from "@/lib/auth";
import { can, getSubscription } from "@/lib/entitlements";

export async function middleware(req: NextRequest) {
  const org = await getOrgForRequest(req);
  if (!org) return NextResponse.redirect(new URL("/login", req.url));

  const sub = await getSubscription(org.id);
  // Estados que SIEMPRE bloquean el app shell
  if (sub.status === "unpaid" || sub.status === "incomplete") {
    return NextResponse.redirect(new URL("/gate", req.url));
  }
  // past_due y canceled: degradan (operacion critica permitida)
  return NextResponse.next();
}`;

const API_ROUTE_SNIPPET = `// app/api/entitlements/route.ts — defensa en profundidad
export async function GET(req: Request) {
  const { orgId } = await getSession(req);
  const sub = await getSubscription(orgId);

  // Re-check en API: nunca confiar en el cliente
  if (sub.status === "unpaid") {
    return Response.json(
      { error: "subscription_unpaid" },
      { status: 402 }
    );
  }
  return Response.json({ entitlements: sub.entitlements });
}`;

const QUERY_SNIPPET = `// Toda query del ORM filtra por organization_id
// Ejemplo: listar reservas del día
const reservations = await prisma.reservation.findMany({
  where: {
    organization_id: org.id,   // ← SIEMPRE presente
    location_id: req.locals.locationId,
    date: today,
  },
  orderBy: { time: "asc" },
});

// Incluso en endpoints "globales" del super-admin, el filtro
// se inyecta vía middleware y no puede omitirse desde el handler.`;

const PLAN_GATE_SNIPPET = `// route.ts — feature fuera del plan → 404 (no 403)
export async function GET(req: Request) {
  if (!can(org, "delivery.own_channel")) {
    // 404, no 403: no revelar que la ruta existe
    return new Response(null, { status: 404 });
  }
  return handle(req);
}`;

/* =========================================================
 * Helpers
 * =======================================================*/

function toneBannerCls(tone: StatusMeta["tone"]): {
  border: string;
  bg: string;
  text: string;
  dot: string;
  ring: string;
} {
  switch (tone) {
    case "green":
      return {
        border: "border-emerald-500/50",
        bg: "bg-emerald-500/10",
        text: "text-emerald-300",
        dot: "bg-emerald-400",
        ring: "ring-emerald-500/30",
      };
    case "blue":
      return {
        border: "border-sky-500/50",
        bg: "bg-sky-500/10",
        text: "text-sky-300",
        dot: "bg-sky-400",
        ring: "ring-sky-500/30",
      };
    case "amber":
      return {
        border: "border-amber-500/50",
        bg: "bg-amber-500/10",
        text: "text-amber-300",
        dot: "bg-amber-400",
        ring: "ring-amber-500/30",
      };
    case "red":
      return {
        border: "border-rose-500/50",
        bg: "bg-rose-500/10",
        text: "text-rose-300",
        dot: "bg-rose-400",
        ring: "ring-rose-500/30",
      };
    default:
      return {
        border: "border-border/60",
        bg: "bg-foreground/[0.04]",
        text: "text-muted-foreground",
        dot: "bg-zinc-500",
        ring: "ring-foreground/15",
      };
  }
}

/* =========================================================
 * Shared atoms
 * =======================================================*/

function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-amber-400/40 bg-amber-400/10 text-amber-300 font-mono uppercase tracking-wider text-[10px]",
        className
      )}
    >
      demo
    </Badge>
  );
}

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

function CodeBlock({
  code,
  label,
  lang = "ts",
  icon: Icon = Terminal,
}: {
  code: string;
  label: string;
  lang?: string;
  icon?: React.ElementType;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border border-border/40 overflow-hidden">
      <CollapsibleTrigger asChild>
        <button
          className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-foreground/[0.03] hover:bg-foreground/[0.05] transition-colors min-h-9"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-[var(--gold)]" />
            {label}
            <span className="text-muted-foreground/60 normal-case font-sans tracking-normal">
              · {lang}
            </span>
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open ? "" : "-rotate-90")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="overflow-x-auto rp-scroll-thin p-3 text-[11px] leading-relaxed font-mono text-foreground/85 bg-foreground/[0.02]">
          <code>{code}</code>
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* =========================================================
 * Status selector + banner
 * =======================================================*/

function StatusBanner({ status }: { status: SubscriptionStatus }) {
  const meta = STATUSES.find((s) => s.id === status)!;
  const accent = toneBannerCls(meta.tone);
  const reduce = useReducedMotion();

  const body: React.ReactNode = (() => {
    switch (status) {
      case "active":
        return (
          <ActiveBanner accent={accent} meta={meta} />
        );
      case "trialing":
        return (
          <TrialingBanner accent={accent} meta={meta} />
        );
      case "past_due":
        return (
          <PastDueBanner accent={accent} meta={meta} />
        );
      case "canceled":
        return (
          <CanceledBanner accent={accent} meta={meta} />
        );
      case "unpaid":
        return (
          <UnpaidBanner accent={accent} meta={meta} />
        );
      case "incomplete":
        return (
          <IncompleteBanner accent={accent} meta={meta} />
        );
    }
  })();

  return (
    <motion.div
      key={status}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {body}
    </motion.div>
  );
}

function BannerShell({
  accent,
  meta,
  children,
  actions,
  title,
  subtitle,
  icon: Icon,
}: {
  accent: ReturnType<typeof toneBannerCls>;
  meta: StatusMeta;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <div className={cn("rounded-2xl border p-5 flex flex-col gap-4 min-w-0", accent.border, accent.bg)}>
      <div className="flex items-start gap-3 min-w-0">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border", accent.border, accent.bg)}>
          <Icon className={cn("h-5 w-5", accent.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("h-2 w-2 rounded-full", accent.dot)} />
            <h3 className="font-display text-base sm:text-lg leading-tight">{title}</h3>
            <Badge
              variant="outline"
              className={cn("text-[10px] uppercase tracking-wider font-mono", accent.border, accent.text)}
            >
              {meta.short}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{subtitle}</p>
        </div>
      </div>
      {children}
      {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
    </div>
  );
}

function ActiveBanner({
  accent,
  meta,
}: {
  accent: ReturnType<typeof toneBannerCls>;
  meta: StatusMeta;
}) {
  const { toast } = useToast();
  return (
    <BannerShell
      accent={accent}
      meta={meta}
      icon={CircleCheck}
      title="Suscripción activa"
      subtitle="Próxima renovación: 15 ago 2025 · Plan Professional · 99€/mes"
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="min-h-9"
            onClick={() =>
              toast({
                title: "Gestionar suscripción",
                description: "Abriendo portal de Stripe · Plan Professional activo.",
              })
            }
          >
            <Settings className="h-3.5 w-3.5" /> Gestionar suscripción
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-9"
            onClick={() =>
              toast({
                title: "Facturas descargadas",
                description: "Últimas 12 facturas exportadas en PDF.",
              })
            }
          >
            <FileWarning className="h-3.5 w-3.5" /> Ver facturas
          </Button>
        </>
      }
    >
      <DashboardPreview tone="green" />
    </BannerShell>
  );
}

function TrialingBanner({
  accent,
  meta,
}: {
  accent: ReturnType<typeof toneBannerCls>;
  meta: StatusMeta;
}) {
  const { toast } = useToast();
  return (
    <BannerShell
      accent={accent}
      meta={meta}
      icon={Sparkles}
      title="Periodo de prueba"
      subtitle="7 días restantes · Sin tarjeta configurada · Acceso completo al plan Professional"
      actions={
        <>
          <Button
            size="sm"
            className="min-h-9 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            onClick={() =>
              toast({
                title: "Activar suscripción",
                description: "Redirigiendo a Stripe Checkout · 99€/mes tras el trial.",
              })
            }
          >
            <CreditCard className="h-3.5 w-3.5" /> Activar suscripción
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-9"
            onClick={() =>
              toast({
                title: "Recordatorio programado",
                description: "Te avisaremos 2 días antes del fin del trial.",
              })
            }
          >
            <Clock className="h-3.5 w-3.5" /> Recordármelo después
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-2">
        <TrialStat label="Días restantes" value="7" />
        <TrialStat label="Datos generados" value="847" />
        <TrialStat label="Funciones probadas" value="23/36" />
      </div>
    </BannerShell>
  );
}

function TrialStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-foreground/[0.03] p-2.5 text-center min-w-0">
      <div className="font-display text-lg tabular-nums truncate">{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">{label}</div>
    </div>
  );
}

function PastDueBanner({
  accent,
  meta,
}: {
  accent: ReturnType<typeof toneBannerCls>;
  meta: StatusMeta;
}) {
  const { toast } = useToast();
  return (
    <BannerShell
      accent={accent}
      meta={meta}
      icon={AlertTriangle}
      title="Pago pendiente"
      subtitle="Periodo de gracia: 7 días · La operación crítica sigue disponible mientras tanto"
      actions={
        <>
          <Button
            size="sm"
            className="min-h-9 bg-amber-400 text-black hover:bg-amber-300"
            onClick={() =>
              toast({
                title: "Actualizar método de pago",
                description: "Abriendo formulario de tarjeta · Se reintentará el cobro.",
              })
            }
          >
            <CreditCard className="h-3.5 w-3.5" /> Actualizar método de pago
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-9"
            onClick={() =>
              toast({
                title: "Soporte contactado",
                description: "Un agente revisará tu caso en menos de 4h.",
              })
            }
          >
            <Headphones className="h-3.5 w-3.5" /> Contactar soporte
          </Button>
        </>
      }
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3 flex items-start gap-3">
        <CalendarClock className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="text-amber-300 font-medium">Política anti-punición:</span>{" "}
          aunque el pago esté pendiente, el TPV, KDS y comandero siguen operativos.
          Solo se restringe el acceso a funciones no críticas (exportes, API).
        </div>
      </div>
    </BannerShell>
  );
}

function CanceledBanner({
  accent,
  meta,
}: {
  accent: ReturnType<typeof toneBannerCls>;
  meta: StatusMeta;
}) {
  const { toast } = useToast();
  return (
    <BannerShell
      accent={accent}
      meta={meta}
      icon={CircleX}
      title="Suscripción cancelada"
      subtitle="Datos conservados 90 días · Reactiva antes del 13 nov 2025 para no perderlos"
      actions={
        <>
          <Button
            size="sm"
            className="min-h-9 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            onClick={() =>
              toast({
                title: "Reactivar suscripción",
                description: "Plan Professional · 99€/mes · Datos 100% conservados.",
              })
            }
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reactivar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-9"
            onClick={() =>
              toast({
                title: "Exportación solicitada",
                description: "Generando ZIP con todos tus datos · Llegará por email en 24h.",
              })
            }
          >
            <Inbox className="h-3.5 w-3.5" /> Exportar mis datos
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-2">
        <CountdownStat label="Días para reactivar" value="78" tone="amber" />
        <CountdownStat label="Locales afectados" value="3" tone="muted" />
        <CountdownStat label="Clientes CRM" value="1.247" tone="muted" />
      </div>
    </BannerShell>
  );
}

function CountdownStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "amber" | "muted";
}) {
  const cls = tone === "amber" ? "text-amber-300" : "text-foreground";
  return (
    <div className="rounded-lg border border-border/40 bg-foreground/[0.03] p-2.5 text-center min-w-0">
      <div className={cn("font-display text-lg tabular-nums truncate", cls)}>{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">{label}</div>
    </div>
  );
}

function UnpaidBanner({
  accent,
  meta,
}: {
  accent: ReturnType<typeof toneBannerCls>;
  meta: StatusMeta;
}) {
  const { toast } = useToast();
  return (
    <BannerShell
      accent={accent}
      meta={meta}
      icon={Lock}
      title="Acceso restringido"
      subtitle="El periodo de gracia ha finalizado · Solo puedes seguir cobrando y comandando (B.5)"
      actions={
        <>
          <Button
            size="sm"
            className="min-h-9 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            onClick={() =>
              toast({
                title: "Contactar soporte",
                description: "Un agente te llamará para reactivar tu suscripción.",
              })
            }
          >
            <Headphones className="h-3.5 w-3.5" /> Contactar soporte
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-9"
            onClick={() =>
              toast({
                title: "Liquidar deuda",
                description: "Abriendo Stripe · Pago pendiente: 99€ + 7 días de gracia.",
              })
            }
          >
            <CreditCard className="h-3.5 w-3.5" /> Liquidar deuda
          </Button>
        </>
      }
    >
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-3 flex items-start gap-3">
        <ShieldAlert className="h-4 w-4 text-rose-300 shrink-0 mt-0.5" />
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="text-rose-300 font-medium">Política B.5 — operación nunca se bloquea:</span>{" "}
          aunque la suscripción esté impagada, puedes seguir cobrando y comandando.
          Se restringe: exports, informes, CRM, automatizaciones, API.
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <AccessTile label="TPV / KDS / Comandero" allowed />
        <AccessTile label="Reservas / Carta QR" allowed />
        <AccessTile label="Exports / Informes" />
        <AccessTile label="CRM / Automatizaciones / API" />
      </div>
    </BannerShell>
  );
}

function AccessTile({ label, allowed = false }: { label: string; allowed?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5 flex items-center gap-2 min-w-0",
        allowed
          ? "border-emerald-500/30 bg-emerald-500/[0.06]"
          : "border-rose-500/30 bg-rose-500/[0.06]"
      )}
    >
      {allowed ? (
        <Check className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
      ) : (
        <Ban className="h-3.5 w-3.5 text-rose-300 shrink-0" />
      )}
      <span className="text-[11px] text-foreground/90 truncate">{label}</span>
    </div>
  );
}

function IncompleteBanner({
  accent,
  meta,
}: {
  accent: ReturnType<typeof toneBannerCls>;
  meta: StatusMeta;
}) {
  const { toast } = useToast();
  return (
    <BannerShell
      accent={accent}
      meta={meta}
      icon={Settings}
      title="Configuración incompleta"
      subtitle="Falta configurar el método de pago para terminar el onboarding"
      actions={
        <Button
          size="sm"
          className="min-h-9 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          onClick={() =>
            toast({
              title: "Completar configuración",
              description: "Continuando onboarding · Paso 7 de 8 · Configurar pago.",
            })
          }
        >
          <Check className="h-3.5 w-3.5" /> Completar configuración
        </Button>
      }
    >
      <div className="space-y-1.5">
        {[
          { label: "Datos del restaurante", done: true },
          { label: "Plano de mesas", done: true },
          { label: "Catálogo / carta QR", done: true },
          { label: "Roles de equipo", done: true },
          { label: "Método de pago", done: false },
          { label: "Confirmar y publicar", done: false },
        ].map((step) => (
          <div
            key={step.label}
            className="flex items-center gap-2 text-[12px]"
          >
            {step.done ? (
              <Check className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
            ) : (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-foreground/30 shrink-0" />
            )}
            <span className={cn(step.done ? "text-muted-foreground line-through" : "text-foreground")}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </BannerShell>
  );
}

function DashboardPreview({ tone }: { tone: "green" | "blue" }) {
  void tone;
  return (
    <div className="rounded-xl border border-border/40 bg-foreground/[0.02] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border/40 bg-foreground/[0.03]">
        <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
        <span className="h-2 w-2 rounded-full bg-amber-400/60" />
        <span className="h-2 w-2 rounded-full bg-rose-400/60" />
        <span className="ml-2 text-[10px] font-mono text-muted-foreground">restopanel.app/dashboard</span>
      </div>
      <div className="p-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-foreground/[0.04] p-2 col-span-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Ventas hoy</div>
          <div className="font-display text-base tabular-nums text-[var(--gold-soft)]">2.847€</div>
        </div>
        <div className="rounded-lg bg-foreground/[0.04] p-2 col-span-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Reservas</div>
          <div className="font-display text-base tabular-nums text-[var(--teal)]">38</div>
        </div>
        <div className="rounded-lg bg-foreground/[0.04] p-2 col-span-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Tickets</div>
          <div className="font-display text-base tabular-nums">147</div>
        </div>
        <div className="rounded-lg bg-foreground/[0.04] p-2 col-span-3 h-16 flex items-end gap-1">
          {[40, 65, 50, 80, 70, 95, 60, 75, 88, 70, 92, 85, 78, 65].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-[var(--gold)]/40"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Security panel
 * =======================================================*/

function SecurityPanel() {
  const [strictMode, setStrictMode] = React.useState(true);
  const { toast } = useToast();
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-3 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-[var(--gold)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Defensa en profundidad.</span>{" "}
          La verificación ocurre en <span className="font-mono text-[var(--gold-soft)]">middleware.ts</span>{" "}
          (拦截 cada request), <span className="font-mono text-[var(--gold-soft)]">API route</span>{" "}
          (re-check antes de mutar) y <span className="font-mono text-[var(--gold-soft)]">UI</span> (ocultar).
          Nunca se confía en el cliente.
        </div>
      </div>
      <CodeBlock code={MIDDLEWARE_SNIPPET} label="middleware.ts" icon={Server} />
      <CodeBlock code={API_ROUTE_SNIPPET} label="app/api/entitlements/route.ts" icon={KeyRound} />
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 p-3">
        <div className="min-w-0">
          <div className="text-sm font-medium flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[var(--gold)]" />
            Modo estricto (sin gracia)
          </div>
          <div className="text-[11px] text-muted-foreground">
            past_due bloquea todo inmediatamente · solo activable por Super Admin
          </div>
        </div>
        <Switch
          checked={strictMode}
          onCheckedChange={(v) => {
            setStrictMode(v);
            toast({
              title: v ? "Modo estricto activado" : "Modo estricto desactivado",
              description: v
                ? "El periodo de gracia se omite en past_due."
                : "Se aplica política B.5 · operación crítica permitida.",
            });
          }}
          aria-label="Modo estricto"
        />
      </div>
    </div>
  );
}

/* =========================================================
 * Multi-tenant isolation panel
 * =======================================================*/

function MultiTenantPanel() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-3 flex items-start gap-3">
        <Building2 className="h-4 w-4 text-[var(--teal)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Aislamiento multi-tenant por diseño.</span>{" "}
          Toda query del ORM filtra por{" "}
          <code className="font-mono text-[var(--teal)]">organization_id</code>. El filtro se
          inyecta vía middleware y no puede omitirse desde el handler. Una query "global"
          es imposible sin escalar privilegios a Super Admin.
        </div>
      </div>
      <CodeBlock code={QUERY_SNIPPET} label="lib/db/queries.ts" icon={Database} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <IsolationTile
          label="RLS activa"
          value="Postgres"
          desc="Row-level security por organization_id en cada tabla"
        />
        <IsolationTile
          label="Filtro obligatorio"
          value="ORM"
          desc="Throws si where.organization_id falta"
        />
        <IsolationTile
          label="Auditoría"
          value="100%"
          desc="Cada query logueada con org_id + user_id"
        />
      </div>
    </div>
  );
}

function IsolationTile({ label, value, desc }: { label: string; value: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-foreground/[0.03] p-3 min-w-0">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-base text-[var(--teal)] mt-0.5">{value}</div>
      <div className="text-[11px] text-muted-foreground leading-snug mt-1">{desc}</div>
    </div>
  );
}

/* =========================================================
 * Plan gate preview (404 not 403)
 * =======================================================*/

function PlanGatePreview() {
  const [feature, setFeature] = React.useState<"delivery" | "api" | "multi">("delivery");
  const { toast } = useToast();

  const scenarios: Record<typeof feature, { route: string; feature: string; plan: string; reason: string }> = {
    delivery: {
      route: "/delivery",
      feature: "delivery.own_channel",
      plan: "Starter",
      reason: "No disponible en plan Starter",
    },
    api: {
      route: "/api/v1/orders",
      feature: "api.write",
      plan: "Professional",
      reason: "Solo Enterprise tiene API escritura",
    },
    multi: {
      route: "/multi-local",
      feature: "gov.multi_local",
      plan: "Professional",
      reason: "Solo Enterprise tiene multi-local consolidado",
    },
  };

  const scenario = scenarios[feature];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-3 flex items-start gap-3">
        <Eye className="h-4 w-4 text-[var(--gold)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">404, no 403.</span>{" "}
          Si una feature no está en el plan, la ruta devuelve{" "}
          <code className="font-mono text-[var(--gold-soft)]">404 Not Found</code> en
          lugar de <code className="font-mono">403 Forbidden</code>. Así no revelamos
          que la ruta existe — parece que nunca se construyó.
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["delivery", "api", "multi"] as const).map((k) => (
          <Button
            key={k}
            variant={feature === k ? "default" : "outline"}
            size="sm"
            className={cn(
              "min-h-9",
              feature === k && "bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            )}
            onClick={() => setFeature(k)}
          >
            {scenarios[k].route}
          </Button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/40 overflow-hidden">
        {/* Mock browser */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/40 bg-foreground/[0.03]">
          <span className="h-2 w-2 rounded-full bg-rose-400/60" />
          <span className="h-2 w-2 rounded-full bg-amber-400/60" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
          <span className="ml-2 text-[10px] font-mono text-muted-foreground truncate flex-1">
            restopanel.app{scenario.route}
          </span>
          <Badge className="border-rose-500/40 bg-rose-500/10 text-rose-300 text-[10px] uppercase tracking-wider font-mono">
            404
          </Badge>
        </div>
        <div className="p-6 sm:p-8 text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-rose-500/10 items-center justify-center mb-3">
            <CircleX className="h-7 w-7 text-rose-300" />
          </div>
          <div className="font-display text-3xl text-rose-300 tabular-nums">404</div>
          <div className="text-sm text-muted-foreground mt-1">
            Página no encontrada
          </div>
          <div className="text-[11px] text-muted-foreground/70 mt-1 font-mono">
            GET {scenario.route} · {scenario.reason}
          </div>
        </div>
      </div>

      <CodeBlock code={PLAN_GATE_SNIPPET} label="app/delivery/route.ts" icon={FileWarning} />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="min-h-9"
          onClick={() =>
            toast({
              title: "Upsell mostrado al usuario",
              description: "CTA contextual: 'Mejorar a Professional · +50€/mes'",
            })
          }
        >
          <ArrowUpRight className="h-3.5 w-3.5" /> Ver upsell contextual
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-9"
          onClick={() =>
            toast({
              title: "Logs de acceso",
              description: "12 intentos a /delivery en últimas 24h · todos 404.",
            })
          }
        >
          <Terminal className="h-3.5 w-3.5" /> Ver logs de acceso
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/

export function AccessGateView() {
  const { toast } = useToast();
  const [status, setStatus] = React.useState<SubscriptionStatus>("active");

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">
              Gate de Acceso
            </h1>
            <DemoBadge />
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Fase 3 · Pantallas según estado de suscripción + verificación en servidor +
            aislamiento multi-tenant + plan gate (404, no 403).
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Documentación abierta",
                description: "Spec B.5 · Política anti-punición en operación crítica.",
              })
            }
            className="min-h-11"
          >
            <ShieldAlert className="h-4 w-4" />
            <span className="hidden sm:inline">Política B.5</span>
            <span className="sm:hidden">B.5</span>
          </Button>
          <Button
            onClick={() =>
              toast({
                title: "Test E2E ejecutado",
                description: "23 escenarios de gate cubiertos · 0 fugas de acceso.",
              })
            }
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] min-h-11"
          >
            <ShieldCheck className="h-4 w-4" /> Ejecutar test
          </Button>
        </div>
      </header>

      {/* Status selector + banner */}
      <SectionCard
        title="Simulador de estados"
        desc="Cambia el estado de suscripción y observa la pantalla que vería el usuario"
        icon={ShieldCheck}
        action={
          <Select value={status} onValueChange={(v) => setStatus(v as SubscriptionStatus)}>
            <SelectTrigger className="min-h-9 w-[180px]" aria-label="Estado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        toneBannerCls(s.tone).dot
                      )}
                    />
                    {s.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        <div className="space-y-4">
          {/* Status pills overview */}
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => {
              const accent = toneBannerCls(s.tone);
              const active = s.id === status;
              return (
                <button
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors min-h-7",
                    active
                      ? cn(accent.border, accent.bg, accent.text)
                      : "border-border/40 text-muted-foreground hover:bg-foreground/[0.04]"
                  )}
                  aria-pressed={active}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", accent.dot)} />
                  {s.short}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <StatusBanner status={status} />
          </AnimatePresence>

          <div className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
            <Lightbulb className="h-3.5 w-3.5 text-[var(--gold)] shrink-0 mt-0.5" />
            <span>
              <span className="text-foreground font-medium">Política anti-punición (B.5):</span>{" "}
              unpaid solo restringe funciones no críticas. TPV, KDS y comandero siguen
              operativos para que el restaurante nunca pierda una venta por un problema de cobro.
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Security + multi-tenant (2 col on lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Verificación en servidor"
          desc="middleware.ts + API route · defensa en profundidad"
          icon={Server}
        >
          <SecurityPanel />
        </SectionCard>

        <SectionCard
          title="Aislamiento multi-tenant"
          desc="Toda query filtra por organization_id"
          icon={Building2}
        >
          <MultiTenantPanel />
        </SectionCard>
      </div>

      {/* Plan gate preview (404 not 403) */}
      <SectionCard
        title="Plan gate · 404 no 403"
        desc="Feature fuera del plan → la ruta no existe, no está prohibida"
        icon={Eye}
        action={
          <Badge
            variant="outline"
            className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] uppercase tracking-wider font-mono"
          >
            Política F.3
          </Badge>
        }
      >
        <PlanGatePreview />
      </SectionCard>

      {/* Lifecycle table */}
      <SectionCard
        title="Resumen de comportamiento por estado"
        desc="Qué se permite y qué se bloquea en cada estado"
        icon={CircleAlert}
      >
        <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3 font-normal">Estado</th>
                <th className="py-2 px-2 font-normal text-center">TPV/KDS</th>
                <th className="py-2 px-2 font-normal text-center">Reservas</th>
                <th className="py-2 px-2 font-normal text-center">Exports</th>
                <th className="py-2 px-2 font-normal text-center">CRM/Auto</th>
                <th className="py-2 pl-2 font-normal text-center">API</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "active" as const, label: "Activa", tone: "green" as const, vals: [true, true, true, true, true] },
                { id: "trialing" as const, label: "Trialing", tone: "blue" as const, vals: [true, true, true, true, true] },
                { id: "past_due" as const, label: "Past due", tone: "amber" as const, vals: [true, true, true, true, false] },
                { id: "canceled" as const, label: "Cancelada", tone: "red" as const, vals: [true, true, false, false, false] },
                { id: "unpaid" as const, label: "Impagada", tone: "red" as const, vals: [true, true, false, false, false] },
                { id: "incomplete" as const, label: "Incompleta", tone: "muted" as const, vals: [false, false, false, false, false] },
              ].map((row) => {
                const accent = toneBannerCls(row.tone);
                return (
                  <tr
                    key={row.id}
                    className="border-t border-border/30 hover:bg-foreground/[0.02]"
                  >
                    <td className="py-2 pr-3">
                      <span className="flex items-center gap-2">
                        <span className={cn("h-1.5 w-1.5 rounded-full", accent.dot)} />
                        <span className="font-medium">{row.label}</span>
                      </span>
                    </td>
                    {row.vals.map((v, i) => (
                      <td key={i} className="py-2 px-2 text-center">
                        {v ? (
                          <Check className="inline h-3.5 w-3.5 text-emerald-300" />
                        ) : (
                          <X className="inline h-3.5 w-3.5 text-rose-300/70" />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Footer note */}
      <div className="rp-glass rounded-2xl p-4 flex items-start gap-3">
        <Crown className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
        <div className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Dato demo:</span> esta vista
          reproduce el comportamiento del gate para los 6 estados de Stripe. En
          producción, el estado se lee en{" "}
          <code className="font-mono text-foreground/80">subscriptions.status</code> y
          se cachea en sesión durante 5 min. El middleware revalida contra Stripe
          cada hora y tras cada webhook <code className="font-mono text-foreground/80">customer.subscription.updated</code>.
        </div>
      </div>
    </div>
  );
}

export default AccessGateView;
