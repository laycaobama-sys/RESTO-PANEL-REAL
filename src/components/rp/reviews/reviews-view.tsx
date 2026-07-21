"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Star,
  Search,
  Sparkles,
  RefreshCw,
  Check,
  ChevronDown,
  Send,
  Clock,
  MapPin,
  TrendingUp,
  ShieldAlert,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

/* =====================================================================
 * Types
 * ===================================================================== */

type Sentiment = "positive" | "neutral" | "negative";
type Theme = "food quality" | "service" | "ambiance" | "wait time" | "price" | "menu";
type LocationKey = "todos" | "madrid" | "barcelona" | "valencia";
type RatingFilter = "todos" | 5 | 4 | 3 | 2 | 1;

interface Review {
  id: string;
  author: string;
  initials: string;
  location: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  snippet: string;
  fullText: string;
  sentiment: Sentiment;
  sentimentConfidence: number;
  themes: Theme[];
  replied: boolean;
  replyHistory?: { date: string; text: string; author: string }[];
  aiSuggestedReply: string;
  aiReplyAlt: string;
}

/* =====================================================================
 * Demo data
 * ===================================================================== */

const DISTRIBUTION: { stars: 5 | 4 | 3 | 2 | 1; count: number; pct: number }[] = [
  { stars: 5, count: 905, pct: 72.6 },
  { stars: 4, count: 215, pct: 17.2 },
  { stars: 3, count: 75, pct: 6.0 },
  { stars: 2, count: 32, pct: 2.6 },
  { stars: 1, count: 20, pct: 1.6 },
];

const LOCATIONS: { id: LocationKey; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "madrid", label: "Ramses Madrid" },
  { id: "barcelona", label: "Ramses Barcelona" },
  { id: "valencia", label: "Ramses Valencia" },
];

