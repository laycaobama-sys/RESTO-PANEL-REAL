"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
  History,
  CalendarDays,
  Calendar,
  CalendarPlus,
  CalendarCheck,
  CalendarX2,
  LogIn,
  UserX,
  Utensils,
  CreditCard,
  Star,
  Mail,
  MailOpen,
  MousePointerClick,
  MessageCircle,
  Smartphone,
  Megaphone,
  Ticket,
  Gift,
  Coins,
  ArrowRightLeft,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  GitMerge,
  Users,
  Filter,
  ChevronDown,
  Hash,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type EventType =
  | "CustomerCreated" | "ReservationCreated" | "ReservationConfirmed" | "ReservationCancelled"
  | "ReservationCheckedIn" | "ReservationNoShow" | "ReservationCompleted"
  | "OrderCreated" | "PaymentCompleted" | "ReviewCreated"
  | "EmailSent" | "EmailOpened" | "EmailClicked"
  | "WhatsAppSent" | "WhatsAppDelivered" | "WhatsAppRead"
  | "SmsSent" | "CampaignEntered" | "CampaignConverted"
  | "CouponIssued" | "CouponRedeemed" | "PointsEarned" | "PointsRedeemed"
  | "GiftCardPurchased" | "ReferralCreated" | "ReferralConverted"
  | "TableChanged" | "ComplaintCreated" | "ConsentGranted" | "ConsentRevoked" | "ProfileMerged";

interface TimelineEvent {
  id: string;
  customerId: string;
  eventType: EventType;
  source: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
  occurredAt: string;
  deduplicationKey: string;
}

interface TimelineGroup {
  year: string;
  months: { month: string; events: TimelineEvent[] }[];
}

interface DemoCustomer {
  id: string;
  name: string;
  tier: string;
  events: TimelineEvent[];
  totals: {
    total: number;
    reservas: number;
    pedidos: number;
    pagos: number;
    reviews: number;
    campañas: number;
    cupones: number;
    puntos: number;
    incidencias: number;
  };
}

/* =========================================================
 * Meta — event colors, icons, labels
 * =======================================================*/
type DotColor =
  | "gold" | "green" | "teal" | "purple" | "red" | "blue" | "amber" | "muted";

const DOT_COLOR: Record<DotColor, { dot: string; ring: string; text: string }> = {
  gold:   { dot: "bg-[var(--gold)]",     ring: "ring-[var(--gold)]/30",     text: "rp-gold-text" },
  green:  { dot: "bg-emerald-400",       ring: "ring-emerald-400/30",       text: "text-emerald-300" },
  teal:   { dot: "bg-[var(--teal)]",     ring: "ring-[var(--teal)]/30",     text: "rp-teal-text" },
  purple: { dot: "bg-fuchsia-400",       ring: "ring-fuchsia-400/30",       text: "text-fuchsia-300" },
  red:    { dot: "bg-rose-400",          ring: "ring-rose-400/30",          text: "text-rose-300" },
  blue:   { dot: "bg-sky-400",           ring: "ring-sky-400/30",           text: "text-sky-300" },
  amber:  { dot: "bg-amber-400",         ring: "ring-amber-400/30",         text: "text-amber-300" },
  muted:  { dot: "bg-foreground/40",     ring: "ring-foreground/20",        text: "text-muted-foreground" },
};

const EVENT_META: Record<
  EventType,
  { label: string; color: DotColor; icon: React.ElementType; categories: string[] }
