"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Users, Clock, Phone, Crown, TrendingUp, Hash, MapPin,
  Plus, X, Sparkles, ChevronDown, Armchair, Timer, RotateCcw,
  Bell, ListOrdered, HelpCircle, UserPlus, Euro, Star,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type WaitlistStatus =
  | "waiting"
  | "offered"
  | "seated"
  | "expired"
  | "left";

interface WaitlistEntry {
  id: string;
  customerName: string;
  phone: string;
  partySize: number;
  zonePreference: string;
  arrivedAt: string;
  estimatedWait: number;
  priority: number;
  vip: boolean;
  visitCount: number;
  lifetimeValue: number;
  status: WaitlistStatus;
  notes?: string;
}

interface WaitlistOffer {
  id: string;
  entryId: string;
  tableId: string;
  tableName: string;
  zone: string;
  offeredAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "rejected" | "expired";
}

/* =========================================================
 * Helpers
 * =======================================================*/
function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `hace ${h}h ${m}m`;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function priorityFactors(e: WaitlistEntry) {
  return [
    {
      label: "Antigüedad en espera",
      value: Math.min(
        30,
        Math.round((Date.now() - new Date(e.arrivedAt).getTime()) / 60000) * 0.6
      ),
      max: 30,
    },
    {
      label: "Tamaño del grupo",
      value: e.partySize >= 6 ? 12 : e.partySize >= 4 ? 8 : 4,
      max: 12,
    },
    {
      label: "Cliente VIP",
      value: e.vip ? 20 : 0,
      max: 20,
    },
    {
      label: "Historial (visitas)",
      value: Math.min(15, e.visitCount * 1.2),
      max: 15,
    },
    {
      label: "Lifetime value",
      value: Math.min(15, e.lifetimeValue / 250),
      max: 15,
    },
    {
      label: "Probabilidad de aceptar oferta",
      value: e.vip ? 8 : 5,
      max: 8,
    },
  ];
}

function recomputePriority(e: WaitlistEntry): number {
  const f = priorityFactors(e);
  return Math.round(f.reduce((a, b) => a + b.value, 0));
}

/* =========================================================
 * Demo data
 * =======================================================*/
const NOW_MS = Date.now();
const MIN = 60_000;

const INITIAL_ENTRIES: WaitlistEntry[] = [
  {
    id: "w1",
    customerName: "Andrea Rossi",
    phone: "+34 612 44 55 66",
    partySize: 2,
    zonePreference: "Terraza",
    arrivedAt: new Date(NOW_MS - 14 * MIN).toISOString(),
    estimatedWait: 12,
    priority: 0,
    vip: true,
    visitCount: 28,
    lifetimeValue: 4200,
    status: "waiting",
    notes: "Alergia al gluten",
  },
  {
    id: "w2",
    customerName: "Familia Castro",
    phone: "+34 699 11 22 33",
    partySize: 6,
    zonePreference: "Sala",
    arrivedAt: new Date(NOW_MS - 9 * MIN).toISOString(),
    estimatedWait: 25,
    priority: 0,
    vip: false,
    visitCount: 4,
    lifetimeValue: 540,
    status: "waiting",
  },
  {
    id: "w3",
    customerName: "Daniel Vidal",
    phone: "+34 655 87 09 14",
    partySize: 4,
    zonePreference: "Sala",
    arrivedAt: new Date(NOW_MS - 18 * MIN).toISOString(),
    estimatedWait: 8,
    priority: 0,
    vip: false,
    visitCount: 11,
    lifetimeValue: 1820,
    status: "waiting",
  },
  {
    id: "w4",
    customerName: "Sofía Laguna",
    phone: "+34 633 22 90 11",
    partySize: 2,
    zonePreference: "Barra",
    arrivedAt: new Date(NOW_MS - 4 * MIN).toISOString(),
    estimatedWait: 18,
    priority: 0,
    vip: false,
    visitCount: 2,
    lifetimeValue: 110,
    status: "waiting",
  },
  {
    id: "w5",
    customerName: "Marco Bellini",
    phone: "+34 677 88 99 00",
    partySize: 3,
    zonePreference: "Terraza",
    arrivedAt: new Date(NOW_MS - 22 * MIN).toISOString(),
    estimatedWait: 5,
    priority: 0,
    vip: true,
    visitCount: 19,
    lifetimeValue: 2950,
    status: "waiting",
    notes: "Cliente recurrente, prefiere mesa junto a ventana",
  },
].map((e) => ({ ...e, priority: recomputePriority(e) }));

