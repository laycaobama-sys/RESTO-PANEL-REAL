"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plug, Search, Plus, Settings, LogOut, RefreshCw, FileText, Check, X,
  CreditCard, MessageCircle, Star, Mail, Slack, Facebook, ShoppingCart,
  Webhook, Shield, Zap, Link2, ExternalLink, AlertCircle, Globe, Building2,
} from "lucide-react";

/* ---------------- shared bits ---------------- */
function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider", className)}>
      demo
    </Badge>
  );
}

function SectionTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="font-display text-lg sm:text-xl font-medium tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

type Status = "connected" | "pending" | "not-configured" | "error";
function StatusPill({ status }: { status: Status }) {
  const map = {
    connected: { label: "Conectado", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
    pending: { label: "Pendiente", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
    "not-configured": { label: "No configurado", cls: "border-border/60 bg-foreground/5 text-muted-foreground", dot: "bg-muted-foreground/50" },
    error: { label: "Error", cls: "border-rose-400/50 bg-rose-400/10 text-rose-300", dot: "bg-rose-400" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs", map.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", map.dot)} />
      {map.label}
    </span>
  );
}

/* integration icon registry — abstract shapes via lucide */
const ICON_MAP: Record<string, React.ElementType> = {
  stripe: CreditCard, whatsapp: MessageCircle, google: Star, resend: Mail,
  slack: Slack, meta: Facebook, hubspot: Building2, salesforce: Zap,
  zapier: Zap, make: Zap, erp: ShoppingCart, tpv: CreditCard, mailchimp: Mail,
};

/* ---------------- installed integrations ---------------- */
type Installed = {
  id: string; name: string; category: string; description: string;
  status: Status; version: string; lastSync: string; real: boolean;
  scopes?: string[]; oauthState?: string;
};

const INSTALLED: Installed[] = [
  { id: "stripe", name: "Stripe", category: "Pagos", description: "Cobros, suscripciones y facturación automática.", status: "connected", version: "v2.4.1", lastSync: "hace 2 min", real: false, scopes: ["read_payments", "write_payments", "read_customers"], oauthState: "active" },
  { id: "whatsapp", name: "WhatsApp Business", category: "Mensajería", description: "Mensajería y plantillas con WhatsApp Cloud API.", status: "connected", version: "v1.8.0", lastSync: "hace 5 min", real: false, scopes: ["send_messages", "read_templates"], oauthState: "active" },
  { id: "google", name: "Google Business Profile", category: "Reputación", description: "Sincronización de reseñas y datos de establecimiento.", status: "pending", version: "v0.9.2", lastSync: "—", real: false, scopes: [], oauthState: "pending_authorization" },
  { id: "resend", name: "Resend", category: "Email", description: "Envío transaccional y campañas con DKIM/SPF.", status: "connected", version: "v3.1.0", lastSync: "hace 1 h", real: false, scopes: ["send_emails", "read_domains"], oauthState: "active" },
  { id: "slack", name: "Slack", category: "Notificaciones", description: "Alertas y notificaciones operativas en canales.", status: "not-configured", version: "v1.2.0", lastSync: "—", real: false, scopes: [], oauthState: "not_started" },
  { id: "meta", name: "Meta Business", category: "Marketing", description: "Conexión con Facebook Pages e Instagram Business.", status: "pending", version: "v2.0.0", lastSync: "—", real: false, scopes: ["pages_manage_posts", "read_insights"], oauthState: "pending_authorization" },
];

/* ---------------- marketplace ---------------- */
type MarketApp = {
  id: string; name: string; category: string; benefit: string;
  real: boolean; popular?: boolean; new?: boolean;
};

const MARKETPLACE: MarketApp[] = [
  { id: "stripe", name: "Stripe", category: "Pagos", benefit: "Cobros, suscripciones y facturación.", real: false, popular: true },
  { id: "whatsapp", name: "WhatsApp Business", category: "Mensajería", benefit: "Mensajería plantillas y conversaciones.", real: false, popular: true },
  { id: "meta", name: "Meta Business", category: "Marketing", benefit: "Facebook Pages e Instagram insights.", real: false },
  { id: "google", name: "Google Business Profile", category: "Reputación", benefit: "Reseñas y ficha de establecimiento.", real: false, popular: true },
  { id: "hubspot", name: "HubSpot", category: "CRM", benefit: "Sincronización bidireccional de contactos.", real: false },
  { id: "salesforce", name: "Salesforce", category: "CRM", benefit: "Enterprise: cuentas y oportunidades.", real: false, new: true },
  { id: "zapier", name: "Zapier", category: "Automatización", benefit: "5000+ apps para automatizar workflows.", real: false, popular: true },
  { id: "make", name: "Make (Integromat)", category: "Automatización", benefit: "Escenarios visuales multi-paso.", real: false },
  { id: "slack", name: "Slack", category: "Notificaciones", benefit: "Alertas y resúmenes operativos.", real: false },
  { id: "erp", name: "ERP (Sage / SAP)", category: "Finanzas", benefit: "Exportación contable y facturas.", real: false, new: true },
  { id: "tpv", name: "TPV (Sumup / Square)", category: "Operación", benefit: "Tickets en tiempo real y cierre de caja.", real: false },
  { id: "mailchimp", name: "Mailchimp", category: "Email", benefit: "Newsletters y segmentación clásica.", real: false },
];

/* ---------------- webhooks ---------------- */
type Hook = {
  id: string; url: string; events: string[]; lastDelivery: string; status: Status;
};

const HOOKS: Hook[] = [
  { id: "h1", url: "https://api.example.com/hooks/reservas", events: ["reservation.created", "reservation.cancelled"], lastDelivery: "hace 12 s", status: "connected" },
  { id: "h2", url: "https://crm.example.com/inbox/rp", events: ["customer.created", "customer.updated"], lastDelivery: "hace 1 min", status: "connected" },
  { id: "h3", url: "https://analytics.example.com/ingest", events: ["*"], lastDelivery: "hace 8 min", status: "pending" },
  { id: "h4", url: "https://legacy.example.com/billing", events: ["invoice.paid", "invoice.failed"], lastDelivery: "hace 2 h", status: "error" },
];

const HOOK_EVENTS = [
  "reservation.created", "reservation.updated", "reservation.cancelled", "reservation.no_show",
  "customer.created", "customer.updated", "customer.deleted",
  "invoice.paid", "invoice.failed", "review.received",
  "campaign.sent", "ai.message.composed",
];

/* ---------------- Installed card ---------------- */
function InstalledCard({ app, onConfigure, onDisconnect, onReauth, onLogs }: {
  app: Installed; onConfigure: (a: Installed) => void;
  onDisconnect: (a: Installed) => void; onReauth: (a: Installed) => void; onLogs: (a: Installed) => void;
}) {
  const Icon = ICON_MAP[app.id] ?? Plug;
  return (
    <div className="rp-glass rounded-xl p-4 flex flex-col gap-3 hover:border-[var(--gold)]/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-foreground/5 border border-border/60 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-foreground/80" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-foreground">{app.name}</h4>
            {!app.real && app.status === "connected" && <DemoBadge />}
            {app.real && app.status === "connected" && (
              <Badge className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px]">
                <Check className="h-2.5 w-2.5 mr-1" /> real
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{app.description}</p>
        </div>
        <StatusPill status={app.status} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-mono">
        <span>v{app.version}</span>
        <span>·</span>
        <span>{app.category}</span>
        <span>·</span>
        <span>Últ. sync: {app.lastSync}</span>
      </div>
      <div className="flex flex-wrap gap-2 pt-1 border-t border-border/40">
        <Button size="sm" variant="outline" onClick={() => onConfigure(app)} disabled={app.status === "not-configured"}>
          <Settings className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Configurar
        </Button>
        {app.status === "connected" && (
          <>
            <Button size="sm" variant="outline" onClick={() => onReauth(app)}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Reautenticar
            </Button>
            <Button size="sm" variant="outline" onClick={() => onLogs(app)}>
              <FileText className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Ver logs
            </Button>
            <Button size="sm" variant="outline" className="text-rose-300 border-rose-400/30 hover:bg-rose-400/10" onClick={() => onDisconnect(app)}>
              <LogOut className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Desconectar
            </Button>
          </>
        )}
        {app.status === "pending" && (
          <Button size="sm" variant="outline" onClick={() => onConfigure(app)}>
            <Link2 className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Completar OAuth
          </Button>
        )}
        {app.status === "not-configured" && (
          <Button size="sm" onClick={() => onConfigure(app)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Conectar
          </Button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Market card ---------------- */
function MarketCard({ app, onInstall }: { app: MarketApp; onInstall: (a: MarketApp) => void }) {
  const Icon = ICON_MAP[app.id] ?? Plug;
  return (
    <div className="rp-glass rounded-xl p-4 flex flex-col gap-3 hover:border-[var(--teal)]/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-[var(--teal)]/10 border border-[var(--teal)]/30 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 rp-teal-text" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-foreground">{app.name}</h4>
            {app.popular && <Badge className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px]">popular</Badge>}
            {app.new && <Badge className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px]">nuevo</Badge>}
            {!app.real && <DemoBadge />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{app.benefit}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{app.category}</span>
        <Button size="sm" variant="outline" onClick={() => onInstall(app)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Instalar
        </Button>
      </div>
    </div>
  );
}

/* ---------------- main view ---------------- */
export function IntegrationsView() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState<"installed" | "marketplace" | "webhooks">("installed");
  const [search, setSearch] = React.useState("");
  const [catFilter, setCatFilter] = React.useState("Todas");

  const [configApp, setConfigApp] = React.useState<Installed | null>(null);
  const [disconnectApp, setDisconnectApp] = React.useState<Installed | null>(null);
  const [installApp, setInstallApp] = React.useState<MarketApp | null>(null);
  const [newHookOpen, setNewHookOpen] = React.useState(false);

  const [hookForm, setHookForm] = React.useState({ url: "", secret: "", events: [] as string[] });
  const [hookErr, setHookErr] = React.useState<string | null>(null);

  const categories = React.useMemo(() => ["Todas", ...Array.from(new Set(MARKETPLACE.map((m) => m.category)))], []);
  const filteredMarket = MARKETPLACE.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== "Todas" && m.category !== catFilter) return false;
    return true;
  });

  const onConfigure = (a: Installed) => setConfigApp(a);
  const onDisconnect = (a: Installed) => setDisconnectApp(a);
  const onReauth = (a: Installed) => toast({ title: `${a.name}: reautenticación (demo)`, description: "Se ha iniciado el flujo OAuth de nuevo." });
  const onLogs = (a: Installed) => toast({ title: `${a.name}: logs (demo)`, description: "Abriendo visor de logs en nueva pestaña." });
  const onInstall = (a: MarketApp) => setInstallApp(a);

  const confirmDisconnect = () => {
    if (disconnectApp) {
      toast({ title: `${disconnectApp.name} desconectado (demo)`, description: "La integración ya no está activa.", variant: "destructive" });
      setDisconnectApp(null);
    }
  };

  const submitNewHook = () => {
    setHookErr(null);
    if (!hookForm.url.trim()) { setHookErr("La URL del endpoint es obligatoria."); return; }
    try { new URL(hookForm.url); } catch { setHookErr("La URL no es válida."); return; }
    if (hookForm.events.length === 0) { setHookErr("Selecciona al menos un evento."); return; }
    if (!hookForm.secret.trim() || hookForm.secret.length < 8) { setHookErr("El secreto debe tener al menos 8 caracteres."); return; }
    toast({ title: "Webhook creado (demo)", description: `${hookForm.events.length} eventos suscritos a ${hookForm.url}` });
    setHookForm({ url: "", secret: "", events: [] });
    setNewHookOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <header className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-[var(--teal)]/10 border border-[var(--teal)]/30 flex items-center justify-center">
            <Plug className="h-5 w-5 rp-teal-text" aria-hidden />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">Integraciones</h1>
          <DemoBadge />
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Conecta RestoPanel con tus servicios externos. Gestiona integraciones instaladas, explora el marketplace
          y configura webhooks salientes. Las integraciones marcadas como «demo» no están conectadas a servicios reales.
        </p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="installed">Instaladas ({INSTALLED.length})</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Installed tab */}
        <TabsContent value="installed" className="mt-4 space-y-4">
          <SectionTitle title="Integraciones instaladas" subtitle="Servicios conectados a tu organización" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {INSTALLED.map((a) => (
              <InstalledCard key={a.id} app={a}
                onConfigure={onConfigure} onDisconnect={onDisconnect}
                onReauth={onReauth} onLogs={onLogs} />
            ))}
          </div>
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 flex items-start gap-2.5 text-xs text-amber-200/90">
            <AlertCircle className="h-4 w-4 text-amber-300 mt-0.5 shrink-0" aria-hidden />
            <span>
              Las integraciones marcadas como <strong>demo</strong> simulan conexión y no realizan llamadas reales.
              Para activar una conexión real, completa el flujo OAuth con credenciales válidas.
            </span>
          </div>
        </TabsContent>

        {/* Marketplace tab */}
        <TabsContent value="marketplace" className="mt-4 space-y-4">
          <SectionTitle title="Marketplace" subtitle="Explora integraciones disponibles">
            <span className="text-[11px] font-mono text-muted-foreground">{MARKETPLACE.length} apps</span>
          </SectionTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
              <Input type="search" placeholder="Buscar integración…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Buscar integraciones" />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger size="sm" className="w-44 sm:w-48"><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {filteredMarket.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No se encontraron integraciones.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredMarket.map((a) => <MarketCard key={a.id} app={a} onInstall={onInstall} />)}
            </div>
          )}
        </TabsContent>

        {/* Webhooks tab */}
        <TabsContent value="webhooks" className="mt-4 space-y-4">
          <SectionTitle title="Webhooks salientes" subtitle="Endpoints que reciben eventos de RestoPanel" demo>
            <Button size="sm" onClick={() => setNewHookOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Nuevo webhook
            </Button>
          </SectionTitle>
          <div className="rp-glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto rp-scroll-thin">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-foreground/[0.03]">
                    <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Endpoint</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Eventos</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">Últ. entrega</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Estado</th>
                    <th className="px-4 py-2.5" aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {HOOKS.map((h) => (
                    <tr key={h.id} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.03]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                          <span className="truncate max-w-[260px]">{h.url}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {h.events.map((e) => (
                            <code key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/5 border border-border/40 text-[var(--teal)]">{e}</code>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{h.lastDelivery}</td>
                      <td className="px-4 py-3"><StatusPill status={h.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => toast({ title: "Probando webhook (demo)", description: h.url })}>
                          Probar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Configure dialog */}
      <Dialog open={!!configApp} onOpenChange={(o) => !o && setConfigApp(null)}>
        <DialogContent className="sm:max-w-lg">
          {configApp && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(ICON_MAP[configApp.id] ?? Plug, { className: "h-4 w-4" })}
                  Configurar {configApp.name}
                  {!configApp.real && <DemoBadge className="ml-1" />}
                </DialogTitle>
                <DialogDescription>{configApp.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-md border border-border/40 p-2.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Versión</div>
                    <div className="mt-0.5 font-mono">{configApp.version}</div>
                  </div>
                  <div className="rounded-md border border-border/40 p-2.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">OAuth state</div>
                    <div className="mt-0.5 font-mono text-[var(--teal)]">{configApp.oauthState}</div>
                  </div>
                  <div className="rounded-md border border-border/40 p-2.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Categoría</div>
                    <div className="mt-0.5">{configApp.category}</div>
                  </div>
                  <div className="rounded-md border border-border/40 p-2.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Última sync</div>
                    <div className="mt-0.5">{configApp.lastSync}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Scopes concedidos</Label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {configApp.scopes && configApp.scopes.length > 0 ? configApp.scopes.map((s) => (
                      <code key={s} className="text-[11px] px-2 py-0.5 rounded bg-[var(--teal)]/10 border border-[var(--teal)]/30 text-[var(--teal)]">{s}</code>
                    )) : <span className="text-xs text-muted-foreground">Sin scopes concedidos.</span>}
                  </div>
                </div>
                <div className="rounded-md border border-border/40 p-3 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 inline mr-1.5 rp-teal-text" aria-hidden />
                  Las credenciales se almacenan cifradas (AES-256-GCM) y rotan cada 90 días.
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfigApp(null)}>Cerrar</Button>
                <Button onClick={() => { toast({ title: `${configApp.name}: configuración guardada (demo)` }); setConfigApp(null); }}>
                  Guardar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Disconnect confirm */}
      <AlertDialog open={!!disconnectApp} onOpenChange={(o) => !o && setDisconnectApp(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-300" aria-hidden />
              Desconectar {disconnectApp?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción detendrá todas las sincronizaciones con {disconnectApp?.name}.
              Los flujos que dependen de esta integración dejarán de funcionar. La acción es reversible volviendo a conectar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDisconnect} className="bg-rose-500 hover:bg-rose-600 text-white">
              Sí, desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Install dialog */}
      <Dialog open={!!installApp} onOpenChange={(o) => !o && setInstallApp(null)}>
        <DialogContent className="sm:max-w-lg">
          {installApp && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(ICON_MAP[installApp.id] ?? Plug, { className: "h-4 w-4" })}
                  Instalar {installApp.name}
                  {!installApp.real && <DemoBadge className="ml-1" />}
                </DialogTitle>
                <DialogDescription>{installApp.benefit}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="rounded-md border border-border/40 p-3 text-xs">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">Requisitos de instalación</div>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /> Cuenta activa en {installApp.name}</li>
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /> Permisos de OAuth para los scopes requeridos</li>
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /> Credenciales API (client_id / client_secret)</li>
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /> URL de callback configurada</li>
                  </ul>
                </div>
                <div className="rounded-md border border-amber-400/30 bg-amber-400/5 p-3 text-xs text-amber-200/90 flex gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-300 mt-0.5 shrink-0" aria-hidden />
                  <span>Esta es una integración <strong>demo</strong>. La instalación simula el flujo OAuth sin llamar al servicio real.</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInstallApp(null)}>Cancelar</Button>
                <Button onClick={() => { toast({ title: `${installApp.name}: instalación iniciada (demo)`, description: "Redirigiendo a OAuth…" }); setInstallApp(null); }}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Iniciar OAuth
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New webhook dialog */}
      <Dialog open={newHookOpen} onOpenChange={(o) => { setNewHookOpen(o); if (!o) setHookErr(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="h-4 w-4" aria-hidden /> Nuevo webhook
              <DemoBadge className="ml-1" />
            </DialogTitle>
            <DialogDescription>Configura un endpoint que recibirá eventos de RestoPanel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="hook-url" className="text-xs">URL del endpoint *</Label>
              <Input id="hook-url" type="url" placeholder="https://api.tuapp.com/hooks/restopanel" value={hookForm.url} onChange={(e) => setHookForm({ ...hookForm, url: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs">Eventos suscritos *</Label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto rp-scroll-thin rounded-md border border-border/40 p-2">
                {HOOK_EVENTS.map((e) => {
                  const checked = hookForm.events.includes(e);
                  return (
                    <label key={e} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-foreground/5 rounded px-1.5 py-1">
                      <Checkbox checked={checked} onCheckedChange={(v) => {
                        if (v) setHookForm({ ...hookForm, events: [...hookForm.events, e] });
                        else setHookForm({ ...hookForm, events: hookForm.events.filter((x) => x !== e) });
                      }} />
                      <code className="text-[var(--teal)]">{e}</code>
                    </label>
                  );
                })}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{hookForm.events.length} evento(s) seleccionado(s)</div>
            </div>
            <div>
              <Label htmlFor="hook-secret" className="text-xs">Secreto de firma (HMAC) *</Label>
              <Input id="hook-secret" type="text" placeholder="mín. 8 caracteres" value={hookForm.secret} onChange={(e) => setHookForm({ ...hookForm, secret: e.target.value })} className="mt-1.5" />
              <p className="text-[11px] text-muted-foreground mt-1">Se usará para firmar cada entrega en el header <code className="text-[var(--teal)]">X-RP-Signature</code>.</p>
            </div>
            {hookErr && (
              <div className="rounded-md border border-rose-400/40 bg-rose-400/10 p-2.5 text-xs text-rose-200 flex items-start gap-2">
                <X className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
                <span>{hookErr}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewHookOpen(false)}>Cancelar</Button>
            <Button onClick={submitNewHook}>Crear webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
