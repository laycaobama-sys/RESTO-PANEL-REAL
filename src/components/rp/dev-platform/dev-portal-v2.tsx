"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import {
  Search, Send, Copy, Check, Plus, KeyRound, AppWindow, Activity,
  Webhook, AlertTriangle, RotateCcw, Trash2, ChevronDown, ChevronRight,
  Code2, FileCode2, Terminal, BookOpen, Download, ExternalLink, Zap,
  Globe, Github, Star, Loader2, ArrowUpRight, FlaskConical, Shield,
  Database, Server, Layers, Lock, RefreshCw, FileJson, Sparkles,
  CalendarDays, Users, Map as MapIcon, LayoutGrid, MessageSquare,
  BarChart3, BrainCircuit, ShoppingBag, CreditCard, ListChecks,
  HeartPulse, LogIn, Boxes, Hash, Clock, TrendingUp, AlertCircle,
  CircleCheck, CircleDot, CirclePause, FileDown, Package, Gauge,
} from "lucide-react";

/* =====================================================================
 * Tipos
 * ===================================================================== */

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface Endpoint {
  id: string;
  category: string;
  method: HttpMethod;
  path: string;
  desc: string;
  hasQuery: boolean;
  hasBody: boolean;
  bodySample?: string;
}

type ApiVersion = "v1" | "v2";

interface ResponseData {
  status: number;
  timeMs: number;
  rateLimit: { limit: number; remaining: number; reset: number };
  headers: { name: string; value: string }[];
  body: unknown;
  hasMore?: boolean;
  nextCursor?: string;
  isError?: boolean;
}

interface DevApp {
  id: string;
  name: string;
  clientId: string;
  status: "active" | "paused" | "review";
  scopes: string[];
  installs: number;
  lastActive: string;
  desc: string;
}

interface ApiKey {
  id: string;
  name: string;
  env: "sandbox" | "production";
  masked: string;
  scopes: string[];
  created: string;
  lastUsed: string;
  status: "active" | "revoked";
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  lastDelivery: string;
  successRate: number;
  status: "active" | "paused";
}

interface ErrorLog {
  id: string;
  ts: string;
  endpoint: string;
  status: number;
  message: string;
  requestId: string;
}

interface SdkCard {
  id: string;
  language: string;
  icon: React.ElementType;
  package: string;
  install: string;
  version: string;
  downloads: string;
  stars: string;
  status: "Stable" | "Beta" | "RC";
}

/* =====================================================================
 * Datos demo
 * ===================================================================== */

const CATEGORIES = [
  "Reservations", "Customers", "Tables", "Floor", "CRM", "Reviews",
  "Analytics", "AI", "Marketplace", "Webhooks", "Billing", "Waitlist",
  "Events", "Auth", "Health",
] as const;

const ENDPOINTS: Endpoint[] = [
  // Reservations
  { id: "r1", category: "Reservations", method: "GET", path: "/v1/reservations", desc: "Lista paginada de reservas", hasQuery: true, hasBody: false },
  { id: "r2", category: "Reservations", method: "POST", path: "/v1/reservations", desc: "Crear nueva reserva", hasQuery: false, hasBody: true, bodySample: `{
  "customer_id": "cus_01HZX...",
  "table_id": "tbl_01HZX...",
  "date": "2025-01-21",
  "time": "21:30",
  "party_size": 4,
  "notes": "Mesa junto a la ventana"
}` },
  { id: "r3", category: "Reservations", method: "GET", path: "/v1/reservations/:id", desc: "Obtener reserva por ID", hasQuery: false, hasBody: false },
  { id: "r4", category: "Reservations", method: "PATCH", path: "/v1/reservations/:id", desc: "Actualizar reserva existente", hasQuery: false, hasBody: true, bodySample: `{
  "status": "confirmed",
  "party_size": 5
}` },
  { id: "r5", category: "Reservations", method: "DELETE", path: "/v1/reservations/:id", desc: "Cancelar reserva", hasQuery: false, hasBody: false },
  // Customers
  { id: "c1", category: "Customers", method: "GET", path: "/v1/customers", desc: "Lista paginada de clientes", hasQuery: true, hasBody: false },
  { id: "c2", category: "Customers", method: "POST", path: "/v1/customers", desc: "Crear ficha de cliente", hasQuery: false, hasBody: true, bodySample: `{
  "name": "Lucía Fernández",
  "email": "lucia@example.com",
  "phone": "+34666123456",
  "tags": ["VIP", "sin gluten"]
}` },
  { id: "c3", category: "Customers", method: "GET", path: "/v1/customers/:id", desc: "Obtener cliente por ID", hasQuery: false, hasBody: false },
  { id: "c4", category: "Customers", method: "PATCH", path: "/v1/customers/:id", desc: "Actualizar cliente", hasQuery: false, hasBody: true, bodySample: `{
  "tags": ["VIP", "aniversario"]
}` },
  // Tables
  { id: "t1", category: "Tables", method: "GET", path: "/v1/tables", desc: "Listar mesas del local", hasQuery: true, hasBody: false },
  { id: "t2", category: "Tables", method: "PATCH", path: "/v1/tables/:id", desc: "Actualizar estado de mesa", hasQuery: false, hasBody: true, bodySample: `{
  "status": "occupied",
  "seated_at": "2025-01-21T21:30:00Z"
}` },
  // Floor
  { id: "f1", category: "Floor", method: "GET", path: "/v1/floor", desc: "Obtener plano del restaurante", hasQuery: false, hasBody: false },
  { id: "f2", category: "Floor", method: "POST", path: "/v1/floor/elements", desc: "Añadir elemento al plano", hasQuery: false, hasBody: true, bodySample: `{
  "type": "table",
  "x": 120,
  "y": 80,
  "shape": "round",
  "capacity": 6
}` },
  // CRM
  { id: "cr1", category: "CRM", method: "GET", path: "/v1/crm/segments", desc: "Listar segmentos de clientes", hasQuery: true, hasBody: false },
  { id: "cr2", category: "CRM", method: "POST", path: "/v1/crm/segments", desc: "Crear segmento dinámico", hasQuery: false, hasBody: true, bodySample: `{
  "name": "Clientes VIP",
  "rules": {
    "lifetime_value": { "gte": 2000 },
    "visits_90d": { "gte": 4 }
  }
}` },
  // Reviews
  { id: "rv1", category: "Reviews", method: "GET", path: "/v1/reviews", desc: "Listar reseñas de Google", hasQuery: true, hasBody: false },
  { id: "rv2", category: "Reviews", method: "POST", path: "/v1/reviews/:id/reply", desc: "Responder a una reseña", hasQuery: false, hasBody: true, bodySample: `{
  "text": "Gracias por tu reseña, Marta. Nos encantará recibirte de nuevo."
}` },
  // Analytics
  { id: "an1", category: "Analytics", method: "GET", path: "/v1/analytics/occupancy", desc: "Tasa de ocupación por rango", hasQuery: true, hasBody: false },
  { id: "an2", category: "Analytics", method: "GET", path: "/v1/analytics/revenue", desc: "Ingresos agregados por período", hasQuery: true, hasBody: false },
  // AI
  { id: "ai1", category: "AI", method: "POST", path: "/v1/ai/predict-no-show", desc: "Predecir probabilidad de no-show", hasQuery: false, hasBody: true, bodySample: `{
  "reservation_id": "res_01HZX...",
  "customer_id": "cus_01HZX..."
}` },
  { id: "ai2", category: "AI", method: "GET", path: "/v1/ai/recommendations", desc: "Recomendaciones de IA", hasQuery: true, hasBody: false },
  // Marketplace
  { id: "mp1", category: "Marketplace", method: "GET", path: "/v1/marketplace/apps", desc: "Listar apps del marketplace", hasQuery: true, hasBody: false },
  { id: "mp2", category: "Marketplace", method: "POST", path: "/v1/marketplace/apps/:id/install", desc: "Instalar app del marketplace", hasQuery: false, hasBody: true, bodySample: `{
  "organization_id": "org_01HZX...",
  "scopes": ["read:reservations", "write:customers"]
}` },
  // Webhooks
  { id: "wh1", category: "Webhooks", method: "GET", path: "/v1/webhooks", desc: "Listar webhooks configurados", hasQuery: false, hasBody: false },
  { id: "wh2", category: "Webhooks", method: "POST", path: "/v1/webhooks", desc: "Crear endpoint de webhook", hasQuery: false, hasBody: true, bodySample: `{
  "url": "https://api.example.com/webhooks/rp",
  "events": ["reservation.created", "reservation.cancelled"],
  "secret": "whsec_..."
}` },
  { id: "wh3", category: "Webhooks", method: "POST", path: "/v1/webhooks/:id/replay", desc: "Reenviar último evento", hasQuery: false, hasBody: true, bodySample: `{
  "event_id": "evt_01HZX..."
}` },
  // Billing
  { id: "bl1", category: "Billing", method: "GET", path: "/v1/billing/invoices", desc: "Listar facturas", hasQuery: true, hasBody: false },
  { id: "bl2", category: "Billing", method: "GET", path: "/v1/billing/usage", desc: "Consumo del período actual", hasQuery: true, hasBody: false },
  // Waitlist
  { id: "wl1", category: "Waitlist", method: "GET", path: "/v1/waitlist", desc: "Lista de espera actual", hasQuery: true, hasBody: false },
  { id: "wl2", category: "Waitlist", method: "POST", path: "/v1/waitlist", desc: "Añadir a lista de espera", hasQuery: false, hasBody: true, bodySample: `{
  "name": "Diego Ruiz",
  "phone": "+34666999888",
  "party_size": 3
}` },
  { id: "wl3", category: "Waitlist", method: "POST", path: "/v1/waitlist/:id/assign", desc: "Asignar mesa a espera", hasQuery: false, hasBody: true, bodySample: `{
  "table_id": "tbl_01HZX..."
}` },
  // Events
  { id: "ev1", category: "Events", method: "GET", path: "/v1/events", desc: "Stream de eventos (audit log)", hasQuery: true, hasBody: false },
  // Auth
  { id: "au1", category: "Auth", method: "POST", path: "/v1/auth/token", desc: "Intercambiar código por token", hasQuery: false, hasBody: true, bodySample: `{
  "grant_type": "authorization_code",
  "code": "code_...",
  "client_id": "rp_live_01HZX...",
  "redirect_uri": "https://app.example.com/callback"
}` },
  { id: "au2", category: "Auth", method: "POST", path: "/v1/auth/revoke", desc: "Revocar token", hasQuery: false, hasBody: true, bodySample: `{
  "token": "sk_live_..."
}` },
  // Health
  { id: "hp1", category: "Health", method: "GET", path: "/v1/health", desc: "Estado del servicio", hasQuery: false, hasBody: false },
];