const REVIEWS: Review[] = [
  {
    id: "r1",
    author: "María García",
    initials: "MG",
    location: "Ramses Madrid",
    rating: 5,
    date: "Hace 2 días",
    snippet: "El cochinillo estaba espectacular y el ambiente muy acogedor. Volveré seguro.",
    fullText:
      "¡Qué noche tan maravillosa! El cochinillo estaba espectacular, crujiente por fuera y tierno por dentro. El servicio fue atento sin ser invasivo y el ambiente del salón principal muy acogedor. Probamos también el vino recomendado por el sumiller y fue un acierto total. Volveré seguro la próxima semana con amigos. ¡Gracias equipo!",
    sentiment: "positive",
    sentimentConfidence: 96,
    themes: ["food quality", "service", "ambiance"],
    replied: true,
    replyHistory: [
      {
        date: "Hace 1 día",
        text: "¡Gracias María! Nos alegra que disfrutarais del cochinillo. ¡Os esperamos pronto!",
        author: "Equipo Ramses Madrid",
      },
    ],
    aiSuggestedReply:
      "¡Gracias por tu reseña, María! Nos alegra muchísimo que disfrutasteis del cochinillo y el ambiente del salón. Ya le hemos hecho llegar tus palabras al sumiller. ¡Os esperamos pronto para probar la nueva carta de otoño! — Equipo Ramses Madrid",
    aiReplyAlt:
      "María, mil gracias por tus palabras. El cochinillo es una de nuestras señas de identidad y leer esto nos hace mucha ilusión. ¿Te animas a probar el menú degustación la próxima visita? Estaremos encantados de recibiros. — Equipo Ramses Madrid",
  },
  {
    id: "r2",
    author: "James Wilson",
    initials: "JW",
    location: "Ramses Madrid",
    rating: 4,
    date: "Hace 3 días",
    snippet: "Great food but the wait at the door was longer than expected. Would return.",
    fullText:
      "Great food overall — the tapas selection was excellent and the Iberian ham was top quality. Service inside was friendly and professional once seated. The only downside was the wait at the door, almost 25 minutes past our reservation time. Would return but recommend arriving with patience.",
    sentiment: "positive",
    sentimentConfidence: 82,
    themes: ["food quality", "service", "wait time"],
    replied: false,
    aiSuggestedReply:
      "Hi James, thank you for your kind words about our food and service. We sincerely apologize for the wait at the door — we are reviewing our seating flow on peak nights to prevent this. Next time, please mention your reservation at arrival and we will prioritize your table. — Ramses Madrid Team",
    aiReplyAlt:
      "James, gracias por tu reseña. Lamentamos la espera: estamos ajustando los turnos de la entrada en franjas punta para que no vuelva a ocurrir. Nos encantaría invitarte a una copa en tu próxima visita. — Equipo Ramses Madrid",
  },
  {
    id: "r3",
    author: "Carla Rossi",
    initials: "CR",
    location: "Ramses Barcelona",
    rating: 2,
    date: "Hace 5 días",
    snippet: "Tuvimos que esperar 45 minutos para una reserva confirmada. La comida correcta pero el servicio desbordado.",
    fullText:
      "Reservamos para las 21:30 y no nos sentaron hasta las 22:15. El personal estaba claramente desbordado y tardaron otros 20 minutos en tomar nota. La comida, cuando llegó, estaba correcta — el arroz con bogavante bien de cocción pero falto de sal. Por el precio esperaba una experiencia más cuidada. Una lástima, el local es precioso.",
    sentiment: "negative",
    sentimentConfidence: 91,
    themes: ["wait time", "service", "food quality", "ambiance"],
    replied: false,
    aiSuggestedReply:
      "Carla, lamentamos sinceramente la experiencia. Una espera de 45 minutos con reserva confirmada no es aceptable y vamos a revisar el turno de sala del viernes. Nos gustaría invitarte a una nueva cena para mostraros el servicio que sí podemos dar. Escribidnos a atencion@ramses.es. — Equipo Ramses Barcelona",
    aiReplyAlt:
      "Carla, gracias por compartir esto con tanto detalle. Hemos compartido tu reseña con el encargado de Barcelona para revisar el flujo de sala y la sazón del arroz. Nos encantaría teneros de vuelta y ofreceros una cena correcta. — Equipo Ramses Barcelona",
  },
  {
    id: "r4",
    author: "Pedro Sánchez",
    initials: "PS",
    location: "Ramses Madrid",
    rating: 5,
    date: "Hace 6 días",
    snippet: "Mejor paella de Madrid, sin discusión. Volveremos con la familia.",
    fullText:
      "Llevábamos tiempo buscando una paella como Dios manda en Madrid y la hemos encontrado. El socarrat perfecto, el arroz en su punto y un sabor auténtico. El equipo de sala nos recomendó un albariño que maridó de maravilla. Postre casero para cerrar. Volveremos con la familia entera el mes que viene.",
    sentiment: "positive",
    sentimentConfidence: 98,
    themes: ["food quality", "service"],
    replied: true,
    replyHistory: [
      {
        date: "Hace 5 días",
        text: "¡Gracias Pedro! El socarrat es nuestra obsesión. ¡Os esperamos con la familia!",
        author: "Equipo Ramses Madrid",
      },
    ],
    aiSuggestedReply:
      "Pedro, qué alegría leer esto. El socarrat es una de las cosas que más cuidamos y saber que acertasteis nos hace mucha ilusión. Para la próxima visita familiar podemos reservaros una mesa en el salón privado. ¡Hasta pronto! — Equipo Ramses Madrid",
    aiReplyAlt:
      "Pedro, gracias por la confianza. Si venís con la familia, avisadnos con antelación y preparamos una paellada especial para el grupo. ¡Os esperamos! — Equipo Ramses Madrid",
  },
  {
    id: "r5",
    author: "Sophie Martin",
    initials: "SM",
    location: "Ramses Barcelona",
    rating: 3,
    date: "Hace 1 semana",
    snippet: "Bonito local, comida correcta pero sin sorprender. Relación calidad-precio justa.",
    fullText:
      "Le local est très beau, ambiance agréable et service courtois. La cuisine est correcte mais sans surprise — nous attendions un peu plus d'audace pour le prix. Le dessert était en revanche excellent. Rapport qualité-prix juste. Je reviendrai peut-être pour tester la carte du déjeuner.",
    sentiment: "neutral",
    sentimentConfidence: 74,
    themes: ["ambiance", "food quality", "price"],
    replied: false,
    aiSuggestedReply:
      "Sophie, merci pour votre retour. Nous prenons bonne note de votre remarque sur l'audace de la carte — notre chef travaille justement sur de nouvelles propositions pour la saison. À bientôt, peut-être pour le menu du déjeuner à 24€. — Équipe Ramses Barcelona",
    aiReplyAlt:
      "Sophie, merci d'avoir partagé votre expérience. Nous espérons vous surprendre lors d'une prochaine visite avec notre nouvelle carte de saison. L'équipe Ramses Barcelona.",
  },
  {
    id: "r6",
    author: "Ahmed Hassan",
    initials: "AH",
    location: "Ramses Valencia",
    rating: 1,
    date: "Hace 1 semana",
    snippet: "Reserva perdida. Llegamos y no había mesa. Una hora esperando para al final irnos.",
    fullText:
      "Hicimos reserva para 4 personas a las 14:30. Llegamos puntuales y la mesa no estaba disponible. Nos dijeron que esperáramos '5 minutos' y pasamos una hora de pie en la barra sin ofrecernos siquiera una bebida. Al final nos fuimos a otro sitio. Inaceptable para un restaurante de esta categoría. No volveremos.",
    sentiment: "negative",
    sentimentConfidence: 99,
    themes: ["wait time", "service"],
    replied: false,
    aiSuggestedReply:
      "Ahmed, sentimos muchísimo lo ocurrido. Perder una reserva confirmada y no ofrecer atención durante la espera no refleja nuestro estándar. El encargado de Valencia se pondrá en contacto contigo hoy mismo para solucionarlo. Lamentamos la mala experiencia. — Equipo Ramses Valencia",
    aiReplyAlt:
      "Ahmed, aceptamos la crítica. Lo que cuentas no debería haber pasado y vamos a revisar el protocolo de reservas en Valencia. Nos gustaría compensar esta situación con una nueva invitación. Contactaremos contigo por privado. — Equipo Ramses Valencia",
  },
  {
    id: "r7",
    author: "Laura Pérez",
    initials: "LP",
    location: "Ramses Valencia",
    rating: 4,
    date: "Hace 2 semanas",
    snippet: "Muy buena experiencia. El salón precioso y el equipo encantador. Repetiremos.",
    fullText:
      "Celebramos un cumpleaños y nos trataron de maravilla. El salón principal es precioso, con mucha luz natural y decoración cuidada. El menú degustación estuvo a la altura, con platos creativos y bien presentados. Solo le quito una estrella porque el ritmo entre platos fue algo lento al final. Por lo demás, repetiremos seguro.",
    sentiment: "positive",
    sentimentConfidence: 88,
    themes: ["service", "ambiance", "menu"],
    replied: true,
    replyHistory: [
      {
        date: "Hace 2 semanas",
        text: "¡Feliz cumpleaños Laura! Nos alegra que lo pasarais bien. ¡Os esperamos!",
        author: "Equipo Ramses Valencia",
      },
    ],
    aiSuggestedReply:
      "Laura, gracias por celebrar vuestro cumpleaños con nosotros. Tomamos nota del ritmo entre platos para ajustarlo en el menú degustación. ¡Esperamos veros pronto de nuevo para otra celebración! — Equipo Ramses Valencia",
    aiReplyAlt:
      "Laura, qué ilusión leer esto. Lo del ritmo entre platos lo anotamos para mejorarlo. Para vuestra próxima visita podemos preparar algo especial si avisáis con tiempo. — Equipo Ramses Valencia",
  },
];