const INITIAL_OFFERS: WaitlistOffer[] = [
  {
    id: "o1",
    entryId: "w6",
    tableId: "tbl-3",
    tableName: "Mesa 3",
    zone: "Sala",
    offeredAt: new Date(NOW_MS - 2 * MIN).toISOString(),
    expiresAt: new Date(NOW_MS + 3 * MIN).toISOString(),
    status: "pending",
  },
];

// Pretend entry w6 is offered so it shows up too
const INITIAL_ENTRIES_WITH_OFFER: WaitlistEntry[] = [
  ...INITIAL_ENTRIES,
  {
    id: "w6",
    customerName: "Elena Marín",
    phone: "+34 611 22 33 44",
    partySize: 2,
    zonePreference: "Sala",
    arrivedAt: new Date(NOW_MS - 7 * MIN).toISOString(),
    estimatedWait: 0,
    priority: 0,
    vip: false,
    visitCount: 6,
    lifetimeValue: 740,
    status: "offered",
    notes: "",
  } as WaitlistEntry,
].map((e) => ({ ...e, priority: recomputePriority(e) }));

const AVAILABLE_TABLES = [
  { id: "tbl-3", name: "Mesa 3", zone: "Sala", seats: 4 },
  { id: "tbl-5", name: "Mesa 5", zone: "Barra", seats: 2 },
  { id: "tbl-9", name: "Mesa 9", zone: "Sala", seats: 6 },
  { id: "tbl-12", name: "Mesa 12", zone: "Terraza", seats: 4 },
  { id: "tbl-15", name: "Mesa 15", zone: "Terraza", seats: 2 },
];

const ZONES = ["Sala", "Terraza", "Barra", "VIP"];

/* =========================================================
 * Countdown hook
 * =======================================================*/
function useNowTick(active: boolean) {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    if (!active) return;
    const id = window.setInterval(force, 1000);
    return () => window.clearInterval(id);
  }, [active]);
}

/* =========================================================
 * Offer card with countdown
 * =======================================================*/
