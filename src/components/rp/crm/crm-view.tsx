"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  Mail,
  Phone,
  CalendarPlus,
  Send,
  Download,
  X,
  Plus,
  Crown,
  Gift,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Lock,
  Sparkles,
  MapPin,
  Utensils,
  Soup,
  History,
  StickyNote,
  Megaphone,
  CircleUserRound,
  Inbox,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type TagId = "VIP" | "recurrente" | "cumpleaños" | "riesgo" | "nuevo" | "inactivo";

type ConsentChannel = "email" | "whatsapp" | "sms";

interface VisitEntry {
  id: string;
  date: string;
  partySize: number;
  table: string;
  ticket: number | null;
  notes: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  ltv: number;
  tags: TagId[];
  lastVisit: string;
  birthday: string;
  favoriteTable: string;
  allergens: string[];
  dietary: string;
  acquisition: string;
  consents: Record<ConsentChannel, boolean>;
  notes: string;
  history: VisitEntry[];
}

type FilterTab = "todos" | "VIP" | "riesgo" | "cumpleaños";

type Role = "owner" | "manager" | "hostess";

interface Permissions {
  "crm.export": boolean;
  "crm.message": boolean;
  "crm.reservation.create": boolean;
  "crm.consent.edit": boolean;
  "crm.tag.edit": boolean;
  "crm.note.edit": boolean;
}

const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  owner: {
    "crm.export": true,
    "crm.message": true,
    "crm.reservation.create": true,
    "crm.consent.edit": true,
    "crm.tag.edit": true,
    "crm.note.edit": true,
  },
  manager: {
    "crm.export": true,
    "crm.message": true,
    "crm.reservation.create": true,
    "crm.consent.edit": true,
    "crm.tag.edit": true,
    "crm.note.edit": true,
  },
  hostess: {
    "crm.export": false,
    "crm.message": true,
    "crm.reservation.create": true,
    "crm.consent.edit": false,
    "crm.tag.edit": false,
    "crm.note.edit": true,
  },
};

/* ------------------------------------------------------------------ */
/* Demo data                                                          */
/* ------------------------------------------------------------------ */