const METHOD_TONE: Record<HttpMethod, string> = {
  GET: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  POST: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  PATCH: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  DELETE: "border-destructive/50 bg-destructive/10 text-destructive",
};

const STATUS_TONE: Record<string, string> = {
  "2": "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  "201": "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  "4": "border-amber-400/40 bg-amber-400/10 text-amber-300",
  "5": "border-destructive/50 bg-destructive/10 text-destructive",
};

function statusTone(code: number): string {
  const exact = STATUS_TONE[String(code)];
  if (exact) return exact;
  return STATUS_TONE[String(code).charAt(0)] || STATUS_TONE["2"];
}

const SDKS: SdkCard[] = [
  { id: "js", language: "JavaScript", icon: Code2, package: "@restopanel/sdk", install: "npm install @restopanel/sdk", version: "2.1.0", downloads: "12.4k descargas/semana", stars: "★ 2.4k", status: "Stable" },
  { id: "ts", language: "TypeScript", icon: FileCode2, package: "@restopanel/sdk-ts", install: "npm install @restopanel/sdk-ts", version: "2.1.0", downloads: "9.8k descargas/semana", stars: "★ 1.9k", status: "Stable" },
  { id: "node", language: "Node.js", icon: Server, package: "restopanel-node", install: "npm install restopanel-node", version: "2.0.3", downloads: "7.2k descargas/semana", stars: "★ 1.4k", status: "Stable" },
  { id: "php", language: "PHP", icon: FileCode2, package: "restopanel/restopanel-php", install: "composer require restopanel/restopanel-php", version: "1.8.0", downloads: "3.1k descargas/mes", stars: "★ 620", status: "Stable" },
  { id: "python", language: "Python", icon: FileCode2, package: "restopanel-python", install: "pip install restopanel", version: "2.1.0", downloads: "8.5k descargas/mes", stars: "★ 1.7k", status: "Stable" },
  { id: "flutter", language: "Flutter", icon: Layers, package: "restopanel_flutter", install: "flutter pub add restopanel_flutter", version: "1.4.0", downloads: "2.0k descargas/mes", stars: "★ 480", status: "Beta" },
  { id: "rn", language: "React Native", icon: Code2, package: "@restopanel/react-native", install: "npm install @restopanel/react-native", version: "1.3.2", downloads: "1.4k descargas/semana", stars: "★ 320", status: "Beta" },
  { id: "swift", language: "Swift", icon: FileCode2, package: "RestoPanelSDK", install: ".package(url: \"https://github.com/restopanel/swift-sdk.git\")", version: "1.2.0", downloads: "—", stars: "★ 410", status: "RC" },
  { id: "kotlin", language: "Kotlin", icon: FileCode2, package: "com.restopanel:sdk", install: "implementation(\"com.restopanel:sdk:1.2.0\")", version: "1.2.0", downloads: "—", stars: "★ 380", status: "RC" },
  { id: "ruby", language: "Ruby", icon: FileCode2, package: "restopanel", install: "gem install restopanel", version: "1.6.1", downloads: "1.1k descargas/mes", stars: "★ 290", status: "Stable" },
];

const PLAYGROUND_SAMPLES: Record<string, string> = {
  JavaScript: `import RestoPanel from '@restopanel/sdk';

const rp = new RestoPanel({ apiKey: 'sk_test_...' });

const reservations = await rp.reservations.list({
  organization_id: 'org_01HZX...',
  date: '2025-01-21',
  limit: 10
});

console.log(reservations);`,
  TypeScript: `import RestoPanel, { Reservation } from '@restopanel/sdk-ts';

const rp = new RestoPanel({ apiKey: 'sk_test_...' });

const reservations: Reservation[] = await rp.reservations.list({
  organization_id: 'org_01HZX...' as const,
  date: '2025-01-21',
  limit: 10,
});

console.log(reservations);`,
  Python: `from restopanel import RestoPanel

rp = RestoPanel(api_key='sk_test_...')

reservations = rp.reservations.list(
    organization_id='org_01HZX...',
    date='2025-01-21',
    limit=10,
)

print(reservations)`,
  PHP: `<?php
require 'vendor/autoload.php';

use RestoPanel\\RestoPanel;

$rp = new RestoPanel(['api_key' => 'sk_test_...']);

$reservations = $rp->reservations->list([
  'organization_id' => 'org_01HZX...',
  'date' => '2025-01-21',
  'limit' => 10,
]);

print_r($reservations);`,
  Go: `package main

import (
    "fmt"
    "github.com/restopanel/go-sdk"
)

func main() {
    rp := restopanel.New("sk_test_...")
    reservations, err := rp.Reservations.List(&restopanel.ListParams{
        OrganizationID: "org_01HZX...",
        Date: "2025-01-21",
        Limit: 10,
    })
    if err != nil { panic(err) }
    fmt.Println(reservations)
}`,
  Java: `import com.restopanel.sdk.RestoPanel;
import com.restopanel.sdk.params.ListParams;

public class Main {
    public static void main(String[] args) {
        RestoPanel rp = new RestoPanel("sk_test_...");
        var reservations = rp.reservations().list(new ListParams()
            .setOrganizationId("org_01HZX...")
            .setDate("2025-01-21")
            .setLimit(10));
        System.out.println(reservations);
    }
}`,
  Ruby: `require 'restopanel'

rp = RestoPanel.new(api_key: 'sk_test_...')

reservations = rp.reservations.list(
  organization_id: 'org_01HZX...',
  date: '2025-01-21',
  limit: 10
)

puts reservations`,
  "C#": `using RestoPanel;

var rp = new RestoPanelClient("sk_test_...");
var reservations = await rp.Reservations.ListAsync(new ListParams {
    OrganizationId = "org_01HZX...",
    Date = "2025-01-21",
    Limit = 10,
});
Console.WriteLine(reservations);`,
  Swift: `import RestoPanelSDK

let rp = RestoPanel(apiKey: "sk_test_...")
Task {
    let reservations = try await rp.reservations.list(
        organizationId: "org_01HZX...",
        date: "2025-01-21",
        limit: 10
    )
    print(reservations)
}`,
  Kotlin: `import com.restopanel.sdk.RestoPanel

fun main() {
    val rp = RestoPanel("sk_test_...")
    val reservations = rp.reservations.list(
        organizationId = "org_01HZX...",
        date = "2025-01-21",
        limit = 10,
    )
    println(reservations)
}`,
};

const PLAYGROUND_LANGS = Object.keys(PLAYGROUND_SAMPLES);

const DEMO_APPS: DevApp[] = [
  { id: "a1", name: "Reserva Widget", clientId: "rp_live_01HZXABCD", status: "active", scopes: ["read:reservations", "write:reservations"], installs: 142, lastActive: "hace 2 min", desc: "Widget embebido para reservas en web" },
  { id: "a2", name: "CRM Sync Pro", clientId: "rp_live_01HZXEFGH", status: "active", scopes: ["read:customers", "write:customers"], installs: 89, lastActive: "hace 18 min", desc: "Sincroniza clientes con HubSpot" },
  { id: "a3", name: "Analytics Connector", clientId: "rp_live_01HZXIJKL", status: "review", scopes: ["read:analytics"], installs: 12, lastActive: "hace 3 días", desc: "Conector de BI para Power BI" },
  { id: "a4", name: "POS Bridge", clientId: "rp_live_01HZXLMNO", status: "paused", scopes: ["read:tables", "write:tables"], installs: 34, lastActive: "hace 1 semana", desc: "Integración con sistemas POS" },
];

const DEMO_KEYS: ApiKey[] = [
  { id: "k1", name: "Production · Web App", env: "production", masked: "sk_live_••••••••••••3F9A", scopes: ["read:reservations", "write:reservations", "read:customers"], created: "12 dic 2024", lastUsed: "hace 4 min", status: "active" },
  { id: "k2", name: "Sandbox · CI", env: "sandbox", masked: "sk_test_••••••••••••7C2D", scopes: ["read:reservations", "read:customers"], created: "3 ene 2025", lastUsed: "hace 22 min", status: "active" },
  { id: "k3", name: "Sandbox · Mobile", env: "sandbox", masked: "sk_test_••••••••••••1B8E", scopes: ["read:reservations"], created: "28 nov 2024", lastUsed: "hace 1 mes", status: "active" },
];

const DEMO_WEBHOOKS: WebhookEndpoint[] = [
  { id: "w1", url: "https://api.ramses.com/webhooks/rp", events: ["reservation.created", "reservation.cancelled", "customer.updated"], lastDelivery: "hace 2 min", successRate: 99.8, status: "active" },
  { id: "w2", url: "https://hooks.zapier.com/rp/incoming", events: ["review.created"], lastDelivery: "hace 12 min", successRate: 100, status: "active" },
  { id: "w3", url: "https://api.crm-sync.com/rp/events", events: ["customer.updated", "waitlist.assigned"], lastDelivery: "hace 1 hora", successRate: 97.4, status: "paused" },
];

