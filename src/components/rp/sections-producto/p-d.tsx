"use client";

import * as React from "react";
import {
  Section,
  Tag,
  Risk,
  GlassCard,
  Stat,
  Pill,
  H3,
  Lead,
  DataTable,
  GoldList,
  KV,
  Callout,
} from "@/components/rp/primitives";
import {
  Users,
  Star,
  Crown,
  Clock,
  Mail,
  Phone,
  Calendar,
  Gift,
  AlertTriangle,
  Filter,
  Send,
  Check,
  X,
  Zap,
  GitBranch,
  Hourglass,
  MousePointerClick,
  Play,
  Pause,
  Copy,
  Sparkles,
  MessageSquare,
  TrendingUp,
  ThumbsUp,
  ChevronRight,
} from "lucide-react";

const DEMO_BADGE = (
  <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
    demo
  </span>
);

function Mono({ children, tone = "gold" }: { children: React.ReactNode; tone?: "gold" | "teal" | "muted" }) {
  const c =
    tone === "gold"
      ? "text-[var(--gold-soft)]"
      : tone === "teal"
      ? "text-[var(--teal)]"
      : "text-muted-foreground";
  return <code className={"font-mono text-[0.82em] " + c}>{children}</code>;
}

/* ============================================================
   1. PRODUCTO CRM — interactive customer profile preview
   ============================================================ */

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  vip: boolean;
  risk: "bajo" | "medio" | "alto";
  ltv: string;
  consent: { email: boolean; whatsapp: boolean };
  allergies: string[];
  favoriteTable: string;
  tags: string[];
  source: string;
  notes: string;
  history: { date: string; service: string; party: number; ticket: string }[];
};

const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Elena Marín",
    email: "elena.marin@example.com",
    phone: "+34 6•• ••• 142",
    visits: 42,
    vip: true,
    risk: "bajo",
    ltv: "€4.820",
    consent: { email: true, whatsapp: true },
    allergies: ["Frutos secos"],
    favoriteTable: "Mesa 12 (ventana)",
    tags: ["VIP", "Recurrente", "Cumpleaños este mes"],
    source: "Reserva web",
    notes: "Prefiere vino tinto. Cena habitual los viernes 21:30.",
    history: [
      { date: "2024-11-22", service: "Cena", party: 2, ticket: "€118" },
      { date: "2024-11-08", service: "Cena", party: 4, ticket: "€265" },
      { date: "2024-10-25", service: "Cena", party: 2, ticket: "€132" },
      { date: "2024-10-11", service: "Comida", party: 3, ticket: "€98" },
    ],
  },
  {
    id: "c2",
    name: "Javier Soler",
    email: "j.soler@example.com",
    phone: "+34 6•• ••• 308",
    visits: 18,
    vip: false,
    risk: "medio",
    ltv: "€1.640",
    consent: { email: true, whatsapp: false },
    allergies: [],
    favoriteTable: "Barra (puestos 3-4)",
    tags: ["Recurrente"],
    source: "Walk-in",
    notes: "Suele pedir menú degustación para 2. No acepta WhatsApp.",
    history: [
      { date: "2024-11-15", service: "Cena", party: 2, ticket: "€148" },
      { date: "2024-10-30", service: "Cena", party: 2, ticket: "€132" },
      { date: "2024-09-12", service: "Cena", party: 2, ticket: "€156" },
    ],
  },
  {
    id: "c3",
    name: "Marta Iborra",
    email: "marta.iborra@example.com",
    phone: "+34 6•• ••• 591",
    visits: 7,
    vip: false,
    risk: "alto",
    ltv: "€612",
    consent: { email: true, whatsapp: true },
    allergies: ["Gluten", "Lactosa"],
    favoriteTable: "Terraza (mesa 21)",
    tags: ["Riesgo no-show"],
    source: "Google",
    notes: "No acudió a la reserva del 18/11. Reconfirmar siempre T-2h.",
    history: [
      { date: "2024-11-18", service: "Cena", party: 4, ticket: "No-show" },
      { date: "2024-10-04", service: "Comida", party: 3, ticket: "€72" },
      { date: "2024-08-21", service: "Cena", party: 2, ticket: "€94" },
    ],
  },
  {
    id: "c4",
    name: "David Puig",
    email: "d.puig@example.com",
    phone: "+34 6•• ••• 720",
    visits: 91,
    vip: true,
    risk: "bajo",
    ltv: "€11.340",
    consent: { email: true, whatsapp: true },
    allergies: ["Marisco"],
    favoriteTable: "Mesa 5 (privado)",
    tags: ["VIP", "Recurrente", "Cumpleaños este mes"],
    source: "Referido",
    notes: "Cliente desde 2021. Aniversario con su pareja el 27/12.",
    history: [
      { date: "2024-11-29", service: "Cena", party: 2, ticket: "€210" },
      { date: "2024-11-14", service: "Cena", party: 6, ticket: "€488" },
      { date: "2024-10-31", service: "Cena", party: 2, ticket: "€198" },
      { date: "2024-10-12", service: "Comida", party: 4, ticket: "€244" },
    ],
  },
  {
    id: "c5",
    name: "Lucía Ferrer",
    email: "lucia.ferrer@example.com",
    phone: "+34 6•• ••• 045",
    visits: 3,
    vip: false,
    risk: "medio",
    ltv: "€214",
    consent: { email: true, whatsapp: false },
    allergies: [],
    favoriteTable: "—",
    tags: ["Nuevo"],
    source: "Instagram",
    notes: "Tres visitas en 60 días. Candidata a campaña de fidelización.",
    history: [
      { date: "2024-11-20", service: "Cena", party: 2, ticket: "€88" },
      { date: "2024-10-19", service: "Cena", party: 3, ticket: "€74" },
      { date: "2024-09-27", service: "Cena", party: 2, ticket: "€52" },
    ],
  },
  {
    id: "c6",
    name: "Andrés Vidal",
    email: "andres.vidal@example.com",
    phone: "+34 6•• ••• 833",
    visits: 0,
    vip: false,
    risk: "alto",
    ltv: "€0",
    consent: { email: true, whatsapp: false },
    allergies: [],
    favoriteTable: "—",
    tags: ["Inactivo 90d"],
    source: "Reserva web",
    notes: "Sin actividad en 96 días. Incluido en campaña de recuperación.",
    history: [
      { date: "2024-08-15", service: "Cena", party: 2, ticket: "€110" },
      { date: "2024-07-04", service: "Cena", party: 4, ticket: "€228" },
      { date: "2024-05-30", service: "Comida", party: 2, ticket: "€94" },
    ],
  },
];

const SEGMENTS = [
  { id: "s1", name: "VIP", count: 12, tone: "gold" as const, icon: Crown },
  { id: "s2", name: "Inactivos 90d", count: 184, tone: "default" as const, icon: Clock },
  { id: "s3", name: "Cumpleaños este mes", count: 37, tone: "teal" as const, icon: Gift },
  { id: "s4", name: "Riesgo no-show", count: 9, tone: "default" as const, icon: AlertTriangle },
];

const CAMPAIGNS = [
  { id: "ca1", name: "Cumpleaños diciembre", audience: "Cumpleaños este mes (37)", status: "Activa", ctr: "18,4%", tone: "gold" as const },
  { id: "ca2", name: "Recuperación inactivos", audience: "Inactivos 90d (184)", status: "Borrador", ctr: "—", tone: "default" as const },
  { id: "ca3", name: "VIP · Menú degustación", audience: "VIP (12)", status: "Programada", ctr: "—", tone: "teal" as const },
];

