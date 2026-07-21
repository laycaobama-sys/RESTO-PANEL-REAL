"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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
  UserCog, Search, Filter, UserPlus, Shield, Crown, MoreHorizontal,
  Mail, Check, X, Trash2, Pencil, Lock, ChevronRight, Users, KeyRound,
} from "lucide-react";

function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider", className)}>
      demo
    </Badge>
  );
}

/* ---------------- members data ---------------- */
type MemberStatus = "activa" | "invitada" | "suspendida";
type Member = {
  id: string; name: string; email: string; role: string;
  locations: string[]; status: MemberStatus; lastActive: string; avatar: string;
};

const MEMBERS: Member[] = [
  { id: "m1", name: "Ana Martínez", email: "ana@ramsesgroup.com", role: "Owner", locations: ["Todos"], status: "activa", lastActive: "ahora", avatar: "AM" },
  { id: "m2", name: "Carlos Ruiz", email: "carlos@ramsesgroup.com", role: "Director", locations: ["Ramses Madrid", "Ramses Barcelona"], status: "activa", lastActive: "hace 8 min", avatar: "CR" },
  { id: "m3", name: "Lucía Fernández", email: "lucia@ramsesgroup.com", role: "Gerente", locations: ["Ramses Madrid"], status: "activa", lastActive: "hace 1 h", avatar: "LF" },
  { id: "m4", name: "Diego Santos", email: "diego@ramsesgroup.com", role: "Maitre", locations: ["Ramses Madrid"], status: "activa", lastActive: "hace 12 min", avatar: "DS" },
  { id: "m5", name: "María López", email: "maria@ramsesgroup.com", role: "Recepción", locations: ["Ramses Barcelona"], status: "activa", lastActive: "hace 3 h", avatar: "ML" },
  { id: "m6", name: "Javier Núñez", email: "javier@external.com", role: "Marketing", locations: ["Todos"], status: "invitada", lastActive: "—", avatar: "JN" },
  { id: "m7", name: "Elena Vega", email: "elena@ramsesgroup.com", role: "Solo Lectura", locations: ["Ramses Valencia"], status: "suspendida", lastActive: "hace 14 días", avatar: "EV" },
];

const ROLES = [
  { id: "owner", name: "Owner", members: 1, system: true, description: "Acceso total + propiedad de la cuenta" },
  { id: "director", name: "Director", members: 1, system: true, description: "Acceso multi-local, facturación y equipo" },
  { id: "gerente", name: "Gerente", members: 1, system: true, description: "Gestión operativa de un local" },
  { id: "maitre", name: "Maitre", members: 1, system: true, description: "Reservas, mesa y recepción" },
  { id: "recepcion", name: "Recepción", members: 1, system: true, description: "Front desk y reservas" },
  { id: "camarero", name: "Camarero", members: 0, system: true, description: "Solo mesa y pedidos" },
  { id: "cocina", name: "Cocina", members: 0, system: true, description: "Solo órdenes de cocina" },
  { id: "barra", name: "Barra", members: 0, system: true, description: "Solo barra y pedidos" },
  { id: "marketing", name: "Marketing", members: 1, system: true, description: "CRM, campañas y analytics" },
  { id: "contabilidad", name: "Contabilidad", members: 0, system: true, description: "Facturación y reportes" },
  { id: "auditor", name: "Auditor", members: 0, system: true, description: "Acceso solo lectura a todo" },
  { id: "lectura", name: "Solo Lectura", members: 1, system: true, description: "Lectura limitada" },
];

const RESOURCES = ["Reservas", "Clientes", "Marketing", "Reviews", "Analytics", "Equipo", "Facturación", "Configuración"];
const ACTIONS = ["ver", "crear", "editar", "eliminar"] as const;