> = {
  CustomerCreated:          { label: "Cliente creado",            color: "blue",   icon: UserPlus,           categories: ["profile"] },
  ReservationCreated:       { label: "Reserva creada",            color: "gold",   icon: CalendarPlus,       categories: ["reservas"] },
  ReservationConfirmed:     { label: "Reserva confirmada",        color: "gold",   icon: CalendarCheck,      categories: ["reservas"] },
  ReservationCancelled:     { label: "Reserva cancelada",         color: "red",    icon: CalendarX2,         categories: ["reservas", "incidencias"] },
  ReservationCheckedIn:     { label: "Check-in realizado",        color: "gold",   icon: LogIn,              categories: ["reservas"] },
  ReservationNoShow:        { label: "No-show",                   color: "red",    icon: UserX,              categories: ["reservas", "incidencias"] },
  ReservationCompleted:     { label: "Reserva completada",        color: "gold",   icon: CalendarCheck,      categories: ["reservas"] },
  OrderCreated:             { label: "Pedido creado",             color: "amber",  icon: Utensils,           categories: ["pedidos"] },
  PaymentCompleted:         { label: "Pago procesado",            color: "green",  icon: CreditCard,         categories: ["pagos"] },
  ReviewCreated:            { label: "Review creada",             color: "teal",   icon: Star,               categories: ["reviews"] },
  EmailSent:                { label: "Email enviado",             color: "purple", icon: Mail,               categories: ["campañas"] },
  EmailOpened:              { label: "Email abierto",             color: "purple", icon: MailOpen,           categories: ["campañas"] },
  EmailClicked:             { label: "Email clicado",             color: "purple", icon: MousePointerClick,  categories: ["campañas"] },
  WhatsAppSent:             { label: "WhatsApp enviado",          color: "purple", icon: MessageCircle,      categories: ["campañas"] },
  WhatsAppDelivered:        { label: "WhatsApp entregado",        color: "purple", icon: MessageCircle,      categories: ["campañas"] },
  WhatsAppRead:             { label: "WhatsApp leído",            color: "purple", icon: MessageCircle,      categories: ["campañas"] },
  SmsSent:                  { label: "SMS enviado",               color: "purple", icon: Smartphone,         categories: ["campañas"] },
  CampaignEntered:          { label: "Entró en campaña",          color: "purple", icon: Megaphone,          categories: ["campañas"] },
  CampaignConverted:        { label: "Campaña convertida",        color: "purple", icon: Megaphone,          categories: ["campañas"] },
  CouponIssued:             { label: "Cupón emitido",             color: "gold",   icon: Ticket,             categories: ["cupones"] },
  CouponRedeemed:           { label: "Cupón canjeado",            color: "gold",   icon: Ticket,             categories: ["cupones"] },
  PointsEarned:             { label: "Puntos ganados",            color: "amber",  icon: Coins,              categories: ["puntos"] },
  PointsRedeemed:           { label: "Puntos canjeados",          color: "amber",  icon: Coins,              categories: ["puntos"] },
  GiftCardPurchased:        { label: "Gift card comprada",        color: "gold",   icon: Gift,               categories: ["cupones"] },
  ReferralCreated:          { label: "Referral creado",           color: "teal",   icon: Users,              categories: ["profile"] },
  ReferralConverted:        { label: "Referral convertido",       color: "teal",   icon: Users,              categories: ["profile"] },
  TableChanged:             { label: "Cambio de mesa",            color: "gold",   icon: ArrowRightLeft,     categories: ["reservas"] },
  ComplaintCreated:         { label: "Incidencia registrada",     color: "red",    icon: AlertTriangle,      categories: ["incidencias"] },
  ConsentGranted:           { label: "Consentimiento otorgado",   color: "blue",   icon: ShieldCheck,        categories: ["consentimientos"] },
  ConsentRevoked:           { label: "Consentimiento revocado",   color: "blue",   icon: ShieldAlert,        categories: ["consentimientos"] },
  ProfileMerged:            { label: "Perfil fusionado",          color: "blue",   icon: GitMerge,           categories: ["profile"] },
};

const FILTERS: { id: string; label: string; icon: React.ElementType; categories: string[] }[] = [
  { id: "todas",            label: "Todas",           icon: Filter,            categories: [] },
  { id: "reservas",         label: "Reservas",        icon: Calendar,          categories: ["reservas"] },
  { id: "pedidos",          label: "Pedidos",         icon: Utensils,          categories: ["pedidos"] },
  { id: "pagos",            label: "Pagos",           icon: CreditCard,        categories: ["pagos"] },
  { id: "reviews",          label: "Reviews",         icon: Star,              categories: ["reviews"] },
  { id: "campañas",         label: "Campañas",        icon: Megaphone,         categories: ["campañas"] },
  { id: "cupones",          label: "Cupones",         icon: Ticket,            categories: ["cupones"] },
  { id: "puntos",           label: "Puntos",          icon: Coins,             categories: ["puntos"] },
  { id: "incidencias",      label: "Incidencias",     icon: AlertTriangle,     categories: ["incidencias"] },
  { id: "consentimientos",  label: "Consentimientos", icon: ShieldCheck,       categories: ["consentimientos"] },
  { id: "cambios-perfil",   label: "Cambios perfil",  icon: UserPlus,          categories: ["profile"] },
];

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/* =========================================================
 * Helpers
 * =======================================================*/
function isoAt(year: number, month: number, day: number, hour: number, minute: number): string {
  // month is 1-indexed for readability
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  const h = String(hour).padStart(2, "0");
  const min = String(minute).padStart(2, "0");
  return `${year}-${m}-${d}T${h}:${min}:00.000Z`;
}

function formatDateLabel(iso: string): { day: string; time: string } {
  const d = new Date(iso);
  const day = `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS_ES[d.getUTCMonth()].slice(0, 3).toLowerCase()}`;
  const time = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  return { day, time };
}

function shortId(id: string): string {
  return id.length > 14 ? `${id.slice(0, 14)}…` : id;
}

function eventMatchesFilters(event: TimelineEvent, activeFilters: Set<string>): boolean {
  if (activeFilters.size === 0 || activeFilters.has("todas")) return true;
  const meta = EVENT_META[event.eventType];
  if (!meta) return false;
  for (const f of activeFilters) {
    if (f === "todas") continue;
    const filter = FILTERS.find((x) => x.id === f);
    if (!filter) continue;
    if (meta.categories.some((c) => filter.categories.includes(c))) return true;
  }
  return false;
}

