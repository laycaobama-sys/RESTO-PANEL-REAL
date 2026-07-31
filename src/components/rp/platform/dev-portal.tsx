"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Key,
  Plus,
  RotateCw,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ShieldAlert,
  Star,
  Slack,
  Mail,
  FileText,
  Boxes,
  Building2,
  CheckCircle2,
  Clock,
  Activity,
  Zap,
  Code2,
  Download,
  ExternalLink,
  Database,
  Server,
  Globe,
  Sparkles,
  Webhook,
  Terminal,
  RefreshCw,
  AlertTriangle,
  FileJson,
  Network,
  CircuitBoard,
  ChevronRight,
  CreditCard,
} from "lucide-react";

/* ============================================================
 * DevPortal — Open Platform · Developer Portal
 * Manage API keys, OAuth connections, sandbox, usage & docs.
 * Premium dark theme, glassmorphism, gold/turquoise accents.
 * ============================================================ */

export function DevPortal() {
  const [tab, setTab] = React.useState("keys");
  return (
    <div className="space-y-6">
      <PortalHeader />
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="rp-glass rounded-xl p-1.5 inline-flex flex-wrap gap-1 w-full max-w-full overflow-x-auto rp-scroll-thin">
          <TabsList className="bg-transparent h-auto p-0 gap-1 w-full sm:w-auto">
            <TabsTrigger
              value="keys"
              className="min-h-[44px] px-3.5 data-[state=active]:bg-[var(--gold)]/12 data-[state=active]:text-[var(--gold-soft)] data-[state=active]:shadow-none"
            >
              <Key className="h-3.5 w-3.5" /> API Keys
            </TabsTrigger>
            <TabsTrigger
              value="oauth"
              className="min-h-[44px] px-3.5 data-[state=active]:bg-[var(--gold)]/12 data-[state=active]:text-[var(--gold-soft)] data-[state=active]:shadow-none"
            >
              <Network className="h-3.5 w-3.5" /> OAuth
            </TabsTrigger>
            <TabsTrigger
              value="sandbox"
              className="min-h-[44px] px-3.5 data-[state=active]:bg-[var(--gold)]/12 data-[state=active]:text-[var(--gold-soft)] data-[state=active]:shadow-none"
            >
              <CircuitBoard className="h-3.5 w-3.5" /> Sandbox
            </TabsTrigger>
            <TabsTrigger
              value="uso"
              className="min-h-[44px] px-3.5 data-[state=active]:bg-[var(--gold)]/12 data-[state=active]:text-[var(--gold-soft)] data-[state=active]:shadow-none"
            >
              <Activity className="h-3.5 w-3.5" /> Uso
            </TabsTrigger>
            <TabsTrigger
              value="docs"
              className="min-h-[44px] px-3.5 data-[state=active]:bg-[var(--gold)]/12 data-[state=active]:text-[var(--gold-soft)] data-[state=active]:shadow-none"
            >
              <Code2 className="h-3.5 w-3.5" /> Documentación
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="keys" className="mt-5 outline-none">
          <ApiKeysTab />
        </TabsContent>
        <TabsContent value="oauth" className="mt-5 outline-none">
          <OAuthTab />
        </TabsContent>
        <TabsContent value="sandbox" className="mt-5 outline-none">
          <SandboxTab />
        </TabsContent>
        <TabsContent value="uso" className="mt-5 outline-none">
          <UsageTab />
        </TabsContent>
        <TabsContent value="docs" className="mt-5 outline-none">
          <DocsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- header ---------------- */
function PortalHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          <span className="rp-gold-text">FASE 8</span>
          <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
          <span>Open Platform</span>
          <DemoBadge />
        </div>
        <h2 className="mt-3 font-display text-2xl sm:text-3xl font-light tracking-tight">
          Developer Portal
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Gestiona tus credenciales, conexiones OAuth, entorno sandbox y métricas
          de uso de la API de RestoPanel en un solo lugar.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" className="min-h-[40px]">
          <FileJson className="h-3.5 w-3.5" /> OpenAPI
        </Button>
        <Button size="sm" className="min-h-[40px] bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]">
          <Terminal className="h-3.5 w-3.5" /> Probar API
        </Button>
      </div>
    </div>
  );
}

function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider",
        className
      )}
    >
      demo
    </Badge>
  );
}

/* ============================================================
 * TAB: API KEYS
 * ============================================================ */

type ApiKeyStatus = "active" | "revoked";
type EnvKind = "production" | "sandbox";

interface ApiKeyRow {
  id: string;
  name: string;
  publicPrefix: string;
  secretRevealed: string;
  webhookSecret: string;
  env: EnvKind;
  scopes: string[];
  createdAt: string;
  lastUsed: string;
  status: ApiKeyStatus;
}

