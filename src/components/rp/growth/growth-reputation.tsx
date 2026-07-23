"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { toast } from "@/hooks/use-toast";
import {
  Star,
  Info,
  Sparkles,
  RefreshCw,
  Send,
  Check,
  X,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  ThumbsUp,
  MessageSquare,
  Bell,
  Settings2,
  Filter,
  Globe,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Gauge,
} from "lucide-react";

/* =====================================================================
 * Types
 * ===================================================================== */

type ReviewPlatform =
  | "google"
  | "tripadvisor"
  | "facebook"
  | "instagram"
  | "thefork"
  | "yelp"
  | "internal";

type Sentiment = "positive" | "neutral" | "negative";
type ReviewStatus = "new" | "replied" | "pending_approval" | "escalated";

interface Review {
  id: string;
  platform: ReviewPlatform;
  author: string;
  rating: number;
  text: string;
  sentiment: Sentiment;
  sentimentScore: number;
  topics: string[];
  date: string;
  status: ReviewStatus;
  reply?: string;
  replyApproved?: boolean;
  location?: string;
  aiReplySuggestion?: string;
}

type Tone = "profesional" | "cercano" | "formal" | "disculpas";

/* =====================================================================
 * Platform metadata
 * ===================================================================== */

const PLATFORM_META: Record<
  ReviewPlatform,
  { label: string; color: string; bg: string; border: string; text: string; icon: React.ElementType }
> = {
  google: {
    label: "Google",
    color: "#4285F4",
    bg: "bg-blue-500/10",
    border: "border-blue-500/40",
    text: "text-blue-300",
    icon: Globe,
  },
  tripadvisor: {
    label: "TripAdvisor",
    color: "#34A853",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/40",
    text: "text-emerald-300",
    icon: Globe,
  },
  facebook: {
    label: "Facebook",
    color: "#1877F2",
    bg: "bg-blue-600/10",
    border: "border-blue-600/40",
    text: "text-blue-300",
    icon: Globe,
  },
  instagram: {
    label: "Instagram",
    color: "#E1306C",
    bg: "bg-pink-500/10",
    border: "border-pink-500/40",
    text: "text-pink-300",
    icon: Globe,
  },
  thefork: {
    label: "TheFork",
    color: "#E63946",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    text: "text-red-300",
    icon: Globe,
  },
  yelp: {
    label: "Yelp",
    color: "#D32323",
    bg: "bg-red-600/10",
    border: "border-red-600/40",
    text: "text-red-300",
    icon: Globe,
  },
  internal: {
    label: "Interna",
    color: "#3DD6C9",
    bg: "bg-[var(--teal)]/10",
    border: "border-[var(--teal)]/40",
    text: "text-[var(--teal)]",
    icon: MessageSquare,
  },
};

const TOPIC_LABELS: Record<string, string> = {
  food: "Comida",
  service: "Servicio",
  ambiance: "Ambiente",
  price: "Precio",
  wait_time: "Tiempo espera",
  cleanliness: "Limpieza",
  staff: "Personal",
};

/* =====================================================================
 * Demo data
 * ===================================================================== */

const PLATFORM_COUNTS: { platform: ReviewPlatform; count: number }[] = [
  { platform: "google", count: 89 },
  { platform: "tripadvisor", count: 23 },
  { platform: "facebook", count: 12 },
  { platform: "instagram", count: 8 },
  { platform: "thefork", count: 15 },
  { platform: "yelp", count: 5 },
  { platform: "internal", count: 95 },
];

const REVIEWS: Review[] = [
  {
    id: "rv1",
    platform: "google",
    author: "María G.",
    rating: 5,
    text: "Servicio excelente, comida deliciosa. El cochinillo estaba espectacular y el equipo nos atendió de maravilla. Volveremos seguro.",
    sentiment: "positive",
    sentimentScore: 95,
    topics: ["food", "service"],
    date: "Hace 2 días",
    status: "new",
    location: "Madrid",
    aiReplySuggestion:
      "¡Gracias María! Nos alegra muchísimo que disfrutarais del cochinillo y el servicio. Ya le hemos hecho llegar tus palabras al equipo. ¡Os esperamos pronto! — Equipo RestoPanel Madrid",
  },
  {
    id: "rv2",
    platform: "google",
    author: "Carlos R.",
    rating: 4,
    text: "Muy bueno pero algo caro. La calidad justifica el precio en parte, pero el menú mediodía podría ser más accesible.",
    sentiment: "positive",
    sentimentScore: 72,
    topics: ["food", "price"],
    date: "Hace 3 días",
    status: "new",
    location: "Madrid",
    aiReplySuggestion:
      "Carlos, gracias por tu reseña. Valoramos tu comentario sobre el precio del menú mediodía: lo revisaremos con el equipo. ¡Esperamos verte pronto! — Equipo RestoPanel",
  },
  {
    id: "rv3",
    platform: "tripadvisor",
    author: "Annette B.",
    rating: 2,
    text: "Esperamos 40 minutos para sentarnos pese a tener reserva. El camarero estaba agobiado y el ritmo del servicio se resintió.",
    sentiment: "negative",
    sentimentScore: 78,
    topics: ["wait_time", "service"],
    date: "Hace 4 días",
    status: "pending_approval",
    location: "Madrid",
    aiReplySuggestion:
      "Annette, sentimos muchísimo la espera. No es nuestra norma: tenemos un protocolo de reserva que falló esa noche. Nos gustaría invitarte a volver para mostrarte el servicio que sí podemos dar. Escribenos a hola@restopanel.com. — Equipo RestoPanel Madrid",
  },
  {
    id: "rv4",
    platform: "google",
    author: "Javier M.",
    rating: 5,
    text: "Mejor terraza de Madrid. Ambiente íntimo, vistas increíbles y servicio impecable. Reservé para aniversario y nos sorprendieron con detalle.",
    sentiment: "positive",
    sentimentScore: 98,
    topics: ["ambiance", "service"],
    date: "Hace 5 días",
    status: "replied",
    reply: "¡Gracias Javier! Fue un placer celebrar vuestro aniversario. ¡Hasta pronto!",
    replyApproved: true,
    location: "Madrid",
  },
  {
    id: "rv5",
    platform: "thefork",
    author: "Laura P.",
    rating: 3,
    text: "Comida correcta pero sin destacar. El pulpo estaba bien de cocción pero le faltaba chispa. Relación calidad-precio media.",
    sentiment: "neutral",
    sentimentScore: 52,
    topics: ["food"],
    date: "Hace 6 días",
    status: "new",
    location: "Madrid",
    aiReplySuggestion:
      "Laura, gracias por la reseña. Tomamos nota del comentario sobre el pulpo: lo comentaremos con cocina. Te animamos a probar nuestro menú degustación en la próxima visita. — Equipo RestoPanel",
  },
  {
    id: "rv6",
    platform: "internal",
    author: "Cliente #1234",
    rating: 1,
    text: "Cliente insatisfecho con el trato del camarero. Indica que fue descortés al pedir cambiar un plato. Solicita que lo gestione un supervisor.",
    sentiment: "negative",
    sentimentScore: 88,
    topics: ["service", "staff"],
    date: "Hace 1 día",
    status: "escalated",
    location: "Barcelona",
    aiReplySuggestion: "",
  },
  {
    id: "rv7",
    platform: "facebook",
    author: "Sofía L.",
    rating: 5,
    text: "Celebré mi cumpleaños, espectacular. Tarta sorpresa, atención cercana y ambiente perfecto para grupo de 10. Repetiremos.",
    sentiment: "positive",
    sentimentScore: 96,
    topics: ["ambiance", "service"],
    date: "Hace 1 semana",
    status: "replied",
    reply: "¡Gracias por celebrarlo con nosotros, Sofia! Fue un día especial.",
    replyApproved: true,
    location: "Madrid",
  },
  {
    id: "rv8",
    platform: "google",
    author: "Andrés V.",
    rating: 4,
    text: "Volveré, pero mejorar la limpieza del baño. La comida y el servicio estupendos. Solo ese detalle a mejorar.",
    sentiment: "positive",
    sentimentScore: 68,
    topics: ["cleanliness"],
    date: "Hace 1 semana",
    status: "new",
    location: "Madrid",
    aiReplySuggestion:
      "Andrés, gracias por tus palabras sobre comida y servicio. Tomamos muy en serio tu comentario sobre limpieza: lo hemos trasladado a responsabilidad de sala. ¡Gracias por avisar! — Equipo RestoPanel",
  },
];

