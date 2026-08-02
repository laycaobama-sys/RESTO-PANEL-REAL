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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Plus, Minus, X, Check, Clock, Users, Send, ChefHat,
  Wifi, WifiOff, RefreshCw, Bell, BellRing, ArrowLeft,
  Smartphone, Battery, Signal, Soup, Beef, IceCream, Wine,
  Croissant, Fish, Salad, Sandwich, Pizza, Cake, Coffee,
  Martini, GlassWater, AlertTriangle, CheckCircle2, Timer,
  ListOrdered, Hash, CircleDot, UtensilsCrossed, ClipboardList,
  Sparkles, ChevronRight, RotateCcw, Volume2, VolumeX,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type MesaStatus = "libre" | "abierta" | "esperando";
type Category = "entrantes" | "principales" | "postres" | "barra";
type ItemStatus = "pedido" | "preparacion" | "listo" | "servido";
type Ronda = "entrantes" | "principales" | "postres";

interface PdaProduct {
  id: string;
  name: string;
  price: number;
  category: Category;
  icon: React.ElementType;
  modifiers?: { obligatorios: Modifier[]; opcionales: Modifier[] };
}

interface Modifier {
  id: string;
  name: string;
  multi?: boolean;
}

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  status: ItemStatus;
  ronda: Ronda;
  note?: string;
  selectedModifiers: string[];
  sentAt: number;
}

interface Mesa {
  id: string;
  name: string;
  seats: number;
  status: MesaStatus;
  pax?: number;
}

/* =========================================================
 * Constants
 * =======================================================*/
const MY_MESAS: Mesa[] = [
  { id: "m1", name: "Mesa 1", seats: 4, status: "abierta", pax: 4 },
  { id: "m2", name: "Mesa 2", seats: 2, status: "libre" },
  { id: "m3", name: "Mesa 3", seats: 4, status: "abierta", pax: 3 },
  { id: "m4", name: "Mesa 4", seats: 4, status: "esperando", pax: 2 },
  { id: "m5", name: "Mesa 5", seats: 6, status: "libre" },
  { id: "m6", name: "Mesa 6", seats: 4, status: "abierta", pax: 4 },
];

const CATEGORIES: { id: Category; label: string; icon: React.ElementType; ronda: Ronda }[] = [
  { id: "entrantes", label: "Entrantes", icon: Soup, ronda: "entrantes" },
  { id: "principales", label: "Principales", icon: Beef, ronda: "principales" },
  { id: "postres", label: "Postres", icon: IceCream, ronda: "postres" },
  { id: "barra", label: "Barra", icon: Wine, ronda: "principales" },
];

const POINT_MODIFIERS: Modifier[] = [
  { id: "punto-1", name: "Poco hecho" },
  { id: "punto-2", name: "Al punto" },
  { id: "punto-3", name: "Hecho" },
];

const TEMP_MODIFIERS: Modifier[] = [
  { id: "temp-1", name: "Templado" },
  { id: "temp-2", name: "Caliente" },
  { id: "temp-3", name: "Muy caliente" },
];

const EXTRAS_MODIFIERS: Modifier[] = [
  { id: "ex-1", name: "Salsa aparte" },
  { id: "ex-2", name: "Sin cebolla" },
  { id: "ex-3", name: "Extra pan" },
  { id: "ex-4", name: "Sin picante" },
];