/* default permission matrix per role (system roles) */
const DEFAULT_PERMS: Record<string, Record<string, boolean[]>> = {
  owner: Object.fromEntries(RESOURCES.map((r) => [r, [true, true, true, true]])),
  director: Object.fromEntries(RESOURCES.map((r) => [r, r === "Configuración" ? [true, false, false, false] : [true, true, true, true]])),
  gerente: Object.fromEntries(RESOURCES.map((r) => [r, ["Reservas", "Clientes"].includes(r) ? [true, true, true, true] : ["Marketing", "Reviews", "Analytics"].includes(r) ? [true, false, false, false] : [false, false, false, false]])),
  maitre: Object.fromEntries(RESOURCES.map((r) => [r, r === "Reservas" ? [true, true, true, false] : [false, false, false, false]])),
  recepcion: Object.fromEntries(RESOURCES.map((r) => [r, r === "Reservas" ? [true, true, false, false] : [false, false, false, false]])),
  camarero: Object.fromEntries(RESOURCES.map((r) => [r, [false, false, false, false]])),
  cocina: Object.fromEntries(RESOURCES.map((r) => [r, [false, false, false, false]])),
  barra: Object.fromEntries(RESOURCES.map((r) => [r, [false, false, false, false]])),
  marketing: Object.fromEntries(RESOURCES.map((r) => [r, ["Clientes", "Marketing", "Reviews", "Analytics"].includes(r) ? [true, true, true, false] : [false, false, false, false]])),
  contabilidad: Object.fromEntries(RESOURCES.map((r) => [r, r === "Facturación" ? [true, false, false, false] : ["Analytics"].includes(r) ? [true, false, false, false] : [false, false, false, false]])),
  auditor: Object.fromEntries(RESOURCES.map((r) => [r, [true, false, false, false]])),
  lectura: Object.fromEntries(RESOURCES.map((r) => [r, ["Reservas", "Clientes"].includes(r) ? [true, false, false, false] : [false, false, false, false]])),
};

const LOCATIONS = ["Todos", "Ramses Madrid", "Ramses Barcelona", "Ramses Valencia"];
const ROLE_OPTIONS = ["Director", "Gerente", "Maitre", "Recepción", "Camarero", "Cocina", "Barra", "Marketing", "Contabilidad", "Auditor", "Solo Lectura"];