function groupEvents(events: TimelineEvent[]): TimelineGroup[] {
  const sorted = [...events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const map = new Map<string, Map<number, TimelineEvent[]>>();
  for (const e of sorted) {
    const d = new Date(e.occurredAt);
    const year = String(d.getUTCFullYear());
    const month = d.getUTCMonth(); // 0-indexed
    if (!map.has(year)) map.set(year, new Map());
    const ym = map.get(year)!;
    if (!ym.has(month)) ym.set(month, []);
    ym.get(month)!.push(e);
  }
  const groups: TimelineGroup[] = [];
  for (const [year, ym] of Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))) {
    const months = Array.from(ym.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([month, events]) => ({ month: MONTHS_ES[month], events }));
    groups.push({ year, months });
  }
  return groups;
}

function renderPayloadSummary(event: TimelineEvent): React.ReactNode {
  const p = event.payload;
  switch (event.eventType) {
    case "ReservationCreated":
    case "ReservationConfirmed":
    case "ReservationCheckedIn":
    case "ReservationCompleted":
      return (
        <>
          <span className="text-foreground/85">
            Mesa {String(p.table ?? "—")} · {String(p.pax ?? "—")} pax
          </span>
          {p.amount != null && (
            <span className="rp-gold-text font-mono"> · €{String(p.amount)}</span>
          )}
          {p.duration != null && (
            <span className="text-muted-foreground"> · {String(p.duration)}</span>
          )}
        </>
      );
    case "ReservationCancelled":
      return (
        <>
          <span className="text-rose-300/90">{String(p.reason ?? "Cancelada")}</span>
          {p.refunded != null && (
            <span className="text-muted-foreground">
              {" "}- reembolso {p.refunded === "true" ? "emitido" : "no emitido"}
            </span>
          )}
        </>
      );
    case "ReservationNoShow":
      return (
        <span className="text-rose-300/90">
          {String(p.partySize ?? "—")} pax · depósito {String(p.depositStatus ?? "—")}
        </span>
      );
    case "OrderCreated":
      return (
        <span>
          {String(p.itemCount ?? "—")} items · {String(p.channel ?? "—")}
          {p.amount != null && <span className="rp-gold-text font-mono"> · €{String(p.amount)}</span>}
        </span>
      );
    case "PaymentCompleted":
      return (
        <span>
          <span className="rp-gold-text font-mono">€{String(p.amount ?? "—")}</span>
          <span className="text-muted-foreground"> · {String(p.method ?? "—")} · {String(p.reference ?? "—")}</span>
        </span>
      );
    case "ReviewCreated":
      return (
        <span>
          <span className="text-amber-300">{p.rating != null ? `${String(p.rating)}★` : "—"}</span>
          {p.comment != null && (
            <span className="text-foreground/80"> · “{String(p.comment)}”</span>
          )}
          <span className="text-muted-foreground"> · {String(p.channel ?? "—")}</span>
        </span>
      );
    case "EmailSent":
    case "EmailOpened":
    case "EmailClicked":
      return (
        <span>
          <span className="text-foreground/85">Email · {String(p.template ?? "—")}</span>
          {p.campaign != null && <span className="text-muted-foreground"> · {String(p.campaign)}</span>}
          {p.subject != null && <span className="text-muted-foreground"> · “{String(p.subject)}”</span>}
        </span>
      );
    case "WhatsAppSent":
    case "WhatsAppDelivered":
    case "WhatsAppRead":
      return (
        <span>
          <span className="text-foreground/85">WhatsApp · Plantilla: {String(p.template ?? "—")}</span>
          {p.campaign != null && <span className="text-muted-foreground"> · {String(p.campaign)}</span>}
        </span>
      );
    case "SmsSent":
      return (
        <span>
          <span className="text-foreground/85">SMS · {String(p.template ?? "—")}</span>
        </span>
      );
    case "CampaignEntered":
    case "CampaignConverted":
      return (
        <span>
          <span className="text-foreground/85">Campaña: {String(p.campaignName ?? "—")}</span>
          {p.conversion != null && <span className="rp-gold-text"> · {String(p.conversion)}</span>}
        </span>
      );
    case "CouponIssued":
    case "CouponRedeemed":
      return (
        <span>
          <span className="text-foreground/85">Cupón: {String(p.code ?? "—")}</span>
          {p.discount != null && <span className="rp-gold-text font-mono"> · {String(p.discount)}</span>}
        </span>
      );
    case "PointsEarned":
    case "PointsRedeemed":
      return (
        <span>
          <span className={p.direction === "redeemed" ? "text-amber-300" : "rp-gold-text"}>
            {p.direction === "redeemed" ? "−" : "+"}{String(p.points ?? "—")} pts
          </span>
          <span className="text-muted-foreground"> · saldo {String(p.balance ?? "—")} pts</span>
        </span>
      );
    case "GiftCardPurchased":
      return (
        <span>
          <span className="rp-gold-text font-mono">€{String(p.amount ?? "—")}</span>
          <span className="text-muted-foreground"> · {String(p.recipient ?? "—")} · código {String(p.code ?? "—")}</span>
        </span>
      );
    case "ReferralCreated":
    case "ReferralConverted":
      return (
        <span>
          <span className="text-foreground/85">Referido: {String(p.referredName ?? "—")}</span>
          {p.reward != null && <span className="rp-gold-text"> · {String(p.reward)}</span>}
        </span>
      );
    case "TableChanged":
      return (
        <span>
          <span className="text-foreground/85">Mesa {String(p.fromTable ?? "—")} → {String(p.toTable ?? "—")}</span>
          <span className="text-muted-foreground"> · {String(p.reason ?? "—")}</span>
        </span>
      );
    case "ComplaintCreated":
      return (
        <span>
          <span className="text-rose-300/90">{String(p.summary ?? "—")}</span>
          {p.resolution != null && <span className="text-muted-foreground"> · {String(p.resolution)}</span>}
        </span>
      );
    case "ConsentGranted":
      return (
        <span>
          <span className="text-foreground/85">Canales: {String(p.channels ?? "—")}</span>
          <span className="text-muted-foreground"> · {String(p.policyVersion ?? "—")}</span>
        </span>
      );
    case "ConsentRevoked":
      return (
        <span>
          <span className="text-foreground/85">Canales: {String(p.channels ?? "—")}</span>
          <span className="text-muted-foreground"> · motivo {String(p.reason ?? "—")}</span>
        </span>
      );
    case "ProfileMerged":
      return (
        <span>
          <span className="text-foreground/85">Origen: {String(p.sourceProfile ?? "—")}</span>
          <span className="text-muted-foreground"> · {String(p.reason ?? "—")}</span>
        </span>
      );
    case "CustomerCreated":
      return (
        <span>
          <span className="text-foreground/85">Origen: {String(p.source ?? "—")}</span>
          {p.referrer != null && <span className="text-muted-foreground"> · referido por {String(p.referrer)}</span>}
        </span>
      );
    default:
      return null;
  }
}