const INITIAL_KEYS: ApiKeyRow[] = [
  {
    id: "key_01",
    name: "Producción — Backend",
    publicPrefix: "pk_live_01HZXKQ9F3J7",
    secretRevealed: "sk_live_01HZXKQ9F3J7M2XB5N8RP4",
    webhookSecret: "whsec_DEMO_REPLACE_ME",
    env: "production",
    scopes: ["read:reservations", "write:reservations", "read:customers", "write:customers", "read:analytics"],
    createdAt: "12 ene 2025",
    lastUsed: "hace 4 min",
    status: "active",
  },
  {
    id: "key_02",
    name: "Sandbox — Testing",
    publicPrefix: "pk_test_DEMO_REPLACE_ME",
    secretRevealed: "sk_test_DEMO_KEY_REPLACE_ME",
    webhookSecret: "whsec_DEMO_REPLACE_ME",
    env: "sandbox",
    scopes: ["read:reservations", "write:reservations", "read:customers"],
    createdAt: "08 mar 2025",
    lastUsed: "hace 1 h",
    status: "active",
  },
  {
    id: "key_03",
    name: "Mobile App (iOS / Android)",
    publicPrefix: "pk_live_01HZXR7T2V9Y5",
    secretRevealed: "sk_live_01HZXR7T2V9Y5P1JK4M3",
    webhookSecret: "whsec_DEMO_REPLACE_ME",
    env: "production",
    scopes: ["read:reservations", "write:customers"],
    createdAt: "22 feb 2025",
    lastUsed: "hace 18 min",
    status: "active",
  },
  {
    id: "key_04",
    name: "Webhooks · Integración legacy",
    publicPrefix: "pk_live_01HZXM8W1X4Z3",
    secretRevealed: "sk_live_01HZXM8W1X4Z3Q7NR2T9",
    webhookSecret: "whsec_DEMO_REPLACE_ME",
    env: "production",
    scopes: ["read:reservations"],
    createdAt: "05 nov 2024",
    lastUsed: "hace 14 días",
    status: "revoked",
  },
];

const ALL_SCOPES = [
  "read:reservations",
  "write:reservations",
  "read:customers",
  "write:customers",
  "read:tables",
  "write:tables",
  "read:reviews",
  "write:reviews",
  "read:analytics",
  "write:webhooks",
];