const SENTIMENT_DISTRIBUTION = [
  { sentiment: "positive" as const, pct: 89, count: 1110, color: "var(--teal)" },
  { sentiment: "neutral" as const, pct: 8, count: 100, color: "var(--gold)" },
  { sentiment: "negative" as const, pct: 3, count: 37, color: "#ef4444" },
];

const TOPICS_ANALYSIS = [
  { topic: "food", count: 842, label: "Comida" },
  { topic: "service", count: 678, label: "Servicio" },
  { topic: "ambiance", count: 412, label: "Ambiente" },
  { topic: "price", count: 287, label: "Precio" },
  { topic: "wait_time", count: 154, label: "Tiempo espera" },
  { topic: "cleanliness", count: 86, label: "Limpieza" },
];

const RATING_EVOLUTION = [
  { month: "Oct", value: 4.4 },
  { month: "Nov", value: 4.5 },
  { month: "Dic", value: 4.5 },
  { month: "Ene", value: 4.6 },
  { month: "Feb", value: 4.6 },
  { month: "Mar", value: 4.6 },
];

const RECURRING_PROBLEMS = [
  { issue: "Tiempo de espera en hora punta", mentions: 38, pct: 12 },
  { issue: "Limpieza del baño", mentions: 14, pct: 4 },
  { issue: "Precio elevado en menú mediodía", mentions: 11, pct: 3 },
  { issue: "Falta de vegetarianos en carta", mentions: 7, pct: 2 },
  { issue: "Ruido en sala principal", mentions: 5, pct: 1 },
];

const BEST_WORST = {
  byWaiter: {
    best: { name: "Lucía F.", rating: 4.9, mentions: 124 },
    worst: { name: "Marco D.", rating: 4.1, mentions: 38 },
  },
  byDish: {
    best: { name: "Cochinillo", rating: 4.9, mentions: 218 },
    worst: { name: "Pulpo a la gallega", rating: 3.8, mentions: 52 },
  },
  byZone: {
    best: { name: "Terraza", rating: 4.8, mentions: 196 },
    worst: { name: "Sala interior", rating: 4.3, mentions: 142 },
  },
};

const PLATFORM_COMPARISON = [
  { platform: "google" as ReviewPlatform, avgRating: 4.7, count: 89, responseRate: 92, responseTime: "3h" },
  { platform: "tripadvisor" as ReviewPlatform, avgRating: 4.4, count: 23, responseRate: 78, responseTime: "8h" },
  { platform: "facebook" as ReviewPlatform, avgRating: 4.8, count: 12, responseRate: 65, responseTime: "1d" },
  { platform: "instagram" as ReviewPlatform, avgRating: 4.6, count: 8, responseRate: 0, responseTime: "—" },
  { platform: "thefork" as ReviewPlatform, avgRating: 4.3, count: 15, responseRate: 60, responseTime: "1d" },
  { platform: "yelp" as ReviewPlatform, avgRating: 4.2, count: 5, responseRate: 40, responseTime: "2d" },
  { platform: "internal" as ReviewPlatform, avgRating: 4.5, count: 95, responseRate: 100, responseTime: "0h" },
];

const NPS_EVOLUTION = [
  { month: "Oct", value: 62 },
  { month: "Nov", value: 65 },
  { month: "Dic", value: 64 },
  { month: "Ene", value: 68 },
  { month: "Feb", value: 70 },
  { month: "Mar", value: 72 },
];

const NPS_BY_LOCATION = [
  { location: "Madrid", score: 74, promoters: 70, passives: 22, detractors: 8 },
  { location: "Barcelona", score: 69, promoters: 65, passives: 26, detractors: 9 },
  { location: "Valencia", score: 71, promoters: 67, passives: 24, detractors: 9 },
];