const STAR_EVOLUTION: { week: string; rating: number }[] = [
  { week: "S1", rating: 4.42 },
  { week: "S2", rating: 4.38 },
  { week: "S3", rating: 4.45 },
  { week: "S4", rating: 4.51 },
  { week: "S5", rating: 4.48 },
  { week: "S6", rating: 4.55 },
  { week: "S7", rating: 4.58 },
  { week: "S8", rating: 4.61 },
];

const COPILOT_SUGGESTIONS = [
  "¿Qué temas aparecen en reseñas negativas?",
  "¿Comparativa entre locales?",
  "¿Resumen de esta semana?",
] as const;

const COPILOT_ANSWERS: Record<string, { text: string; actions: string[] }> = {
  "¿Qué temas aparecen en reseñas negativas?": {
    text:
      "En las reseñas de 1–3★ (127 en total) predominan los temas 'wait time' (47%) y 'service' (38%), seguidos de 'food quality' (12%) y 'ambiance' (3%). El local Ramses Barcelona concentra el 62% de las quejas sobre tiempos de espera, principalmente en franja 20:30–21:30. Recomendado: revisar turnos de sala y política de overbooking en esa franja.",
    actions: ["Crear tarea: revisar turnos sala Barcelona", "Notificar a encargado"],
  },
  "¿Comparativa entre locales?": {
    text:
      "Madrid lidera en valoración media (4.74★) y volumen (612 reseñas). Barcelona muestra el mayor descenso (-0.31★ vs trimestre anterior) y mayor concentración de quejas por tiempo de espera. Valencia tiene el mejor ratio de respuesta a reseñas (94% vs 78% global) pero menor volumen (223 reseñas). Ningún local baja de 4.4★ en el trimestre.",
    actions: ["Marcar Barcelona para seguimiento", "Replicar protocolo Valencia en Madrid"],
  },
  "¿Resumen de esta semana?": {
    text:
      "Esta semana se recibieron +47 reseñas nuevas (vs 38 la semana anterior, +24%). Valoración media 4.6★ (+0.1 vs semana anterior). Quedan 12 reseñas pendientes de responder (9 negativas, 3 neutras). Tema emergente: 'menu degustación' mencionado 9 veces, todas con connotación positiva. Tendencia sostenida al alza desde S5.",
    actions: ["Responder 12 pendientes", "Marcar 'menu degustación' como tema a vigilar"],
  },
};