const PRODUCTS: PdaProduct[] = [
  { id: "p1", name: "Croquetas jamón", price: 9.5, category: "entrantes", icon: Croissant },
  { id: "p2", name: "Patatas bravas", price: 8.0, category: "entrantes", icon: Salad },
  { id: "p3", name: "Calamares", price: 12.5, category: "entrantes", icon: Fish },
  { id: "p4", name: "Ensalada César", price: 9.0, category: "entrantes", icon: Salad },
  { id: "p5", name: "Tartar de atún", price: 14.0, category: "entrantes", icon: Fish },
  { id: "p6", name: "Pan artesano", price: 2.5, category: "entrantes", icon: Sandwich, modifiers: { obligatorios: [], opcionales: EXTRAS_MODIFIERS } },
  { id: "p7", name: "Secreto ibérico", price: 16.5, category: "principales", icon: Beef, modifiers: { obligatorios: POINT_MODIFIERS, opcionales: EXTRAS_MODIFIERS } },
  { id: "p8", name: "Entrecot 400g", price: 22.0, category: "principales", icon: Beef, modifiers: { obligatorios: POINT_MODIFIERS, opcionales: EXTRAS_MODIFIERS } },
  { id: "p9", name: "Bacalao confitado", price: 18.0, category: "principales", icon: Fish, modifiers: { obligatorios: TEMP_MODIFIERS, opcionales: EXTRAS_MODIFIERS } },
  { id: "p10", name: "Risotto setas", price: 13.5, category: "principales", icon: Salad, modifiers: { obligatorios: [], opcionales: EXTRAS_MODIFIERS } },
  { id: "p11", name: "Hamburguesa madurada", price: 15.0, category: "principales", icon: Beef, modifiers: { obligatorios: POINT_MODIFIERS, opcionales: EXTRAS_MODIFIERS } },
  { id: "p12", name: "Pizza margarita", price: 11.0, category: "principales", icon: Pizza },
  { id: "p13", name: "Paella valenciana", price: 17.5, category: "principales", icon: Soup },
  { id: "p14", name: "Tarta de queso", price: 6.5, category: "postres", icon: Cake },
  { id: "p15", name: "Brownie helado", price: 7.0, category: "postres", icon: Cake },
  { id: "p16", name: "Helado artesano", price: 5.0, category: "postres", icon: IceCream, modifiers: { obligatorios: [], opcionales: EXTRAS_MODIFIERS } },
  { id: "p17", name: "Café espresso", price: 1.6, category: "barra", icon: Coffee },
  { id: "p18", name: "Copa de vino", price: 4.0, category: "barra", icon: Wine },
  { id: "p19", name: "Gintonic premium", price: 9.0, category: "barra", icon: Martini },
  { id: "p20", name: "Refresco", price: 2.5, category: "barra", icon: GlassWater },
];

const ITEM_STATUS_META: Record<
  ItemStatus,
  { label: string; cls: string; dot: string }
> = {
  pedido: {
    label: "Pedido",
    cls: "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]",
    dot: "bg-[var(--rp-blue)]",
  },
  preparacion: {
    label: "En preparación",
    cls: "border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)]",
    dot: "bg-[var(--rp-yellow)]",
  },
  listo: {
    label: "Listo",
    cls: "border-[var(--rp-emerald)]/50 bg-[var(--rp-emerald)]/12 text-[var(--rp-emerald-soft)]",
    dot: "bg-[var(--rp-emerald)]",
  },
  servido: {
    label: "Servido",
    cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
    dot: "bg-zinc-500",
  },
};

const RONDA_META: Record<Ronda, { label: string; icon: React.ElementType; cls: string }> = {
  entrantes: { label: "Entrantes", icon: Soup, cls: "text-[var(--rp-blue-soft)]" },
  principales: { label: "Principales", icon: Beef, cls: "text-[var(--rp-yellow-soft)]" },
  postres: { label: "Postres", icon: IceCream, cls: "text-[var(--rp-violet-soft)]" },
};

/* =========================================================
 * Helpers
 * =======================================================*/