function ApiKeysTab() {
  const { toast } = useToast();
  const [keys, setKeys] = React.useState<ApiKeyRow[]>(INITIAL_KEYS);
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = React.useState(false);
  const [rotateTarget, setRotateTarget] = React.useState<ApiKeyRow | null>(null);
  const [revokeTarget, setRevokeTarget] = React.useState<ApiKeyRow | null>(null);
  const [newlyCreated, setNewlyCreated] = React.useState<ApiKeyRow | null>(null);

  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast({ title: "Copiado", description: label });
  }

  function maskKey(k: string) {
    if (k.length <= 8) return "•".repeat(k.length);
    return k.slice(0, 8) + "•".repeat(16) + k.slice(-4);
  }

  function confirmRotate() {
    if (!rotateTarget) return;
    toast({
      title: "API key rotada",
      description: `${rotateTarget.name} · nueva secret generada.`,
    });
    setRotateTarget(null);
  }

  function confirmRevoke() {
    if (!revokeTarget) return;
    setKeys((ks) =>
      ks.map((k) => (k.id === revokeTarget.id ? { ...k, status: "revoked" } : k))
    );
    toast({
      title: "API key revocada",
      description: `${revokeTarget.name} · ya no acepta peticiones.`,
      variant: "destructive",
    });
    setRevokeTarget(null);
  }

  function handleCreate(row: ApiKeyRow) {
    setKeys((ks) => [row, ...ks]);
    setNewlyCreated(row);
    setCreateOpen(false);
    toast({
      title: "API key creada",
      description: `${row.name} · copia la secret ahora, no se volverá a mostrar.`,
    });
  }

  return (
    <div className="space-y-4">
      {/* security note */}
      <div className="rp-glass rounded-xl border-l-2 border-[var(--gold)]/50 p-4 flex items-start gap-3">
        <ShieldAlert className="h-4 w-4 text-[var(--gold)] mt-0.5 shrink-0" aria-hidden />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Las <span className="rp-gold-text font-medium">secret keys</span> se
          muestran una sola vez al crearlas. Guárdalas de forma segura y nunca
          las expongas en código cliente. Si se filtran, rótalas de inmediato.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display text-lg font-medium tracking-tight">
            API Keys
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {keys.filter((k) => k.status === "active").length} activas ·{" "}
            {keys.filter((k) => k.status === "revoked").length} revocadas
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="min-h-[40px] bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
        >
          <Plus className="h-3.5 w-3.5" /> Crear API key
        </Button>
      </div>

      {/* keys list — responsive card grid on mobile, table on desktop */}
      <div className="hidden lg:block">
        <div className="rp-glass rounded-xl overflow-x-auto rp-scroll-thin">
          <table className="w-full border-collapse text-sm min-w-[960px]">
            <thead>
              <tr className="border-b border-border/60 bg-foreground/[0.03]">
                {["Nombre", "Public key", "Secret key", "Webhook", "Entorno", "Scopes", "Creada", "Último uso", "Estado", "Acciones"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr
                  key={k.id}
                  className="border-b border-border/40 last:border-0 transition-colors hover:bg-foreground/[0.025] align-top"
                >
                  <td className="px-3 py-3 font-medium">
                    <div className="text-foreground">{k.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{k.id}</div>
                  </td>
                  <td className="px-3 py-3">
                    <code className="text-[11px] text-foreground/80 font-mono">
                      {k.publicPrefix}…
                    </code>
                    <button
                      onClick={() => copy(k.publicPrefix + "AAAA", "Public key copiada")}
                      className="ml-1 text-muted-foreground hover:text-[var(--gold)]"
                      aria-label="Copiar public key"
                    >
                      <Copy className="h-3 w-3 inline" />
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <code className="text-[11px] font-mono text-foreground/80">
                        {revealed[k.id] ? k.secretRevealed : maskKey(k.secretRevealed)}
                      </code>
                      <button
                        onClick={() => setRevealed((r) => ({ ...r, [k.id]: !r[k.id] }))}
                        className="text-muted-foreground hover:text-[var(--gold)] text-[10px] font-mono"
                        aria-label={revealed[k.id] ? "Ocultar" : "Mostrar"}
                      >
                        {revealed[k.id] ? <EyeOff className="h-3 w-3 inline" /> : <Eye className="h-3 w-3 inline" />}
                        {revealed[k.id] ? " Ocultar" : " Mostrar"}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <code className="text-[11px] font-mono text-muted-foreground">
                        whsec_••••••••
                      </code>
                      <button
                        onClick={() => copy(k.webhookSecret, "Webhook secret copiado")}
                        className="text-muted-foreground hover:text-[var(--gold)]"
                        aria-label="Copiar webhook secret"
                      >
                        <Copy className="h-3 w-3 inline" />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <EnvBadge env={k.env} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {k.scopes.slice(0, 2).map((s) => (
                        <ScopeChip key={s} scope={s} />
                      ))}
                      {k.scopes.length > 2 && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          +{k.scopes.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{k.createdAt}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{k.lastUsed}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={k.status} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <IconAction
                        icon={Copy}
                        label="Copiar"
                        onClick={() => copy(k.secretRevealed, "Secret copiada")}
                      />
                      <IconAction
                        icon={RotateCw}
                        label="Rotar"
                        tone="gold"
                        onClick={() => setRotateTarget(k)}
                        disabled={k.status === "revoked"}
                      />
                      <IconAction
                        icon={Trash2}
                        label="Revocar"
                        tone="danger"
                        onClick={() => setRevokeTarget(k)}
                        disabled={k.status === "revoked"}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* mobile / tablet card list */}
      <div className="lg:hidden space-y-3">
        {keys.map((k) => (
          <div key={k.id} className="rp-glass rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-foreground">{k.name}</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{k.id}</div>
              </div>
              <StatusBadge status={k.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Entorno</div>
                <EnvBadge env={k.env} />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Último uso</div>
                <div className="text-foreground/80">{k.lastUsed}</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <KVRow label="Public key" value={`${k.publicPrefix}…`} onCopy={() => copy(k.publicPrefix + "AAAA", "Public key copiada")} />
              <KVRow
                label="Secret key"
                value={revealed[k.id] ? k.secretRevealed : maskKey(k.secretRevealed)}
                onCopy={() => copy(k.secretRevealed, "Secret copiada")}
                onToggle={() => setRevealed((r) => ({ ...r, [k.id]: !r[k.id] }))}
                revealed={!!revealed[k.id]}
              />
              <KVRow
                label="Webhook"
                value={k.webhookSecret.replace(/./g, "•").slice(0, 16)}
                onCopy={() => copy(k.webhookSecret, "Webhook secret copiado")}
              />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Scopes</div>
              <div className="flex flex-wrap gap-1">
                {k.scopes.map((s) => <ScopeChip key={s} scope={s} />)}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="min-h-[40px] flex-1"
                disabled={k.status === "revoked"}
                onClick={() => setRotateTarget(k)}
              >
                <RotateCw className="h-3.5 w-3.5" /> Rotar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="min-h-[40px] flex-1 border-rose-400/40 text-rose-300 hover:bg-rose-400/10"
                disabled={k.status === "revoked"}
                onClick={() => setRevokeTarget(k)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Revocar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <CreateKeyDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
      <RotateDialog target={rotateTarget} onClose={() => setRotateTarget(null)} onConfirm={confirmRotate} />
      <RevokeDialog target={revokeTarget} onClose={() => setRevokeTarget(null)} onConfirm={confirmRevoke} />
      <NewlyCreatedDialog row={newlyCreated} onClose={() => setNewlyCreated(null)} onCopy={copy} />
    </div>
  );
}

function EnvBadge({ env }: { env: EnvKind }) {
  if (env === "production") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Producción
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/10 text-amber-300 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Sandbox
    </span>
  );
}

function StatusBadge({ status }: { status: ApiKeyStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 px-2 py-0.5 text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Activa
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/30 bg-rose-400/10 text-rose-300 px-2 py-0.5 text-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Revocada
    </span>
  );
}

function ScopeChip({ scope }: { scope: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/8 text-[var(--teal)] px-1.5 py-0.5 text-[10px] font-mono">
      {scope}
    </span>
  );
}

function IconAction({
  icon: Icon,
  label,
  onClick,
  tone = "default",
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  tone?: "default" | "gold" | "danger";
  disabled?: boolean;
}) {
  const tones: Record<string, string> = {
    default: "text-muted-foreground hover:text-foreground hover:bg-foreground/8",
    gold: "text-muted-foreground hover:text-[var(--gold)] hover:bg-[var(--gold)]/10",
    danger: "text-muted-foreground hover:text-rose-300 hover:bg-rose-400/10",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none",
        tones[tone]
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function KVRow({
  label,
  value,
  onCopy,
  onToggle,
  revealed,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  onToggle?: () => void;
  revealed?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-border/40 last:border-0">
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <code className="text-[11px] font-mono text-foreground/80 truncate max-w-[160px]">{value}</code>
        {onToggle && (
          <button
            onClick={onToggle}
            className="text-muted-foreground hover:text-[var(--gold)] shrink-0"
            aria-label={revealed ? "Ocultar" : "Mostrar"}
          >
            {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
        )}
        <button
          onClick={onCopy}
          className="text-muted-foreground hover:text-[var(--gold)] shrink-0"
          aria-label="Copiar"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- create key dialog ---------------- */
function CreateKeyDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (row: ApiKeyRow) => void;
}) {
  const [name, setName] = React.useState("");
  const [env, setEnv] = React.useState<EnvKind>("sandbox");
  const [selectedScopes, setSelectedScopes] = React.useState<string[]>(["read:reservations"]);
  const [expiry, setExpiry] = React.useState("90d");

  function toggleScope(s: string) {
    setSelectedScopes((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]
    );
  }

  function reset() {
    setName("");
    setEnv("sandbox");
    setSelectedScopes(["read:reservations"]);
    setExpiry("90d");
  }

  function submit() {
    const id = `key_${String(Math.floor(Math.random() * 90) + 10)}`;
    const envShort = env === "production" ? "live" : "test";
    const rand = Math.random().toString(36).slice(2, 14).toUpperCase();
    const row: ApiKeyRow = {
      id,
      name: name.trim() || "Nueva API key",
      publicPrefix: `pk_${envShort}_01HZX${rand.slice(0, 8)}`,
      secretRevealed: `sk_${envShort}_01HZX${rand}`,
      webhookSecret: `whsec_DEMO_REPLACE_ME${rand.slice(0, 12)}`,
      env,
      scopes: selectedScopes,
      createdAt: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
      lastUsed: "nunca",
      status: "active",
    };
    onCreate(row);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear API key</DialogTitle>
          <DialogDescription>
            Define un nombre, el entorno, los scopes y la caducidad. La secret
            key se mostrará una sola vez.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="key-name">Nombre</Label>
            <Input
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Producción — Backend"
              className="min-h-[44px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Entorno</Label>
              <Select value={env} onValueChange={(v: EnvKind) => setEnv(v)}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Producción</SelectItem>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Caducidad</Label>
              <Select value={expiry} onValueChange={setExpiry}>
                <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">30 días</SelectItem>
                  <SelectItem value="90d">90 días</SelectItem>
                  <SelectItem value="365d">1 año</SelectItem>
                  <SelectItem value="never">Sin caducidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Scopes</Label>
            <div className="grid grid-cols-2 gap-2 rp-glass rounded-lg p-3 max-h-56 overflow-y-auto rp-scroll-thin">
              {ALL_SCOPES.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2 text-xs cursor-pointer rounded-md hover:bg-foreground/[0.04] px-2 py-1.5"
                >
                  <Checkbox
                    checked={selectedScopes.includes(s)}
                    onCheckedChange={() => toggleScope(s)}
                  />
                  <span className="font-mono text-foreground/80">{s}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {selectedScopes.length} scope(s) seleccionado(s)
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-h-[44px]">
            Cancelar
          </Button>
          <Button
            onClick={submit}
            className="min-h-[44px] bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          >
            <Plus className="h-3.5 w-3.5" /> Crear key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RotateDialog({
  target,
  onClose,
  onConfirm,
}: {
  target: ApiKeyRow | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCw className="h-4 w-4 text-[var(--gold)]" /> Rotar API key
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vas a rotar la secret key de{" "}
            <span className="font-medium text-foreground">{target?.name}</span>.
            La anterior dejará de funcionar en 24 h. Las integraciones que la
            usen deberán actualizarse con la nueva clave.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="min-h-[44px] bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          >
            Rotar ahora
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RevokeDialog({
  target,
  onClose,
  onConfirm,
}: {
  target: ApiKeyRow | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" /> Revocar API key
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vas a revocar <span className="font-medium text-foreground">{target?.name}</span>.
            Esta acción es <span className="text-rose-300 font-medium">irreversible</span>.
            Todas las peticiones que usen esta clave fallarán inmediatamente.
            Asegúrate de que ninguna integración depende de ella.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-md border border-rose-400/30 bg-rose-400/5 p-3 text-xs text-rose-200/80">
          <strong className="text-rose-200">Impacto:</strong> 3 integraciones
          activas podrían dejar de funcionar. Verifica antes de continuar.
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="min-h-[44px] bg-rose-500 text-white hover:bg-rose-600"
          >
            Revocar definitivamente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function NewlyCreatedDialog({
  row,
  onClose,
  onCopy,
}: {
  row: ApiKeyRow | null;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
}) {
  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> API key creada
          </DialogTitle>
          <DialogDescription>
            Copia ahora tu secret key. Por seguridad, no volverá a mostrarse.
          </DialogDescription>
        </DialogHeader>
        {row && (
          <div className="space-y-3 py-2">
            <div className="rp-glass rounded-lg p-3 space-y-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Public key</div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <code className="text-xs font-mono text-foreground/90 break-all">{row.publicPrefix}…</code>
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => onCopy(row.publicPrefix + "AAAA", "Public key copiada")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="pt-2 border-t border-border/40">
                <div className="text-[10px] font-mono uppercase tracking-wider rp-gold-text">Secret key (una sola vez)</div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <code className="text-xs font-mono text-[var(--gold-soft)] break-all">{row.secretRevealed}</code>
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => onCopy(row.secretRevealed, "Secret copiada")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-amber-300/80">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              Guárdala en un gestor de secretos (1Password, Vault, AWS Secrets Manager…). No la subas a git.
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={onClose} className="min-h-[44px] bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]">
            He guardado la clave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
 * TAB: OAuth
 * ============================================================ */

type OAuthStatus = "connected" | "pending" | "not-configured";

interface OAuthConnection {
  id: string;
  provider: string;
  icon: React.ElementType;
  color: string;
  description: string;
  status: OAuthStatus;
  scopes: string[];
  connectedAt?: string;
  lastSync?: string;
}

const OAUTH_CONNECTIONS: OAuthConnection[] = [
  {
    id: "google",
    provider: "Google",
    icon: Star,
    color: "text-amber-300",
    description: "Login con Google · Calendar · Reviews",
    status: "connected",
    scopes: ["profile", "email", "calendar.events", "business.manage"],
    connectedAt: "12 ene 2025",
    lastSync: "hace 7 min",
  },
  {
    id: "meta",
    provider: "Meta (Facebook)",
    icon: Building2,
    color: "text-blue-300",
    description: "Instagram · WhatsApp Business · Ads",
    status: "connected",
    scopes: ["pages.manage_posts", "instagram_basic", "whatsapp.business_messaging"],
    connectedAt: "20 ene 2025",
    lastSync: "hace 1 h",
  },
  {
    id: "microsoft",
    provider: "Microsoft",
    icon: Boxes,
    color: "text-cyan-300",
    description: "Azure AD · Microsoft 365 · Teams",
    status: "pending",
    scopes: ["User.Read", "Calendars.ReadWrite"],
    connectedAt: undefined,
    lastSync: undefined,
  },
  {
    id: "slack",
    provider: "Slack",
    icon: Slack,
    color: "text-fuchsia-300",
    description: "Notificaciones · Aprobaciones",
    status: "connected",
    scopes: ["chat:write", "channels:read"],
    connectedAt: "03 feb 2025",
    lastSync: "hace 23 min",
  },
  {
    id: "hubspot",
    provider: "HubSpot",
    icon: Mail,
    color: "text-orange-300",
    description: "CRM sync · Marketing automation",
    status: "not-configured",
    scopes: ["contacts", "companies"],
    connectedAt: undefined,
    lastSync: undefined,
  },
  {
    id: "notion",
    provider: "Notion",
    icon: FileText,
    color: "text-foreground/80",
    description: "Documentación · Reportes",
    status: "not-configured",
    scopes: ["read:pages", "write:pages"],
    connectedAt: undefined,
    lastSync: undefined,
  },
];

function OAuthTab() {
  const { toast } = useToast();
  const [conns, setConns] = React.useState<OAuthConnection[]>(OAUTH_CONNECTIONS);
  const [consentFor, setConsentFor] = React.useState<OAuthConnection | null>(null);
  const [disconnectTarget, setDisconnectTarget] = React.useState<OAuthConnection | null>(null);

  function confirmConnect() {
    if (!consentFor) return;
    setConns((cs) =>
      cs.map((c) =>
        c.id === consentFor.id
          ? {
              ...c,
              status: "connected",
              connectedAt: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
              lastSync: "justo ahora",
            }
          : c
      )
    );
    toast({ title: "Conexión OAuth establecida", description: `${consentFor.provider} conectado.` });
    setConsentFor(null);
  }

  function confirmDisconnect() {
    if (!disconnectTarget) return;
    setConns((cs) =>
      cs.map((c) => (c.id === disconnectTarget.id ? { ...c, status: "not-configured", connectedAt: undefined, lastSync: undefined } : c))
    );
    toast({
      title: "Conexión desconectada",
      description: `${disconnectTarget.provider} desconectado.`,
      variant: "destructive",
    });
    setDisconnectTarget(null);
  }

  function reauthorize(c: OAuthConnection) {
    toast({ title: "Reautorizando…", description: `${c.provider} · flujo OAuth reiniciado.` });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display text-lg font-medium tracking-tight">Conexiones OAuth</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Conecta proveedores externos de forma segura con consentimiento explícito de scopes.
          </p>
        </div>
        <DemoBadge />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {conns.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.id} className="rp-glass rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className={cn("h-10 w-10 rounded-lg bg-foreground/[0.06] flex items-center justify-center shrink-0", c.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground truncate">{c.provider}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{c.description}</div>
                </div>
                <OAuthStatusPill status={c.status} />
              </div>
              {c.status !== "not-configured" && (
                <>
                  <div className="flex flex-wrap gap-1">
                    {c.scopes.map((s) => (
                      <ScopeChip key={s} scope={s} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Conectado</div>
                      <div className="text-foreground/80">{c.connectedAt ?? "—"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Últ. sync</div>
                      <div className="text-foreground/80">{c.lastSync ?? "—"}</div>
                    </div>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2 mt-auto pt-1">
                {c.status === "connected" ? (
                  <>
                    <Button variant="outline" size="sm" className="min-h-[40px] flex-1" onClick={() => reauthorize(c)}>
                      <RefreshCw className="h-3.5 w-3.5" /> Reautorizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[40px] border-rose-400/40 text-rose-300 hover:bg-rose-400/10"
                      onClick={() => setDisconnectTarget(c)}
                    >
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="min-h-[40px] w-full bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
                    onClick={() => setConsentFor(c)}
                  >
                    <Network className="h-3.5 w-3.5" /> Conectar
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConsentDialog conn={consentFor} onClose={() => setConsentFor(null)} onConfirm={confirmConnect} />
      <DisconnectDialog conn={disconnectTarget} onClose={() => setDisconnectTarget(null)} onConfirm={confirmDisconnect} />
    </div>
  );
}

function OAuthStatusPill({ status }: { status: OAuthStatus }) {
  const map = {
    connected: { label: "Conectado", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
    pending: { label: "Pendiente", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
    "not-configured": { label: "No configurado", cls: "border-border/60 bg-foreground/5 text-muted-foreground", dot: "bg-muted-foreground/50" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider shrink-0", map.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", map.dot)} />
      {map.label}
    </span>
  );
}

function ConsentDialog({
  conn,
  onClose,
  onConfirm,
}: {
  conn: OAuthConnection | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={!!conn} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {conn && <conn.icon className={cn("h-4 w-4", conn.color)} />}
            Autorizar {conn?.provider}
          </DialogTitle>
          <DialogDescription>
            RestoPanel solicita acceso a los siguientes scopes. Puedes revocar
            el acceso en cualquier momento.
          </DialogDescription>
        </DialogHeader>
        {conn && (
          <div className="space-y-2 py-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Scopes solicitados</div>
            <div className="space-y-1.5">
              {conn.scopes.map((s) => (
                <div key={s} className="flex items-center gap-2 rp-glass rounded-md px-3 py-2 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <code className="font-mono text-foreground/80">{s}</code>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground pt-1">
              Serás redirigido a {conn.provider} para completar el consentimiento.
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="min-h-[44px]">Cancelar</Button>
          <Button onClick={onConfirm} className="min-h-[44px] bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]">
            Autorizar acceso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DisconnectDialog({
  conn,
  onClose,
  onConfirm,
}: {
  conn: OAuthConnection | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={!!conn} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" /> Desconectar {conn?.provider}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se revocarán los tokens de acceso y las integraciones que dependan
            de esta conexión dejarán de funcionar. Puedes reconectar cuando quieras.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="min-h-[44px] bg-rose-500 text-white hover:bg-rose-600"
          >
            Desconectar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ============================================================
 * TAB: Sandbox
 * ============================================================ */

const SANDBOX_BASE_URL = "https://api.sandbox.restopanel.com/v1";
const SANDBOX_TEST_KEY = "sk_test_DEMO_KEY_REPLACE_ME";

function SandboxTab() {
  const { toast } = useToast();
  const [resetOpen, setResetOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  function copyCurl() {
    const cmd = `curl -X GET ${SANDBOX_BASE_URL}/reservations \\
  -H "Authorization: Bearer ${SANDBOX_TEST_KEY}" \\
  -H "Content-Type: application/json"`;
    navigator.clipboard?.writeText(cmd).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast({ title: "Comando copiado", description: "Pégalo en tu terminal." });
  }

  function confirmReset() {
    setResetOpen(false);
    toast({
      title: "Sandbox reseteado",
      description: "Datos de prueba restaurados al estado inicial.",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display text-lg font-medium tracking-tight">Entorno Sandbox</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Prueba la API sin afectar a producción. Los datos son ficticios y reseteables.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 text-amber-300 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> Modo sandbox
          </span>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[40px]"
            onClick={() => setResetOpen(true)}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Resetear sandbox
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rp-glass rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Base URL
          </div>
          <code className="block text-xs font-mono text-foreground/90 break-all">{SANDBOX_BASE_URL}</code>
          <button
            onClick={() => { navigator.clipboard?.writeText(SANDBOX_BASE_URL); toast({ title: "URL copiada" }); }}
            className="text-[11px] text-[var(--gold)] hover:underline inline-flex items-center gap-1"
          >
            <Copy className="h-3 w-3" /> Copiar URL
          </button>
        </div>
        <div className="rp-glass rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <Database className="h-3.5 w-3.5" /> Datos de prueba
          </div>
          <ul className="text-xs space-y-1">
            <li className="flex justify-between"><span className="text-muted-foreground">Restaurantes</span><span className="font-mono text-foreground/90">3</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Reservas</span><span className="font-mono text-foreground/90">50</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Clientes</span><span className="font-mono text-foreground/90">100</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Mesas</span><span className="font-mono text-foreground/90">36</span></li>
          </ul>
        </div>
        <div className="rp-glass rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" /> Tarjetas de prueba (Stripe)
          </div>
          <ul className="text-xs space-y-1.5">
            <li>
              <code className="font-mono text-emerald-300">4242 4242 4242 4242</code>
              <div className="text-[10px] text-muted-foreground">Visa · éxito</div>
            </li>
            <li>
              <code className="font-mono text-amber-300">4000 0025 0000 3155</code>
              <div className="text-[10px] text-muted-foreground">3DS obligatorio</div>
            </li>
            <li>
              <code className="font-mono text-rose-300">4000 0000 0000 0002</code>
              <div className="text-[10px] text-muted-foreground">Tarjeta rechazada</div>
            </li>
          </ul>
        </div>
      </div>

      {/* first API call snippet */}
      <div className="rp-glass rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <Terminal className="h-3.5 w-3.5" /> Tu primera llamada · curl
          </div>
          <Button variant="ghost" size="sm" className="h-8" onClick={copyCurl}>
            {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>
        <pre className="overflow-x-auto rp-scroll-thin p-4 text-xs leading-relaxed font-mono text-foreground/85">
{`curl -X GET ${SANDBOX_BASE_URL}/reservations \\
  -H "Authorization: Bearer ${SANDBOX_TEST_KEY}" \\
  -H "Content-Type: application/json"`}
        </pre>
      </div>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-[var(--gold)]" /> Resetear sandbox
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todas las reservas, clientes y mesas creadas en el
              sandbox y se restaurarán los datos de prueba originales. Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReset}
              className="min-h-[44px] bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
            >
              Resetear ahora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ============================================================
 * TAB: Uso (Usage dashboard)
 * ============================================================ */

// 30 days of synthetic API request data
const USAGE_SERIES = [
  820, 760, 905, 1024, 1180, 1340, 1280, 1410, 1295, 1180,
  1247, 1390, 1502, 1620, 1580, 1490, 1370, 1290, 1420, 1560,
  1680, 1750, 1640, 1510, 1390, 1280, 1340, 1247, 1180, 1247,
];

function UsageTab() {
  const today = 1247;
  const month = 34580;
  const rateLimit = 10000;
  const rateUsed = 1247;
  const ratePct = Math.round((rateUsed / rateLimit) * 100);
  const errRate = 0.3;

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <UsageStat label="Peticiones hoy" value={today.toLocaleString("es-ES")} sub="vs. ayer +4.2%" icon={Zap} accent="gold" />
        <UsageStat label="Peticiones este mes" value={month.toLocaleString("es-ES")} sub="vs. mes ant. +18.7%" icon={Activity} accent="teal" />
        <UsageStat label="Uso de rate limit" value={`${ratePct}%`} sub={`${rateUsed.toLocaleString("es-ES")} / ${rateLimit.toLocaleString("es-ES")} req/min`} icon={Clock} accent="gold" />
        <UsageStat label="Tasa de error" value={`${errRate}%`} sub="p99 · 142ms" icon={AlertTriangle} accent="teal" />
      </div>

      {/* chart */}
      <div className="rp-glass rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="font-display text-base font-medium">Peticiones · últimos 30 días</h4>
            <p className="text-[11px] text-muted-foreground">Volumen diario de llamadas a la API</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" /> Producción
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" /> Sandbox
            </span>
          </div>
        </div>
        <UsageChart data={USAGE_SERIES} />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* top endpoints */}
        <div className="rp-glass rounded-xl p-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h4 className="font-display text-base font-medium">Top endpoints</h4>
            <DemoBadge />
          </div>
          <div className="overflow-x-auto rp-scroll-thin">
            <table className="w-full border-collapse text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-border/60">
                  {["Endpoint", "Peticiones", "Latencia media", "Errores"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_ENDPOINTS.map((e) => (
                  <tr key={e.path} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025]">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <MethodBadge method={e.method} />
                        <code className="text-xs font-mono text-foreground/90">{e.path}</code>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs">{e.requests.toLocaleString("es-ES")}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">
                      <span className="text-foreground/80">{e.latency}ms</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn(
                        "font-mono text-xs",
                        e.errors < 0.5 ? "text-emerald-300" : e.errors < 1 ? "text-amber-300" : "text-rose-300"
                      )}>
                        {e.errors.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* rate limits */}
        <div className="space-y-3">
          <div className="rp-glass rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="font-display text-base font-medium">Rate limits</h4>
              <Server className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <RateLimitCard
              label="Producción"
              limit="10.000 req/min"
              used={1247}
              total={10000}
              tone="gold"
            />
            <div className="h-3" />
            <RateLimitCard
              label="Sandbox"
              limit="1.000 req/min"
              used={284}
              total={1000}
              tone="teal"
            />
            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              Al superar el límite recibes <code className="font-mono text-foreground/80">429 Too Many Requests</code>.
              Usa el header <code className="font-mono text-foreground/80">Retry-After</code> para reintentar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const TOP_ENDPOINTS = [
  { method: "GET" as Method, path: "/reservations", requests: 18420, latency: 38, errors: 0.12 },
  { method: "POST" as Method, path: "/reservations", requests: 9210, latency: 142, errors: 0.41 },
  { method: "GET" as Method, path: "/customers", requests: 6740, latency: 29, errors: 0.08 },
  { method: "GET" as Method, path: "/analytics", requests: 3120, latency: 412, errors: 0.62 },
  { method: "POST" as Method, path: "/webhooks", requests: 2180, latency: 18, errors: 0.05 },
];

function UsageStat({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: "gold" | "teal";
}) {
  const color = accent === "gold" ? "text-[var(--gold)]" : "text-[var(--teal)]";
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className={cn("h-3.5 w-3.5", color)} />
      </div>
      <div className={cn("mt-2 font-display text-2xl sm:text-3xl font-light", color)}>{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function UsageChart({ data }: { data: number[] }) {
  const w = 720;
  const h = 180;
  const pad = 10;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);
  const pts = data.map((d, i) => ({
    x: pad + i * stepX,
    y: pad + (h - pad * 2) * (1 - (d - min) / range),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${h - pad} L ${pts[0].x.toFixed(1)} ${h - pad} Z`;
  // gridlines
  const gridY = [0.25, 0.5, 0.75].map((f) => pad + (h - pad * 2) * f);
  return (
    <div className="w-full overflow-x-auto rp-scroll-thin">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[180px] min-w-[560px]" role="img" aria-label="Peticiones últimos 30 días">
        <defs>
          <linearGradient id="rp-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rp-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--gold-deep)" />
            <stop offset="50%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--gold-soft)" />
          </linearGradient>
        </defs>
        {gridY.map((y, i) => (
          <line key={i} x1={pad} y1={y} x2={w - pad} y2={y} stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#rp-area)" />
        <path d={line} fill="none" stroke="url(#rp-line)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          i % 5 === 0 && (
            <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="var(--gold)" />
          )
        ))}
      </svg>
    </div>
  );
}

function RateLimitCard({
  label,
  limit,
  used,
  total,
  tone,
}: {
  label: string;
  limit: string;
  used: number;
  total: number;
  tone: "gold" | "teal";
}) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  const barColor = tone === "gold" ? "bg-[var(--gold)]" : "bg-[var(--teal)]";
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-medium text-foreground/90">{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{limit}</span>
      </div>
      <div className="h-2 rounded-full bg-foreground/[0.08] overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-[10px] font-mono text-muted-foreground">
        {used.toLocaleString("es-ES")} / {total.toLocaleString("es-ES")} · {pct}%
      </div>
    </div>
  );
}

/* ============================================================
 * TAB: Documentación
 * ============================================================ */

const DOC_SECTIONS = [
  { id: "quickstart", label: "Inicio rápido", icon: Zap },
  { id: "auth", label: "Autenticación", icon: Key },
  { id: "reservations", label: "Reservas", icon: CalendarDays2 },
  { id: "customers", label: "Clientes", icon: Users2 },
  { id: "tables", label: "Mesas", icon: GridIcon },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "oauth", label: "OAuth", icon: Network },
  { id: "sdks", label: "SDKs", icon: Code2 },
  { id: "errors", label: "Errores", icon: AlertTriangle },
  { id: "ratelimits", label: "Rate limits", icon: Clock },
];

const CODE_TS = `import { RestoPanel } from '@restopanel/sdk';

const client = new RestoPanel({
  apiKey: process.env.RESTOPANEL_API_KEY,
});

const reservations = await client.reservations.list({
  location_id: 'loc_01HZX...',
  date: '2025-01-21',
});`;

const CODE_PY = `from restopanel import RestoPanel

client = RestoPanel(
    api_key=os.environ["RESTOPANEL_API_KEY"]
)

reservations = client.reservations.list(
    location_id="loc_01HZX...",
    date="2025-01-21",
)`;

const CODE_CURL = `curl -X GET https://api.restopanel.com/v1/reservations \\
  -H "Authorization: Bearer $RESTOPANEL_API_KEY" \\
  -H "Content-Type: application/json"`;

function DocsTab() {
  const { toast } = useToast();
  const [lang, setLang] = React.useState<"typescript" | "python" | "curl">("typescript");
  const [active, setActive] = React.useState("quickstart");

  function fakeDownload(label: string) {
    toast({ title: "Descargando…", description: label });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      {/* sidebar */}
      <aside className="rp-glass rounded-xl p-3 lg:sticky lg:top-4 self-start">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1.5">
          Documentación
        </div>
        <nav className="space-y-0.5">
          {DOC_SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "w-full min-h-[40px] flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-left transition-colors",
                  active === s.id
                    ? "bg-[var(--gold)]/12 text-[var(--gold-soft)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{s.label}</span>
                {active === s.id && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
              </button>
            );
          })}
        </nav>
        <div className="h-px rp-divider my-3" />
        <div className="space-y-1">
          <button
            onClick={() => fakeDownload("OpenAPI 3.1 spec (yaml)")}
            className="w-full min-h-[40px] flex items-center gap-2 rounded-md px-2.5 py-2 text-xs text-left text-muted-foreground hover:text-[var(--gold)] hover:bg-foreground/5 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> OpenAPI spec
          </button>
          <button
            onClick={() => fakeDownload("Postman Collection v2.1")}
            className="w-full min-h-[40px] flex items-center gap-2 rounded-md px-2.5 py-2 text-xs text-left text-muted-foreground hover:text-[var(--gold)] hover:bg-foreground/5 transition-colors"
          >
            <Boxes className="h-3.5 w-3.5" /> Postman Collection
          </button>
          <button
            onClick={() => toast({ title: "Abriendo GraphQL Playground", description: "studio.restopanel.com/graphql" })}
            className="w-full min-h-[40px] flex items-center gap-2 rounded-md px-2.5 py-2 text-xs text-left text-muted-foreground hover:text-[var(--teal)] hover:bg-foreground/5 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> GraphQL Playground
          </button>
        </div>
      </aside>

      {/* content */}
      <div className="space-y-4">
        <div className="rp-glass rounded-xl p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h4 className="font-display text-base sm:text-lg font-medium">Inicio rápido</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Crea tu primera integración en menos de 5 minutos.
              </p>
            </div>
            <DemoBadge />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Autentícate con tu API key, instala el SDK y lista reservas de tu
            local. Los ejemplos below muestran el mismo flujo en 3 lenguajes.
          </p>
        </div>

        <div className="rp-glass rounded-xl overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-2">
            <div className="flex items-center gap-1">
              {(["typescript", "python", "curl"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "min-h-[36px] px-3 rounded-md text-xs font-mono uppercase tracking-wider transition-colors",
                    lang === l
                      ? "bg-[var(--gold)]/12 text-[var(--gold-soft)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  {l === "typescript" ? "TS" : l === "python" ? "Python" : "cURL"}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => {
                const text = lang === "typescript" ? CODE_TS : lang === "python" ? CODE_PY : CODE_CURL;
                navigator.clipboard?.writeText(text);
                toast({ title: "Código copiado" });
              }}
            >
              <Copy className="h-3 w-3" /> Copiar
            </Button>
          </div>
          <pre className="overflow-x-auto rp-scroll-thin p-4 text-xs leading-relaxed font-mono text-foreground/85">
{lang === "typescript" ? CODE_TS : lang === "python" ? CODE_PY : CODE_CURL}
          </pre>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <DocLinkCard
            icon={Code2}
            title="SDK oficial"
            subtitle="@restopanel/sdk"
            tone="gold"
          />
          <DocLinkCard
            icon={Webhook}
            title="Webhooks"
            subtitle="14 eventos · retries"
            tone="teal"
          />
          <DocLinkCard
            icon={Sparkles}
            title="Ejemplos"
            subtitle="12 recetas listas"
            tone="gold"
          />
        </div>
      </div>
    </div>
  );
}

function DocLinkCard({
  icon: Icon,
  title,
  subtitle,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  tone: "gold" | "teal";
}) {
  const color = tone === "gold" ? "text-[var(--gold)]" : "text-[var(--teal)]";
  return (
    <button className="rp-glass rounded-xl p-4 text-left hover:rp-glow-gold transition-all group">
      <Icon className={cn("h-5 w-5 mb-2", color)} />
      <div className="font-medium text-sm">{title}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
        {subtitle}
        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

/* ---------------- shared minimal icons (kept inline to avoid extra deps) ---------------- */
function CalendarDays2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  );
}
function Users2(props: React.SVGProps<SVGSVGElement>) {
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

/* ---------------- shared method badge (exported for reuse) ---------------- */
type Method = "GET" | "POST" | "PATCH" | "DELETE";
function MethodBadge({ method }: { method: Method }) {
  const map: Record<Method, string> = {
    GET: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    POST: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
    PATCH: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    DELETE: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  };
  return (
    <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider border", map[method])}>
      {method}
    </span>
  );
}