const DEMO_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Elena Marín",
    email: "elena.marin@example.com",
    phone: "+34 612 884 102",
    visits: 18,
    ltv: 4820,
    tags: ["VIP", "recurrente"],
    lastVisit: "Hace 6 días",
    birthday: "23 de marzo",
    favoriteTable: "Mesa 12 · Ventana",
    allergens: ["Frutos secos"],
    dietary: "Sin gluten opcional",
    acquisition: "Referido por Javier Soler",
    consents: { email: true, whatsapp: true, sms: false },
    notes: "Prefiere agua con gas. Siempre pregunta por la carta de vinos Ribera.",
    history: [
      { id: "v1", date: "12 mar 2025", partySize: 2, table: "Mesa 12", ticket: 168, notes: "Cena romántica, pidieron maridaje." },
      { id: "v2", date: "28 feb 2025", partySize: 4, table: "Mesa 7", ticket: 312, notes: "Aniversario, postres de cortesía." },
      { id: "v3", date: "09 feb 2025", partySize: 2, table: "Mesa 12", ticket: 142, notes: "Visita exprés. Excelente feedback." },
      { id: "v4", date: "21 ene 2025", partySize: 6, table: "Mesa 3", ticket: 528, notes: "Cena de equipo. Factura empresa." },
      { id: "v5", date: "04 ene 2025", partySize: 2, table: "Mesa 12", ticket: 124, notes: "Reyes, tarde tranquila." },
    ],
  },
  {
    id: "c2",
    name: "Javier Soler",
    email: "javier.soler@example.com",
    phone: "+34 670 221 994",
    visits: 12,
    ltv: 2980,
    tags: ["recurrente"],
    lastVisit: "Hace 2 semanas",
    birthday: "9 de julio",
    favoriteTable: "Mesa 5 · Barra",
    allergens: [],
    dietary: "Omnívoro",
    acquisition: "Instagram Ads",
    consents: { email: true, whatsapp: false, sms: false },
    notes: "Suele venir los jueves. Le gustan los platos de temporada.",
    history: [
      { id: "v1", date: "06 mar 2025", partySize: 2, table: "Mesa 5", ticket: 96, notes: "Barra, maridaje por copas." },
      { id: "v2", date: "20 feb 2025", partySize: 3, table: "Mesa 5", ticket: 138, notes: "Cumpleaños amigo, postre sorpresa." },
      { id: "v3", date: "30 ene 2025", partySize: 2, table: "Mesa 5", ticket: 88, notes: "Cena rápida pre-cine." },
      { id: "v4", date: "12 ene 2025", partySize: 4, table: "Mesa 9", ticket: 214, notes: "Trajo a Elena Marín." },
    ],
  },
  {
    id: "c3",
    name: "Marta Iborra",
    email: "marta.iborra@example.com",
    phone: "+34 699 010 558",
    visits: 5,
    ltv: 690,
    tags: ["riesgo"],
    lastVisit: "Hace 3 semanas (no-show)",
    birthday: "17 de noviembre",
    favoriteTable: "—",
    allergens: ["Marisco"],
    dietary: "Pescatariana",
    acquisition: "Google Maps",
    consents: { email: true, whatsapp: true, sms: false },
    notes: "Dos no-shows en 3 meses. Considerar overbooking controlado o confirmación doble.",
    history: [
      { id: "v1", date: "22 feb 2025", partySize: 2, table: "—", ticket: null, notes: "No-show sin previo aviso." },
      { id: "v2", date: "11 ene 2025", partySize: 4, table: "Mesa 4", ticket: 198, notes: "Cena normal." },
      { id: "v3", date: "05 dic 2024", partySize: 2, table: "—", ticket: null, notes: "No-show. Reagendado luego." },
      { id: "v4", date: "18 oct 2024", partySize: 2, table: "Mesa 8", ticket: 78, notes: "Almuerzo de trabajo." },
    ],
  },
  {
    id: "c4",
    name: "David Puig",
    email: "david.puig@example.com",
    phone: "+34 655 778 220",
    visits: 22,
    ltv: 6340,
    tags: ["VIP", "cumpleaños"],
    lastVisit: "Hace 4 días",
    birthday: "26 de marzo",
    favoriteTable: "Mesa 1 · Privado",
    allergens: ["Apio"],
    dietary: "Omnívoro",
    acquisition: "Walk-in recurrente",
    consents: { email: true, whatsapp: true, sms: true },
    notes: "Cliente top. Cumpleaños este mes — preparar detalle y upgrade de mesa.",
    history: [
      { id: "v1", date: "14 mar 2025", partySize: 6, table: "Mesa 1", ticket: 642, notes: "Cena de celebración." },
      { id: "v2", date: "01 mar 2025", partySize: 4, table: "Mesa 1", ticket: 388, notes: "Maridaje largo." },
      { id: "v3", date: "15 feb 2025", partySize: 2, table: "Mesa 1", ticket: 196, notes: "Cena íntima." },
      { id: "v4", date: "29 ene 2025", partySize: 8, table: "Mesa 1", ticket: 920, notes: "Mesa redonda empresa." },
      { id: "v5", date: "10 ene 2025", partySize: 4, table: "Mesa 1", ticket: 412, notes: "Cena estándar." },
    ],
  },
  {
    id: "c5",
    name: "Lucía Ferrer",
    email: "lucia.ferrer@example.com",
    phone: "+34 622 449 770",
    visits: 1,
    ltv: 64,
    tags: ["nuevo"],
    lastVisit: "Hace 3 días",
    birthday: "2 de junio",
    favoriteTable: "Mesa 9 · Centro",
    allergens: ["Lactosa"],
    dietary: "Vegetariana",
    acquisition: "Reserva online (web)",
    consents: { email: true, whatsapp: false, sms: false },
    notes: "Primera visita. Pidió info sobre menú degustación vegetariano.",
    history: [
      { id: "v1", date: "15 mar 2025", partySize: 2, table: "Mesa 9", ticket: 64, notes: "Primera visita, encantada con el servicio." },
    ],
  },
  {
    id: "c6",
    name: "Andrés Vidal",
    email: "andres.vidal@example.com",
    phone: "+34 688 220 113",
    visits: 4,
    ltv: 412,
    tags: ["riesgo", "inactivo"],
    lastVisit: "Hace 95 días",
    birthday: "30 de septiembre",
    favoriteTable: "Mesa 6 · Centro",
    allergens: [],
    dietary: "Omnívoro",
    acquisition: "Referido",
    consents: { email: true, whatsapp: false, sms: false },
    notes: "Sin actividad >90 días. Candidato a campaña de recuperación.",
    history: [
      { id: "v1", date: "09 dic 2024", partySize: 3, table: "Mesa 6", ticket: 138, notes: "Cena normal." },
      { id: "v2", date: "20 nov 2024", partySize: 2, table: "Mesa 6", ticket: 92, notes: "Cena rápida." },
      { id: "v3", date: "05 nov 2024", partySize: 4, table: "Mesa 6", ticket: 184, notes: "Aniversario." },
      { id: "v4", date: "18 oct 2024", partySize: 2, table: "Mesa 6", ticket: 88, notes: "Cena de pareja." },
    ],
  },
  {
    id: "c7",
    name: "Carmen Ruiz",
    email: "carmen.ruiz@example.com",
    phone: "+34 644 998 030",
    visits: 31,
    ltv: 9120,
    tags: ["VIP", "cumpleaños", "recurrente"],
    lastVisit: "Ayer",
    birthday: "21 de marzo",
    favoriteTable: "Mesa 12 · Ventana",
    allergens: ["Gluten"],
    dietary: "Celíaca",
    acquisition: "Walk-in recurrente",
    consents: { email: true, whatsapp: true, sms: true },
    notes: "Cliente histórico. Siempre recibe bienvenida personalizada del encargado.",
    history: [
      { id: "v1", date: "16 mar 2025", partySize: 2, table: "Mesa 12", ticket: 184, notes: "Cena habitual." },
      { id: "v2", date: "02 mar 2025", partySize: 4, table: "Mesa 12", ticket: 356, notes: "Trajo invitados." },
      { id: "v3", date: "14 feb 2025", partySize: 2, table: "Mesa 12", ticket: 198, notes: "San Valentín." },
      { id: "v4", date: "28 ene 2025", partySize: 6, table: "Mesa 12", ticket: 542, notes: "Cumpleaños familiar." },
      { id: "v5", date: "10 ene 2025", partySize: 2, table: "Mesa 12", ticket: 144, notes: "Cena estándar." },
    ],
  },
  {
    id: "c8",
    name: "Pablo Navarro",
    email: "pablo.navarro@example.com",
    phone: "+34 611 220 445",
    visits: 9,
    ltv: 1248,
    tags: ["recurrente"],
    lastVisit: "Hace 10 días",
    birthday: "5 de agosto",
    favoriteTable: "Barra · 3",
    allergens: [],
    dietary: "Omnívoro",
    acquisition: "Reserva online",
    consents: { email: true, whatsapp: false, sms: false },
    notes: "Suele tomar algo en barra antes de mesa.",
    history: [
      { id: "v1", date: "07 mar 2025", partySize: 2, table: "Barra · 3", ticket: 96, notes: "Vermut + cena ligera." },
      { id: "v2", date: "22 feb 2025", partySize: 2, table: "Mesa 8", ticket: 118, notes: "Cena estándar." },
      { id: "v3", date: "08 feb 2025", partySize: 3, table: "Mesa 8", ticket: 162, notes: "Cumpleaños." },
      { id: "v4", date: "19 ene 2025", partySize: 2, table: "Barra · 3", ticket: 78, notes: "Tarde tapeo." },
    ],
  },
  {
    id: "c9",
    name: "Sofía Castro",
    email: "sofia.castro@example.com",
    phone: "+34 677 332 118",
    visits: 2,
    ltv: 128,
    tags: ["nuevo"],
    lastVisit: "Hace 1 semana",
    birthday: "12 de diciembre",
    favoriteTable: "Mesa 10 · Terraza",
    allergens: ["Huevo"],
    dietary: "Omnívoro",
    acquisition: "Google Maps",
    consents: { email: true, whatsapp: true, sms: false },
    notes: "Prefiere terraza. Interesada en eventos privados.",
    history: [
      { id: "v1", date: "10 mar 2025", partySize: 4, table: "Mesa 10", ticket: 88, notes: "Almuerzo, pidió info eventos." },
      { id: "v2", date: "22 feb 2025", partySize: 2, table: "Mesa 10", ticket: 40, notes: "Café y postre." },
    ],
  },
  {
    id: "c10",
    name: "Marcos Llopis",
    email: "marcos.llopis@example.com",
    phone: "+34 656 887 002",
    visits: 6,
    ltv: 540,
    tags: ["riesgo"],
    lastVisit: "Hace 5 semanas",
    birthday: "3 de mayo",
    favoriteTable: "Mesa 2 · Centro",
    allergens: ["Soja"],
    dietary: "Omnívoro",
    acquisition: "Instagram Ads",
    consents: { email: false, whatsapp: false, sms: false },
    notes: "Revocó todos los consentimientos. No contactar por canales digitales.",
    history: [
      { id: "v1", date: "09 feb 2025", partySize: 2, table: "Mesa 2", ticket: 72, notes: "Cena normal." },
      { id: "v2", date: "21 ene 2025", partySize: 3, table: "Mesa 2", ticket: 118, notes: "Cena con amigos." },
      { id: "v3", date: "07 ene 2025", partySize: 2, table: "Mesa 2", ticket: 64, notes: "Cena rápida." },
      { id: "v4", date: "20 dic 2024", partySize: 4, table: "Mesa 2", ticket: 168, notes: "Cena navideña." },
    ],
  },
];

