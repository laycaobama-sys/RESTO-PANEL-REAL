"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Plus, Minus, X, Check, Clock, Users, Receipt,
  CreditCard, Wallet, Banknote, Smartphone, Split, Percent,
  Wifi, RefreshCw, Monitor, Ban, BellRing, Lock,
  ShoppingBag, Bike, Store, GlassWater, UtensilsCrossed,
  Soup, Croissant, Beef, Fish, Salad, IceCream, Coffee,
  Wine, Martini, Pizza, Sandwich, Cake, ChefHat, Printer,
  Trash2, ArrowLeft, CircleDot, DollarSign, Grid3x3,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type TpvMode = "mesas" | "barra" | "takeaway" | "delivery";
type TableStatus = "libre" | "ocupada" | "cuenta" | "reservada";
type Category = "entrantes" | "principales" | "postres" | "barra";
type Racion = "media" | "entera";
type PaymentMethod = "tarjeta" | "efectivo" | "bizum" | "mixto" | "cuenta";

interface TpvProduct {
  id: string;
  name: string;
  price: number;
  category: Category;
  icon: React.ElementType;
  tag?: "top" | "nuevo" | "vegano" | "picante";
  available: boolean;
}

interface TicketLine {
  id: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  racion: Racion;
  note?: string;
  sent: boolean;
}

interface TpvTable {
  id: string;
  name: string;
  seats: number;
  status: TableStatus;
  pax?: number;
  openedAt?: number;
  total?: number;
  zone: "sala" | "terraza" | "barra";
}

/* =========================================================
 * Constants
 * =======================================================*/
const MODE_TABS: { id: TpvMode; label: string; icon: React.ElementType }[] = [
  { id: "mesas", label: "Mesas", icon: UtensilsCrossed },
  { id: "barra", label: "Barra rápida", icon: GlassWater },
  { id: "takeaway", label: "Take away", icon: ShoppingBag },
  { id: "delivery", label: "Delivery", icon: Bike },
];

const TABLE_STATUS_META: Record<
  TableStatus,
  { label: string; dot: string; border: string; bg: string; text: string }
> = {
  libre: {
    label: "Libre",
    dot: "bg-[var(--rp-emerald)]",
    border: "border-[var(--rp-emerald)]/50",
    bg: "bg-[var(--rp-emerald)]/10",
    text: "text-[var(--rp-emerald-soft)]",
  },
  ocupada: {
    label: "Ocupada",
    dot: "bg-[var(--rp-red)]",
    border: "border-[var(--rp-red)]/50",
    bg: "bg-[var(--rp-red)]/10",
    text: "text-[var(--rp-red-soft)]",
  },
  cuenta: {
    label: "Cuenta abierta",
    dot: "bg-[var(--rp-violet)]",
    border: "border-[var(--rp-violet)]/55",
    bg: "bg-[var(--rp-violet)]/12",
    text: "text-[var(--rp-violet-soft)]",
  },
  reservada: {
    label: "Reservada",
    dot: "bg-[var(--rp-yellow)]",
    border: "border-[var(--rp-yellow)]/55",
    bg: "bg-[var(--rp-yellow)]/10",
    text: "text-[var(--rp-yellow-soft)]",
  },
};

const CATEGORIES: { id: Category; label: string; icon: React.ElementType }[] = [
  { id: "entrantes", label: "Entrantes", icon: Soup },
  { id: "principales", label: "Principales", icon: Beef },
  { id: "postres", label: "Postres", icon: IceCream },
  { id: "barra", label: "Barra", icon: Wine },
];

