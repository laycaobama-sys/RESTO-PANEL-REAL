"use client";

/* =========================================================
 * RestoPanel · Empleados y cuadrantes
 * ---------------------------------------------------------
 * Fase 9 · Factorial / Planday style
 * 4 tabs: Empleados | Cuadrante | Fichaje | Coste.
 * Cuadrante semanal con drag & drop visual, coverage bar,
 * avisos legales y plantillas. Fichaje con PIN pad y métodos
 * QR / FaceID / Huella. Coste en vivo, horas extra y reparto
 * de propinas.
 * =======================================================*/

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { motion, useReducedMotion } from "framer-motion";
import {
  Users, CalendarDays, Clock, Euro, Plus, QrCode, Fingerprint,
  ScanFace, KeyRound, MapPin, CheckCircle2, AlertTriangle,
  TrendingUp, Coins, Send, Eye, ArrowRight,
  Crown, ChefHat, ConciergeBell, Briefcase,
  ShieldCheck, FileText, Layers, Timer, Play, Pause,
  Trash2, ArrowRightLeft, Banknote, Percent,
} from "lucide-react";

/* =========================================================
 * Types
 * =========================================================*/

type Rol = "camarero" | "cocina" | "jefe_sala" | "barra";

interface Empleado {
  id: string;
  nombre: string;
  iniciales: string;
  rol: Rol;
  cargo: string;
  email: string;
  usuario: string;
  pin: string;
  color: "gold" | "teal" | "violet" | "rose" | "emerald" | "amber";
  permisos: string[];
  nfcEnabled: boolean;
  costeHora: number; // €
  avatarHue: number;
}

type TurnoCode = "M" | "T" | "P" | "C" | "—";

interface TurnoDef {
  code: TurnoCode;
  label: string;
  hora: string;
  tone: string; // tailwind class for bg/border/text
}

type Dia = "Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb" | "Dom";
type VistaCuadrante = "diaria" | "semanal" | "mensual";

interface FichajeRecord {
  id: string;
  empleadoId: string;
  entrada: string;
  salida: string | null;
  horasMin: number;
  metodo: "PIN" | "QR" | "FaceID" | "Huella";
  geoloc: boolean;
  estado: "activa" | "cerrada";
}

interface CosteRow {
  empleadoId: string;
  horasHoy: number; // hours
  costeDia: number; // €
  ratioPct: number; // %
}

interface AvisoItem {
  id: string;
  tipo: "solapamiento" | "descanso" | "coste";
  texto: string;
  dia: Dia;
  empleadoId?: string;
}

/* =========================================================
 * Constants & mock data
 * =========================================================*/