const CRM_DATA_ROWS: React.ReactNode[][] = [
  [<span key="c-nombre">nombre</span>, "Identidad del cliente", <Risk key="r-nombre" level="bajo" />],
  [<span key="c-email">email</span>, "Canal de contacto y login", <Risk key="r-email" level="alto" />],
  [<span key="c-phone">phone</span>, <span key="d-phone">PII alta — teléfono</span>, <Risk key="r-phone" level="alto" />],
  [<span key="c-visitas">visitas</span>, "Contador acumulado de servicios", <Risk key="r-visitas" level="medio" />],
  [<span key="c-frecuencia">frecuencia</span>, "Cadencia media entre visitas", <Risk key="r-frecuencia" level="medio" />],
  [<span key="c-ticket">ticket medio</span>, "Valor medio por servicio", <Risk key="r-ticket" level="medio" />],
  [<span key="c-alergias">alergias</span>, "Seguridad alimentaria del cliente", <Risk key="r-alergias" level="medio" />],
  [<span key="c-pref">preferencias</span>, "Mesa favorita, platos, vino", <Risk key="r-pref" level="medio" />],
  [<span key="c-cump">cumpleaños</span>, "Filtro de campañas estacionales", <Risk key="r-cump" level="bajo" />],
  [<span key="c-tags">tags</span>, "Segmentación operativa", <Risk key="r-tags" level="bajo" />],
  [<span key="c-seg">segmentos</span>, "Pertenencia calculada dinámicamente", <Risk key="r-seg" level="bajo" />],
  [<span key="c-cons">consentimientos</span>, <span key="d-cons">Alto — requisitos legales RGPD</span>, <Risk key="r-cons" level="alto" />],
  [<span key="c-notas">notas internas</span>, "Contexto operativo del equipo", <Risk key="r-notas" level="medio" />],
  [<span key="c-fuente">fuente adquisición</span>, "Origen del cliente (web, referido)", <Risk key="r-fuente" level="bajo" />],
  [<span key="c-ltv">lifetime_value</span>, "Valor acumulado histórico", <Risk key="r-ltv" level="medio" />],
];