function eur(n: number): string {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function uid(prefix = "i"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function fmtTime(ms: number): string {
  const min = Math.max(0, Math.floor(ms / 60000));
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${String(sec).padStart(2, "0")}`;
}


/* =========================================================
 * Phone frame chrome
 * =======================================================*/
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative rounded-[2.5rem] border-[10px] border-zinc-900 bg-zinc-950 shadow-2xl overflow-hidden rp-glow-gold">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-20" aria-hidden />
        {/* Status bar */}
        <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-6 pt-1.5 pb-1 text-[10px] text-muted-foreground font-mono">
          <span>14:32</span>
          <div className="flex items-center gap-1">
            <Signal className="h-3 w-3" />
            <Wifi className="h-3 w-3" />
            <Battery className="h-3 w-3" />
            <span>87%</span>
          </div>
        </div>
        {/* Screen content */}
        <div className="pt-8 min-h-[640px] max-h-[80vh] overflow-y-auto rp-scroll-thin bg-background">
          {children}
        </div>
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
  product: PdaProduct | null;
  onClose: () => void;
  onConfirm: (selected: string[], note: string) => void;
}) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setSelected([]);
      setNote("");
    }
  }, [open, product]);

  if (!product || !product.modifiers) return null;
  const obligatorios = product.modifiers.obligatorios;
  const opcionales = product.modifiers.opcionales;
  const obligatorioSelected = obligatorios.length === 0 || obligatorios.some((m) => selected.includes(m.id));

  function toggle(id: string) {
    // Obligatorios are radio-like (only one active); opcionales multi
    const isOblig = obligatorios.some((m) => m.id === id);
    if (isOblig) {
      setSelected((prev) => [
        ...prev.filter((sid) => !obligatorios.some((m) => m.id === sid)),
        id,
      ]);
    } else {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <product.icon className="h-5 w-5 text-[var(--rp-emerald-soft)]" />
            {product.name}
          </DialogTitle>
          <DialogDescription>
            Configura los modificadores obligatorios y opcionales.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {obligatorios.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Obligatorios
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {obligatorios.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggle(m.id)}
                    className={cn(
                      "rounded-lg border p-2.5 text-sm font-medium transition-colors",
                      selected.includes(m.id)
                        ? "border-[var(--rp-emerald)]/60 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]"
                        : "border-border hover:bg-foreground/5"
                    )}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {opcionales.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Opcionales
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {opcionales.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggle(m.id)}
                    className={cn(
                      "rounded-lg border p-2.5 text-sm font-medium transition-colors flex items-center gap-1.5",
                      selected.includes(m.id)
                        ? "border-[var(--rp-blue)]/60 bg-[var(--rp-blue)]/10 text-[var(--rp-blue-soft)]"
                        : "border-border hover:bg-foreground/5"
                    )}
                  >
                    {selected.includes(m.id) && <Check className="h-3 w-3" />}
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-xs uppercase tracking-wider text-muted-foreground">
              Nota de cocina
            </Label>
            <Textarea
              id="note"
              placeholder="Ej. sin sal, alergia frutos secos…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => onConfirm(selected, note.trim() || "")}
            disabled={!obligatorioSelected}
            className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
          >
            <Plus className="h-4 w-4" /> Añadir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function PdaView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [mesas, setMesas] = React.useState<Mesa[]>(MY_MESAS);
  const [selectedMesaId, setSelectedMesaId] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<OrderItem[]>([]);
  const [category, setCategory] = React.useState<Category>("entrantes");
  const [search, setSearch] = React.useState("");
  const [pendingProduct, setPendingProduct] = React.useState<PdaProduct | null>(null);
  const [modifierOpen, setModifierOpen] = React.useState(false);
  const [pax, setPax] = React.useState<number>(2);
  const [offline, setOffline] = React.useState(false);
  const [readyNotice, setReadyNotice] = React.useState<string | null>(null);
  const [soundOn, setSoundOn] = React.useState(true);

  // Simulate cocina marking an item "listo"
  React.useEffect(() => {
    if (items.some((i) => i.status === "preparacion")) {
      const id = window.setTimeout(() => {
        setItems((prev) => {
          const next = prev.map((i) =>
            i.status === "preparacion" ? { ...i, status: "listo" as ItemStatus } : i
          );
          const ready = next.find((i) => i.status === "listo" && !prev.find((p) => p.id === i.id && p.status === "listo"));
          if (ready && soundOn) {
            setReadyNotice(`${ready.name} listo en cocina`);
          }
          return next;
        });
      }, 6000);
      return () => window.clearTimeout(id);
    }
  }, [items, soundOn]);

  // Auto-clear readyNotice
  React.useEffect(() => {
    if (readyNotice) {
      const id = window.setTimeout(() => setReadyNotice(null), 4000);
      return () => window.clearTimeout(id);
    }
  }, [readyNotice]);

  const selectedMesa = mesas.find((m) => m.id === selectedMesaId) ?? null;

  const filteredProducts = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (p.category !== category) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, search]);

  const itemsByRonda = React.useMemo(() => {
    const rondaOrder: Ronda[] = ["entrantes", "principales", "postres"];
    return rondaOrder
      .map((r) => ({ ronda: r, items: items.filter((i) => i.ronda === r) }))
      .filter((g) => g.items.length > 0);
  }, [items]);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  function openMesa(m: Mesa) {
    setSelectedMesaId(m.id);
    setPax(m.pax ?? m.seats);
    if (m.status === "libre") {
      setMesas((ms) =>
        ms.map((x) => (x.id === m.id ? { ...x, status: "abierta", pax: m.seats } : x))
      );
      setItems([]);
      toast({ title: "Mesa abierta", description: `${m.name} · ${m.seats} pax` });
    } else {
      setItems([]);
    }
  }

  function backToMesas() {
    setSelectedMesaId(null);
  }

  function pickProduct(p: PdaProduct) {
    if (p.modifiers && (p.modifiers.obligatorios.length > 0 || p.modifiers.opcionales.length > 0)) {
      setPendingProduct(p);
      setModifierOpen(true);
      return;
    }
    addItem(p, [], "");
  }

  function addItem(p: PdaProduct, selected: string[], note: string) {
    const ronda = CATEGORIES.find((c) => c.id === p.category)?.ronda ?? "principales";
    const existing = items.find(
      (i) => i.productId === p.id && i.note === note && JSON.stringify(i.selectedModifiers) === JSON.stringify(selected) && i.status === "pedido"
    );
    if (existing) {
      setItems((prev) => prev.map((i) => (i.id === existing.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: uid(),
          productId: p.id,
          name: p.name,
          price: p.price,
          qty: 1,
          status: "pedido",
          ronda,
          note: note || undefined,
          selectedModifiers: selected,
          sentAt: Date.now(),
        },
      ]);
    }
    if (pendingProduct) {
      setPendingProduct(null);
      setModifierOpen(false);
    }
    toast({
      title: "Añadido al ticket",
      description: `${p.name}`,
      duration: 1500,
    });
  }

  function changeQty(itemId: string, delta: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.id === itemId ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  }

  function removeItem(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  function sendOrder() {
    const unsent = items.filter((i) => i.status === "pedido");
    if (unsent.length === 0) {
      toast({ title: "Nada pendiente de envío", variant: "destructive" });
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.status === "pedido" ? { ...i, status: "preparacion" as ItemStatus, sentAt: Date.now() } : i))
    );
    toast({
      title: "Comanda enviada a cocina",
      description: `${unsent.length} líneas · Mesa ${selectedMesa?.name ?? ""}`,
    });
  }

  function serveItem(itemId: string) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: "servido" as ItemStatus } : i)));
    const item = items.find((i) => i.id === itemId);
    if (item) {
      toast({
        title: "Servido",
        description: `${item.name} · Mesa ${selectedMesa?.name ?? ""}`,
        duration: 1500,
      });
    }
  }

  function serveAllReady() {
    const ready = items.filter((i) => i.status === "listo");
    if (ready.length === 0) return;
    setItems((prev) => prev.map((i) => (i.status === "listo" ? { ...i, status: "servido" as ItemStatus } : i)));
    toast({ title: "Todo servido", description: `${ready.length} platos` });
  }

  function voidItem(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    toast({ title: "Línea anulada", variant: "destructive", duration: 1500 });
  }

  function closeMesa() {
    if (selectedMesa) {
      setMesas((ms) =>
        ms.map((m) => (m.id === selectedMesa.id ? { ...m, status: "libre", pax: undefined } : m))
      );
    }
    setItems([]);
    setSelectedMesaId(null);
    toast({ title: "Mesa cerrada", description: "Cobro gestionado desde TPV" });
  }

  const t = reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };

  /* ---------- Mesa selector ---------- */
  if (!selectedMesaId) {
    return (
      <div className="space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl tracking-tight">PDA · Comandero</h1>
              
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Toma de comandas en sala. Flujo de 3 toques: mesa → producto → enviar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {offline ? (
              <Badge variant="outline" className="border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)] font-mono text-[10px] uppercase tracking-wider">
                <WifiOff className="h-3 w-3" /> Sin conexión
              </Badge>
            ) : (
              <Badge variant="outline" className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] font-mono text-[10px] uppercase tracking-wider">
                <Wifi className="h-3 w-3" /> Online
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => setOffline((v) => !v)}>
              <RefreshCw className="h-4 w-4" /> {offline ? "Reconectar" : "Simular offline"}
            </Button>
          </div>
        </header>

        {/* Assigned range */}
        <div className="rp-glass rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium">Rango asignado · Mesa 1 – Mesa 6</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Sala principal · Operador: Marc · Turno tarde
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSoundOn((v) => !v)}>
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundOn ? "Sonido" : "Silencio"}
          </Button>
        </div>

        <PhoneFrame>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">Selecciona mesa</h2>
              <span className="text-[11px] text-muted-foreground">6 mesas asignadas</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {mesas.map((m, i) => {
                const meta =
                  m.status === "libre"
                    ? { dot: "bg-[var(--rp-emerald)]", border: "border-[var(--rp-emerald)]/40", text: "text-[var(--rp-emerald-soft)]" }
                    : m.status === "abierta"
                    ? { dot: "bg-[var(--rp-yellow)]", border: "border-[var(--rp-yellow)]/40", text: "text-[var(--rp-yellow-soft)]" }
                    : { dot: "bg-[var(--rp-red)]", border: "border-[var(--rp-red)]/40", text: "text-[var(--rp-red-soft)]" };
                return (
                  <motion.button
                    key={m.id}
                    initial={reduce ? false : { opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...t, delay: reduce ? 0 : Math.min(i * 0.04, 0.3) }}
                    onClick={() => openMesa(m)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all hover:ring-1 hover:ring-foreground/20 min-h-[100px]",
                      meta.border, "bg-foreground/[0.03]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-display text-base">{m.name}</div>
                      <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                    </div>
                    <div className={cn("text-[10px] uppercase tracking-wider font-mono mt-1", meta.text)}>
                      {m.status === "libre" ? "Libre" : m.status === "abierta" ? "Abierta" : "Esperando"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Users className="h-3 w-3" /> {m.pax ?? m.seats} pax
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </PhoneFrame>
      </div>
    );
  }

  /* ---------- Order screen (mesa selected) ---------- */
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={backToMesas} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Mesas
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl tracking-tight">{selectedMesa?.name}</h1>
              
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedMesa?.status === "abierta" ? "Mesa abierta" : "Esperando pedido"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {offline ? (
            <Badge variant="outline" className="border-[var(--rp-yellow)]/40 bg-[var(--rp-yellow)]/10 text-[var(--rp-yellow-soft)] font-mono text-[10px] uppercase tracking-wider">
              <WifiOff className="h-3 w-3" /> Sin conexión · {items.filter((i) => i.status === "pedido").length} pend.
            </Badge>
          ) : (
            <Badge variant="outline" className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] font-mono text-[10px] uppercase tracking-wider">
              <Wifi className="h-3 w-3" /> Online
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={closeMesa} className="border-[var(--rp-red)]/40 text-[var(--rp-red-soft)] hover:bg-[var(--rp-red)]/10">
            <X className="h-4 w-4" /> Cerrar mesa
          </Button>
        </div>
      </header>

      {/* Ready notice */}
      <AnimatePresence>
        {readyNotice && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={t}
            className="rp-glass rounded-xl p-3 flex items-center gap-3 border-[var(--rp-emerald)]/40"
          >
            <div className="rounded-lg p-2 bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald-soft)]">
              <BellRing className="h-4 w-4" />
            </div>
            <div className="flex-1 text-sm">
              <div className="font-medium">Cocina avisa</div>
              <div className="text-muted-foreground">{readyNotice}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setReadyNotice(null)}>
              <Check className="h-3.5 w-3.5" /> Ok
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Left: products */}
        <PhoneFrame>
          <div className="p-4 space-y-3">
            {/* Header with pax selector */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
                <span className="text-sm font-medium">Comanda · {selectedMesa?.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setPax((p) => Math.max(1, p - 1))}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground flex items-center gap-1 w-12 justify-center">
                  <Users className="h-3 w-3" /> {pax}
                </span>
                <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setPax((p) => p + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto…"
                className="pr-9 h-9"
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

            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto rp-scroll-thin pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap border transition-colors",
                    category === c.id
                      ? "border-[var(--rp-emerald)]/60 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <c.icon className="h-3.5 w-3.5" /> {c.label}
                </button>
              ))}
            </div>

            {/* Product buttons */}
            <div className="grid grid-cols-2 gap-2">
              {filteredProducts.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...t, delay: reduce ? 0 : Math.min(i * 0.02, 0.25) }}
                  onClick={() => pickProduct(p)}
                  className="rp-glass rounded-xl p-2.5 text-left hover:ring-1 hover:ring-[var(--rp-emerald)]/40 transition-all min-h-[80px] flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-md p-1.5 bg-foreground/[0.04] text-[var(--rp-emerald-soft)]">
                      <p.icon className="h-3.5 w-3.5" />
                    </div>
                    {p.modifiers && (p.modifiers.obligatorios.length > 0 || p.modifiers.opcionales.length > 0) && (
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--rp-yellow-soft)]">
                        mod
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5">
                    <div className="text-xs font-medium leading-tight line-clamp-2">{p.name}</div>
                    <div className="font-display text-sm text-[var(--rp-emerald-soft)] mt-0.5">{eur(p.price)}</div>
                  </div>
                </motion.button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center text-xs text-muted-foreground py-4">
                  Sin productos
                </div>
              )}
            </div>
          </div>
        </PhoneFrame>

        {/* Right: ticket panel */}
        <div className="lg:sticky lg:top-4 self-start">
          <div className="rp-glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-[var(--rp-emerald-soft)]" />
                <span className="text-sm font-medium">Comanda · {selectedMesa?.name}</span>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">{items.length} líneas</span>
            </div>
            <Separator />

            {/* Items by ronda */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto rp-scroll-thin pr-1">
              {itemsByRonda.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Selecciona productos para crear la comanda
                </div>
              )}
              {itemsByRonda.map((group) => {
                const meta = RONDA_META[group.ronda];
                return (
                  <div key={group.ronda} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-mono">
                      <meta.icon className={cn("h-3 w-3", meta.cls)} />
                      <span className={meta.cls}>{meta.label}</span>
                    </div>
                    {group.items.map((item) => {
                      const status = ITEM_STATUS_META[item.status];
                      return (
                        <motion.div
                          key={item.id}
                          initial={reduce ? false : { opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
                          transition={t}
                          className={cn(
                            "rounded-lg border p-2.5",
                            status.cls
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate flex items-center gap-1.5">
                                {item.qty}× {item.name}
                              </div>
                              {item.note && (
                                <div className="text-[11px] text-muted-foreground italic mt-0.5">↳ {item.note}</div>
                              )}
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                                <span className="text-[10px] uppercase tracking-wider font-mono">
                                  {status.label}
                                </span>
                                {item.status === "preparacion" && (
                                  <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" /> {fmtTime(Date.now() - item.sentAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-sm font-display">{eur(item.price * item.qty)}</div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              {item.status === "pedido" && (
                                <>
                                  <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => changeQty(item.id, -1)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-6 text-center text-xs font-mono">{item.qty}</span>
                                  <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => changeQty(item.id, 1)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-6 text-[var(--rp-red-soft)] hover:bg-[var(--rp-red)]/10 p-0 w-6 ml-1" onClick={() => voidItem(item.id)}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              {item.status === "listo" && (
                                <Button size="sm" onClick={() => serveItem(item.id)} className="h-6 bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]">
                                  <Check className="h-3 w-3" /> Servir
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <Separator />

            <div className="flex justify-between text-base font-display">
              <span>Total</span><span className="text-[var(--rp-emerald-soft)]">{eur(total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                onClick={serveAllReady}
                disabled={items.filter((i) => i.status === "listo").length === 0}
                className="border-[var(--rp-emerald)]/40 text-[var(--rp-emerald-soft)] hover:bg-[var(--rp-emerald)]/10"
              >
                <Check className="h-4 w-4" /> Servir listos
              </Button>
              <Button
                onClick={sendOrder}
                disabled={items.filter((i) => i.status === "pedido").length === 0}
                className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]"
              >
                <Send className="h-4 w-4" /> Enviar ({items.filter((i) => i.status === "pedido").length})
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              3 toques: mesa → producto → enviar
            </p>
          </div>
        </div>
      </div>

      <ModifierDialog
        open={modifierOpen}
        product={pendingProduct}
        onClose={() => {
          setModifierOpen(false);
          setPendingProduct(null);
        }}
        onConfirm={(selected, note) => {
          if (pendingProduct) addItem(pendingProduct, selected, note);
        }}
      />
    </div>
  );
}

export default PdaView;