const DIAS: Dia[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const ROL_META: Record<Rol, { label: string; icon: React.ElementType }> = {
  camarero:   { label: "Camarero/a", icon: ConciergeBell },
  cocina:     { label: "Cocina",     icon: ChefHat },
  jefe_sala:  { label: "Jefe de Sala", icon: Crown },
  barra:      { label: "Barra",      icon: Briefcase },
};

const COLOR_META: Record<Empleado["color"], { bg: string; text: string; border: string; dot: string }> = {
  gold:    { bg: "bg-[var(--gold)]/12",    text: "text-[var(--gold-soft)]", border: "border-[var(--gold)]/40",   dot: "bg-[var(--gold)]" },
  teal:    { bg: "bg-[var(--teal)]/12",    text: "text-[var(--teal)]",      border: "border-[var(--teal)]/40",   dot: "bg-[var(--teal)]" },
  violet:  { bg: "bg-violet-500/12",       text: "text-violet-300",         border: "border-violet-500/40",      dot: "bg-violet-400" },
  rose:    { bg: "bg-rose-500/12",         text: "text-rose-300",           border: "border-rose-500/40",        dot: "bg-rose-400" },
  emerald: { bg: "bg-emerald-500/12",      text: "text-emerald-300",        border: "border-emerald-500/40",     dot: "bg-emerald-400" },
  amber:   { bg: "bg-amber-500/12",        text: "text-amber-300",          border: "border-amber-500/40",       dot: "bg-amber-400" },
};

const TURNOS_DEF: Record<TurnoCode, TurnoDef> = {
  M: { code: "M", label: "Mañana",  hora: "08–16",         tone: "bg-[var(--teal)]/20 text-[var(--teal)] border-[var(--teal)]/40" },
  T: { code: "T", label: "Tarde",   hora: "16–24",         tone: "bg-[var(--gold)]/20 text-[var(--gold-soft)] border-[var(--gold)]/40" },
  P: { code: "P", label: "Partido", hora: "08–12 + 18–22", tone: "bg-violet-500/20 text-violet-300 border-violet-500/40" },
  C: { code: "C", label: "Completo", hora: "10–22",        tone: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  "—": { code: "—", label: "Libre", hora: "—",              tone: "bg-foreground/[0.03] text-muted-foreground border-border/40" },
};

const EMPLEADOS: Empleado[] = [
  { id: "e1", nombre: "Ana Martínez",     iniciales: "AM", rol: "camarero",  cargo: "Camarera",   email: "ana@resto.com",    usuario: "ana.m",     pin: "1234", color: "gold",    permisos: ["TPV", "Reservas"],            nfcEnabled: true,  costeHora: 12.0, avatarHue: 35 },
  { id: "e2", nombre: "Lucía Fernández",  iniciales: "LF", rol: "camarero",  cargo: "Camarera",   email: "lucia@resto.com",  usuario: "lucia.f",   pin: "2345", color: "teal",    permisos: ["TPV", "Reservas", "Cuadrante"], nfcEnabled: true,  costeHora: 12.5, avatarHue: 175 },
  { id: "e3", nombre: "Carlos Gómez",     iniciales: "CG", rol: "jefe_sala", cargo: "Jefe de Sala", email: "carlos@resto.com", usuario: "carlos.g",  pin: "3456", color: "rose",    permisos: ["TPV", "Reservas", "Cuadrante", "Caja"], nfcEnabled: false, costeHora: 16.0, avatarHue: 0 },
  { id: "e4", nombre: "Pedro Jiménez",    iniciales: "PJ", rol: "cocina",    cargo: "Cocinero",   email: "pedro@resto.com",  usuario: "pedro.j",   pin: "4567", color: "violet",  permisos: ["KDS"],                         nfcEnabled: false, costeHora: 11.5, avatarHue: 280 },
  { id: "e5", nombre: "María López",      iniciales: "ML", rol: "barra",     cargo: "Barra",      email: "maria@resto.com",  usuario: "maria.l",   pin: "5678", color: "emerald", permisos: ["TPV", "Barra"],                nfcEnabled: true,  costeHora: 11.0, avatarHue: 145 },
  { id: "e6", nombre: "José Ruiz",        iniciales: "JR", rol: "cocina",    cargo: "Cocinero",   email: "jose@resto.com",   usuario: "jose.r",    pin: "6789", color: "amber",   permisos: ["KDS"],                         nfcEnabled: false, costeHora: 12.0, avatarHue: 40 },
];

const CUADRANTE_INIT: Record<string, Record<Dia, TurnoCode>> = {
  e1: { Lun: "M", Mar: "—", Mié: "M", Jue: "T", Vie: "T", Sáb: "T", Dom: "—" },
  e2: { Lun: "T", Mar: "T", Mié: "T", Jue: "M", Vie: "M", Sáb: "—", Dom: "T" }, // has overlap on Mié
  e3: { Lun: "C", Mar: "C", Mié: "C", Jue: "—", Vie: "C", Sáb: "C", Dom: "—" },
  e4: { Lun: "M", Mar: "M", Mié: "M", Jue: "M", Vie: "—", Sáb: "M", Dom: "M" },
  e5: { Lun: "—", Mar: "P", Mié: "T", Jue: "T", Vie: "T", Sáb: "T", Dom: "P" },
  e6: { Lun: "M", Mar: "—", Mié: "M", Jue: "M", Vie: "M", Sáb: "M", Dom: "—" },
};

const DEMANDA: Record<Dia, { demanda: number; cubierto: number }> = {
  Lun: { demanda: 50, cubierto: 60 },
  Mar: { demanda: 55, cubierto: 70 },
  Mié: { demanda: 80, cubierto: 75 }, // gap
  Jue: { demanda: 65, cubierto: 70 },
  Vie: { demanda: 95, cubierto: 90 },
  Sáb: { demanda: 100, cubierto: 100 },
  Dom: { demanda: 60, cubierto: 55 }, // gap
};

const AVISOS: AvisoItem[] = [
  { id: "a1", tipo: "solapamiento", texto: "Solapamiento: Lucía tiene 2 turnos el miércoles", dia: "Mié", empleadoId: "e2" },
  { id: "a2", tipo: "descanso",     texto: "Descanso legal insuficiente: Carlos tiene <12h entre turnos", dia: "Jue", empleadoId: "e3" },
  { id: "a3", tipo: "coste",        texto: "Coste sobre objetivo: +15% este miércoles", dia: "Mié" },
];

const FICHAJES_INIT: FichajeRecord[] = [
  { id: "f1", empleadoId: "e1", entrada: "14:32", salida: null,    horasMin: 248, metodo: "PIN",    geoloc: true,  estado: "activa"  },
  { id: "f2", empleadoId: "e2", entrada: "12:00", salida: "16:00", horasMin: 240, metodo: "QR",     geoloc: true,  estado: "cerrada" },
  { id: "f3", empleadoId: "e3", entrada: "13:00", salida: null,    horasMin: 220, metodo: "Huella", geoloc: true,  estado: "activa"  },
  { id: "f4", empleadoId: "e5", entrada: "12:30", salida: "16:30", horasMin: 240, metodo: "FaceID", geoloc: false, estado: "cerrada" },
  { id: "f5", empleadoId: "e4", entrada: "11:00", salida: "16:30", horasMin: 330, metodo: "PIN",    geoloc: false, estado: "cerrada" },
];

const COSTE_ROWS: CosteRow[] = [
  { empleadoId: "e1", horasHoy: 4.13, costeDia: 49.56, ratioPct: 14.5 },
  { empleadoId: "e2", horasHoy: 4.0,  costeDia: 50.00, ratioPct: 14.6 },
  { empleadoId: "e3", horasHoy: 3.66, costeDia: 58.56, ratioPct: 17.1 },
  { empleadoId: "e4", horasHoy: 5.5,  costeDia: 63.25, ratioPct: 18.5 },
  { empleadoId: "e5", horasHoy: 4.0,  costeDia: 44.00, ratioPct: 12.9 },
  { empleadoId: "e6", horasHoy: 5.5,  costeDia: 66.00, ratioPct: 19.3 },
];

const PLANTILLAS_CUADRANTE = [
  { id: "p1", label: "Semana estándar (M+T)", desc: "2 turnos / día · 6 empleados" },
  { id: "p2", label: "Fin de semana intenso", desc: "3 turnos / día · refuerzo Sáb-Dom" },
  { id: "p3", label: "Solo mediodía", desc: "1 turno / día · restaurante de mediodía" },
];

/* =========================================================
 * Helpers
 * =======================================================*/

function fmtEUR(n: number, decimals = 0): string {
  return n.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m.toString().padStart(2, "0")}m`;
}

function fmtHoras(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h${m.toString().padStart(2, "0")}m`;
}

/* =========================================================
 * Mock QR mini (decorative)
 * =======================================================*/

function MiniQR({ size = 48 }: { size?: number }) {
  const cells = 9;
  const cellSize = size / cells;
  let seed = 11;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return (
    <div className="rounded-md bg-white p-0.5 shrink-0" style={{ width: size, height: size }}>
      <svg width={size - 4} height={size - 4} viewBox={`0 0 ${size - 4} ${size - 4}`} className="block">
        {Array.from({ length: cells }).map((_, y) =>
          Array.from({ length: cells }).map((_, x) => {
            const isCorner =
              (x < 3 && y < 3) ||
              (x >= cells - 3 && y < 3) ||
              (x < 3 && y >= cells - 3);
            const on = isCorner ? true : rand() > 0.5;
            return on ? (
              <rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="black"
              />
            ) : null;
          })
        )}
      </svg>
    </div>
  );
}

/* =========================================================
 * Shared atoms
 * =======================================================*/

function DemoBadge() {
  return (
    <Badge variant="outline" className="border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider">
      demo
    </Badge>
  );
}

function SectionCard({
  title, desc, icon: Icon, action, children, className,
}: {
  title: string; desc?: string; icon: React.ElementType;
  action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("rp-glass rounded-2xl overflow-hidden flex flex-col min-w-0", className)}>
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-foreground/[0.05] text-[var(--gold)] shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg leading-tight truncate">{title}</h2>
            {desc && <p className="text-[11px] text-muted-foreground truncate">{desc}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4 flex-1 min-w-0">{children}</div>
    </section>
  );
}

function EmpleadoAvatar({ e, size = "default" }: { e: Empleado; size?: "default" | "sm" }) {
  const color = COLOR_META[e.color];
  const sz = size === "sm" ? "h-7 w-7 text-[10px]" : "h-10 w-10 text-xs";
  return (
    <Avatar className={cn(sz, "border", color.border, color.bg, color.text)}>
      <AvatarFallback className={cn("bg-transparent font-mono font-medium", color.text)}>
        {e.iniciales}
      </AvatarFallback>
    </Avatar>
  );
}

/* =========================================================
 * Empleados tab
 * =======================================================*/

function EmpleadosTab() {
  const { toast } = useToast();
  const [employees, setEmployees] = React.useState<Empleado[]>(EMPLEADOS);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [fichaEmpleado, setFichaEmpleado] = React.useState<Empleado | null>(null);

  function handleInvite(data: { nombre: string; email: string; cargo: string; rol: Rol; pin: string }) {
    const iniciales = data.nombre
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const newEmp: Empleado = {
      id: `e${Date.now()}`,
      nombre: data.nombre,
      iniciales,
      rol: data.rol,
      cargo: data.cargo,
      email: data.email,
      usuario: data.email.split("@")[0],
      pin: data.pin,
      color: ["gold", "teal", "violet", "rose", "emerald", "amber"][employees.length % 6] as Empleado["color"],
      permisos: ["TPV"],
      nfcEnabled: false,
      costeHora: 12.0,
      avatarHue: (employees.length * 47) % 360,
    };
    setEmployees((prev) => [...prev, newEmp]);
    setInviteOpen(false);
    toast({
      title: "Invitación enviada",
      description: `${data.nombre} recibirá acceso en ${data.email}.`,
    });
  }

  function handleToggleNfc(emp: Empleado) {
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, nfcEnabled: !e.nfcEnabled } : e))
    );
    toast({
      title: emp.nfcEnabled ? "NFC desactivado" : "NFC activado",
      description: `${emp.nombre}: fichaje por NFC ${emp.nfcEnabled ? "off" : "on"}.`,
    });
  }

  return (
    <div className="space-y-5">
      <SectionCard
        title="Plantilla"
        desc={`${employees.length} empleados · ${employees.filter((e) => e.nfcEnabled).length} con NFC`}
        icon={Users}
        action={
          <Button onClick={() => setInviteOpen(true)} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] h-9">
            <Plus className="size-4 mr-1.5" /> Invitar empleado
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {employees.map((e) => {
            const rolMeta = ROL_META[e.rol];
            const color = COLOR_META[e.color];
            const RolIcon = rolMeta.icon;
            return (
              <div
                key={e.id}
                className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3.5 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <EmpleadoAvatar e={e} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm leading-tight truncate">{e.nombre}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                      <RolIcon className="size-3" />
                      <span className="truncate">{e.cargo}</span>
                    </div>
                  </div>
                  <MiniQR size={42} />
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 rounded-md bg-foreground/[0.03] px-2 py-1">
                    <KeyRound className="size-3 text-muted-foreground" />
                    <span className="text-muted-foreground">PIN</span>
                    <span className="font-mono ml-auto">****</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md bg-foreground/[0.03] px-2 py-1">
                    <Fingerprint className={cn("size-3", e.nfcEnabled ? "text-[var(--teal)]" : "text-muted-foreground")} />
                    <span className="text-muted-foreground">NFC</span>
                    <span className={cn("ml-auto", e.nfcEnabled ? "text-[var(--teal)]" : "text-muted-foreground")}>
                      {e.nfcEnabled ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {e.permisos.map((p) => (
                    <Badge key={p} variant="outline" className={cn("text-[9px] px-1.5 py-0", color.border, color.text)}>
                      {p}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="border-border/40 text-[9px] px-1.5 py-0 text-muted-foreground">
                    @{e.usuario}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 pt-1 border-t border-border/30">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] flex-1"
                    onClick={() => setFichaEmpleado(e)}
                  >
                    <Eye className="size-3 mr-1" /> Ver ficha
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] px-2"
                    onClick={() => handleToggleNfc(e)}
                  >
                    <Fingerprint className="size-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} onSubmit={handleInvite} />
      <FichaDialog
        empleado={fichaEmpleado}
        onOpenChange={(o) => !o && setFichaEmpleado(null)}
        onToggleNfc={handleToggleNfc}
      />
    </div>
  );
}

/* =========================================================
 * Invite dialog
 * =======================================================*/

interface InviteForm {
  nombre: string;
  email: string;
  cargo: string;
  rol: Rol;
  pin: string;
}

function InviteDialog({
  open, onOpenChange, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: InviteForm) => void;
}) {
  const [form, setForm] = React.useState<InviteForm>({
    nombre: "",
    email: "",
    cargo: "",
    rol: "camarero",
    pin: "",
  });

  React.useEffect(() => {
    if (!open) {
      setForm({ nombre: "", email: "", cargo: "", rol: "camarero", pin: "" });
    }
  }, [open]);

  function handleSubmit() {
    onSubmit(form);
  }

  const valid = form.nombre.trim() && /\S+@\S+\.\S+/.test(form.email) && form.cargo.trim() && form.pin.length === 4;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong border-border/60 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-4 text-[var(--gold-soft)]" /> Invitar empleado
          </DialogTitle>
          <DialogDescription>
            Le llegará un email con su código de acceso y PIN de fichaje.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label className="text-[11px] text-muted-foreground">Nombre completo</Label>
            <Input
              value={form.nombre}
              onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Ana Martínez"
              className="mt-1 h-9"
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Email</Label>
            <Input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="ana@resto.com"
              type="email"
              className="mt-1 h-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] text-muted-foreground">Cargo</Label>
              <Input
                value={form.cargo}
                onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))}
                placeholder="Camarera"
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Rol</Label>
              <Select
                value={form.rol}
                onValueChange={(v) => setForm((p) => ({ ...p, rol: v as Rol }))}
              >
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue placeholder="Rol…" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROL_META) as Rol[]).map((r) => (
                    <SelectItem key={r} value={r}>{ROL_META[r].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">PIN (4 dígitos)</Label>
            <Input
              value={form.pin}
              onChange={(e) => setForm((p) => ({ ...p, pin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
              placeholder="1234"
              inputMode="numeric"
              maxLength={4}
              className="mt-1 h-9 font-mono tracking-widest"
            />
          </div>
          <div className="rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-2 text-[11px] text-[var(--teal)] flex items-start gap-1.5">
            <ShieldCheck className="size-3.5 shrink-0 mt-0.5" />
            <span>El PIN se cifra en servidor. El empleado podrá cambiarlo en su primer acceso.</span>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancelar</Button>
          </DialogClose>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!valid}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          >
            <Send className="size-3.5 mr-1.5" /> Enviar invitación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Ficha dialog (full profile + QR + NFC toggle)
 * =======================================================*/

function FichaDialog({
  empleado, onOpenChange, onToggleNfc,
}: {
  empleado: Empleado | null;
  onOpenChange: (o: boolean) => void;
  onToggleNfc: (e: Empleado) => void;
}) {
  if (!empleado) return null;
  const rolMeta = ROL_META[empleado.rol];
  const RolIcon = rolMeta.icon;
  const color = COLOR_META[empleado.color];

  return (
    <Dialog open={!!empleado} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong border-border/60 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-4 text-[var(--gold-soft)]" /> Ficha de empleado
          </DialogTitle>
          <DialogDescription>
            Información completa, código QR de acceso y configuración NFC.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-start gap-4">
            <EmpleadoAvatar e={empleado} />
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg leading-tight">{empleado.nombre}</div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <RolIcon className="size-3.5" /> {empleado.cargo}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono mt-1">@{empleado.usuario}</div>
            </div>
            <MiniQR size={72} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-mono">Email</div>
              <div className="truncate">{empleado.email}</div>
            </div>
            <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-mono">PIN</div>
              <div className="font-mono tracking-widest">****</div>
            </div>
            <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-mono">Coste/hora</div>
              <div className="font-mono">{fmtEUR(empleado.costeHora, 2)}</div>
            </div>
            <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-mono">Rol</div>
              <div>{rolMeta.label}</div>
            </div>
          </div>

          <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-mono mb-1">Permisos</div>
            <div className="flex flex-wrap gap-1">
              {empleado.permisos.map((p) => (
                <Badge key={p} variant="outline" className={cn("text-[10px] px-1.5 py-0", color.border, color.text)}>
                  {p}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-foreground/[0.02] p-2.5">
            <div className="flex items-center gap-2">
              <Fingerprint className={cn("size-4", empleado.nfcEnabled ? "text-[var(--teal)]" : "text-muted-foreground")} />
              <div>
                <div className="text-xs font-medium">Fichaje por NFC</div>
                <div className="text-[11px] text-muted-foreground">El empleado ficha acercando el móvil al lector</div>
              </div>
            </div>
            <Switch checked={empleado.nfcEnabled} onCheckedChange={() => onToggleNfc(empleado)} />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cerrar</Button>
          </DialogClose>
          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          >
            <CheckCircle2 className="size-3.5 mr-1.5" /> Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Cuadrante tab
 * =======================================================*/

function CuadranteTab() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [cuadrante, setCuadrante] = React.useState<Record<string, Record<Dia, TurnoCode>>>(
    () => JSON.parse(JSON.stringify(CUADRANTE_INIT))
  );
  const [vista, setVista] = React.useState<VistaCuadrante>("semanal");
  const [selectedCell, setSelectedCell] = React.useState<{ empId: string; dia: Dia } | null>(null);
  const [editTurno, setEditTurno] = React.useState<{ empId: string; dia: Dia; code: TurnoCode } | null>(null);
  const [plantillaOpen, setPlantillaOpen] = React.useState(false);

  function setTurno(empId: string, dia: Dia, code: TurnoCode) {
    setCuadrante((prev) => ({
      ...prev,
      [empId]: { ...prev[empId], [dia]: code },
    }));
  }

  function handleApplyPlantilla(id: string) {
    setPlantillaOpen(false);
    // Apply a mock plantilla that uses M+T pattern
    const nueva: Record<string, Record<Dia, TurnoCode>> = {};
    EMPLEADOS.forEach((e, i) => {
      nueva[e.id] = {
        Lun: i % 2 === 0 ? "M" : "T",
        Mar: i % 2 === 0 ? "T" : "M",
        Mié: i % 2 === 0 ? "M" : "T",
        Jue: i % 2 === 0 ? "T" : "M",
        Vie: i % 2 === 0 ? "M" : "T",
        Sáb: i % 2 === 0 ? "T" : "M",
        Dom: "—",
      };
    });
    setCuadrante(nueva);
    toast({
      title: "Plantilla aplicada",
      description: `Cuadrante regenerado con la plantilla «${PLANTILLAS_CUADRANTE.find((p) => p.id === id)?.label}».`,
    });
  }

  function handleEditAction(action: "delete" | "traspasar") {
    if (!editTurno) return;
    const emp = EMPLEADOS.find((e) => e.id === editTurno.empId)!;
    if (action === "delete") {
      setTurno(editTurno.empId, editTurno.dia, "—");
      toast({
        title: "Turno eliminado",
        description: `${emp.nombre} · ${editTurno.dia}: turno borrado.`,
      });
    } else {
      toast({
        title: "Traspaso de turno",
        description: `Selecciona otro empleado para traspasar el turno de ${emp.nombre} (${editTurno.dia}).`,
      });
    }
    setEditTurno(null);
  }

  return (
    <div className="space-y-5">
      <SectionCard
        title="Cuadrante semanal"
        desc="Arrastra turnos · click celda vacía para asignar"
        icon={CalendarDays}
        action={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex rounded-md border border-border/40 bg-foreground/[0.04] p-0.5">
              {(["diaria", "semanal", "mensual"] as VistaCuadrante[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVista(v)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] rounded transition-colors capitalize",
                    vista === v
                      ? "bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setPlantillaOpen(true)} className="h-8">
              <Layers className="size-3.5 mr-1" /> Plantilla
            </Button>
          </div>
        }
      >
        {/* Mobile vista selector */}
        <div className="sm:hidden mb-3 flex rounded-md border border-border/40 bg-foreground/[0.04] p-0.5">
          {(["diaria", "semanal", "mensual"] as VistaCuadrante[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVista(v)}
              className={cn(
                "flex-1 px-2.5 py-1 text-[11px] rounded transition-colors capitalize",
                vista === v ? "bg-[var(--gold)]/15 text-[var(--gold-soft)]" : "text-muted-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Coverage bar */}
        <div className="mb-4 rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Cobertura por día</span>
            <span className="text-[10px] text-muted-foreground font-mono">Demanda vs Cubierto</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {DIAS.map((d) => {
              const dm = DEMANDA[d];
              const gap = dm.cubierto - dm.demanda;
              const hasGap = gap < 0;
              return (
                <div key={d} className="text-center">
                  <div className="text-[10px] text-muted-foreground font-mono mb-1">{d}</div>
                  <div className="relative h-16 rounded-md bg-foreground/[0.04] overflow-hidden">
                    <motion.div
                      initial={reduce ? false : { height: 0 }}
                      animate={{ height: `${dm.demanda}%` }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-0 right-0 bg-foreground/15"
                    />
                    <motion.div
                      initial={reduce ? false : { height: 0 }}
                      animate={{ height: `${dm.cubierto}%` }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className={cn(
                        "absolute bottom-0 left-0 right-0",
                        hasGap ? "bg-rose-500/40" : "bg-[var(--teal)]/50"
                      )}
                    />
                  </div>
                  <div className="text-[10px] mt-1 leading-tight">
                    <span className="text-muted-foreground">{dm.demanda}%</span>
                    <span className="mx-0.5">·</span>
                    <span className={hasGap ? "text-rose-300" : "text-[var(--teal)]"}>{dm.cubierto}%</span>
                  </div>
                  {hasGap && (
                    <div className="text-[9px] text-rose-300 font-mono">{gap}%</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cuadrante grid */}
        <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
          <div className="min-w-[680px]">
            {/* Header */}
            <div className="grid grid-cols-[140px_repeat(7,1fr)] gap-1 mb-1">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono px-2 py-1">
                Empleado
              </div>
              {DIAS.map((d) => (
                <div key={d} className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono px-2 py-1 text-center">
                  {d}
                </div>
              ))}
            </div>
            {/* Rows */}
            {EMPLEADOS.map((e) => (
              <div key={e.id} className="grid grid-cols-[140px_repeat(7,1fr)] gap-1 mb-1">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground/[0.02] min-w-0">
                  <EmpleadoAvatar e={e} size="sm" />
                  <span className="text-xs truncate">{e.nombre.split(" ")[0]}</span>
                </div>
                {DIAS.map((d) => {
                  const code = cuadrante[e.id]?.[d] ?? "—";
                  const t = TURNOS_DEF[code];
                  return (
                    <CuadranteCell
                      key={d}
                      code={code}
                      tone={t.tone}
                      label={t.label}
                      hora={t.hora}
                      onClick={() => setSelectedCell({ empId: e.id, dia: d })}
                      onEdit={() => setEditTurno({ empId: e.id, dia: d, code })}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Leyenda */}
        <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
          {(["M", "T", "P", "C"] as TurnoCode[]).map((c) => {
            const t = TURNOS_DEF[c];
            return (
              <div key={c} className={cn("rounded-md border px-2 py-0.5 flex items-center gap-1", t.tone)}>
                <span className="font-mono font-bold">{c}</span>
                <span>{t.label}</span>
                <span className="opacity-70">· {t.hora}</span>
              </div>
            );
          })}
          <div className={cn("rounded-md border px-2 py-0.5 flex items-center gap-1", TURNOS_DEF["—"].tone)}>
            <span className="font-mono font-bold">—</span>
            <span>Libre</span>
          </div>
        </div>

        {/* Avisos */}
        <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/[0.05] p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="size-3.5 text-amber-300" />
            <span className="text-xs font-medium text-amber-300">Avisos legales y operativos</span>
          </div>
          <ul className="space-y-1">
            {AVISOS.map((a) => (
              <li key={a.id} className="text-xs text-amber-200/90 flex items-start gap-1.5">
                <span className="text-amber-300 mt-0.5">⚠</span>
                <span>{a.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>

      {/* Asignar turno dialog */}
      <AssignTurnoDialog
        cell={selectedCell}
        onOpenChange={(o) => !o && setSelectedCell(null)}
        onAssign={(code) => {
          if (!selectedCell) return;
          setTurno(selectedCell.empId, selectedCell.dia, code);
          const emp = EMPLEADOS.find((e) => e.id === selectedCell.empId)!;
          toast({
            title: "Turno asignado",
            description: `${emp.nombre} · ${selectedCell.dia}: ${TURNOS_DEF[code].label} (${TURNOS_DEF[code].hora}).`,
          });
          setSelectedCell(null);
        }}
      />

      {/* Edit turno dialog */}
      <EditTurnoDialog
        cell={editTurno}
        onOpenChange={(o) => !o && setEditTurno(null)}
        onAction={handleEditAction}
      />

      {/* Plantilla dialog */}
      <PlantillaDialog
        open={plantillaOpen}
        onOpenChange={setPlantillaOpen}
        onApply={handleApplyPlantilla}
      />
    </div>
  );
}

function CuadranteCell({
  code, tone, label, hora, onClick, onEdit,
}: {
  code: TurnoCode;
  tone: string;
  label: string;
  hora: string;
  onClick: () => void;
  onEdit: () => void;
}) {
  const isLibre = code === "—";
  return (
    <button
      type="button"
      onClick={onEdit}
      onDoubleClick={onClick}
      draggable={!isLibre}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", code);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "min-h-[44px] rounded-md border px-1.5 py-1 text-left transition-all cursor-pointer",
        tone,
        !isLibre && "hover:brightness-110 hover:scale-[1.02]"
      )}
      title={`${label} · ${hora}`}
    >
      <div className="flex items-center gap-1">
        <span className="font-mono text-[11px] font-bold">{code}</span>
        {!isLibre && <span className="text-[9px] opacity-70 truncate">{hora}</span>}
      </div>
      {!isLibre && <div className="text-[9px] opacity-80 truncate hidden sm:block">{label}</div>}
    </button>
  );
}

function AssignTurnoDialog({
  cell, onOpenChange, onAssign,
}: {
  cell: { empId: string; dia: Dia } | null;
  onOpenChange: (o: boolean) => void;
  onAssign: (code: TurnoCode) => void;
}) {
  if (!cell) return null;
  const emp = EMPLEADOS.find((e) => e.id === cell.empId);
  return (
    <Dialog open={!!cell} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong border-border/60 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Asignar turno · {emp?.nombre.split(" ")[0]} · {cell.dia}</DialogTitle>
          <DialogDescription>Elige el turno que quieres asignar.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 py-2">
          {(["M", "T", "P", "C"] as TurnoCode[]).map((c) => {
            const t = TURNOS_DEF[c];
            return (
              <button
                key={c}
                type="button"
                onClick={() => onAssign(c)}
                className={cn("rounded-lg border p-2.5 text-left transition-all hover:scale-[1.02]", t.tone)}
              >
                <div className="font-mono font-bold text-sm">{c}</div>
                <div className="text-[11px]">{t.label}</div>
                <div className="text-[10px] opacity-70">{t.hora}</div>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onAssign("—")}
            className={cn("rounded-lg border p-2.5 text-left transition-all hover:scale-[1.02] col-span-2", TURNOS_DEF["—"].tone)}
          >
            <div className="font-mono font-bold text-sm">—</div>
            <div className="text-[11px]">Libre / Descanso</div>
          </button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditTurnoDialog({
  cell, onOpenChange, onAction,
}: {
  cell: { empId: string; dia: Dia; code: TurnoCode } | null;
  onOpenChange: (o: boolean) => void;
  onAction: (action: "delete" | "traspasar") => void;
}) {
  if (!cell) return null;
  const emp = EMPLEADOS.find((e) => e.id === cell.empId);
  const t = TURNOS_DEF[cell.code];
  return (
    <Dialog open={!!cell} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong border-border/60 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{emp?.nombre.split(" ")[0]} · {cell.dia}</DialogTitle>
          <DialogDescription>
            Turno actual: <strong className="text-foreground">{t.label}</strong> ({t.hora})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Button variant="outline" className="w-full justify-start h-9" onClick={() => onAction("traspasar")}>
            <ArrowRightLeft className="size-3.5 mr-2" /> Traspasar a otro empleado
          </Button>
          <Button variant="outline" className="w-full justify-start h-9" onClick={() => onAction("delete")}>
            <Trash2 className="size-3.5 mr-2 text-rose-300" />
            <span className="text-rose-300">Eliminar turno</span>
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="sm">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlantillaDialog({
  open, onOpenChange, onApply,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onApply: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong border-border/60 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="size-4 text-[var(--gold-soft)]" /> Aplicar plantilla semanal
          </DialogTitle>
          <DialogDescription>
            Sustituye el cuadrante actual por una plantilla predefinida.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {PLANTILLAS_CUADRANTE.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onApply(p.id)}
              className="w-full flex items-center gap-2 rounded-lg border border-border/40 bg-foreground/[0.02] p-3 text-left hover:bg-foreground/[0.05] transition-colors"
            >
              <Layers className="size-4 text-[var(--gold-soft)]" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-[11px] text-muted-foreground">{p.desc}</div>
              </div>
              <ArrowRight className="size-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Fichaje tab
 * =======================================================*/

type MetodoFichaje = "PIN" | "QR" | "FaceID" | "Huella";

function FichajeTab() {
  const { toast } = useToast();
  const [fichajes, setFichajes] = React.useState<FichajeRecord[]>(FICHAJES_INIT);
  const [metodo, setMetodo] = React.useState<MetodoFichaje>("PIN");
  const [pinInput, setPinInput] = React.useState("");
  const [geoActive, setGeoActive] = React.useState(true);

  const activos = fichajes.filter((f) => f.estado === "activa");
  const activoPrincipal = activos[0];
  const empPrincipal = activoPrincipal ? EMPLEADOS.find((e) => e.id === activoPrincipal.empleadoId) : null;

  function registrarFichaje(modo: "entrada" | "salida") {
    // For demo: lookup by PIN if PIN method, else use first employee
    let emp: Empleado | undefined;
    if (metodo === "PIN") {
      if (pinInput.length !== 4) {
        toast({ title: "PIN incompleto", description: "Introduce 4 dígitos.", variant: "destructive" });
        return;
      }
      emp = EMPLEADOS.find((e) => e.pin === pinInput);
      if (!emp) {
        toast({ title: "PIN incorrecto", description: "No se reconoce el PIN.", variant: "destructive" });
        return;
      }
    } else {
      // Mock: pick first active (or first employee) for non-PIN methods
      emp = modo === "entrada" ? EMPLEADOS[3] : activoPrincipal ? EMPLEADOS.find((e) => e.id === activoPrincipal.empleadoId) : undefined;
      if (!emp) {
        toast({ title: "Sin sesión activa", description: "No hay ningún fichaje activo.", variant: "destructive" });
        return;
      }
    }

    const ahora = new Date();
    const hh = ahora.getHours().toString().padStart(2, "0");
    const mm = ahora.getMinutes().toString().padStart(2, "0");
    const hora = `${hh}:${mm}`;

    if (modo === "entrada") {
      const yaActivo = fichajes.some((f) => f.empleadoId === emp!.id && f.estado === "activa");
      if (yaActivo) {
        toast({ title: "Ya fichado", description: `${emp!.nombre} ya tiene sesión activa.`, variant: "destructive" });
        return;
      }
      const nuevo: FichajeRecord = {
        id: `f${Date.now()}`,
        empleadoId: emp.id,
        entrada: hora,
        salida: null,
        horasMin: 0,
        metodo,
        geoloc: geoActive,
        estado: "activa",
      };
      setFichajes((prev) => [nuevo, ...prev]);
      toast({
        title: "Entrada registrada",
        description: `${emp.nombre} · ${hora} · ${metodo}${geoActive ? " · geolocalizado" : ""}.`,
      });
    } else {
      const target = fichajes.find((f) => f.empleadoId === emp!.id && f.estado === "activa");
      if (!target) {
        toast({ title: "Sin sesión activa", description: `${emp!.nombre} no tiene fichaje activo.`, variant: "destructive" });
        return;
      }
      const [eh, em] = target.entrada.split(":").map((x) => parseInt(x, 10));
      const inicio = new Date();
      inicio.setHours(eh, em, 0, 0);
      const horasMin = Math.max(0, Math.round((ahora.getTime() - inicio.getTime()) / 60000));
      setFichajes((prev) =>
        prev.map((f) => (f.id === target.id ? { ...f, salida: hora, horasMin, estado: "cerrada" } : f))
      );
      toast({
        title: "Salida registrada",
        description: `${emp.nombre} · ${hora} · ${fmtMin(horasMin)}.`,
      });
    }
    setPinInput("");
  }

  return (
    <div className="space-y-5">
      {/* Current status */}
      <SectionCard
        title="Estado actual"
        desc="Quién está fichado y desde cuándo"
        icon={Clock}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
          <div className="flex items-center gap-3">
            {empPrincipal ? (
              <EmpleadoAvatar e={empPrincipal} />
            ) : (
              <div className="grid size-10 place-items-center rounded-full border border-border/40 bg-foreground/[0.03] text-muted-foreground">
                <Clock className="size-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-medium leading-tight">
                {empPrincipal ? empPrincipal.nombre : "Sin sesiones activas"}
              </div>
              {activoPrincipal && (
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  Fichada {activoPrincipal.entrada} · {fmtMin(activoPrincipal.horasMin)} hoy · {activoPrincipal.metodo}
                </div>
              )}
            </div>
            <Badge variant="outline" className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px] ml-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              {activos.length} activos
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className={cn("size-3.5", geoActive ? "text-[var(--teal)]" : "text-muted-foreground")} />
            <span>Geolocalización</span>
            <Switch checked={geoActive} onCheckedChange={setGeoActive} />
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5 items-start">
        {/* Fichar panel */}
        <SectionCard
          title="Fichar entrada / salida"
          desc="Selecciona método e introduce tu PIN o acredítate"
          icon={KeyRound}
        >
          <div className="space-y-4">
            {/* Métodos */}
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { id: "PIN", label: "PIN", icon: KeyRound },
                { id: "QR", label: "QR", icon: QrCode },
                { id: "FaceID", label: "FaceID", icon: ScanFace },
                { id: "Huella", label: "Huella", icon: Fingerprint },
              ] as { id: MetodoFichaje; label: string; icon: React.ElementType }[]).map((m) => {
                const Icon = m.icon;
                const active = metodo === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetodo(m.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2.5 rounded-lg border transition-all",
                      active
                        ? "bg-[var(--gold)]/10 border-[var(--gold)]/40 text-[var(--gold-soft)]"
                        : "bg-foreground/[0.02] border-border/40 text-muted-foreground hover:bg-foreground/[0.05]"
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="text-[10px] font-mono">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* PIN pad */}
            {metodo === "PIN" && (
              <div className="space-y-3">
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-12 w-12 rounded-lg border-2 grid place-items-center font-mono text-xl",
                        pinInput.length > i
                          ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                          : "border-border/40 bg-foreground/[0.02] text-muted-foreground"
                      )}
                    >
                      {pinInput.length > i ? "•" : ""}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5 max-w-[260px] mx-auto">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        if (k === "C") setPinInput("");
                        else if (k === "⌫") setPinInput((p) => p.slice(0, -1));
                        else setPinInput((p) => (p.length < 4 ? p + k : p));
                      }}
                      className={cn(
                        "h-11 rounded-lg border text-sm font-mono transition-colors",
                        k === "C" || k === "⌫"
                          ? "border-border/40 bg-foreground/[0.02] text-muted-foreground hover:bg-foreground/[0.05]"
                          : "border-border/40 bg-foreground/[0.03] hover:bg-foreground/[0.06]"
                      )}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {metodo !== "PIN" && (
              <div className="rounded-xl border border-dashed border-border/60 p-6 flex flex-col items-center gap-2 text-center">
                {metodo === "QR" && <QrCode className="size-10 text-[var(--gold-soft)]" />}
                {metodo === "FaceID" && <ScanFace className="size-10 text-[var(--gold-soft)]" />}
                {metodo === "Huella" && <Fingerprint className="size-10 text-[var(--gold-soft)]" />}
                <div className="text-sm font-medium">
                  {metodo === "QR" && "Escanea tu QR personal"}
                  {metodo === "FaceID" && "Mira a la cámara del TPV"}
                  {metodo === "Huella" && "Apoya el dedo en el lector"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Demo: el fichaje se simulará con el primer empleado disponible.
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-2">
              <Button
                onClick={() => registrarFichaje("entrada")}
                className="flex-1 bg-emerald-500/90 hover:bg-emerald-500 text-white h-11"
              >
                <Play className="size-4 mr-1.5" /> Fichar entrada
              </Button>
              <Button
                onClick={() => registrarFichaje("salida")}
                variant="outline"
                className="flex-1 h-11"
              >
                <Pause className="size-4 mr-1.5" /> Fichar salida
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* Today's fichajes list */}
        <SectionCard
          title="Fichajes de hoy"
          desc={`${fichajes.length} registros · ${activos.length} activos`}
          icon={FileText}
        >
          <ul className="space-y-1.5 max-h-[380px] overflow-y-auto rp-scroll-thin">
            {fichajes.map((f) => {
              const emp = EMPLEADOS.find((e) => e.id === f.empleadoId);
              if (!emp) return null;
              return (
                <li
                  key={f.id}
                  className="flex items-center gap-2.5 rounded-md border border-border/40 bg-foreground/[0.02] p-2"
                >
                  <EmpleadoAvatar e={emp} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{emp.nombre}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {f.entrada} → {f.salida ?? "—"} · {f.metodo}
                      {f.geoloc && <MapPin className="size-2.5 inline ml-1 text-[var(--teal)]" />}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {f.estado === "activa" ? (
                      <Badge variant="outline" className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[9px]">
                        <span className="h-1 w-1 rounded-full bg-emerald-400 mr-1 animate-pulse" /> activa
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-mono">{fmtMin(f.horasMin)}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>

      {/* Cumplimiento */}
      <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-3 flex flex-col sm:flex-row sm:items-center gap-2.5 text-[11px]">
        <ShieldCheck className="size-4 text-[var(--teal)] shrink-0" />
        <div className="flex-1 leading-snug">
          <strong className="text-[var(--teal)]">Cumplimiento legal:</strong> Registro conservable 4 años · Exportable a inspección.
          Cumple RD 8/2019 de registro de jornada y convenio aplicable.
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-[var(--teal)]/40 text-[var(--teal)] hover:bg-[var(--teal)]/10"
          onClick={() => toast({ title: "Export iniciado", description: "Generando PDF de registro de jornada…" })}
        >
          <FileText className="size-3.5 mr-1" /> Exportar a inspección
        </Button>
      </div>

      {/* Geolocation map mock */}
      {geoActive && (
        <SectionCard
          title="Geolocalización"
          desc="Verifica que el fichaje se hace desde el local"
          icon={MapPin}
        >
          <div className="relative h-48 rounded-xl border border-border/40 bg-foreground/[0.02] overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(to right, var(--border) 1px, transparent 1px),
                  linear-gradient(to bottom, var(--border) 1px, transparent 1px)
                `,
                backgroundSize: "32px 32px",
              }}
            />
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-1">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-[var(--gold)]/30 animate-ping" />
                  <div className="relative grid size-8 place-items-center rounded-full bg-[var(--gold)] text-black">
                    <MapPin className="size-4" />
                  </div>
                </div>
                <div className="mt-2 text-xs font-mono text-[var(--gold-soft)]">RestoPanel Madrid · 40.4168° N, 3.7038° W</div>
                <div className="text-[10px] text-muted-foreground">Radio permitido: 50m · Precisión GPS: 8m</div>
              </div>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* =========================================================
 * Coste tab
 * =======================================================*/

type RepartoTipo = "horas" | "rol" | "ventas";

function CosteTab() {
  const { toast } = useToast();
  const totalHoy = COSTE_ROWS.reduce((acc, r) => acc + r.costeDia, 0);
  const ratioTotal = 28; // %
  const horasExtraSemana = 6.5;
  const costeExtraSemana = 120;
  const propinasTotal = 180;

  const [reparto, setReparto] = React.useState<RepartoTipo>("horas");

  function handleDistribute() {
    toast({
      title: "Propinas distribuidas",
      description: `${fmtEUR(propinasTotal)} repartidos por ${reparto} entre ${EMPLEADOS.length} empleados.`,
    });
  }

  function handleExport() {
    toast({
      title: "Export iniciado",
      description: "Generando Excel de coste personal semanal…",
    });
  }

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rp-glass rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            <Euro className="size-3 text-[var(--gold-soft)]" /> Coste hoy
          </div>
          <div className="font-display text-2xl text-[var(--gold-soft)] tabular-nums leading-tight">
            {fmtEUR(totalHoy)}
          </div>
          <div className="text-[11px] text-muted-foreground">{EMPLEADOS.length} empleados activos</div>
        </div>
        <div className="rp-glass rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            <Percent className="size-3 text-[var(--teal)]" /> Ratio coste/ventas
          </div>
          <div className="font-display text-2xl text-[var(--teal)] tabular-nums leading-tight">{ratioTotal}%</div>
          <div className="text-[11px] text-muted-foreground">Objetivo: ≤30%</div>
        </div>
        <div className="rp-glass rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            <Timer className="size-3 text-amber-300" /> Horas extra (sem.)
          </div>
          <div className="font-display text-2xl text-amber-300 tabular-nums leading-tight">{horasExtraSemana}h</div>
          <div className="text-[11px] text-muted-foreground">+{fmtEUR(costeExtraSemana)}</div>
        </div>
        <div className="rp-glass rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            <Coins className="size-3 text-emerald-300" /> Propinas hoy
          </div>
          <div className="font-display text-2xl text-emerald-300 tabular-nums leading-tight">{fmtEUR(propinasTotal)}</div>
          <div className="text-[11px] text-muted-foreground">Pendiente de repartir</div>
        </div>
      </div>

      {/* Per employee coste */}
      <SectionCard
        title="Coste personal en vivo"
        desc="Horas trabajadas hoy y coste del día por empleado"
        icon={Euro}
        action={
          <Button variant="outline" size="sm" onClick={handleExport} className="h-8">
            <FileText className="size-3.5 mr-1" /> Exportar
          </Button>
        }
      >
        <div className="rounded-xl border border-border/40 overflow-hidden">
          <div className="overflow-x-auto rp-scroll-thin">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/40 bg-foreground/[0.02]">
                  <th className="px-3 py-2.5 font-mono">Empleado</th>
                  <th className="px-3 py-2.5 font-mono text-right">Horas hoy</th>
                  <th className="px-3 py-2.5 font-mono text-right">Coste/h</th>
                  <th className="px-3 py-2.5 font-mono text-right">Coste día</th>
                  <th className="px-3 py-2.5 font-mono text-right">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {COSTE_ROWS.map((r) => {
                  const emp = EMPLEADOS.find((e) => e.id === r.empleadoId);
                  if (!emp) return null;
                  return (
                    <tr key={r.empleadoId} className="border-b border-border/20 last:border-0 hover:bg-foreground/[0.02]">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <EmpleadoAvatar e={emp} size="sm" />
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{emp.nombre}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{emp.cargo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{fmtHoras(r.horasHoy)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{fmtEUR(emp.costeHora, 2)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-medium">{fmtEUR(r.costeDia, 2)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={cn(
                          "tabular-nums font-mono text-xs",
                          r.ratioPct > 18 ? "text-rose-300" : r.ratioPct > 15 ? "text-amber-300" : "text-emerald-300"
                        )}>
                          {r.ratioPct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border/60 bg-foreground/[0.03]">
                  <td className="px-3 py-2.5 text-xs font-medium">Total</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-mono text-xs">
                    {fmtHoras(COSTE_ROWS.reduce((a, r) => a + r.horasHoy, 0))}
                  </td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground">—</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-display font-medium text-[var(--gold-soft)]">
                    {fmtEUR(totalHoy, 2)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-mono text-xs">{ratioTotal}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/[0.06] p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300 mb-1">
              <Timer className="size-3.5" /> Horas extra (semana)
            </div>
            <div className="font-display text-xl text-amber-300 tabular-nums">
              {horasExtraSemana}h <span className="text-xs">· +{fmtEUR(costeExtraSemana)}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Umbral convenio: 8h/semana · actualmente {((horasExtraSemana / 8) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/[0.06] p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-300 mb-1">
              <TrendingUp className="size-3.5" /> Proyección semanal
            </div>
            <div className="font-display text-xl text-emerald-300 tabular-nums">
              {fmtEUR(totalHoy * 7)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              A este ritmo: {fmtEUR(totalHoy * 30)} / mes
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Reparto de propinas */}
      <SectionCard
        title="Reparto de propinas"
        desc={`Total acumulado hoy: ${fmtEUR(propinasTotal)}`}
        icon={Coins}
      >
        <div className="space-y-3">
          <RadioGroup
            value={reparto}
            onValueChange={(v) => setReparto(v as RepartoTipo)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          >
            {[
              { id: "horas" as const, label: "Por horas", desc: "Reparto proporcional a horas trabajadas", icon: Timer },
              { id: "rol" as const, label: "Por rol", desc: "Pesos por rol (sala 50%, cocina 30%, barra 20%)", icon: Users },
              { id: "ventas" as const, label: "Por ventas", desc: "Reparto proporcional a ventas generadas", icon: TrendingUp },
            ].map((opt) => {
              const Icon = opt.icon;
              const active = reparto === opt.id;
              return (
                <label
                  key={opt.id}
                  className={cn(
                    "rounded-xl border p-3 cursor-pointer transition-all flex items-start gap-2",
                    active
                      ? "border-[var(--gold)]/50 bg-[var(--gold)]/[0.06]"
                      : "border-border/40 bg-foreground/[0.02] hover:bg-foreground/[0.05]"
                  )}
                >
                  <RadioGroupItem value={opt.id} id={`rep-${opt.id}`} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className={cn("flex items-center gap-1.5 text-sm font-medium", active && "text-[var(--gold-soft)]")}>
                      <Icon className="size-3.5" /> {opt.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{opt.desc}</div>
                  </div>
                </label>
              );
            })}
          </RadioGroup>

          {/* Distribución preview */}
          <div className="rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Vista previa del reparto</span>
              <span className="text-[10px] text-muted-foreground font-mono">Método: {reparto}</span>
            </div>
            <div className="space-y-1.5">
              {EMPLEADOS.map((e, i) => {
                const totalHoras = COSTE_ROWS.reduce((a, r) => a + r.horasHoy, 0);
                const myHoras = COSTE_ROWS.find((r) => r.empleadoId === e.id)?.horasHoy ?? 0;
                let factor: number;
                if (reparto === "horas") {
                  factor = myHoras / totalHoras;
                } else if (reparto === "rol") {
                  const weights: Record<Rol, number> = { camarero: 0.25, cocina: 0.30, jefe_sala: 0.30, barra: 0.15 };
                  factor = weights[e.rol] / EMPLEADOS.filter((x) => x.rol === e.rol).length;
                } else {
                  // ventas mock: different per employee
                  factor = (i + 1) / 21;
                }
                const amount = propinasTotal * factor;
                return (
                  <div key={e.id} className="flex items-center gap-2 text-xs">
                    <EmpleadoAvatar e={e} size="sm" />
                    <span className="flex-1 truncate">{e.nombre}</span>
                    <div className="w-32 h-1.5 rounded-full bg-foreground/10 overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-[var(--gold)]/60"
                        style={{ width: `${Math.max(5, factor * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono tabular-nums text-[var(--gold-soft)] w-16 text-right">
                      {fmtEUR(amount, 2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleDistribute}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] h-10"
            >
              <Coins className="size-4 mr-1.5" /> Distribuir {fmtEUR(propinasTotal)}
            </Button>
            <Button variant="outline" className="h-10">
              <Banknote className="size-4 mr-1.5" /> Repartir manualmente
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/

export function StaffAdvancedView() {
  const [tab, setTab] = React.useState("empleados");

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">Empleados y cuadrantes</h1>
            <DemoBadge />
            <Badge variant="outline" className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px]">
              Fase 9
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Plantilla, cuadrante semanal, fichaje multicanal y coste en vivo. Estilo Factorial / Planday.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Badge variant="outline" className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 font-mono uppercase tracking-wider text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
            {EMPLEADOS.length} en plantilla
          </Badge>
          <Badge variant="outline" className="border-border/60 font-mono uppercase tracking-wider text-[10px]">
            <Clock className="size-3 mr-1" /> 2 activos
          </Badge>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1">
          <TabsList className="bg-foreground/[0.04] border border-border/60 inline-flex w-max min-w-full">
            <TabsTrigger
              value="empleados"
              className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px] flex-1"
            >
              <Users className="h-4 w-4 mr-1.5" /> Empleados
            </TabsTrigger>
            <TabsTrigger
              value="cuadrante"
              className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px] flex-1"
            >
              <CalendarDays className="h-4 w-4 mr-1.5" /> Cuadrante
            </TabsTrigger>
            <TabsTrigger
              value="fichaje"
              className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px] flex-1"
            >
              <Clock className="h-4 w-4 mr-1.5" /> Fichaje
            </TabsTrigger>
            <TabsTrigger
              value="coste"
              className="data-[state=active]:bg-[var(--gold)]/10 data-[state=active]:text-[var(--gold-soft)] min-h-[40px] flex-1"
            >
              <Euro className="h-4 w-4 mr-1.5" /> Coste
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="empleados" className="mt-5">
          <EmpleadosTab />
        </TabsContent>
        <TabsContent value="cuadrante" className="mt-5">
          <CuadranteTab />
        </TabsContent>
        <TabsContent value="fichaje" className="mt-5">
          <FichajeTab />
        </TabsContent>
        <TabsContent value="coste" className="mt-5">
          <CosteTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* =========================================================
 * Notes
 * =========================================================
 * - 4 tabs (Empleados | Cuadrante | Fichaje | Coste) con Tabs de shadcn/ui.
 * - Empleados tab: 6 cards con avatar+nombre+cargo+PIN ****+usuario+QR mini+permisos, botones Ver ficha (dialog con QR+NFC toggle) e Invitar (form con nombre/email/cargo/rol/PIN).
 * - Cuadrante tab: grid 6 empleados × 7 días (Lun-Dom) con celdas drag&drop (draggable), click vacío → assign dialog (M/T/P/C/—), click asignado → edit dialog (traspasar/eliminar). Coverage bar con demanda vs cubierto por día. 4 tipos de turno: M (teal 08-16), T (gold 16-24), P (violet 08-12+18-22), C (amber 10-22). 3 avisos legales (solapamiento, descanso, coste). Plantilla dialog con 3 plantillas. Vistas toggle Diaria/Semanal/Mensual (solo visual).
 * - Fichaje tab: estado actual con empleado activo + contador, métodos tabs (PIN/QR/FaceID/Huella), PIN pad 4 dígitos interactivo, botones Fichar entrada/salida, lista de fichajes de hoy, geolocalización toggle + map mock con grid CSS y pin animado, banner cumplimiento legal (RD 8/2019, 4 años, exportable).
 * - Coste tab: 4 KPIs (coste hoy / ratio / horas extra / propinas), tabla coste personal en vivo (empleado/horas/coste-h/coste-día/ratio con footer total), 2 cards (horas extra semana + proyección mensual), reparto propinas con RadioGroup (3 métodos: por horas / por rol / por ventas) + vista previa con barras + botón distribuir.
 * - useToast exclusivamente en event handlers (handleInvite, handleToggleNfc, registrarFichaje, handleApplyPlantilla, handleEditAction, setTurno via callback, handleDistribute, handleExport, export inspección). Nunca en setState updaters.
 * - Sin `any`, TypeScript strict. Responsive 390/768/1280+ (grid-cols-1 sm:grid-cols-2/3/xl:grid-cols-3, lg:grid-cols-[1fr_400px] en hardware, overflow-x-auto rp-scroll-thin + min-w-[680px/720px] en tablas/grid de cuadrante).
 * =======================================================*/