export function ProductoCRM() {
  const [selectedId, setSelectedId] = React.useState<string>(CUSTOMERS[0].id);
  const customer = CUSTOMERS.find((c) => c.id === selectedId) ?? CUSTOMERS[0];

  return (
    <Section
      id="p-crm"
      index="12"
      eyebrow="CRM y marketing"
      title="Memoria del cliente, segmentos y campañas."
      intro={
        <>
          El CRM de RestoPanel recuerda lo que importa: historial de visitas, frecuencia,
          ticket medio, preferencias, alergias, cumpleaños, tags, segmentos dinámicos, clientes
          VIP, programa de fidelización, consentimientos por canal, notas internas y fuente de
          adquisición. Cada cliente es accionable — no un registro muerto, sino un perfil que
          alimenta automatizaciones, campañas y decisiones de sala.
        </>
      }
    >
      {/* Interactive CRM preview */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <H3>Perfil de cliente — vista previa</H3>
          {DEMO_BADGE}
        </div>
        <Lead>
          Selecciona un cliente de la lista para ver su perfil completo: contacto, historial,
          preferencias, tags, consentimientos y notas internas. Los datos son de demostración.
        </Lead>

        <div className="mt-5 grid lg:grid-cols-[320px_1fr] gap-4">
          {/* Customer list */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-[var(--gold)]" />
                Clientes
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">{CUSTOMERS.length} · demo</span>
            </div>
            <ul className="max-h-[480px] overflow-y-auto rp-scroll-thin">
              {CUSTOMERS.map((c) => {
                const active = c.id === selectedId;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelectedId(c.id)}
                      className={
                        "w-full text-left px-4 py-3 border-b border-border/30 last:border-0 transition-colors " +
                        (active
                          ? "bg-[var(--gold)]/10 border-l-2 border-l-[var(--gold)]"
                          : "hover:bg-foreground/[0.04]")
                      }
                      aria-pressed={active}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={"text-sm font-medium " + (active ? "rp-gold-text" : "text-foreground")}>
                          {c.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {c.vip ? (
                            <span className="inline-flex items-center gap-1 rounded border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                              <Crown className="h-2.5 w-2.5" />VIP
                            </span>
                          ) : null}
                          <span
                            className={
                              "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider " +
                              (c.risk === "bajo"
                                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                                : c.risk === "medio"
                                ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                                : "border-destructive/50 bg-destructive/10 text-destructive")
                            }
                          >
                            {c.risk}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                        <span>{c.visits} visitas</span>
                        <span>LTV {c.ltv}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </GlassCard>

          {/* Detail panel */}
          <GlassCard variant="gold" className="p-0 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-full bg-[var(--gold)]/15 border border-[var(--gold)]/40 font-display text-lg rp-gold-text">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <div className="font-display text-xl">{customer.name}</div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    cliente_id: <Mono>{customer.id}</Mono> · {customer.source}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {DEMO_BADGE}
                {customer.vip ? (
                  <Pill tone="gold">
                    <Crown className="h-3 w-3" /> VIP
                  </Pill>
                ) : null}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 px-5 py-4">
              <dl>
                <KV
                  k="Contacto"
                  v={
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  }
                />
                <KV
                  k="Lifetime value"
                  v={
                    <span className="font-display text-lg rp-gold-text">{customer.ltv}</span>
                  }
                />
                <KV k="Visitas totales" v={<Mono tone="gold">{customer.visits}</Mono>} />
                <KV k="Mesa favorita" v={customer.favoriteTable} />
                <KV
                  k="Alergias"
                  v={
                    customer.allergies.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {customer.allergies.map((a) => (
                          <span
                            key={a}
                            className="inline-flex items-center gap-1 rounded border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-amber-300"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin alergias registradas</span>
                    )
                  }
                />
                <KV
                  k="Consentimientos"
                  v={
                    <div className="flex flex-wrap gap-2">
                      <ConsentBadge channel="email" ok={customer.consent.email} />
                      <ConsentBadge channel="whatsapp" ok={customer.consent.whatsapp} />
                    </div>
                  }
                />
              </dl>

              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Historial de visitas
                  </div>
                  <div className="rp-glass rounded-lg p-3 space-y-2">
                    {customer.history.map((h, i) => (
                      <div
                        key={`${h.date}-${i}`}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono">{h.date}</span>
                          <span className="text-muted-foreground">·</span>
                          <span>{h.service}</span>
                          <span className="text-muted-foreground">·</span>
                          <span>{h.party}pax</span>
                        </div>
                        <span
                          className={
                            "font-mono " +
                            (h.ticket === "No-show" ? "text-destructive" : "rp-gold-text")
                          }
                        >
                          {h.ticket}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {customer.tags.map((t) => (
                      <Pill
                        key={t}
                        tone={
                          t === "VIP"
                            ? "gold"
                            : t === "Cumpleaños este mes"
                            ? "teal"
                            : t === "Riesgo no-show" || t === "Inactivo 90d"
                            ? "default"
                            : "outline"
                        }
                      >
                        {t}
                      </Pill>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Notas internas
                  </div>
                  <div className="rp-glass rounded-lg p-3 text-sm text-foreground/85 leading-relaxed">
                    {customer.notes}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Segments + Campaigns mini-sections */}
      <div className="grid lg:grid-cols-2 gap-4 mb-10">
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--teal)]" />
              <H3>Segmentos</H3>
            </div>
            {DEMO_BADGE}
          </div>
          <Lead>
            Filtros dinámicos evaluados con <Mono>org_id</Mono> forzado. Cada segmento calcula su
            membresía al vuelo a partir de eventos recientes.
          </Lead>
          <ul className="mt-4 space-y-2">
            {SEGMENTS.map((s) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-foreground/[0.02] px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={
                        "h-4 w-4 " +
                        (s.tone === "gold"
                          ? "text-[var(--gold)]"
                          : s.tone === "teal"
                          ? "text-[var(--teal)]"
                          : "text-muted-foreground")
                      }
                    />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm rp-gold-text">{s.count}</span>
                    <button className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-[var(--gold)] transition-colors">
                      ver →
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-[var(--gold)]" />
              <H3>Campañas</H3>
            </div>
            {DEMO_BADGE}
          </div>
          <Lead>
            Respetan consentimiento, horario silencioso y cuota por plan. CTR demostrativo para
            campañas ya ejecutadas.
          </Lead>
          <ul className="mt-4 space-y-2">
            {CAMPAIGNS.map((ca) => (
              <li
                key={ca.id}
                className="rounded-lg border border-border/40 bg-foreground/[0.02] px-3 py-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{ca.name}</span>
                  <Pill
                    tone={
                      ca.status === "Activa"
                        ? "gold"
                        : ca.status === "Programada"
                        ? "teal"
                        : "default"
                    }
                  >
                    {ca.status}
                  </Pill>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>audiencia: {ca.audience}</span>
                  <span>
                    CTR <span className="rp-gold-text">{ca.ctr}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* DataTable */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <H3>Datos del CRM</H3>
        </div>
        <DataTable
          head={["Campo", "Propósito", "Sensible"]}
          rows={CRM_DATA_ROWS}
        />
      </div>

      {/* Reglas de CRM + Callout */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard variant="gold">
          <H3>Reglas de CRM</H3>
          <Lead className="mt-1">No negociables. Aplican a todo el ciclo del cliente.</Lead>
          <div className="mt-4">
            <GoldList
              items={[
                <span key="crm-r1"><Mono>consentimiento</Mono> capturado y versionado por canal y finalidad (RGPD).</span>,
                <span key="crm-r2">Segmentos siempre evaluados con <Mono>org_id</Mono> forzado en la query.</span>,
                <span key="crm-r3">Campañas respetan consentimiento + horario silencioso (22:00–09:00) + cuota por plan.</span>,
                <span key="crm-r4">Exportación requiere permiso <Mono>crm.export</Mono> y audita quién, qué, cuándo.</span>,
                <span key="crm-r5">VIP y riesgo se alimentan de eventos: recurrencia, no-show, ticket medio.</span>,
                <span key="crm-r6">Fusión de clientes sólo con auditoría explícita (que se conserva, quién decide).</span>,
              ]}
            />
          </div>
        </GlassCard>

        <Callout kind="warn" title="Consentimiento obligatorio">
          Nada se envía sin consentimiento válido y vigente. La retirada bloquea los envíos
          inmediatamente, sin periodo de gracia. No se compran listas externas, no se hace spam,
          no se reutiliza un consentimiento de email para WhatsApp. El consentimiento es por canal
          y por finalidad, y su versión queda registrada en el histórico del cliente.
        </Callout>
      </div>
    </Section>
  );
}

function ConsentBadge({ channel, ok }: { channel: string; ok: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider " +
        (ok
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
          : "border-destructive/50 bg-destructive/10 text-destructive")
      }
    >
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {channel}
    </span>
  );
}

/* ============================================================
   2. PRODUCTO AUTOMATIZACIONES — interactive visual builder
   ============================================================ */

type NodeType = "Trigger" | "Condition" | "Action" | "Wait" | "Branch";

type FlowNode = {
  id: string;
  type: NodeType;
  label: string;
  config: string;
};

const NODE_META: Record<
  NodeType,
  { icon: React.ElementType; color: string; border: string; bg: string }
> = {
  Trigger: {
    icon: Zap,
    color: "text-[var(--gold)]",
    border: "border-[var(--gold)]/45",
    bg: "bg-[var(--gold)]/10",
  },
  Condition: {
    icon: GitBranch,
    color: "text-[var(--teal)]",
    border: "border-[var(--teal)]/45",
    bg: "bg-[var(--teal)]/10",
  },
  Action: {
    icon: MousePointerClick,
    color: "text-amber-300",
    border: "border-amber-400/45",
    bg: "bg-amber-400/10",
  },
  Wait: {
    icon: Hourglass,
    color: "text-muted-foreground",
    border: "border-foreground/20",
    bg: "bg-foreground/5",
  },
  Branch: {
    icon: GitBranch,
    color: "text-fuchsia-300",
    border: "border-fuchsia-400/45",
    bg: "bg-fuchsia-400/10",
  },
};

const TEMPLATES: { id: string; name: string; desc: string; nodes: FlowNode[] }[] = [
  {
    id: "t1",
    name: "Recordatorio de reserva",
    desc: "WhatsApp T-24h con confirmación rápida",
    nodes: [
      { id: "n1", type: "Trigger", label: "ReservationCreated", config: "evento: reservation.created" },
      { id: "n2", type: "Wait", label: "Esperar T-24h", config: "delay: -24h antes del servicio" },
      { id: "n3", type: "Action", label: "WhatsApp recordatorio", config: "plantilla: reserva_recordatorio" },
    ],
  },
  {
    id: "t2",
    name: "Reconfirmación",
    desc: "Reconfirmar T-2h, marcar no-show si no responde",
    nodes: [
      { id: "n1", type: "Trigger", label: "ReservationCreated", config: "evento: reservation.created" },
      { id: "n2", type: "Wait", label: "Esperar T-2h", config: "delay: -2h antes del servicio" },
      { id: "n3", type: "Action", label: "WhatsApp reconfirmación", config: "plantilla: reconfirmacion" },
      { id: "n4", type: "Condition", label: "¿Respondió?", config: "if confirmed == false" },
      { id: "n5", type: "Action", label: "Marcar riesgo no-show", config: "tag: riesgo_no_show" },
    ],
  },
  {
    id: "t3",
    name: "Cumpleaños",
    desc: "Cupón automático en el mes del cumpleaños",
    nodes: [
      { id: "n1", type: "Trigger", label: "Cron diario 09:00", config: "cron: 0 9 * * *" },
      { id: "n2", type: "Condition", label: "Cumpleaños este mes", config: "month(birthday) == month(now)" },
      { id: "n3", type: "Action", label: "Email + cupón", config: "plantilla: cumple_coupon_15" },
    ],
  },
  {
    id: "t4",
    name: "Recuperación inactivos",
    desc: "Reactivar clientes sin visitas 90 días",
    nodes: [
      { id: "n1", type: "Trigger", label: "Cron semanal", config: "cron: 0 10 * * 1" },
      { id: "n2", type: "Condition", label: "Inactivo ≥ 90d", config: "last_visit <= now - 90d" },
      { id: "n3", type: "Action", label: "Email reactivación", config: "plantilla: te_echamos_de_menos" },
      { id: "n4", type: "Wait", label: "Esperar 7 días", config: "delay: +7d" },
      { id: "n5", type: "Condition", label: "¿Reservó?", config: "if visits(reciente) == 0" },
      { id: "n6", type: "Action", label: "WhatsApp segundo intento", config: "plantilla: segunda_oportunidad" },
    ],
  },
  {
    id: "t5",
    name: "Solicitud de reseña",
    desc: "Pedir Google Review 24h tras el servicio",
    nodes: [
      { id: "n1", type: "Trigger", label: "ReservationCompleted", config: "evento: reservation.completed" },
      { id: "n2", type: "Wait", label: "Esperar +24h", config: "delay: +24h" },
      { id: "n3", type: "Condition", label: "¿Ticket > €80?", config: "if ticket >= 80" },
      { id: "n4", type: "Action", label: "Email solicitud reseña", config: "plantilla: reseña_google" },
    ],
  },
];

const EXECUTIONS: { id: string; flow: string; status: "success" | "failed" | "pending"; time: string; duration: string }[] = [
  { id: "e1", flow: "Recordatorio de reserva", status: "success", time: "hace 8 min", duration: "1.2s" },
  { id: "e2", flow: "Cumpleaños diciembre", status: "success", time: "hace 1 h", duration: "4.7s" },
  { id: "e3", flow: "Reconfirmación", status: "failed", time: "hace 2 h", duration: "— (timeout)" },
  { id: "e4", flow: "Solicitud de reseña", status: "pending", time: "en cola", duration: "—" },
];

const BUILDER_COMPONENT_ROWS: React.ReactNode[][] = [
  [<span key="cmp-trigger">Trigger</span>, "Evento, horario o condición que inicia el flujo", <Mono key="ex-trigger">ReservationCreated</Mono>],
  [<span key="cmp-cond">Condition</span>, "Filtro simple o compuesto (AND / OR / NOT)", <Mono key="ex-cond">party_size &gt; 4</Mono>],
  [<span key="cmp-act">Action</span>, "Acción síncrona o asíncrona controlada", <Mono key="ex-act">enviar WhatsApp</Mono>],
  [<span key="cmp-wait">Wait</span>, "Delay relativo o cron absoluto", <Mono key="ex-wait">24h antes</Mono>],
  [<span key="cmp-branch">Branch</span>, "Bifurcación if/else con caminos paralelos", <Mono key="ex-branch">VIP vs standard</Mono>],
  [<span key="cmp-tpl">Plantilla</span>, "Receta reutilizable y versionable", <Mono key="ex-tpl">cumpleaños</Mono>],
  [<span key="cmp-var">Variable dinámica</span>, "Interpolación de contexto en el mensaje", <Mono key="ex-var">{"{{customer.first_name}}"}</Mono>],
  [<span key="cmp-lim">Límite por plan</span>, "Máximo de reglas activas según plan", <Mono key="ex-lim">Pro: 50 · Ent: 500</Mono>],
  [<span key="cmp-idem">Idempotencia</span>, "Cada ejecución tiene execution_id único", <Mono key="ex-idem">exec_01J…</Mono>],
  [<span key="cmp-antibucle">Anti-bucle</span>, "Profundidad máxima y TTL de ejecución", <Mono key="ex-antibucle">depth_limit: 10</Mono>],
  [<span key="cmp-ver">Versionado</span>, "Draft y published, sin reemplazar en vivo", <Mono key="ex-ver">v3 (draft)</Mono>],
  [<span key="cmp-sim">Simulación</span>, "Dry-run con datos de prueba", <Mono key="ex-sim">dry-run OK</Mono>],
  [<span key="cmp-pause">Pausa / Reactivación</span>, "Toggle sin perder configuración", <Mono key="ex-pause">paused</Mono>],
  [<span key="cmp-hist">Historial</span>, "Bitácora de ejecuciones con estado y duration", <Mono key="ex-hist">últimas 100</Mono>],
  [<span key="cmp-appr">Aprobación humana</span>, "Sensible: requiere OK explícito antes de ejecutar", <Mono key="ex-appr">approve_required</Mono>],
];

const AUTOMATION_EXAMPLES = [
  "Recordatorio de reserva T-24h por WhatsApp",
  "Reconfirmación T-2h con marca de riesgo no-show",
  "Cumpleaños del mes → email con cupón del 15%",
  "Recuperación de inactivos a 90 días (dos intentos)",
  "Solicitud de Google Review 24h tras el servicio",
  "Recuperación de no-show con cupón de disculpa",
  "Campaña de temporada (menú de Navidad, San Valentín)",
  "Aviso al encargado si una mesa VIP se reserva",
  "Incidencia interna si llega una reseña negativa (< 3★)",
];

let nodeSeq = 0;
function nextNodeId() {
  nodeSeq += 1;
  return `n-${Date.now()}-${nodeSeq}`;
}

function defaultNode(type: NodeType): FlowNode {
  const presets: Record<NodeType, { label: string; config: string }> = {
    Trigger: { label: "Nuevo trigger", config: "evento: reservation.*" },
    Condition: { label: "Nueva condición", config: "if customer.vip == true" },
    Action: { label: "Nueva acción", config: "enviar_notificación" },
    Wait: { label: "Nuevo wait", config: "delay: +1h" },
    Branch: { label: "Nueva rama", config: "if/else" },
  };
  return { id: nextNodeId(), type, ...presets[type] };
}

export function ProductoAutomatizaciones() {
  const [nodes, setNodes] = React.useState<FlowNode[]>(TEMPLATES[0].nodes);
  const [selectedNode, setSelectedNode] = React.useState<string | null>(TEMPLATES[0].nodes[0].id);
  const [active, setActive] = React.useState<boolean>(true);
  const [duplicated, setDuplicated] = React.useState<boolean>(false);
  const [simulated, setSimulated] = React.useState<boolean>(false);

  const selected = nodes.find((n) => n.id === selectedNode) ?? null;

  function addNode(type: NodeType) {
    const n = defaultNode(type);
    setNodes((prev) => [...prev, n]);
    setSelectedNode(n.id);
  }

  function loadTemplate(tplId: string) {
    const tpl = TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    // Clone to get fresh ids
    const cloned = tpl.nodes.map((n) => ({ ...n, id: nextNodeId() }));
    setNodes(cloned);
    setSelectedNode(cloned[0]?.id ?? null);
  }

  function removeNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNode === id) setSelectedNode(null);
  }

  function updateConfig(id: string, config: string) {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, config } : n)));
  }

  function handleDuplicate() {
    setDuplicated(true);
    window.setTimeout(() => setDuplicated(false), 1800);
  }

  function handleSimulate() {
    setSimulated(true);
    window.setTimeout(() => setSimulated(false), 2400);
  }

  return (
    <Section
      id="p-automatizaciones"
      index="13"
      eyebrow="Builder de automatizaciones"
      title="Builder visual: disparador → condiciones → acciones."
      intro={
        <>
          Un motor de automatizaciones visual: encadenas disparadores, condiciones, acciones,
          esperas y ramas sobre un canvas. Cada flujo tiene historial de ejecución, logs,
          activar/pausar/duplicar, simulación (dry-run) y versionado draft/published. Ejemplos:
          recordatorio de reserva, reconfirmación, cumpleaños, recuperación de inactivos,
          solicitud de reseña, recuperación de no-show, campaña de temporada.
        </>
      }
    >
      {/* Interactive builder */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <H3>Builder visual</H3>
            {DEMO_BADGE}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActive((v) => !v)}
              className={
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors " +
                (active
                  ? "border-emerald-400/45 bg-emerald-400/10 text-emerald-300"
                  : "border-amber-400/45 bg-amber-400/10 text-amber-300")
              }
              aria-pressed={active}
            >
              {active ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {active ? "Activa" : "Pausada"}
            </button>
            <button
              onClick={handleDuplicate}
              className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:border-[var(--gold)]/50 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              {duplicated ? "Duplicado ✓" : "Duplicar"}
            </button>
            <button
              onClick={handleSimulate}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-[var(--teal)] hover:bg-[var(--teal)]/20 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {simulated ? "Simulación iniciada…" : "Simular"}
            </button>
          </div>
        </div>

        {simulated ? (
          <div className="mb-4 rp-glass rounded-xl border border-[var(--teal)]/40 bg-[var(--teal)]/5 px-4 py-3 text-sm text-[var(--teal)] flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Simulación (dry-run) iniciada. Se ejecutará contra datos de prueba sin efectos reales.
          </div>
        ) : null}

        <div className="grid lg:grid-cols-[200px_1fr_280px] gap-4">
          {/* Palette */}
          <GlassCard className="p-3">
            <div className="px-1 py-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Paleta
            </div>
            <div className="space-y-1.5">
              {(Object.keys(NODE_META) as NodeType[]).map((t) => {
                const m = NODE_META[t];
                const Icon = m.icon;
                return (
                  <button
                    key={t}
                    onClick={() => addNode(t)}
                    className="w-full flex items-center gap-2 rounded-lg border border-border/40 bg-foreground/[0.02] px-3 py-2 text-sm hover:bg-foreground/[0.06] hover:border-[var(--gold)]/40 transition-colors"
                  >
                    <Icon className={"h-4 w-4 " + m.color} />
                    <span>{t}</span>
                    <span className="ml-auto text-muted-foreground text-xs">+</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 px-1 py-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Estado
            </div>
            <div className="rp-glass rounded-lg p-2 text-[11px] font-mono space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">nodos</span>
                <span className="rp-gold-text">{nodes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">estado</span>
                <span className={active ? "text-emerald-300" : "text-amber-300"}>
                  {active ? "active" : "paused"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">versión</span>
                <span className="rp-gold-text">v3 (draft)</span>
              </div>
            </div>
          </GlassCard>

          {/* Canvas */}
          <GlassCard className="p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Canvas · flujo horizontal
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                click en un nodo para configurarlo
              </span>
            </div>
            <div className="overflow-x-auto rp-scroll-thin">
              <div className="flex items-stretch gap-3 min-w-max pb-2">
                {nodes.length === 0 ? (
                  <div className="grid place-items-center h-32 text-sm text-muted-foreground">
                    Añade un nodo desde la paleta o carga una plantilla.
                  </div>
                ) : (
                  nodes.map((n, i) => {
                    const m = NODE_META[n.type];
                    const Icon = m.icon;
                    const isSelected = n.id === selectedNode;
                    return (
                      <React.Fragment key={n.id}>
                        <button
                          onClick={() => setSelectedNode(n.id)}
                          className={
                            "relative w-44 shrink-0 rounded-xl border p-3 text-left transition-all " +
                            (isSelected
                              ? m.border + " " + m.bg + " ring-2 ring-offset-0 ring-current"
                              : "border-border/50 bg-foreground/[0.02] hover:bg-foreground/[0.05]")
                          }
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={
                                "inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider " +
                                m.color
                              }
                            >
                              <Icon className="h-3 w-3" />
                              {n.type}
                            </span>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNode(n.id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.stopPropagation();
                                  removeNode(n.id);
                                }
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                              aria-label={`Eliminar nodo ${n.type}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </span>
                          </div>
                          <div className="mt-2 text-sm font-medium text-foreground">{n.label}</div>
                          <div className="mt-1.5 text-[11px] font-mono text-muted-foreground truncate">
                            {n.config}
                          </div>
                        </button>
                        {i < nodes.length - 1 ? (
                          <div className="flex items-center text-muted-foreground">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        ) : null}
                      </React.Fragment>
                    );
                  })
                )}
              </div>
            </div>
          </GlassCard>

          {/* Side panel */}
          <GlassCard variant="gold" className="p-4">
            <div className="px-1 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Configuración del nodo
            </div>
            {selected ? (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const m = NODE_META[selected.type];
                    const Icon = m.icon;
                    return (
                      <>
                        <Icon className={"h-4 w-4 " + m.color} />
                        <span className={"text-[10px] font-mono uppercase tracking-wider " + m.color}>
                          {selected.type}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <div className="mt-2 font-display text-lg">{selected.label}</div>
                <div className="mt-1 text-[11px] font-mono text-muted-foreground">
                  id: <Mono>{selected.id}</Mono>
                </div>

                <div className="mt-4">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Configuración
                  </label>
                  <textarea
                    value={selected.config}
                    onChange={(e) => updateConfig(selected.id, e.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 font-mono text-xs text-foreground/90 focus:outline-none focus:border-[var(--gold)]/60 rp-scroll-thin"
                  />
                </div>

                <div className="mt-4 rp-glass rounded-lg p-3 text-[11px] text-muted-foreground leading-relaxed">
                  <span className="rp-gold-text font-mono uppercase tracking-wider">Idempotencia:</span>{" "}
                  cada ejecución llevará un <Mono>execution_id</Mono> único. Anti-bucle: profundidad
                  máxima 10, TTL 60min.
                </div>
              </div>
            ) : (
              <div className="mt-6 grid place-items-center text-sm text-muted-foreground text-center h-40">
                Selecciona un nodo del canvas para editar su configuración.
              </div>
            )}
          </GlassCard>
        </div>

        {/* Templates */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <H3>Plantillas</H3>
            {DEMO_BADGE}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => loadTemplate(t.id)}
                className="text-left rounded-xl border border-border/50 bg-foreground/[0.02] p-3 hover:border-[var(--gold)]/50 hover:bg-foreground/[0.05] transition-colors"
              >
                <div className="font-display text-sm font-medium">{t.name}</div>
                <div className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{t.desc}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[var(--gold)]">
                  cargar plantilla <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Execution history */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <H3>Historial de ejecuciones</H3>
            {DEMO_BADGE}
          </div>
          <GlassCard className="p-0 overflow-hidden">
            <ul className="divide-y divide-border/40">
              {EXECUTIONS.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-foreground/[0.025] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <StatusDot status={e.status} />
                    <span className="text-sm font-medium">{e.flow}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground">
                    <span>{e.time}</span>
                    <span>duración <span className="rp-gold-text">{e.duration}</span></span>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>

      {/* DataTable */}
      <div className="mb-10">
        <H3 className="mb-4">Componentes del builder</H3>
        <DataTable
          head={["Componente", "Descripción", "Ejemplo"]}
          rows={BUILDER_COMPONENT_ROWS}
        />
      </div>

      {/* GlassCard examples + Callout */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard variant="gold">
          <H3>Ejemplos de automatizaciones</H3>
          <Lead className="mt-1">Recetas reales, listas para activar.</Lead>
          <div className="mt-4">
            <GoldList items={AUTOMATION_EXAMPLES.map((e, i) => <span key={`ex-${i}`}>{e}</span>)} />
          </div>
        </GlassCard>

        <Callout kind="warn" title="Aprobación humana para lo sensible">
          Las acciones que afectan a pricing, campañas públicas, respuestas a reseñas,
          eliminación de datos o pagos <strong>nunca</strong> se auto-ejecutan. Requieren
          aprobación humana explícita aunque la IA las proponga. La automatización opera el trabajo
          operativo; las decisiones sensibles siguen siendo humanas, con auditoría completa.
        </Callout>
      </div>
    </Section>
  );
}

function StatusDot({ status }: { status: "success" | "failed" | "pending" }) {
  const meta = {
    success: { color: "bg-emerald-400", label: "success", text: "text-emerald-300" },
    failed: { color: "bg-destructive", label: "failed", text: "text-destructive" },
    pending: { color: "bg-amber-400", label: "pending", text: "text-amber-300" },
  } as const;
  const m = meta[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span className={"h-2 w-2 rounded-full " + m.color + (status === "pending" ? " animate-pulse" : "")} />
      <span className={"text-[10px] font-mono uppercase tracking-wider " + m.text}>{m.label}</span>
    </span>
  );
}

/* ============================================================
   3. PRODUCTO REPUTACION — reviews tray + IA Copilot chat
   ============================================================ */

type Review = {
  id: string;
  author: string;
  rating: number;
  snippet: string;
  full: string;
  sentiment: "positive" | "neutral" | "negative";
  themes: string[];
  replied: boolean;
  suggested: string;
  date: string;
};

const REVIEWS: Review[] = [
  {
    id: "rv1",
    author: "Carlos M.",
    rating: 5,
    snippet: "Mejor experiencia gastronómica del año. Servicio impecable y atento.",
    full:
      "Mejor experiencia gastronómica del año. El equipo de sala nos atendió con una cercanía y profesionalidad que ya no es habitual. El menú degustación estuvo a la altura de cualquier estrella Michelin, con un equilibrio perfecto entre técnica y producto. Volveremos sin duda.",
    sentiment: "positive",
    themes: ["servicio", "menú degustación", "profesionalidad"],
    replied: false,
    suggested:
      "Muchas gracias, Carlos. Nos encanta leer que el menú degustación y el equipo de sala estuvieron a la altura. Será un placer recibiros de nuevo — reservad con tiempo para la mesa 12.",
    date: "hace 2 días",
  },
  {
    id: "rv2",
    author: "Nuria P.",
    rating: 4,
    snippet: "Comida excelente pero esperamos 25 min en la barra con reserva.",
    full:
      "La comida estuvo excelente, como siempre. Pero tuvimos reserva para las 21:30 y nos tuvieron esperando 25 minutos en la barra sin ofrecer nada. Una vez en la mesa, todo perfecto. Espero que mejoren la gestión de tiempos.",
    sentiment: "neutral",
    themes: ["tiempo de espera", "gestión de reservas", "comida"],
    replied: false,
    suggested:
      "Gracias por la sinceridad, Nuria. Lamentamos la espera: no debería haber ocurrido. Hemos ajustado el sistema de reservas para respetar el horario al minuto. Os esperamos pronto — la próxima ronda de bebida va por cuenta de la casa.",
    date: "hace 4 días",
  },
  {
    id: "rv3",
    author: "Anónimo",
    rating: 2,
    snippet: "Plato frío y camarero desentendido. Esperaba más por el precio.",
    full:
      "Esperaba bastante más por el precio que pagamos. El plato principal llegó frío, avisamos al camarero y la respuesta fue tibia. No es el nivel que se anuncia. Espero que lo mejoren.",
    sentiment: "negative",
    themes: ["temperatura del plato", "atención", "relación calidad/precio"],
    replied: false,
    suggested:
      "Lamentamos sincerely la experiencia. Un plato frío y una atención que no estuvo a la altura no son aceptables. Nos gustaría invitaros a volver y conversar con el encargado: escribidnos a hola@restaurante.com y lo solucionamos personalmente.",
    date: "hace 6 días",
  },
  {
    id: "rv4",
    author: "Sergio B.",
    rating: 5,
    snippet: "Cumpleaños perfecto. Tarta sorpresa y detalle con la pareja.",
    full:
      "Celebramos un cumpleaños y superaron las expectativas. Tarta sorpresa, vela, detalle con mi pareja y una recomendación de maridaje que no falló. Equipo de sala de diez. Repetiremos.",
    sentiment: "positive",
    themes: ["celebración", "detalle", "maridaje"],
    replied: true,
    suggested: "¡Gracias, Sergio! Fue un honor ser parte del cumpleaños. Guardamos la mesa 5 para vuestra próxima celebración.",
    date: "hace 1 semana",
  },
  {
    id: "rv5",
    author: "Pilar R.",
    rating: 3,
    snippet: "Correcto pero sin destacar. Carta corta para el público habitual.",
    full:
      "El servicio correcto, el producto bueno, pero la carta me pareció corta para el público que tienen. Falta algo más de variedad para volver a sorprender. El local está impecable.",
    sentiment: "neutral",
    themes: ["carta", "variedad", "local"],
    replied: false,
    suggested:
      "Gracias, Pilar. Tomamos nota: renovamos la carta cada temporada, pero valoramos incluir más opciones intermedias. Encantados de recibiros cuando estrenemos la próxima edición.",
    date: "hace 9 días",
  },
];

const STAR_WEEKS = [
  { week: "S1", rating: 4.2 },
  { week: "S2", rating: 4.4 },
  { week: "S3", rating: 4.1 },
  { week: "S4", rating: 4.6 },
];

const ANALYTICS_ROWS: React.ReactNode[][] = [
  [<span key="m-ocu">ocupación</span>, <span key="s-ocu">reservations + mesas</span>, <Mono key="f-ocu">tiempo real</Mono>],
  [<span key="m-ing">ingresos</span>, <span key="s-ing">billing (POS / Stripe)</span>, <Mono key="f-ing">batch</Mono>],
  [<span key="m-tk">ticket medio</span>, <span key="s-tk">POS / billing</span>, <Mono key="f-tk">batch</Mono>],
  [<span key="m-res">reservas</span>, <span key="s-res">reservations</span>, <Mono key="f-res">tiempo real</Mono>],
  [<span key="m-can">cancelaciones</span>, <span key="s-can">reservations</span>, <Mono key="f-can">tiempo real</Mono>],
  [<span key="m-ns">no-shows</span>, <span key="s-ns">reservations</span>, <Mono key="f-ns">tiempo real</Mono>],
  [<span key="m-nue">clientes nuevos</span>, <span key="s-nue">customers</span>, <Mono key="f-nue">tiempo real</Mono>],
  [<span key="m-rec">recurrentes</span>, <span key="s-rec">customer_visits</span>, <Mono key="f-rec">batch</Mono>],
  [<span key="m-peak">horas punta</span>, <span key="s-peak">analytics</span>, <Mono key="f-peak">batch</Mono>],
  [<span key="m-fc">forecast</span>, <span key="s-fc">IA (predictivo)</span>, <Mono key="f-fc">batch</Mono>],
  [<span key="m-comp">comparativa locales</span>, <span key="s-comp">analytics</span>, <Mono key="f-comp">batch</Mono>],
  [<span key="m-exp">exportación CSV / PDF</span>, <span key="s-exp">bajo demanda</span>, <Mono key="f-exp">on-demand</Mono>],
];

const AI_RULES = [
  "Fuente de datos siempre mostrada en cada respuesta.",
  "Fecha de actualización visible (no se oculta la antigüedad).",
  "Nivel de confianza cuando la respuesta lo requiera.",
  "Acciones sugeridas con revisión humana obligatoria.",
  "Registro inmutable de acciones ejecutadas.",
  "Prompts versionados (v1, v2…) con rollback disponible.",
  "Límites por plan (créditos IA, llamadas por día).",
  "Redacción de PII antes de enviar al modelo.",
  "Kill switch por organización: cortar IA sin tocar el resto.",
  "Fallback determinista si el proveedor de IA falla.",
  "Aprobación humana para sensible (precio, reseña, eliminación, pago).",
];

const COPILOT_CHIPS = [
  { id: "q1", q: "¿Cuántas reservas tengo mañana?" },
  { id: "q2", q: "¿Qué clientes tienen riesgo de cancelar?" },
  { id: "q3", q: "¿Qué campaña funcionó mejor?" },
];

const COPILOT_ANSWERS: Record<string, { text: string; source: string; updated: string; confidence: number; actions: string[] }> = {
  q1: {
    text: "Para mañana tienes 47 reservas confirmadas y 3 pendientes de reconfirmación. La franja de mayor ocupación es 21:00–22:00 (82% de la sala). Hay una mesa VIP (David Puig, 2 pax) que conviene confirmar manualmente.",
    source: "Reservations (demo)",
    updated: "hace 5 min",
    confidence: 82,
    actions: ["Confirmar mesa VIP manualmente", "Revisar 3 reservas pendientes"],
  },
  q2: {
    text: "9 clientes tienen riesgo de no-show elevado, calculado a partir de historial reciente y patrón de cancelación. Marta Iborra es el caso más urgente (no-show previo el 18/11). Se recomienda reconfirmación T-2h por WhatsApp.",
    source: "Customers + Reservations (demo)",
    updated: "hace 5 min",
    confidence: 76,
    actions: ["Lanzar reconfirmación T-2h", "Marcar 9 clientes como riesgo"],
  },
  q3: {
    text: "La campaña 'Cumpleaños diciembre' es la mejor en lo que va de mes: CTR 18,4% (vs 9,2% media). Generó 11 reservas adicionales y un ingreso incremental estimado de €1.430. La campaña de recuperación de inactivos aún está en borrador.",
    source: "Campaigns + Billing (demo)",
    updated: "hace 5 min",
    confidence: 88,
    actions: ["Duplicar campaña cumpleaños para enero", "Activar campaña inactivos"],
  },
};

export function ProductoReputacion() {
  const [selectedReviewId, setSelectedReviewId] = React.useState<string>(REVIEWS[0].id);
  const [replyText, setReplyText] = React.useState<string>(REVIEWS[0].suggested);
  const [approved, setApproved] = React.useState<boolean>(false);
  const [copilotInput, setCopilotInput] = React.useState<string>("");
  const [chat, setChat] = React.useState<{ id: string; role: "user" | "ai"; text: string; source?: string; updated?: string; confidence?: number; actions?: string[] }[]>([]);

  const review = REVIEWS.find((r) => r.id === selectedReviewId) ?? REVIEWS[0];

  function selectReview(id: string) {
    const r = REVIEWS.find((x) => x.id === id);
    if (!r) return;
    setSelectedReviewId(id);
    setReplyText(r.suggested);
    setApproved(false);
  }

  function ask(qidOrText: string) {
    const isChip = qidOrText.startsWith("q");
    const chip = isChip ? COPILOT_CHIPS.find((c) => c.id === qidOrText) : null;
    const userText = chip ? chip.q : qidOrText;
    const answer = isChip ? COPILOT_ANSWERS[qidOrText] : {
      text:
        "El Copilot responde con datos del tenant actual. Para esta consulta, la fuente es el módulo de Analytics: la respuesta incluiría siempre origen, fecha de actualización y nivel de confianza. Las acciones sensibles requieren aprobación humana.",
      source: "Analytics (demo)",
      updated: "hace 5 min",
      confidence: 71,
      actions: ["Revisar métrica en dashboard", "Exportar CSV"],
    };

    setChat((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user" as const, text: userText },
      {
        id: `a-${Date.now()}`,
        role: "ai" as const,
        text: answer.text,
        source: answer.source,
        updated: answer.updated,
        confidence: answer.confidence,
        actions: answer.actions,
      },
    ]);
    setCopilotInput("");
  }

  return (
    <Section
      id="p-reputacion"
      index="14"
      eyebrow="Reputación, analytics e IA"
      title="Google Reviews con IA, analytics operativo y Copilot."
      intro={
        <>
          La reputación se gestiona desde una bandeja única de Google Reviews: respuestas asistidas
          por IA con análisis de sentimiento y detección de temas recurrentes, evolución de
          estrellas, comparativa entre locales, filtros por valoración e histórico de respuestas.
          Las acciones públicas requieren aprobación previa. Analytics operativo cubre ocupación,
          ingresos, ticket medio, reservas, cancelaciones, no-shows, nuevos vs recurrentes, horas
          punta, forecast y comparativa de locales, con exportación CSV/PDF y filtros. El IA
          Copilot responde consultas tipo «cuántas reservas mañana», «clientes en riesgo»,
          «mejor campaña», «local más ingresos», «horas de menor ocupación» o «acciones para subir
          ticket medio» — siempre mostrando fuente, fecha de actualización, confianza, acciones
          sugeridas y registro de lo ejecutado.
        </>
      }
    >
      {/* Interactive reviews tray + IA Copilot */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <H3>Bandeja de reseñas + IA Copilot</H3>
          {DEMO_BADGE}
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-4">
          {/* Reviews list */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-[var(--gold)]" />
                Reseñas
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">{REVIEWS.length} · demo</span>
            </div>
            <ul className="max-h-[560px] overflow-y-auto rp-scroll-thin">
              {REVIEWS.map((r) => {
                const active = r.id === selectedReviewId;
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => selectReview(r.id)}
                      className={
                        "w-full text-left px-4 py-3 border-b border-border/30 last:border-0 transition-colors " +
                        (active
                          ? "bg-[var(--gold)]/10 border-l-2 border-l-[var(--gold)]"
                          : "hover:bg-foreground/[0.04]")
                      }
                      aria-pressed={active}
                    >
                      <div className="flex items-center justify-between">
                        <span className={"text-sm font-medium " + (active ? "rp-gold-text" : "text-foreground")}>
                          {r.author}
                        </span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={
                                "h-3 w-3 " +
                                (i < r.rating
                                  ? "fill-[var(--gold)] text-[var(--gold)]"
                                  : "text-foreground/20")
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {r.snippet}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <SentimentPill sentiment={r.sentiment} />
                        {r.replied ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                            <Check className="h-3 w-3" /> respondida
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                            pendiente
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </GlassCard>

          {/* Detail + Copilot stacked */}
          <div className="space-y-4">
            {/* Review detail */}
            <GlassCard variant="gold" className="p-0 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border/40">
                <div>
                  <div className="font-display text-xl">{review.author}</div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    reseña_id: <Mono>{review.id}</Mono> · {review.date}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {DEMO_BADGE}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          "h-4 w-4 " +
                          (i < review.rating
                            ? "fill-[var(--gold)] text-[var(--gold)]"
                            : "text-foreground/20")
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-[1.4fr_1fr] gap-x-6 gap-y-4 px-5 py-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Reseña completa
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{review.full}</p>

                  <div className="mt-4">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                      Análisis IA
                    </div>
                    <div className="rp-glass rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Sentimiento</span>
                        <SentimentPill sentiment={review.sentiment} />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1.5">Temas detectados</div>
                        <div className="flex flex-wrap gap-1.5">
                          {review.themes.map((t) => (
                            <Pill key={t} tone="teal">{t}</Pill>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      Respuesta sugerida (IA)
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
                      <Sparkles className="h-3 w-3" /> IA
                    </span>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => {
                      setReplyText(e.target.value);
                      setApproved(false);
                    }}
                    rows={6}
                    className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-[var(--gold)]/60 rp-scroll-thin"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => setApproved(true)}
                      disabled={approved}
                      className={
                        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors " +
                        (approved
                          ? "bg-emerald-400/15 border border-emerald-400/45 text-emerald-300"
                          : "bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]")
                      }
                    >
                      {approved ? <><Check className="h-3.5 w-3.5" /> Aprobada (pendiente publicar)</> : "Aprobar antes de publicar"}
                    </button>
                    {approved ? (
                      <button className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:border-[var(--gold)]/50 transition-colors">
                        Publicar ahora
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-3 rp-glass rounded-lg p-3 text-[11px] text-muted-foreground leading-relaxed">
                    <span className="text-amber-300 font-mono uppercase tracking-wider">Revisión obligatoria:</span>{" "}
                    la respuesta no se publica sin aprobación humana. Editable antes de enviar.
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Star evolution mini-chart */}
            <GlassCard>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[var(--gold)]" />
                  <H3>Evolución de estrellas</H3>
                </div>
                {DEMO_BADGE}
              </div>
              <StarChart weeks={STAR_WEEKS} />
            </GlassCard>
          </div>
        </div>
      </div>

      {/* IA Copilot chat */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--teal)]" />
              <H3>IA Copilot</H3>
            </div>
            {DEMO_BADGE}
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            fuente · actualizado · confianza · acciones sugeridas
          </span>
        </div>

        <GlassCard variant="teal" className="p-0 overflow-hidden">
          {/* Chat transcript */}
          <div className="max-h-[420px] overflow-y-auto rp-scroll-thin px-5 py-4 space-y-4">
            {chat.length === 0 ? (
              <div className="grid place-items-center h-32 text-sm text-muted-foreground text-center">
                Haz una pregunta o pulsa una de las consultas sugeridas para ver la respuesta del
                Copilot con su fuente, confianza y acciones.
              </div>
            ) : (
              chat.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[var(--gold)]/15 border border-[var(--gold)]/30 px-4 py-2.5 text-sm">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm rp-glass border border-border/40 px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
                        <Sparkles className="h-3 w-3" />
                        Copilot
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">{m.text}</p>
                      <div className="mt-3 grid sm:grid-cols-3 gap-2 text-[11px] font-mono">
                        <div className="rp-glass rounded px-2 py-1.5">
                          <div className="text-muted-foreground uppercase tracking-wider">Fuente</div>
                          <div className="text-foreground/85 mt-0.5">{m.source}</div>
                        </div>
                        <div className="rp-glass rounded px-2 py-1.5">
                          <div className="text-muted-foreground uppercase tracking-wider">Actualizado</div>
                          <div className="text-foreground/85 mt-0.5">{m.updated}</div>
                        </div>
                        <div className="rp-glass rounded px-2 py-1.5">
                          <div className="text-muted-foreground uppercase tracking-wider">Confianza</div>
                          <div className="rp-gold-text mt-0.5">{m.confidence}%</div>
                        </div>
                      </div>
                      {m.actions && m.actions.length ? (
                        <div className="mt-3">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                            Acciones sugeridas · revisar antes de ejecutar
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {m.actions.map((a, i) => (
                              <span
                                key={`act-${i}`}
                                className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-[11px] text-amber-300"
                              >
                                <ThumbsUp className="h-3 w-3" />
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              )
            )}
          </div>

          {/* Chips */}
          <div className="border-t border-border/40 px-5 py-3 flex flex-wrap gap-2">
            {COPILOT_CHIPS.map((c) => (
              <button
                key={c.id}
                onClick={() => ask(c.id)}
                className="rounded-full border border-border/50 bg-foreground/[0.03] px-3 py-1 text-xs hover:border-[var(--teal)]/50 hover:text-[var(--teal)] transition-colors"
              >
                {c.q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-border/40 px-5 py-3 flex items-center gap-2">
            <input
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && copilotInput.trim()) ask(copilotInput.trim());
              }}
              placeholder="Pregunta al Copilot… (ej: ¿horas de menor ocupación?)"
              className="flex-1 rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:border-[var(--teal)]/60"
            />
            <button
              onClick={() => {
                if (copilotInput.trim()) ask(copilotInput.trim());
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--teal)] text-black px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Send className="h-3.5 w-3.5" />
              Preguntar
            </button>
          </div>
        </GlassCard>
      </div>

      {/* DataTable */}
      <div className="mb-10">
        <H3 className="mb-4">Analytics disponibles</H3>
        <DataTable head={["Métrica", "Fuente", "Frecuencia"]} rows={ANALYTICS_ROWS} />
      </div>

      {/* GlassCard rules + Callout */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard variant="gold">
          <H3>Reglas de IA</H3>
          <Lead className="mt-1">No negociables. La IA nunca es una caja negra.</Lead>
          <div className="mt-4">
            <GoldList
              items={AI_RULES.map((r, i) => (
                <span key={`ar-${i}`}>{r}</span>
              ))}
            />
          </div>
        </GlassCard>

        <Callout kind="warn" title="IA propone, humano decide lo sensible">
          La IA <strong>nunca</strong> ejecuta acciones sensibles (precio, campaña pública,
          respuesta a reseña, eliminación, pago) sin aprobación explícita humana. El fallback
          determinista garantiza operación continua si el proveedor de IA falla: el sistema sigue
          respondiendo con reglas fijas mientras el modelo está fuera. La IA acelera; no decide lo
          crítico.
        </Callout>
      </div>
    </Section>
  );
}

function SentimentPill({ sentiment }: { sentiment: "positive" | "neutral" | "negative" }) {
  const meta = {
    positive: { label: "positivo", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
    neutral: { label: "neutral", cls: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]" },
    negative: { label: "negativo", cls: "border-destructive/50 bg-destructive/10 text-destructive" },
  } as const;
  const m = meta[sentiment];
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider " +
        m.cls
      }
    >
      {m.label}
    </span>
  );
}

function StarChart({ weeks }: { weeks: { week: string; rating: number }[] }) {
  const max = 5;
  const min = 3.5;
  const w = 560;
  const h = 140;
  const pad = 32;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const stepX = innerW / Math.max(1, weeks.length - 1);
  const points = weeks.map((d, i) => {
    const x = pad + i * stepX;
    const y = pad + innerH - ((d.rating - min) / (max - min)) * innerH;
    return { x, y, ...d };
  });
  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${pad + innerH} L ${points[0].x} ${pad + innerH} Z`;
  const avg = (weeks.reduce((a, b) => a + b.rating, 0) / weeks.length).toFixed(2);

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-[560px] h-auto"
        role="img"
        aria-label="Evolución de estrellas por semana (datos demo)"
      >
        <defs>
          <linearGradient id="rp-star-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid */}
        {[0, 0.5, 1].map((g) => (
          <line
            key={g}
            x1={pad}
            x2={w - pad}
            y1={pad + innerH * g}
            y2={pad + innerH * g}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeDasharray="2 4"
          />
        ))}
        {/* area */}
        <path d={areaPath} fill="url(#rp-star-grad)" />
        {/* line */}
        <path d={linePath} fill="none" stroke="var(--gold)" strokeWidth={2} strokeLinejoin="round" />
        {/* points */}
        {points.map((p) => (
          <g key={p.week}>
            <circle cx={p.x} cy={p.y} r={4} fill="var(--gold)" />
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              className="fill-[var(--gold-soft)] font-mono"
              fontSize="10"
            >
              {p.rating.toFixed(1)}
            </text>
            <text
              x={p.x}
              y={h - 10}
              textAnchor="middle"
              className="fill-muted-foreground font-mono"
              fontSize="10"
            >
              {p.week}
            </text>
          </g>
        ))}
      </svg>
      <div className="rp-glass rounded-lg p-3 text-xs space-y-2 w-full sm:w-44">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Media 4 semanas
          </div>
          <div className="font-display text-2xl rp-gold-text">{avg} ★</div>
        </div>
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          Tendencia ascendente en la última semana. Sin alertas de reseña negativa en cola.
        </div>
      </div>
    </div>
  );
}