/* =====================================================================
 * Helpers
 * ===================================================================== */

const SENTIMENT_STYLES: Record<Sentiment, { label: string; cls: string; dot: string }> = {
  positive: {
    label: "Positiva",
    cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  neutral: {
    label: "Neutral",
    cls: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  negative: {
    label: "Negativa",
    cls: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    dot: "bg-rose-400",
  },
};

const THEME_STYLES: Record<Theme, string> = {
  "food quality": "border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  service: "border-[var(--teal)]/35 bg-[var(--teal)]/10 text-[var(--teal)]",
  ambiance: "border-[var(--gold)]/25 bg-[var(--gold)]/5 text-[var(--gold-soft)]/90",
  "wait time": "border-rose-400/35 bg-rose-400/10 text-rose-300",
  price: "border-foreground/20 bg-foreground/5 text-muted-foreground",
  menu: "border-[var(--teal)]/25 bg-[var(--teal)]/5 text-[var(--teal)]/90",
};

function linePath(points: Array<[number, number]>): string {
  if (!points.length) return "";
  return points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
}

function areaPath(points: Array<[number, number]>, baseY: number): string {
  if (!points.length) return "";
  const top = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const last = points[points.length - 1];
  const first = points[0];
  return `${top} L${last[0]},${baseY} L${first[0]},${baseY} Z`;
}

function StarRating({ value, className }: { value: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= rounded ? "text-[var(--gold)]" : "text-muted-foreground/30"
          )}
          fill={i <= rounded ? "currentColor" : "none"}
          strokeWidth={1.5}
          aria-hidden
        />
      ))}
    </div>
  );
}

function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-amber-400/40 bg-amber-400/10 text-amber-300/90 font-mono text-[10px] uppercase tracking-wider",
        className
      )}
    >
      demo
    </Badge>
  );
}

/* =====================================================================
 * Main view
 * ===================================================================== */

