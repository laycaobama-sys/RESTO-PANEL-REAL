"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  QrCode, ShoppingCart, Plus, Minus, X, Check, Globe,
  Soup, Beef, IceCream, Wine, Coffee, Croissant, Fish,
  Salad, Sandwich, Pizza, Cake, Martini, GlassWater,
  Leaf, Flame, Wheat, Milk, Egg, Fish as FishIcon,
  Sun, Moon, Coffee as CoffeeIcon, Calendar,
  Sparkles, TrendingUp, Star, ChevronRight, Wifi,
  Smartphone, Tablet, CreditCard, Banknote, Languages,
  UtensilsCrossed, Eye, EyeOff, AlertCircle, Store,
  Battery, Signal, Clock,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type Franja = "desayuno" | "menudeldia" | "cena" | "findesemana";
type Lang = "es" | "en" | "fr" | "de";
type Category = "entrantes" | "principales" | "postres" | "barra";

interface CartaProduct {
  id: string;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
  price: number;
  category: Category;
  icon: React.ElementType;
  allergens: Allergen[];
  tags?: string[];
  available: boolean;
}

interface CartLine {
  productId: string;
  qty: number;
}

type Allergen = "gluten" | "leche" | "huevo" | "pescado" | "frutossecos" | "vegan";

/* =========================================================
 * Constants
 * =======================================================*/
const ALLERGEN_META: Record<Allergen, { label: string; icon: React.ElementType; cls: string }> = {
  gluten: { label: "Gluten", icon: Wheat, cls: "text-[var(--rp-yellow-soft)]" },
  leche: { label: "Lácteos", icon: Milk, cls: "text-[var(--rp-blue-soft)]" },
  huevo: { label: "Huevo", icon: Egg, cls: "text-[var(--rp-yellow-soft)]" },
  pescado: { label: "Pescado", icon: FishIcon, cls: "text-[var(--rp-blue-soft)]" },
  frutossecos: { label: "Frutos secos", icon: Leaf, cls: "text-[var(--rp-emerald-soft)]" },
  vegan: { label: "Vegano", icon: Leaf, cls: "text-[var(--rp-emerald-soft)]" },
};

const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: "es", label: "ES", flag: "🇪🇸" },
  { id: "en", label: "EN", flag: "🇬🇧" },
  { id: "fr", label: "FR", flag: "🇫🇷" },
  { id: "de", label: "DE", flag: "🇩🇪" },
];

const FRANJAS: { id: Franja; label: string; icon: React.ElementType; cls: string }[] = [
  { id: "desayuno", label: "Desayuno", icon: CoffeeIcon, cls: "text-[var(--rp-yellow-soft)]" },
  { id: "menudeldia", label: "Menú del día", icon: Sun, cls: "text-[var(--rp-emerald-soft)]" },
  { id: "cena", label: "Cena", icon: Moon, cls: "text-[var(--rp-violet-soft)]" },
  { id: "findesemana", label: "Fin de semana", icon: Calendar, cls: "text-[var(--rp-blue-soft)]" },
];

const CATEGORIES: { id: Category; label: Record<Lang, string>; icon: React.ElementType }[] = [
  { id: "entrantes", label: { es: "Entrantes", en: "Starters", fr: "Entrées", de: "Vorspeisen" }, icon: Soup },
  { id: "principales", label: { es: "Principales", en: "Mains", fr: "Plats", de: "Hauptgerichte" }, icon: Beef },
  { id: "postres", label: { es: "Postres", en: "Desserts", fr: "Desserts", de: "Desserts" }, icon: IceCream },
  { id: "barra", label: { es: "Barra", en: "Bar", fr: "Bar", de: "Bar" }, icon: Wine },
];