/* =========================================================
 * Demo data
 * =======================================================*/
function makeEvent(
  id: string,
  customerId: string,
  eventType: EventType,
  source: string,
  entityType: string,
  entityId: string,
  occurredAt: string,
  payload: Record<string, unknown>,
): TimelineEvent {
  return {
    id,
    customerId,
    eventType,
    source,
    entityType,
    entityId,
    payload,
    occurredAt,
    deduplicationKey: `${entityType}:${entityId}:${eventType}`,
  };
}

const ELENA_EVENTS: TimelineEvent[] = [
  // 2025-01
  makeEvent("evt_01", "cust-1", "ReservationCompleted", "reservations", "Reservation", "res_01HZX4J9K8Q7M3N2P1R0S", isoAt(2025, 1, 15, 21, 30), { table: "M12", pax: 4, amount: "168", duration: "1h 45min" }),
  makeEvent("evt_02", "cust-1", "ReviewCreated", "reviews", "Review", "rev_01HZY2K8L9M4N5O6P7Q8", isoAt(2025, 1, 18, 10, 12), { rating: 5, comment: "Servicio excelente, volveré", channel: "Google" }),
  makeEvent("evt_03", "cust-1", "PointsEarned", "loyalty", "PointsLedger", "pts_01HZZ1A2B3C4D5E6F7G8", isoAt(2025, 1, 18, 10, 14), { points: 17, direction: "earned", balance: 412 }),
  makeEvent("evt_04", "cust-1", "EmailOpened", "campaigns", "Email", "eml_01HZX8B2C3D4E5F6G7H9", isoAt(2025, 1, 20, 11, 5), { template: "cumpleaños", campaign: "cump-2025-01", subject: "Elena, ¡tarta de regalo!" }),
  makeEvent("evt_05", "cust-1", "CampaignConverted", "campaigns", "Campaign", "cmp_01HZX9C3D4E5F6G7H8I0", isoAt(2025, 1, 22, 19, 48), { campaignName: "cump-2025-01", conversion: "reserva + tarta gratis" }),
  makeEvent("evt_06", "cust-1", "WhatsAppSent", "campaigns", "WhatsApp", "wa_01HZX0D4E5F6G7H8I9J1", isoAt(2025, 1, 22, 12, 0), { template: "recordatorio-reserva", campaign: "ops-recordatorio" }),
  makeEvent("evt_07", "cust-1", "ReservationConfirmed", "reservations", "Reservation", "res_01HZX5K0L1M2N3O4P5Q6", isoAt(2025, 1, 25, 14, 22), { table: "M12", pax: 4, amount: "168", duration: "1h 30min" }),

  // 2024-12
  makeEvent("evt_08", "cust-1", "ReservationCancelled", "reservations", "Reservation", "res_01HZW0L1M2N3O4P5Q6R7", isoAt(2024, 12, 10, 16, 30), { reason: "Imprevisto personal", refunded: "true" }),
  makeEvent("evt_09", "cust-1", "GiftCardPurchased", "pos", "GiftCard", "gc_01HZW1M2N3O4P5Q6R7S8", isoAt(2024, 12, 15, 13, 10), { amount: "100", recipient: "Carlos M.", code: "GC-7H3K" }),
  makeEvent("evt_10", "cust-1", "ReservationCompleted", "reservations", "Reservation", "res_01HZW2N3O4P5Q6R7S8T9", isoAt(2024, 12, 20, 21, 0), { table: "T3", pax: 2, amount: "84", duration: "1h 20min" }),
  makeEvent("evt_11", "cust-1", "CouponRedeemed", "campaigns", "Coupon", "cpn_01HZW3O4P5Q6R7S8T9U0", isoAt(2024, 12, 20, 21, 5), { code: "NAVIDAD10", discount: "-€10" }),
  makeEvent("evt_12", "cust-1", "PointsEarned", "loyalty", "PointsLedger", "pts_01HZW4P5Q6R7S8T9U0V1", isoAt(2024, 12, 20, 21, 30), { points: 8, direction: "earned", balance: 395 }),
  makeEvent("evt_13", "cust-1", "ReviewCreated", "reviews", "Review", "rev_01HZW5Q6R7S8T9U0V1W2", isoAt(2024, 12, 28, 9, 30), { rating: 4, comment: "Buen ambiente", channel: "TripAdvisor" }),

  // 2024-11
  makeEvent("evt_14", "cust-1", "PointsRedeemed", "loyalty", "PointsLedger", "pts_01HZV0R7S8T9U0V1W2X3", isoAt(2024, 11, 5, 18, 0), { points: 100, direction: "redeemed", balance: 387 }),
  makeEvent("evt_15", "cust-1", "EmailClicked", "campaigns", "Email", "eml_01HZV1S8T9U0V1W2X3Y4", isoAt(2024, 11, 10, 10, 45), { template: "vip-experience", campaign: "vip-2024-11", subject: "Experiencia maridaje en diciembre" }),
  makeEvent("evt_16", "cust-1", "EmailOpened", "campaigns", "Email", "eml_01HZV1S8T9U0V1W2X3Y5", isoAt(2024, 11, 10, 10, 44), { template: "vip-experience", campaign: "vip-2024-11", subject: "Experiencia maridaje en diciembre" }),
  makeEvent("evt_17", "cust-1", "ReservationCompleted", "reservations", "Reservation", "res_01HZV2T9U0V1W2X3Y4Z5", isoAt(2024, 11, 15, 20, 30), { table: "M12", pax: 6, amount: "252", duration: "2h 10min" }),
  makeEvent("evt_18", "cust-1", "ComplaintCreated", "crm", "Complaint", "inc_01HZV3U0V1W2X3Y4Z5A6", isoAt(2024, 11, 15, 21, 5), { summary: "Retraso 20 min en mesa", resolution: "Café de cortesía" }),

  // 2024-10
  makeEvent("evt_19", "cust-1", "CustomerCreated", "crm", "Customer", "cus_01HZU0V1W2X3Y4Z5A6B7", isoAt(2024, 10, 1, 9, 0), { source: "walk-in → registro", referrer: null }),
  makeEvent("evt_20", "cust-1", "ConsentGranted", "crm", "Consent", "cnt_01HZU1W2X3Y4Z5A6B7C8", isoAt(2024, 10, 1, 9, 5), { channels: "marketing+email+whatsapp", policyVersion: "v2.1" }),
  makeEvent("evt_21", "cust-1", "ReservationCompleted", "reservations", "Reservation", "res_01HZU2X3Y4Z5A6B7C8D9", isoAt(2024, 10, 5, 14, 0), { table: "T3", pax: 2, amount: "56", duration: "1h" }),
  makeEvent("evt_22", "cust-1", "WhatsAppSent", "campaigns", "WhatsApp", "wa_01HZU3Y4Z5A6B7C8D9E0", isoAt(2024, 10, 5, 12, 30), { template: "confirmación-reserva", campaign: "ops-confirmacion" }),
  makeEvent("evt_23", "cust-1", "PointsEarned", "loyalty", "PointsLedger", "pts_01HZU4Z5A6B7C8D9E0F1", isoAt(2024, 10, 5, 15, 0), { points: 6, direction: "earned", balance: 6 }),
];

