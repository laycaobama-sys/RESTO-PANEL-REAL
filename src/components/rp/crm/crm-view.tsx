"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useToast } from "@/hooks/use-toast";
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
  Star,
  Clock,
  TrendingUp,
  Building2,
  Wine,
  Baby,
  TreePalm,
  UserCheck,
  ArrowLeft,
  Pencil,
  Tag as TagIcon,
  Trash2,
  Globe,
  MessageCircle,
  Smartphone,
  CalendarDays,
  Euro,
  Timer,
  Store,
  CheckCircle2,
  XCircle,
  CalendarX2,
  Languages,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type TagId =
  | "VIP"
  | "familiar"
  | "vino-blanco"
  | "terraza"
  | "cumpleaños"
  | "frecuente"
  | "empresa"
  | "alto-valor"
  | "recurrente"
  | "riesgo"
  | "nuevo"
  | "inactivo";

type ConsentChannel = "email" | "whatsapp" | "sms";

type AcquisitionChannel = "web" | "google" | "referido" | "walk-in";

type CustomerStatus = "active" | "inactive" | "vip" | "risk";

type ReservationStatus = "finalizada" | "confirmada" | "cancelada" | "no-show";

type ReservationChannel = "web" | "google" | "whatsapp" | "phone";

interface NoteEntry {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface VisitEntry {
  id: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // HH:mm
  partySize: number;
  table: string;
  zone: string;
  duration: string; // "1h 45m"
  status: ReservationStatus;
  ticket: number | null;
  rating: number | null; // 0-5
  channel: ReservationChannel;
  notes: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  language: string;
  photo?: string;
  visits: number;
  ltv: number;
  totalSpend: number;
  avgTicket: number;
  avgRating: number;
  cancellations: number;
  noShows: number;
  frequency: string;
  locationsVisited: string[];
  channelsUsed: ReservationChannel[];
  tags: TagId[];
  status: CustomerStatus;
  lastVisit: string; // pretty text
  lastVisitDate: string; // ISO date
  birthday: string;
  favoriteTable: string;
  allergens: string[];
  dietary: string;
  acquisition: string; // pretty text
  acquisitionChannel: AcquisitionChannel;
  consents: Record<ConsentChannel, boolean>;
  notes: string; // free-text general notes
  noteList: NoteEntry[]; // timestamped internal notes
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
  "crm.customer.edit": boolean;
  "crm.customer.delete": boolean;
}

const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  owner: {
    "crm.export": true,
    "crm.message": true,
    "crm.reservation.create": true,
    "crm.consent.edit": true,
    "crm.tag.edit": true,
    "crm.note.edit": true,
    "crm.customer.edit": true,
    "crm.customer.delete": true,
  },
  manager: {
    "crm.export": true,
    "crm.message": true,
    "crm.reservation.create": true,
    "crm.consent.edit": true,
    "crm.tag.edit": true,
    "crm.note.edit": true,
    "crm.customer.edit": true,
    "crm.customer.delete": false,
  },
  hostess: {
    "crm.export": false,
    "crm.message": true,
    "crm.reservation.create": true,
    "crm.consent.edit": false,
    "crm.tag.edit": false,
    "crm.note.edit": true,
    "crm.customer.edit": false,
    "crm.customer.delete": false,
  },
};

/* ------------------------------------------------------------------ */
/* Tag catalog                                                        */
/* ------------------------------------------------------------------ */

type TagTone =
  | "gold"
  | "teal"
  | "purple"
  | "red"
  | "blue"
  | "muted"
  | "green"
  | "slate"
  | "wine"
  | "fuchsia";

const TAG_TONE_CLASS: Record<TagTone, string> = {
  gold: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  teal: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
  purple: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
  red: "border-destructive/45 bg-destructive/10 text-destructive",
  blue: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  muted: "border-foreground/20 bg-foreground/5 text-muted-foreground",
  green: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  slate: "border-slate-400/40 bg-slate-400/10 text-slate-300",
  wine: "border-amber-200/40 bg-amber-200/10 text-amber-200",
  fuchsia: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
};

const ALL_TAGS: {
  id: TagId;
  label: string;
  tone: TagTone;
  icon?: React.ElementType;
}[] = [
  { id: "VIP", label: "VIP", tone: "gold", icon: Crown },
  { id: "familiar", label: "Familiar", tone: "teal", icon: Baby },
  { id: "vino-blanco", label: "Vino blanco", tone: "wine", icon: Wine },
  { id: "terraza", label: "Terraza", tone: "green", icon: TreePalm },
  { id: "cumpleaños", label: "Cumpleaños", tone: "fuchsia", icon: Gift },
  { id: "frecuente", label: "Cliente frecuente", tone: "blue", icon: UserCheck },
  { id: "empresa", label: "Empresa", tone: "slate", icon: Building2 },
  { id: "alto-valor", label: "Alto valor", tone: "gold", icon: TrendingUp },
  { id: "recurrente", label: "Recurrente", tone: "teal" },
  { id: "riesgo", label: "Riesgo", tone: "red", icon: AlertTriangle },
  { id: "nuevo", label: "Nuevo", tone: "blue" },
  { id: "inactivo", label: "Inactivo", tone: "muted" },
];

/* ------------------------------------------------------------------ */
/* Channel / status meta                                              */
/* ------------------------------------------------------------------ */

const ACQUISITION_META: Record<
  AcquisitionChannel,
  { label: string; icon: React.ElementType }
> = {
  web: { label: "Web", icon: Globe },
  google: { label: "Google", icon: Search },
  referido: { label: "Referido", icon: Users },
  "walk-in": { label: "Walk-in", icon: Store },
};

const CHANNEL_META: Record<
  ReservationChannel,
  { label: string; icon: React.ElementType }
> = {
  web: { label: "Web", icon: Globe },
  google: { label: "Google", icon: Search },
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  phone: { label: "Teléfono", icon: Phone },
};

const STATUS_META: Record<
  ReservationStatus,
  {
    label: string;
    icon: React.ElementType;
    badge: string;
    dot: string;
  }
