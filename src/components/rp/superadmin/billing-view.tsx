"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard, Download, RefreshCw, ExternalLink, Check, Crown, Sparkles,
  TrendingUp, FileText, CalendarDays, AlertCircle, Lock, ShieldCheck, Zap,
} from "lucide-react";

function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider", className)}>
      demo
    </Badge>
  );
}

/* ---------------- usage data ---------------- */
const USAGE = [
  { label: "Reservas", current: 1247, max: 5000, unit: "", icon: CalendarDays, accent: "gold" as const },
  { label: "Emails", current: 320, max: null, unit: "", icon: FileText, accent: "teal" as const },
  { label: "Whatapps", current: 89, max: 500, unit: "", icon: Sparkles, accent: "gold" as const },
  { label: "IA credits", current: 412, max: 2000, unit: " cr", icon: Zap, accent: "teal" as const },
  { label: "Almacenamiento", current: 1.2, max: 50, unit: "GB", icon: ShieldCheck, accent: "gold" as const },
];

function UsageBar({ u }: { u: typeof USAGE[number] }) {
  const Icon = u.icon;
  const pct = u.max ? Math.min(100, (u.current / u.max) * 100) : 0;
  const isUnlimited = u.max === null;
  const color = u.accent === "gold" ? "var(--gold)" : "var(--teal)";
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", u.accent === "gold" ? "rp-gold-text" : "rp-teal-text")} aria-hidden />
          <span className="text-sm font-medium">{u.label}</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {u.current.toLocaleString("es-ES")}{u.unit} {isUnlimited ? "/ ilimitado" : `/ ${u.max?.toLocaleString("es-ES")}${u.unit}`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
        {isUnlimited ? (
          <div className="h-full w-full bg-gradient-to-r from-[var(--teal)]/40 to-transparent flex items-center pl-2">
            <span className="text-[10px] font-mono text-[var(--teal)]">ilimitado en tu plan</span>
          </div>
        ) : (
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct > 80 ? "linear-gradient(90deg, #f59e0b, #ef4444)" : `linear-gradient(90deg, ${color}, ${u.accent === "gold" ? "var(--gold-deep)" : "var(--teal-deep)"})`,
            }}
          />
        )}
      </div>
      {!isUnlimited && (
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          {pct.toFixed(0)}% consumido · {((u.max ?? 0) - u.current).toLocaleString("es-ES")}{u.unit} restantes
        </div>
      )}
    </div>
  );
}

/* ---------------- invoices ---------------- */
type InvoiceStatus = "paid" | "failed" | "pending";
const INVOICES: {
  id: string; date: string; number: string; amount: number;
  status: InvoiceStatus;
}[] = [
  { id: "i1", date: "2025-07-01", number: "RP-2025-0007", amount: 149, status: "paid" },
  { id: "i2", date: "2025-06-01", number: "RP-2025-0006", amount: 149, status: "paid" },
  { id: "i3", date: "2025-05-01", number: "RP-2025-0005", amount: 149, status: "paid" },
  { id: "i4", date: "2025-04-01", number: "RP-2025-0004", amount: 149, status: "failed" },
  { id: "i5", date: "2025-03-01", number: "RP-2025-0003", amount: 149, status: "paid" },
  { id: "i6", date: "2025-08-01", number: "RP-2025-0008", amount: 149, status: "pending" },
];

function InvoiceStatusPill({ status }: { status: InvoiceStatus }) {
  const map = {
    paid: { label: "Pagada", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
    failed: { label: "Fallida", cls: "border-rose-400/50 bg-rose-400/10 text-rose-300", dot: "bg-rose-400" },
    pending: { label: "Pendiente", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs", map.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", map.dot)} />{map.label}
    </span>
  );
}

/* ---------------- pricing dialog ---------------- */
const PLANS = [
  { id: "starter", name: "Starter", price: 49, features: ["1 local", "1.000 reservas/mes", "CRM básico", "Email transaccional"], current: false },
  { id: "professional", name: "Professional", price: 149, features: ["5 locales", "10 usuarios", "5.000 reservas/mes", "IA incluida (2k cr)", "WhatsApp + Reviews"], current: true },
  { id: "enterprise", name: "Enterprise", price: 499, features: ["Locales ilimitados", "Usuarios ilimitados", "Reservas ilimitadas", "IA avanzada + SSO", "Soporte 24/7 + SLA"], current: false },
];

