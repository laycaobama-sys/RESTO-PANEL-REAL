"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Search,
  Star,
  Download,
  CheckCircle2,
  Lock,
  Shield,
  Code2,
  Video,
  Camera,
  History,
  MessageSquare,
  Puzzle,
  Sparkles,
  Crown,
  Building2,
  Plus,
  Plug,
  Cpu,
  CreditCard,
  QrCode,
  Calendar,
  Bell,
  Truck,
  ClipboardList,
  BarChart3,
  Bot,
  Settings2,
  Terminal,
  GitBranch,
  FileCode2,
  ChevronRight,
  AlertTriangle,
  Globe,
  Smartphone,
  Server,
  Database,
  Webhook,
  KeyRound,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type Plan = "Starter" | "Professional" | "Enterprise";
type AppCategory =
  | "Destacados"
  | "Reservas"
  | "Pagos"
  | "Delivery"
  | "Marketing"
  | "Analítica"
  | "Inventario"
  | "Personal"
  | "Integraciones"
  | "IA"
  | "Compliance"
  | "Developer";

interface AppReview {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface AppItem {
  id: string;
  name: string;
  developer: string;
  category: Exclude<AppCategory, "Destacados">;
  tagline: string;
  rating: number;
  installs: number;
  price: string;
  plans: Plan[];
  icon: React.ElementType;
  color: string;
  featured?: boolean;
  private?: boolean;
  screenshots: string[];
  hasVideo?: boolean;
  permissions: string[];
  changelog: { version: string; date: string; notes: string[] }[];
  reviews: AppReview[];
  installed?: boolean;
  extensionPoint?: string;
}

/* =========================================================
 * Categories (sidebar)
 * =======================================================*/
const CATEGORIES: { id: AppCategory; icon: React.ElementType }[] = [
  { id: "Destacados", icon: Sparkles },
  { id: "Reservas", icon: Calendar },
  { id: "Pagos", icon: CreditCard },
  { id: "Delivery", icon: Truck },
  { id: "Marketing", icon: Bell },
  { id: "Analítica", icon: BarChart3 },
  { id: "Inventario", icon: ClipboardList },
  { id: "Personal", icon: Building2 },
  { id: "Integraciones", icon: Plug },
  { id: "IA", icon: Bot },
  { id: "Compliance", icon: Shield },
  { id: "Developer", icon: Code2 },
];

/* =========================================================
 * Mock apps (16 cards)
 * =======================================================*/
const APPS: AppItem[] = [
  {
    id: "stripe-payments",
    name: "Stripe Payments",
    developer: "Stripe Inc.",
    category: "Pagos",
    tagline: "Cobros con tarjeta, Apple Pay y Google Pay en un clic.",
    rating: 4.9,
    installs: 1240,
    price: "Gratis · 1.4% + 0.20€",
    plans: ["Starter", "Professional", "Enterprise"],
    icon: CreditCard,
    color: "var(--rp-violet)",
    featured: true,
    screenshots: ["mock-stripe-1", "mock-stripe-2", "mock-stripe-3"],
    hasVideo: true,
    permissions: ["Leer pedidos", "Crear cargos", "Webhook de reembolsos"],
    changelog: [
      { version: "3.4.1", date: "2025-11-12", notes: ["Soporte para 3DS2", "Fix: webhooks idempotentes"] },
      { version: "3.3.0", date: "2025-10-04", notes: ["Apple Pay dominios verificados automático", "Nuevas divisas: SEK, NOK"] },
    ],
    reviews: [
      { user: "Carlos (Ramses)", rating: 5, comment: "Implementación en 4 min. Webhooks impecables.", date: "hace 2 sem" },
      { user: "Lucía (Sakura)", rating: 5, comment: "3DS2 sin fricción, cero chargebacks.", date: "hace 1 mes" },
    ],
    installed: true,
  },
  {
    id: "google-reserve",
    name: "Google Reserve Sync",
    developer: "Google LLC",
    category: "Reservas",
    tagline: "Sincroniza disponibilidad con Google Business Profile.",
    rating: 4.7,
    installs: 890,
    price: "Gratis",
    plans: ["Starter", "Professional", "Enterprise"],
    icon: Calendar,
    color: "var(--rp-blue)",
    featured: true,
    screenshots: ["mock-gr-1", "mock-gr-2"],
    hasVideo: false,
    permissions: ["Leer reservas", "Escribir reservas", "Acceso a Business Profile"],
    changelog: [
      { version: "2.1.0", date: "2025-11-01", notes: ["Sincronización cada 30s", "Multi-idioma"] },
    ],
    reviews: [
      { user: "Marta", rating: 4, comment: "Funciona, pero a veces se desincroniza.", date: "hace 3 sem" },
    ],
    installed: false,
  },
  {
    id: "glovo-delivery",
    name: "Glovo Delivery Bridge",
    developer: "GlovoApp23",
    category: "Delivery",
    tagline: "Conecta pedidos Glovo directamente a tu KDS.",
    rating: 4.6,
    installs: 412,
    price: "29€/mes",
    plans: ["Professional", "Enterprise"],
    icon: Truck,
    color: "var(--rp-yellow)",
    screenshots: ["mock-glovo-1", "mock-glovo-2"],
    hasVideo: true,
    permissions: ["Leer pedidos delivery", "Escribir estado de pedido", "Notificar repartidor"],
    changelog: [
      { version: "1.8.2", date: "2025-11-08", notes: ["Auto-asignación de repartidor", "ETA predictiva"] },
    ],
    reviews: [
      { user: "Paco", rating: 5, comment: "Redujo tiempos 22%.", date: "hace 1 sem" },
    ],
    installed: false,
  },
  {
    id: "mailchimp",
    name: "Mailchimp Campaigns",
    developer: "Intuit Inc.",
    category: "Marketing",
    tagline: "Segmenta clientes y envía campañas desde tu CRM.",
    rating: 4.4,
    installs: 658,
    price: "Freemium · desde 13€/mes",
    plans: ["Starter", "Professional", "Enterprise"],
    icon: Bell,
    color: "var(--rp-yellow)",
    screenshots: ["mock-mc-1", "mock-mc-2"],
    hasVideo: false,
    permissions: ["Leer segmentos CRM", "Sincronizar contactos", "Enviar email"],
    changelog: [
      { version: "5.0.0", date: "2025-09-22", notes: ["Customer Journey builder", "A/B testing nativo"] },
    ],
    reviews: [
      { user: "Bea", rating: 4, comment: "Buen ROI, UX mejorable.", date: "hace 2 meses" },
    ],
    installed: true,
  },
  {
    id: "metabase",
    name: "Metabase BI",
    developer: "Metabase Inc.",
    category: "Analítica",
    tagline: "Dashboards SQL personalizables sobre tu data warehouse.",
    rating: 4.8,
    installs: 234,
    price: "59€/mes",
    plans: ["Enterprise"],
    icon: BarChart3,
    color: "var(--rp-emerald)",
    screenshots: ["mock-mb-1", "mock-mb-2", "mock-mb-3"],
    hasVideo: true,
    permissions: ["Leer datos agregados", "Construir queries"],
    changelog: [
      { version: "0.49", date: "2025-10-15", notes: ["Visualización Sankey", "Alertas Slack"] },
    ],
    reviews: [
      { user: "Data team", rating: 5, comment: "Cambia la forma de operar.", date: "hace 1 mes" },
    ],
    installed: false,
  },
  {
    id: "stockbot-ai",
    name: "StockBot AI",
    developer: "RestoPanel Labs",
    category: "IA",
    tagline: "Predice demanda y genera pedidos a proveedores.",
    rating: 4.5,
    installs: 187,
    price: "39€/mes",
    plans: ["Professional", "Enterprise"],
    icon: Bot,
    color: "var(--rp-violet)",
    featured: true,
    screenshots: ["mock-sb-1", "mock-sb-2"],
    hasVideo: true,
    permissions: ["Leer inventario", "Escribir pedidos", "Histórico ventas"],
    changelog: [
      { version: "2.0", date: "2025-11-10", notes: ["Modelo por estación", "Confianza por SKU"] },
    ],
    reviews: [
      { user: "Ramses Madrid", rating: 4, comment: "Redució mermas 14%.", date: "hace 2 sem" },
    ],
    installed: false,
  },
  {
    id: "shifts-pro",
    name: "Shifts Pro",
    developer: "WorkforceOps",
    category: "Personal",
    tagline: "Cuadrantes automáticos con IA y conformidad laboral.",
    rating: 4.6,
    installs: 322,
    price: "19€/mes/local",
    plans: ["Professional", "Enterprise"],
    icon: Building2,
    color: "var(--rp-blue)",
    screenshots: ["mock-sp-1"],
    hasVideo: false,
    permissions: ["Leer empleados", "Escribir turnos", "Conformidad laboral"],
    changelog: [
      { version: "1.7.0", date: "2025-10-30", notes: ["Auto-balance horas extras", "Exportación SEPE"] },
    ],
    reviews: [
      { user: "RRHH Sakura", rating: 5, comment: "Salva 6h/semana en cuadrantes.", date: "hace 1 mes" },
    ],
    installed: false,
  },
  {
    id: "inventory-tracker",
    name: "Inventory Tracker",
    developer: "RestoPanel Labs",
    category: "Inventario",
    tagline: "Escandallos, mermas y recuentos con PDA.",
    rating: 4.3,
    installs: 540,
    price: "Incluido en Pro",
    plans: ["Professional", "Enterprise"],
    icon: ClipboardList,
    color: "var(--rp-emerald)",
    screenshots: ["mock-it-1", "mock-it-2"],
    hasVideo: false,
    permissions: ["Leer productos", "Escribir stock", "Recuentos PDA"],
    changelog: [
      { version: "3.2.1", date: "2025-11-05", notes: ["Recuento ciego por PDA", "Diferencias con tolerancia"] },
    ],
    reviews: [
      { user: "Chef Bistro", rating: 4, comment: "Necesita más recetas.", date: "hace 3 sem" },
    ],
    installed: true,
  },
  {
    id: "qr-ordering",
    name: "QR Ordering",
    developer: "RestoPanel Labs",
    category: "Reservas",
    tagline: "Carta digital y pedidos desde mesa vía QR.",
    rating: 4.7,
    installs: 890,
    price: "9€/mes/local",
    plans: ["Starter", "Professional", "Enterprise"],
    icon: QrCode,
    color: "var(--rp-violet)",
    screenshots: ["mock-qr-1", "mock-qr-2"],
    hasVideo: true,
    permissions: ["Leer carta", "Crear pedidos", "Asignar mesa"],
    changelog: [
      { version: "4.0", date: "2025-11-15", notes: ["Multi-idioma auto", "Modo sin instalación (PWA)"] },
    ],
    reviews: [
      { user: "Sakura", rating: 5, comment: "20% más ticket medio.", date: "hace 1 sem" },
    ],
    installed: true,
  },
  {
    id: "ai-copilot-pro",
    name: "AI Copilot Pro",
    developer: "RestoPanel Labs",
    category: "IA",
    tagline: "Asistente contextual con GPT-4 y RAG sobre tu data.",
    rating: 4.8,
    installs: 156,
    price: "49€/mes",
    plans: ["Enterprise"],
    icon: Bot,
    color: "var(--rp-violet)",
    featured: true,
    screenshots: ["mock-cp-1", "mock-cp-2"],
    hasVideo: true,
    permissions: ["Leer datos operativos", "Generar respuestas", "Ejecutar acciones aprobadas"],
    changelog: [
      { version: "1.5", date: "2025-11-12", notes: ["Tool calling", "Memoria persistente por rol"] },
    ],
    reviews: [
      { user: "Owner Ramses", rating: 5, comment: "Reemplaza 1 FTE de reporting.", date: "hace 2 sem" },
    ],
    installed: false,
  },
  {
    id: "whatsapp-cloud",
    name: "WhatsApp Cloud API",
    developer: "Meta Platforms",
    category: "Integraciones",
    tagline: "Confirma reservas y envía recordatorios por WhatsApp.",
    rating: 4.5,
    installs: 730,
    price: "Pay-as-you-go",
    plans: ["Starter", "Professional", "Enterprise"],
    icon: Smartphone,
    color: "var(--rp-emerald)",
    screenshots: ["mock-wa-1"],
    hasVideo: false,
    permissions: ["Enviar plantillas", "Recibir respuestas", "Webhook de mensajes"],
    changelog: [
      { version: "2.3", date: "2025-10-22", notes: ["Plantillas multi-idioma", "Catalog messages"] },
    ],
    reviews: [
      { user: "Ramses", rating: 4, comment: "No-show reducido 31%.", date: "hace 1 mes" },
    ],
    installed: true,
  },
  {
    id: "gdpr-compliance",
    name: "GDPR Compliance Suite",
    developer: "LegalTech Iberia",
    category: "Compliance",
    tagline: "DPA, consentimientos, derecho al olvido automatizado.",
    rating: 4.6,
    installs: 410,
    price: "29€/mes",
    plans: ["Professional", "Enterprise"],
    icon: Shield,
    color: "var(--rp-blue)",
    screenshots: ["mock-gdpr-1", "mock-gdpr-2"],
    hasVideo: false,
    permissions: ["Leer clientes", "Eliminar datos", "Exportar portabilidad"],
    changelog: [
      { version: "1.9", date: "2025-11-01", notes: ["Auto-rescate por SAR", "Auditoría completa"] },
    ],
    reviews: [
      { user: "Legal Sakura", rating: 5, comment: "Pasamos auditoría sin objeciones.", date: "hace 2 meses" },
    ],
    installed: false,
  },
  {
    id: "private-bi-ramses",
    name: "Ramses Custom BI",
    developer: "Ramses Group (tú)",
    category: "Analítica",
    tagline: "App privada · KPIs consolidados para el comité.",
    rating: 5,
    installs: 1,
    price: "Privada",
    plans: ["Enterprise"],
    icon: BarChart3,
    color: "var(--rp-emerald)",
    private: true,
    screenshots: ["mock-priv-1"],
    hasVideo: false,
    permissions: ["Leer datos consolidados", "Acceso multi-org"],
    changelog: [
      { version: "0.4", date: "2025-11-14", notes: ["Dashboard comité ejecutivo"] },
    ],
    reviews: [
      { user: "CFO Ramses", rating: 5, comment: "Hecho a medida.", date: "hace 3 días" },
    ],
    installed: true,
  },
  {
    id: "private-catering",
    name: "Ramses Catering Flow",
    developer: "Ramses Group (tú)",
    category: "Reservas",
    tagline: "App privada · eventos y catering con calendario.",
    rating: 5,
    installs: 1,
    price: "Privada",
    plans: ["Enterprise"],
    icon: Calendar,
    color: "var(--rp-yellow)",
    private: true,
    screenshots: ["mock-priv-2"],
    hasVideo: false,
    permissions: ["Leer agenda", "Crear eventos", "Notificar equipo"],
    changelog: [
      { version: "0.2", date: "2025-11-09", notes: ["Versión inicial"] },
    ],
    reviews: [],
    installed: true,
  },
  {
    id: "webhooks-engine",
    name: "Webhooks Engine",
    developer: "RestoPanel Labs",
    category: "Developer",
    tagline: "Emite eventos firmados a tus endpoints con retries.",
    rating: 4.9,
    installs: 89,
    price: "Incluido en Enterprise",
    plans: ["Enterprise"],
    icon: Webhook,
    color: "var(--rp-blue)",
    screenshots: ["mock-wh-1"],
    hasVideo: true,
    permissions: ["Emitir eventos", "Reintentos exponenciales"],
    changelog: [
      { version: "2.0", date: "2025-11-11", notes: ["HMAC SHA-256", "Dead letter queue"] },
    ],
    reviews: [
      { user: "Dev team", rating: 5, comment: "Integración custom en 1 día.", date: "hace 1 mes" },
    ],
    installed: false,
  },
  {
    id: "sumup-terminals",
    name: "Sumup Terminals",
    developer: "Sumup Payments",
    category: "Pagos",
    tagline: "Datáfonos inalámbricos con reconciliación automática.",
    rating: 4.4,
    installs: 178,
    price: "1.75% por transacción",
    plans: ["Professional", "Enterprise"],
    icon: CreditCard,
    color: "var(--rp-violet)",
    screenshots: ["mock-su-1"],
    hasVideo: false,
    permissions: ["Leer transacciones TPV", "Reconciliar sesiones"],
    changelog: [
      { version: "1.2", date: "2025-10-28", notes: ["Soporte Solo+Air"] },
    ],
    reviews: [
      { user: "Camarero", rating: 4, comment: "Funciona, a veces sin señal.", date: "hace 2 meses" },
    ],
    installed: false,
  },
];

/* =========================================================
 * Extension points (Developer portal preview)
 * =======================================================*/
const EXTENSION_POINTS = [
  { id: "ext-1", name: "Webhooks salientes", icon: Webhook, desc: "Eventos firmados HMAC hacia tu endpoint.", tone: "blue" },
  { id: "ext-2", name: "Custom OAuth App", icon: KeyRound, desc: "OAuth 2.0 PKCE para integraciones third-party.", tone: "violet" },
  { id: "ext-3", name: "Embedded UI Kit", icon: Code2, desc: "Renderiza tu UI dentro del panel vía iFrame postMessage.", tone: "emerald" },
  { id: "ext-4", name: "Event Bus (Kafka)", icon: GitBranch, desc: "Suscripción a topics para pipelines ETL.", tone: "yellow" },
  { id: "ext-5", name: "Server-side SDK", icon: Server, desc: "TypeScript/Go SDK con tenant-aware client.", tone: "blue" },
  { id: "ext-6", name: "Database Read Replica", icon: Database, desc: "Acceso de solo lectura a tu cell D1 (Enterprise).", tone: "violet" },
];

const TONE = {
  emerald: "var(--rp-emerald)",
  yellow: "var(--rp-yellow)",
  blue: "var(--rp-blue)",
  red: "var(--rp-red)",
  violet: "var(--rp-violet)",
};

/* =========================================================
 * Helpers
 * =======================================================*/
function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(s, n <= Math.round(rating) ? "fill-[var(--rp-yellow)] text-[var(--rp-yellow)]" : "text-muted-foreground/40")}
          aria-hidden
        />
      ))}
      <span className="ml-1 text-[10px] font-mono text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