> = {
  finalizada: {
    label: "Finalizada",
    icon: CheckCircle2,
    badge: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  confirmada: {
    label: "Confirmada",
    icon: CalendarDays,
    badge: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    dot: "bg-[var(--gold)]",
  },
  cancelada: {
    label: "Cancelada",
    icon: XCircle,
    badge: "border-destructive/45 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  "no-show": {
    label: "No-show",
    icon: CalendarX2,
    badge: "border-amber-400/45 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
};

const CUSTOMER_STATUS_META: Record<
  CustomerStatus,
  { label: string; badge: string }
> = {
  active: {
    label: "Activo",
    badge: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  },
  vip: {
    label: "VIP",
    badge: "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]",
  },
  risk: {
    label: "En riesgo",
    badge: "border-amber-400/45 bg-amber-400/10 text-amber-300",
  },
  inactive: {
    label: "Inactivo",
    badge: "border-foreground/20 bg-foreground/5 text-muted-foreground",
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function formatEur(n: number): string {
  return n.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function formatDate(iso: string): string {
  // iso "2025-03-12" → "12 mar 2025"
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/* Demo data                                                          */
/* ------------------------------------------------------------------ */

const DEMO_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Elena Marín",
    email: "elena.marin@example.com",
    phone: "+34 612 884 102",
    language: "Español",
    visits: 18,
    ltv: 4820,
    totalSpend: 4820,
    avgTicket: 268,
    avgRating: 4.7,
    cancellations: 1,
    noShows: 0,
    frequency: "2.1 visitas/mes",
    locationsVisited: ["Madrid", "Barcelona"],
    channelsUsed: ["web", "whatsapp", "phone"],
    tags: ["VIP", "alto-valor", "vino-blanco", "recurrente"],
    status: "vip",
    lastVisit: "Hace 6 días",
    lastVisitDate: "2025-03-12",
    birthday: "23 de marzo",
    favoriteTable: "Mesa 12 · Ventana",
    allergens: ["Frutos secos"],
    dietary: "Sin gluten opcional",
    acquisition: "Referido por Javier Soler",
    acquisitionChannel: "referido",
    consents: { email: true, whatsapp: true, sms: false },
    notes: "Prefiere agua con gas. Siempre pregunta por la carta de vinos Ribera.",
    noteList: [
      { id: "n1", text: "Solicita maridaje largo en cada visita. Valorar upgrade a mesa privada en próxima reserva.", author: "Ana M.", date: "2025-03-12" },
      { id: "n2", text: "Alergia a frutos secos confirmada verbalmente. Cocina avisada.", author: "Marc R.", date: "2025-02-28" },
    ],
    history: [
      { id: "v1", date: "2025-03-12", time: "21:30", partySize: 2, table: "Mesa 12", zone: "Ventana", duration: "1h 45m", status: "finalizada", ticket: 168, rating: 5, channel: "web", notes: "Cena romántica, pidieron maridaje." },
      { id: "v2", date: "2025-02-28", time: "20:30", partySize: 4, table: "Mesa 7", zone: "Salón principal", duration: "2h 10m", status: "finalizada", ticket: 312, rating: 5, channel: "phone", notes: "Aniversario, postres de cortesía." },
      { id: "v3", date: "2025-02-09", time: "14:15", partySize: 2, table: "Mesa 12", zone: "Ventana", duration: "1h 00m", status: "finalizada", ticket: 142, rating: 4, channel: "web", notes: "Visita exprés. Excelente feedback." },
      { id: "v4", date: "2025-01-21", time: "21:00", partySize: 6, table: "Mesa 3", zone: "Privado", duration: "2h 30m", status: "finalizada", ticket: 528, rating: 5, channel: "whatsapp", notes: "Cena de equipo. Factura empresa." },
      { id: "v5", date: "2025-04-18", time: "21:30", partySize: 2, table: "Mesa 12", zone: "Ventana", duration: "—", status: "confirmada", ticket: null, rating: null, channel: "web", notes: "Próxima reserva confirmada." },
    ],
  },
  {
    id: "c2",
    name: "Javier Soler",
    email: "javier.soler@example.com",
    phone: "+34 670 221 994",
    language: "Español",
    visits: 12,
    ltv: 2980,
    totalSpend: 2980,
    avgTicket: 248,
    avgRating: 4.3,
    cancellations: 0,
    noShows: 0,
    frequency: "1.4 visitas/mes",
    locationsVisited: ["Madrid"],
    channelsUsed: ["web", "google"],
    tags: ["frecuente", "terraza", "recurrente"],
    status: "active",
    lastVisit: "Hace 2 semanas",
    lastVisitDate: "2025-03-06",
    birthday: "9 de julio",
    favoriteTable: "Mesa 5 · Barra",
    allergens: [],
    dietary: "Omnívoro",
    acquisition: "Instagram Ads",
    acquisitionChannel: "google",
    consents: { email: true, whatsapp: false, sms: false },
    notes: "Suele venir los jueves. Le gustan los platos de temporada.",
    noteList: [
      { id: "n1", text: "Prefiere barra para cenas rápidas. Maridaje por copas bien recibido.", author: "Lucía P.", date: "2025-03-06" },
    ],
    history: [
      { id: "v1", date: "2025-03-06", time: "20:00", partySize: 2, table: "Mesa 5", zone: "Barra", duration: "1h 15m", status: "finalizada", ticket: 96, rating: 4, channel: "web", notes: "Barra, maridaje por copas." },
      { id: "v2", date: "2025-02-20", time: "21:30", partySize: 3, table: "Mesa 5", zone: "Barra", duration: "1h 30m", status: "finalizada", ticket: 138, rating: 4, channel: "google", notes: "Cumpleaños amigo, postre sorpresa." },
      { id: "v3", date: "2025-01-30", time: "20:45", partySize: 2, table: "Mesa 5", zone: "Barra", duration: "0h 55m", status: "finalizada", ticket: 88, rating: 4, channel: "web", notes: "Cena rápida pre-cine." },
      { id: "v4", date: "2025-01-12", time: "21:00", partySize: 4, table: "Mesa 9", zone: "Salón principal", duration: "1h 50m", status: "finalizada", ticket: 214, rating: 5, channel: "google", notes: "Trajo a Elena Marín." },
    ],
  },
  {
    id: "c3",
    name: "Marta Iborra",
    email: "marta.iborra@example.com",
    phone: "+34 699 010 558",
    language: "Español",
    visits: 5,
    ltv: 690,
    totalSpend: 690,
    avgTicket: 138,
    avgRating: 3.4,
    cancellations: 1,
    noShows: 2,
    frequency: "0.6 visitas/mes",
    locationsVisited: ["Madrid"],
    channelsUsed: ["google", "whatsapp"],
    tags: ["riesgo"],
    status: "risk",
    lastVisit: "Hace 3 semanas (no-show)",
    lastVisitDate: "2025-02-22",
    birthday: "17 de noviembre",
    favoriteTable: "—",
    allergens: ["Marisco"],
    dietary: "Pescatariana",
    acquisition: "Google Maps",
    acquisitionChannel: "google",
    consents: { email: true, whatsapp: true, sms: false },
    notes: "Dos no-shows en 3 meses. Considerar overbooking controlado o confirmación doble.",
    noteList: [
      { id: "n1", text: "Dos no-shows registrados. Activar regla de confirmación doble para próximas reservas.", author: "Ana M.", date: "2025-02-22" },
    ],
    history: [
      { id: "v1", date: "2025-02-22", time: "21:00", partySize: 2, table: "—", zone: "—", duration: "—", status: "no-show", ticket: null, rating: null, channel: "google", notes: "No-show sin previo aviso." },
      { id: "v2", date: "2025-01-11", time: "20:30", partySize: 4, table: "Mesa 4", zone: "Salón principal", duration: "1h 40m", status: "finalizada", ticket: 198, rating: 4, channel: "whatsapp", notes: "Cena normal." },
      { id: "v3", date: "2024-12-05", time: "21:30", partySize: 2, table: "—", zone: "—", duration: "—", status: "no-show", ticket: null, rating: null, channel: "google", notes: "No-show. Reagendado luego." },
      { id: "v4", date: "2024-10-18", time: "14:00", partySize: 2, table: "Mesa 8", zone: "Terraza", duration: "0h 50m", status: "finalizada", ticket: 78, rating: 3, channel: "google", notes: "Almuerzo de trabajo." },
    ],
  },
  {
    id: "c4",
    name: "David Puig",
    email: "david.puig@example.com",
    phone: "+34 655 778 220",
    language: "Inglés",
    visits: 22,
    ltv: 6340,
    totalSpend: 6340,
    avgTicket: 288,
    avgRating: 4.9,
    cancellations: 0,
    noShows: 0,
    frequency: "2.6 visitas/mes",
    locationsVisited: ["Madrid", "Barcelona", "Valencia"],
    channelsUsed: ["web", "whatsapp", "phone"],
    tags: ["VIP", "cumpleaños", "empresa", "alto-valor", "frecuente"],
    status: "vip",
    lastVisit: "Hace 4 días",
    lastVisitDate: "2025-03-14",
    birthday: "26 de marzo",
    favoriteTable: "Mesa 1 · Privado",
    allergens: ["Apio"],
    dietary: "Omnívoro",
    acquisition: "Walk-in recurrente",
    acquisitionChannel: "walk-in",
    consents: { email: true, whatsapp: true, sms: true },
    notes: "Cliente top. Cumpleaños este mes — preparar detalle y upgrade de mesa.",
    noteList: [
      { id: "n1", text: "Cumpleaños el 26/03. Preparar postre sorpresa y upgrade a mesa privada.", author: "Ana M.", date: "2025-03-14" },
      { id: "n2", text: "Factura a nombre de empresa. Solicitar CIF en cada reserva corporativa.", author: "Marc R.", date: "2025-03-01" },
      { id: "n3", text: "Alergia apio confirmada. Cocina avisada permanentemente.", author: "Lucía P.", date: "2025-02-15" },
    ],
    history: [
      { id: "v1", date: "2025-03-14", time: "21:30", partySize: 6, table: "Mesa 1", zone: "Privado", duration: "2h 40m", status: "finalizada", ticket: 642, rating: 5, channel: "phone", notes: "Cena de celebración." },
      { id: "v2", date: "2025-03-01", time: "20:30", partySize: 4, table: "Mesa 1", zone: "Privado", duration: "2h 15m", status: "finalizada", ticket: 388, rating: 5, channel: "whatsapp", notes: "Maridaje largo." },
      { id: "v3", date: "2025-02-15", time: "21:00", partySize: 2, table: "Mesa 1", zone: "Privado", duration: "1h 30m", status: "finalizada", ticket: 196, rating: 5, channel: "web", notes: "Cena íntima." },
      { id: "v4", date: "2025-01-29", time: "21:00", partySize: 8, table: "Mesa 1", zone: "Privado", duration: "3h 00m", status: "finalizada", ticket: 920, rating: 5, channel: "phone", notes: "Mesa redonda empresa." },
      { id: "v5", date: "2025-03-26", time: "21:30", partySize: 8, table: "Mesa 1", zone: "Privado", duration: "—", status: "confirmada", ticket: null, rating: null, channel: "phone", notes: "Cena de cumpleaños — detalle preparado." },
    ],
  },
  {
    id: "c5",
    name: "Lucía Ferrer",
    email: "lucia.ferrer@example.com",
    phone: "+34 622 449 770",
    language: "Español",
    visits: 1,
    ltv: 64,
    totalSpend: 64,
    avgTicket: 64,
    avgRating: 4.5,
    cancellations: 0,
    noShows: 0,
    frequency: "Primera visita",
    locationsVisited: ["Madrid"],
    channelsUsed: ["web"],
    tags: ["nuevo", "familiar", "terraza"],
    status: "active",
    lastVisit: "Hace 3 días",
    lastVisitDate: "2025-03-15",
    birthday: "2 de junio",
    favoriteTable: "Mesa 9 · Centro",
    allergens: ["Lactosa"],
    dietary: "Vegetariana",
    acquisition: "Reserva online (web)",
    acquisitionChannel: "web",
    consents: { email: true, whatsapp: false, sms: false },
    notes: "Primera visita. Pidió info sobre menú degustación vegetariano.",
    noteList: [
      { id: "n1", text: "Interesada en menú degustación vegetariano. Enviar info cuando esté disponible.", author: "Lucía P.", date: "2025-03-15" },
    ],
    history: [
      { id: "v1", date: "2025-03-15", time: "14:30", partySize: 2, table: "Mesa 9", zone: "Centro", duration: "1h 10m", status: "finalizada", ticket: 64, rating: 5, channel: "web", notes: "Primera visita, encantada con el servicio." },
      { id: "v2", date: "2025-04-05", time: "14:30", partySize: 4, table: "Mesa 9", zone: "Centro", duration: "—", status: "confirmada", ticket: null, rating: null, channel: "web", notes: "Vuelve con familia — mesa para 4." },
    ],
  },
  {
    id: "c6",
    name: "Andrés Vidal",
    email: "andres.vidal@example.com",
    phone: "+34 688 220 113",
    language: "Español",
    visits: 4,
    ltv: 412,
    totalSpend: 412,
    avgTicket: 103,
    avgRating: 3.8,
    cancellations: 0,
    noShows: 0,
    frequency: "0.4 visitas/mes",
    locationsVisited: ["Madrid"],
    channelsUsed: ["phone"],
    tags: ["riesgo", "inactivo"],
    status: "inactive",
    lastVisit: "Hace 95 días",
    lastVisitDate: "2024-12-09",
    birthday: "30 de septiembre",
    favoriteTable: "Mesa 6 · Centro",
    allergens: [],
    dietary: "Omnívoro",
    acquisition: "Referido",
    acquisitionChannel: "referido",
    consents: { email: true, whatsapp: false, sms: false },
    notes: "Sin actividad >90 días. Candidato a campaña de recuperación.",
    noteList: [
      { id: "n1", text: "Inactivo >90 días. Añadir a campaña de reactivación Q2.", author: "Ana M.", date: "2025-03-10" },
    ],
    history: [
      { id: "v1", date: "2024-12-09", time: "21:00", partySize: 3, table: "Mesa 6", zone: "Centro", duration: "1h 20m", status: "finalizada", ticket: 138, rating: 4, channel: "phone", notes: "Cena normal." },
      { id: "v2", date: "2024-11-20", time: "20:30", partySize: 2, table: "Mesa 6", zone: "Centro", duration: "1h 00m", status: "finalizada", ticket: 92, rating: 4, channel: "phone", notes: "Cena rápida." },
      { id: "v3", date: "2024-11-05", time: "21:30", partySize: 4, table: "Mesa 6", zone: "Centro", duration: "1h 45m", status: "finalizada", ticket: 184, rating: 4, channel: "phone", notes: "Aniversario." },
      { id: "v4", date: "2024-10-18", time: "21:00", partySize: 2, table: "Mesa 6", zone: "Centro", duration: "1h 10m", status: "finalizada", ticket: 88, rating: 3, channel: "phone", notes: "Cena de pareja." },
    ],
  },
  {
    id: "c7",
    name: "Carmen Ruiz",
    email: "carmen.ruiz@example.com",
    phone: "+34 644 998 030",
    language: "Español",
    visits: 31,
    ltv: 9120,
    totalSpend: 9120,
    avgTicket: 294,
    avgRating: 4.8,
    cancellations: 0,
    noShows: 0,
    frequency: "3.4 visitas/mes",
    locationsVisited: ["Madrid", "Barcelona"],
    channelsUsed: ["web", "whatsapp", "phone"],
    tags: ["VIP", "cumpleaños", "recurrente", "alto-valor", "vino-blanco"],
    status: "vip",
    lastVisit: "Ayer",
    lastVisitDate: "2025-03-16",
    birthday: "21 de marzo",
    favoriteTable: "Mesa 12 · Ventana",
    allergens: ["Gluten"],
    dietary: "Celíaca",
    acquisition: "Walk-in recurrente",
    acquisitionChannel: "walk-in",
    consents: { email: true, whatsapp: true, sms: true },
    notes: "Cliente histórico. Siempre recibe bienvenida personalizada del encargado.",
    noteList: [
      { id: "n1", text: "Cliente histórico. Bienvenida personalizada del encargado en cada visita.", author: "Ana M.", date: "2025-03-16" },
      { id: "n2", text: "Cumpleaños 21/03. Preparar detalle sin gluten.", author: "Marc R.", date: "2025-03-10" },
      { id: "n3", text: "Prefiere vinos blancos. Recomendación automática de carta blancos al sentarse.", author: "Lucía P.", date: "2025-02-14" },
    ],
    history: [
      { id: "v1", date: "2025-03-16", time: "21:00", partySize: 2, table: "Mesa 12", zone: "Ventana", duration: "1h 30m", status: "finalizada", ticket: 184, rating: 5, channel: "web", notes: "Cena habitual." },
      { id: "v2", date: "2025-03-02", time: "20:30", partySize: 4, table: "Mesa 12", zone: "Ventana", duration: "2h 00m", status: "finalizada", ticket: 356, rating: 5, channel: "whatsapp", notes: "Trajo invitados." },
      { id: "v3", date: "2025-02-14", time: "21:30", partySize: 2, table: "Mesa 12", zone: "Ventana", duration: "1h 45m", status: "finalizada", ticket: 198, rating: 5, channel: "phone", notes: "San Valentín." },
      { id: "v4", date: "2025-01-28", time: "20:00", partySize: 6, table: "Mesa 12", zone: "Ventana", duration: "2h 30m", status: "finalizada", ticket: 542, rating: 5, channel: "whatsapp", notes: "Cumpleaños familiar." },
      { id: "v5", date: "2025-03-21", time: "21:00", partySize: 4, table: "Mesa 12", zone: "Ventana", duration: "—", status: "confirmada", ticket: null, rating: null, channel: "phone", notes: "Cena de cumpleaños." },
    ],
  },
  {
    id: "c8",
    name: "Pablo Navarro",
    email: "pablo.navarro@example.com",
    phone: "+34 611 220 445",
    language: "Español",
    visits: 9,
    ltv: 1248,
    totalSpend: 1248,
    avgTicket: 139,
    avgRating: 4.1,
    cancellations: 1,
    noShows: 0,
    frequency: "1.0 visitas/mes",
    locationsVisited: ["Madrid"],
    channelsUsed: ["web", "google"],
    tags: ["frecuente", "recurrente", "terraza"],
    status: "active",
    lastVisit: "Hace 10 días",
    lastVisitDate: "2025-03-07",
    birthday: "5 de agosto",
    favoriteTable: "Barra · 3",
    allergens: [],
    dietary: "Omnívoro",
    acquisition: "Reserva online",
    acquisitionChannel: "web",
    consents: { email: true, whatsapp: false, sms: false },
    notes: "Suele tomar algo en barra antes de mesa.",
    noteList: [
      { id: "n1", text: "Patrón habitual: vermut en barra + cena ligera. Reservar mesa cercana a barra.", author: "Lucía P.", date: "2025-03-07" },
    ],
    history: [
      { id: "v1", date: "2025-03-07", time: "20:00", partySize: 2, table: "Barra · 3", zone: "Barra", duration: "1h 00m", status: "finalizada", ticket: 96, rating: 4, channel: "web", notes: "Vermut + cena ligera." },
      { id: "v2", date: "2025-02-22", time: "21:00", partySize: 2, table: "Mesa 8", zone: "Salón principal", duration: "1h 20m", status: "finalizada", ticket: 118, rating: 4, channel: "google", notes: "Cena estándar." },
      { id: "v3", date: "2025-02-08", time: "21:30", partySize: 3, table: "Mesa 8", zone: "Salón principal", duration: "1h 40m", status: "finalizada", ticket: 162, rating: 5, channel: "web", notes: "Cumpleaños." },
      { id: "v4", date: "2025-01-19", time: "13:30", partySize: 2, table: "Barra · 3", zone: "Barra", duration: "0h 45m", status: "finalizada", ticket: 78, rating: 3, channel: "google", notes: "Tarde tapeo." },
    ],
  },
  {
    id: "c9",
    name: "Sofía Castro",
    email: "sofia.castro@example.com",
    phone: "+34 677 332 118",
    language: "Inglés",
    visits: 2,
    ltv: 128,
    totalSpend: 128,
    avgTicket: 64,
    avgRating: 4.0,
    cancellations: 0,
    noShows: 0,
    frequency: "0.5 visitas/mes",
    locationsVisited: ["Madrid"],
    channelsUsed: ["google", "whatsapp"],
    tags: ["nuevo", "familiar", "terraza"],
    status: "active",
    lastVisit: "Hace 1 semana",
    lastVisitDate: "2025-03-10",
    birthday: "12 de diciembre",
    favoriteTable: "Mesa 10 · Terraza",
    allergens: ["Huevo"],
    dietary: "Omnívoro",
    acquisition: "Google Maps",
    acquisitionChannel: "google",
    consents: { email: true, whatsapp: true, sms: false },
    notes: "Prefiere terraza. Interesada en eventos privados.",
    noteList: [
      { id: "n1", text: "Interesada en eventos privados. Enviar dossier de salas y disponibilidad.", author: "Marc R.", date: "2025-03-10" },
    ],
    history: [
      { id: "v1", date: "2025-03-10", time: "14:00", partySize: 4, table: "Mesa 10", zone: "Terraza", duration: "1h 15m", status: "finalizada", ticket: 88, rating: 4, channel: "google", notes: "Almuerzo, pidió info eventos." },
      { id: "v2", date: "2025-02-22", time: "17:00", partySize: 2, table: "Mesa 10", zone: "Terraza", duration: "0h 30m", status: "finalizada", ticket: 40, rating: 4, channel: "whatsapp", notes: "Café y postre." },
    ],
  },
  {
    id: "c10",
    name: "Marcos Llopis",
    email: "marcos.llopis@example.com",
    phone: "+34 656 887 002",
    language: "Español",
    visits: 6,
    ltv: 540,
    totalSpend: 540,
    avgTicket: 90,
    avgRating: 3.6,
    cancellations: 2,
    noShows: 1,
    frequency: "0.7 visitas/mes",
    locationsVisited: ["Madrid"],
    channelsUsed: ["google"],
    tags: ["riesgo", "inactivo"],
    status: "risk",
    lastVisit: "Hace 5 semanas",
    lastVisitDate: "2025-02-09",
    birthday: "3 de mayo",
    favoriteTable: "Mesa 2 · Centro",
    allergens: ["Soja"],
    dietary: "Omnívoro",
    acquisition: "Instagram Ads",
    acquisitionChannel: "google",
    consents: { email: false, whatsapp: false, sms: false },
    notes: "Revocó todos los consentimientos. No contactar por canales digitales.",
    noteList: [
      { id: "n1", text: "Revocó todos los consentimientos (email, whatsapp, sms). NO contactar por canales digitales.", author: "Ana M.", date: "2025-02-09" },
    ],
    history: [
      { id: "v1", date: "2025-02-09", time: "21:00", partySize: 2, table: "Mesa 2", zone: "Centro", duration: "1h 10m", status: "finalizada", ticket: 72, rating: 4, channel: "google", notes: "Cena normal." },
      { id: "v2", date: "2025-01-21", time: "21:30", partySize: 3, table: "Mesa 2", zone: "Centro", duration: "1h 30m", status: "finalizada", ticket: 118, rating: 4, channel: "google", notes: "Cena con amigos." },
      { id: "v3", date: "2025-01-07", time: "21:00", partySize: 2, table: "—", zone: "—", duration: "—", status: "no-show", ticket: null, rating: null, channel: "google", notes: "No-show." },
      { id: "v4", date: "2024-12-20", time: "21:30", partySize: 4, table: "Mesa 2", zone: "Centro", duration: "2h 00m", status: "finalizada", ticket: 168, rating: 3, channel: "google", notes: "Cena navideña." },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Demo badge                                                         */
/* ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ */
/* Section header                                                     */
/* ------------------------------------------------------------------ */

function SectionLabel({
  icon: Icon,
  children,
  right,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden />
        {children}
      </div>
      {right}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stars                                                              */
/* ------------------------------------------------------------------ */

function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-4 w-4" : "h-3 w-3";
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${value.toFixed(1)} de 5 estrellas`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const isHalf = !filled && half && i === full;
        return (
          <Star
            key={i}
            className={cn(
              dim,
              filled || isHalf
                ? "fill-[var(--gold)] text-[var(--gold)]"
                : "fill-transparent text-muted-foreground/40"
            )}
            aria-hidden
          />
        );
      })}
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
  const Icon = def.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider transition-all animate-in fade-in zoom-in-50 duration-200",
        TAG_TONE_CLASS[def.tone]
      )}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden />}
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
/* Consent mini icons (header)                                        */
/* ------------------------------------------------------------------ */

function ConsentMini({ consents }: { consents: Record<ConsentChannel, boolean> }) {
  const items: { ch: ConsentChannel; icon: React.ElementType; label: string }[] = [
    { ch: "email", icon: Mail, label: "Email" },
    { ch: "whatsapp", icon: MessageCircle, label: "WhatsApp" },
    { ch: "sms", icon: Smartphone, label: "SMS" },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {items.map(({ ch, icon: Icon, label }) => {
        const granted = consents[ch];
        return (
          <Tooltip key={ch}>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-md border",
                  granted
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                    : "border-destructive/40 bg-destructive/10 text-destructive"
                )}
                aria-label={`Consentimiento ${label}: ${granted ? "otorgado" : "revocado"}`}
              >
                <Icon className="h-3 w-3" aria-hidden />
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {label}: {granted ? "otorgado" : "revocado"}
            </TooltipContent>
          </Tooltip>
        );
      })}
      <span className="ml-1 text-[11px] text-muted-foreground">Consentimientos</span>
    </div>
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
          <span
            className={cn(
              "text-[10px] font-mono uppercase tracking-wider",
              customer.status === "vip" && "text-[var(--gold-soft)]",
              customer.status === "risk" && "text-amber-300",
              customer.status === "inactive" && "text-muted-foreground",
              customer.status === "active" && "text-emerald-300"
            )}
          >
            {CUSTOMER_STATUS_META[customer.status].label}
          </span>
        </div>
        {customer.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {customer.tags.slice(0, 4).map((t) => (
              <TagChip key={t} tag={t} />
            ))}
            {customer.tags.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{customer.tags.length - 4}</span>
            )}
          </div>
        )}
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Empty states                                                       */
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
        Selecciona un cliente de la lista para ver su perfil 360°: historial,
        métricas de comportamiento, preferencias, consentimientos y notas internas.
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rp-scroll-thin">
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
            {available.map((t) => {
              const Icon = t.icon;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onAdd(t.id);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors hover:bg-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
                      TAG_TONE_CLASS[t.tone]
                    )}
                  >
                    {Icon && <Icon className="h-3 w-3" aria-hidden />}
                    {t.label}
                    <Plus className="h-3 w-3" aria-hidden />
                  </button>
                </li>
              );
            })}
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
/* Edit customer dialog                                               */
/* ------------------------------------------------------------------ */

function EditCustomerDialog({
  open,
  onOpenChange,
  customer,
  canEdit,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customer: Customer;
  canEdit: boolean;
  onSave: (patch: { name: string; email: string; phone: string; language: string; notes: string }) => void;
}) {
  const [name, setName] = React.useState(customer.name);
  const [email, setEmail] = React.useState(customer.email);
  const [phone, setPhone] = React.useState(customer.phone);
  const [language, setLanguage] = React.useState(customer.language);
  const [notes, setNotes] = React.useState(customer.notes);
  const [errors, setErrors] = React.useState<{ name?: string; email?: string; phone?: string }>({});

  React.useEffect(() => {
    if (open) {
      setName(customer.name);
      setEmail(customer.email);
      setPhone(customer.phone);
      setLanguage(customer.language);
      setNotes(customer.notes);
      setErrors({});
    }
  }, [open, customer.id, customer.name, customer.email, customer.phone, customer.language, customer.notes]);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "El nombre es obligatorio.";
    if (!email.trim()) e.email = "El email es obligatorio.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email no válido.";
    if (!phone.trim()) e.phone = "El teléfono es obligatorio.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canEdit || !validate()) return;
    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim(), language, notes });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rp-scroll-thin">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            Modifica los datos de contacto, idioma y notas generales del cliente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="edit-name" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Nombre <span className="text-destructive">*</span>
            </label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "edit-name-err" : undefined}
            />
            {errors.name && (
              <p id="edit-name-err" className="text-[11px] text-destructive" role="alert">{errors.name}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="edit-email" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!canEdit}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "edit-email-err" : undefined}
              />
              {errors.email && (
                <p id="edit-email-err" className="text-[11px] text-destructive" role="alert">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-phone" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Teléfono <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!canEdit}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "edit-phone-err" : undefined}
              />
              {errors.phone && (
                <p id="edit-phone-err" className="text-[11px] text-destructive" role="alert">{errors.phone}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-lang" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Idioma
            </label>
            <Select value={language} onValueChange={setLanguage} disabled={!canEdit}>
              <SelectTrigger id="edit-lang" aria-label="Idioma del cliente">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Español">Español</SelectItem>
                <SelectItem value="Inglés">Inglés</SelectItem>
                <SelectItem value="Francés">Francés</SelectItem>
                <SelectItem value="Alemán">Alemán</SelectItem>
                <SelectItem value="Italiano">Italiano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-notes" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Notas generales
            </label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!canEdit}
              rows={4}
              placeholder="Notas generales del cliente…"
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canEdit}>
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Add note dialog                                                    */
/* ------------------------------------------------------------------ */

function AddNoteDialog({
  open,
  onOpenChange,
  customer,
  canEdit,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customer: Customer;
  canEdit: boolean;
  onAdd: (text: string) => void;
}) {
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (open) {
      setText("");
      setError(undefined);
    }
  }, [open, customer.id]);

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canEdit) return;
    if (!text.trim()) {
      setError("La nota no puede estar vacía.");
      return;
    }
    onAdd(text.trim());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rp-scroll-thin">
        <DialogHeader>
          <DialogTitle>Añadir nota interna · {customer.name}</DialogTitle>
          <DialogDescription>
            La nota se añadirá al historial interno del cliente con tu usuario y fecha.
            No es visible para el cliente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="note-text" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Nota <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="note-text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(undefined);
              }}
              rows={5}
              placeholder="Ej. Solicita mesa alejada de la barra. Cliente alérgico a marisco."
              className="resize-none"
              aria-invalid={!!error}
              aria-describedby={error ? "note-text-err" : undefined}
            />
            {error && (
              <p id="note-text-err" className="text-[11px] text-destructive" role="alert">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canEdit}>
              <Plus className="h-4 w-4" aria-hidden />
              Añadir nota
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Comunicar (send message) dialog                                    */
/* ------------------------------------------------------------------ */

const MESSAGE_TEMPLATES: Record<ConsentChannel, string> = {
  email: "Hola {nombre},\n\nGracias por tu visita. Te recordamos que puedes reservar tu próxima mesa en cualquier momento.\n\nEl equipo de RestoPanel",
  whatsapp: "¡Hola {nombre}! 👋 Gracias por visitarnos. ¿Reservamos tu próxima mesa?",
  sms: "Hola {nombre}, gracias por tu visita. Reserva tu próxima mesa en restopanel.com",
};

function ComunicarDialog({
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
  const { toast } = useToast();
  const [channel, setChannel] = React.useState<ConsentChannel>("email");
  const [body, setBody] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [errors, setErrors] = React.useState<{ subject?: string; body?: string }>({});
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setChannel("email");
      setSubject("");
      setBody(MESSAGE_TEMPLATES.email.replace("{nombre}", customer.name.split(" ")[0]));
      setErrors({});
      setSent(false);
    }
  }, [open, customer.id, customer.name]);

  const channelConsented = customer.consents[channel];
  const consentedChannel = (["email", "whatsapp", "sms"] as ConsentChannel[]).find(
    (c) => customer.consents[c]
  );

  function onChannelChange(v: ConsentChannel) {
    setChannel(v);
    setBody(MESSAGE_TEMPLATES[v].replace("{nombre}", customer.name.split(" ")[0]));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (channel === "email" && !subject.trim()) e.subject = "El asunto es obligatorio para email.";
    if (!body.trim()) e.body = "El cuerpo del mensaje no puede estar vacío.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canSend) return;
    if (!channelConsented) return;
    if (!validate()) return;
    setSent(true);
    toast({
      title: "Mensaje encolado (demo)",
      description: `Canal ${channel} · ${customer.name} · auditoría registrada.`,
    });
    setTimeout(() => onOpenChange(false), 1200);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rp-scroll-thin">
        <DialogHeader>
          <DialogTitle>Comunicar con {customer.name}</DialogTitle>
          <DialogDescription>
            Selecciona un canal con consentimiento. Si no hay consentimiento, el envío se bloquea.
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm text-emerald-300">
            <ShieldCheck className="mr-1.5 inline h-4 w-4" aria-hidden />
            Mensaje encolado para envío (demo). Auditoría registrada.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!channelConsented && (
              <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-[12px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
                <div>
                  <p className="font-medium">Consentimiento revocado para {channel}.</p>
                  <p className="mt-0.5 text-amber-200/80">
                    {consentedChannel
                      ? `Cambia al canal ${consentedChannel} (consentimiento otorgado) o solicita consentimiento al cliente.`
                      : "El cliente ha revocado todos los canales digitales. No se puede enviar."}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Canal
              </label>
              <Select value={channel} onValueChange={(v) => onChannelChange(v as ConsentChannel)} disabled={!canSend}>
                <SelectTrigger aria-label="Canal de mensaje">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email {customer.consents.email ? "✓" : "· revocado"}</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp {customer.consents.whatsapp ? "✓" : "· revocado"}</SelectItem>
                  <SelectItem value="sms">SMS {customer.consents.sms ? "✓" : "· revocado"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {channel === "email" && (
              <div className="space-y-2">
                <label htmlFor="com-subject" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Asunto <span className="text-destructive">*</span>
                </label>
                <Input
                  id="com-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej. Detalle de tu próxima reserva"
                  disabled={!canSend || !channelConsented}
                  aria-invalid={!!errors.subject}
                />
                {errors.subject && (
                  <p className="text-[11px] text-destructive" role="alert">{errors.subject}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="com-body" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Mensaje <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="com-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                disabled={!canSend || !channelConsented}
                aria-invalid={!!errors.body}
              />
              {errors.body && (
                <p className="text-[11px] text-destructive" role="alert">{errors.body}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSend || !channelConsented}>
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
/* New reservation dialog                                             */
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
  const { toast } = useToast();
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
    toast({
      title: "Reserva creada (demo)",
      description: `${customer.name} · ${party} pax · ${date} ${time}`,
    });
    setTimeout(() => onOpenChange(false), 1200);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rp-scroll-thin">
        <DialogHeader>
          <DialogTitle>Crear reserva · {customer.name}</DialogTitle>
          <DialogDescription>
            Reserva pre-rellenada con los datos del cliente. La mesa se asignará desde el plano.
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
                  disabled={!canCreate}
                  aria-invalid={!!errors.date}
                />
                {errors.date && (
                  <p className="text-[11px] text-destructive" role="alert">{errors.date}</p>
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
                  disabled={!canCreate}
                  aria-invalid={!!errors.time}
                />
                {errors.time && (
                  <p className="text-[11px] text-destructive" role="alert">{errors.time}</p>
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
                disabled={!canCreate}
                aria-invalid={!!errors.party}
              />
              {errors.party && (
                <p className="text-[11px] text-destructive" role="alert">{errors.party}</p>
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
/* Delete customer alert dialog                                       */
/* ------------------------------------------------------------------ */

function DeleteCustomerDialog({
  open,
  onOpenChange,
  customer,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customer: Customer;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" aria-hidden />
            Eliminar cliente
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminarán el perfil, el historial y las notas de{" "}
            <span className="font-medium text-foreground">{customer.name}</span>. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Eliminar definitivamente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ------------------------------------------------------------------ */
/* Metric tile                                                        */
/* ------------------------------------------------------------------ */

function MetricTile({
  icon: Icon,
  label,
  value,
  sub,
  accent = "gold",
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: "gold" | "teal";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rp-glass rounded-xl p-3 sm:p-4 flex flex-col gap-1 min-w-0",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <Icon
          className={cn("h-3 w-3", accent === "gold" ? "text-[var(--gold)]" : "text-[var(--teal)]")}
          aria-hidden
        />
        {label}
      </div>
      <div
        className={cn(
          "font-display text-xl sm:text-2xl font-light leading-tight truncate",
          accent === "gold" ? "rp-gold-text" : "rp-teal-text"
        )}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] text-muted-foreground truncate">{sub}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline entry                                                     */
/* ------------------------------------------------------------------ */

function TimelineEntry({ entry }: { entry: VisitEntry }) {
  const meta = STATUS_META[entry.status];
  const StatusIcon = meta.icon;
  const chMeta = CHANNEL_META[entry.channel];
  const ChIcon = chMeta.icon;

  return (
    <li className="relative pl-7 pb-4 last:pb-0">
      {/* vertical line */}
      <span
        className="absolute left-[8px] top-3 bottom-0 w-px bg-border/60"
        aria-hidden
      />
      {/* dot */}
      <span
        className={cn(
          "absolute left-[2px] top-1.5 h-3.5 w-3.5 rounded-full ring-2 ring-background",
          meta.dot
        )}
        aria-hidden
      />
      <div className="rounded-lg border border-border/50 bg-foreground/[0.02] p-3">
        {/* Row 1: date/time + status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <span className="font-medium">{formatDate(entry.date)}</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-mono text-muted-foreground">{entry.time}</span>
          </div>
          <Badge variant="outline" className={cn("gap-1 text-[10px] uppercase", meta.badge)}>
            <StatusIcon className="h-3 w-3" aria-hidden />
            {meta.label}
          </Badge>
        </div>
        {/* Row 2: details grid */}
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1.5 text-[11px]">
          <div>
            <span className="text-muted-foreground">Comensales</span>
            <div className="font-medium text-foreground/90">{entry.partySize} pax</div>
          </div>
          <div>
            <span className="text-muted-foreground">Mesa</span>
            <div className="font-medium text-foreground/90 truncate">{entry.table}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Zona</span>
            <div className="font-medium text-foreground/90 truncate">{entry.zone}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Duración</span>
            <div className="font-medium text-foreground/90 inline-flex items-center gap-1">
              <Timer className="h-3 w-3 text-muted-foreground" aria-hidden />
              {entry.duration}
            </div>
          </div>
        </div>
        {/* Row 3: spend + rating + channel */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/40 pt-2.5">
          {entry.status === "finalizada" && (
            <>
              <div className="inline-flex items-center gap-1.5">
                <Euro className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden />
                <span className="font-mono text-sm rp-gold-text">
                  {entry.ticket !== null ? formatEur(entry.ticket) : "—"}
                </span>
              </div>
              {entry.rating !== null && (
                <div className="inline-flex items-center gap-1.5">
                  <Stars value={entry.rating} />
                  <span className="text-[11px] text-muted-foreground">{entry.rating.toFixed(1)}</span>
                </div>
              )}
            </>
          )}
          <div className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ChIcon className="h-3 w-3" aria-hidden />
            {chMeta.label}
          </div>
        </div>
        {entry.notes && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{entry.notes}</p>
        )}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Customer profile 360°                                              */
/* ------------------------------------------------------------------ */

function CustomerProfile({
  customer,
  perms,
  onTagsChange,
  onConsentChange,
  onNotesChange,
  onNoteListChange,
  onEditCustomer,
  onDelete,
  onBack,
}: {
  customer: Customer;
  perms: Permissions;
  onTagsChange: (tags: TagId[]) => void;
  onConsentChange: (channel: ConsentChannel, granted: boolean) => void;
  onNotesChange: (notes: string) => void;
  onNoteListChange: (notes: NoteEntry[]) => void;
  onEditCustomer: (patch: {
    name: string;
    email: string;
    phone: string;
    language: string;
    notes: string;
  }) => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const [addTagOpen, setAddTagOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [addNoteOpen, setAddNoteOpen] = React.useState(false);
  const [reservationOpen, setReservationOpen] = React.useState(false);
  const [comunicarOpen, setComunicarOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const canExport = perms["crm.export"];
  const canMessage = perms["crm.message"];
  const canReserve = perms["crm.reservation.create"];
  const canEditTags = perms["crm.tag.edit"];
  const canEditConsents = perms["crm.consent.edit"];
  const canEditNotes = perms["crm.note.edit"];
  const canEditCustomer = perms["crm.customer.edit"];
  const canDelete = perms["crm.customer.delete"];

  const acqMeta = ACQUISITION_META[customer.acquisitionChannel];
  const AcqIcon = acqMeta.icon;
  const statusMeta = CUSTOMER_STATUS_META[customer.status];

  // Sorted history: most recent first (by date desc, then time desc)
  const sortedHistory = React.useMemo(() => {
    return [...customer.history].sort((a, b) => {
      const da = a.date + " " + a.time;
      const db = b.date + " " + b.time;
      return db.localeCompare(da);
    });
  }, [customer.history]);

  function handleAddNote(text: string) {
    const newNote: NoteEntry = {
      id: `n${Date.now()}`,
      text,
      author: "Tú",
      date: new Date().toISOString().slice(0, 10),
    };
    onNoteListChange([newNote, ...customer.noteList]);
    toast({
      title: "Nota añadida (demo)",
      description: `Nota interna registrada para ${customer.name}.`,
    });
  }

  function handleExport() {
    if (!canExport) return;
    toast({
      title: "Exportando datos (demo)",
      description: `Generando JSON/CSV de ${customer.name}…`,
    });
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-300">
      {/* Back button — mobile only */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="lg:hidden min-h-11 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a la lista
      </Button>

      {/* ============ Profile header ============ */}
      <section
        className="rp-glass-strong rounded-2xl p-5 sm:p-6"
        aria-labelledby="profile-name"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20 border-2 border-[var(--gold)]/40 shrink-0">
            {customer.photo ? <AvatarImage src={customer.photo} alt={customer.name} /> : null}
            <AvatarFallback className="bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-xl font-medium text-black">
              {initials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="profile-name" className="font-display text-2xl font-medium tracking-tight">
                {customer.name}
              </h2>
              <Badge variant="outline" className={cn("gap-1 uppercase", statusMeta.badge)}>
                {statusMeta.label}
              </Badge>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5" aria-hidden />
                {customer.language}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                <a
                  href={`mailto:${customer.email}`}
                  className="hover:text-foreground hover:underline break-all"
                >
                  {customer.email}
                </a>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" aria-hidden />
                <a
                  href={`tel:${customer.phone.replace(/\s/g, "")}`}
                  className="hover:text-foreground hover:underline"
                >
                  {customer.phone}
                </a>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden />
                Última visita: <span className="text-foreground/90">{customer.lastVisit}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <AcqIcon className="h-3.5 w-3.5 text-[var(--teal)]" aria-hidden />
                Canal: <span className="text-foreground/90">{acqMeta.label}</span>
              </span>
              <TooltipProvider delayDuration={150}>
                <ConsentMini consents={customer.consents} />
              </TooltipProvider>
            </div>
          </div>
          <div className="sm:text-right shrink-0">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              Valor de vida (LTV)
            </div>
            <div className="mt-1 font-display text-3xl font-light rp-gold-text sm:text-4xl">
              {formatEur(customer.ltv)}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {customer.visits} visitas · {customer.frequency}
            </div>
          </div>
        </div>
      </section>

      {/* ============ Tags ============ */}
      <section className="rp-glass rounded-2xl p-5 sm:p-6" aria-labelledby="tags-h">
        <SectionLabel
          icon={TagIcon}
          right={}
        >
          Etiquetas
        </SectionLabel>
        <h3 id="tags-h" className="sr-only">Etiquetas</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {customer.tags.length === 0 && (
            <span className="text-sm text-muted-foreground">Sin etiquetas.</span>
          )}
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
              Añadir etiqueta
            </button>
          )}
          {!canEditTags && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-300">
              <Lock className="h-3 w-3" aria-hidden />
              Sin permiso de edición
            </span>
          )}
        </div>
      </section>

      {/* ============ Behavior metrics ============ */}
      <section className="rp-glass rounded-2xl p-5 sm:p-6" aria-labelledby="metrics-h">
        <SectionLabel icon={TrendingUp} right={}>
          Métricas de comportamiento
        </SectionLabel>
        <h3 id="metrics-h" className="sr-only">Métricas de comportamiento</h3>
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricTile icon={Euro} label="Gasto total" value={formatEur(customer.totalSpend)} accent="gold" />
          <MetricTile icon={Euro} label="Ticket medio" value={formatEur(customer.avgTicket)} accent="gold" />
          <MetricTile
            icon={Star}
            label="Valoración media"
            value={
              <span className="inline-flex items-center gap-1.5">
                {customer.avgRating.toFixed(1)}
                <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" aria-hidden />
              </span>
            }
            accent="gold"
          />
          <MetricTile icon={Users} label="Nº visitas" value={customer.visits} accent="teal" />
          <MetricTile icon={XCircle} label="Cancelaciones" value={customer.cancellations} accent="teal" />
          <MetricTile icon={CalendarX2} label="No-shows" value={customer.noShows} accent="teal" />
          <MetricTile icon={CalendarDays} label="Última visita" value={formatDate(customer.lastVisitDate)} accent="teal" />
          <MetricTile icon={Clock} label="Frecuencia" value={customer.frequency} accent="teal" />
          <MetricTile
            icon={MapPin}
            label="Locales visitados"
            value={customer.locationsVisited.join(", ")}
            accent="gold"
            className="col-span-2"
          />
          <MetricTile
            icon={Globe}
            label="Canales usados"
            value={
              <span className="inline-flex flex-wrap items-center gap-2">
                {customer.channelsUsed.map((c) => {
                  const Icon = CHANNEL_META[c].icon;
                  return (
                    <Tooltip key={c}>
                      <TooltipTrigger asChild>
                        <span
                          tabIndex={0}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-foreground/[0.03] text-foreground/80"
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">{CHANNEL_META[c].label}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </span>
            }
            accent="gold"
            className="col-span-2"
          />
        </div>
      </section>

      {/* ============ Actions bar ============ */}
      <section className="rp-glass rounded-2xl p-4 sm:p-5" aria-labelledby="actions-h">
        <h3 id="actions-h" className="sr-only">Acciones</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setEditOpen(true)}
            disabled={!canEditCustomer}
            variant="outline"
            className="min-h-11"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Editar cliente
          </Button>
          <Button
            onClick={() => setAddNoteOpen(true)}
            disabled={!canEditNotes}
            variant="outline"
            className="min-h-11"
          >
            <StickyNote className="h-4 w-4" aria-hidden />
            Añadir nota
          </Button>
          <Button
            onClick={() => setReservationOpen(true)}
            disabled={!canReserve}
            className="min-h-11"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Crear reserva
          </Button>
          <Button
            onClick={() => setAddTagOpen(true)}
            disabled={!canEditTags}
            variant="outline"
            className="min-h-11"
          >
            <TagIcon className="h-4 w-4" aria-hidden />
            Etiquetar
          </Button>
          <Button
            onClick={() => setComunicarOpen(true)}
            disabled={!canMessage}
            variant="outline"
            className="min-h-11"
          >
            <Megaphone className="h-4 w-4" aria-hidden />
            Comunicar
          </Button>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-flex">
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    disabled={!canExport}
                    aria-label="Exportar ficha de cliente"
                    className="min-h-11"
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    Exportar
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px]">
                {canExport
                  ? "Exporta la ficha (JSON/CSV). Se audita como evento crm.export."
                  : "Sin permiso crm.export. Solicita al Owner para exportar."}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-flex ml-auto">
                  <Button
                    onClick={() => setDeleteOpen(true)}
                    disabled={!canDelete}
                    variant="destructive"
                    aria-label="Eliminar cliente"
                    className="min-h-11"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Eliminar
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px]">
                {canDelete
                  ? "Elimina el cliente, su historial y notas. Acción irreversible."
                  : "Sin permiso crm.customer.delete. Solo el Owner puede eliminar."}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </section>

      {/* ============ Chronological history (timeline) ============ */}
      <section className="rp-glass rounded-2xl p-5 sm:p-6" aria-labelledby="history-h">
        <SectionLabel icon={History} right={}>
          Historial cronológico de reservas
        </SectionLabel>
        <h3 id="history-h" className="sr-only">Historial cronológico de reservas</h3>
        <ol
          className="mt-4 max-h-[400px] overflow-y-auto rp-scroll-thin pr-2"
          aria-label="Historial de reservas"
        >
          {sortedHistory.map((v) => (
            <TimelineEntry key={v.id} entry={v} />
          ))}
        </ol>
      </section>

      {/* ============ Two-column: preferences + consents ============ */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Preferences */}
        <section className="rp-glass rounded-2xl p-5 sm:p-6" aria-labelledby="prefs-h">
          <SectionLabel icon={Sparkles} right={}>
            Preferencias y datos
          </SectionLabel>
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
                <AcqIcon className="h-3.5 w-3.5" aria-hidden /> Canal de adquisición
              </dt>
              <dd className="text-sm text-foreground/90 text-right">{customer.acquisition}</dd>
            </div>
          </dl>
        </section>

        {/* Consents */}
        <section className="rp-glass rounded-2xl p-5 sm:p-6" aria-labelledby="consent-h">
          <SectionLabel icon={ShieldCheck} right={}>
            Consentimientos
          </SectionLabel>
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
      </div>

      {/* ============ Notes (general + timeline) ============ */}
      <section className="rp-glass rounded-2xl p-5 sm:p-6" aria-labelledby="notes-h">
        <SectionLabel
          icon={StickyNote}
          right={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddNoteOpen(true)}
              disabled={!canEditNotes}
              className="min-h-9"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Añadir nota
            </Button>
          }
        >
          Notas internas
        </SectionLabel>
        <h3 id="notes-h" className="sr-only">Notas internas</h3>

        {customer.notes && (
          <div className="mt-4 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/[0.04] p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)] mb-1">
              Notas generales
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{customer.notes}</p>
            {canEditCustomer && (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3 w-3" aria-hidden />
                Editar desde «Editar cliente»
              </button>
            )}
          </div>
        )}

        <div className="mt-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Histórico de notas
          </div>
          {customer.noteList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin notas registradas.</p>
          ) : (
            <ol className="relative space-y-3">
              {customer.noteList.map((n) => (
                <li
                  key={n.id}
                  className="rounded-lg border border-border/50 bg-foreground/[0.02] p-3 animate-in fade-in slide-in-from-left-1 duration-200"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground/90">{n.author}</span>
                    <span className="font-mono">{n.date}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/90 leading-relaxed">{n.text}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ============ Dialogs ============ */}
      <AddTagDialog
        open={addTagOpen}
        onOpenChange={setAddTagOpen}
        existingTags={customer.tags}
        onAdd={(t) => onTagsChange([...customer.tags, t])}
      />
      <EditCustomerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={customer}
        canEdit={canEditCustomer}
        onSave={onEditCustomer}
      />
      <AddNoteDialog
        open={addNoteOpen}
        onOpenChange={setAddNoteOpen}
        customer={customer}
        canEdit={canEditNotes}
        onAdd={handleAddNote}
      />
      <NewReservationDialog
        open={reservationOpen}
        onOpenChange={setReservationOpen}
        customer={customer}
        canCreate={canReserve}
      />
      <ComunicarDialog
        open={comunicarOpen}
        onOpenChange={setComunicarOpen}
        customer={customer}
        canSend={canMessage}
      />
      <DeleteCustomerDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        customer={customer}
        onConfirm={() => {
          setDeleteOpen(false);
          onDelete();
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main CRM view                                                      */
/* ------------------------------------------------------------------ */

export function CrmView() {
  const { toast } = useToast();
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

  function handleDelete() {
    if (!selected) return;
    const name = selected.name;
    const id = selected.id;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setSelectedId(null);
    toast({
      title: "Cliente eliminado (demo)",
      description: `${name} se ha eliminado del CRM.`,
      variant: "destructive",
    });
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
            
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            CRM 360°: perfil, historial, métricas, consentimientos y notas del equipo.
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
        <aside
          className={cn(
            "rp-glass flex flex-col rounded-2xl p-4",
            selectedId && "hidden md:flex"
          )}
          aria-label="Lista de clientes"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
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
            {(
              [
                { id: "todos", label: "Todos" },
                { id: "VIP", label: "VIP" },
                { id: "riesgo", label: "Riesgo" },
                { id: "cumpleaños", label: "Cumpleaños" },
              ] as { id: FilterTab; label: string }[]
            ).map((t) => (
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
        <div className={cn("min-w-0", !selectedId && "hidden md:block")}>
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
              onNoteListChange={(noteList) => updateCustomer(selected.id, { noteList })}
              onEditCustomer={(patch) => updateCustomer(selected.id, patch)}
              onDelete={handleDelete}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <EmptySelection />
          )}
        </div>
      </div>
    </div>
  );
}