/* ---------------- main view ---------------- */
export function BillingView() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = React.useState<string>("Todas");
  const [pricingOpen, setPricingOpen] = React.useState(false);
  const [updateCardOpen, setUpdateCardOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);

  const [cardForm, setCardForm] = React.useState({ number: "", expiry: "", cvc: "", name: "" });
  const [cardErr, setCardErr] = React.useState<string | null>(null);

  const filteredInvoices = INVOICES.filter((i) => statusFilter === "Todas" || i.status === statusFilter);

  const downloadInvoice = (n: string) => {
    toast({ title: "Descargando factura (demo)", description: `${n}.pdf — generando…` });
  };

  const submitCardUpdate = () => {
    setCardErr(null);
    if (!cardForm.name.trim()) { setCardErr("El nombre del titular es obligatorio."); return; }
    if (cardForm.number.replace(/\s/g, "").length < 15) { setCardErr("El número de tarjeta no es válido."); return; }
    if (!/^\d{2}\/\d{2}$/.test(cardForm.expiry)) { setCardErr("La caducidad debe tener formato MM/AA."); return; }
    if (cardForm.cvc.length < 3) { setCardErr("El CVC debe tener al menos 3 dígitos."); return; }
    toast({ title: "Método de pago actualizado (demo)", description: "Tarjeta •••• " + cardForm.number.slice(-4) + " configurada." });
    setCardForm({ number: "", expiry: "", cvc: "", name: "" });
    setUpdateCardOpen(false);
  };

  const changePlan = () => {
    if (!selectedPlan) { toast({ title: "Selecciona un plan (demo)", variant: "destructive" }); return; }
    const plan = PLANS.find((p) => p.id === selectedPlan);
    toast({ title: `Cambio a plan ${plan?.name} solicitado (demo)`, description: `Prorrata aplicada · ${plan?.price}€/mes` });
    setPricingOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <header className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-center">
            <CreditCard className="h-5 w-5 rp-gold-text" aria-hidden />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">Facturación</h1>
          <DemoBadge />
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Gestiona tu plan, método de pago y facturas. Todos los movimientos y datos son demostrativos.
        </p>
      </header>

      {/* Current plan + payment method */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Plan card */}
        <div className="rp-glass rp-glow-gold rounded-xl p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 rp-gold-text" aria-hidden />
                <h3 className="font-display text-xl font-medium">Plan Professional</h3>
                <Badge className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]">actual</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">5 locales · 10 usuarios · IA incluida</p>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-light rp-gold-text">149€<span className="text-sm text-muted-foreground font-sans">/mes</span></div>
              <div className="text-[11px] text-muted-foreground">+ IVA</div>
            </div>
          </div>
          <Separator className="my-3 bg-border/40" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Próxima renovación</div>
              <div className="mt-0.5 flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" aria-hidden /> 1 ago 2025</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Ciclo</div>
              <div className="mt-0.5">Mensual · automático</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Estado</div>
              <div className="mt-0.5 text-emerald-300 flex items-center gap-1.5"><Check className="h-3.5 w-3.5" aria-hidden /> Activo</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => setPricingOpen(true)}><Sparkles className="h-4 w-4 mr-1.5" aria-hidden /> Cambiar plan</Button>
            <Button variant="outline" onClick={() => toast({ title: "Cancelación solicitada (demo)", description: "El plan se cancelará al final del ciclo." })}>
              Cancelar suscripción
            </Button>
          </div>
        </div>

        {/* Payment method */}
        <div className="rp-glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-4 w-4 rp-teal-text" aria-hidden />
            <h3 className="font-medium">Método de pago</h3>
          </div>
          <div className="rounded-lg border border-border/40 p-4 bg-background/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-12 rounded bg-gradient-to-br from-[var(--gold)]/30 to-[var(--gold-deep)]/30 border border-[var(--gold)]/30 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 rp-gold-text" aria-hidden />
                </div>
                <div>
                  <div className="text-sm font-mono">•••• 4242</div>
                  <div className="text-[11px] text-muted-foreground">Visa · caduca 12/27</div>
                </div>
              </div>
              <Badge className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px]">verificada</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => setUpdateCardOpen(true)}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Actualizar
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground" onClick={() => toast({ title: "Abriendo Stripe Portal (demo)", description: "Serás redirigido al portal de cliente." })}>
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Gestionar en Stripe Portal
          </Button>
        </div>
      </div>

      {/* Usage this period */}
      <section>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h2 className="font-display text-lg sm:text-xl font-medium tracking-tight">Uso del período</h2>
          <span className="text-[11px] text-muted-foreground font-mono">01 jul — 31 jul 2025</span>
          <DemoBadge />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {USAGE.map((u) => <UsageBar key={u.label} u={u} />)}
        </div>
      </section>

      {/* Invoices */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg sm:text-xl font-medium tracking-tight">Facturas</h2>
            <DemoBadge />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              {["Todas", "paid", "failed", "pending"].map((s) => <SelectItem key={s} value={s}>{s === "Todas" ? "Todas" : s === "paid" ? "Pagadas" : s === "failed" ? "Fallidas" : "Pendientes"}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="rp-glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto rp-scroll-thin">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-foreground/[0.03]">
                  <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Fecha</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Nº factura</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Importe</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No hay facturas con este filtro.</td></tr>
                )}
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.03]">
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(inv.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="px-4 py-3 font-mono text-xs">{inv.number}</td>
                    <td className="px-4 py-3 text-right font-mono">{inv.amount.toFixed(2)}€</td>
                    <td className="px-4 py-3"><InvoiceStatusPill status={inv.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => downloadInvoice(inv.number)} disabled={inv.status === "pending"}>
                        <Download className="h-3.5 w-3.5 mr-1" aria-hidden /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing dialog */}
      <Dialog open={pricingOpen} onOpenChange={setPricingOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 rp-gold-text" aria-hidden /> Cambiar plan <DemoBadge /></DialogTitle>
            <DialogDescription>Selecciona el plan que mejor se adapta a tu organización. Prorrata automática.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLANS.map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlan(p.id)}
                  className={cn(
                    "text-left rounded-xl border p-4 transition-all relative",
                    isSelected ? "border-[var(--gold)] bg-[var(--gold)]/5 rp-glow-gold"
                    : p.current ? "border-[var(--teal)]/40 bg-[var(--teal)]/5"
                    : "border-border/60 hover:border-[var(--gold)]/40 hover:bg-foreground/[0.03]"
                  )}
                >
                  {p.current && (
                    <Badge className="absolute -top-2 right-3 border-[var(--teal)]/40 bg-[var(--teal)]/15 text-[var(--teal)] text-[10px]">actual</Badge>
                  )}
                  <div className="font-display text-lg font-medium">{p.name}</div>
                  <div className="mt-1 font-display text-2xl font-light rp-gold-text">{p.price}€<span className="text-xs text-muted-foreground font-sans">/mes</span></div>
                  <ul className="mt-3 space-y-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-1.5 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" aria-hidden />{f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPricingOpen(false)}>Cancelar</Button>
            <Button onClick={changePlan}>Confirmar cambio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update card dialog */}
      <Dialog open={updateCardOpen} onOpenChange={(o) => { setUpdateCardOpen(o); if (!o) setCardErr(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4" aria-hidden /> Actualizar método de pago <DemoBadge /></DialogTitle>
            <DialogDescription>Introduce los datos de la nueva tarjeta. Procesado por Stripe (demo).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="card-name" className="text-xs">Titular de la tarjeta</Label>
              <Input id="card-name" placeholder="Ana Martínez" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="card-number" className="text-xs">Número de tarjeta</Label>
              <Input id="card-number" inputMode="numeric" placeholder="4242 4242 4242 4242" value={cardForm.number}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
                  setCardForm({ ...cardForm, number: formatted });
                }} className="mt-1.5 font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="card-expiry" className="text-xs">Caducidad</Label>
                <Input id="card-expiry" placeholder="MM/AA" value={cardForm.expiry}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                    setCardForm({ ...cardForm, expiry: v });
                  }} className="mt-1.5 font-mono" />
              </div>
              <div>
                <Label htmlFor="card-cvc" className="text-xs">CVC</Label>
                <Input id="card-cvc" inputMode="numeric" placeholder="123" value={cardForm.cvc}
                  onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} className="mt-1.5 font-mono" />
              </div>
            </div>
            <div className="rounded-md border border-border/40 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 rp-teal-text" aria-hidden />
              <span>Los datos de la tarjeta se tokenizan vía Stripe Elements y nunca tocan nuestros servidores. Modo demo: no se realiza cargo real.</span>
            </div>
            {cardErr && (
              <div className="rounded-md border border-rose-400/40 bg-rose-400/10 p-2.5 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden /><span>{cardErr}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateCardOpen(false)}>Cancelar</Button>
            <Button onClick={submitCardUpdate}><Lock className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Guardar tarjeta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