const MARCO_EVENTS: TimelineEvent[] = [
  makeEvent("evt_m1", "cust-2", "ReservationCompleted", "reservations", "Reservation", "res_01HAA0A1B2C3D4E5F6G7", isoAt(2025, 1, 22, 21, 15), { table: "VIP1", pax: 2, amount: "245", duration: "2h" }),
  makeEvent("evt_m2", "cust-2", "PaymentCompleted", "pos", "Payment", "pay_01HAA1B2C3D4E5F6G7H8", isoAt(2025, 1, 22, 23, 0), { amount: "245", method: "AMEX", reference: "TXN-9F2K" }),
  makeEvent("evt_m3", "cust-2", "PointsEarned", "loyalty", "PointsLedger", "pts_01HAA2C3D4E5F6G7H8I9", isoAt(2025, 1, 22, 23, 1), { points: 25, direction: "earned", balance: 1284 }),
  makeEvent("evt_m4", "cust-2", "ReviewCreated", "reviews", "Review", "rev_01HAA3D4E5F6G7H8I9J0", isoAt(2025, 1, 23, 8, 30), { rating: 5, comment: "Experiencia maridaje memorable", channel: "Google" }),
  makeEvent("evt_m5", "cust-2", "CampaignConverted", "campaigns", "Campaign", "cmp_01HAA4E5F6G7H8I9J0K1", isoAt(2025, 1, 20, 19, 0), { campaignName: "vip-maridaje-2025", conversion: "reserva VIP" }),
  makeEvent("evt_m6", "cust-2", "WhatsAppRead", "campaigns", "WhatsApp", "wa_01HAA5F6G7H8I9J0K1L2", isoAt(2025, 1, 18, 11, 0), { template: "vip-invite", campaign: "vip-maridaje-2025" }),
  makeEvent("evt_m7", "cust-2", "ReservationCompleted", "reservations", "Reservation", "res_01HAA6G7H8I9J0K1L2M3", isoAt(2024, 12, 28, 21, 30), { table: "VIP1", pax: 4, amount: "420", duration: "2h 30min" }),
  makeEvent("evt_m8", "cust-2", "GiftCardPurchased", "pos", "GiftCard", "gc_01HAA7H8I9J0K1L2M3N4", isoAt(2024, 12, 15, 14, 0), { amount: "250", recipient: "Sofia B.", code: "GC-2K9P" }),
];