const PRODUCTS: CartaProduct[] = [
  {
    id: "p1",
    name: { es: "Croquetas jamón", en: "Ham croquettes", fr: "Croquettes de jambon", de: "Schinkenkroketten" },
    desc: { es: "Cremosas, ibérico", en: "Creamy, Iberian", fr: "Crémeuses, ibérique", de: "Cremig, iberisch" },
    price: 9.5, category: "entrantes", icon: Croissant, allergens: ["gluten", "leche"], tags: ["top"], available: true,
  },
  {
    id: "p2",
    name: { es: "Patatas bravas", en: "Spicy potatoes", fr: "Patatas bravas", de: "Scharfe Kartoffeln" },
    desc: { es: "Salsa brava casera", en: "House spicy sauce", fr: "Sauce brava maison", de: "Hausscharfe Soße" },
    price: 8.0, category: "entrantes", icon: Salad, allergens: ["gluten"], available: true,
  },
  {
    id: "p3",
    name: { es: "Tartar de atún", en: "Tuna tartare", fr: "Tartare de thon", de: "Thunfisch-Tartar" },
    desc: { es: "Atún rojo, aguacate", en: "Red tuna, avocado", fr: "Thon rouge, avocat", de: "Roter Thun, Avocado" },
    price: 14.0, category: "entrantes", icon: Fish, allergens: ["pescado"], tags: ["nuevo"], available: true,
  },
  {
    id: "p4",
    name: { es: "Ensalada César", en: "Caesar salad", fr: "Salade César", de: "Cäsar-Salat" },
    desc: { es: "Pollo, parmesano", en: "Chicken, parmesan", fr: "Poulet, parmesan", de: "Hähnchen, Parmesan" },
    price: 9.0, category: "entrantes", icon: Salad, allergens: ["leche", "huevo"], available: true,
  },
  {
    id: "p5",
    name: { es: "Secreto ibérico", en: "Iberian secret", fr: "Secret ibérique", de: "Iberisches Geheimnis" },
    desc: { es: "Poco hecho, patatas", en: "Rare, potatoes", fr: "Saignant, pommes", de: "Medium, Kartoffeln" },
    price: 16.5, category: "principales", icon: Beef, allergens: [], tags: ["top"], available: true,
  },
  {
    id: "p6",
    name: { es: "Entrecot 400g", en: "Entrecote 400g", fr: "Entrecôte 400g", de: "Entrecôte 400g" },
    desc: { es: "Madurado 28 días", en: "Aged 28 days", fr: "Maturé 28 jours", de: "28 Tage gereift" },
    price: 22.0, category: "principales", icon: Beef, allergens: [], available: true,
  },
  {
    id: "p7",
    name: { es: "Risotto setas", en: "Mushroom risotto", fr: "Risotto aux champignons", de: "Pilz-Risotto" },
    desc: { es: "Parmesano, trufa", en: "Parmesan, truffle", fr: "Parmesan, truffe", de: "Parmesan, Trüffel" },
    price: 13.5, category: "principales", icon: Salad, allergens: ["leche"], tags: ["vegano"], available: true,
  },
  {
    id: "p8",
    name: { es: "Bacalao confitado", en: "Confit cod", fr: "Cabillaud confit", de: "Konfakter Kabeljau" },
    desc: { es: "Sobre pil-pil", en: "On pil-pil", fr: "Sur pil-pil", de: "Auf Pil-Pil" },
    price: 18.0, category: "principales", icon: Fish, allergens: ["pescado"], available: false,
  },
  {
    id: "p9",
    name: { es: "Hamburguesa madurada", en: "Aged burger", fr: "Burger maturé", de: "Gereifter Burger" },
    desc: { es: "Carne 30 días", en: "30-day beef", fr: "Bœuf 30 jours", de: "30-Tage-Rindfleisch" },
    price: 15.0, category: "principales", icon: Beef, allergens: ["gluten"], available: true,
  },
  {
    id: "p10",
    name: { es: "Pizza margarita", en: "Margherita pizza", fr: "Pizza margherita", de: "Margherita-Pizza" },
    desc: { es: "Tomate, mozzarella", en: "Tomato, mozzarella", fr: "Tomate, mozzarella", de: "Tomate, Mozzarella" },
    price: 11.0, category: "principales", icon: Pizza, allergens: ["gluten", "leche"], available: true,
  },
  {
    id: "p11",
    name: { es: "Tarta de queso", en: "Cheesecake", fr: "Gâteau au fromage", de: "Käsekuchen" },
    desc: { es: "Estilo Donostia", en: "Donostia style", fr: "Style Donostia", de: "Donostia-Stil" },
    price: 6.5, category: "postres", icon: Cake, allergens: ["leche", "huevo"], tags: ["top"], available: true,
  },
  {
    id: "p12",
    name: { es: "Brownie helado", en: "Brownie ice cream", fr: "Brownie glace", de: "Brownie mit Eis" },
    desc: { es: "Chocolate negro", en: "Dark chocolate", fr: "Chocolat noir", de: "Dunkle Schokolade" },
    price: 7.0, category: "postres", icon: Cake, allergens: ["gluten", "leche", "huevo"], available: true,
  },
  {
    id: "p13",
    name: { es: "Helado artesano", en: "Artisan ice cream", fr: "Glace artisanale", de: "Handgemachtes Eis" },
    desc: { es: "3 bolas", en: "3 scoops", fr: "3 boules", de: "3 Kugeln" },
    price: 5.0, category: "postres", icon: IceCream, allergens: ["leche"], available: true,
  },
  {
    id: "p14",
    name: { es: "Café espresso", en: "Espresso", fr: "Espresso", de: "Espresso" },
    desc: { es: "Mezcla de casa", en: "House blend", fr: "Mélange maison", de: "Hausmischung" },
    price: 1.6, category: "barra", icon: Coffee, allergens: [], available: true,
  },
  {
    id: "p15",
    name: { es: "Copa de vino", en: "Glass of wine", fr: "Verre de vin", de: "Glas Wein" },
    desc: { es: "Tinto / blanco", en: "Red / white", fr: "Rouge / blanc", de: "Rot / Weiß" },
    price: 4.0, category: "barra", icon: Wine, allergens: [], available: true,
  },
  {
    id: "p16",
    name: { es: "Gintonic premium", en: "Premium gin tonic", fr: "Gin tonic premium", de: "Premium Gin Tonic" },
    desc: { es: "Tónica premium", en: "Premium tonic", fr: "Tonic premium", de: "Premium Tonic" },
    price: 9.0, category: "barra", icon: Martini, allergens: [], available: true,
  },
  {
    id: "p17",
    name: { es: "Refresco", en: "Soft drink", fr: "Soda", de: "Erfrischungsgetränk" },
    desc: { es: "Variedad", en: "Variety", fr: "Variété", de: "Sortiment" },
    price: 2.5, category: "barra", icon: GlassWater, allergens: [], available: true,
  },
  {
    id: "p18",
    name: { es: "Pollo al ast", en: "Rotisserie chicken", fr: "Poulet rôti", de: "Brathähnchen" },
    desc: { es: "Especiado", en: "Spiced", fr: "Épicé", de: "Gewürzt" },
    price: 13.0, category: "principales", icon: Beef, allergens: [], tags: ["picante"], available: false,
  },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function eur(n: number): string {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}


/* =========================================================
 * Mock QR component (SVG)
 * =======================================================*/
function MockQR({ label }: { label: string }) {
  // Generate a pseudo-random but deterministic pattern
  const cells = 21;
  const pattern: boolean[] = [];
  for (let i = 0; i < cells * cells; i++) {
    pattern.push((i * 17 + label.length * 13) % 3 === 0);
  }
  return (
    <div className="bg-white p-3 rounded-xl inline-block">
      <svg width="160" height="160" viewBox={`0 0 ${cells} ${cells}`} className="block">
        <rect width={cells} height={cells} fill="white" />
        {pattern.map((on, i) => {
          if (!on) return null;
          const x = i % cells;
          const y = Math.floor(i / cells);
          return <rect key={i} x={x} y={y} width="1" height="1" fill="black" />;
        })}
        {/* Corner markers */}
        {[
          { x: 0, y: 0 },
          { x: cells - 7, y: 0 },
          { x: 0, y: cells - 7 },
        ].map((corner, i) => (
          <g key={i}>
            <rect x={corner.x} y={corner.y} width="7" height="7" fill="black" />
            <rect x={corner.x + 1} y={corner.y + 1} width="5" height="5" fill="white" />
            <rect x={corner.x + 2} y={corner.y + 2} width="3" height="3" fill="black" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* =========================================================
 * Phone frame
 * =======================================================*/
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="relative rounded-[2.5rem] border-[10px] border-zinc-900 bg-zinc-950 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-20" aria-hidden />
        <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-6 pt-1.5 pb-1 text-[10px] text-muted-foreground font-mono">
          <span>14:32</span>
          <div className="flex items-center gap-1">
            <Signal className="h-3 w-3" />
            <Wifi className="h-3 w-3" />
            <Battery className="h-3 w-3" />
            <span>87%</span>
          </div>
        </div>
        <div className="pt-8 min-h-[680px] max-h-[80vh] overflow-y-auto rp-scroll-thin bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function CartaQrView() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [lang, setLang] = React.useState<Lang>("es");
  const [franja, setFranja] = React.useState<Franja>("cena");
  const [category, setCategory] = React.useState<Category>("entrantes");
  const [availability, setAvailability] = React.useState<Record<string, boolean>>(
    Object.fromEntries(PRODUCTS.map((p) => [p.id, p.available]))
  );
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [payOpen, setPayOpen] = React.useState(false);

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const cartTotal = cart.reduce((sum, line) => {
    const p = PRODUCTS.find((x) => x.id === line.productId);
    return sum + (p ? p.price * line.qty : 0);
  }, 0);

  const filteredProducts = React.useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (p.category !== category) return false;
      return true;
    });
  }, [category]);

  function toggleAvailability(productId: string) {
    setAvailability((prev) => {
      const next = { ...prev, [productId]: !prev[productId] };
      return next;
    });
    const p = PRODUCTS.find((x) => x.id === productId);
    if (p) {
      const newState = !availability[productId];
      toast({
        title: newState ? "Producto disponible" : "Producto agotado",
        description: `${p.name[lang]} ${newState ? "disponible" : "marcado como agotado"}`,
        variant: newState ? "default" : "destructive",
      });
    }
  }

  function addToCart(productId: string) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) => (l.productId === productId ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { productId, qty: 1 }];
    });
    const p = PRODUCTS.find((x) => x.id === productId);
    if (p) {
      toast({ title: "Añadido al carrito", description: p.name[lang], duration: 1500 });
    }
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, qty: Math.max(0, l.qty + delta) } : l))
        .filter((l) => l.qty > 0)
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }

  function pedirMesa() {
    if (cart.length === 0) return;
    toast({
      title: "Pedido enviado a mesa",
      description: `Mesa 7 · ${cartCount} artículos · cocina notificada`,
    });
    setPayOpen(false);
  }

  function pagarMesa() {
    if (cart.length === 0) return;
    toast({
      title: "Pago solicitado",
      description: `Mesa 7 · ${eur(cartTotal)} · link enviado al móvil`,
    });
    setPayOpen(false);
  }

  const t = reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };
  const franjaMeta = FRANJAS.find((f) => f.id === franja)!;

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">Carta QR · Order &amp; Pay</h1>
            
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Carta digital multiidioma, pedido y pago desde el móvil. Sin app, sin descargas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)] font-mono text-[10px] uppercase tracking-wider">
            <TrendingUp className="h-3 w-3" /> Pedidos QR hoy: 23 · Ticket medio +18%
          </Badge>
        </div>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-start gap-3">
          <div className="rounded-lg p-2 bg-foreground/[0.04] text-[var(--rp-emerald-soft)]">
            <QrCode className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Escaneos hoy</div>
            <div className="font-display text-xl">142</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">+23% vs ayer</div>
          </div>
        </div>
        <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-start gap-3">
          <div className="rounded-lg p-2 bg-foreground/[0.04] text-[var(--rp-violet-soft)]">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Conversión a pedido</div>
            <div className="font-display text-xl">68%</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">92 de 142 escaneos</div>
          </div>
        </div>
        <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-start gap-3">
          <div className="rounded-lg p-2 bg-foreground/[0.04] text-[var(--rp-yellow-soft)]">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Ticket medio QR</div>
            <div className="font-display text-xl">{eur(28.4)}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">+18% vs TPV</div>
          </div>
        </div>
        <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-start gap-3">
          <div className="rounded-lg p-2 bg-foreground/[0.04] text-[var(--rp-blue-soft)]">
            <Languages className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Idiomas activos</div>
            <div className="font-display text-xl">4</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">ES · EN · FR · DE</div>
          </div>
        </div>
      </div>

      {/* Upsell IA banner */}
      <div className="rp-glass rounded-xl p-4 flex items-center gap-4 border-l-4 border-l-[var(--rp-violet)]/60">
        <div className="rounded-lg p-2.5 bg-[var(--rp-violet)]/15 text-[var(--rp-violet-soft)]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium flex items-center gap-2">
            Upsell IA activo
            <Badge variant="outline" className="text-[10px] font-mono border-[var(--rp-violet)]/40 text-[var(--rp-violet-soft)] bg-[var(--rp-violet)]/10">
              +12% ticket
            </Badge>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Recomendaciones contextuales por hora, franja y carrito del cliente · 18 sugerencias servidas hoy
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast({ title: "Configuración upsell", description: "Abriendo panel de reglas IA" })}>
          <ChevronRight className="h-4 w-4" /> Configurar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
        {/* Left: QR preview + config */}
        <div className="space-y-4">
          {/* QR card */}
          <div className="rp-glass rounded-xl p-5 text-center space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Código QR · Mesa 7</h3>
              <Badge variant="outline" className="text-[10px] font-mono">Sala</Badge>
            </div>
            <div className="flex justify-center py-2">
              <MockQR label="restopanel-mesa7-sala" />
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="font-mono">https://rsto.app/m7</div>
              <div className="mt-1">Escanea para ver la carta, pedir y pagar en mesa</div>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Descarga iniciada", description: "QR Mesa 7 · PNG 1024px" })}>
                <Smartphone className="h-3.5 w-3.5" /> Descargar PNG
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Impresión enviada", description: "Soporte portacesillas · 5x5cm" })}>
                <Tablet className="h-3.5 w-3.5" /> Imprimir
              </Button>
            </div>
          </div>

          {/* Lang selector */}
          <div className="rp-glass rounded-xl p-4 space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
              Idioma de previsualización
            </div>
            <div className="grid grid-cols-4 gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLang(l.id)}
                  className={cn(
                    "rounded-lg border p-2 text-center transition-colors",
                    lang === l.id
                      ? "border-[var(--rp-emerald)]/60 bg-[var(--rp-emerald)]/10 text-[var(--rp-emerald-soft)]"
                      : "border-border hover:bg-foreground/5"
                  )}
                >
                  <div className="text-lg leading-none">{l.flag}</div>
                  <div className="text-[10px] font-mono mt-1 uppercase tracking-wider">{l.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Franja */}
          <div className="rp-glass rounded-xl p-4 space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
              Carta por franja
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FRANJAS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFranja(f.id)}
                  className={cn(
                    "rounded-lg border p-2.5 text-left transition-colors flex items-center gap-2",
                    franja === f.id
                      ? "border-[var(--rp-emerald)]/60 bg-[var(--rp-emerald)]/10"
                      : "border-border hover:bg-foreground/5"
                  )}
                >
                  <f.icon className={cn("h-4 w-4", f.cls)} />
                  <div>
                    <div className="text-xs font-medium">{f.label}</div>
                    <div className="text-[10px] text-muted-foreground">12:00–16:00</div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Franja activa: <span className="font-mono text-foreground">{franjaMeta.label}</span> · carta con {PRODUCTS.length} productos
            </p>
          </div>

          {/* Disponibilidad toggle list */}
          <div className="rp-glass rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                Disponibilidad
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {Object.values(availability).filter(Boolean).length} / {PRODUCTS.length}
              </Badge>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto rp-scroll-thin pr-1">
              {PRODUCTS.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 rounded-md p-1.5 hover:bg-foreground/[0.03]">
                  <div className="flex items-center gap-2 min-w-0">
                    <p.icon className="h-3.5 w-3.5 text-[var(--rp-emerald-soft)] shrink-0" />
                    <span className="text-xs truncate">{p.name.es}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground font-mono">{eur(p.price)}</span>
                    <Switch
                      checked={availability[p.id]}
                      onCheckedChange={() => toggleAvailability(p.id)}
                      aria-label={`Disponibilidad de ${p.name.es}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: phone mockup */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg">Vista cliente en móvil</h3>
            <Badge variant="outline" className="text-[10px] font-mono">Mesa 7 · Sala</Badge>
          </div>

          <PhoneFrame>
            <div className="p-4 space-y-3">
              {/* Restaurant header */}
              <div className="rounded-xl bg-gradient-to-br from-[var(--rp-emerald)]/20 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-base">RestoPanel Demo</div>
                    <div className="text-[10px] text-muted-foreground">Mesa 7 · Sala · Operador: Anna</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Franja</div>
                    <div className={cn("text-xs font-medium", franjaMeta.cls)}>{franjaMeta.label}</div>
                  </div>
                </div>
              </div>

              {/* Lang selector (in-app) */}
              <div className="flex items-center gap-1">
                {LANGS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLang(l.id)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-mono transition-colors",
                      lang === l.id
                        ? "bg-foreground text-background"
                        : "bg-foreground/[0.06] text-muted-foreground"
                    )}
                  >
                    {l.flag} {l.label}
                  </button>
                ))}
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
                    <c.icon className="h-3.5 w-3.5" /> {c.label[lang]}
                  </button>
                ))}
              </div>

              {/* Product list */}
              <div className="space-y-2">
                {filteredProducts.map((p, i) => {
                  const available = availability[p.id];
                  return (
                    <motion.div
                      key={p.id}
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...t, delay: reduce ? 0 : Math.min(i * 0.03, 0.25) }}
                      className={cn(
                        "rp-glass rounded-xl p-3 flex items-center gap-3 transition-all",
                        !available && "opacity-50"
                      )}
                    >
                      <div className="rounded-lg p-2 bg-foreground/[0.04] text-[var(--rp-emerald-soft)] shrink-0">
                        <p.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium truncate">{p.name[lang]}</span>
                          {p.tags?.includes("top") && (
                            <Star className="h-3 w-3 text-[var(--rp-yellow-soft)] fill-[var(--rp-yellow)] shrink-0" />
                          )}
                          {p.tags?.includes("nuevo") && (
                            <Badge variant="outline" className="text-[9px] uppercase tracking-wider px-1 py-0 h-3.5 font-mono border-[var(--rp-emerald)]/40 text-[var(--rp-emerald-soft)] bg-[var(--rp-emerald)]/10">
                              nuevo
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">{p.desc[lang]}</div>
                        {/* Allergens */}
                        <div className="flex items-center gap-1.5 mt-1">
                          {p.allergens.map((a) => {
                            const m = ALLERGEN_META[a];
                            return (
                              <span key={a} className={cn("inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider font-mono", m.cls)} title={m.label}>
                                <m.icon className="h-2.5 w-2.5" />
                              </span>
                            );
                          })}
                          {p.allergens.length === 0 && (
                            <span className="text-[9px] uppercase tracking-wider font-mono text-[var(--rp-emerald-soft)]">
                              sin alérgenos
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display text-sm text-[var(--rp-emerald-soft)]">{eur(p.price)}</div>
                        {available ? (
                          <Button size="sm" onClick={() => addToCart(p.id)} className="h-7 mt-1 bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]">
                            <Plus className="h-3 w-3" /> Añadir
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-[9px] uppercase tracking-wider px-1.5 py-0 h-4 font-mono mt-1 border-[var(--rp-red)]/40 text-[var(--rp-red-soft)] bg-[var(--rp-red)]/10">
                            Agotado
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </PhoneFrame>

          {/* Cart preview / Order & Pay */}
          <div className="rp-glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 text-[var(--rp-emerald-soft)]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[var(--rp-emerald)] text-black text-[10px] font-mono font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-base">Carrito · Mesa 7</h3>
              </div>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setCart([])} className="text-[var(--rp-red-soft)] hover:bg-[var(--rp-red)]/10">
                  <X className="h-3.5 w-3.5" /> Vaciar
                </Button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-sm text-muted-foreground py-6"
                >
                  Sin productos en el carrito
                </motion.div>
              ) : (
                <motion.div layout className="space-y-1.5 max-h-48 overflow-y-auto rp-scroll-thin pr-1">
                  {cart.map((line) => {
                    const p = PRODUCTS.find((x) => x.id === line.productId);
                    if (!p) return null;
                    return (
                      <motion.div
                        key={line.productId}
                        layout
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={t}
                        className="flex items-center gap-2 rounded-lg border border-border bg-foreground/[0.03] p-2"
                      >
                        <p.icon className="h-4 w-4 text-[var(--rp-emerald-soft)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{p.name[lang]}</div>
                          <div className="text-[11px] text-muted-foreground">{eur(p.price)} c/u</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => changeQty(line.productId, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-5 text-center text-sm font-mono">{line.qty}</span>
                          <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => changeQty(line.productId, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-sm font-display w-16 text-right">{eur(p.price * line.qty)}</div>
                        <Button size="sm" variant="ghost" className="h-6 p-0 w-6 text-[var(--rp-red-soft)]" onClick={() => removeFromCart(line.productId)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {cart.length > 0 && (
              <>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{eur(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-base font-display">
                  <span>Total</span>
                  <span className="text-[var(--rp-emerald-soft)]">{eur(cartTotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" onClick={pedirMesa} className="border-[var(--rp-blue)]/40 text-[var(--rp-blue-soft)] hover:bg-[var(--rp-blue)]/10">
                    <UtensilsCrossed className="h-4 w-4" /> Pedir a mesa
                  </Button>
                  <Button onClick={pagarMesa} className="bg-[var(--rp-emerald)] text-black hover:bg-[var(--rp-emerald-soft)]">
                    <CreditCard className="h-4 w-4" /> Pagar en mesa
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  Sin descargas · pago con Bizum, tarjeta o Apple/Google Pay
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartaQrView;