const NPS_BY_SHIFT = [
  { shift: "Comida", score: 75, promoters: 71, passives: 22, detractors: 7 },
  { shift: "Cena", score: 69, promoters: 65, passives: 26, detractors: 9 },
];

const NPS_AUTO_ACTIONS = [
  {
    bucket: "Promotores (9-10)",
    pct: 68,
    action: "Solicitar reseña pública",
    detail: "Se envía automáticamente email + WhatsApp 24h tras visita con enlace a Google.",
    tone: "teal" as const,
    icon: Star,
  },
  {
    bucket: "Pasivos (7-8)",
    pct: 24,
    action: "Enviar oferta de retorno",
    detail: "Oferta -15% en próxima reserva, enviada 7 días tras la visita.",
    tone: "gold" as const,
    icon: RefreshCw,
  },
  {
    bucket: "Detractores (0-6)",
    pct: 8,
    action: "Derivar a atención al cliente",
    detail: "Crea incidente + notifica al gerente. SLA de respuesta: 2h.",
    tone: "red" as const,
    icon: ShieldAlert,
  },
];

const SURVEY_QUESTIONS = [
  { id: "q1", label: "Valoración de la comida", type: "rating", active: true },
  { id: "q2", label: "Valoración del servicio", type: "rating", active: true },
  { id: "q3", label: "Valoración del ambiente", type: "rating", active: true },
  { id: "q4", label: "NPS (¿recomendarías?)", type: "nps", active: true },
  { id: "q5", label: "Comentario abierto", type: "text", active: true },
];

const SURVEY_METRICS = {
  sent: 247,
  opened: 189,
  completed: 142,
};

const SURVEY_RESULTS = [
  { label: "Comida", rating: 4.5 },
  { label: "Servicio", rating: 4.3 },
  { label: "Ambiente", rating: 4.7 },
  { label: "NPS medio", rating: 7.2, suffix: "/10" },
];

const OPEN_COMMENTS = [
  { id: "oc1", text: "El servicio fue excelente, pero el tiempo de espera fue largo.", sentiment: "neutral" as const, score: 52, author: "Cliente #1192", date: "Hace 2 horas" },
  { id: "oc2", text: "Volveré sin duda, todo perfecto.", sentiment: "positive" as const, score: 95, author: "Cliente #1188", date: "Hace 5 horas" },
  { id: "oc3", text: "El pulpo necesitaba más sabor, pero el ambiente es top.", sentiment: "neutral" as const, score: 60, author: "Cliente #1184", date: "Hace 8 horas" },
  { id: "oc4", text: "Nos trataron mal al pedir cambio de plato.", sentiment: "negative" as const, score: 82, author: "Cliente #1179", date: "Hace 1 día" },
  { id: "oc5", text: "Celebramos aniversario y fue inolvidable.", sentiment: "positive" as const, score: 98, author: "Cliente #1172", date: "Hace 1 día" },
];

/* =====================================================================
 * Helpers
 * ===================================================================== */

function sentimentColor(s: Sentiment): string {
  return s === "positive" ? "var(--teal)" : s === "neutral" ? "var(--gold)" : "#ef4444";
}

function sentimentLabel(s: Sentiment): string {
  return s === "positive" ? "Positivo" : s === "neutral" ? "Neutral" : "Negativo";
}

function statusMeta(s: ReviewStatus): { label: string; cls: string } {
  switch (s) {
    case "new":
      return { label: "Nueva", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300" };
    case "replied":
      return { label: "Respondida", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" };
    case "pending_approval":
      return { label: "Pendiente aprobación", cls: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]" };
    case "escalated":
      return { label: "Escalada", cls: "border-destructive/40 bg-destructive/10 text-destructive" };
  }
}

function npsColor(score: number): string {
  if (score >= 50) return "var(--teal)";
  if (score >= 20) return "var(--gold)";
  return "#ef4444";
}

function confidenceColor(c: number): string {
  if (c >= 90) return "text-emerald-300";
  if (c >= 80) return "rp-teal-text";
  if (c >= 70) return "text-amber-300";
  return "text-destructive";
}

/* =====================================================================
 * Shared UI atoms
 * ===================================================================== */

function InfoDot({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Definición"
            className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-foreground/20 text-muted-foreground transition-colors hover:border-[var(--gold)]/50 hover:text-[var(--gold)]"
          >
            <Info className="h-2.5 w-2.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed border-border/60">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      demo
    </span>
  );
}

function MiniBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "gold" | "teal";
}) {
  const tones: Record<string, string> = {
    default: "border-foreground/15 bg-foreground/5 text-muted-foreground",
    gold: "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    teal: "border-[var(--teal)]/30 bg-[var(--teal)]/10 text-[var(--teal)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={cn(
            n <= rating ? "fill-[var(--gold)] text-[var(--gold)]" : "fill-none text-foreground/25"
          )}
        />
      ))}
    </span>
  );
}

/* =====================================================================
 * Bandeja tab
 * ===================================================================== */