const LUCIA_EVENTS: TimelineEvent[] = [
  makeEvent("evt_l1", "cust-3", "CustomerCreated", "crm", "Customer", "cus_01HBB0A1B2C3D4E5F6G7", isoAt(2025, 1, 19, 20, 15), { source: "online-reservation", referrer: "Elena Marín" }),
  makeEvent("evt_l2", "cust-3", "ConsentGranted", "crm", "Consent", "cnt_01HBB1B2C3D4E5F6G7H8", isoAt(2025, 1, 19, 20, 16), { channels: "email", policyVersion: "v2.1" }),
  makeEvent("evt_l3", "cust-3", "ReservationConfirmed", "reservations", "Reservation", "res_01HBB2C3D4E5F6G7H8I9", isoAt(2025, 1, 19, 20, 17), { table: "T5", pax: 2, amount: "62", duration: "1h 15min" }),
  makeEvent("evt_l4", "cust-3", "ReservationCompleted", "reservations", "Reservation", "res_01HBB3D4E5F6G7H8I9J0", isoAt(2025, 1, 22, 21, 0), { table: "T5", pax: 2, amount: "62", duration: "1h 15min" }),
  makeEvent("evt_l5", "cust-3", "PaymentCompleted", "pos", "Payment", "pay_01HBB4E5F6G7H8I9J0K1", isoAt(2025, 1, 22, 22, 15), { amount: "62", method: "Visa", reference: "TXN-3R8L" }),
  makeEvent("evt_l6", "cust-3", "EmailSent", "campaigns", "Email", "eml_01HBB5F6G7H8I9J0K1L2", isoAt(2025, 1, 23, 10, 0), { template: "bienvenida", campaign: "onboarding-2025", subject: "Bienvenida a RestoPanel" }),
];

const DEMO_CUSTOMERS: DemoCustomer[] = [
  {
    id: "cust-1",
    name: "Elena Marín",
    tier: "Oro",
    events: ELENA_EVENTS,
    totals: { total: 342, reservas: 15, pedidos: 38, pagos: 8, reviews: 3, campañas: 12, cupones: 5, puntos: 42, incidencias: 2 },
  },
  {
    id: "cust-2",
    name: "Marco Bellini",
    tier: "Black",
    events: MARCO_EVENTS,
    totals: { total: 1247, reservas: 42, pedidos: 168, pagos: 41, reviews: 6, campañas: 38, cupones: 12, puntos: 124, incidencias: 1 },
  },
  {
    id: "cust-3",
    name: "Lucía Ferrer",
    tier: "Nuevo",
    events: LUCIA_EVENTS,
    totals: { total: 6, reservas: 2, pedidos: 1, pagos: 1, reviews: 0, campañas: 1, cupones: 0, puntos: 1, incidencias: 0 },
  },
];

/* =========================================================
 * Sub-components
 * =======================================================*/