function OfferCard({
  offer,
  entry,
  onRemind,
  onCancel,
}: {
  offer: WaitlistOffer;
  entry?: WaitlistEntry;
  onRemind: () => void;
  onCancel: () => void;
}) {
  const reduce = useReducedMotion();
  const [remaining, setRemaining] = React.useState(
    Math.max(0, new Date(offer.expiresAt).getTime() - Date.now())
  );

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining(Math.max(0, new Date(offer.expiresAt).getTime() - Date.now()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [offer.expiresAt]);

  const expired = remaining <= 0;
  const totalMs = 5 * MIN;
  const progress = Math.max(0, Math.min(1, remaining / totalMs));
  const urgent = remaining < 60_000;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rp-glass rounded-xl p-3.5",
        urgent && "ring-1 ring-amber-400/40"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Armchair className="h-3.5 w-3.5 rp-gold-text" />
            <span className="text-sm font-medium text-foreground">
              {entry?.customerName ?? "Cliente"}
            </span>
            {entry?.vip && (
              <Crown className="h-3.5 w-3.5 text-[var(--gold)]" />
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {offer.tableName}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {offer.zone}
            </span>
            {entry && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {entry.partySize}p
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <div
            className={cn(
              "font-mono text-base font-medium tabular-nums",
              expired
                ? "text-muted-foreground"
                : urgent
                ? "text-amber-300"
                : "rp-gold-text"
            )}
          >
            {expired ? "Expirada" : formatCountdown(remaining)}
          </div>
          {!expired && (
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              restante
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!expired && (
        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-foreground/5">
          <motion.div
            className={cn(
              "h-full rounded-full",
              urgent ? "bg-amber-400" : "bg-[var(--gold)]"
            )}
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: "linear" }}
          />
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        {expired ? (
          <Badge
            variant="outline"
            className="border-muted-foreground/30 text-muted-foreground"
          >
            Expirada
          </Badge>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={onRemind}
            >
              <Bell className="h-3.5 w-3.5" />
              Recordar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground hover:text-destructive"
              onClick={onCancel}
            >
              <X className="h-3.5 w-3.5" />
              Cancelar oferta
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* =========================================================
 * Entry row
 * =======================================================*/
function EntryRow({
  entry,
  position,
  onOffer,
  onCall,
  onRemove,
}: {
  entry: WaitlistEntry;
  position: number;
  onOffer: () => void;
  onCall: () => void;
  onRemove: () => void;
}) {
  const reduce = useReducedMotion();
  const factors = priorityFactors(entry);

  return (
    <motion.article
      layout={reduce ? false : true}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, x: -10 }}
      transition={{ duration: 0.25 }}
      className="rp-glass rounded-xl p-3.5"
    >
      <div className="flex items-start gap-3">
        {/* Position */}
        <div className="flex flex-col items-center pt-0.5">
          <span
            className={cn(
              "grid h-8 w-8 place-items-center rounded-lg font-mono text-sm font-medium tabular-nums",
              position === 1
                ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                : "bg-foreground/[0.05] text-muted-foreground"
            )}
          >
            {position}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-medium text-foreground">
              {entry.customerName}
            </h4>
            {entry.vip && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                <Crown className="h-2.5 w-2.5" />
                VIP
              </span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex cursor-help items-center gap-1 rounded-md border border-border/40 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-foreground/80">
                  <Sparkles className="h-2.5 w-2.5 text-[var(--gold)]" />
                  {entry.priority}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[280px]">
                <div className="space-y-1">
                  <div className="font-medium">Score de prioridad: {entry.priority}</div>
                  {factors.map((f) => (
                    <div key={f.label} className="text-[11px] text-muted-foreground">
                      · {f.label}: <span className="font-mono">{Math.round(f.value)}/{f.max}</span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {entry.partySize}p
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {entry.zonePreference}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelative(entry.arrivedAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Timer className="h-3 w-3" />
              esp. ~{entry.estimatedWait}min
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3" />
              {entry.visitCount} visitas
            </span>
            <span className="inline-flex items-center gap-1">
              <Euro className="h-3 w-3" />
              {entry.lifetimeValue}€ LTV
            </span>
          </div>

          {entry.notes && (
            <p className="mt-1.5 rounded-md border border-amber-400/20 bg-amber-400/5 px-2 py-1 text-[11px] text-amber-200/90">
              {entry.notes}
            </p>
          )}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="h-8 bg-[var(--gold)] px-3 text-xs text-[#0a0a0a] hover:bg-[var(--gold-soft)]"
              onClick={onOffer}
            >
              <Armchair className="h-3.5 w-3.5" />
              Ofrecer mesa
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs"
              onClick={onCall}
            >
              <Phone className="h-3.5 w-3.5" />
              Llamar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <X className="h-3.5 w-3.5" />
              Quitar
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* =========================================================
 * Add to waitlist dialog
 * =======================================================*/
function AddEntryDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (e: WaitlistEntry) => void;
}) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [size, setSize] = React.useState("2");
  const [zone, setZone] = React.useState("Sala");
  const [vip, setVip] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState("");

  const reset = () => {
    setName("");
    setPhone("");
    setSize("2");
    setZone("Sala");
    setVip(false);
    setNotes("");
    setError("");
  };

  const submit = () => {
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!phone.trim()) {
      setError("El teléfono es obligatorio.");
      return;
    }
    const entry: WaitlistEntry = {
      id: `w${Date.now()}`,
      customerName: name.trim(),
      phone: phone.trim(),
      partySize: Number(size) || 1,
      zonePreference: zone,
      arrivedAt: new Date().toISOString(),
      estimatedWait: 15,
      priority: 0,
      vip,
      visitCount: 0,
      lifetimeValue: 0,
      status: "waiting",
      notes: notes.trim() || undefined,
    };
    entry.priority = recomputePriority(entry);
    onAdd(entry);
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-base">Añadir a lista de espera</DialogTitle>
          <DialogDescription className="text-xs">
            Nuevo cliente en cola. La prioridad se recalcula automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Field label="Nombre">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Andrea Rossi"
              className="h-9"
              aria-label="Nombre"
            />
          </Field>
          <Field label="Teléfono">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+34 612 33 44 55"
              className="h-9"
              aria-label="Teléfono"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Comensales">
              <Input
                value={size}
                onChange={(e) =>
                  setSize(e.target.value.replace(/[^0-9]/g, ""))
                }
                inputMode="numeric"
                className="h-9"
                aria-label="Comensales"
              />
            </Field>
            <Field label="Zona preferida">
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZONES.map((z) => (
                    <SelectItem key={z} value={z}>
                      {z}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-foreground/[0.025] px-3 py-2">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-[var(--gold)]" />
              <span className="text-sm">Cliente VIP</span>
            </div>
            <Switch checked={vip} onCheckedChange={setVip} aria-label="VIP" />
          </div>
          <Field label="Notas (opcional)">
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alergias, preferencias…"
              className="h-9"
              aria-label="Notas"
            />
          </Field>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[var(--gold)] text-[#0a0a0a] hover:bg-[var(--gold-soft)]"
            onClick={submit}
          >
            <UserPlus className="h-4 w-4" />
            Añadir a la cola
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Offer table dialog
 * =======================================================*/
function OfferTableDialog({
  open,
  entry,
  onClose,
  onConfirm,
}: {
  open: boolean;
  entry: WaitlistEntry | null;
  onClose: () => void;
  onConfirm: (table: typeof AVAILABLE_TABLES[number]) => void;
}) {
  const [tableId, setTableId] = React.useState<string>("");

  React.useEffect(() => {
    if (open) setTableId("");
  }, [open, entry?.id]);

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-base">Ofrecer mesa a {entry.customerName}</DialogTitle>
          <DialogDescription className="text-xs">
            Selecciona una mesa disponible. Se generará una oferta con validez de 5 min.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {AVAILABLE_TABLES.map((t) => {
            const fits = t.seats >= entry.partySize;
            return (
              <button
                key={t.id}
                onClick={() => setTableId(t.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  tableId === t.id
                    ? "border-[var(--gold)]/50 bg-[var(--gold)]/10"
                    : "border-border/40 bg-foreground/[0.025] hover:bg-foreground/[0.05]",
                  !fits && "opacity-60"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Armchair
                    className={cn(
                      "h-4 w-4",
                      tableId === t.id ? "rp-gold-text" : "text-muted-foreground"
                    )}
                  />
                  <div>
                    <div className="font-medium text-foreground">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {t.zone} · {t.seats}p
                    </div>
                  </div>
                </div>
                {!fits && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                    capacidad menor
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-[var(--gold)] text-[#0a0a0a] hover:bg-[var(--gold-soft)]"
            disabled={!tableId}
            onClick={() => {
              const t = AVAILABLE_TABLES.find((x) => x.id === tableId)!;
              onConfirm(t);
            }}
          >
            <Armchair className="h-4 w-4" />
            Ofrecer (5 min)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Field wrapper
 * =======================================================*/
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function WaitlistPanel() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  useNowTick(true);

  const [entries, setEntries] = React.useState<WaitlistEntry[]>(
    INITIAL_ENTRIES_WITH_OFFER
  );
  const [offers, setOffers] = React.useState<WaitlistOffer[]>(INITIAL_OFFERS);
  const [addOpen, setAddOpen] = React.useState(false);
  const [offerTarget, setOfferTarget] = React.useState<WaitlistEntry | null>(null);
  const [removeTarget, setRemoveTarget] = React.useState<WaitlistEntry | null>(null);
  const [calcOpen, setCalcOpen] = React.useState(false);

  // Auto-expire offers
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setOffers((prev) =>
        prev.map((o) => {
          if (o.status === "pending" && new Date(o.expiresAt).getTime() <= Date.now()) {
            // Mark expired + reset entry to waiting
            setEntries((ents) =>
              ents.map((e) =>
                e.id === o.entryId && e.status === "offered"
                  ? { ...e, status: "waiting" }
                  : e
              )
            );
            toast({
              title: "Oferta expirada",
              description: `${o.tableName} vuelta a la cola.`,
            });
            return { ...o, status: "expired" };
          }
          return o;
        })
      );
    }, 2000);
    return () => window.clearInterval(id);
  }, [toast]);

  const waiting = entries
    .filter((e) => e.status === "waiting")
    .sort((a, b) => b.priority - a.priority);
  const offeredEntries = entries.filter((e) => e.status === "offered");
  const activeOffers = offers.filter(
    (o) => o.status === "pending" || o.status === "expired"
  );

  const handleAdd = (e: WaitlistEntry) => {
    setEntries((prev) => [...prev, e]);
    toast({
      title: "Cliente añadido a la lista",
      description: `${e.customerName} · prioridad ${e.priority}`,
    });
  };

  const handleOfferConfirm = (
    entry: WaitlistEntry,
    table: (typeof AVAILABLE_TABLES)[number]
  ) => {
    const offer: WaitlistOffer = {
      id: `o${Date.now()}`,
      entryId: entry.id,
      tableId: table.id,
      tableName: table.name,
      zone: table.zone,
      offeredAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * MIN).toISOString(),
      status: "pending",
    };
    setOffers((prev) => [offer, ...prev]);
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entry.id ? { ...e, status: "offered" as WaitlistStatus } : e
      )
    );
    setOfferTarget(null);
    toast({
      title: "Mesa ofrecida",
      description: `${table.name} · validez 5 min.`,
    });
  };

  const handleCancelOffer = (offer: WaitlistOffer) => {
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    setEntries((prev) =>
      prev.map((e) =>
        e.id === offer.entryId && e.status === "offered"
          ? { ...e, status: "waiting" as WaitlistStatus }
          : e
      )
    );
    toast({
      title: "Oferta cancelada",
      description: "Cliente vuelve a la cola.",
    });
  };

  const handleRemind = (offer: WaitlistOffer) => {
    toast({
      title: "Recordatorio enviado",
      description: `SMS enviado al cliente sobre ${offer.tableName}.`,
    });
  };

  const handleRemove = (entry: WaitlistEntry) => {
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    setOffers((prev) => prev.filter((o) => o.entryId !== entry.id));
    setRemoveTarget(null);
    toast({
      title: "Cliente quitado de la lista",
      description: entry.customerName,
    });
  };

  const handleCall = (entry: WaitlistEntry) => {
    toast({
      title: "Llamada iniciada",
      description: `${entry.customerName} · ${entry.phone}`,
    });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <section aria-labelledby="waitlist-title" className="flex flex-col gap-5">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
                <ListOrdered className="h-5 w-5" />
              </span>
              <h2
                id="waitlist-title"
                className="font-display text-xl sm:text-2xl font-medium tracking-tight"
              >
                Lista de espera
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-soft)] font-mono text-[10px] uppercase tracking-wider"
              >
                demo
              </Badge>
              <Badge
                variant="outline"
                className="border-border/40 bg-foreground/5 font-mono text-xs tabular-nums"
              >
                {waiting.length} esperando
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Cola priorizada con ofertas de mesa temporizadas.
            </p>
          </div>

          <Button
            className="h-10 bg-[var(--gold)] text-[#0a0a0a] hover:bg-[var(--gold-soft)]"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Añadir a lista
          </Button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          {/* LEFT: queue */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                Cola · {waiting.length} en espera
              </h3>
              <Collapsible open={calcOpen} onOpenChange={setCalcOpen}>
                <CollapsibleTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                    <HelpCircle className="h-3.5 w-3.5" />
                    Cómo se calcula la prioridad
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        calcOpen && "rotate-180"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="rp-glass mt-2 rounded-xl p-3.5">
                    <p className="mb-2 text-xs text-muted-foreground">
                      Score calculado a partir de 6 factores ponderados (máx 100):
                    </p>
                    <ul className="space-y-1.5 text-xs">
                      {[
                        { l: "Antigüedad en espera", v: "0–30", d: "0.6 por minuto" },
                        { l: "Tamaño del grupo", v: "0–12", d: "+4 a +12 según tamaño" },
                        { l: "Cliente VIP", v: "0–20", d: "+20 si es VIP" },
                        { l: "Historial (visitas)", v: "0–15", d: "1.2 por visita" },
                        { l: "Lifetime value", v: "0–15", d: "0.4 por cada 100€ LTV" },
                        {
                          l: "Probabilidad de aceptar",
                          v: "0–8",
                          d: "+3 a +8 según perfil",
                        },
                      ].map((f) => (
                        <li
                          key={f.l}
                          className="flex items-center justify-between gap-3"
                        >
                          <span className="text-foreground/80">{f.l}</span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {f.v} <span className="opacity-70">· {f.d}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="flex flex-col gap-2.5">
              <AnimatePresence mode="popLayout">
                {waiting.map((e, i) => (
                  <EntryRow
                    key={e.id}
                    entry={e}
                    position={i + 1}
                    onOffer={() => setOfferTarget(e)}
                    onCall={() => handleCall(e)}
                    onRemove={() => setRemoveTarget(e)}
                  />
                ))}
              </AnimatePresence>

              {waiting.length === 0 && (
                <div className="rp-glass rounded-xl p-8 text-center text-sm text-muted-foreground">
                  <Sparkles className="mx-auto mb-2 h-5 w-5 text-[var(--gold)]" />
                  Lista de espera vacía.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: active offers */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                Ofertas activas · {activeOffers.length}
              </h3>
              {offeredEntries.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
                  <RotateCcw className="h-2.5 w-2.5" />
                  auto-expira
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <AnimatePresence mode="popLayout">
                {activeOffers.map((o) => (
                  <OfferCard
                    key={o.id}
                    offer={o}
                    entry={entries.find((e) => e.id === o.entryId)}
                    onRemind={() => handleRemind(o)}
                    onCancel={() => handleCancelOffer(o)}
                  />
                ))}
              </AnimatePresence>

              {activeOffers.length === 0 && (
                <div className="rp-glass rounded-xl p-8 text-center text-sm text-muted-foreground">
                  <Armchair className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                  No hay ofertas activas.
                </div>
              )}
            </div>

            {/* Summary footer */}
            <div className="rp-glass mt-1 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="font-display text-2xl font-light tabular-nums rp-gold-text">
                    {entries.length}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    total
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-light tabular-nums rp-teal-text">
                    {offeredEntries.length}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    ofrecidas
                  </div>
                </div>
                <div>
                  <div className="font-display text-2xl font-light tabular-nums text-foreground">
                    {waiting.length}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    en cola
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add dialog */}
        <AddEntryDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onAdd={handleAdd}
        />

        {/* Offer table dialog */}
        <OfferTableDialog
          open={!!offerTarget}
          entry={offerTarget}
          onClose={() => setOfferTarget(null)}
          onConfirm={(t) =>
            offerTarget && handleOfferConfirm(offerTarget, t)
          }
        />

        {/* Remove confirmation */}
        <AlertDialog
          open={!!removeTarget}
          onOpenChange={(o) => !o && setRemoveTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Quitar de la lista de espera</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará a {removeTarget?.customerName} de la cola. Si tiene
                una oferta activa también se cancelará. Esta acción no se puede
                deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => removeTarget && handleRemove(removeTarget)}
              >
                Quitar definitivamente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </TooltipProvider>
  );
}