const PRODUCTS: TpvProduct[] = [
  { id: "p1", name: "Croquetas jamón", price: 9.5, category: "entrantes", icon: Croissant, tag: "top", available: true },
  { id: "p2", name: "Patatas bravas", price: 8.0, category: "entrantes", icon: Salad, available: true },
  { id: "p3", name: "Calamares andaluza", price: 12.5, category: "entrantes", icon: Fish, available: true },
  { id: "p4", name: "Ensalada César", price: 9.0, category: "entrantes", icon: Salad, tag: "vegano", available: true },
  { id: "p5", name: "Tartar de atún", price: 14.0, category: "entrantes", icon: Fish, tag: "nuevo", available: true },
  { id: "p6", name: "Pan artesano", price: 2.5, category: "entrantes", icon: Sandwich, available: true },
  { id: "p7", name: "Secreto ibérico", price: 16.5, category: "principales", icon: Beef, tag: "top", available: true },
  { id: "p8", name: "Entrecot 400g", price: 22.0, category: "principales", icon: Beef, available: true },
  { id: "p9", name: "Bacalao confitado", price: 18.0, category: "principales", icon: Fish, available: true },
  { id: "p10", name: "Risotto setas", price: 13.5, category: "principales", icon: Soup, tag: "vegano", available: true },
  { id: "p11", name: "Hamburguesa madurada", price: 15.0, category: "principales", icon: Beef, available: true },
  { id: "p12", name: "Pizza margarita", price: 11.0, category: "principales", icon: Pizza, available: true },
  { id: "p13", name: "Pollo al ast", price: 13.0, category: "principales", icon: Beef, tag: "picante", available: false },
  { id: "p14", name: "Paella valenciana", price: 17.5, category: "principales", icon: Soup, available: true },
  { id: "p15", name: "Tarta de queso", price: 6.5, category: "postres", icon: Cake, tag: "top", available: true },
  { id: "p16", name: "Brownie helado", price: 7.0, category: "postres", icon: Cake, available: true },
  { id: "p17", name: "Helado artesano", price: 5.0, category: "postres", icon: IceCream, available: true },
  { id: "p18", name: "Coulé de chocolate", price: 7.5, category: "postres", icon: Cake, tag: "nuevo", available: true },
  { id: "p19", name: "Café espresso", price: 1.6, category: "barra", icon: Coffee, available: true },
  { id: "p20", name: "Copa de vino", price: 4.0, category: "barra", icon: Wine, available: true },
  { id: "p21", name: "Gintonic premium", price: 9.0, category: "barra", icon: Martini, available: true },
  { id: "p22", name: "Refresco", price: 2.5, category: "barra", icon: GlassWater, available: true },
];

const PAYMENT_META: Record<
  PaymentMethod,
  { label: string; icon: React.ElementType; cls: string }