function FilterChip({
  filter,
  active,
  count,
  onClick,
}: {
  filter: { id: string; label: string; icon: React.ElementType };
  active: boolean;
  count?: number;
  onClick: () => void;
}) {
  const Icon = filter.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 h-9 sm:h-10 whitespace-nowrap text-xs font-medium transition-colors shrink-0",
        "min-h-[44px] sm:min-h-[40px]",
        active
          ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold-soft)]"
          : "border-foreground/12 bg-foreground/[0.03] text-muted-foreground hover:text-foreground hover:border-foreground/25"
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {filter.label}
      {count != null && (
        <span
          className={cn(
            "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-mono",
            active ? "bg-[var(--gold)]/20 text-[var(--gold-soft)]" : "bg-foreground/8 text-muted-foreground/80"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function EventRow({
  event,
  index,
  reduceMotion,
}: {
  event: TimelineEvent;
  index: number;
  reduceMotion: boolean | null;
}) {
  const meta = EVENT_META[event.eventType];
  const Icon = meta?.icon ?? History;
  const color = meta?.color ?? "muted";
  const dc = DOT_COLOR[color];
  const { day, time } = formatDateLabel(event.occurredAt);
  const [open, setOpen] = React.useState(false);

  return (
    <motion.div
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: reduceMotion ? 0 : Math.min(index * 0.02, 0.2) }}
      className="grid grid-cols-[58px_18px_1fr] sm:grid-cols-[72px_22px_1fr] gap-x-2 sm:gap-x-3 gap-y-0"
    >
      {/* Date column */}
      <div className="pt-3 text-right">
        <div className="text-[11px] font-mono text-foreground/80 leading-tight">{day}</div>
        <div className="text-[10px] font-mono text-muted-foreground/70 leading-tight">{time}</div>
      </div>

      {/* Dot + vertical line column */}
      <div className="relative flex flex-col items-center">
        <div className="absolute top-0 bottom-0 w-px bg-border/70" aria-hidden />
        <span
          className={cn(
            "relative z-10 mt-3.5 h-3 w-3 rounded-full ring-2 ring-background",
            dc.dot
          )}
          aria-hidden
        />
      </div>

      {/* Event card */}
      <div
        className={cn(
          "rp-glass rounded-lg p-3 mb-3 mr-1 transition-colors hover:bg-foreground/[0.04]",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", dc.text)}>
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {meta?.label ?? event.eventType}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-foreground/10 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {event.source}
          </span>
        </div>

        <div className="mt-1.5 text-xs leading-relaxed text-foreground/80">
          {renderPayloadSummary(event) ?? (
            <span className="text-muted-foreground italic">Sin detalles</span>
          )}
        </div>

        <Collapsible open={open} onOpenChange={setOpen}>
          <div className="mt-2 flex items-center gap-3 text-[10px] font-mono text-muted-foreground/70">
            <span className="inline-flex items-center gap-1">
              <Hash className="h-2.5 w-2.5" aria-hidden />
              {shortId(event.entityId)}
            </span>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                aria-expanded={open}
                aria-label="Ver clave de deduplicación"
              >
                <ChevronDown
                  className={cn("h-2.5 w-2.5 transition-transform", open && "rotate-180")}
                  aria-hidden
                />
                dedup
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="mt-1.5 rounded-md border border-foreground/8 bg-foreground/[0.025] px-2 py-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 mb-0.5">
                Deduplication key
              </div>
              <code className="text-[10px] font-mono text-foreground/75 break-all leading-relaxed">
                {event.deduplicationKey}
              </code>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </motion.div>
  );
}

function CustomerHeader({ customer }: { customer: DemoCustomer }) {
  return (
    <motion.div
      key={customer.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rp-glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 font-display text-base font-medium rp-gold-text">
          {customer.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="font-display text-base sm:text-lg font-medium text-foreground truncate">
            {customer.name}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">
            {customer.tier} · {customer.events.length} eventos mostrados
          </div>
        </div>
      </div>
      <div className="sm:ml-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-muted-foreground">
        <span><span className="text-foreground/80">{customer.totals.total}</span> total</span>
        <span><span className="text-foreground/80">{customer.totals.reservas}</span> reservas</span>
        <span><span className="text-foreground/80">{customer.totals.pagos}</span> pagos</span>
        <span><span className="text-foreground/80">{customer.totals.reviews}</span> reviews</span>
        <span><span className="text-foreground/80">{customer.totals.campañas}</span> campañas</span>
        <span><span className="text-foreground/80">{customer.totals.incidencias}</span> incidencias</span>
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Main
 * =======================================================*/
export function CrmTimeline() {
  const reduceMotion = useReducedMotion();
  const [customerId, setCustomerId] = React.useState<string>("cust-1");
  const [activeFilters, setActiveFilters] = React.useState<Set<string>>(new Set(["todas"]));

  const customer = React.useMemo(
    () => DEMO_CUSTOMERS.find((c) => c.id === customerId) ?? DEMO_CUSTOMERS[0],
    [customerId]
  );

  const filteredEvents = React.useMemo(
    () => customer.events.filter((e) => eventMatchesFilters(e, activeFilters)),
    [customer, activeFilters]
  );

  const groups = React.useMemo(() => groupEvents(filteredEvents), [filteredEvents]);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (id === "todas") {
        // "Todas" is exclusive — clears everything else
        return new Set(["todas"]);
      }
      next.delete("todas");
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (next.size === 0) next.add("todas");
      return next;
    });
  };

  const totalFiltersActive = activeFilters.has("todas") ? 0 : activeFilters.size;

  return (
    <section
      className="space-y-5 sm:space-y-6"
      aria-labelledby="crm-timeline-heading"
    >
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/10">
            <History className="h-5 w-5 rp-teal-text" aria-hidden />
          </span>
          <div>
            <h2
              id="crm-timeline-heading"
              className="font-display text-xl sm:text-2xl font-medium tracking-tight text-foreground"
            >
              Timeline del cliente
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Log inmutable y versionado de eventos, agrupado por fecha.
            </p>
          </div>
          <Badge
            variant="outline"
            className="ml-1 border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)] font-mono uppercase tracking-wider text-[10px]"
          >
            demo
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="sr-only" htmlFor="tl-cust-select">
            Seleccionar cliente
          </label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger
              id="tl-cust-select"
              className="w-full sm:w-[280px] h-10 bg-background/40"
              aria-label="Seleccionar cliente"
            >
              <SelectValue placeholder="Selecciona un cliente" />
            </SelectTrigger>
            <SelectContent>
              {DEMO_CUSTOMERS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">· {c.tier} · {c.events.length} eventos</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Customer context strip */}
      <CustomerHeader customer={customer} />

      {/* Event count summary */}
      <div className="rp-glass rounded-xl p-3 sm:p-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-foreground font-medium">
          <History className="h-3.5 w-3.5 rp-gold-text" aria-hidden />
          <span className="font-mono text-sm">{customer.totals.total}</span>
          <span className="text-muted-foreground">eventos totales</span>
        </div>
        <div className="hidden sm:block h-3 w-px bg-border/60" aria-hidden />
        <span className="text-muted-foreground">
          <span className="font-mono text-foreground/80">{customer.totals.reservas}</span> reservas ·{" "}
          <span className="font-mono text-foreground/80">{customer.totals.pagos}</span> pagos ·{" "}
          <span className="font-mono text-foreground/80">{customer.totals.reviews}</span> reviews ·{" "}
          <span className="font-mono text-foreground/80">{customer.totals.campañas}</span> campañas ·{" "}
          <span className="font-mono text-foreground/80">{customer.totals.cupones}</span> cupones ·{" "}
          <span className="font-mono text-foreground/80">{customer.totals.incidencias}</span> incidencias
        </span>
      </div>

      {/* Filter bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          <Filter className="h-3 w-3" aria-hidden />
          Filtros
          {totalFiltersActive > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-1.5 py-0.5 text-[10px] rp-gold-text">
              {totalFiltersActive} activo{totalFiltersActive > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto rp-scroll-thin pb-2 -mx-1 px-1">
          {FILTERS.map((f) => (
            <FilterChip
              key={f.id}
              filter={f}
              active={activeFilters.has(f.id)}
              onClick={() => toggleFilter(f.id)}
            />
          ))}
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="rp-glass rounded-2xl p-4 sm:p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${customer.id}-${Array.from(activeFilters).sort().join(",")}`}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {groups.length === 0 ? (
              <div className="py-16 text-center">
                <Filter className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" aria-hidden />
                <p className="text-sm text-muted-foreground">
                  No hay eventos que coincidan con los filtros seleccionados.
                </p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto rp-scroll-thin pr-1 -mr-1">
                {groups.map((group) => (
                  <div key={group.year} className="mb-6 last:mb-0">
                    {/* Year header */}
                    <div className="sticky top-0 z-10 mb-3 -mx-1 px-1 py-1.5 rp-glass-strong rounded-md">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 rp-gold-text" aria-hidden />
                        <span className="font-display text-lg font-medium text-foreground">{group.year}</span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                          {group.months.reduce((acc, m) => acc + m.events.length, 0)} eventos
                        </span>
                      </div>
                    </div>

                    {/* Months */}
                    <div className="space-y-5">
                      {group.months.map((m) => (
                        <div key={m.month}>
                          {/* Month subheader */}
                          <div className="mb-2 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" aria-hidden />
                            <span className="text-sm font-medium text-foreground/90">{m.month}</span>
                            <span className="text-[10px] font-mono text-muted-foreground/70">
                              {m.events.length} evento{m.events.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Events */}
                          <div>
                            {m.events.map((e, i) => (
                              <EventRow
                                key={e.id}
                                event={e}
                                index={i}
                                reduceMotion={reduceMotion}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Immutability note */}
      <footer className="rp-glass rounded-xl p-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/10">
          <ShieldCheck className="h-3.5 w-3.5 rp-teal-text" aria-hidden />
        </span>
        <div className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/85">Timeline inmutable</span> · Cada evento es versionado e idempotente ·{" "}
          Los eventos pueden reprocesarse sin duplicar efectos.
          <span className="block mt-1 text-[11px] text-muted-foreground/70">
            Las claves de deduplicación garantizan que reintentos o re-emisiones no dupliquen efectos (puntos, cupones, notificaciones).
          </span>
        </div>
      </footer>
    </section>
  );
}