function PlanChips({ plans }: { plans: Plan[] }) {
  const map: Record<Plan, string> = {
    Starter: "border-border/60 text-muted-foreground",
    Professional: "border-[var(--rp-emerald)]/40 text-[var(--rp-emerald)]",
    Enterprise: "border-[var(--rp-violet)]/40 text-[var(--rp-violet)]",
  };
  return (
    <div className="flex flex-wrap gap-1">
      {plans.map((p) => (
        <span key={p} className={cn("inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-mono", map[p])}>
          {p === "Enterprise" && <Crown className="h-2.5 w-2.5 mr-0.5" aria-hidden />}
          {p}
        </span>
      ))}
    </div>
  );
}

/* =========================================================
 * App card
 * =======================================================*/
function AppCard({ app, onOpen }: { app: AppItem; onOpen: () => void }) {
  const Icon = app.icon;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group rp-glass rounded-xl border border-border/60 p-3.5 text-left hover:border-[var(--rp-emerald)]/40 hover:ring-1 hover:ring-[var(--rp-emerald)]/30 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg p-2 shrink-0" style={{ background: `color-mix(in oklab, ${app.color} 18%, transparent)` }}>
          <Icon className="h-5 w-5" style={{ color: app.color }} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-medium truncate">{app.name}</h4>
            {app.featured && <Sparkles className="h-3 w-3 text-[var(--rp-yellow)] shrink-0" aria-hidden />}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{app.developer}</p>
        </div>
        {app.installed && (
          <Badge variant="outline" className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald)] text-[9px] h-4 px-1">
            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" aria-hidden /> instalada
          </Badge>
        )}
      </div>
      <p className="text-xs text-foreground/80 mt-2.5 line-clamp-2">{app.tagline}</p>
      <div className="flex items-center justify-between mt-2.5">
        <Stars rating={app.rating} />
        <span className="text-[10px] font-mono text-muted-foreground">{app.installs.toLocaleString("es-ES")} installs</span>
      </div>
      <Separator className="my-2.5" />
      <div className="flex items-center justify-between">
        <PlanChips plans={app.plans} />
        <span className="text-[10px] font-mono text-foreground/70 truncate ml-2">{app.price}</span>
      </div>
    </button>
  );
}