const DEMO_ERRORS: ErrorLog[] = [
  { id: "e1", ts: "14:32:08", endpoint: "POST /v1/reservations", status: 422, message: "Validation error: party_size must be ≥ 1", requestId: "req_01HZX8KQ2P" },
  { id: "e2", ts: "14:18:51", endpoint: "GET /v1/analytics/revenue", status: 429, message: "Rate limit exceeded", requestId: "req_01HZX7JM1N" },
  { id: "e3", ts: "13:55:02", endpoint: "PATCH /v1/tables/tbl_01HZX", status: 403, message: "Insufficient permissions (scope write:tables missing)", requestId: "req_01HZX6PL9X" },
  { id: "e4", ts: "12:41:33", endpoint: "POST /v1/webhooks", status: 400, message: "Invalid URL: missing https scheme", requestId: "req_01HZX5LM7T" },
  { id: "e5", ts: "11:09:47", endpoint: "GET /v1/customers/cus_01HZX", status: 404, message: "Resource not found", requestId: "req_01HZX4KN3R" },
];

const TOP_ENDPOINTS = [
  { ep: "GET /v1/reservations", reqs: 8_412, avg: 38, errors: 0.2 },
  { ep: "POST /v1/reservations", reqs: 3_188, avg: 89, errors: 0.4 },
  { ep: "GET /v1/customers", reqs: 2_544, avg: 41, errors: 0.1 },
  { ep: "GET /v1/analytics/occupancy", reqs: 1_876, avg: 124, errors: 0.6 },
  { ep: "POST /v1/ai/predict-no-show", reqs: 942, avg: 312, errors: 1.1 },
];

const USAGE_30D = [
  820, 910, 1_045, 980, 1_120, 1_290, 1_350, 1_180, 1_040, 1_220,
  1_380, 1_510, 1_460, 1_580, 1_720, 1_690, 1_810, 1_740, 1_880, 1_920,
  1_790, 1_850, 1_910, 1_870, 1_940, 1_880, 1_970, 1_830, 1_847, 1_847,
];

const DOCS_TREE: { section: string; items: { id: string; label: string }[] }[] = [
  {
    section: "Getting Started",
    items: [
      { id: "quickstart", label: "Quick Start" },
      { id: "auth", label: "Authentication" },
      { id: "pagination", label: "Pagination" },
      { id: "errors", label: "Errors" },
      { id: "rate-limits", label: "Rate Limits" },
      { id: "idempotency", label: "Idempotency" },
    ],
  },
  {
    section: "Resources",
    items: [
      { id: "reservations", label: "Reservations" },
      { id: "customers", label: "Customers" },
      { id: "tables", label: "Tables" },
      { id: "floor", label: "Floor" },
      { id: "crm", label: "CRM" },
      { id: "reviews", label: "Reviews" },
      { id: "analytics", label: "Analytics" },
      { id: "ai", label: "AI" },
      { id: "marketplace", label: "Marketplace" },
      { id: "webhooks", label: "Webhooks" },
      { id: "billing", label: "Billing" },
    ],
  },
  {
    section: "Guides",
    items: [
      { id: "oauth", label: "OAuth 2.1" },
      { id: "webhooks-guide", label: "Webhooks" },
      { id: "sdks-guide", label: "SDKs" },
      { id: "cli", label: "CLI" },
      { id: "sandbox", label: "Sandbox" },
      { id: "migration-v2", label: "Migration v1→v2" },
    ],
  },
  {
    section: "Reference",
    items: [
      { id: "changelog", label: "Changelog" },
      { id: "api-status", label: "API Status" },
    ],
  },
];

const DOC_CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  quickstart: {
    title: "Quick Start",
    body: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p className="text-foreground">Bienvenido a la API de RestoPanel.</p>
        <p>En menos de 5 minutos podrás crear tu primera reserva vía API.</p>
        <pre className="rp-glass rounded-lg p-4 text-xs font-mono text-[var(--gold-soft)] overflow-x-auto rp-scroll-thin"><code>{`curl https://api.restopanel.com/v1/reservations \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_id": "cus_01HZX...",
    "table_id": "tbl_01HZX...",
    "date": "2025-01-21",
    "time": "21:30",
    "party_size": 4
  }'`}</code></pre>
        <p>Recibirás una respuesta <code className="text-[var(--teal)]">201 Created</code> con el objeto de la reserva creada.</p>
      </div>
    ),
  },
  auth: {
    title: "Authentication",
    body: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>RestoPanel usa <span className="text-foreground">Bearer tokens</span>. Pasa tu API key en la cabecera <code className="text-[var(--teal)]">Authorization</code>:</p>
        <pre className="rp-glass rounded-lg p-4 text-xs font-mono text-[var(--gold-soft)] overflow-x-auto rp-scroll-thin"><code>Authorization: Bearer sk_test_...</code></pre>
        <p>Tus claves sandbox (<code className="text-[var(--teal)]">sk_test_</code>) no afectan a datos reales. Las claves de producción (<code className="text-[var(--teal)]">sk_live_</code>) sí.</p>
        <p>Para apps de terceros usa <span className="text-foreground">OAuth 2.1</span> (PKCE obligatorio).</p>
      </div>
    ),
  },
  pagination: {
    title: "Pagination",
    body: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>Todos los endpoints de lista usan <span className="text-foreground">cursor-based pagination</span>.</p>
        <pre className="rp-glass rounded-lg p-4 text-xs font-mono text-[var(--gold-soft)] overflow-x-auto rp-scroll-thin"><code>{`{
  "data": [...],
  "has_more": true,
  "next_cursor": "cur_01HZX..."
}`}</code></pre>
        <p>Pasa <code className="text-[var(--teal)]">?cursor=cur_01HZX...</code> para obtener la siguiente página.</p>
      </div>
    ),
  },
  errors: {
    title: "Errors",
    body: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>Usamos <span className="text-foreground">RFC 9457 (problem+json)</span> para errores:</p>
        <pre className="rp-glass rounded-lg p-4 text-xs font-mono text-[var(--gold-soft)] overflow-x-auto rp-scroll-thin"><code>{`{
  "type": "https://docs.restopanel.com/errors/forbidden",
  "title": "Insufficient permissions",
  "status": 403,
  "detail": "Your API key lacks the 'write:reservations' scope.",
  "instance": "/v1/reservations",
  "request_id": "req_01HZX..."
}`}</code></pre>
      </div>
    ),
  },
  "rate-limits": {
    title: "Rate Limits",
    body: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>Límite estándar: <span className="text-foreground">100 req/seg · 10.000 req/día</span> por organización.</p>
        <p>Cabeceras de rate limit en cada respuesta:</p>
        <pre className="rp-glass rounded-lg p-4 text-xs font-mono text-[var(--gold-soft)] overflow-x-auto rp-scroll-thin"><code>{`X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 8153
X-RateLimit-Reset: 1737475200`}</code></pre>
        <p>Al exceder el límite recibes <code className="text-[var(--teal)]">429 Too Many Requests</code>.</p>
      </div>
    ),
  },
  idempotency: {
    title: "Idempotency",
    body: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>Para <span className="text-foreground">POST</span> y <span className="text-foreground">PATCH</span> puedes enviar <code className="text-[var(--teal)]">Idempotency-Key</code> para evitar duplicados:</p>
        <pre className="rp-glass rounded-lg p-4 text-xs font-mono text-[var(--gold-soft)] overflow-x-auto rp-scroll-thin"><code>{`Idempotency-Key: 7c8d4e2a-1b6f-4c3a-9d5e-8f2a1b3c4d5e`}</code></pre>
        <p>Reenvíos con la misma clave devuelven la misma respuesta original.</p>
      </div>
    ),
  },
  changelog: {
    title: "Changelog",
    body: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <div><span className="text-[var(--gold-soft)] font-mono text-xs">2025-01-21</span> · v2.1.0 · Añadido <code className="text-[var(--teal)]">/v1/ai/recommendations</code>.</div>
        <div><span className="text-[var(--gold-soft)] font-mono text-xs">2025-01-15</span> · v2.0.3 · Mejora en paginación cursor.</div>
        <div><span className="text-[var(--gold-soft)] font-mono text-xs">2024-12-20</span> · v2.0.0 · Lanzamiento de API v2.</div>
        <div><span className="text-[var(--gold-soft)] font-mono text-xs">2024-11-05</span> · v1.9.4 · Parche de seguridad en OAuth.</div>
      </div>
    ),
  },
  "api-status": {
    title: "API Status",
    body: (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between"><span className="text-muted-foreground">API REST</span><Badge className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300">Operativo</Badge></div>
        <div className="flex items-center justify-between"><span className="text-muted-foreground">Webhooks</span><Badge className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300">Operativo</Badge></div>
        <div className="flex items-center justify-between"><span className="text-muted-foreground">AI Engine</span><Badge className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300">Operativo</Badge></div>
        <div className="flex items-center justify-between"><span className="text-muted-foreground">Sandbox</span><Badge className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300">Operativo</Badge></div>
        <div className="flex items-center justify-between"><span className="text-muted-foreground">Marketplace</span><Badge className="border-amber-400/40 bg-amber-400/10 text-amber-300">Degradado</Badge></div>
      </div>
    ),
  },
};

const DEFAULT_DOC_BODY: React.ReactNode = (
  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
    <p className="text-foreground">Documentación en construcción.</p>
    <p>Esta sección es una demostración del portal de desarrolladores RestoPanel. La documentación completa está disponible en el portal interno.</p>
    <p>Próximamente: ejemplos de código, esquemas OpenAPI completos y casos de uso reales de cada recurso.</p>
  </div>
);

/* =====================================================================
 * Utilidades
 * ===================================================================== */

