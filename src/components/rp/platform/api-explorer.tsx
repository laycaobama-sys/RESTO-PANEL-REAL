"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Copy,
  Play,
  Loader2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Hash,
  Search,
  Terminal,
} from "lucide-react";

/* ============================================================
 * ApiExplorer — Interactive API Explorer (demo mode)
 * 3 columns: endpoints | request builder | response viewer
 * Premium dark, glassmorphism, gold/turquoise accents.
 * ============================================================ */

type Method = "GET" | "POST" | "PATCH" | "DELETE";

interface EndpointDef {
  id: string;
  method: Method;
  path: string;
  description: string;
  hasQuery: boolean;
  hasBody: boolean;
  queryParams: { key: string; value: string; description: string }[];
  body: string;
  responseStatus: number;
  responseTime: number;
  responseHeaders: { k: string; v: string }[];
  responseBody: string;
}

interface ResourceGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  endpoints: EndpointDef[];
}

const RESOURCES: ResourceGroup[] = [
  {
    id: "reservations",
    name: "Reservations",
    icon: CalIcon,
    endpoints: [
      {
        id: "res-list",
        method: "GET",
        path: "/reservations",
        description: "Lista paginada de reservas",
        hasQuery: true,
        hasBody: false,
        queryParams: [
          { key: "location_id", value: "loc_01HZXKQ9F3J7M2XB5", description: "ID del local" },
          { key: "date", value: "2025-01-21", description: "Fecha (YYYY-MM-DD)" },
          { key: "status", value: "confirmed", description: "confirmed | pending | cancelled" },
          { key: "limit", value: "25", description: "Tamaño de página" },
          { key: "cursor", value: "", description: "Cursor de paginación" },
        ],
        body: "",
        responseStatus: 200,
        responseTime: 42,
        responseHeaders: [
          { k: "Content-Type", v: "application/json" },
          { k: "X-Request-Id", v: "req_01HZXM8W1X4Z3Q7NR" },
          { k: "X-RateLimit-Remaining", v: "8753" },
        ],
        responseBody: `{
  "data": [
    {
      "id": "res_01HZXKQ9F3J7M2XB5N8",
      "location_id": "loc_01HZXKQ9F3J7M2XB5",
      "customer": { "id": "cus_01HZXM8W1X4Z3Q7", "name": "Elena Marín" },
      "party_size": 4,
      "reserved_at": "2025-01-21T21:30:00Z",
      "status": "confirmed",
      "table": { "id": "tbl_01HZXM8W1X4Z3Q7", "name": "M12" }
    }
  ],
  "pagination": { "has_more": true, "next_cursor": "cur_01HZXM8W1X4Z3Q7" }
}`,
      },
      {
        id: "res-create",
        method: "POST",
        path: "/reservations",
        description: "Crea una nueva reserva",
        hasQuery: false,
        hasBody: true,
        queryParams: [],
        body: `{
  "location_id": "loc_01HZXKQ9F3J7M2XB5",
  "customer_id": "cus_01HZXM8W1X4Z3Q7",
  "party_size": 4,
  "reserved_at": "2025-01-21T21:30:00Z",
  "source": "api",
  "idem_key": "idem_01HZXM8W1X4Z3Q7"
}`,
        responseStatus: 201,
        responseTime: 168,
        responseHeaders: [
          { k: "Content-Type", v: "application/json" },
          { k: "X-Request-Id", v: "req_01HZXP2M4N7Q8R3KL" },
          { k: "Idempotency-Key", v: "idem_01HZXM8W1X4Z3Q7" },
        ],
        responseBody: `{
  "id": "res_01HZXP2M4N7Q8R3KL9W",
  "location_id": "loc_01HZXKQ9F3J7M2XB5",
  "customer": { "id": "cus_01HZXM8W1X4Z3Q7", "name": "Elena Marín" },
  "party_size": 4,
  "reserved_at": "2025-01-21T21:30:00Z",
  "status": "confirmed",
  "table": { "id": "tbl_01HZXM8W1X4Z3Q7", "name": "M12" },
  "created_at": "2025-01-20T14:32:11Z"
}`,
      },
      {
        id: "res-get",
        method: "GET",
        path: "/reservations/:id",
        description: "Obtiene una reserva por ID",
        hasQuery: false,
        hasBody: false,
        queryParams: [],
        body: "",
        responseStatus: 200,
        responseTime: 28,
        responseHeaders: [
          { k: "Content-Type", v: "application/json" },
          { k: "X-Request-Id", v: "req_01HZXR7T2V9Y5P1JK" },
        ],
        responseBody: `{
  "id": "res_01HZXKQ9F3J7M2XB5N8",
  "location_id": "loc_01HZXKQ9F3J7M2XB5",
  "customer": { "id": "cus_01HZXM8W1X4Z3Q7", "name": "Elena Marín" },
  "party_size": 4,
  "reserved_at": "2025-01-21T21:30:00Z",
  "status": "confirmed",
  "table": { "id": "tbl_01HZXM8W1X4Z3Q7", "name": "M12" },
  "notes": "Mesa junto a la ventana",
  "tags": ["vip", "aniversario"]
}`,
      },
      {
        id: "res-patch",
        method: "PATCH",
        path: "/reservations/:id",
        description: "Actualiza una reserva existente",
        hasQuery: false,
        hasBody: true,
        queryParams: [],
        body: `{
  "party_size": 6,
  "reserved_at": "2025-01-21T22:00:00Z",
  "notes": "Cambio de hora · comensales +2"
}`,
        responseStatus: 200,
        responseTime: 96,
        responseHeaders: [
          { k: "Content-Type", v: "application/json" },
          { k: "X-Request-Id", v: "req_01HZXM8W1X4Z3Q7NR" },
        ],
        responseBody: `{
  "id": "res_01HZXKQ9F3J7M2XB5N8",
  "location_id": "loc_01HZXKQ9F3J7M2XB5",
  "customer": { "id": "cus_01HZXM8W1X4Z3Q7", "name": "Elena Marín" },
  "party_size": 6,
  "reserved_at": "2025-01-21T22:00:00Z",
  "status": "confirmed",
  "table": { "id": "tbl_01HZXM8W1X4Z3Q7", "name": "M14" },
  "updated_at": "2025-01-20T15:10:42Z"
}`,
      },
      {
        id: "res-delete",
        method: "DELETE",
        path: "/reservations/:id",
        description: "Cancela una reserva (soft delete)",
        hasQuery: false,
        hasBody: false,
        queryParams: [],
        body: "",
        responseStatus: 403,
        responseTime: 14,
        responseHeaders: [
          { k: "Content-Type", v: "application/json" },
          { k: "X-Request-Id", v: "req_01HZXKQ9F3J7M2XB5" },
        ],
        responseBody: `{
  "error": {
    "code": "forbidden",
    "message": "Faltan permisos: delete:reservations",
    "request_id": "req_01HZXKQ9F3J7M2XB5"
  }
}`,
      },
    ],
  },
  {
    id: "customers",
    name: "Customers",
    icon: UsersIcon,
    endpoints: [
      {
        id: "cust-list",
        method: "GET",
        path: "/customers",
        description: "Lista paginada de clientes",
        hasQuery: true,
        hasBody: false,
        queryParams: [
          { key: "q", value: "Elena", description: "Búsqueda por nombre/email" },
          { key: "vip", value: "true", description: "Solo clientes VIP" },
          { key: "limit", value: "25", description: "Tamaño de página" },
          { key: "cursor", value: "", description: "Cursor de paginación" },
        ],
        body: "",
        responseStatus: 200,
        responseTime: 35,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "data": [
    {
      "id": "cus_01HZXM8W1X4Z3Q7",
      "name": "Elena Marín",
      "email": "elena.marin@example.com",
      "phone": "+34 612 345 678",
      "vip": true,
      "lifetime_value": 4820.50,
      "visits": 24
    }
  ],
  "pagination": { "has_more": false, "next_cursor": null }
}`,
      },
      {
        id: "cust-create",
        method: "POST",
        path: "/customers",
        description: "Crea un nuevo cliente",
        hasQuery: false,
        hasBody: true,
        queryParams: [],
        body: `{
  "name": "Elena Marín",
  "email": "elena.marin@example.com",
  "phone": "+34 612 345 678",
  "tags": ["vip", "frecuente"],
  "metadata": { "idioma": "es", "alergias": ["frutos secos"] }
}`,
        responseStatus: 201,
        responseTime: 88,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "id": "cus_01HZXM8W1X4Z3Q7",
  "name": "Elena Marín",
  "email": "elena.marin@example.com",
  "phone": "+34 612 345 678",
  "vip": false,
  "tags": ["vip", "frecuente"],
  "created_at": "2025-01-20T14:32:11Z"
}`,
      },
      {
        id: "cust-get",
        method: "GET",
        path: "/customers/:id",
        description: "Obtiene un cliente por ID",
        hasQuery: false,
        hasBody: false,
        queryParams: [],
        body: "",
        responseStatus: 200,
        responseTime: 22,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "id": "cus_01HZXM8W1X4Z3Q7",
  "name": "Elena Marín",
  "email": "elena.marin@example.com",
  "phone": "+34 612 345 678",
  "vip": true,
  "lifetime_value": 4820.50,
  "visits": 24,
  "last_visit": "2025-01-15T21:00:00Z",
  "preferences": { "table": "ventana", "diet": "vegetariana" }
}`,
      },
      {
        id: "cust-patch",
        method: "PATCH",
        path: "/customers/:id",
        description: "Actualiza datos del cliente",
        hasQuery: false,
        hasBody: true,
        queryParams: [],
        body: `{
  "vip": true,
  "tags": ["vip", "aniversario"],
  "notes": "Cliente frecuente · prefiere mesa M12"
}`,
        responseStatus: 200,
        responseTime: 64,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "id": "cus_01HZXM8W1X4Z3Q7",
  "name": "Elena Marín",
  "vip": true,
  "tags": ["vip", "aniversario"],
  "updated_at": "2025-01-20T15:10:42Z"
}`,
      },
    ],
  },
  {
    id: "tables",
    name: "Tables",
    icon: GridIcon,
    endpoints: [
      {
        id: "tbl-list",
        method: "GET",
        path: "/tables",
        description: "Lista mesas de un local",
        hasQuery: true,
        hasBody: false,
        queryParams: [
          { key: "location_id", value: "loc_01HZXKQ9F3J7M2XB5", description: "ID del local" },
          { key: "available_at", value: "2025-01-21T21:30:00Z", description: "Disponibilidad" },
        ],
        body: "",
        responseStatus: 200,
        responseTime: 30,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "data": [
    { "id": "tbl_01HZXM8W1X4Z3Q7", "name": "M12", "capacity": 4, "zone": "salón", "status": "available" },
    { "id": "tbl_01HZXM8W1X4Z3Q7A", "name": "M14", "capacity": 6, "zone": "terraza", "status": "occupied" }
  ]
}`,
      },
      {
        id: "tbl-patch",
        method: "PATCH",
        path: "/tables/:id",
        description: "Actualiza estado o capacidad de una mesa",
        hasQuery: false,
        hasBody: true,
        queryParams: [],
        body: `{
  "status": "reserved",
  "capacity": 6,
  "notes": "Reservada para Elena Marín · 21:30"
}`,
        responseStatus: 200,
        responseTime: 52,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "id": "tbl_01HZXM8W1X4Z3Q7",
  "name": "M12",
  "capacity": 6,
  "zone": "salón",
  "status": "reserved",
  "updated_at": "2025-01-20T15:10:42Z"
}`,
      },
    ],
  },
  {
    id: "reviews",
    name: "Reviews",
    icon: StarIcon,
    endpoints: [
      {
        id: "rev-list",
        method: "GET",
        path: "/reviews",
        description: "Lista reseñas de Google y Tripadvisor",
        hasQuery: true,
        hasBody: false,
        queryParams: [
          { key: "location_id", value: "loc_01HZXKQ9F3J7M2XB5", description: "ID del local" },
          { key: "source", value: "google", description: "google | tripadvisor" },
          { key: "min_rating", value: "4", description: "Rating mínimo" },
          { key: "replied", value: "false", description: "Sin responder" },
        ],
        body: "",
        responseStatus: 200,
        responseTime: 48,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "data": [
    {
      "id": "rev_01HZXKQ9F3J7M2XB5",
      "source": "google",
      "author": "Marcos Ruiz",
      "rating": 5,
      "text": "Mejor paella de Madrid. Servicio impecable.",
      "created_at": "2025-01-18T20:14:00Z",
      "replied": false
    }
  ]
}`,
      },
      {
        id: "rev-reply",
        method: "POST",
        path: "/reviews/:id/reply",
        description: "Responde a una reseña públicamente",
        hasQuery: false,
        hasBody: true,
        queryParams: [],
        body: `{
  "text": "¡Gracias Marcos! Nos encanta saber que disfrutaste la paella. Te esperamos pronto.",
  "tone": "warm"
}`,
        responseStatus: 201,
        responseTime: 142,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "id": "rep_01HZXKQ9F3J7M2XB5",
  "review_id": "rev_01HZXKQ9F3J7M2XB5",
  "text": "¡Gracias Marcos! Nos encanta saber que disfrutaste la paella. Te esperamos pronto.",
  "author": "Ramses Madrid",
  "created_at": "2025-01-20T14:32:11Z"
}`,
      },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: ChartIcon,
    endpoints: [
      {
        id: "ana-occ",
        method: "GET",
        path: "/analytics/occupancy",
        description: "Ocupación histórica y proyectada",
        hasQuery: true,
        hasBody: false,
        queryParams: [
          { key: "location_id", value: "loc_01HZXKQ9F3J7M2XB5", description: "ID del local" },
          { key: "from", value: "2025-01-01", description: "Fecha inicio" },
          { key: "to", value: "2025-01-31", description: "Fecha fin" },
          { key: "granularity", value: "day", description: "hour | day | week" },
        ],
        body: "",
        responseStatus: 200,
        responseTime: 412,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "location_id": "loc_01HZXKQ9F3J7M2XB5",
  "granularity": "day",
  "series": [
    { "date": "2025-01-21", "occupancy": 0.82, "covers": 142 },
    { "date": "2025-01-22", "occupancy": 0.74, "covers": 128 }
  ],
  "summary": { "avg_occupancy": 0.78, "total_covers": 270, "no_show_rate": 0.04 }
}`,
      },
      {
        id: "ana-rev",
        method: "GET",
        path: "/analytics/revenue",
        description: "Ingresos por día/semana/mes",
        hasQuery: true,
        hasBody: false,
        queryParams: [
          { key: "location_id", value: "loc_01HZXKQ9F3J7M2XB5", description: "ID del local" },
          { key: "from", value: "2025-01-01", description: "Fecha inicio" },
          { key: "to", value: "2025-01-31", description: "Fecha fin" },
          { key: "group_by", value: "service", description: "service | day | channel" },
        ],
        body: "",
        responseStatus: 200,
        responseTime: 388,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "location_id": "loc_01HZXKQ9F3J7M2XB5",
  "currency": "EUR",
  "total": 48250.75,
  "series": [
    { "date": "2025-01-21", "lunch": 1820.50, "dinner": 4280.25 },
    { "date": "2025-01-22", "lunch": 1640.00, "dinner": 3920.50 }
  ],
  "by_channel": { "walk_in": 12480, "online": 28950, "phone": 6820.75 }
}`,
      },
    ],
  },
  {
    id: "webhooks",
    name: "Webhooks",
    icon: WebhookIcon,
    endpoints: [
      {
        id: "wh-list",
        method: "GET",
        path: "/webhooks",
        description: "Lista endpoints de webhook configurados",
        hasQuery: false,
        hasBody: false,
        queryParams: [],
        body: "",
        responseStatus: 200,
        responseTime: 31,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "data": [
    {
      "id": "whk_01HZXKQ9F3J7M2XB5",
      "url": "https://api.miserver.com/rp/events",
      "events": ["reservation.created", "reservation.updated", "review.received"],
      "status": "active",
      "last_delivery": "2025-01-20T14:30:11Z"
    }
  ]
}`,
      },
      {
        id: "wh-create",
        method: "POST",
        path: "/webhooks",
        description: "Registra un nuevo endpoint de webhook",
        hasQuery: false,
        hasBody: true,
        queryParams: [],
        body: `{
  "url": "https://api.miserver.com/rp/events",
  "events": ["reservation.created", "reservation.updated", "review.received"],
  "secret": "whsec_DEMO_REPLACE_ME",
  "active": true
}`,
        responseStatus: 201,
        responseTime: 72,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "id": "whk_01HZXKQ9F3J7M2XB5",
  "url": "https://api.miserver.com/rp/events",
  "events": ["reservation.created", "reservation.updated", "review.received"],
  "status": "active",
  "created_at": "2025-01-20T14:32:11Z"
}`,
      },
      {
        id: "wh-replay",
        method: "POST",
        path: "/webhooks/:id/replay",
        description: "Reenvía eventos recientes a un webhook",
        hasQuery: false,
        hasBody: true,
        queryParams: [],
        body: `{
  "from": "2025-01-19T00:00:00Z",
  "to": "2025-01-20T00:00:00Z",
  "events": ["reservation.created"]
}`,
        responseStatus: 200,
        responseTime: 1180,
        responseHeaders: [{ k: "Content-Type", v: "application/json" }],
        responseBody: `{
  "webhook_id": "whk_01HZXKQ9F3J7M2XB5",
  "replayed": 18,
  "delivered": 18,
  "failed": 0,
  "duration_ms": 1180
}`,
      },
    ],
  },
];