function Summary() {
  const reduce = useReducedMotion();
  const cells = [
    { label: "Rating medio", value: "4.6", suffix: "★", tone: "gold" as const, def: "Media ponderada de todas las plataformas." },
    { label: "Reseñas totales", value: "1.247", tone: "default" as const, def: "Reseñas agregadas de todas las plataformas conectadas." },
    { label: "Positivas", value: "89%", tone: "teal" as const, def: "Reseñas con sentimiento positive (score ≥60)." },
    { label: "Neutras", value: "8%", tone: "gold" as const, def: "Reseñas con sentimiento neutral (40-59)." },
    { label: "Negativas", value: "3%", tone: "default" as const, def: "Reseñas con sentimiento negative (<40)." },
    { label: "Pendientes", value: "42", tone: "default" as const, def: "Reseñas nuevas o pendientes de aprobación." },
  ];
  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cells.map((c, i) => (
          <motion.div
            key={c.label}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
            className="rounded-xl bg-foreground/[0.025] border border-foreground/10 p-3"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {c.label}
              </span>
              <InfoDot text={c.def} />
            </div>
            <div
              className={cn(
                "mt-1.5 font-display text-xl font-light",
                c.tone === "gold" && "rp-gold-text",
                c.tone === "teal" && "rp-teal-text",
                c.tone === "default" && "text-foreground"
              )}
            >
              {c.value}
              {c.suffix && <span className="text-sm ml-0.5">{c.suffix}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PlatformFilters({
  active,
  onChange,
}: {
  active: ReviewPlatform | "all";
  onChange: (p: ReviewPlatform | "all") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        onClick={() => onChange("all")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors min-h-[32px]",
          active === "all"
            ? "border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
            : "border-foreground/15 bg-foreground/[0.03] text-muted-foreground hover:border-foreground/30"
        )}
      >
        Todas ({PLATFORM_COUNTS.reduce((a, p) => a + p.count, 0)})
      </button>
      {PLATFORM_COUNTS.map((p) => {
        const meta = PLATFORM_META[p.platform];
        const Icon = meta.icon;
        const isActive = active === p.platform;
        return (
          <button
            key={p.platform}
            onClick={() => onChange(p.platform)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors min-h-[32px]",
              isActive
                ? cn(meta.border, meta.bg, meta.text)
                : "border-foreground/15 bg-foreground/[0.03] text-muted-foreground hover:border-foreground/30"
            )}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
            {meta.label} ({p.count})
          </button>
        );
      })}
    </div>
  );
}

function RatingFilter({
  active,
  onChange,
}: {
  active: number | "all";
  onChange: (r: number | "all") => void;
}) {
  const opts: (number | "all")[] = ["all", 5, 4, 3, 2, 1];
  const labels: Record<string, string> = { all: "Todas", "5": "5★", "4": "4★", "3": "3★", "2": "2★", "1": "1★" };
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mr-1">
        Rating
      </span>
      {opts.map((o) => (
        <button
          key={String(o)}
          onClick={() => onChange(o)}
          aria-pressed={active === o}
          className={cn(
            "inline-flex items-center rounded-md border px-2.5 py-1 text-xs transition-colors min-h-[28px]",
            active === o
              ? "border-[var(--gold)]/50 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
              : "border-foreground/15 bg-foreground/[0.03] text-muted-foreground hover:border-foreground/30"
          )}
        >
          {labels[String(o)]}
        </button>
      ))}
    </div>
  );
}

const TONE_LABELS: Record<Tone, string> = {
  profesional: "Profesional",
  cercano: "Cercano",
  formal: "Formal",
  disculpas: "Con disculpas",
};

const TONE_VARIANTS: Record<Tone, (author: string) => string> = {
  profesional: (a) =>
    `Estimado/a ${a}, agradecemos sinceramente sus comentarios. Su opinión nos ayuda a mejorar. Le esperamos en su próxima visita. — Equipo RestoPanel`,
  cercano: (a) =>
    `¡Mil gracias, ${a}! Nos hace mucha ilusión leer esto. Ya le hemos dicho al equipo lo que escribiste. ¡Te esperamos pronto! — Equipo RestoPanel`,
  formal: (a) =>
    `${a}, le agradecemos sus comentarios. Tomamos nota de su observación y trabajaremos en ello. Quedamos a su disposición. — Dirección RestoPanel`,
  disculpas: (a) =>
    `${a}, le pedimos nuestras más sinceras disculpas por la experiencia descrita. No es nuestro estándar. Nos gustaría compensarle en su próxima visita. — Equipo RestoPanel`,
};

function ReviewCard({ review }: { review: Review }) {
  const reduce = useReducedMotion();
  const meta = PLATFORM_META[review.platform];
  const Icon = meta.icon;
  const sMeta = statusMeta(review.status);
  const [expanded, setExpanded] = React.useState(false);
  const [showAI, setShowAI] = React.useState(review.status === "new" || review.status === "pending_approval");
  const [tone, setTone] = React.useState<Tone>("profesional");
  const [draft, setDraft] = React.useState(review.aiReplySuggestion || "");
  const [regenerating, setRegenerating] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [escalateOpen, setEscalateOpen] = React.useState(false);
  const [discarded, setDiscarded] = React.useState(false);

  React.useEffect(() => {
    if (!showAI) return;
    setDraft(review.aiReplySuggestion || TONE_VARIANTS.profesional(review.author));
  }, [review.aiReplySuggestion, review.author, showAI]);

  function regenerate() {
    setRegenerating(true);
    setTimeout(() => {
      setDraft(TONE_VARIANTS[tone](review.author));
      setRegenerating(false);
      toast({ title: "Respuesta regenerada", description: `Tono: ${TONE_LABELS[tone]}` });
    }, 700);
  }

  function publish() {
    setConfirmOpen(false);
    toast({
      title: "Respuesta publicada",
      description: `Se publicó en ${meta.label}.`,
    });
    setShowAI(false);
    setDiscarded(false);
  }

  function escalate() {
    setEscalateOpen(false);
    toast({
      title: "Incidente creado",
      description: `Reseña escalada a gestión. SLA 2h.`,
    });
  }

  const isNegative = review.sentiment === "negative";
  const textTruncated = review.text.length > 140 && !expanded;
  const displayText = textTruncated ? review.text.slice(0, 140) + "…" : review.text;

  return (
    <motion.div
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rp-glass rounded-2xl p-4 sm:p-5 transition-colors",
        review.status === "escalated" && "border-l-2 border-l-destructive/60"
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
              meta.bg,
              meta.border,
              meta.text
            )}
            title={meta.label}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">{review.author}</span>
              <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono", meta.border, meta.bg, meta.text)}>
                {meta.label}
              </span>
              <Stars rating={review.rating} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {review.date}
              </span>
              {review.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {review.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
              "border-foreground/15 bg-foreground/[0.04]",
              "text-foreground/80"
            )}
            style={{ color: sentimentColor(review.sentiment) }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: sentimentColor(review.sentiment) }} />
            {sentimentLabel(review.sentiment)} · {review.sentimentScore}%
          </span>
          <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider", sMeta.cls)}>
            {sMeta.label}
          </span>
        </div>
      </div>

      {/* Text */}
      <p className="mt-3 text-sm leading-relaxed text-foreground/90">
        {displayText}
        {textTruncated && (
          <button
            onClick={() => setExpanded(true)}
            className="ml-1 text-[var(--teal)] hover:underline"
          >
            ver más
          </button>
        )}
        {expanded && review.text.length > 140 && (
          <button
            onClick={() => setExpanded(false)}
            className="ml-1 text-[var(--teal)] hover:underline"
          >
            ver menos
          </button>
        )}
      </p>

      {/* Topics */}
      {review.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Temas
          </span>
          {review.topics.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-md border border-foreground/15 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] text-foreground/80"
            >
              {TOPIC_LABELS[t] || t}
            </span>
          ))}
        </div>
      )}

      {/* Existing reply */}
      {review.status === "replied" && review.reply && (
        <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-400/[0.06] p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300 mb-1">
            <Check className="h-3 w-3" />
            Respuesta publicada
          </div>
          <p className="text-sm text-foreground/90">{review.reply}</p>
        </div>
      )}

      {/* Escalated notice */}
      {review.status === "escalated" && (
        <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/[0.06] p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-destructive mb-1">
            <ShieldAlert className="h-3 w-3" />
            Incidente creado · SLA 2h
          </div>
          <p className="text-sm text-foreground/90">
            Reseña escalada a gestión. Notificado al gerente.
          </p>
        </div>
      )}

      {/* AI Reply section */}
      {showAI && !discarded && (review.status === "new" || review.status === "pending_approval") && (
        <motion.div
          initial={reduce ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.04] p-3 sm:p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[var(--teal)]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--teal)]">
                IA sugiere respuesta
              </span>
            </div>
            <div className="flex items-center gap-1">
              {(Object.keys(TONE_LABELS) as Tone[])
                .filter((t) => t !== "disculpas" || isNegative)
                .map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    aria-pressed={tone === t}
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] transition-colors min-h-[24px]",
                      tone === t
                        ? "border-[var(--teal)]/50 bg-[var(--teal)]/15 text-[var(--teal)]"
                        : "border-foreground/15 bg-foreground/[0.03] text-muted-foreground hover:border-foreground/30"
                    )}
                  >
                    {TONE_LABELS[t]}
                  </button>
                ))}
            </div>
          </div>

          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="bg-foreground/[0.04] border-foreground/15 text-sm resize-y"
            aria-label="Borrador de respuesta"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => setConfirmOpen(true)}
              className="h-8 bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold-deep)]"
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              Aprobar y publicar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={regenerate}
              disabled={regenerating}
              className="h-8 border-foreground/15"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 mr-1", regenerating && "animate-spin")} />
              Regenerar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDiscarded(true);
                toast({ title: "Sugerencia descartada" });
              }}
              className="h-8 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Descartar
            </Button>
            {isNegative && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEscalateOpen(true)}
                className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                Escalar a gestión
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Confirm publish dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-card border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Publicar respuesta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se publicará en <strong className="text-foreground">{meta.label}</strong>. Esta acción
              es visible públicamente y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={publish}
              className="h-9 bg-[var(--gold)] text-[var(--primary-foreground)] hover:bg-[var(--gold-deep)]"
            >
              Publicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Escalate dialog */}
      <AlertDialog open={escalateOpen} onOpenChange={setEscalateOpen}>
        <AlertDialogContent className="bg-card border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Escalar a gestión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se creará un incidente vinculado a esta reseña y se notificará al gerente. SLA de
              respuesta: 2 horas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={escalate}
              className="h-9 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Escalar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