function genIdempotency(): string {
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 8; i++) s += hex[Math.floor(Math.random() * 16)];
  s += "-";
  for (let i = 0; i < 4; i++) s += hex[Math.floor(Math.random() * 16)];
  s += "-4";
  for (let i = 0; i < 3; i++) s += hex[Math.floor(Math.random() * 16)];
  s += "-";
  for (let i = 0; i < 4; i++) s += hex[Math.floor(Math.random() * 16)];
  for (let i = 0; i < 4; i++) s += hex[Math.floor(Math.random() * 16)];
  for (let i = 0; i < 4; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

function genRequestId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "req_01HZX";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function generateResponse(ep: Endpoint, version: ApiVersion): ResponseData {
  const now = Math.floor(Date.now() / 1000);
  const rid = genRequestId();
  const commonHeaders = [
    { name: "Content-Type", value: "application/json" },
    { name: "X-Request-Id", value: rid },
    { name: "X-RateLimit-Limit", value: "10000" },
    { name: "X-RateLimit-Remaining", value: "8153" },
    { name: "X-RateLimit-Reset", value: String(now + 60) },
  ];

  // Demo de error: si el endpoint es POST /v1/auth/revoke, simula 401
  if (ep.id === "au2") {
    return {
      status: 401,
      timeMs: 18 + Math.floor(Math.random() * 30),
      rateLimit: { limit: 10000, remaining: 8153, reset: now + 60 },
      headers: commonHeaders,
      body: {
        type: "https://docs.restopanel.com/errors/unauthorized",
        title: "Token invalid or expired",
        status: 401,
        detail: "The provided token has been revoked or is no longer valid.",
        instance: `/${version}${ep.path.replace("/v1", "")}`,
        request_id: rid,
      },
      isError: true,
    };
  }

  // Health
  if (ep.id === "hp1") {
    return {
      status: 200,
      timeMs: 14 + Math.floor(Math.random() * 20),
      rateLimit: { limit: 10000, remaining: 8153, reset: now + 60 },
      headers: commonHeaders,
      body: {
        status: "ok",
        version: "2.1.0",
        time: new Date().toISOString(),
        services: {
          api: "operational",
          d1: "operational",
          r2: "operational",
          kv: "operational",
          queues: "operational",
          ai: "operational",
        },
      },
    };
  }

  // Auth/token
  if (ep.id === "au1") {
    return {
      status: 200,
      timeMs: 124 + Math.floor(Math.random() * 80),
      rateLimit: { limit: 10000, remaining: 8153, reset: now + 60 },
      headers: commonHeaders,
      body: {
        access_token: "sk_live_" + "•".repeat(24),
        refresh_token: "rt_live_" + "•".repeat(24),
        token_type: "Bearer",
        expires_in: 3600,
        scope: "read:reservations write:reservations read:customers",
      },
    };
  }

  const basePath = `/${version}${ep.path.replace("/v1", "").replace("/:id", "/res_01HZX1234").replace(":id", "res_01HZX1234")}`;

  // Listas GET
  if (ep.method === "GET" && !ep.path.includes(":id")) {
    const isAnalytics = ep.category === "Analytics";
    if (isAnalytics) {
      return {
        status: 200,
        timeMs: 88 + Math.floor(Math.random() * 80),
        rateLimit: { limit: 10000, remaining: 8153, reset: now + 60 },
        headers: commonHeaders,
        body: {
          data: [
            { date: "2025-01-21", occupancy: 0.84, revenue: 4820 },
            { date: "2025-01-22", occupancy: 0.91, revenue: 5210 },
            { date: "2025-01-23", occupancy: 0.76, revenue: 3980 },
            { date: "2025-01-24", occupancy: 0.95, revenue: 6140 },
          ],
          period: "last_7d",
          currency: "EUR",
        },
      };
    }
    if (ep.category === "Webhooks") {
      return {
        status: 200,
        timeMs: 32 + Math.floor(Math.random() * 30),
        rateLimit: { limit: 10000, remaining: 8153, reset: now + 60 },
        headers: commonHeaders,
        body: {
          data: DEMO_WEBHOOKS.map((w) => ({
            id: w.id,
            url: w.url,
            events: w.events,
            status: w.status,
            success_rate: w.successRate,
          })),
          has_more: false,
        },
      };
    }
    return {
      status: 200,
      timeMs: 38 + Math.floor(Math.random() * 30),
      rateLimit: { limit: 10000, remaining: 8153, reset: now + 60 },
      headers: commonHeaders,
      body: {
        data: [
          {
            id: "res_01HZX1234",
            object: "reservation",
            customer_id: "cus_01HZXABCD",
            table_id: "tbl_01HZX5678",
            date: "2025-01-21",
            time: "21:30",
            party_size: 4,
            status: "confirmed",
            created_at: "2025-01-20T10:32:00Z",
          },
          {
            id: "res_01HZX5678",
            object: "reservation",
            customer_id: "cus_01HZXEFGH",
            table_id: "tbl_01HZX9012",
            date: "2025-01-21",
            time: "22:00",
            party_size: 2,
            status: "pending",
            created_at: "2025-01-20T11:15:00Z",
          },
        ],
        has_more: true,
        next_cursor: "cur_01HZXNEXTPAGE",
      },
      hasMore: true,
      nextCursor: "cur_01HZXNEXTPAGE",
    };
  }

  // GET /:id
  if (ep.method === "GET" && ep.path.includes(":id")) {
    return {
      status: 200,
      timeMs: 24 + Math.floor(Math.random() * 20),
      rateLimit: { limit: 10000, remaining: 8153, reset: now + 60 },
      headers: commonHeaders,
      body: {
        id: "res_01HZX1234",
        object: "reservation",
        customer_id: "cus_01HZXABCD",
        customer: {
          id: "cus_01HZXABCD",
          name: "Lucía Fernández",
          email: "lucia@example.com",
          phone: "+34666123456",
        },
        table_id: "tbl_01HZX5678",
        table: { id: "tbl_01HZX5678", label: "Mesa 12", capacity: 4 },
        date: "2025-01-21",
        time: "21:30",
        party_size: 4,
        status: "confirmed",
        notes: "Mesa junto a la ventana",
        created_at: "2025-01-20T10:32:00Z",
        updated_at: "2025-01-20T11:00:00Z",
      },
    };
  }

  // POST
  if (ep.method === "POST") {
    return {
      status: 201,
      timeMs: 86 + Math.floor(Math.random() * 30),
      rateLimit: { limit: 10000, remaining: 8152, reset: now + 60 },
      headers: [...commonHeaders, { name: "Location", value: basePath }],
      body: {
        id: "res_01HZXNEW01",
        object: "reservation",
        status: "pending",
        created_at: new Date().toISOString(),
        _links: {
          self: { href: basePath },
          confirm: { href: `${basePath}/confirm`, method: "POST" },
          cancel: { href: basePath, method: "DELETE" },
        },
      },
    };
  }

  // PATCH
  if (ep.method === "PATCH") {
    return {
      status: 200,
      timeMs: 42 + Math.floor(Math.random() * 30),
      rateLimit: { limit: 10000, remaining: 8151, reset: now + 60 },
      headers: commonHeaders,
      body: {
        id: "res_01HZX1234",
        object: "reservation",
        status: "confirmed",
        party_size: 5,
        updated_at: new Date().toISOString(),
      },
    };
  }

  // DELETE
  return {
    status: 200,
    timeMs: 28 + Math.floor(Math.random() * 20),
    rateLimit: { limit: 10000, remaining: 8150, reset: now + 60 },
    headers: commonHeaders,
    body: {
      id: "res_01HZX1234",
      object: "reservation",
      deleted: true,
    },
  };
}

function buildCurl(ep: Endpoint, version: ApiVersion, headers: Record<string, string>, body: string, query: { k: string; v: string }[]): string {
  const path = `/${version}${ep.path.replace("/v1", "").replace(":id", "res_01HZX1234")}`;
  let url = `https://api.restopanel.com${path}`;
  const q = query.filter((p) => p.k && p.v);
  if (q.length > 0) {
    url += "?" + q.map((p) => `${encodeURIComponent(p.k)}=${encodeURIComponent(p.v)}`).join("&");
  }
  const lines = [`curl -X ${ep.method} '${url}'`];
  Object.entries(headers).forEach(([k, v]) => {
    if (v) lines.push(`  -H '${k}: ${v}'`);
  });
  if (ep.hasBody && body.trim()) {
    lines.push(`  -d '${body.replace(/\n/g, " ").replace(/\s+/g, " ")}'`);
  }
  return lines.join(" \\\n");
}

function buildJs(ep: Endpoint, version: ApiVersion, headers: Record<string, string>, body: string, query: { k: string; v: string }[]): string {
  const path = ep.path.replace("/v1", `/${version}`).replace(":id", "res_01HZX1234");
  const q = query.filter((p) => p.k && p.v);
  const qStr = q.length ? `, { ${q.map((p) => `${p.k}: '${p.v}'`).join(", ")} }` : "";
  const opts: string[] = [];
  if (headers["Authorization"]) opts.push(`headers: { Authorization: '${headers["Authorization"]}' }`);
  if (ep.hasBody && body.trim()) opts.push(`body: JSON.stringify(${body})`);
  const optsStr = opts.length ? `, { ${opts.join(", ")} }` : "";
  return `import { RestoPanel } from '@restopanel/sdk';

const res = await fetch('https://api.restopanel.com${path}'${qStr}, {
  method: '${ep.method}'${optsStr}
});

const data = await res.json();
console.log(data);`;
}

function buildPython(ep: Endpoint, version: ApiVersion, headers: Record<string, string>, body: string, query: { k: string; v: string }[]): string {
  const path = ep.path.replace("/v1", `/${version}`).replace(":id", "res_01HZX1234");
  const q = query.filter((p) => p.k && p.v);
  const qStr = q.length ? "?" + q.map((p) => `${p.k}=${p.v}`).join("&") : "";
  const hdrs = Object.entries(headers).filter(([, v]) => v).map(([k, v]) => `    '${k}': '${v}'`).join(",\n");
  const bodyArg = ep.hasBody && body.trim() ? `\ndata = '''${body}'''` : "";
  const bodyParam = ep.hasBody && body.trim() ? ", data=data" : "";
  return `import requests

url = 'https://api.restopanel.com${path}${qStr}'
headers = {
${hdrs}
}${bodyArg}

response = requests.request('${ep.method}', url, headers=headers${bodyParam})
print(response.json())`;
}

/* =====================================================================
 * JSON syntax highlighter
 * ===================================================================== */

function JsonNode({ value, depth = 0 }: { value: unknown; depth?: number }) {
  const indent = "  ".repeat(depth);
  const indent2 = "  ".repeat(depth + 1);
  if (value === null) {
    return <span className="text-muted-foreground/60">null</span>;
  }
  if (typeof value === "boolean") {
    return <span className="text-pink-300">{String(value)}</span>;
  }
  if (typeof value === "number") {
    return <span className="text-amber-300">{String(value)}</span>;
  }
  if (typeof value === "string") {
    return <span className="text-emerald-300">&quot;{value}&quot;</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span>[]</span>;
    return (
      <span>
        <span className="text-muted-foreground">[</span>
        {value.map((v, i) => (
          <span key={i}>
            {"\n"}
            <span style={{ whiteSpace: "pre" }}>{indent2}</span>
            <JsonNode value={v} depth={depth + 1} />
            {i < value.length - 1 ? <span className="text-muted-foreground">,</span> : null}
          </span>
        ))}
        {"\n"}
        <span style={{ whiteSpace: "pre" }}>{indent}</span>
        <span className="text-muted-foreground">]</span>
      </span>
    );
  }
  if (typeof value === "object" && value) {
    const entries = Object.entries(value);
    if (entries.length === 0) return <span>{"{}"}</span>;
    return (
      <span>
        <span className="text-muted-foreground">{"{"}</span>
        {entries.map(([k, v], i) => (
          <span key={k}>
            {"\n"}
            <span style={{ whiteSpace: "pre" }}>{indent2}</span>
            <span className="text-[var(--teal)]">&quot;{k}&quot;</span>
            <span className="text-muted-foreground">: </span>
            <JsonNode value={v} depth={depth + 1} />
            {i < entries.length - 1 ? <span className="text-muted-foreground">,</span> : null}
          </span>
        ))}
        {"\n"}
        <span style={{ whiteSpace: "pre" }}>{indent}</span>
        <span className="text-muted-foreground">{"}"}</span>
      </span>
    );
  }
  return <span>{String(value)}</span>;
}

/* =====================================================================
 * Copy button
 * ===================================================================== */

function CopyButton({ value, label = "Copiar", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        try {
          navigator.clipboard?.writeText(value);
        } catch {
          /* noop */
        }
        setCopied(true);
        toast({ title: "Copiado", description: label === "Copiar" ? "Contenido copiado al portapapeles" : label });
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 min-h-[36px] rounded-md border border-border/60 bg-foreground/[0.03] px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors",
        className
      )}
      aria-label={label}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? "Copiado" : label}</span>
    </button>
  );
}