const ALL_ENDPOINTS: EndpointDef[] = RESOURCES.flatMap((r) => r.endpoints);
const SANDBOX_KEY = "sk_test_DEMO_KEY_REPLACE_ME";
const SANDBOX_BASE = "https://api.sandbox.restopanel.com/v1";

export function ApiExplorer() {
  const [selectedId, setSelectedId] = React.useState<string>("res-list");
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(RESOURCES.map((r) => [r.id, r.id === "reservations"]))
  );
  const selected = ALL_ENDPOINTS.find((e) => e.id === selectedId) ?? ALL_ENDPOINTS[0];

  function selectEndpoint(id: string) {
    setSelectedId(id);
    // expand the parent group
    const grp = RESOURCES.find((r) => r.endpoints.some((e) => e.id === id));
    if (grp) setExpanded((e) => ({ ...e, [grp.id]: true }));
  }

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">FASE 8</span>
            <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
            <span>Open Platform</span>
            
          </div>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-light tracking-tight">
            API Explorer
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Prueba los endpoints en vivo (modo sandbox). Selecciona un recurso,
            ajusta la petición y observa la respuesta.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 text-amber-300 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> sandbox
          </span>
          <Button variant="outline" size="sm" className="min-h-[40px]">
            <Terminal className="h-3.5 w-3.5" /> <code className="font-mono text-xs">/v1</code>
          </Button>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)_minmax(0,1fr)]">
        {/* LEFT: endpoint tree */}
        <EndpointTree
          query={query}
          setQuery={setQuery}
          expanded={expanded}
          setExpanded={setExpanded}
          selectedId={selectedId}
          onSelect={selectEndpoint}
        />

        {/* CENTER: request builder */}
        <RequestBuilder endpoint={selected} />

        {/* RIGHT: response viewer */}
        <ResponseViewer endpoint={selected} />
      </div>
    </div>
  );
}