export function ReviewsView() {
  const [location, setLocation] = React.useState<LocationKey>("todos");
  const [ratingFilter, setRatingFilter] = React.useState<RatingFilter>("todos");
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>(REVIEWS[0].id);
  const [locationOpen, setLocationOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    return REVIEWS.filter((r) => {
      if (location !== "todos") {
        const locMap: Record<Exclude<LocationKey, "todos">, string> = {
          madrid: "Ramses Madrid",
          barcelona: "Ramses Barcelona",
          valencia: "Ramses Valencia",
        };
        if (r.location !== locMap[location]) return false;
      }
      if (ratingFilter !== "todos" && r.rating !== ratingFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!r.author.toLowerCase().includes(q) && !r.snippet.toLowerCase().includes(q) && !r.fullText.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [location, ratingFilter, search]);

  const selected = React.useMemo(
    () => REVIEWS.find((r) => r.id === selectedId) ?? REVIEWS[0],
    [selectedId]
  );

  const locationLabel = LOCATIONS.find((l) => l.id === location)?.label ?? "Todos";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">
            Google Reviews
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reputación online, análisis de sentimiento y respuestas asistidas por IA.
          </p>
        </div>
        <DemoBadge />
      </div>

      <HeaderSummary
        locationLabel={locationLabel}
        locationOpen={locationOpen}
        onToggleLocation={() => setLocationOpen((v) => !v)}
        onSelectLocation={(l) => {
          setLocation(l);
          setLocationOpen(false);
        }}
        ratingFilter={ratingFilter}
        onRatingFilter={setRatingFilter}
        search={search}
        onSearch={setSearch}
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] gap-4">
        <ReviewsList reviews={filtered} selectedId={selected.id} onSelect={setSelectedId} />
        <ReviewDetail review={selected} />
      </div>

      <StarEvolutionChart />

      <CopilotPanel />
    </div>
  );
}

/* =====================================================================
 * Header summary
 * ===================================================================== */

function HeaderSummary({
  locationLabel,
  locationOpen,
  onToggleLocation,
  onSelectLocation,
  ratingFilter,
  onRatingFilter,
  search,
  onSearch,
}: {
  locationLabel: string;
  locationOpen: boolean;
  onToggleLocation: () => void;
  onSelectLocation: (l: LocationKey) => void;
  ratingFilter: RatingFilter;
  onRatingFilter: (r: RatingFilter) => void;
  search: string;
  onSearch: (s: string) => void;
}) {
  return (
    <section className="rp-glass rounded-2xl p-5 sm:p-6" aria-label="Resumen de valoración">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Rating + distribution */}
        <div className="flex items-center gap-6 min-w-0">
          <div className="text-center shrink-0">
            <div className="font-display text-5xl sm:text-6xl font-light rp-gold-text leading-none">
              4.6
            </div>
            <StarRating value={4.6} className="mt-2 justify-center" />
            <div className="text-xs text-muted-foreground mt-2 font-mono">1.247 reseñas</div>
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            {DISTRIBUTION.map((d) => (
              <div key={d.stars} className="flex items-center gap-2 text-xs">
                <span className="w-7 text-muted-foreground inline-flex items-center gap-0.5">
                  {d.stars}
                  <Star className="h-3 w-3 text-[var(--gold)]" fill="currentColor" aria-hidden />
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--gold-deep)] to-[var(--gold)]"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-muted-foreground tabular-nums">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Location selector */}
        <div className="xl:ml-auto xl:self-start relative shrink-0">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
            Local
          </label>
          <button
            onClick={onToggleLocation}
            className="w-full xl:w-56 flex items-center justify-between gap-2 rounded-md border border-border/60 bg-input/30 px-3 py-2 text-sm hover:border-[var(--gold)]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40"
            aria-expanded={locationOpen}
            aria-haspopup="listbox"
          >
            <span className="inline-flex items-center gap-2 truncate">
              <MapPin className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden />
              <span className="truncate">{locationLabel}</span>
            </span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", locationOpen && "rotate-180")} aria-hidden />
          </button>
          {locationOpen && (
            <ul
              className="absolute z-20 mt-1 left-0 right-0 xl:w-56 rp-glass-strong rounded-md border border-border/60 py-1 shadow-xl"
              role="listbox"
            >
              {LOCATIONS.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => onSelectLocation(l.id)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-foreground/5 focus-visible:outline-none focus-visible:bg-foreground/5"
                    role="option"
                    aria-selected={locationLabel === l.label}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Filter tabs + search */}
      <div className="mt-5 flex flex-col md:flex-row gap-3 md:items-center">
        <div
          role="tablist"
          aria-label="Filtrar por valoración"
          className="flex items-center rounded-md border border-border/60 p-0.5 overflow-x-auto rp-scroll-thin"
        >
          {(["todos", 5, 4, 3, 2, 1] as RatingFilter[]).map((r) => {
            const active = ratingFilter === r;
            return (
              <button
                key={String(r)}
                role="tab"
                aria-selected={active}
                onClick={() => onRatingFilter(r)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40",
                  active
                    ? "bg-[var(--gold)] text-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "todos" ? "Todos" : `${r}★`}
              </button>
            );
          })}
        </div>
        <div className="relative md:ml-auto md:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por autor o texto…"
            className="pl-9 bg-input/30 border-border/60"
            aria-label="Buscar reseñas"
          />
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
 * Reviews list (master)
 * ===================================================================== */

function ReviewsList({
  reviews,
  selectedId,
  onSelect,
}: {
  reviews: Review[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section
      className="rp-glass rounded-2xl p-3 sm:p-4 flex flex-col"
      aria-label="Lista de reseñas"
    >
      <div className="flex items-center justify-between px-1 pb-3">
        <h2 className="text-sm font-medium inline-flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          {reviews.length} reseña{reviews.length === 1 ? "" : "s"}
        </h2>
        <DemoBadge />
      </div>
      <ul className="space-y-1.5 max-h-[640px] overflow-y-auto rp-scroll-thin pr-1" role="list">
        {reviews.length === 0 && (
          <li className="text-center py-12 text-sm text-muted-foreground">
            No hay reseñas que coincidan con los filtros.
          </li>
        )}
        {reviews.map((r) => {
          const active = r.id === selectedId;
          const s = SENTIMENT_STYLES[r.sentiment];
          return (
            <li key={r.id}>
              <button
                onClick={() => onSelect(r.id)}
                className={cn(
                  "w-full text-left rounded-xl p-3 border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40",
                  active
                    ? "border-[var(--gold)]/50 bg-[var(--gold)]/[0.06]"
                    : "border-border/40 bg-foreground/[0.015] hover:bg-foreground/[0.04] hover:border-border/60"
                )}
                aria-pressed={active}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 border border-border/40">
                    <AvatarFallback className="bg-gradient-to-br from-[var(--gold)]/30 to-[var(--teal)]/20 text-foreground text-xs font-medium">
                      {r.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{r.author}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0">{r.date}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <StarRating value={r.rating} />
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] text-muted-foreground truncate">{r.location}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {r.snippet}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                          s.cls
                        )}
                      >
                        <span className={cn("h-1 w-1 rounded-full", s.dot)} />
                        {s.label}
                      </span>
                      {r.replied ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/5 text-emerald-300/80 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider">
                          <Check className="h-2.5 w-2.5" aria-hidden />
                          Respondida
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/5 text-amber-300/80 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider">
                          <Clock className="h-2.5 w-2.5" aria-hidden />
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* =====================================================================
 * Review detail (detail)
 * ===================================================================== */

function ReviewDetail({ review }: { review: Review }) {
  const [draft, setDraft] = React.useState(review.aiSuggestedReply);
  const [regenCount, setRegenCount] = React.useState(0);
  const [regenerating, setRegenerating] = React.useState(false);
  const [confirmState, setConfirmState] = React.useState<"idle" | "confirm" | "published">("idle");

  React.useEffect(() => {
    setDraft(review.aiSuggestedReply);
    setRegenCount(0);
    setConfirmState("idle");
  }, [review.id, review.aiSuggestedReply]);

  const handleRegenerate = () => {
    setRegenerating(true);
    window.setTimeout(() => {
      setDraft(regenCount % 2 === 0 ? review.aiReplyAlt : review.aiSuggestedReply);
      setRegenCount((c) => c + 1);
      setRegenerating(false);
      toast({
        title: "Respuesta regenerada (demo)",
        description: "Se ha generado una nueva propuesta de respuesta con IA.",
      });
    }, 700);
  };

  const handleApprove = () => {
    setConfirmState("confirm");
  };

  const handleConfirm = () => {
    setConfirmState("published");
    toast({
      title: "Respuesta publicada (demo)",
      description: `La respuesta a ${review.author} se ha publicado en Google Reviews.`,
    });
  };

  const handleCancel = () => setConfirmState("idle");

  const s = SENTIMENT_STYLES[review.sentiment];

  return (
    <section
      className="rp-glass rounded-2xl p-5 sm:p-6 flex flex-col"
      aria-label={`Detalle de reseña de ${review.author}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar className="h-11 w-11 border border-border/40">
            <AvatarFallback className="bg-gradient-to-br from-[var(--gold)]/30 to-[var(--teal)]/20 text-foreground text-sm font-medium">
              {review.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-display text-lg sm:text-xl font-medium truncate">{review.author}</h3>
            <div className="mt-0.5 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
              <StarRating value={review.rating} />
              <span>·</span>
              <span>{review.date}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden />
                {review.location}
              </span>
            </div>
          </div>
        </div>
        <DemoBadge />
      </div>

      <div className="mt-4 rounded-xl border border-border/40 bg-foreground/[0.02] p-4">
        <p className="text-sm leading-relaxed text-foreground/90">{review.fullText}</p>
      </div>

      {/* Sentiment + themes */}
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Análisis de sentimiento
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-mono uppercase tracking-wider", s.cls)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
              {s.label}
            </span>
            <span className="text-xs text-muted-foreground">
              Confianza{" "}
              <span className="font-mono text-foreground">
                {review.sentimentConfidence}%
              </span>
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
            <div
              className={cn("h-full rounded-full", s.dot)}
              style={{ width: `${review.sentimentConfidence}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Temas detectados
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {review.themes.map((t) => (
              <span
                key={t}
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px]",
                  THEME_STYLES[t]
                )}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* IA suggested reply */}
      <div className="mt-4 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.04] p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h4 className="text-sm font-medium">Respuesta sugerida por IA</h4>
            <DemoBadge />
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Fuente: Google Reviews
          </span>
        </div>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          disabled={confirmState === "published"}
          className="bg-background/40 border-border/60 text-sm leading-relaxed resize-y"
          aria-label="Respuesta sugerida por IA editable"
        />
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[11px] font-mono text-muted-foreground inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <ShieldAlert className="h-3 w-3 text-amber-300" aria-hidden />
              Revisar antes de ejecutar
            </span>
            {regenCount > 0 && (
              <span className="text-muted-foreground">
                versión {regenCount + 1}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating || confirmState === "published"}
              className="border-border/60"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", regenerating && "animate-spin")} aria-hidden />
              {regenerating ? "Generando…" : "Regenerar"}
            </Button>

            {confirmState === "idle" && (
              <Button
                size="sm"
                onClick={handleApprove}
                className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90"
              >
                <Check className="h-3.5 w-3.5" aria-hidden />
                Aprobar antes de publicar
              </Button>
            )}
            {confirmState === "confirm" && (
              <div className="inline-flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-1">
                <span className="text-xs text-amber-200">¿Publicar?</span>
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  className="h-7 bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 px-2"
                >
                  Sí
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </Button>
              </div>
            )}
            {confirmState === "published" && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1.5 text-xs text-emerald-300">
                <Check className="h-3.5 w-3.5" aria-hidden />
                Publicado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reply history */}
      {review.replyHistory && review.replyHistory.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Historial de respuestas
          </div>
          <ul className="space-y-2">
            {review.replyHistory.map((rh, i) => (
              <li
                key={`${review.id}-rh-${i}`}
                className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground/80">{rh.author}</span>
                  <span>{rh.date}</span>
                </div>
                <p className="mt-1.5 text-sm text-foreground/85 leading-relaxed">{rh.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* =====================================================================
 * Star evolution chart (8 weeks, inline SVG)
 * ===================================================================== */

function StarEvolutionChart() {
  const W = 760;
  const H = 240;
  const padL = 40;
  const padR = 24;
  const padT = 20;
  const padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const yMin = 4.2;
  const yMax = 4.8;

  const pts: Array<[number, number]> = STAR_EVOLUTION.map((d, i) => {
    const x = padL + (i / (STAR_EVOLUTION.length - 1)) * plotW;
    const y = padT + (1 - (d.rating - yMin) / (yMax - yMin)) * plotH;
    return [x, y];
  });

  const yTicks = [4.2, 4.4, 4.6, 4.8];
  const baseY = padT + plotH;

  return (
    <section
      className="rp-glass rounded-2xl p-5 sm:p-6"
      aria-label="Evolución de valoración media por semana"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="inline-flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--teal)]" aria-hidden />
          <h3 className="font-display text-lg font-medium">Evolución de valoración</h3>
          <span className="text-xs text-muted-foreground">— últimas 8 semanas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 px-2 py-0.5 text-[11px] font-mono">
            <TrendingUp className="h-3 w-3" aria-hidden />
            +0.19★
          </span>
          <DemoBadge />
        </div>
      </div>

      <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[640px] h-auto"
          role="img"
          aria-labelledby="star-evol-title star-evol-desc"
        >
          <title id="star-evol-title">Evolución de valoración media, 8 semanas</title>
          <desc id="star-evol-desc">
            Gráfico de líneas que muestra la valoración media subiendo de 4.42 en S1 a 4.61 en S8.
          </desc>
          <defs>
            <linearGradient id="starEvolArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y grid + labels */}
          {yTicks.map((t) => {
            const y = padT + (1 - (t - yMin) / (yMax - yMin)) * plotH;
            return (
              <g key={t}>
                <line
                  x1={padL}
                  y1={y}
                  x2={W - padR}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  strokeDasharray="2 4"
                />
                <text
                  x={padL - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-muted-foreground font-mono"
                  fontSize="10"
                >
                  {t.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X labels */}
          {STAR_EVOLUTION.map((d, i) => {
            const x = padL + (i / (STAR_EVOLUTION.length - 1)) * plotW;
            return (
              <text
                key={d.week}
                x={x}
                y={H - 12}
                textAnchor="middle"
                className="fill-muted-foreground font-mono"
                fontSize="10"
              >
                {d.week}
              </text>
            );
          })}

          {/* Area */}
          <path d={areaPath(pts, baseY)} fill="url(#starEvolArea)" />
          {/* Line */}
          <path
            d={linePath(pts)}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {pts.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="3.5" fill="var(--gold)" />
              <circle cx={x} cy={y} r="6" fill="var(--gold)" fillOpacity="0.15" />
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                className="fill-foreground font-mono"
                fontSize="10"
              >
                {STAR_EVOLUTION[i].rating.toFixed(2)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

/* =====================================================================
 * Copilot mini-panel
 * ===================================================================== */

function CopilotPanel() {
  const [question, setQuestion] = React.useState("");
  const [activeAnswer, setActiveAnswer] = React.useState<string | null>(null);

  const handleAsk = (q: string) => {
    if (!q.trim()) return;
    setActiveAnswer(q.trim());
    setQuestion(q.trim());
  };

  const answer = activeAnswer ? COPILOT_ANSWERS[activeAnswer] : null;

  return (
    <section
      className="rp-glass rounded-2xl p-5 sm:p-6 rp-glow-teal"
      aria-label="Copiloto IA para reseñas"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--teal)]" aria-hidden />
          <h3 className="font-display text-lg font-medium">Copiloto IA · Reseñas</h3>
        </div>
        <DemoBadge />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(question);
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Pregúntale al Copilot sobre tus reseñas…"
            className="pl-9 bg-input/30 border-border/60"
            aria-label="Pregunta al Copiloto IA"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          className="bg-[var(--teal)] text-black hover:bg-[var(--teal)]/90"
        >
          <Send className="h-3.5 w-3.5" aria-hidden />
          Preguntar
        </Button>
      </form>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Sugerencias:
        </span>
        {COPILOT_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleAsk(s)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)]/40",
              activeAnswer === s
                ? "border-[var(--teal)]/60 bg-[var(--teal)]/10 text-[var(--teal)]"
                : "border-border/60 bg-foreground/[0.02] text-muted-foreground hover:text-foreground hover:border-[var(--teal)]/40"
            )}
          >
            <Sparkles className="h-3 w-3" aria-hidden />
            {s}
          </button>
        ))}
      </div>

      {answer && (
        <div className="mt-4 rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.04] p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[var(--teal)] to-[var(--teal-deep)] flex items-center justify-center text-black">
              <Sparkles className="h-4 w-4" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--teal)] mb-1">
                Copiloto IA
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{answer.text}</p>

              {/* Meta */}
              <div className="mt-3 grid sm:grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="rounded-md border border-border/40 bg-foreground/[0.02] px-2 py-1">
                  <span className="text-muted-foreground">Fuente: </span>
                  <span className="text-foreground">Google Reviews (demo)</span>
                </div>
                <div className="rounded-md border border-border/40 bg-foreground/[0.02] px-2 py-1">
                  <span className="text-muted-foreground">Actualizado: </span>
                  <span className="text-foreground">hace 5 min</span>
                </div>
                <div className="rounded-md border border-border/40 bg-foreground/[0.02] px-2 py-1">
                  <span className="text-muted-foreground">Confianza: </span>
                  <span className="text-[var(--gold-soft)]">85%</span>
                </div>
              </div>

              {/* Action pills */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300">
                  <AlertCircle className="h-3 w-3" aria-hidden />
                  Revisar antes de ejecutar
                </span>
                {answer.actions.map((a) => (
                  <button
                    key={a}
                    onClick={() =>
                      toast({
                        title: "Acción en cola (demo)",
                        description: a,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] px-2.5 py-1 text-xs hover:bg-[var(--gold)]/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40"
                  >
                    <ShieldAlert className="h-3 w-3" aria-hidden />
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