/* =====================================================================
 * Tabs wrapper
 * ===================================================================== */

const TAB_LIST = [
  { id: "explorer", label: "API Explorer", icon: Code2 },
  { id: "playground", label: "Playground", icon: FlaskConical },
  { id: "sdks", label: "SDKs", icon: Package },
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "docs", label: "Docs", icon: BookOpen },
] as const;

type TabId = (typeof TAB_LIST)[number]["id"];

/* =====================================================================
 * Componente principal
 * ===================================================================== */

export function DevPortalV2() {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = React.useState<TabId>("explorer");

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="rp-glass rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--teal)]/10 border border-[var(--gold)]/30 flex items-center justify-center">
            <Code2 className="h-6 w-6 text-[var(--gold-soft)]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">Developer Portal v2</h1>
              <Badge className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] uppercase tracking-wider">demo</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Explora la API, ejecuta código en el Playground, instala SDKs y gestiona tus apps y claves.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            API v2.1.0
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <Globe className="h-3 w-3" />
            api.restopanel.com
          </Badge>
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex gap-1.5 overflow-x-auto rp-scroll-thin -mx-1 px-1">
        {TAB_LIST.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 min-h-[44px] inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors",
              tab === t.id
                ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                : "border-border/60 bg-foreground/[0.02] text-muted-foreground hover:text-foreground hover:border-foreground/30"
            )}
            aria-pressed={tab === t.id}
          >
            <t.icon className="h-4 w-4" aria-hidden />
            <span className="font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {tab === "explorer" && <ApiExplorerTab />}
          {tab === "playground" && <PlaygroundTab />}
          {tab === "sdks" && <SdksTab />}
          {tab === "dashboard" && <DashboardTab />}
          {tab === "docs" && <DocsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* =====================================================================
 * Tab: API Explorer
 * ===================================================================== */

function ApiExplorerTab() {
  const [version, setVersion] = React.useState<ApiVersion>("v1");
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>("r1");
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [mobilePane, setMobilePane] = React.useState<"endpoint" | "request" | "response">("endpoint");

  // Request state
  const [headers, setHeaders] = React.useState<Record<string, string>>({
    Authorization: "Bearer sk_test_••••••••••••3F9A",
    "Content-Type": "application/json",
    "Idempotency-Key": "",
    "X-Organization-Id": "org_01HZX...",
  });
  const [queryRows, setQueryRows] = React.useState<{ k: string; v: string }[]>([
    { k: "limit", v: "10" },
    { k: "", v: "" },
  ]);
  const [body, setBody] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState<ResponseData | null>(null);

  const selected = ENDPOINTS.find((e) => e.id === selectedId) ?? ENDPOINTS[0];

  React.useEffect(() => {
    setBody(selected.bodySample ?? "");
    setResponse(null);
    setMobilePane("request");
  }, [selectedId, selected.bodySample]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ENDPOINTS;
    return ENDPOINTS.filter((e) => {
      return (
        e.path.toLowerCase().includes(q) ||
        e.desc.toLowerCase().includes(q) ||
        e.method.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    });
  }, [search]);

  const grouped = React.useMemo(() => {
    const map: Record<string, Endpoint[]> = {};
    for (const e of filtered) {
      if (!map[e.category]) map[e.category] = [];
      map[e.category].push(e);
    }
    return map;
  }, [filtered]);

  function send() {
    setLoading(true);
    setResponse(null);
    setTimeout(() => {
      setResponse(generateResponse(selected, version));
      setLoading(false);
    }, 850);
  }

  function updateHeader(k: string, v: string) {
    setHeaders((h) => ({ ...h, [k]: v }));
  }

  function regenerateIdempotency() {
    const v = genIdempotency();
    setHeaders((h) => ({ ...h, "Idempotency-Key": v }));
    toast({ title: "Idempotency-Key generada", description: v });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* LEFT — Endpoint tree */}
      <section
        className={cn(
          "lg:col-span-3 rp-glass rounded-2xl p-3 flex flex-col",
          mobilePane === "endpoint" ? "block" : "hidden lg:flex"
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-3 px-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            Endpoints
          </div>
          {/* Version toggle */}
          <div className="flex items-center rounded-md border border-border/60 overflow-hidden">
            <button
              onClick={() => setVersion("v1")}
              className={cn("px-2 py-1 text-xs font-mono transition-colors", version === "v1" ? "bg-[var(--gold)]/15 text-[var(--gold-soft)]" : "text-muted-foreground hover:text-foreground")}
            >
              v1
            </button>
            <button
              onClick={() => setVersion("v2")}
              className={cn("px-2 py-1 text-xs font-mono transition-colors", version === "v2" ? "bg-[var(--teal)]/15 text-[var(--teal)]" : "text-muted-foreground hover:text-foreground")}
            >
              v2
            </button>
          </div>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar endpoint..."
            className="pl-8 h-9 text-sm"
            aria-label="Buscar endpoint"
          />
        </div>
        <div className="flex-1 overflow-y-auto rp-scroll-thin max-h-[60vh] lg:max-h-[70vh]">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">Sin resultados</p>
          ) : (
            CATEGORIES.filter((c) => grouped[c]?.length).map((cat) => (
              <div key={cat} className="mb-2">
                <button
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors min-h-[32px]"
                  aria-expanded={activeCategory === cat || activeCategory === null}
                >
                  {activeCategory === null || activeCategory === cat ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  {cat}
                  <span className="ml-auto opacity-60">{grouped[cat].length}</span>
                </button>
                {(activeCategory === null || activeCategory === cat) && (
                  <ul className="space-y-0.5 mt-0.5">
                    {grouped[cat].map((e) => (
                      <li key={e.id}>
                        <button
                          onClick={() => { setSelectedId(e.id); setMobilePane("request"); }}
                          className={cn(
                            "w-full text-left rounded-md px-2 py-1.5 text-xs transition-colors flex items-start gap-2 min-h-[40px]",
                            selectedId === e.id ? "bg-foreground/[0.06] text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
                          )}
                          aria-current={selectedId === e.id ? "true" : undefined}
                        >
                          <span className={cn("shrink-0 inline-flex items-center justify-center rounded border px-1 py-0.5 text-[9px] font-mono font-semibold w-14", METHOD_TONE[e.method])}>
                            {e.method}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block font-mono text-[11px] truncate">{e.path}</span>
                            <span className="block text-[10px] text-muted-foreground/80 truncate">{e.desc}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* CENTER — Request builder */}
      <section
        className={cn(
          "lg:col-span-5 rp-glass rounded-2xl p-4 sm:p-5 flex flex-col",
          mobilePane === "request" ? "block" : "hidden lg:flex"
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className={cn("inline-flex items-center justify-center rounded border px-2 py-0.5 text-xs font-mono font-semibold", METHOD_TONE[selected.method])}>
            {selected.method}
          </span>
          <code className="text-sm font-mono text-foreground/90 truncate flex-1">
            /{version}{selected.path.replace("/v1", "")}
          </code>
          <button
            onClick={() => setMobilePane("response")}
            className="lg:hidden min-h-[36px] inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Ver respuesta"
          >
            Respuesta <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={() => setMobilePane("endpoint")}
            className="lg:hidden min-h-[36px] inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-3 w-3 rotate-180" /> Endpoints
          </button>
          <p className="text-sm text-muted-foreground hidden lg:block">{selected.desc}</p>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto rp-scroll-thin pr-1 max-h-[70vh]">
          {/* Headers */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">Headers</h4>
            <div className="space-y-2">
              <HeaderRow label="Authorization" value={headers.Authorization} onChange={(v) => updateHeader("Authorization", v)} mono />
              <HeaderRow label="Content-Type" value={headers["Content-Type"]} onChange={(v) => updateHeader("Content-Type", v)} mono />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex-1">Idempotency-Key</label>
                  <button
                    onClick={regenerateIdempotency}
                    className="min-h-[28px] inline-flex items-center gap-1 rounded border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" /> Generar
                  </button>
                </div>
                <Input
                  value={headers["Idempotency-Key"]}
                  onChange={(e) => updateHeader("Idempotency-Key", e.target.value)}
                  placeholder="uuid v4"
                  className="h-8 font-mono text-xs"
                  aria-label="Idempotency-Key"
                />
              </div>
              <HeaderRow label="X-Organization-Id" value={headers["X-Organization-Id"]} onChange={(v) => updateHeader("X-Organization-Id", v)} mono />
            </div>
          </div>

          {/* Query params */}
          {selected.hasQuery && (
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">Query params</h4>
              <div className="space-y-2">
                {queryRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <Input
                      value={row.k}
                      onChange={(e) => {
                        const next = [...queryRows];
                        next[i] = { ...next[i], k: e.target.value };
                        setQueryRows(next);
                      }}
                      placeholder="key (limit, cursor, filter)"
                      className="h-8 text-xs font-mono"
                      aria-label={`Query key ${i + 1}`}
                    />
                    <div className="flex gap-1">
                      <Input
                        value={row.v}
                        onChange={(e) => {
                          const next = [...queryRows];
                          next[i] = { ...next[i], v: e.target.value };
                          setQueryRows(next);
                        }}
                        placeholder="valor"
                        className="h-8 text-xs font-mono flex-1"
                        aria-label={`Query value ${i + 1}`}
                      />
                      <button
                        onClick={() => setQueryRows((r) => r.filter((_, idx) => idx !== i))}
                        className="min-h-[36px] w-9 shrink-0 inline-flex items-center justify-center rounded border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                        aria-label="Eliminar fila"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setQueryRows((r) => [...r, { k: "", v: "" }])}
                  className="min-h-[36px] inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Añadir parámetro
                </button>
              </div>
            </div>
          )}

          {/* Body */}
          {selected.hasBody && (
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">Body (JSON)</h4>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                spellCheck={false}
                rows={8}
                className="font-mono text-xs leading-relaxed rp-scroll-thin"
                aria-label="Cuerpo de la petición"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sticky bottom-0">
            <Button
              onClick={send}
              disabled={loading}
              className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90 min-h-[44px]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? "Enviando..." : "Send Request"}
            </Button>
            <CopyButton value={buildCurl(selected, version, headers, body, queryRows)} label="Copy as cURL" />
            <CopyButton value={buildJs(selected, version, headers, body, queryRows)} label="Copy as JS" />
            <CopyButton value={buildPython(selected, version, headers, body, queryRows)} label="Copy as Python" />
          </div>
        </div>
      </section>

      {/* RIGHT — Response viewer */}
      <section
        className={cn(
          "lg:col-span-4 rp-glass rounded-2xl p-4 sm:p-5 flex flex-col",
          mobilePane === "response" ? "block" : "hidden lg:flex"
        )}
      >
        <div className="flex items-center gap-2 mb-3">
          <FileJson className="h-4 w-4 text-[var(--teal)]" />
          <h3 className="text-sm font-medium">Response</h3>
          <button
            onClick={() => setMobilePane("request")}
            className="lg:hidden ml-auto min-h-[36px] inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-3 w-3 rotate-180" /> Petición
          </button>
        </div>

        {!response && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-3">
            <div className="h-12 w-12 rounded-full bg-foreground/5 flex items-center justify-center">
              <Send className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Pulsa <span className="text-foreground">Send Request</span> para ver la respuesta.</p>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-8 w-8 text-[var(--gold)] animate-spin" />
            <p className="text-sm text-muted-foreground">Enviando petición...</p>
          </div>
        )}

        {response && !loading && (
          <ResponseView resp={response} />
        )}
      </section>
    </div>
  );
}

function HeaderRow({ label, value, onChange, mono }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("h-8 text-xs", mono && "font-mono")}
        aria-label={label}
      />
    </div>
  );
}

function ResponseView({ resp }: { resp: ResponseData }) {
  const [showHeaders, setShowHeaders] = React.useState(false);
  return (
    <div className="flex-1 flex flex-col gap-3 overflow-y-auto rp-scroll-thin max-h-[70vh] pr-1">
      {/* Status row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center rounded border px-2 py-1 text-xs font-mono font-semibold", statusTone(resp.status))}>
          {resp.status}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {resp.timeMs}ms
        </span>
        {resp.isError && (
          <Badge className="border-destructive/40 bg-destructive/10 text-destructive">
            <AlertCircle className="h-3 w-3 mr-1" /> Error
          </Badge>
        )}
        {resp.hasMore !== undefined && (
          <Badge variant="outline" className="text-xs">
            has_more: {String(resp.hasMore)}
          </Badge>
        )}
        {resp.nextCursor && (
          <Badge variant="outline" className="text-xs font-mono">
            cursor: {resp.nextCursor}
          </Badge>
        )}
      </div>

      {/* Rate limit */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: "Limit", v: resp.rateLimit.limit.toLocaleString("es-ES") },
          { l: "Remaining", v: resp.rateLimit.remaining.toLocaleString("es-ES") },
          { l: "Reset", v: new Date(resp.rateLimit.reset * 1000).toLocaleTimeString("es-ES") },
        ].map((x) => (
          <div key={x.l} className="rounded-md border border-border/40 bg-foreground/[0.02] px-2 py-1.5">
            <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{x.l}</div>
            <div className="text-xs font-mono text-foreground">{x.v}</div>
          </div>
        ))}
      </div>

      {/* Headers collapsible */}
      <div className="rounded-md border border-border/40 overflow-hidden">
        <button
          onClick={() => setShowHeaders((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-foreground/[0.03] transition-colors min-h-[36px]"
          aria-expanded={showHeaders}
        >
          <span className="font-mono uppercase tracking-wider text-muted-foreground">Response headers ({resp.headers.length})</span>
          {showHeaders ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        <AnimatePresence initial={false}>
          {showHeaders && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="border-t border-border/40 overflow-hidden"
            >
              <ul className="divide-y divide-border/30">
                {resp.headers.map((h, i) => (
                  <li key={i} className="px-3 py-1.5 flex items-baseline gap-2 text-xs">
                    <span className="font-mono text-[var(--teal)] shrink-0">{h.name}:</span>
                    <span className="font-mono text-foreground/80 break-all">{h.value}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Body */}
      <div className="rounded-md border border-border/40 bg-[#0a0a0a]/60 overflow-hidden">
        <div className="border-b border-border/40 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground flex items-center justify-between">
          <span>Body</span>
          <CopyButton value={JSON.stringify(resp.body, null, 2)} label="Copiar JSON" className="border-0 bg-transparent px-1 py-0 min-h-[24px] text-[10px]" />
        </div>
        <pre className="p-3 text-xs font-mono leading-relaxed overflow-x-auto rp-scroll-thin">
          <JsonNode value={resp.body} />
        </pre>
      </div>
    </div>
  );
}

/* =====================================================================
 * Tab: Playground
 * ===================================================================== */

function PlaygroundTab() {
  const reduceMotion = useReducedMotion();
  const [lang, setLang] = React.useState<string>("JavaScript");
  const [code, setCode] = React.useState<string>(PLAYGROUND_SAMPLES["JavaScript"]);
  const [env, setEnv] = React.useState<"sandbox" | "production">("sandbox");
  const [running, setRunning] = React.useState(false);
  const [output, setOutput] = React.useState<unknown>(null);

  function onLangChange(l: string) {
    setLang(l);
    setCode(PLAYGROUND_SAMPLES[l]);
    setOutput(null);
  }

  function run() {
    setRunning(true);
    setOutput(null);
    setTimeout(() => {
      setOutput({
        data: [
          {
            id: "res_01HZX1234",
            object: "reservation",
            customer_id: "cus_01HZXABCD",
            date: "2025-01-21",
            time: "21:30",
            party_size: 4,
            status: "confirmed",
            created_at: "2025-01-20T10:32:00Z",
          },
          {
            id: "res_01HZX5678",
            object: "reservation",
            customer_id: "cus_01HZXEFGH",
            date: "2025-01-21",
            time: "22:00",
            party_size: 2,
            status: "pending",
            created_at: "2025-01-20T11:15:00Z",
          },
        ],
        has_more: true,
        next_cursor: "cur_01HZXNEXTPAGE",
        request_id: genRequestId(),
      });
      setRunning(false);
    }, 900);
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="rp-glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[var(--gold-soft)]" />
          <span className="text-sm font-medium">Playground</span>
          <Badge className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] uppercase tracking-wider">demo</Badge>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Select value={lang} onValueChange={onLangChange}>
            <SelectTrigger className="w-40 h-9" aria-label="Lenguaje">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLAYGROUND_LANGS.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-md border border-border/60 overflow-hidden">
            <button
              onClick={() => setEnv("sandbox")}
              className={cn("px-3 py-1.5 text-xs transition-colors min-h-[36px]", env === "sandbox" ? "bg-[var(--gold)]/15 text-[var(--gold-soft)]" : "text-muted-foreground hover:text-foreground")}
            >
              Sandbox
            </button>
            <button
              onClick={() => setEnv("production")}
              className={cn("px-3 py-1.5 text-xs transition-colors min-h-[36px]", env === "production" ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:text-foreground")}
            >
              Production
            </button>
          </div>
          <CopyButton value={code} label="Copiar código" />
          <Button
            onClick={run}
            disabled={running}
            className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90 min-h-[36px]"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {running ? "Ejecutando..." : "Run"}
          </Button>
        </div>
      </div>

      <div className="rp-glass rounded-md p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          El Playground usa datos de sandbox. No afecta a datos reales.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="rp-glass rounded-2xl overflow-hidden flex flex-col">
          <div className="border-b border-border/40 px-4 py-2 flex items-center gap-2 text-xs">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
            </div>
            <span className="font-mono text-muted-foreground">main.{lang === "JavaScript" ? "js" : lang === "TypeScript" ? "ts" : lang === "Python" ? "py" : lang === "PHP" ? "php" : lang === "Ruby" ? "rb" : lang === "Go" ? "go" : lang === "Java" || lang === "Kotlin" ? "kt" : lang === "Swift" ? "swift" : "cs"}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={18}
              className="font-mono text-xs leading-relaxed border-0 rounded-none bg-transparent focus-visible:ring-0 rp-scroll-thin"
              aria-label="Editor de código"
            />
          </div>
        </div>

        {/* Output */}
        <div className="rp-glass rounded-2xl overflow-hidden flex flex-col">
          <div className="border-b border-border/40 px-4 py-2 flex items-center justify-between text-xs">
            <span className="font-mono uppercase tracking-wider text-muted-foreground">Output</span>
            {output !== null && <CopyButton value={JSON.stringify(output, null, 2)} label="Copiar" className="border-0 bg-transparent px-1 py-0 min-h-[24px] text-[10px]" />}
          </div>
          <div className="flex-1 min-h-[280px] p-4 overflow-auto rp-scroll-thin bg-[#0a0a0a]/60">
            {!output && !running && (
              <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground">
                Pulsa <span className="text-foreground mx-1">Run</span> para ejecutar.
              </div>
            )}
            {running && (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 text-[var(--gold)] animate-spin" />
                <p className="text-xs text-muted-foreground">Ejecutando en sandbox...</p>
              </div>
            )}
            {output !== null && !running && (
              <motion.pre
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-mono leading-relaxed"
              >
                <JsonNode value={output} />
              </motion.pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
 * Tab: SDKs
 * ===================================================================== */

function SdksTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SDKS.map((s) => {
        const statusTone =
          s.status === "Stable"
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
            : s.status === "Beta"
            ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
            : "border-amber-400/40 bg-amber-400/10 text-amber-300";
        return (
          <div key={s.id} className="rp-glass rounded-2xl p-5 flex flex-col gap-3 hover:border-[var(--gold)]/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-foreground/[0.04] border border-border/40 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-[var(--gold-soft)]" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{s.language}</h3>
                  <code className="text-xs text-muted-foreground font-mono">{s.package}</code>
                </div>
              </div>
              <Badge className={statusTone}>{s.status}</Badge>
            </div>
            <div className="rounded-md border border-border/40 bg-[#0a0a0a]/60 px-3 py-2 font-mono text-[11px] text-foreground/85 overflow-x-auto rp-scroll-thin">
              <span className="text-[var(--teal)]">$</span> {s.install}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Versión</div>
                <div className="font-mono text-foreground">{s.version}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Descargas</div>
                <div className="text-foreground">{s.downloads}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">GitHub</div>
                <div className="inline-flex items-center gap-1 text-foreground">
                  <Star className="h-3 w-3 text-[var(--gold)]" />
                  {s.stars.replace("★ ", "")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-auto pt-2">
              <Button
                onClick={() => toast({ title: "Instalado (demo)", description: s.install })}
                variant="outline"
                className="h-9 flex-1"
              >
                <Download className="h-3.5 w-3.5" /> Instalar
              </Button>
              <CopyButton value={s.install} label="Copiar" className="h-9 flex-1 justify-center" />
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); toast({ title: "Documentación (demo)", description: `Abrir docs de ${s.language}` }); }}
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                aria-label="Ver documentación"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =====================================================================
 * Tab: Dashboard
 * ===================================================================== */

function DashboardTab() {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <UsageStat label="Peticiones hoy" value="1.847" sub="vs. ayer +12%" icon={Activity} />
        <UsageStat label="Peticiones mes" value="34.580" sub="en 21 días" icon={TrendingUp} />
        <UsageStat label="Rate limit" value="18.5%" sub="1.847 / 10.000" icon={Gauge} progress={18.5} />
        <UsageStat label="Latencia media" value="42ms" sub="p99: 312ms" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <UsageChart />
        </div>
        <ErrorRateCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AppsCard />
        <ApiKeysCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopEndpointsCard />
        <WebhooksCard />
      </div>

      <ErrorsCard />
    </div>
  );
}

function UsageStat({ label, value, sub, icon: Icon, progress }: { label: string; value: string; sub: string; icon: React.ElementType; progress?: number }) {
  return (
    <div className="rp-glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-3.5 w-3.5 text-[var(--gold-soft)]" />
      </div>
      <div className="font-display text-2xl sm:text-3xl font-light text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      {progress !== undefined && (
        <div className="mt-2 h-1 rounded-full bg-foreground/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)]" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function UsageChart() {
  const data = USAGE_30D;
  const max = Math.max(...data);
  const w = 560;
  const h = 160;
  const pad = 8;
  const step = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - (v / max) * (h - pad * 2);
    return [x, y];
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${pad + (data.length - 1) * step} ${h - pad} L ${pad} ${h - pad} Z`;
  return (
    <div className="rp-glass rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium">Uso de API · 30 días</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Peticiones diarias</p>
        </div>
        <Badge variant="outline" className="text-xs">
          <TrendingUp className="h-3 w-3 mr-1 text-emerald-300" />
          +18% vs. mes anterior
        </Badge>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Gráfico de uso de API de los últimos 30 días">
        <defs>
          <linearGradient id="usageArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="usageLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3DD6C9" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((r) => (
          <line key={r} x1={pad} y1={h - pad - r * (h - pad * 2)} x2={w - pad} y2={h - pad - r * (h - pad * 2)} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
        ))}
        <path d={areaPath} fill="url(#usageArea)" />
        <path d={linePath} fill="none" stroke="url(#usageLine)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={i === points.length - 1 ? 3.5 : 0} fill="#D4AF37" />
        ))}
      </svg>
    </div>
  );
}

function ErrorRateCard() {
  return (
    <div className="rp-glass rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-medium">Salud de API</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Tasa de error · últimas 24h</p>
      </div>
      <div className="my-4 flex items-end gap-2">
        <span className="font-display text-4xl font-light text-emerald-300">0.3%</span>
        <span className="text-xs text-muted-foreground mb-1.5">de 1.847 peticiones</span>
      </div>
      <div className="space-y-1.5 text-xs">
        <Row label="2xx" value="1.841" tone="text-emerald-300" />
        <Row label="4xx" value="5" tone="text-amber-300" />
        <Row label="5xx" value="1" tone="text-destructive" />
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-muted-foreground">{label}</span>
      <span className={cn("font-mono", tone)}>{value}</span>
    </div>
  );
}

function AppsCard() {
  const [open, setOpen] = React.useState(false);
  const [apps, setApps] = React.useState<DevApp[]>(DEMO_APPS);
  const [form, setForm] = React.useState({ name: "", desc: "", redirect: "" });

  function create() {
    if (!form.name.trim()) {
      toast({ title: "Nombre requerido", description: "Introduce un nombre para tu app" });
      return;
    }
    const newApp: DevApp = {
      id: "a" + (apps.length + 1),
      name: form.name,
      clientId: "rp_live_" + Math.random().toString(36).slice(2, 14).toUpperCase(),
      status: "review",
      scopes: ["read:reservations"],
      installs: 0,
      lastActive: "justo ahora",
      desc: form.desc || "—",
    };
    setApps([newApp, ...apps]);
    setForm({ name: "", desc: "", redirect: "" });
    setOpen(false);
    toast({ title: "App creada (demo)", description: `${newApp.name} · ${newApp.clientId}` });
  }

  return (
    <div className="rp-glass rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AppWindow className="h-4 w-4 text-[var(--gold-soft)]" />
          <h3 className="text-sm font-medium">Apps</h3>
          <Badge variant="outline">{apps.length}</Badge>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="h-8">
          <Plus className="h-3.5 w-3.5" /> Crear app
        </Button>
      </div>
      <div className="space-y-2 overflow-y-auto rp-scroll-thin max-h-72">
        {apps.map((a) => {
          const tone =
            a.status === "active"
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
              : a.status === "review"
              ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
              : "border-foreground/20 bg-foreground/5 text-muted-foreground";
          const label = a.status === "active" ? "Activa" : a.status === "review" ? "En revisión" : "Pausada";
          const Icon = a.status === "active" ? CircleCheck : a.status === "review" ? CircleDot : CirclePause;
          return (
            <div key={a.id} className="rounded-md border border-border/40 bg-foreground/[0.02] p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium truncate">{a.name}</span>
                </div>
                <Badge className={tone}>{label}</Badge>
              </div>
              <code className="text-[10px] font-mono text-muted-foreground block">{a.clientId}</code>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.desc}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-muted-foreground">
                <span>{a.installs} installs</span>
                <span>·</span>
                <span>{a.lastActive}</span>
                <span className="ml-auto truncate">{a.scopes.join(", ")}</span>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear aplicación</DialogTitle>
            <DialogDescription>Registra una nueva app para usar la API de RestoPanel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Nombre</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mi App" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Descripción</label>
              <Textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={2} placeholder="¿Qué hace tu app?" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Redirect URIs</label>
              <Input value={form.redirect} onChange={(e) => setForm({ ...form, redirect: e.target.value })} placeholder="https://app.example.com/callback" className="mt-1 font-mono text-xs" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Scopes</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {["read:reservations", "write:reservations", "read:customers", "write:customers", "read:analytics"].map((s) => (
                  <Badge key={s} variant="outline" className="font-mono text-[10px] cursor-default">{s}</Badge>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Demo · selección fija</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={create} className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90">Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApiKeysCard() {
  const [open, setOpen] = React.useState(false);
  const [revokeId, setRevokeId] = React.useState<string | null>(null);
  const [keys, setKeys] = React.useState<ApiKey[]>(DEMO_KEYS);

  function rotate(id: string) {
    setKeys((ks) => ks.map((k) => (k.id === id ? { ...k, masked: k.masked.split("•")[0] + "_•".repeat(8) + k.masked.slice(-4), lastUsed: "justo ahora" } : k)));
    toast({ title: "Clave rotada (demo)", description: "La clave anterior ha sido revocada." });
  }
  function revoke(id: string) {
    setKeys((ks) => ks.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)));
    setRevokeId(null);
    toast({ title: "Clave revocada (demo)" });
  }

  return (
    <div className="rp-glass rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[var(--gold-soft)]" />
          <h3 className="text-sm font-medium">API Keys</h3>
          <Badge variant="outline">{keys.filter((k) => k.status === "active").length} activas</Badge>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="h-8">
          <Plus className="h-3.5 w-3.5" /> Crear API Key
        </Button>
      </div>
      <div className="space-y-2 overflow-y-auto rp-scroll-thin max-h-72">
        {keys.map((k) => (
          <div key={k.id} className={cn("rounded-md border border-border/40 bg-foreground/[0.02] p-3", k.status === "revoked" && "opacity-50")}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-medium">{k.name}</span>
              <Badge variant={k.env === "production" ? "default" : "outline"} className={k.env === "production" ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]" : ""}>
                {k.env === "production" ? "Production" : "Sandbox"}
              </Badge>
            </div>
            <code className="text-[10px] font-mono text-muted-foreground block">{k.masked}</code>
            <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-muted-foreground">
              <span>Creada: {k.created}</span>
              <span>·</span>
              <span>Último uso: {k.lastUsed}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {k.scopes.map((s) => (
                <Badge key={s} variant="outline" className="font-mono text-[9px]">{s}</Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {k.status === "active" ? (
                <>
                  <Button onClick={() => rotate(k.id)} variant="outline" size="sm" className="h-7 text-xs">
                    <RotateCcw className="h-3 w-3" /> Rotar
                  </Button>
                  <Button onClick={() => setRevokeId(k.id)} variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" /> Revocar
                  </Button>
                </>
              ) : (
                <Badge variant="outline" className="text-destructive">Revocada</Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear API Key</DialogTitle>
            <DialogDescription>Genera una nueva clave con scopes personalizados.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Nombre</label>
              <Input placeholder="Mobile Production" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Entorno</label>
              <Select defaultValue="sandbox">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Scopes</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {["read:reservations", "write:reservations", "read:customers", "write:customers", "read:analytics", "read:billing"].map((s) => (
                  <Badge key={s} variant="outline" className="font-mono text-[10px] cursor-default">{s}</Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">IP whitelist (opcional)</label>
              <Input placeholder="192.168.1.0/24" className="mt-1 font-mono text-xs" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Expira</label>
              <Select defaultValue="90d">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">30 días</SelectItem>
                  <SelectItem value="90d">90 días</SelectItem>
                  <SelectItem value="365d">1 año</SelectItem>
                  <SelectItem value="never">Nunca</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => { setOpen(false); toast({ title: "Clave creada (demo)", description: "sk_test_••••••••••••XXXX" }); }} className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90">Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={revokeId !== null} onOpenChange={(o) => !o && setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Revocar esta clave?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción es irreversible. Cualquier app que use esta clave dejará de funcionar inmediatamente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => revokeId && revoke(revokeId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Revocar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TopEndpointsCard() {
  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <ListChecks className="h-4 w-4 text-[var(--gold-soft)]" />
        <h3 className="text-sm font-medium">Top endpoints · 24h</h3>
      </div>
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/60 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-2 pr-3">Endpoint</th>
              <th className="text-right py-2 px-3">Reqs</th>
              <th className="text-right py-2 px-3">Avg</th>
              <th className="text-right py-2 pl-3">Errores</th>
            </tr>
          </thead>
          <tbody>
            {TOP_ENDPOINTS.map((e, i) => (
              <tr key={i} className="border-b border-border/30 last:border-0">
                <td className="py-2 pr-3 font-mono">{e.ep}</td>
                <td className="py-2 px-3 text-right font-mono">{e.reqs.toLocaleString("es-ES")}</td>
                <td className="py-2 px-3 text-right font-mono text-muted-foreground">{e.avg}ms</td>
                <td className={cn("py-2 pl-3 text-right font-mono", e.errors > 1 ? "text-amber-300" : "text-emerald-300")}>{e.errors}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WebhooksCard() {
  const [open, setOpen] = React.useState(false);
  const [hooks, setHooks] = React.useState<WebhookEndpoint[]>(DEMO_WEBHOOKS);
  function add() {
    setOpen(false);
    const newHook: WebhookEndpoint = {
      id: "w" + (hooks.length + 1),
      url: "https://api.example.com/webhook-new",
      events: ["reservation.created"],
      lastDelivery: "—",
      successRate: 100,
      status: "active",
    };
    setHooks([newHook, ...hooks]);
    toast({ title: "Webhook añadido (demo)" });
  }
  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Webhook className="h-4 w-4 text-[var(--gold-soft)]" />
          <h3 className="text-sm font-medium">Webhooks</h3>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="h-8">
          <Plus className="h-3.5 w-3.5" /> Add endpoint
        </Button>
      </div>
      <div className="space-y-2">
        {hooks.map((w) => (
          <div key={w.id} className="rounded-md border border-border/40 bg-foreground/[0.02] p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <code className="text-xs font-mono text-foreground truncate flex-1">{w.url}</code>
              <Badge variant="outline" className={w.status === "active" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : ""}>
                {w.status === "active" ? "Activo" : "Pausado"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-muted-foreground">
              {w.events.map((e) => (
                <span key={e} className="rounded bg-foreground/5 px-1.5 py-0.5">{e}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-muted-foreground">
              <span>Última entrega: {w.lastDelivery}</span>
              <span>·</span>
              <span className={w.successRate >= 99 ? "text-emerald-300" : w.successRate >= 95 ? "text-amber-300" : "text-destructive"}>
                {w.successRate}% success
              </span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir endpoint de webhook</DialogTitle>
            <DialogDescription>Configura una URL que recibirá los eventos seleccionados.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">URL</label>
              <Input placeholder="https://api.example.com/webhooks/rp" className="mt-1 font-mono text-xs" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Eventos</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {["reservation.created", "reservation.cancelled", "reservation.updated", "customer.created", "customer.updated", "review.created", "waitlist.assigned"].map((e) => (
                  <Badge key={e} variant="outline" className="font-mono text-[10px] cursor-default">{e}</Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={add} className="bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-black hover:opacity-90">Añadir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ErrorsCard() {
  return (
    <div className="rp-glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-amber-300" />
        <h3 className="text-sm font-medium">Errores recientes</h3>
        <Badge variant="outline">{DEMO_ERRORS.length}</Badge>
      </div>
      <div className="space-y-2 overflow-y-auto rp-scroll-thin max-h-72">
        {DEMO_ERRORS.map((e) => (
          <div key={e.id} className="rounded-md border border-border/40 bg-foreground/[0.02] p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <code className="text-xs font-mono text-foreground truncate flex-1">{e.endpoint}</code>
              <Badge className={statusTone(e.status)}>{e.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{e.message}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-muted-foreground">
              <Clock className="h-3 w-3" />
              {e.ts}
              <span>·</span>
              <span className="truncate">{e.requestId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================================
 * Tab: Docs
 * ===================================================================== */

function DocsTab() {
  const [search, setSearch] = React.useState("");
  const [openDoc, setOpenDoc] = React.useState<string | null>(null);

  const filteredTree = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DOCS_TREE;
    return DOCS_TREE.map((g) => ({
      ...g,
      items: g.items.filter((it) => it.label.toLowerCase().includes(q) || g.section.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [search]);

  const doc = openDoc ? DOC_CONTENT[openDoc] : null;

  return (
    <div className="space-y-4">
      <div className="rp-glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar documentación..."
            className="pl-8 h-9 text-sm"
            aria-label="Buscar docs"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="h-9" onClick={() => toast({ title: "Descarga (demo)", description: "openapi.yaml · 247 KB" })}>
            <FileDown className="h-3.5 w-3.5" /> OpenAPI spec
          </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={() => toast({ title: "Descarga (demo)", description: "RestoPanel.postman_collection.json" })}>
            <Download className="h-3.5 w-3.5" /> Postman Collection
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-9" disabled>
                  <Sparkles className="h-3.5 w-3.5" /> GraphQL
                </Button>
              </TooltipTrigger>
              <TooltipContent>Próximamente</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sidebar */}
        <nav className="rp-glass rounded-2xl p-4 lg:sticky lg:top-4 lg:self-start lg:max-h-[80vh] overflow-y-auto rp-scroll-thin" aria-label="Índice de documentación">
          {filteredTree.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Sin resultados</p>
          ) : (
            filteredTree.map((g) => (
              <div key={g.section} className="mb-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1.5">{g.section}</div>
                <ul className="space-y-0.5">
                  {g.items.map((it) => (
                    <li key={it.id}>
                      <button
                        onClick={() => setOpenDoc(it.id)}
                        className={cn(
                          "w-full min-h-[36px] text-left rounded-md px-2.5 py-1.5 text-sm transition-colors flex items-center gap-2",
                          openDoc === it.id ? "bg-[var(--gold)]/10 text-[var(--gold-soft)]" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        )}
                      >
                        <BookOpen className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{it.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </nav>

        {/* Content */}
        <div className="lg:col-span-2 rp-glass rounded-2xl p-6 min-h-[400px]">
          {doc ? (
            <article>
              <header className="mb-4 pb-3 border-b border-border/40">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-[var(--gold-soft)]" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Documentación</span>
                </div>
                <h2 className="font-display text-2xl font-light tracking-tight">{doc.title}</h2>
              </header>
              <div>{doc.body}</div>
            </article>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 gap-3">
              <div className="h-12 w-12 rounded-full bg-foreground/5 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Selecciona un documento del índice para ver su contenido.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialog fallback for docs without dedicated content */}
      <Dialog open={openDoc !== null && !doc} onOpenChange={(o) => !o && setOpenDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{openDoc ? DOCS_TREE.flatMap((g) => g.items).find((i) => i.id === openDoc)?.label ?? "Documento" : "Documento"}</DialogTitle>
            <DialogDescription>Documentación RestoPanel · {openDoc}</DialogDescription>
          </DialogHeader>
          <div className="py-2">{DEFAULT_DOC_BODY}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDoc(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dedicated dialog for docs */}
      <Dialog open={openDoc !== null && !!doc} onOpenChange={(o) => !o && setOpenDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{doc?.title}</DialogTitle>
            <DialogDescription>Documentación RestoPanel</DialogDescription>
          </DialogHeader>
          <div className="py-2 max-h-[60vh] overflow-y-auto rp-scroll-thin">{doc?.body ?? DEFAULT_DOC_BODY}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDoc(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