/* ============================================================
 * LEFT: endpoint tree
 * ============================================================ */
function EndpointTree({
  query,
  setQuery,
  expanded,
  setExpanded,
  selectedId,
  onSelect,
}: {
  query: string;
  setQuery: (q: string) => void;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const q = query.trim().toLowerCase();
  const filtered = RESOURCES.map((r) => ({
    ...r,
    endpoints: r.endpoints.filter(
      (e) =>
        !q ||
        e.path.toLowerCase().includes(q) ||
        e.method.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    ),
  })).filter((r) => r.endpoints.length > 0);

  return (
    <div className="rp-glass rounded-xl p-3 lg:sticky lg:top-4 self-start max-h-none lg:max-h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar endpoint…"
          aria-label="Buscar endpoint"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
        />
      </div>
      <div className="h-px rp-divider mb-2" />
      <ScrollList>
        {filtered.length === 0 && (
          <div className="px-2 py-6 text-center text-xs text-muted-foreground">
            Sin resultados para “{query}”.
          </div>
        )}
        {filtered.map((r) => {
          const Icon = r.icon;
          const isOpen = !!expanded[r.id];
          return (
            <div key={r.id} className="mb-1">
              <button
                onClick={() => setExpanded((e) => ({ ...e, [r.id]: !e[r.id] }))}
                className="w-full min-h-[40px] flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                aria-expanded={isOpen}
              >
                {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <Icon className="h-3.5 w-3.5 text-[var(--gold)]" />
                <span className="truncate">{r.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground/70">{r.endpoints.length}</span>
              </button>
              {isOpen && (
                <ul className="mt-0.5 ml-2 border-l border-border/40 pl-1.5 space-y-0.5">
                  {r.endpoints.map((e) => (
                    <li key={e.id}>
                      <button
                        onClick={() => onSelect(e.id)}
                        className={cn(
                          "w-full min-h-[40px] flex flex-col items-start gap-0.5 rounded-md px-2 py-1.5 text-left transition-colors",
                          selectedId === e.id
                            ? "bg-[var(--gold)]/12"
                            : "hover:bg-foreground/5"
                        )}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          <MethodBadge method={e.method} />
                          <code className={cn(
                            "text-[11px] font-mono truncate flex-1",
                            selectedId === e.id ? "text-[var(--gold-soft)]" : "text-foreground/80"
                          )}>
                            {e.path}
                          </code>
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate w-full">{e.description}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </ScrollList>
    </div>
  );
}

function ScrollList({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-y-auto rp-scroll-thin flex-1 min-h-0 max-h-[60vh] lg:max-h-none">
      {children}
    </div>
  );
}

/* ============================================================
 * CENTER: request builder
 * ============================================================ */
function RequestBuilder({ endpoint }: { endpoint: EndpointDef }) {
  const { toast } = useToast();
  const [authKey, setAuthKey] = React.useState(SANDBOX_KEY);
  const [idemKey, setIdemKey] = React.useState("idem_01HZXM8W1X4Z3Q7");
  const [params, setParams] = React.useState(endpoint.queryParams);
  const [body, setBody] = React.useState(endpoint.body);
  const [loading, setLoading] = React.useState(false);

  // re-sync state when endpoint changes
  React.useEffect(() => {
    setParams(endpoint.queryParams.map((p) => ({ ...p })));
    setBody(endpoint.body);
  }, [endpoint.id, endpoint.queryParams, endpoint.body]);

  function genIdem() {
    const rand = Math.random().toString(36).slice(2, 16);
    setIdemKey(`idem_${rand}`);
    toast({ title: "Idempotency-Key generada", description: `idem_${rand.slice(0, 12)}…` });
  }

  function send() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: `${endpoint.responseStatus} · ${endpoint.responseTime}ms`,
        description: `${endpoint.method} ${endpoint.path}`,
      });
      // scroll response into view on mobile
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        const el = document.getElementById("rp-response");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 700);
  }

  function copyCurl() {
    const headers = [
      `-H "Authorization: Bearer ${authKey}"`,
      `-H "Content-Type: application/json"`,
    ];
    if (endpoint.hasBody) headers.push(`-H "Idempotency-Key: ${idemKey}"`);
    const qs = endpoint.hasQuery && params.some((p) => p.value)
      ? "?" + params.filter((p) => p.value).map((p) => `${p.key}=${encodeURIComponent(p.value)}`).join("&")
      : "";
    const url = `${SANDBOX_BASE}${endpoint.path}${qs}`;
    const bodyPart = endpoint.hasBody ? ` \\\n  -d '${body.replace(/\n\s*/g, " ")}'` : "";
    const cmd = `curl -X ${endpoint.method} ${url} \\\n  ${headers.join(" \\\n  ")}${bodyPart}`;
    navigator.clipboard?.writeText(cmd).catch(() => {});
    toast({ title: "cURL copiado", description: "Pégalo en tu terminal." });
  }

  function updateParam(idx: number, value: string) {
    setParams((cur) => cur.map((p, i) => (i === idx ? { ...p, value } : p)));
  }

  return (
    <div className="rp-glass rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <Hash className="h-3.5 w-3.5" /> Request
        </div>
        <Button variant="ghost" size="sm" className="h-8" onClick={copyCurl}>
          <Copy className="h-3 w-3" /> cURL
        </Button>
      </div>

      {/* method + path (read-only) */}
      <div className="flex items-center gap-2 flex-wrap">
        <MethodBadge method={endpoint.method} />
        <code className="text-xs font-mono text-foreground/90 break-all">{SANDBOX_BASE}{endpoint.path}</code>
      </div>
      <p className="text-[11px] text-muted-foreground -mt-2">{endpoint.description}</p>

      {/* headers */}
      <section className="space-y-2">
        <SectionLabel>Headers</SectionLabel>
        <div className="space-y-1.5">
          <HeaderRow
            k="Authorization"
            v={authKey}
            onChange={setAuthKey}
            mono
            hint="Bearer sk_test_…"
          />
          <HeaderRow k="Content-Type" v="application/json" readOnly mono />
          {endpoint.hasBody && (
            <HeaderRow
              k="Idempotency-Key"
              v={idemKey}
              onChange={setIdemKey}
              mono
              hint="Genera una key única"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px]"
                  onClick={genIdem}
                >
                  <Sparkles className="h-3 w-3" /> Generar
                </Button>
              }
            />
          )}
        </div>
      </section>

      {/* query params */}
      {endpoint.hasQuery && (
        <section className="space-y-2">
          <SectionLabel>Query params</SectionLabel>
          <div className="space-y-1.5">
            {params.map((p, i) => (
              <div key={p.key} className="grid grid-cols-[1fr_1.4fr] gap-2 items-center">
                <div className="min-w-0">
                  <code className="text-[11px] font-mono text-[var(--teal)] block truncate">{p.key}</code>
                  <span className="text-[10px] text-muted-foreground truncate block">{p.description}</span>
                </div>
                <Input
                  value={p.value}
                  onChange={(e) => updateParam(i, e.target.value)}
                  className="h-9 text-xs font-mono"
                  placeholder={p.description}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* body */}
      {endpoint.hasBody && (
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <SectionLabel>Body · JSON</SectionLabel>
            <button
              onClick={() => {
                try {
                  setBody(JSON.stringify(JSON.parse(body), null, 2));
                  toast({ title: "JSON formateado" });
                } catch {
                  toast({ title: "JSON inválido", description: "Revisa la sintaxis.", variant: "destructive" });
                }
              }}
              className="text-[10px] font-mono text-muted-foreground hover:text-[var(--gold)]"
            >
              Formatear
            </button>
          </div>
          <CodeEditor value={body} onChange={setBody} />
        </section>
      )}

      {/* send button */}
      <div className="pt-1">
        <Button
          onClick={send}
          disabled={loading}
          className="w-full min-h-[44px] bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Enviar petición
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function HeaderRow({
  k,
  v,
  onChange,
  readOnly,
  mono,
  hint,
  action,
}: {
  k: string;
  v: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  mono?: boolean;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr_auto] gap-2 items-center">
      <code className={cn("text-[11px] font-mono text-foreground/80 truncate", mono && "text-[var(--teal)]")}>{k}</code>
      <Input
        value={v}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className={cn("h-9 text-xs font-mono", readOnly && "opacity-70 cursor-not-allowed")}
        placeholder={hint}
        aria-label={k}
      />
      {action ?? <span className="w-0" />}
    </div>
  );
}

function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="rp-glass-strong rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">json</span>
        <span className="text-[10px] font-mono text-muted-foreground">{value.length} bytes</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        aria-label="Cuerpo de la petición JSON"
        className="w-full bg-transparent outline-none p-3 text-xs font-mono text-foreground/90 leading-relaxed resize-y min-h-[180px] rp-scroll-thin"
      />
    </div>
  );
}

/* ============================================================
 * RIGHT: response viewer
 * ============================================================ */
function ResponseViewer({ endpoint }: { endpoint: EndpointDef }) {
  const [showHeaders, setShowHeaders] = React.useState(true);
  // simulate empty state until first send per endpoint
  const [sent, setSent] = React.useState(false);
  const prevId = React.useRef(endpoint.id);
  React.useEffect(() => {
    if (prevId.current !== endpoint.id) {
      setSent(false);
      prevId.current = endpoint.id;
    }
  }, [endpoint.id]);

  function sendSimulated() {
    setSent(true);
  }

  return (
    <div id="rp-response" className="rp-glass rounded-xl p-4 flex flex-col gap-3 scroll-mt-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <Play className="h-3.5 w-3.5" /> Response
        </div>
        {!sent && (
          <Button variant="ghost" size="sm" className="h-8" onClick={sendSimulated}>
            <RefreshCw className="h-3 w-3" /> Simular
          </Button>
        )}
      </div>

      {!sent ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-foreground/[0.06] flex items-center justify-center">
            <Send className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="text-sm font-medium">Sin respuesta todavía</div>
            <div className="text-xs text-muted-foreground mt-1">
              Pulsa <span className="rp-gold-text">Enviar petición</span> para ver la respuesta.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* status + time */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge code={endpoint.responseStatus} />
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
              <Clock className="h-3 w-3" /> {endpoint.responseTime}ms
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
              <Hash className="h-3 w-3" /> {endpoint.responseHeaders.find((h) => h.k === "X-Request-Id")?.v ?? "—"}
            </span>
          </div>

          {/* response headers (collapsible) */}
          <Collapsible open={showHeaders} onOpenChange={setShowHeaders}>
            <CollapsibleTrigger asChild>
              <button className="w-full min-h-[36px] flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-foreground/5 transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Headers · {endpoint.responseHeaders.length}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", showHeaders && "rotate-180")} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-1 py-1">
                {endpoint.responseHeaders.map((h) => (
                  <div key={h.k} className="flex items-start gap-2 text-[11px] font-mono py-1 border-b border-border/40 last:border-0">
                    <span className="text-[var(--teal)] shrink-0">{h.k}:</span>
                    <span className="text-foreground/80 break-all">{h.v}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* body */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Body</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                onClick={() => {
                  navigator.clipboard?.writeText(endpoint.responseBody);
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <JsonBlock json={endpoint.responseBody} />
          </div>

          {/* contextual note */}
          {endpoint.responseStatus >= 400 && (
            <div className="rounded-md border border-rose-400/30 bg-rose-400/5 p-3 text-xs text-rose-200/80 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <div className="font-medium text-rose-200">Error {endpoint.responseStatus}</div>
                Verifica que tu API key tenga los scopes necesarios. Lee la
                sección <span className="font-mono">Errores</span> en la documentación.
              </div>
            </div>
          )}
          {endpoint.responseStatus < 400 && (
            <div className="rounded-md border border-emerald-400/25 bg-emerald-400/5 p-2.5 text-[11px] text-emerald-200/80 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              Respuesta simulada en modo sandbox · datos demo
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusBadge({ code }: { code: number }) {
  let cls = "border-emerald-400/40 bg-emerald-400/10 text-emerald-300";
  if (code >= 500) cls = "border-rose-400/50 bg-rose-400/10 text-rose-300";
  else if (code >= 400) cls = "border-rose-400/40 bg-rose-400/10 text-rose-300";
  else if (code === 201) cls = "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]";
  else if (code === 429) cls = "border-rose-400/50 bg-rose-400/10 text-rose-300";
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono font-semibold", cls)}>
      {code}
    </span>
  );
}

function JsonBlock({ json }: { json: string }) {
  // Lightweight syntax highlighting: wrap with regex into spans
  const html = React.useMemo(() => {
    const escaped = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = "text-amber-300"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) cls = "text-[var(--teal)]"; // key
          else cls = "text-emerald-300"; // string value
        } else if (/true|false/.test(match)) cls = "text-fuchsia-300";
        else if (/null/.test(match)) cls = "text-muted-foreground";
        return `<span class="${cls}">${match}</span>`;
      });
  }, [json]);
  return (
    <pre className="rp-glass-strong rounded-lg overflow-x-auto rp-scroll-thin p-3 text-xs leading-relaxed font-mono">
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}

/* ============================================================
 * Method badge + inline icons
 * ============================================================ */
function MethodBadge({ method }: { method: Method }) {
  const map: Record<Method, string> = {
    GET: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    POST: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    PATCH: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    DELETE: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  };
  return (
    <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider border shrink-0", map[method])}>
      {method}
    </span>
  );
}

/* Inline SVG icons for resource tree (avoid extra deps) */
function CalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  );
}
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 5-7" />
    </svg>
  );
}
function WebhookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
      <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
      <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
    </svg>
  );
}