function BandejaTab() {
  const [platform, setPlatform] = React.useState<ReviewPlatform | "all">("all");
  const [rating, setRating] = React.useState<number | "all">("all");

  const filtered = REVIEWS.filter((r) => {
    if (platform !== "all" && r.platform !== platform) return false;
    if (rating !== "all" && r.rating !== rating) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <Summary />
      <div className="rp-glass rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          Filtros
        </div>
        <PlatformFilters active={platform} onChange={setPlatform} />
        <RatingFilter active={rating} onChange={setRating} />
      </div>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="rp-glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
            No hay reseñas con estos filtros.
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
 * Análisis tab
 * ===================================================================== */

function SentimentDonut() {
  const reduce = useReducedMotion();
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const C = 2 * Math.PI * r;
  // Precompute cumulative offsets (avoid mutating state during render)
  const segments = SENTIMENT_DISTRIBUTION.reduce<
    Array<{ d: (typeof SENTIMENT_DISTRIBUTION)[number]; dash: number; offset: number }>
  >((acc, d) => {
    const dash = (d.pct / 100) * C;
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    acc.push({ d, dash, offset });
    return acc;
  }, []);
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">Distribución de sentimiento</h3>
        <MiniBadge>1.247 reseñas</MiniBadge>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-[180px] h-[180px] shrink-0" role="img" aria-label="Distribución de sentimiento">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" className="text-foreground/8" strokeWidth="20" />
          {segments.map((seg, i) => (
            <motion.circle
              key={seg.d.sentiment}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.d.color}
              strokeWidth="20"
              strokeDasharray={`${reduce ? seg.dash : 0} ${C}`}
              strokeDashoffset={-seg.offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              initial={false}
              animate={{ strokeDasharray: `${seg.dash} ${C}` }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: "easeOut" }}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-foreground font-display" fontSize="22" fontWeight="600">
            4.6
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="9">
            rating medio
          </text>
        </svg>
        <div className="flex-1 w-full space-y-2">
          {SENTIMENT_DISTRIBUTION.map((d) => (
            <div key={d.sentiment} className="flex items-center justify-between gap-3 text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                <span className="text-foreground/90">{sentimentLabel(d.sentiment)}</span>
              </span>
              <span className="font-mono text-foreground/80">
                {d.pct}% · {d.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopicsBar() {
  const reduce = useReducedMotion();
  const max = Math.max(...TOPICS_ANALYSIS.map((t) => t.count));
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">Análisis de temas</h3>
        <MiniBadge>6 temas</MiniBadge>
      </div>
      <div className="space-y-3">
        {TOPICS_ANALYSIS.map((t, i) => (
          <div key={t.topic}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-foreground/85">{t.label}</span>
              <span className="font-mono text-muted-foreground">{t.count}</span>
            </div>
            <div className="h-2 rounded-full bg-foreground/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--gold), var(--gold-soft))" }}
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${(t.count / max) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RatingEvolutionChart() {
  const reduce = useReducedMotion();
  const w = 480;
  const h = 200;
  const padL = 30;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const minV = 4.2;
  const maxV = 4.8;
  const points: Array<[number, number]> = RATING_EVOLUTION.map((d, i) => [
    padL + (i / (RATING_EVOLUTION.length - 1)) * innerW,
    padT + innerH - ((d.value - minV) / (maxV - minV)) * innerH,
  ]);
  const linePath = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1][0]},${padT + innerH} L${points[0][0]},${padT + innerH} Z`;

  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">Evolución del rating</h3>
        <MiniBadge tone="gold">6 meses</MiniBadge>
      </div>
      <div className="overflow-x-auto rp-scroll-thin -mx-1">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[440px]" role="img" aria-label="Evolución del rating medio">
          <defs>
            <linearGradient id="ratingArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[4.3, 4.5, 4.7].map((t, i) => {
            const y = padT + innerH - ((t - minV) / (maxV - minV)) * innerH;
            return (
              <g key={i}>
                <line x1={padL} x2={w - padR} y1={y} y2={y} stroke="currentColor" className="text-foreground/8" strokeDasharray="2 4" />
                <text x={padL - 6} y={y + 3} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="9">
                  {t.toFixed(1)}
                </text>
              </g>
            );
          })}
          <motion.path
            d={areaPath}
            fill="url(#ratingArea)"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
          <motion.path
            d={linePath}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {points.map(([x, y], i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="var(--gold)"
              stroke="var(--background)"
              strokeWidth="1.5"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.06 }}
            />
          ))}
          {RATING_EVOLUTION.map((d, i) => (
            <text
              key={i}
              x={padL + (i / (RATING_EVOLUTION.length - 1)) * innerW}
              y={padT + innerH + 16}
              textAnchor="middle"
              className="fill-muted-foreground font-mono"
              fontSize="9"
            >
              {d.month}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function RecurringProblems() {
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">Problemas recurrentes</h3>
        <MiniBadge>Top 5 · negativas</MiniBadge>
      </div>
      <ul className="space-y-3">
        {RECURRING_PROBLEMS.map((p, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/70" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground/90">{p.issue}</span>
                <span className="font-mono text-xs text-muted-foreground">{p.mentions} ({p.pct}%)</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-destructive/60"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${p.pct * 7}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BestWorstCard() {
  const items = [
    { label: "Por camarero", data: BEST_WORST.byWaiter },
    { label: "Por plato", data: BEST_WORST.byDish },
    { label: "Por zona", data: BEST_WORST.byZone },
  ];
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">Mejor y peor valorado</h3>
        <MiniBadge>3 dimensiones</MiniBadge>
      </div>
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.label} className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/[0.06] p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                Mejor · {it.label}
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">{it.data.best.name}</span>
                <span className="font-mono text-xs text-emerald-300">
                  {it.data.best.rating}★
                </span>
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {it.data.best.mentions} menciones
              </div>
            </div>
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/[0.06] p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                Peor · {it.label}
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">{it.data.worst.name}</span>
                <span className="font-mono text-xs text-amber-300">
                  {it.data.worst.rating}★
                </span>
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {it.data.worst.mentions} menciones
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformComparisonTable() {
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">Comparativa por plataforma</h3>
        <MiniBadge>7 plataformas</MiniBadge>
      </div>
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full border-collapse text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2.5">Plataforma</th>
              <th className="px-3 py-2.5 text-right">Rating</th>
              <th className="px-3 py-2.5 text-right">Reseñas</th>
              <th className="px-3 py-2.5 text-right">Respuesta</th>
              <th className="px-3 py-2.5 text-right">T. medio</th>
            </tr>
          </thead>
          <tbody>
            {PLATFORM_COMPARISON.map((p) => {
              const meta = PLATFORM_META[p.platform];
              return (
                <tr key={p.platform} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025]">
                  <td className="px-3 py-2.5 font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono rp-gold-text">{p.avgRating}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{p.count}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{p.responseRate}%</td>
                  <td className="px-3 py-2.5 text-right font-mono text-foreground/80">{p.responseTime}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AISummary() {
  return (
    <div className="rp-glass rp-glow-teal rounded-2xl p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--teal)]/12 border border-[var(--teal)]/40">
          <Sparkles className="h-4 w-4 text-[var(--teal)]" />
        </span>
        <h3 className="font-display text-lg font-medium">Análisis IA</h3>
        <MiniBadge tone="teal">glm-4-flash</MiniBadge>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">
        El 89% de las reseñas son positivas. El tema más mencionado positivamente es{" "}
        <span className="rp-gold-text font-medium">'comida' (67%)</span>. El problema recurrente es{" "}
        <span className="text-destructive font-medium">'tiempo de espera' (12% de negativas)</span>. Se
        recomienda optimizar el flujo de sala en hora punta.
      </p>
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-3">
        <Info className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Análisis automático sobre 1.247 reseñas agregadas. La IA no garantiza conclusiones
          definitivas: el humano decide acciones.
        </p>
      </div>
    </div>
  );
}

function AnalisisTab() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <SentimentDonut />
        <TopicsBar />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <RatingEvolutionChart />
        <RecurringProblems />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <BestWorstCard />
        <PlatformComparisonTable />
      </div>
      <AISummary />
    </div>
  );
}

/* =====================================================================
 * NPS tab
 * ===================================================================== */

function NpsScoreCard() {
  const reduce = useReducedMotion();
  const score = 72;
  const color = npsColor(score);
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">NPS</h3>
        <MiniBadge tone="teal">Últimos 30 días</MiniBadge>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 160 160" role="img" aria-label={`NPS ${score}`}>
            <circle cx="80" cy="80" r="68" fill="none" stroke="currentColor" className="text-foreground/8" strokeWidth="10" />
            <motion.circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
              strokeDasharray={2 * Math.PI * 68}
              initial={reduce ? false : { strokeDashoffset: 2 * Math.PI * 68 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 68 * (1 - (score + 100) / 200) }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
            <text x="80" y="80" textAnchor="middle" dominantBaseline="middle" fontSize="48" fontWeight="600" className="fill-foreground font-display">
              {score}
            </text>
            <text x="80" y="108" textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="9">
              / 100
            </text>
          </svg>
        </div>
        <div className="flex-1 w-full space-y-2">
          {[
            { label: "Promotores (9-10)", pct: 68, color: "var(--teal)" },
            { label: "Pasivos (7-8)", pct: 24, color: "var(--gold)" },
            { label: "Detractores (0-6)", pct: 8, color: "#ef4444" },
          ].map((d) => (
            <div key={d.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground/90">{d.label}</span>
                <span className="font-mono text-muted-foreground">{d.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-foreground/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: d.color }}
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${d.pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
          <div className="pt-2 text-[11px] text-muted-foreground font-mono">
            NPS = % Promotores − % Detractores = 68 − 8 = 72
          </div>
        </div>
      </div>
    </div>
  );
}

function NpsEvolutionChart() {
  const reduce = useReducedMotion();
  const w = 480;
  const h = 200;
  const padL = 30;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const minV = 50;
  const maxV = 80;
  const points: Array<[number, number]> = NPS_EVOLUTION.map((d, i) => [
    padL + (i / (NPS_EVOLUTION.length - 1)) * innerW,
    padT + innerH - ((d.value - minV) / (maxV - minV)) * innerH,
  ]);
  const linePath = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1][0]},${padT + innerH} L${points[0][0]},${padT + innerH} Z`;
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">Evolución NPS</h3>
        <MiniBadge tone="teal">6 meses</MiniBadge>
      </div>
      <div className="overflow-x-auto rp-scroll-thin -mx-1">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[440px]" role="img" aria-label="Evolución del NPS">
          <defs>
            <linearGradient id="npsArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[55, 65, 75].map((t, i) => {
            const y = padT + innerH - ((t - minV) / (maxV - minV)) * innerH;
            return (
              <g key={i}>
                <line x1={padL} x2={w - padR} y1={y} y2={y} stroke="currentColor" className="text-foreground/8" strokeDasharray="2 4" />
                <text x={padL - 6} y={y + 3} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="9">
                  {t}
                </text>
              </g>
            );
          })}
          <motion.path d={areaPath} fill="url(#npsArea)" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} />
          <motion.path
            d={linePath}
            fill="none"
            stroke="var(--teal)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {points.map(([x, y], i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="var(--teal)"
              stroke="var(--background)"
              strokeWidth="1.5"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.06 }}
            />
          ))}
          {NPS_EVOLUTION.map((d, i) => (
            <text key={i} x={padL + (i / (NPS_EVOLUTION.length - 1)) * innerW} y={padT + innerH + 16} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="9">
              {d.month}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function NpsBreakdownTable({
  title,
  rows,
  labelKey,
}: {
  title: string;
  rows: Array<Record<string, number | string>>;
  labelKey: string;
}) {
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <h3 className="font-display text-lg font-medium mb-3">{title}</h3>
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2.5">{labelKey}</th>
              <th className="px-3 py-2.5 text-right">NPS</th>
              <th className="px-3 py-2.5 text-right">Prom.</th>
              <th className="px-3 py-2.5 text-right">Pas.</th>
              <th className="px-3 py-2.5 text-right">Detr.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025]">
                <td className="px-3 py-2.5 font-medium">{r[labelKey === "Local" ? "location" : "shift"] as string}</td>
                <td className="px-3 py-2.5 text-right font-mono" style={{ color: npsColor(r.score as number) }}>
                  {r.score as number}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-[var(--teal)]">{r.promoters}%</td>
                <td className="px-3 py-2.5 text-right font-mono text-[var(--gold-soft)]">{r.passives}%</td>
                <td className="px-3 py-2.5 text-right font-mono text-destructive">{r.detractors}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NpsAutoActions() {
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">Acciones automáticas por NPS</h3>
        <MiniBadge tone="gold">3 reglas activas</MiniBadge>
      </div>
      <div className="space-y-3">
        {NPS_AUTO_ACTIONS.map((a) => {
          const Icon = a.icon;
          const toneCls =
            a.tone === "teal"
              ? "border-[var(--teal)]/40 bg-[var(--teal)]/[0.06] text-[var(--teal)]"
              : a.tone === "gold"
              ? "border-[var(--gold)]/40 bg-[var(--gold)]/[0.06] text-[var(--gold-soft)]"
              : "border-destructive/40 bg-destructive/[0.06] text-destructive";
          return (
            <div key={a.bucket} className={cn("rounded-xl border p-3.5", toneCls)}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground/[0.05]">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <div className="text-sm font-medium text-foreground">{a.bucket}</div>
                    <div className="text-[11px] text-muted-foreground">{a.pct}% de clientes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Acción</div>
                  <div className="text-sm font-medium">{a.action}</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{a.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NpsTab() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <NpsScoreCard />
        <NpsEvolutionChart />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <NpsBreakdownTable title="NPS por local" rows={NPS_BY_LOCATION} labelKey="Local" />
        <NpsBreakdownTable title="NPS por turno" rows={NPS_BY_SHIFT} labelKey="Turno" />
      </div>
      <NpsAutoActions />
    </div>
  );
}

/* =====================================================================
 * Encuestas tab
 * ===================================================================== */

function SurveyConfig() {
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Settings2 className="h-4 w-4 text-[var(--gold)]" />
          <h3 className="font-display text-lg font-medium">Configuración de encuesta</h3>
        </div>
        <MiniBadge>5 preguntas</MiniBadge>
      </div>
      <ul className="space-y-2">
        {SURVEY_QUESTIONS.map((q) => (
          <li
            key={q.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 bg-foreground/[0.025] p-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{q.label}</div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
                {q.type === "rating" ? "Estrellas 1-5" : q.type === "nps" ? "Escala 0-10" : "Texto libre"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-[10px] font-mono uppercase", q.active ? "text-[var(--teal)]" : "text-muted-foreground")}>
                {q.active ? "Activa" : "Inactiva"}
              </span>
              <Switch defaultChecked={q.active} aria-label={`Activar ${q.label}`} />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="h-8 border-foreground/15">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Añadir pregunta
        </Button>
        <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Eliminar plantilla
        </Button>
      </div>
    </div>
  );
}

function SurveyMetrics() {
  const reduce = useReducedMotion();
  const { sent, opened, completed } = SURVEY_METRICS;
  const openRate = Math.round((opened / sent) * 100);
  const completionRate = Math.round((completed / opened) * 100);
  const cells = [
    { label: "Enviadas", value: sent, tone: "default" as const, def: "Encuestas enviadas 2h tras visita." },
    { label: "Abiertas", value: opened, suffix: `· ${openRate}%`, tone: "teal" as const, def: "Encuestas abiertas por el cliente." },
    { label: "Completadas", value: completed, suffix: `· ${completionRate}%`, tone: "gold" as const, def: "Encuestas completadas / abiertas." },
  ];
  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="grid grid-cols-3 gap-3">
        {cells.map((c, i) => (
          <motion.div
            key={c.label}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="rounded-xl bg-foreground/[0.025] border border-foreground/10 p-3 text-center"
          >
            <div className="flex items-center justify-center gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {c.label}
              </span>
              <InfoDot text={c.def} />
            </div>
            <div
              className={cn(
                "mt-1.5 font-display text-2xl font-light",
                c.tone === "gold" && "rp-gold-text",
                c.tone === "teal" && "rp-teal-text",
                c.tone === "default" && "text-foreground"
              )}
            >
              {c.value}
            </div>
            {c.suffix && <div className="text-[10px] text-muted-foreground font-mono">{c.suffix}</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SurveyResults() {
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">Resultados por pregunta</h3>
        <MiniBadge tone="gold">142 completadas</MiniBadge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SURVEY_RESULTS.map((r) => (
          <div key={r.label} className="rounded-xl border border-foreground/10 bg-foreground/[0.025] p-3 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {r.label}
            </div>
            <div className="mt-1 font-display text-2xl font-light rp-gold-text">
              {r.rating}
              {r.suffix ? <span className="text-sm">{r.suffix}</span> : <span className="text-sm"> ★</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SurveyComments() {
  return (
    <div className="rp-glass rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-medium">Comentarios abiertos</h3>
        <MiniBadge>5 recientes</MiniBadge>
      </div>
      <ul className="space-y-3 max-h-96 overflow-y-auto rp-scroll-thin pr-1">
        {OPEN_COMMENTS.map((c) => (
          <li
            key={c.id}
            className={cn(
              "rounded-lg border p-3",
              c.sentiment === "positive"
                ? "border-[var(--teal)]/30 bg-[var(--teal)]/[0.04]"
                : c.sentiment === "negative"
                ? "border-destructive/30 bg-destructive/[0.04]"
                : "border-foreground/10 bg-foreground/[0.025]"
            )}
          >
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mb-1">
              <span className="font-mono">{c.author} · {c.date}</span>
              <span
                className="inline-flex items-center gap-1 font-mono"
                style={{ color: sentimentColor(c.sentiment) }}
              >
                ● {c.score}%
              </span>
            </div>
            <p className="text-sm text-foreground/90">{c.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SurveyAutomation() {
  return (
    <div className="rp-glass rp-glow-gold rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gold)]/12 border border-[var(--gold)]/40">
            <Bell className="h-4 w-4 text-[var(--gold)]" />
          </span>
          <div>
            <h3 className="font-display text-lg font-medium">Automatización de envío</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enviar encuesta 2h después de completar la visita
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--teal)]">Activa</span>
          <Switch defaultChecked aria-label="Activar automatización" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-foreground/10 bg-foreground/[0.025] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Disparador</div>
          <div className="text-sm mt-0.5">Visita completada</div>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/[0.025] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Espera</div>
          <div className="text-sm mt-0.5">2 horas</div>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-foreground/[0.025] p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Canales</div>
          <div className="text-sm mt-0.5">Email + WhatsApp</div>
        </div>
      </div>
    </div>
  );
}

function EncuestasTab() {
  return (
    <div className="space-y-5">
      <SurveyAutomation />
      <SurveyMetrics />
      <div className="grid gap-5 lg:grid-cols-2">
        <SurveyConfig />
        <SurveyResults />
      </div>
      <SurveyComments />
    </div>
  );
}

/* =====================================================================
 * Main component
 * ===================================================================== */

export function GrowthReputation() {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-5">
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
              Centro de Reputación
            </h2>
            <DemoBadge />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Reseñas multiplataforma, respuestas con IA, sentimiento, NPS y encuestas.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <MiniBadge>7 plataformas</MiniBadge>
          <MiniBadge tone="teal">1.247 reseñas</MiniBadge>
        </div>
      </motion.header>

      <Tabs defaultValue="bandeja" className="w-full">
        <TabsList className="bg-foreground/[0.04] border border-foreground/10 h-10 p-1 rounded-xl overflow-x-auto rp-scroll-thin">
          <TabsTrigger value="bandeja" className="data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)] min-h-[32px]">
            Bandeja
          </TabsTrigger>
          <TabsTrigger value="analisis" className="data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)] min-h-[32px]">
            Análisis
          </TabsTrigger>
          <TabsTrigger value="nps" className="data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)] min-h-[32px]">
            NPS
          </TabsTrigger>
          <TabsTrigger value="encuestas" className="data-[state=active]:bg-[var(--gold)]/15 data-[state=active]:text-[var(--gold-soft)] min-h-[32px]">
            Encuestas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bandeja" className="mt-5 focus-visible:outline-none">
          <BandejaTab />
        </TabsContent>
        <TabsContent value="analisis" className="mt-5 focus-visible:outline-none">
          <AnalisisTab />
        </TabsContent>
        <TabsContent value="nps" className="mt-5 focus-visible:outline-none">
          <NpsTab />
        </TabsContent>
        <TabsContent value="encuestas" className="mt-5 focus-visible:outline-none">
          <EncuestasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GrowthReputation;