const ALL_TAGS: { id: TagId; label: string; tone: TagTone }[] = [
  { id: "VIP", label: "VIP", tone: "gold" },
  { id: "recurrente", label: "Recurrente", tone: "teal" },
  { id: "cumpleaños", label: "Cumpleaños", tone: "purple" },
  { id: "riesgo", label: "Riesgo", tone: "red" },
  { id: "nuevo", label: "Nuevo", tone: "blue" },
  { id: "inactivo", label: "Inactivo", tone: "muted" },
];

type TagTone = "gold" | "teal" | "purple" | "red" | "blue" | "muted";

const TAG_TONE_CLASS: Record<TagTone, string> = {
  gold: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  teal: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
  purple: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
  red: "border-destructive/45 bg-destructive/10 text-destructive",
  blue: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  muted: "border-foreground/20 bg-foreground/5 text-muted-foreground",
};

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function formatEur(n: number): string {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

/* ------------------------------------------------------------------ */
/* Demo badge                                                         */
/* ------------------------------------------------------------------ */

function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden />
      demo
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Tag chip                                                           */
/* ------------------------------------------------------------------ */

function TagChip({
  tag,
  onRemove,
  removable = false,
  disabled = false,
}: {
  tag: TagId;
  onRemove?: () => void;
  removable?: boolean;
  disabled?: boolean;
}) {
  const def = ALL_TAGS.find((t) => t.id === tag)!;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider",
        TAG_TONE_CLASS[def.tone]
      )}
    >
      {tag === "VIP" && <Crown className="h-3 w-3" aria-hidden />}
      {tag === "cumpleaños" && <Gift className="h-3 w-3" aria-hidden />}
      {tag === "riesgo" && <AlertTriangle className="h-3 w-3" aria-hidden />}
      {def.label}
      {removable && !disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-sm hover:bg-foreground/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          aria-label={`Quitar etiqueta ${def.label}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section header                                                     */
/* ------------------------------------------------------------------ */

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Consent row                                                        */
/* ------------------------------------------------------------------ */

function ConsentRow({
  channel,
  granted,
  canEdit,
  onToggle,
}: {
  channel: ConsentChannel;
  granted: boolean;
  canEdit: boolean;
  onToggle: (next: boolean) => void;
}) {
  const channelLabel: Record<ConsentChannel, string> = {
    email: "Email",
    whatsapp: "WhatsApp",
    sms: "SMS",
  };
  const channelDesc: Record<ConsentChannel, string> = {
    email: "Boletines, ofertas y confirmaciones por correo.",
    whatsapp: "Mensajes transaccionales y promociones por WhatsApp.",
    sms: "Recordatorios cortos por SMS (coste por envío).",
  };

  const tooltipText = canEdit
    ? `${channelDesc[channel]} Estado: ${granted ? "otorgado" : "revocado"}.`
    : `Sin permiso para modificar consentimientos (${channelLabel[channel]}). Solicita al Owner o Manager.`;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-foreground/[0.02] px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{channelLabel[channel]}</span>
            {granted ? (
              <Badge variant="outline" className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px] uppercase">
                <ShieldCheck className="h-3 w-3" aria-hidden /> Otorgado
              </Badge>
            ) : (
              <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive text-[10px] uppercase">
                <ShieldOff className="h-3 w-3" aria-hidden /> Revocado
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
            {channelDesc[channel]}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="inline-flex">
              <Switch
                checked={granted}
                disabled={!canEdit}
                onCheckedChange={onToggle}
                aria-label={`${granted ? "Revocar" : "Otorgar"} consentimiento ${channelLabel[channel]}`}
                aria-describedby={`consent-${channel}-desc`}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[220px]">
            <span id={`consent-${channel}-desc`}>{tooltipText}</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/* Customer list item                                                 */
/* ------------------------------------------------------------------ */

function CustomerListItem({
  customer,
  selected,
  onSelect,
}: {
  customer: Customer;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        aria-label={`Seleccionar cliente ${customer.name}, ${customer.visits} visitas`}
        className={cn(
          "group w-full text-left rounded-xl border p-3 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
          selected
            ? "border-[var(--gold)]/60 bg-[var(--gold)]/[0.07] rp-glow-gold"
            : "border-border/50 bg-foreground/[0.02] hover:border-[var(--gold)]/30 hover:bg-foreground/[0.04]"
        )}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border/60">
            <AvatarFallback
              className={cn(
                "text-xs font-medium",
                selected
                  ? "bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-black"
                  : "bg-foreground/10 text-foreground/80"
              )}
            >
              {initials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{customer.name}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{customer.visits} visitas</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" aria-hidden />
              <span className="truncate">{customer.lastVisit}</span>
            </div>
          </div>
        </div>
        {customer.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {customer.tags.map((t) => (
              <TagChip key={t} tag={t} />
            ))}
          </div>
        )}
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptySelection() {
  return (
    <div className="rp-glass flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border/60 bg-foreground/[0.03]">
        <CircleUserRound className="h-8 w-8 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="mt-5 font-display text-xl font-medium tracking-tight">
        Ningún cliente seleccionado
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Selecciona un cliente de la lista para ver su perfil completo: historial de
        visitas, preferencias, consentimientos y notas internas.
      </p>
      <Button className="mt-5" variant="outline" disabled>
        <Inbox className="h-4 w-4" aria-hidden />
        Selecciona un cliente
      </Button>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Tip: usa la búsqueda o los filtros para encontrar clientes por etiqueta.
      </p>
    </div>
  );
}

function EmptyResults({ query }: { query: string }) {
  return (
    <li className="rounded-xl border border-dashed border-border/60 bg-foreground/[0.02] p-6 text-center">
      <Search className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden />
      <p className="mt-2 text-sm text-muted-foreground">
        {query
          ? `Sin resultados para "${query}".`
          : "No hay clientes que coincidan con el filtro seleccionado."}
      </p>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Add tag dialog                                                     */
/* ------------------------------------------------------------------ */

function AddTagDialog({
  open,
  onOpenChange,
  existingTags,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existingTags: TagId[];
  onAdd: (t: TagId) => void;
}) {
  const available = ALL_TAGS.filter((t) => !existingTags.includes(t.id));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir etiqueta</DialogTitle>
          <DialogDescription>
            Selecciona una etiqueta de la lista para añadirla al cliente.
          </DialogDescription>
        </DialogHeader>
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            El cliente ya tiene todas las etiquetas disponibles.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {available.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    onAdd(t.id);
                    onOpenChange(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-foreground/[0.03] px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-foreground/80 transition-colors hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/10 hover:text-[var(--gold-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <Plus className="h-3 w-3" aria-hidden />
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Send message dialog (validated form)                              */
/* ------------------------------------------------------------------ */

function SendMessageDialog({
  open,
  onOpenChange,
  customer,
  canSend,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customer: Customer;
  canSend: boolean;
}) {
  const [channel, setChannel] = React.useState<ConsentChannel>("email");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [errors, setErrors] = React.useState<{ subject?: string; body?: string; channel?: string }>({});
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setChannel("email");
      setSubject("");
      setBody("");
      setErrors({});
      setSent(false);
    }
  }, [open, customer.id]);

  const channelConsented = customer.consents[channel];

  function validate(): boolean {
    const e: typeof errors = {};
    if (!channelConsented) {
      e.channel = `El cliente ha revocado el consentimiento para ${channel}.`;
    }
    if (channel === "email" && !subject.trim()) {
      e.subject = "El asunto es obligatorio para email.";
    }
    if (!body.trim()) {
      e.body = "El cuerpo del mensaje no puede estar vacío.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canSend) return;
    if (!validate()) return;
    setSent(true);
    setTimeout(() => onOpenChange(false), 1200);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar mensaje a {customer.name}</DialogTitle>
          <DialogDescription>
            El canal seleccionado respeta los consentimientos del cliente.
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm text-emerald-300">
            <ShieldCheck className="mr-1.5 inline h-4 w-4" aria-hidden />
            Mensaje encolado para envío (demo). Auditoría registrada.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Canal
              </label>
              <Select value={channel} onValueChange={(v) => setChannel(v as ConsentChannel)}>
                <SelectTrigger aria-label="Canal de mensaje">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
              {!channelConsented && (
                <p className="text-[11px] text-destructive flex items-center gap-1.5">
                  <ShieldOff className="h-3 w-3" aria-hidden />
                  Consentimiento revocado para este canal. Selecciona otro canal o solicita consentimiento.
                </p>
              )}
              {errors.channel && (
                <p className="text-[11px] text-destructive" role="alert">{errors.channel}</p>
              )}
            </div>
            {channel === "email" && (
              <div className="space-y-2">
                <label htmlFor="msg-subject" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Asunto <span className="text-destructive">*</span>
                </label>
                <Input
                  id="msg-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej. Detalle de tu próxima reserva"
                  aria-invalid={!!errors.subject}
                  aria-describedby={errors.subject ? "msg-subject-err" : undefined}
                />
                {errors.subject && (
                  <p id="msg-subject-err" className="text-[11px] text-destructive" role="alert">
                    {errors.subject}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="msg-body" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Mensaje <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="msg-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`Hola ${customer.name.split(" ")[0]}, …`}
                rows={5}
                aria-invalid={!!errors.body}
                aria-describedby={errors.body ? "msg-body-err" : undefined}
              />
              {errors.body && (
                <p id="msg-body-err" className="text-[11px] text-destructive" role="alert">
                  {errors.body}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSend}>
                <Send className="h-4 w-4" aria-hidden />
                Enviar
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* New reservation dialog (validated form)                           */
/* ------------------------------------------------------------------ */

function NewReservationDialog({
  open,
  onOpenChange,
  customer,
  canCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customer: Customer;
  canCreate: boolean;
}) {
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [party, setParty] = React.useState("2");
  const [errors, setErrors] = React.useState<{ date?: string; time?: string; party?: string }>({});
  const [created, setCreated] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setDate("");
      setTime("");
      setParty("2");
      setErrors({});
      setCreated(false);
    }
  }, [open, customer.id]);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!date) e.date = "La fecha es obligatoria.";
    if (!time) e.time = "La hora es obligatoria.";
    const p = Number(party);
    if (!party || Number.isNaN(p) || p < 1 || p > 20) {
      e.party = "Entre 1 y 20 comensales.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canCreate) return;
    if (!validate()) return;
    setCreated(true);
    setTimeout(() => onOpenChange(false), 1200);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva reserva · {customer.name}</DialogTitle>
          <DialogDescription>
            Crea una reserva para este cliente. La mesa se asignará desde el plano.
          </DialogDescription>
        </DialogHeader>
        {created ? (
          <div className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm text-emerald-300">
            <ShieldCheck className="mr-1.5 inline h-4 w-4" aria-hidden />
            Reserva creada (demo) para {party} comensales el {date} a las {time}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="res-date" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Fecha <span className="text-destructive">*</span>
                </label>
                <Input
                  id="res-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-invalid={!!errors.date}
                  aria-describedby={errors.date ? "res-date-err" : undefined}
                />
                {errors.date && (
                  <p id="res-date-err" className="text-[11px] text-destructive" role="alert">
                    {errors.date}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="res-time" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Hora <span className="text-destructive">*</span>
                </label>
                <Input
                  id="res-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  aria-invalid={!!errors.time}
                  aria-describedby={errors.time ? "res-time-err" : undefined}
                />
                {errors.time && (
                  <p id="res-time-err" className="text-[11px] text-destructive" role="alert">
                    {errors.time}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="res-party" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Comensales <span className="text-destructive">*</span>
              </label>
              <Input
                id="res-party"
                type="number"
                min={1}
                max={20}
                value={party}
                onChange={(e) => setParty(e.target.value)}
                aria-invalid={!!errors.party}
                aria-describedby={errors.party ? "res-party-err" : undefined}
              />
              {errors.party && (
                <p id="res-party-err" className="text-[11px] text-destructive" role="alert">
                  {errors.party}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!canCreate}>
                <CalendarPlus className="h-4 w-4" aria-hidden />
                Crear reserva
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Customer profile                                                   */
/* ------------------------------------------------------------------ */

function CustomerProfile({
  customer,
  perms,
  onTagsChange,
  onConsentChange,
  onNotesChange,
  onNewReservation,
  onSendMessage,
}: {
  customer: Customer;
  perms: Permissions;
  onTagsChange: (tags: TagId[]) => void;
  onConsentChange: (channel: ConsentChannel, granted: boolean) => void;
  onNotesChange: (notes: string) => void;
  onNewReservation: () => void;
  onSendMessage: () => void;
}) {
  const [addTagOpen, setAddTagOpen] = React.useState(false);
  const [reservationOpen, setReservationOpen] = React.useState(false);
  const [messageOpen, setMessageOpen] = React.useState(false);
  const [notesDraft, setNotesDraft] = React.useState(customer.notes);

  React.useEffect(() => {
    setNotesDraft(customer.notes);
  }, [customer.id, customer.notes]);

  const canExport = perms["crm.export"];
  const canMessage = perms["crm.message"];
  const canReserve = perms["crm.reservation.create"];
  const canEditTags = perms["crm.tag.edit"];
  const canEditConsents = perms["crm.consent.edit"];
  const canEditNotes = perms["crm.note.edit"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <section
        className="rp-glass-strong rounded-2xl p-5 sm:p-6"
        aria-labelledby="profile-name"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar className="h-16 w-16 border border-[var(--gold)]/40">
            <AvatarFallback className="bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-lg font-medium text-black">
              {initials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="profile-name" className="font-display text-2xl font-medium tracking-tight">
                {customer.name}
              </h2>
              {customer.tags.includes("VIP") && (
                <Badge className="border border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)] uppercase">
                  <Crown className="h-3 w-3" aria-hidden /> VIP
                </Badge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                <a href={`mailto:${customer.email}`} className="hover:text-foreground hover:underline">
                  {customer.email}
                </a>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" aria-hidden />
                <a href={`tel:${customer.phone.replace(/\s/g, "")}`} className="hover:text-foreground hover:underline">
                  {customer.phone}
                </a>
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {customer.tags.map((t) => (
                <TagChip
                  key={t}
                  tag={t}
                  removable={canEditTags}
                  disabled={!canEditTags}
                  onRemove={() => onTagsChange(customer.tags.filter((x) => x !== t))}
                />
              ))}
              {canEditTags && (
                <button
                  type="button"
                  onClick={() => setAddTagOpen(true)}
                  className="inline-flex items-center gap-1 rounded-md border border-dashed border-border/60 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:border-[var(--gold)]/40 hover:text-[var(--gold-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  aria-label="Añadir etiqueta"
                >
                  <Plus className="h-3 w-3" aria-hidden />
                  Añadir
                </button>
              )}
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              Valor de vida (LTV)
            </div>
            <div className="mt-1 font-display text-3xl font-light rp-gold-text sm:text-4xl">
              {formatEur(customer.ltv)}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {customer.visits} visitas · {customer.lastVisit}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
          <Button onClick={() => setReservationOpen(true)} disabled={!canReserve} className="min-h-11">
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Nueva reserva
          </Button>
          <Button variant="outline" onClick={() => setMessageOpen(true)} disabled={!canMessage} className="min-h-11">
            <Send className="h-4 w-4" aria-hidden />
            Enviar mensaje
          </Button>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-flex">
                  <Button
                    variant="outline"
                    disabled={!canExport}
                    aria-label="Exportar ficha de cliente"
                    aria-describedby="export-tip"
                    className="min-h-11"
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    Exportar
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px]">
                <span id="export-tip">
                  {canExport
                    ? "Exporta la ficha (PDF/CSV). Se audita como evento crm.export."
                    : "Sin permiso crm.export. Solicita al Owner o Manager para exportar."}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </section>

      {/* Two-column body */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Visit history */}
        <section className="rp-glass rounded-2xl p-5 sm:p-6" aria-labelledby="history-h">
          <div className="flex items-center justify-between">
            <SectionLabel icon={History}>Historial de visitas</SectionLabel>
            <DemoBadge />
          </div>
          <h3 id="history-h" className="sr-only">Historial de visitas</h3>
          <ul className="mt-4 space-y-3">
            {customer.history.map((v) => (
              <li
                key={v.id}
                className={cn(
                  "rounded-lg border border-border/50 bg-foreground/[0.02] p-3",
                  v.ticket === null && "border-destructive/30 bg-destructive/[0.04]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarPlus className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      <span className="font-medium">{v.date}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{v.partySize} pax</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      Mesa: <span className="text-foreground/80">{v.table}</span>
                    </div>
                  </div>
                  {v.ticket === null ? (
                    <Badge variant="outline" className="border-destructive/45 bg-destructive/10 text-destructive">
                      <AlertTriangle className="h-3 w-3" aria-hidden /> No-show
                    </Badge>
                  ) : (
                    <span className="font-mono text-sm rp-gold-text">{formatEur(v.ticket)}</span>
                  )}
                </div>
                {v.notes && (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{v.notes}</p>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Preferences + acquisition */}
        <section className="rp-glass rounded-2xl p-5 sm:p-6" aria-labelledby="prefs-h">
          <div className="flex items-center justify-between">
            <SectionLabel icon={Sparkles}>Preferencias y datos</SectionLabel>
            <DemoBadge />
          </div>
          <h3 id="prefs-h" className="sr-only">Preferencias y datos</h3>
          <dl className="mt-4 divide-y divide-border/40">
            <div className="flex items-start justify-between gap-3 py-3">
              <dt className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> Mesa favorita
              </dt>
              <dd className="text-sm text-foreground/90 text-right">{customer.favoriteTable}</dd>
            </div>
            <div className="flex items-start justify-between gap-3 py-3">
              <dt className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Soup className="h-3.5 w-3.5" aria-hidden /> Alérgenos
              </dt>
              <dd className="text-sm text-foreground/90 text-right">
                {customer.allergens.length ? customer.allergens.join(", ") : "Ninguno declarado"}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3 py-3">
              <dt className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Utensils className="h-3.5 w-3.5" aria-hidden /> Dieta
              </dt>
              <dd className="text-sm text-foreground/90 text-right">{customer.dietary}</dd>
            </div>
            <div className="flex items-start justify-between gap-3 py-3">
              <dt className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Gift className="h-3.5 w-3.5" aria-hidden /> Cumpleaños
              </dt>
              <dd className="text-sm text-foreground/90 text-right">{customer.birthday}</dd>
            </div>
            <div className="flex items-start justify-between gap-3 py-3">
              <dt className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Megaphone className="h-3.5 w-3.5" aria-hidden /> Fuente de captación
              </dt>
              <dd className="text-sm text-foreground/90 text-right">{customer.acquisition}</dd>
            </div>
          </dl>
        </section>

        {/* Consents */}
        <section className="rp-glass rounded-2xl p-5 sm:p-6" aria-labelledby="consent-h">
          <div className="flex items-center justify-between">
            <SectionLabel icon={ShieldCheck}>Consentimientos</SectionLabel>
            <DemoBadge />
          </div>
          <h3 id="consent-h" className="sr-only">Consentimientos</h3>
          <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
            Cada canal requiere consentimiento explícito y versionado. Revocar un canal
            bloquea el envío de mensajes por ese canal.
          </p>
          <div className="mt-3 space-y-2">
            {(["email", "whatsapp", "sms"] as ConsentChannel[]).map((ch) => (
              <ConsentRow
                key={ch}
                channel={ch}
                granted={customer.consents[ch]}
                canEdit={canEditConsents}
                onToggle={(next) => onConsentChange(ch, next)}
              />
            ))}
          </div>
          {!canEditConsents && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-amber-300">
              <Lock className="h-3 w-3" aria-hidden />
              Sin permiso para editar consentimientos.
            </p>
          )}
        </section>

        {/* Internal notes */}
        <section className="rp-glass rounded-2xl p-5 sm:p-6" aria-labelledby="notes-h">
          <div className="flex items-center justify-between">
            <SectionLabel icon={StickyNote}>Notas internas</SectionLabel>
            <DemoBadge />
          </div>
          <h3 id="notes-h" className="sr-only">Notas internas</h3>
          <Textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            disabled={!canEditNotes}
            rows={6}
            placeholder="Notas internas del equipo (no visibles para el cliente)…"
            className="mt-4 resize-none"
            aria-label="Notas internas"
          />
            <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              {canEditNotes ? "Visibles solo para el equipo del local." : "Solo lectura para tu rol."}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="min-h-9"
              disabled={!canEditNotes || notesDraft === customer.notes}
              onClick={() => onNotesChange(notesDraft)}
              aria-label="Guardar notas"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              Guardar
            </Button>
          </div>
        </section>
      </div>

      {/* Dialogs */}
      <AddTagDialog
        open={addTagOpen}
        onOpenChange={setAddTagOpen}
        existingTags={customer.tags}
        onAdd={(t) => onTagsChange([...customer.tags, t])}
      />
      <NewReservationDialog
        open={reservationOpen}
        onOpenChange={setReservationOpen}
        customer={customer}
        canCreate={canReserve}
      />
      <SendMessageDialog
        open={messageOpen}
        onOpenChange={setMessageOpen}
        customer={customer}
        canSend={canMessage}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main CRM view                                                      */
/* ------------------------------------------------------------------ */

export function CrmView() {
  const [customers, setCustomers] = React.useState<Customer[]>(DEMO_CUSTOMERS);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<FilterTab>("todos");
  const [role, setRole] = React.useState<Role>("owner");

  const perms = ROLE_PERMISSIONS[role];
  const selected = customers.find((c) => c.id === selectedId) ?? null;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q);
      const matchesFilter =
        filter === "todos" ||
        (filter === "VIP" && c.tags.includes("VIP")) ||
        (filter === "riesgo" && c.tags.includes("riesgo")) ||
        (filter === "cumpleaños" && c.tags.includes("cumpleaños"));
      return matchesQuery && matchesFilter;
    });
  }, [customers, query, filter]);

  function updateCustomer(id: string, patch: Partial<Customer>) {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
              Clientes
            </h1>
            <DemoBadge />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            CRM unificado: historial, preferencias, consentimientos y notas del equipo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Rol simulado
          </span>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className="w-full sm:w-[150px] min-h-11" aria-label="Rol simulado para permisos">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="hostess">Hostess</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* Left: customer list */}
        <aside className="rp-glass flex flex-col rounded-2xl p-4" aria-label="Lista de clientes">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, email o teléfono…"
              className="pl-9 min-h-11"
              aria-label="Buscar clientes"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filtrar clientes por etiqueta"
            className="mt-3 flex flex-wrap gap-1 rounded-lg border border-border/60 bg-foreground/[0.03] p-1"
          >
            {([
              { id: "todos", label: "Todos" },
              { id: "VIP", label: "VIP" },
              { id: "riesgo", label: "Riesgo" },
              { id: "cumpleaños", label: "Cumpleaños" },
            ] as { id: FilterTab; label: string }[]).map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  "flex-1 rounded-md px-2 py-2 min-h-9 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
                  filter === t.id
                    ? "bg-[var(--gold)] text-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{filtered.length} clientes</span>
            <DemoBadge />
          </div>

          <ul className="mt-2 max-h-[60vh] lg:max-h-[calc(100vh-340px)] min-h-[280px] space-y-2 overflow-y-auto rp-scroll-thin pr-1">
            {filtered.length === 0 ? (
              <EmptyResults query={query} />
            ) : (
              filtered.map((c) => (
                <CustomerListItem
                  key={c.id}
                  customer={c}
                  selected={c.id === selectedId}
                  onSelect={() => setSelectedId(c.id)}
                />
              ))
            )}
          </ul>
        </aside>

        {/* Right: customer profile */}
        <div className="min-w-0">
          {selected ? (
            <CustomerProfile
              key={selected.id}
              customer={selected}
              perms={perms}
              onTagsChange={(tags) => updateCustomer(selected.id, { tags })}
              onConsentChange={(ch, granted) =>
                updateCustomer(selected.id, {
                  consents: { ...selected.consents, [ch]: granted },
                })
              }
              onNotesChange={(notes) => updateCustomer(selected.id, { notes })}
              onNewReservation={() => {}}
              onSendMessage={() => {}}
            />
          ) : (
            <EmptySelection />
          )}
        </div>
      </div>
    </div>
  );
}