> = {
  tarjeta: { label: "Tarjeta", icon: CreditCard, cls: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]" },
  efectivo: { label: "Efectivo", icon: Banknote, cls: "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]" },
  bizum: { label: "Bizum", icon: Smartphone, cls: "border-[var(--rp-violet)]/40 bg-[var(--rp-violet)]/10 text-[var(--rp-violet-soft)]" },
  mixto: { label: "Mixto", icon: Split, cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]" },
  cuenta: { label: "A cuenta", icon: Wallet, cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300" },
};

const TIP_OPTIONS = [0, 5, 10, 15] as const;

const INITIAL_TABLES: TpvTable[] = [
  { id: "M1", name: "Mesa 1", seats: 2, status: "libre", zone: "sala" },
  { id: "M2", name: "Mesa 2", seats: 2, status: "ocupada", zone: "sala", pax: 2, openedAt: Date.now() - 1000 * 60 * 32, total: 24.5 },
  { id: "M3", name: "Mesa 3", seats: 4, status: "cuenta", zone: "sala", pax: 4, openedAt: Date.now() - 1000 * 60 * 75, total: 88.0 },
  { id: "M4", name: "Mesa 4", seats: 4, status: "reservada", zone: "sala" },
  { id: "M5", name: "Mesa 5", seats: 6, status: "ocupada", zone: "sala", pax: 6, openedAt: Date.now() - 1000 * 60 * 12, total: 56.0 },
  { id: "M6", name: "Mesa 6", seats: 4, status: "libre", zone: "sala" },
  { id: "M7", name: "Mesa 7", seats: 2, status: "libre", zone: "terraza" },
  { id: "M8", name: "Mesa 8", seats: 4, status: "cuenta", zone: "terraza", pax: 3, openedAt: Date.now() - 1000 * 60 * 55, total: 67.5 },
  { id: "M9", name: "Mesa 9", seats: 6, status: "ocupada", zone: "terraza", pax: 5, openedAt: Date.now() - 1000 * 60 * 28, total: 102.0 },
  { id: "M10", name: "Mesa 10", seats: 2, status: "libre", zone: "terraza" },
  { id: "M11", name: "Barra 1", seats: 1, status: "ocupada", zone: "barra", pax: 1, openedAt: Date.now() - 1000 * 60 * 8, total: 4.0 },
  { id: "M12", name: "Barra 2", seats: 1, status: "libre", zone: "barra" },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function eur(n: number): string {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function fmtDuration(ms: number): string {
  const min = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(min / 60);
  if (h > 0) return `${h}h ${min % 60}m`;
  return `${min}m`;
}

function lineTotal(line: TicketLine): number {
  const mult = line.racion === "media" ? 0.55 : 1;
  return line.price * line.qty * mult;
}

function uid(prefix = "l"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}


/* =========================================================
 * KPI strip
 * =======================================================*/
function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone: "emerald" | "yellow" | "blue" | "red" | "violet";
}) {
  const toneMap: Record<typeof tone, string> = {
    emerald: "text-[var(--rp-emerald-soft)]",
    yellow: "text-[var(--rp-yellow-soft)]",
    blue: "text-[var(--rp-blue-soft)]",
    red: "text-[var(--rp-red-soft)]",
    violet: "text-[var(--rp-violet-soft)]",
  };
  return (
    <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-start gap-3">
      <div className={cn("rounded-lg p-2 bg-foreground/[0.04]", toneMap[tone])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">{label}</div>
        <div className="font-display text-xl sm:text-2xl tracking-tight">{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

/* =========================================================
 * Modifier dialog
 * =======================================================*/
function ModifierDialog({
  open,
  product,
  onClose,
  onConfirm,
}: {
  open: boolean;
  product: TpvProduct | null;
  onClose: () => void;
  onConfirm: (racion: Racion, note: string) => void;
}) {
  const [racion, setRacion] = React.useState<Racion>("entera");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setRacion("entera");
      setNote("");
    }
  }, [open, product]);

  if (!product) return null;
  const adjustedPrice = racion === "media" ? product.price * 0.55 : product.price;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <product.icon className="h-5 w-5 text-[var(--rp-emerald-soft)]" />
            {product.name}
          </DialogTitle>
          <DialogDescription>
            Configura la ración y añade notas de cocina si lo necesitas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRacion("entera")}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                racion === "entera"
                  ? "border-[var(--rp-emerald)]/60 bg-[var(--rp-emerald)]/10"
                  : "border-border hover:bg-foreground/5"
              )}
            >
              <div className="text-sm font-medium">Ración entera</div>
              <div className="text-xs text-muted-foreground mt-0.5">{eur(product.price)}</div>
            </button>
            <button
              type="button"
              onClick={() => setRacion("media")}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                racion === "media"
                  ? "border-[var(--rp-emerald)]/60 bg-[var(--rp-emerald)]/10"
                  : "border-border hover:bg-foreground/5"
              )}
            >
              <div className="text-sm font-medium">Media ración</div>
              <div className="text-xs text-muted-foreground mt-0.5">{eur(product.price * 0.55)}</div>
            </button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-xs uppercase tracking-wider text-muted-foreground">
              Nota de cocina
            </Label>
            <Textarea
              id="note"
              placeholder="Ej. sin cebolla, poco hecho, salsa aparte…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
          <div className="rounded-lg bg-foreground/[0.04] p-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Precio seleccionado</span>
            <span className="font-display text-lg">{eur(adjustedPrice)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => onConfirm(racion, note.trim() || "")}
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
          >
            <Plus className="h-4 w-4" /> Añadir · {eur(adjustedPrice)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Payment dialog
 * =======================================================*/
interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
}
function PaymentDialog({
  open,
  total,
  onClose,
  onConfirm,
}: {
  open: boolean;
  total: number;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, tipPct: number, splits?: PaymentSplit[]) => void;
}) {
  const [method, setMethod] = React.useState<PaymentMethod>("tarjeta");
  const [tipPct, setTipPct] = React.useState<number>(0);
  const [splitMode, setSplitMode] = React.useState(false);
  const [splitA, setSplitA] = React.useState<PaymentMethod>("tarjeta");
  const [splitAmountA, setSplitAmountA] = React.useState<number>(total / 2);

  React.useEffect(() => {
    if (open) {
      setMethod("tarjeta");
      setTipPct(0);
      setSplitMode(false);
      setSplitAmountA(total / 2);
      setSplitA("tarjeta");
    }
  }, [open, total]);

  const tip = (total * tipPct) / 100;
  const grand = total + tip;
  const splitBAmount = grand - splitAmountA;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <CreditCard className="h-5 w-5 text-[var(--rp-emerald-soft)]" />
            Cobrar cuenta
          </DialogTitle>
          <DialogDescription>
            Total a cobrar {eur(total)}. Selecciona método y propina.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Total */}
          <div className="rounded-xl bg-foreground/[0.04] p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Total</div>
              <div className="font-display text-3xl">{eur(total)}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">+ Propina {tipPct}%</div>
              <div className="font-display text-lg text-[var(--rp-emerald-soft)]">{eur(tip)}</div>
            </div>
          </div>

          {/* Split toggle */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <Split className="h-4 w-4 text-[var(--rp-yellow-soft)]" />
              <div>
                <div className="text-sm font-medium">Dividir cuenta</div>
                <div className="text-[11px] text-muted-foreground">Pago combinado entre métodos</div>
              </div>
            </div>
            <Switch checked={splitMode} onCheckedChange={setSplitMode} />
          </div>

          {!splitMode ? (
            <>
              {/* Single payment methods */}
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(PAYMENT_META) as PaymentMethod[]).map((m) => {
                  const meta = PAYMENT_META[m];
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={cn(
                        "rounded-lg border p-3 flex flex-col items-center gap-1.5 transition-colors",
                        method === m ? meta.cls : "border-border hover:bg-foreground/5"
                      )}
                    >
                      <meta.icon className="h-5 w-5" />
                      <span className="text-xs">{meta.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tip selector */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Propina sugerida
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {TIP_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipPct(t)}
                      className={cn(
                        "rounded-lg border py-2 text-sm font-medium transition-colors",
                        tipPct === t
                          ? "border-[var(--rp-emerald)]/60 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]"
                          : "border-border hover:bg-foreground/5"
                      )}
                    >
                      {t === 0 ? "Sin" : `${t}%`}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="text-sm font-medium flex items-center gap-2">
                <Split className="h-4 w-4" /> Cuenta dividida
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Método A</Label>
                  <select
                    value={splitA}
                    onChange={(e) => setSplitA(e.target.value as PaymentMethod)}
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                  >
                    {(Object.keys(PAYMENT_META) as PaymentMethod[]).map((m) => (
                      <option key={m} value={m}>{PAYMENT_META[m].label}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    step="0.01"
                    value={splitAmountA.toFixed(2)}
                    onChange={(e) => setSplitAmountA(Math.max(0, Math.min(grand, Number(e.target.value) || 0)))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Método B</Label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                  >
                    {(Object.keys(PAYMENT_META) as PaymentMethod[]).map((m) => (
                      <option key={m} value={m}>{PAYMENT_META[m].label}</option>
                    ))}
                  </select>
                  <div className="rounded-md border border-border bg-foreground/[0.04] px-2 py-1.5 text-sm font-mono">
                    {eur(Math.max(0, splitBAmount))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Total con propina: <span className="text-foreground font-display text-lg">{eur(grand)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button
              onClick={() => {
                if (splitMode) {
                  onConfirm(method, tipPct, [
                    { method: splitA, amount: splitAmountA },
                    { method, amount: splitBAmount },
                  ]);
                } else {
                  onConfirm(method, tipPct);
                }
              }}
              className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
            >
              <Check className="h-4 w-4" /> Cobrar {eur(grand)}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Shift / caja panel
 * =======================================================*/
function ShiftPanel({
  onCloseCaja,
}: {
  onCloseCaja: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  return (
    <div className="rp-glass rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="rounded-lg p-2 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]">
          <Lock className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-medium">Turno abierto · Fondo 200€ · Arqueo ciego</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Inicio 12:00 · Operador: Anna · 3 h 28 m
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] font-mono text-[10px] uppercase tracking-wider">
          <CircleDot className="h-3 w-3" /> Activo
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          className="border-[var(--rp-red)]/40 text-[var(--rp-red-soft)] hover:bg-[var(--rp-red)]/10"
        >
          <Receipt className="h-4 w-4" /> Cerrar caja
        </Button>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cerrar turno</AlertDialogTitle>
            <AlertDialogDescription>
              Se realizará un arqueo ciego. El operador deberá contar el cajón e introducir el total sin ver el esperado. El turno se cerrará y se emitirá el parte Z.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                onCloseCaja();
              }}
              className="bg-[var(--rp-red)] text-white hover:bg-[var(--rp-red-soft)]"
            >
              Cerrar turno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function TpvView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [mode, setMode] = React.useState<TpvMode>("mesas");
  const [tables, setTables] = React.useState<TpvTable[]>(INITIAL_TABLES);
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>(null);
  const [lines, setLines] = React.useState<TicketLine[]>([]);
  const [category, setCategory] = React.useState<Category>("entrantes");
  const [search, setSearch] = React.useState("");
  const [modifierOpen, setModifierOpen] = React.useState(false);
  const [pendingProduct, setPendingProduct] = React.useState<TpvProduct | null>(null);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [customerDisplayOpen, setCustomerDisplayOpen] = React.useState(false);
  const [offlineCount, setOfflineCount] = React.useState(0);
  const [eightySixOpen, setEightySixOpen] = React.useState(false);
  const [eightySixProducts, setEightySixProducts] = React.useState<Record<string, boolean>>(
    Object.fromEntries(PRODUCTS.map((p) => [p.id, p.available]))
  );

  // Simulate offline sync indicator — toggles between online and "N pendientes"
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setOfflineCount((c) => {
        const next = Math.max(0, c + (Math.random() > 0.5 ? 1 : -1));
        return Math.min(3, next);
      });
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  const selectedTable = tables.find((t) => t.id === selectedTableId) ?? null;

  const filteredProducts = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (eightySixProducts[p.id] === false) return false;
      if (p.category !== category) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, search, eightySixProducts]);

  const subtotal = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  const iva = subtotal * 0.1;
  const total = subtotal + iva;

  function openTable(t: TpvTable) {
    setSelectedTableId(t.id);
    if (t.status === "libre") {
      setTables((ts) =>
        ts.map((x) => (x.id === t.id ? { ...x, status: "ocupada", pax: t.seats, openedAt: Date.now(), total: 0 } : x))
      );
      setLines([]);
      toast({ title: "Mesa abierta", description: `${t.name} · ${t.seats} pax` });
    } else {
      setLines([]);
    }
  }

  function backToGrid() {
    if (lines.length > 0 && selectedTable) {
      setTables((ts) =>
        ts.map((x) => (x.id === selectedTable.id ? { ...x, total, status: "cuenta" } : x))
      );
    } else if (selectedTable && selectedTable.status === "ocupada" && lines.length === 0) {
      setTables((ts) =>
        ts.map((x) => (x.id === selectedTable.id ? { ...x, status: "libre", pax: undefined, openedAt: undefined, total: undefined } : x))
      );
    }
    setSelectedTableId(null);
  }

  function addProductQuick(p: TpvProduct) {
    // Open modifier dialog for featured items (top, nuevo, picante) to demonstrate the flow
    if (p.tag === "top" || p.tag === "nuevo" || p.tag === "picante") {
      setPendingProduct(p);
      setModifierOpen(true);
      return;
    }
    const existing = lines.find((l) => l.productId === p.id && l.racion === "entera" && !l.note);
    if (existing) {
      setLines((ls) => ls.map((l) => (l.id === existing.id ? { ...l, qty: l.qty + 1 } : l)));
    } else {
      setLines((ls) => [...ls, { id: uid(), productId: p.id, name: p.name, price: p.price, qty: 1, racion: "entera", sent: false }]);
    }
  }

  function addProductWithModifier(racion: Racion, note: string) {
    if (!pendingProduct) return;
    setLines((ls) => [
      ...ls,
      {
        id: uid(),
        productId: pendingProduct.id,
        name: pendingProduct.name,
        price: pendingProduct.price,
        qty: 1,
        racion,
        note: note || undefined,
        sent: false,
      },
    ]);
    setModifierOpen(false);
    setPendingProduct(null);
    toast({
      title: "Línea añadida",
      description: `${pendingProduct.name}${racion === "media" ? " (media)" : ""}${note ? ` · ${note}` : ""}`,
    });
  }

  function changeQty(lineId: string, delta: number) {
    setLines((ls) =>
      ls
        .map((l) => (l.id === lineId ? { ...l, qty: Math.max(0, l.qty + delta) } : l))
        .filter((l) => l.qty > 0)
    );
  }

  function removeLine(lineId: string) {
    setLines((ls) => ls.filter((l) => l.id !== lineId));
  }

  function sendToKitchen() {
    if (lines.length === 0) return;
    const pending = lines.filter((l) => !l.sent).length;
    setLines((ls) => ls.map((l) => ({ ...l, sent: true })));
    toast({
      title: "Enviado a cocina",
      description: `${pending} líneas a la KDS`,
    });
  }

  function voidTicket() {
    if (lines.length === 0) return;
    setLines([]);
    toast({ title: "Cuenta anulada", variant: "destructive" });
  }

  function printReceipt() {
    toast({ title: "Impresión enviada", description: "Impresora térmica #1 · recibos" });
  }

  function completePayment(method: PaymentMethod, tipPct: number, splits?: PaymentSplit[]) {
    setPaymentOpen(false);
    const grandTotal = total + (total * tipPct) / 100;
    if (splits && splits.length > 1) {
      toast({
        title: "Cobro dividido",
        description: `${splits.length} métodos · ${eur(grandTotal)} total`,
      });
    } else {
      const meta = PAYMENT_META[method];
      toast({
        title: "Cobro completado",
        description: `${meta.label}${tipPct > 0 ? ` +${tipPct}% propina` : ""} · ${eur(grandTotal)}`,
      });
    }
    if (selectedTable) {
      setTables((ts) =>
        ts.map((x) =>
          x.id === selectedTable.id
            ? { ...x, status: "libre", pax: undefined, openedAt: undefined, total: undefined }
            : x
        )
      );
    }
    setLines([]);
    setSelectedTableId(null);
  }

  function toggle86(productId: string) {
    const prev = eightySixProducts[productId];
    setEightySixProducts((m) => ({ ...m, [productId]: !m[productId] }));
    const p = PRODUCTS.find((x) => x.id === productId);
    if (p) {
      const newState = !prev;
      toast({
        title: newState ? "Producto disponible" : "86-ing aplicado",
        description: `${p.name} ${newState ? "disponible" : "fuera de carta"}`,
        variant: newState ? "default" : "destructive",
      });
    }
  }

  function escalateCall() {
    toast({
      title: "Escalado a manager",
      description: "Solicitud de atención en sala enviada a Anna",
    });
  }

  // Barra/takeaway/delivery modes — show order screen directly
  const isQuickMode = mode === "barra" || mode === "takeaway" || mode === "delivery";

  const t = reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };

  /* ---------- Order screen (table selected or quick mode) ---------- */
  if (selectedTableId || isQuickMode) {
    const title = isQuickMode
      ? mode === "barra"
        ? "Barra rápida"
        : mode === "takeaway"
        ? "Take away"
        : "Delivery propio"
      : selectedTable?.name ?? "Mesa";

    return (
      <div className="space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={backToGrid} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Volver
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl tracking-tight">{title}</h1>
                
              </div>
              {selectedTable && (
                <p className="text-sm text-muted-foreground">
                  {selectedTable.pax ?? 0} pax · abierta hace {selectedTable.openedAt ? fmtDuration(Date.now() - selectedTable.openedAt) : "—"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {offlineCount === 0 ? (
              <Badge variant="outline" className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] font-mono text-[10px] uppercase tracking-wider">
                <Wifi className="h-3 w-3" /> Online
              </Badge>
            ) : (
              <Badge variant="outline" className="border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)] font-mono text-[10px] uppercase tracking-wider">
                <RefreshCw className="h-3 w-3 animate-spin" /> Sincronizando ({offlineCount} pendientes)
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => setCustomerDisplayOpen((v) => !v)}>
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Display cliente</span>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-4">
          {/* Left: categories + products */}
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto…"
                className="pr-9"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpiar"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {/* Category sidebar */}
            <div className="flex gap-2 overflow-x-auto rp-scroll-thin pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap border transition-colors",
                    category === c.id
                      ? "border-[var(--rp-emerald)]/60 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <c.icon className="h-4 w-4" /> {c.label}
                </button>
              ))}
            </div>
            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredProducts.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...t, delay: reduce ? 0 : Math.min(i * 0.02, 0.3) }}
                  onClick={() => addProductQuick(p)}
                  className="rp-glass rounded-xl p-3 text-left hover:ring-1 hover:ring-[var(--rp-emerald)]/40 transition-all group min-h-[112px] flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="rounded-lg p-1.5 bg-foreground/[0.04] text-[var(--rp-emerald-soft)]">
                      <p.icon className="h-4 w-4" />
                    </div>
                    {p.tag && (
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider px-1.5 py-0 h-4 font-mono">
                        {p.tag}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium leading-tight line-clamp-2">{p.name}</div>
                    <div className="font-display text-base text-[var(--rp-emerald-soft)] mt-1">{eur(p.price)}</div>
                  </div>
                </motion.button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full rp-glass rounded-xl p-6 text-center text-sm text-muted-foreground">
                  No hay productos disponibles en esta categoría.
                </div>
              )}
            </div>
          </div>

          {/* Right: ticket panel (sticky) */}
          <div className="lg:sticky lg:top-4 self-start">
            <div className="rp-glass rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
                  <span className="text-sm font-medium">Ticket actual</span>
                </div>
                <Button variant="ghost" size="sm" onClick={voidTicket} disabled={lines.length === 0} className="text-[var(--rp-red-soft)] hover:bg-[var(--rp-red)]/10 h-8">
                  <Trash2 className="h-3.5 w-3.5" /> Anular
                </Button>
              </div>
              <Separator />
              <div className="space-y-2 max-h-[44vh] overflow-y-auto rp-scroll-thin pr-1">
                <AnimatePresence initial={false}>
                  {lines.map((l) => (
                    <motion.div
                      key={l.id}
                      initial={reduce ? false : { opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
                      transition={t}
                      className="rounded-lg border border-border bg-foreground/[0.03] p-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{l.name}</div>
                          {l.racion === "media" && (
                            <span className="text-[10px] text-[var(--rp-yellow-soft)] uppercase tracking-wider font-mono">Media ración</span>
                          )}
                          {l.note && (
                            <div className="text-[11px] text-muted-foreground italic mt-0.5">↳ {l.note}</div>
                          )}
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {eur(l.price)} · {l.sent ? "enviado" : "pendiente"}
                          </div>
                        </div>
                        <div className="text-right text-sm font-display">{eur(lineTotal(l))}</div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => changeQty(l.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-7 text-center text-sm font-mono">{l.qty}</span>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => changeQty(l.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 text-[var(--rp-red-soft)] hover:bg-[var(--rp-red)]/10 p-0 w-7" onClick={() => removeLine(l.id)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {lines.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Añade productos desde la carta
                  </div>
                )}
              </div>
              <Separator />
              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base imponible</span><span className="font-mono">{eur(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA (10%)</span><span className="font-mono">{eur(iva)}</span>
                </div>
                <div className="flex justify-between text-base font-display pt-1">
                  <span>Total</span><span className="text-[var(--rp-emerald-soft)]">{eur(total)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" onClick={sendToKitchen} disabled={lines.length === 0} className="border-[var(--rp-blue)]/40 text-[var(--rp-blue-soft)] hover:bg-[var(--rp-blue)]/10">
                  <ChefHat className="h-4 w-4" /> Enviar cocina
                </Button>
                <Button onClick={() => setPaymentOpen(true)} disabled={lines.length === 0} className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]">
                  <CreditCard className="h-4 w-4" /> Cobrar
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={printReceipt} disabled={lines.length === 0} className="w-full text-muted-foreground">
                <Printer className="h-4 w-4" /> Imprimir pre-cuenta
              </Button>
            </div>
          </div>
        </div>

        {/* Customer display modal */}
        <Dialog open={customerDisplayOpen} onOpenChange={setCustomerDisplayOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-display">
                <Monitor className="h-5 w-5 text-[var(--rp-emerald-soft)]" />
                Display de cliente
              </DialogTitle>
              <DialogDescription>
                Vista espejo mostrada en la pantalla orientada al cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl bg-black/60 p-6 font-mono text-center space-y-2">
              <div className="text-xs uppercase tracking-widest text-[var(--rp-emerald-soft)]">RestoPanel · TPV</div>
              <div className="font-display text-3xl">{eur(total)}</div>
              <div className="text-xs text-muted-foreground">Pulse cobrar para completar</div>
            </div>
          </DialogContent>
        </Dialog>

        <ModifierDialog
          open={modifierOpen}
          product={pendingProduct}
          onClose={() => {
            setModifierOpen(false);
            setPendingProduct(null);
          }}
          onConfirm={addProductWithModifier}
        />
        <PaymentDialog
          open={paymentOpen}
          total={total}
          onClose={() => setPaymentOpen(false)}
          onConfirm={completePayment}
        />
      </div>
    );
  }

  /* ---------- Main grid view ---------- */
  const totalTables = tables.length;
  const occupied = tables.filter((t) => t.status === "ocupada" || t.status === "cuenta").length;
  const openAccounts = tables.filter((t) => t.status === "cuenta").length;
  const dailyTotal = tables.reduce((sum, t) => sum + (t.total ?? 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">TPV</h1>
            
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Punto de venta · Mesa, barra, take away y delivery propio. Offline-first con arqueo ciego.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {offlineCount === 0 ? (
            <Badge variant="outline" className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] font-mono text-[10px] uppercase tracking-wider">
              <Wifi className="h-3 w-3" /> Online
            </Badge>
          ) : (
            <Badge variant="outline" className="border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)] font-mono text-[10px] uppercase tracking-wider">
              <RefreshCw className="h-3 w-3 animate-spin" /> Sincronizando ({offlineCount} pendientes)
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => setEightySixOpen(true)} className="border-[var(--rp-red)]/40 text-[var(--rp-red-soft)] hover:bg-[var(--rp-red)]/10">
            <Ban className="h-4 w-4" /> 86-ing
          </Button>
          <Button variant="outline" size="sm" onClick={escalateCall}>
            <BellRing className="h-4 w-4" /> Escalar
          </Button>
        </div>
      </header>

      {/* Mode tabs */}
      <div className="flex items-center gap-1 overflow-x-auto rp-scroll-thin pb-1" role="tablist" aria-label="Modos de TPV">
        {MODE_TABS.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors border min-h-[40px]",
              mode === m.id
                ? "border-[var(--rp-emerald)]/60 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            )}
          >
            <m.icon className="h-4 w-4" aria-hidden /> {m.label}
          </button>
        ))}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={Grid3x3} label="Mesas" value={`${occupied}/${totalTables}`} sub="Ocupadas" tone="emerald" />
        <Kpi icon={Receipt} label="Cuentas abiertas" value={`${openAccounts}`} sub="Pendientes de cobro" tone="violet" />
        <Kpi icon={DollarSign} label="Ventas turno" value={eur(dailyTotal)} sub="Desde las 12:00" tone="yellow" />
        <Kpi icon={Clock} label="Ticket medio" value={eur(28.4)} sub="Últimos 30 días" tone="blue" />
      </div>

      {/* Shift status */}
      <ShiftPanel
        onCloseCaja={() => {
          toast({ title: "Turno cerrado", description: "Parte Z emitido · esperando arqueo ciego" });
        }}
      />

      {/* Tables grid (mesas mode) */}
      {mode === "mesas" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-display text-lg">Plano de mesas</h2>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              {(Object.keys(TABLE_STATUS_META) as TableStatus[]).map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", TABLE_STATUS_META[s].dot)} />
                  {TABLE_STATUS_META[s].label}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {tables.map((t, i) => {
              const meta = TABLE_STATUS_META[t.status];
              return (
                <motion.button
                  key={t.id}
                  initial={reduce ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...t, delay: reduce ? 0 : Math.min(i * 0.02, 0.3) }}
                  onClick={() => openTable(t)}
                  className={cn(
                    "rp-glass rounded-xl p-4 text-left transition-all hover:ring-1 hover:ring-foreground/20 min-h-[120px] flex flex-col justify-between",
                    meta.border, meta.bg
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-display text-lg">{t.name}</div>
                    <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
                  </div>
                  <div>
                    <div className={cn("text-[10px] uppercase tracking-wider font-mono", meta.text)}>
                      {meta.label}
                    </div>
                    {t.pax && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Users className="h-3 w-3" /> {t.pax} pax
                      </div>
                    )}
                    {t.openedAt && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {fmtDuration(Date.now() - t.openedAt)}
                      </div>
                    )}
                    {t.total !== undefined && t.total > 0 && (
                      <div className="font-display text-base mt-1">{eur(t.total)}</div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rp-glass rounded-xl p-8 text-center">
          <div className="mx-auto max-w-md space-y-2">
            {mode === "barra" && <GlassWater className="h-10 w-10 mx-auto text-[var(--rp-yellow-soft)]" />}
            {mode === "takeaway" && <ShoppingBag className="h-10 w-10 mx-auto text-[var(--rp-blue-soft)]" />}
            {mode === "delivery" && <Bike className="h-10 w-10 mx-auto text-[var(--rp-violet-soft)]" />}
            <h3 className="font-display text-lg">
              {mode === "barra" && "Venta en barra"}
              {mode === "takeaway" && "Recoger en local"}
              {mode === "delivery" && "Delivery propio · 0% comisión"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {mode === "barra" && "Tickets rápidos sin asignación de mesa. Ideal para cafetería y aperitivos de pie."}
              {mode === "takeaway" && "Pedidos para recoger. Avisa al cliente por SMS cuando esté listo."}
              {mode === "delivery" && "Repartidores propios con zonas y liquidación automática. Sin comisiones de agregadores."}
            </p>
            <Button
              onClick={() => {
                setSelectedTableId(null);
                setLines([]);
              }}
              className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)] mt-2"
            >
              <Plus className="h-4 w-4" /> Abrir venta {mode === "barra" ? "rápida" : mode === "takeaway" ? "take away" : "delivery"}
            </Button>
          </div>
        </div>
      )}

      {/* 86-ing global dialog */}
      <Dialog open={eightySixOpen} onOpenChange={setEightySixOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Ban className="h-5 w-5 text-[var(--rp-red-soft)]" />
              86-ing global
            </DialogTitle>
            <DialogDescription>
              Marca productos como agotados en toda la carta (TPV, PDA, carta QR, KDS). Aviso inmediato a cocina.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRODUCTS.map((p) => {
              const available = eightySixProducts[p.id];
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border p-2.5",
                    available ? "border-border" : "border-[var(--rp-red)]/40 bg-[var(--rp-red)]/10"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="rounded-md p-1.5 bg-foreground/[0.04] text-[var(--rp-emerald-soft)]">
                      <p.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{eur(p.price)}</div>
                    </div>
                  </div>
                  <Switch checked={available} onCheckedChange={() => toggle86(p.id)} />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEightySixOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TpvView;