function MemberStatusPill({ status }: { status: MemberStatus }) {
  const map = {
    activa: { label: "Activa", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
    invitada: { label: "Invitada", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
    suspendida: { label: "Suspendida", cls: "border-rose-400/50 bg-rose-400/10 text-rose-300", dot: "bg-rose-400" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs", map.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", map.dot)} />{map.label}
    </span>
  );
}

/* ---------------- permissions matrix ---------------- */
function PermissionsMatrix({
  perms, onChange, readOnly,
}: {
  perms: Record<string, boolean[]>;
  onChange?: (resource: string, actionIdx: number, value: boolean) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="overflow-x-auto rp-scroll-thin rounded-lg border border-border/40">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-border/60 bg-foreground/[0.03]">
            <th className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground sticky left-0 bg-background/95">Recurso</th>
            {ACTIONS.map((a) => (
              <th key={a} className="px-3 py-2 text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground capitalize">{a}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RESOURCES.map((r) => (
            <tr key={r} className="border-b border-border/40 last:border-0">
              <td className="px-3 py-2 font-medium sticky left-0 bg-background/95">{r}</td>
              {ACTIONS.map((a, ai) => {
                const checked = perms[r]?.[ai] ?? false;
                return (
                  <td key={a} className="px-3 py-2 text-center">
                    {readOnly ? (
                      checked ? <Check className="h-3.5 w-3.5 text-emerald-400 inline" aria-label="Permitido" />
                             : <X className="h-3.5 w-3.5 text-muted-foreground/40 inline" aria-label="Denegado" />
                    ) : (
                      <Checkbox checked={checked} onCheckedChange={(v) => onChange?.(r, ai, !!v)} aria-label={`${a} ${r}`} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- main view ---------------- */
export function TeamView() {
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("Todos");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [permsOpen, setPermsOpen] = React.useState<string | null>(null);
  const [customRoleOpen, setCustomRoleOpen] = React.useState(false);
  const [removeTarget, setRemoveTarget] = React.useState<Member | null>(null);

  // invite form
  const [invite, setInvite] = React.useState({ email: "", role: "Gerente", locations: [] as string[] });
  const [inviteErr, setInviteErr] = React.useState<string | null>(null);

  // custom role form
  const [customRole, setCustomRole] = React.useState({ name: "", perms: Object.fromEntries(RESOURCES.map((r) => [r, [false, false, false, false]])) as Record<string, boolean[]> });
  const [customErr, setCustomErr] = React.useState<string | null>(null);

  // permissions editor (copy from defaults)
  const [editPerms, setEditPerms] = React.useState<Record<string, boolean[]> | null>(null);

  const filtered = MEMBERS.filter((m) => {
    if (search && !`${m.name} ${m.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "Todos" && m.role !== roleFilter) return false;
    return true;
  });

  const openPerms = (roleId: string) => {
    const base = DEFAULT_PERMS[roleId] ?? Object.fromEntries(RESOURCES.map((r) => [r, [false, false, false, false]]));
    setEditPerms(JSON.parse(JSON.stringify(base)));
    setPermsOpen(roleId);
  };

  const savePerms = () => {
    toast({ title: "Permisos actualizados (demo)", description: `Rol ${ROLES.find((r) => r.id === permsOpen)?.name} guardado.` });
    setPermsOpen(null);
  };

  const togglePerm = (resource: string, actionIdx: number, value: boolean) => {
    setEditPerms((p) => {
      if (!p) return p;
      const next = { ...p, [resource]: [...(p[resource] ?? [false, false, false, false])] };
      next[resource][actionIdx] = value;
      return next;
    });
  };

  const submitInvite = () => {
    setInviteErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email)) { setInviteErr("El email no es válido."); return; }
    if (invite.locations.length === 0) { setInviteErr("Selecciona al menos un local."); return; }
    toast({ title: "Invitación enviada (demo)", description: `${invite.email} · ${invite.role} · ${invite.locations.length} local(es)` });
    setInvite({ email: "", role: "Gerente", locations: [] });
    setInviteOpen(false);
  };

  const submitCustomRole = () => {
    setCustomErr(null);
    if (customRole.name.trim().length < 3) { setCustomErr("El nombre del rol debe tener al menos 3 caracteres."); return; }
    const totalGranted = Object.values(customRole.perms).reduce((acc, arr) => acc + arr.filter(Boolean).length, 0);
    if (totalGranted === 0) { setCustomErr("Concede al menos un permiso."); return; }
    toast({ title: "Rol personalizado creado (demo)", description: `"${customRole.name}" con ${totalGranted} permisos.` });
    setCustomRole({ name: "", perms: Object.fromEntries(RESOURCES.map((r) => [r, [false, false, false, false]])) });
    setCustomRoleOpen(false);
  };

  const toggleCustomPerm = (resource: string, actionIdx: number, value: boolean) => {
    setCustomRole((c) => {
      const next = { ...c.perms, [resource]: [...(c.perms[resource] ?? [false, false, false, false])] };
      next[resource][actionIdx] = value;
      return { ...c, perms: next };
    });
  };

  const confirmRemove = () => {
    if (removeTarget) {
      toast({ title: "Miembro eliminado (demo)", description: `${removeTarget.name} ya no tiene acceso.`, variant: "destructive" });
      setRemoveTarget(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <header className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-[var(--teal)]/10 border border-[var(--teal)]/30 flex items-center justify-center">
            <UserCog className="h-5 w-5 rp-teal-text" aria-hidden />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">Equipo</h1>
          <DemoBadge />
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Gestiona miembros, roles y permisos. La cuenta de Owner no puede ser eliminada ni degradada.
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Miembros", value: MEMBERS.length, sub: `${MEMBERS.filter((m) => m.status === "activa").length} activos` },
          { label: "Roles disponibles", value: ROLES.length, sub: "11 sistema + custom" },
          { label: "Invitaciones pendientes", value: MEMBERS.filter((m) => m.status === "invitada").length, sub: "enviadas" },
          { label: "Suspendidos", value: MEMBERS.filter((m) => m.status === "suspendida").length, sub: "sin acceso" },
        ].map((s) => (
          <div key={s.label} className="rp-glass rounded-xl p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-display text-2xl font-light">{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Members table */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg sm:text-xl font-medium tracking-tight">Miembros</h2>
            <DemoBadge />
          </div>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Invitar miembro
          </Button>
        </div>
        <div className="rp-glass rounded-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-2 p-3 border-b border-border/40">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
              <Input type="search" placeholder="Buscar por nombre o email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Buscar miembros" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger size="sm" className="w-full sm:w-48">
                <span className="flex items-center gap-2 text-muted-foreground"><Filter className="h-3 w-3" /> Rol</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                {ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto rp-scroll-thin">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-foreground/[0.03]">
                  <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Miembro</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Rol</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Acceso locales</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">Última actividad</th>
                  <th className="px-4 py-2.5" aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No se encontraron miembros.</td></tr>
                )}
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.03]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium",
                          m.role === "Owner" ? "bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30"
                          : "bg-foreground/5 text-foreground/80 border border-border/40")}>
                          {m.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-foreground flex items-center gap-1.5">
                            {m.name}
                            {m.role === "Owner" && <Crown className="h-3 w-3 rp-gold-text" aria-hidden />}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn(
                        m.role === "Owner" ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                        : "border-border/60 bg-foreground/5 text-foreground/80"
                      )}>{m.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {m.locations.map((l) => (
                          <span key={l} className="text-[11px] px-1.5 py-0.5 rounded bg-foreground/5 border border-border/40 text-muted-foreground">{l}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3"><MemberStatusPill status={m.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{m.lastActive}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => toast({ title: "Editando miembro (demo)", description: m.name })}>
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-rose-300" disabled={m.role === "Owner"} onClick={() => setRemoveTarget(m)}>
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg sm:text-xl font-medium tracking-tight">Roles y permisos</h2>
            <DemoBadge />
          </div>
          <Button size="sm" variant="outline" onClick={() => setCustomRoleOpen(true)}>
            <KeyRound className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Crear rol personalizado
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ROLES.map((r) => (
            <div key={r.id} className="rp-glass rounded-xl p-4 flex flex-col gap-2 hover:border-[var(--gold)]/30 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {r.id === "owner" ? <Crown className="h-4 w-4 rp-gold-text" aria-hidden /> : <Shield className="h-4 w-4 text-muted-foreground" aria-hidden />}
                  <h4 className="font-medium">{r.name}</h4>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  <Users className="h-2.5 w-2.5 mr-1" aria-hidden /> {r.members}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{r.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <span className="text-[11px] font-mono text-muted-foreground">{r.system ? "sistema" : "custom"}</span>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openPerms(r.id)}>
                  Editar permisos <ChevronRight className="h-3 w-3 ml-1" aria-hidden />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={(o) => { setInviteOpen(o); if (!o) setInviteErr(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-4 w-4" aria-hidden /> Invitar miembro <DemoBadge className="ml-1" /></DialogTitle>
            <DialogDescription>El invitado recibirá un email con un enlace para unirse a la organización.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="inv-email" className="text-xs">Email *</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                <Input id="inv-email" type="email" placeholder="persona@empresa.com" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} className="pl-9" />
              </div>
            </div>
            <div>
              <Label htmlFor="inv-role" className="text-xs">Rol *</Label>
              <Select value={invite.role} onValueChange={(v) => setInvite({ ...invite, role: v })}>
                <SelectTrigger id="inv-role" className="w-full mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Locales con acceso *</Label>
              <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-md border border-border/40 p-2">
                {LOCATIONS.map((l) => {
                  const checked = invite.locations.includes(l);
                  return (
                    <label key={l} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-foreground/5 rounded px-1.5 py-1">
                      <Checkbox checked={checked} onCheckedChange={(v) => {
                        if (v) setInvite({ ...invite, locations: [...invite.locations, l] });
                        else setInvite({ ...invite, locations: invite.locations.filter((x) => x !== l) });
                      }} />
                      <span>{l}</span>
                    </label>
                  );
                })}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{invite.locations.length} local(es) seleccionado(s)</div>
            </div>
            {inviteErr && (
              <div className="rounded-md border border-rose-400/40 bg-rose-400/10 p-2.5 text-xs text-rose-200 flex items-start gap-2">
                <X className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden /><span>{inviteErr}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
            <Button onClick={submitInvite}><Mail className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Enviar invitación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions editor dialog */}
      <Dialog open={!!permsOpen} onOpenChange={(o) => !o && setPermsOpen(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 rp-teal-text" aria-hidden />
              Permisos: {ROLES.find((r) => r.id === permsOpen)?.name}
              <DemoBadge className="ml-1" />
            </DialogTitle>
            <DialogDescription>Define qué acciones puede realizar este rol sobre cada recurso.</DialogDescription>
          </DialogHeader>
          {editPerms && (
            <>
              <PermissionsMatrix perms={editPerms} onChange={togglePerm} />
              <div className="rounded-md border border-border/40 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
                <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 rp-teal-text" aria-hidden />
                <span>Los cambios se aplican a todos los miembros con este rol. El rol Owner no puede ser modificado.</span>
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermsOpen(null)}>Cancelar</Button>
            <Button onClick={savePerms}>Guardar permisos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom role dialog */}
      <Dialog open={customRoleOpen} onOpenChange={(o) => { setCustomRoleOpen(o); if (!o) setCustomErr(null); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4 rp-gold-text" aria-hidden /> Crear rol personalizado <DemoBadge className="ml-1" /></DialogTitle>
            <DialogDescription>Define un rol a medida con permisos granulares.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="role-name" className="text-xs">Nombre del rol *</Label>
              <Input id="role-name" placeholder="ej. Coordinador de eventos" value={customRole.name} onChange={(e) => setCustomRole({ ...customRole, name: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs">Permisos</Label>
              <div className="mt-1.5">
                <PermissionsMatrix perms={customRole.perms} onChange={toggleCustomPerm} />
              </div>
            </div>
            {customErr && (
              <div className="rounded-md border border-rose-400/40 bg-rose-400/10 p-2.5 text-xs text-rose-200 flex items-start gap-2">
                <X className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden /><span>{customErr}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomRoleOpen(false)}>Cancelar</Button>
            <Button onClick={submitCustomRole}>Crear rol</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirm */}
      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-rose-300" aria-hidden /> Eliminar miembro</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar a <strong>{removeTarget?.name}</strong> ({removeTarget?.email}).
              Esta acción revoca su acceso inmediatamente y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-rose-500 hover:bg-rose-600 text-white">Sí, eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