/* =========================================================
 * App detail dialog
 * =======================================================*/
function AppDetailDialog({ app, open, onOpenChange, onInstall }: {
  app: AppItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onInstall: (app: AppItem) => void;
}) {
  const [activeShot, setActiveShot] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<"screens" | "permissions" | "changelog" | "reviews">("screens");

  React.useEffect(() => {
    if (open) {
      setActiveShot(0);
      setActiveTab("screens");
    }
  }, [open, app?.id]);

  if (!app) return null;
  const Icon = app.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rp-scroll-thin">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg p-2.5 shrink-0" style={{ background: `color-mix(in oklab, ${app.color} 18%, transparent)` }}>
              <Icon className="h-6 w-6" style={{ color: app.color }} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2">
                {app.name}
                {app.private && (
                  <Badge variant="outline" className="border-[var(--rp-violet)]/40 text-[var(--rp-violet)] text-[9px] h-4 px-1">
                    <Lock className="h-2.5 w-2.5 mr-0.5" aria-hidden /> privada
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {app.developer} · {app.category} · {app.installs.toLocaleString("es-ES")} instalaciones
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border/40 pb-2 overflow-x-auto rp-scroll-thin">
          {([
            { id: "screens", label: "Capturas", icon: Camera },
            { id: "permissions", label: "Permisos", icon: Lock },
            { id: "changelog", label: "Changelog", icon: History },
            { id: "reviews", label: "Reseñas", icon: MessageSquare },
          ] as const).map((t) => {
            const TIcon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs whitespace-nowrap transition-colors",
                  activeTab === t.id ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TIcon className="h-3.5 w-3.5" aria-hidden /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="min-h-[200px]">
          {activeTab === "screens" && (
            <div className="space-y-2">
              <div className="aspect-video rounded-lg border border-border/60 bg-foreground/[0.03] flex items-center justify-center relative overflow-hidden">
                {app.hasVideo && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant="outline" className="border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10 text-[var(--rp-red)] text-[10px]">
                      <Video className="h-3 w-3 mr-1" aria-hidden /> Video demo
                    </Badge>
                  </div>
                )}
                <div className="text-center">
                  <Camera className="h-8 w-8 text-muted-foreground/40 mx-auto mb-1" aria-hidden />
                  <div className="text-[10px] text-muted-foreground font-mono">{app.screenshots[activeShot]}</div>
                </div>
              </div>
              <div className="flex gap-1.5 overflow-x-auto rp-scroll-thin">
                {app.screenshots.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActiveShot(i)}
                    className={cn(
                      "aspect-video w-20 rounded-md border bg-foreground/[0.03] flex items-center justify-center shrink-0 transition-colors",
                      activeShot === i ? "border-[var(--rp-emerald)]/60 ring-1 ring-[var(--rp-emerald)]/30" : "border-border/50 hover:border-border"
                    )}
                    aria-label={`Captura ${i + 1}`}
                  >
                    <span className="text-[9px] font-mono text-muted-foreground">{i + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground mb-2">
                Esta app solicitará acceso a los siguientes recursos. Revisa antes de instalar.
              </p>
              {app.permissions.map((p) => (
                <div key={p} className="flex items-center gap-2 rounded-md border border-border/50 px-3 py-2 text-xs">
                  <Shield className="h-3.5 w-3.5 text-[var(--rp-yellow)]" aria-hidden />
                  <span className="flex-1">{p}</span>
                  <Lock className="h-3 w-3 text-muted-foreground" aria-hidden />
                </div>
              ))}
            </div>
          )}

          {activeTab === "changelog" && (
            <div className="space-y-3">
              {app.changelog.map((c) => (
                <div key={c.version} className="rounded-md border border-border/50 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-medium">v{c.version}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{c.date}</span>
                  </div>
                  <ul className="space-y-1">
                    {c.notes.map((n) => (
                      <li key={n} className="text-xs flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-[var(--rp-emerald)] shrink-0" aria-hidden />
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-3">
              {app.reviews.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-40" aria-hidden />
                  Sin reseñas todavía.
                </div>
              ) : (
                app.reviews.map((r) => (
                  <div key={r.user + r.date} className="rounded-md border border-border/50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{r.user}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{r.date}</span>
                    </div>
                    <Stars rating={r.rating} />
                    <p className="text-xs mt-1.5 text-foreground/80">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Precio</div>
            <div className="text-sm font-medium">{app.price}</div>
          </div>
          <div className="flex gap-2">
            <PlanChips plans={app.plans} />
            {app.installed ? (
              <Button variant="outline" size="sm" disabled>
                <CheckCircle2 className="h-4 w-4 mr-1 text-[var(--rp-emerald)]" aria-hidden /> Instalada
              </Button>
            ) : (
              <Button size="sm" className="bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90" onClick={() => onInstall(app)}>
                <Download className="h-4 w-4 mr-1" aria-hidden /> Instalar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Install consent dialog
 * =======================================================*/
function InstallConsent({ app, open, onOpenChange, onConfirm }: {
  app: AppItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
}) {
  if (!app) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[var(--rp-yellow)]" aria-hidden /> Consentimiento de instalación
          </DialogTitle>
          <DialogDescription>
            Estás a punto de instalar <span className="text-foreground font-medium">{app.name}</span> de <span className="text-foreground">{app.developer}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md bg-[var(--rp-yellow)]/[0.06] border border-[var(--rp-yellow)]/30 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-[var(--rp-yellow)]" aria-hidden />
              <span className="text-xs font-medium">Permisos que se concederán:</span>
            </div>
            <ul className="space-y-1">
              {app.permissions.map((p) => (
                <li key={p} className="text-[11px] flex items-start gap-1.5">
                  <ChevronRight className="h-3 w-3 mt-0.5 text-[var(--rp-yellow)] shrink-0" aria-hidden />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Podrás revocar acceso desde <span className="text-foreground">Super Admin → Integraciones</span> en cualquier momento. Datos cifrados en tránsito y reposo (AES-256).
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border/50 px-3 py-2">
            <Shield className="h-3.5 w-3.5 text-[var(--rp-emerald)]" aria-hidden />
            <span className="text-[11px]">Developer verificado · DPA disponible</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90" onClick={onConfirm}>
            <CheckCircle2 className="h-4 w-4 mr-1" aria-hidden /> Aceptar e instalar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Developer portal preview
 * =======================================================*/
function DeveloperPortal() {
  const { toast } = useToast();
  return (
    <div className="space-y-4">
      <div className="rp-glass rounded-xl border border-[var(--rp-blue)]/30 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[var(--rp-blue)]/15 p-2">
            <Terminal className="h-5 w-5 text-[var(--rp-blue)]" aria-hidden />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium">Developer Portal</h4>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Construye apps privadas, genera API keys, publica en el marketplace (Enterprise) y consume nuestros SDKs.
            </p>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast({ title: "API key generada (demo)", description: "rp_live_••••••••••••3f9a · copiada al portapapeles" })}>
            <KeyRound className="h-3.5 w-3.5 mr-1" aria-hidden /> Generar API key
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Puzzle className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden /> 6 puntos de extensión
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {EXTENSION_POINTS.map((ep) => {
            const Icon = ep.icon;
            const color = TONE[ep.tone as keyof typeof TONE];
            return (
              <div key={ep.id} className="rp-glass rounded-lg border border-border/60 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="rounded-md p-1.5" style={{ background: `color-mix(in oklab, ${color} 18%, transparent)` }}>
                    <Icon className="h-4 w-4" style={{ color }} aria-hidden />
                  </div>
                  <span className="text-sm font-medium">{ep.name}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{ep.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileCode2 className="h-4 w-4 text-[var(--rp-violet)]" aria-hidden />
            <h5 className="text-sm font-medium">Quickstart SDK</h5>
          </div>
          <pre className="text-[11px] font-mono bg-foreground/[0.04] rounded-md p-3 overflow-x-auto rp-scroll-thin">
{`import { RestoPanel } from "@restopanel/sdk";

const rp = new RestoPanel({
  apiKey: process.env.RP_API_KEY,
  tenantId: "ramses-madrid",
});

await rp.reservations.create({
  partySize: 4,
  time: "20:30",
  customer: { name: "Ana", phone: "+34..." },
});`}
          </pre>
        </div>

        <div className="rp-glass rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-4 w-4 text-[var(--rp-emerald)]" aria-hidden />
            <h5 className="text-sm font-medium">Webhook payload (ejemplo)</h5>
          </div>
          <pre className="text-[11px] font-mono bg-foreground/[0.04] rounded-md p-3 overflow-x-auto rp-scroll-thin">
{`{
  "event": "reservation.created",
  "tenantId": "ramses-madrid",
  "timestamp": "2025-11-22T19:31:00Z",
  "data": {
    "id": "res_01H...",
    "partySize": 4,
    "time": "20:30"
  },
  "signature": "hmac-sha256=..."
}`}
          </pre>
        </div>
      </div>

      <div className="rp-glass rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-medium flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-[var(--rp-blue)]" aria-hidden /> Tus apps privadas
          </h5>
          <Button size="sm" className="h-7 text-[11px] bg-[var(--rp-violet)] hover:bg-[var(--rp-violet)]/90 text-white" onClick={() => toast({ title: "Nueva app privada", description: "Esqueleto creado · 0.1.0" })}>
            <Plus className="h-3.5 w-3.5 mr-1" aria-hidden /> Nueva app
          </Button>
        </div>
        <div className="space-y-2">
          {APPS.filter(a => a.private).map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.id} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: a.color }} aria-hidden />
                  <div className="min-w-0">
                    <div className="text-sm truncate">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">{a.developer} · v{a.changelog[0]?.version}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]"><Code2 className="h-3.5 w-3.5 mr-1" aria-hidden />Editar</Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px]"><Globe className="h-3.5 w-3.5 mr-1" aria-hidden />Publicar</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function AppStoreView() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = React.useState<AppCategory>("Destacados");
  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"discover" | "installed" | "private" | "dev">("discover");
  const [selectedApp, setSelectedApp] = React.useState<AppItem | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [installTarget, setInstallTarget] = React.useState<AppItem | null>(null);
  const [installOpen, setInstallOpen] = React.useState(false);
  const [installed, setInstalled] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(APPS.filter(a => a.installed).map(a => [a.id, true]))
  );

  const openDetail = (app: AppItem) => {
    setSelectedApp(app);
    setDetailOpen(true);
  };

  const handleInstallClick = (app: AppItem) => {
    setInstallTarget(app);
    setInstallOpen(true);
  };

  const confirmInstall = () => {
    if (!installTarget) return;
    setInstalled(prev => ({ ...prev, [installTarget.id]: true }));
    toast({
      title: "App instalada",
      description: `${installTarget.name} ya está disponible en tu panel.`,
    });
    setInstallOpen(false);
    setDetailOpen(false);
  };

  // Filtered apps per tab
  const discoverApps = React.useMemo(() => {
    let list = APPS.filter(a => !a.private);
    if (activeTab === "installed") {
      list = list.filter(a => installed[a.id]);
    }
    if (activeCategory !== "Destacados") {
      list = list.filter(a => a.category === activeCategory);
    }
    if (activeTab === "discover" && activeCategory === "Destacados") {
      // featured first
      list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q) || a.tagline.toLowerCase().includes(q) || a.developer.toLowerCase().includes(q));
    }
    return list;
  }, [activeCategory, activeTab, installed, query]);

  const privateApps = APPS.filter(a => a.private);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--rp-emerald)]/15 p-2">
            <ShoppingCart className="h-5 w-5 text-[var(--rp-emerald)]" aria-hidden />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight">App Store</h2>
            <p className="text-xs text-muted-foreground">Marketplace de integraciones y apps verificadas para tu restaurante.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <Input
              placeholder="Buscar apps…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 w-44 sm:w-64 text-xs"
              aria-label="Buscar apps"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full justify-start overflow-x-auto rp-scroll-thin h-9">
          <TabsTrigger value="discover" className="text-xs">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Descubrir
          </TabsTrigger>
          <TabsTrigger value="installed" className="text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Instaladas ({Object.values(installed).filter(Boolean).length})
          </TabsTrigger>
          <TabsTrigger value="private" className="text-xs">
            <Lock className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Privadas ({privateApps.length})
          </TabsTrigger>
          <TabsTrigger value="dev" className="text-xs">
            <Code2 className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Developer
          </TabsTrigger>
        </TabsList>

        {/* Discover / Installed tab */}
        {(activeTab === "discover" || activeTab === "installed") && (
          <TabsContent value={activeTab} className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
              {/* Categories sidebar */}
              <aside className="rp-glass rounded-xl border border-border/60 p-2 lg:sticky lg:top-4 lg:self-start">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono px-2 py-1.5">Categorías</div>
                <nav className="space-y-0.5">
                  {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    const isActive = activeCategory === c.id;
                    const count = c.id === "Destacados"
                      ? APPS.filter(a => !a.private && a.featured).length
                      : APPS.filter(a => !a.private && a.category === c.id).length;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveCategory(c.id)}
                        className={cn(
                          "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-left transition-colors",
                          isActive ? "bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald)] ring-1 ring-[var(--rp-emerald)]/30" : "text-foreground/80 hover:bg-foreground/5"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span className="flex-1 truncate">{c.id}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{count}</span>
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {/* Grid */}
              <div className="min-w-0">
                {discoverApps.length === 0 ? (
                  <div className="rp-glass rounded-xl border border-border/60 p-12 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" aria-hidden />
                    <div className="text-sm font-medium">Sin resultados</div>
                    <div className="text-xs text-muted-foreground mt-1">Prueba otra categoría o término.</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {discoverApps.map((app) => (
                      <AppCard
                        key={app.id}
                        app={{ ...app, installed: !!installed[app.id] }}
                        onOpen={() => openDetail(app)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        )}

        {/* Private tab */}
        {activeTab === "private" && (
          <TabsContent value="private" className="mt-4">
            <div className="rp-glass rounded-xl border border-[var(--rp-violet)]/30 p-4 mb-3">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[var(--rp-violet)]/15 p-2">
                  <Lock className="h-5 w-5 text-[var(--rp-violet)]" aria-hidden />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Apps privadas (Enterprise)</h4>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Construidas por tu equipo. Solo visibles para tu organización. Publicables al marketplace global previa revisión.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {privateApps.map((app) => (
                <AppCard key={app.id} app={app} onOpen={() => openDetail(app)} />
              ))}
            </div>
          </TabsContent>
        )}

        {/* Developer tab */}
        {activeTab === "dev" && (
          <TabsContent value="dev" className="mt-4">
            <DeveloperPortal />
          </TabsContent>
        )}
      </Tabs>

      <AppDetailDialog
        app={selectedApp}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onInstall={handleInstallClick}
      />
      <InstallConsent
        app={installTarget}
        open={installOpen}
        onOpenChange={setInstallOpen}
        onConfirm={confirmInstall}
      />
    </div>
  );
}

export default AppStoreView;
