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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Building2,
  MapPin,
  User,
  Palette,
  Users,
  FileText,
  Shield,
  Sparkles,
  AlertTriangle,
  Lock,
  Loader2,
  Check,
  X,
  Store,
  Mail,
  Calendar,
  Wand2,
  Rocket,
  Server,
  Database,
  Cloud,
  KeyRound,
  Webhook,
  Bot,
  Boxes,
  Receipt,
  Crown,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type Plan = "Starter" | "Professional" | "Enterprise";

interface WizardState {
  plan: Plan | null;
  companyName: string;
  cif: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  brandName: string;
  brandColor: string;
  capacity: number;
  legalAccepted: boolean;
  marketingAccepted: boolean;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

const STEPS = [
  { id: "plan", label: "Plan", icon: Crown },
  { id: "company", label: "Empresa", icon: Building2 },
  { id: "location", label: "Ubicación", icon: MapPin },
  { id: "contact", label: "Contacto", icon: User },
  { id: "brand", label: "Marca", icon: Palette },
  { id: "capacity", label: "Capacidad", icon: Users },
  { id: "plan-confirm", label: "Plan", icon: Receipt },
  { id: "legal", label: "Legal", icon: FileText },
  { id: "checkout", label: "Stripe", icon: CreditCard },
  { id: "provisioning", label: "Provisioning", icon: Rocket },
] as const;

const PLANS: { id: Plan; price: number; tagline: string; features: string[]; color: string; icon: React.ElementType }[] = [
  {
    id: "Starter",
    price: 49,
    tagline: "Para 1 local · ideal para empezar",
    features: ["1 local", "5 usuarios", "Reservas ilimitadas", "Carta QR", "Soporte email"],
    color: "var(--rp-blue)",
    icon: Store,
  },
  {
    id: "Professional",
    price: 149,
    tagline: "Para 1-5 locales · el más elegido",
    features: ["Hasta 5 locales", "25 usuarios", "Multi-marcas", "AI Copilot", "Soporte prioritario"],
    color: "var(--rp-emerald)",
    icon: Sparkles,
  },
  {
    id: "Enterprise",
    price: 490,
    tagline: "Para cadenas y franquicias",
    features: ["Locales ilimitados", "200 usuarios", "Modo franquicia", "Apps privadas", "CSM dedicado"],
    color: "var(--rp-violet)",
    icon: Crown,
  },
];

const BRAND_COLORS = [
  { name: "Esmeralda", value: "var(--rp-emerald)" },
  { name: "Azul", value: "var(--rp-blue)" },
  { name: "Violeta", value: "var(--rp-violet)" },
  { name: "Amarillo", value: "var(--rp-yellow)" },
  { name: "Rojo", value: "var(--rp-red)" },
];

const PROVISIONING_STEPS = [
  { id: "org", label: "Crear organización", icon: Building2 },
  { id: "tenant", label: "Provisionar tenant cell", icon: Server },
  { id: "db", label: "Crear D1 schema", icon: Database },
  { id: "kv", label: "Inicializar KV namespaces", icon: Database },
  { id: "r2", label: "Crear buckets R2 (imágenes)", icon: Cloud },
  { id: "stripe", label: "Vincular cliente Stripe", icon: CreditCard },
  { id: "entitlements", label: "Aplicar entitlements del plan", icon: Shield },
  { id: "api", label: "Generar API keys", icon: KeyRound },
  { id: "webhooks", label: "Configurar webhooks base", icon: Webhook },
  { id: "ai", label: "Cargar knowledge base IA", icon: Bot },
  { id: "seed", label: "Cargar carta y zonas demo", icon: Boxes },
  { id: "email", label: "Enviar email de bienvenida", icon: Mail },
] as const;

const TAKEN_EMAILS = ["ana@ramses.com", "owner@existente.com", "hola@sakura.es"];
const TAKEN_CIFS = ["B12345678", "A87654321", "B55667788"];

/* =========================================================
 * Validation
 * =======================================================*/
const CIF_REGEX = /^[A-HJ-NP-SUVW]\d{8}$/i;
const CP_ES_REGEX = /^\d{5}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CARD_REGEX = /^[\d\s]{16,19}$/;
const EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVC_REGEX = /^\d{3,4}$/;

function validateField<K extends keyof WizardState>(field: K, value: WizardState[K], state: WizardState): string | null {
  switch (field) {
    case "companyName":
      if (!value) return "Razón social obligatoria";
      if (String(value).length < 3) return "Mínimo 3 caracteres";
      return null;
    case "cif": {
      const v = String(value).trim().toUpperCase();
      if (!v) return "CIF obligatorio";
      if (!CIF_REGEX.test(v)) return "Formato CIF inválido (ej: B12345678)";
      if (TAKEN_CIFS.includes(v)) return "CIF ya registrado · contacta soporte";
      return null;
    }
    case "postalCode": {
      const v = String(value).trim();
      if (!v) return "Código postal obligatorio";
      if (state.country === "España" && !CP_ES_REGEX.test(v)) return "CP español: 5 dígitos";
      return null;
    }
    case "address":
      if (!value) return "Dirección obligatoria";
      if (String(value).length < 5) return "Mínimo 5 caracteres";
      return null;
    case "city":
      if (!value) return "Ciudad obligatoria";
      return null;
    case "contactName":
      if (!value) return "Nombre obligatorio";
      return null;
    case "contactEmail": {
      const v = String(value).trim().toLowerCase();
      if (!v) return "Email obligatorio";
      if (!EMAIL_REGEX.test(v)) return "Email inválido";
      if (TAKEN_EMAILS.includes(v)) return "Email ya registrado · inicia sesión";
      return null;
    }
    case "contactPhone": {
      const v = String(value).trim();
      if (!v) return "Teléfono obligatorio";
      if (v.replace(/\s/g, "").length < 9) return "Mínimo 9 dígitos";
      return null;
    }
    case "brandName":
      if (!value) return "Nombre de marca obligatorio";
      return null;
    case "capacity": {
      const n = Number(value);
      if (!n || n < 1) return "Capacidad mínima: 1";
      if (n > 2000) return "Capacidad máxima: 2000";
      return null;
    }
    case "cardNumber": {
      const v = String(value).replace(/\s/g, "");
      if (!v) return "Número de tarjeta obligatorio";
      if (!CARD_REGEX.test(v) || v.length < 16) return "16 dígitos requeridos";
      return null;
    }
    case "cardExpiry": {
      const v = String(value).trim();
      if (!v) return "Fecha obligatoria (MM/AA)";
      if (!EXPIRY_REGEX.test(v)) return "Formato MM/AA";
      return null;
    }
    case "cardCvc": {
      const v = String(value).trim();
      if (!v) return "CVC obligatorio";
      if (!CVC_REGEX.test(v)) return "3-4 dígitos";
      return null;
    }
    case "cardName":
      if (!value) return "Nombre del titular obligatorio";
      return null;
    default:
      return null;
  }
}

/* =========================================================
 * LocalStorage draft
 * =======================================================*/
const STORAGE_KEY = "rp-signup-draft-v1";

function loadDraft(): Partial<WizardState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<WizardState>) : null;
  } catch {
    return null;
  }
}

function saveDraft(state: WizardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function clearDraft() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/* =========================================================
 * Step header
 * =======================================================*/
function Stepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto rp-scroll-thin pb-1">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isDone = i < current;
        const isCurrent = i === current;
        return (
          <React.Fragment key={s.id}>
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] whitespace-nowrap shrink-0",
                isCurrent && "bg-[var(--rp-emerald)]/15 text-[var(--rp-emerald)] ring-1 ring-[var(--rp-emerald)]/30",
                isDone && "text-[var(--rp-emerald)]",
                !isCurrent && !isDone && "text-muted-foreground"
              )}
            >
              {isDone
                ? <Check className="h-3 w-3" aria-hidden />
                : <Icon className="h-3 w-3" aria-hidden />}
              <span className="font-mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < total - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" aria-hidden />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* =========================================================
 * Field wrapper
 * =======================================================*/
function Field({ label, error, hint, children, required }: {
  label: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] flex items-center gap-1">
        {label} {required && <span className="text-[var(--rp-red)]">*</span>}
      </Label>
      {children}
      {error
        ? <p className="text-[10px] text-[var(--rp-red)] flex items-center gap-1"><AlertTriangle className="h-2.5 w-2.5" aria-hidden /> {error}</p>
        : hint ? <p className="text-[10px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/
export function SignupFunnelView() {
  const { toast } = useToast();
  const [step, setStep] = React.useState(0);
  const [state, setState] = React.useState<WizardState>({
    plan: null,
    companyName: "",
    cif: "",
    address: "",
    postalCode: "",
    city: "",
    country: "España",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    brandName: "",
    brandColor: "var(--rp-emerald)",
    capacity: 50,
    legalAccepted: false,
    marketingAccepted: false,
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof WizardState, string | null>>>({});
  const [emailChecking, setEmailChecking] = React.useState(false);
  const [cifChecking, setCifChecking] = React.useState(false);
  const [emailTaken, setEmailTaken] = React.useState(false);
  const [cifTaken, setCifTaken] = React.useState(false);
  const [checkoutProcessing, setCheckoutProcessing] = React.useState(false);
  const [provisioningStep, setProvisioningStep] = React.useState(-1);
  const [provisioningDone, setProvisioningDone] = React.useState(false);

  // Load draft on mount
  React.useEffect(() => {
    const draft = loadDraft();
    if (draft && Object.keys(draft).length > 0) {
      setState(prev => ({ ...prev, ...draft }));
      toast({ title: "Draft recuperado", description: "Continuamos donde lo dejaste." });
    }
  }, []);

  // Save draft on change (debounced via rAF)
  React.useEffect(() => {
    const id = requestAnimationFrame(() => saveDraft(state));
    return () => cancelAnimationFrame(id);
  }, [state]);

  // Email duplicate check (debounced)
  React.useEffect(() => {
    if (!state.contactEmail) return;
    if (!EMAIL_REGEX.test(state.contactEmail)) return;
    setEmailChecking(true);
    const id = setTimeout(() => {
      const taken = TAKEN_EMAILS.includes(state.contactEmail.trim().toLowerCase());
      setEmailTaken(taken);
      setEmailChecking(false);
    }, 600);
    return () => clearTimeout(id);
  }, [state.contactEmail]);

  // CIF duplicate check (debounced)
  React.useEffect(() => {
    const v = state.cif.trim().toUpperCase();
    if (!v || !CIF_REGEX.test(v)) return;
    setCifChecking(true);
    const id = setTimeout(() => {
      const taken = TAKEN_CIFS.includes(v);
      setCifTaken(taken);
      setCifChecking(false);
    }, 600);
    return () => clearTimeout(id);
  }, [state.cif]);

  // Provisioning animation
  React.useEffect(() => {
    if (step !== 9) return;
    if (provisioningDone) return;
    if (provisioningStep === -1) {
      setProvisioningStep(0);
      return;
    }
    if (provisioningStep >= PROVISIONING_STEPS.length) {
      const id = setTimeout(() => setProvisioningDone(true), 600);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setProvisioningStep(s => s + 1), 500 + Math.random() * 400);
    return () => clearTimeout(id);
  }, [step, provisioningStep, provisioningDone]);

  const update = <K extends keyof WizardState>(field: K, value: WizardState[K]) => {
    setState(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof WizardState, string | null>> = {};
    let ok = true;

    if (step === 0) {
      if (!state.plan) { newErrors.plan = "Selecciona un plan"; ok = false; }
    }
    if (step === 1) {
      (["companyName", "cif"] as const).forEach(f => {
        const e = validateField(f, state[f], state);
        if (e) { newErrors[f] = e; ok = false; }
      });
      if (cifTaken) { newErrors.cif = "CIF ya registrado"; ok = false; }
    }
    if (step === 2) {
      (["address", "postalCode", "city"] as const).forEach(f => {
        const e = validateField(f, state[f], state);
        if (e) { newErrors[f] = e; ok = false; }
      });
    }
    if (step === 3) {
      (["contactName", "contactEmail", "contactPhone"] as const).forEach(f => {
        const e = validateField(f, state[f], state);
        if (e) { newErrors[f] = e; ok = false; }
      });
      if (emailTaken) { newErrors.contactEmail = "Email ya registrado"; ok = false; }
    }
    if (step === 4) {
      (["brandName"] as const).forEach(f => {
        const e = validateField(f, state[f], state);
        if (e) { newErrors[f] = e; ok = false; }
      });
    }
    if (step === 5) {
      const e = validateField("capacity", state.capacity, state);
      if (e) { newErrors.capacity = e; ok = false; }
    }
    if (step === 7) {
      if (!state.legalAccepted) { newErrors.legalAccepted = "Debes aceptar los términos"; ok = false; }
    }
    if (step === 8) {
      (["cardName", "cardNumber", "cardExpiry", "cardCvc"] as const).forEach(f => {
        const e = validateField(f, state[f], state);
        if (e) { newErrors[f] = e; ok = false; }
      });
    }

    setErrors(newErrors);
    if (!ok) {
      toast({ title: "Revisa los campos", description: "Hay errores en el formulario.", variant: "destructive" });
    }
    return ok;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step === 8) {
      // process checkout
      setCheckoutProcessing(true);
      setTimeout(() => {
        setCheckoutProcessing(false);
        setStep(9);
        setProvisioningStep(-1);
        setProvisioningDone(false);
      }, 1800);
      return;
    }
    setStep(s => Math.min(STEPS.length - 1, s + 1));
  };

  const back = () => setStep(s => Math.max(0, s - 1));

  const reset = () => {
    clearDraft();
    setStep(0);
    setState({
      plan: null, companyName: "", cif: "", address: "", postalCode: "", city: "", country: "España",
      contactName: "", contactEmail: "", contactPhone: "", brandName: "", brandColor: "var(--rp-emerald)",
      capacity: 50, legalAccepted: false, marketingAccepted: false,
      cardNumber: "", cardExpiry: "", cardCvc: "", cardName: "",
    });
    setErrors({});
    setProvisioningDone(false);
    setProvisioningStep(-1);
    toast({ title: "Funnel reiniciado", description: "Draft borrado." });
  };

  const selectedPlan = PLANS.find(p => p.id === state.plan);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--rp-emerald)]/15 p-2">
            <Wand2 className="h-5 w-5 text-[var(--rp-emerald)]" aria-hidden />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight">Alta automática</h2>
            <p className="text-xs text-muted-foreground">Self-service signup con provisioning en tiempo real.</p>
          </div>
        </div>
        <Badge variant="outline" className="border-[var(--rp-emerald)]/40 text-[var(--rp-emerald)]">
          Paso {step + 1} de {STEPS.length}
        </Badge>
      </div>

      {/* Stepper */}
      <div className="rp-glass rounded-xl border border-border/60 p-3">
        <Stepper current={step} total={STEPS.length} />
      </div>

      {/* Step content */}
      <div className="rp-glass rounded-xl border border-border/60 p-5 min-h-[400px]">
        {/* Step 0: Plan */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Elige tu plan</h3>
              <p className="text-[11px] text-muted-foreground">Puedes cambiar o cancelar cuando quieras. Sin permanencia.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PLANS.map((p) => {
                const Icon = p.icon;
                const selected = state.plan === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => update("plan", p.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-all",
                      selected ? "ring-2 bg-foreground/[0.04]" : "border-border/60 hover:border-foreground/40"
                    )}
                    style={selected ? { borderColor: p.color, ["--tw-ring-color" as string]: p.color } : undefined}
                    aria-pressed={selected}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="rounded-md p-1.5" style={{ background: `color-mix(in oklab, ${p.color} 18%, transparent)` }}>
                        <Icon className="h-4 w-4" style={{ color: p.color }} aria-hidden />
                      </div>
                      {selected && <Check className="h-4 w-4" style={{ color: p.color }} aria-hidden />}
                    </div>
                    <div className="text-sm font-medium">{p.id}</div>
                    <div className="text-[11px] text-muted-foreground mb-2">{p.tagline}</div>
                    <div className="text-xl font-display font-medium" style={{ color: p.color }}>{p.price}€<span className="text-[10px] text-muted-foreground font-mono">/mes</span></div>
                    <ul className="mt-2 space-y-1">
                      {p.features.map(f => (
                        <li key={f} className="text-[11px] flex items-center gap-1.5">
                          <Check className="h-3 w-3 shrink-0" style={{ color: p.color }} aria-hidden /> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            {errors.plan && <p className="text-[10px] text-[var(--rp-red)]">{errors.plan}</p>}
          </div>
        )}

        {/* Step 1: Empresa */}
        {step === 1 && (
          <div className="space-y-3 max-w-xl">
            <h3 className="text-sm font-medium">Datos de empresa</h3>
            <Field label="Razón social" required error={errors.companyName} hint="Como aparece en el CIF">
              <Input value={state.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="Restaurante SA" className="h-9" />
            </Field>
            <Field label="CIF / NIF" required error={errors.cif} hint={cifChecking ? "Comprobando disponibilidad…" : cifTaken ? "CIF ya en uso" : "Formato español: letra + 8 dígitos"}>
              <div className="relative">
                <Input
                  value={state.cif}
                  onChange={(e) => update("cif", e.target.value.toUpperCase())}
                  placeholder="B12345678"
                  className={cn("h-9 pr-9 font-mono", cifTaken && "border-[var(--rp-red)]/50", !cifTaken && state.cif && !cifChecking && CIF_REGEX.test(state.cif) && "border-[var(--rp-emerald)]/50")}
                />
                {cifChecking && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" aria-hidden />}
                {!cifChecking && !cifTaken && state.cif && CIF_REGEX.test(state.cif) && <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--rp-emerald)]" aria-hidden />}
                {!cifChecking && cifTaken && <X className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--rp-red)]" aria-hidden />}
              </div>
            </Field>
            <div className="rounded-md border border-[var(--rp-blue)]/30 bg-[var(--rp-blue)]/[0.04] p-2.5 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3 inline mr-1 text-[var(--rp-blue)]" aria-hidden />
              Validamos contra registry público. Si tu CIF está registrado, contacta con soporte para reclamar la cuenta.
            </div>
          </div>
        )}

        {/* Step 2: Ubicación */}
        {step === 2 && (
          <div className="space-y-3 max-w-xl">
            <h3 className="text-sm font-medium">Ubicación del primer local</h3>
            <Field label="Dirección" required error={errors.address}>
              <Input value={state.address} onChange={(e) => update("address", e.target.value)} placeholder="Calle Gran Vía 42" className="h-9" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Código postal" required error={errors.postalCode}>
                <Input value={state.postalCode} onChange={(e) => update("postalCode", e.target.value)} placeholder="28013" className="h-9 font-mono" inputMode="numeric" />
              </Field>
              <Field label="Ciudad" required error={errors.city}>
                <Input value={state.city} onChange={(e) => update("city", e.target.value)} placeholder="Madrid" className="h-9" />
              </Field>
              <Field label="País" required>
                <select value={state.country} onChange={(e) => update("country", e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option>España</option><option>Portugal</option><option>Francia</option><option>Italia</option><option>Andorra</option>
                </select>
              </Field>
            </div>
            <div className="rounded-md bg-foreground/[0.04] p-3 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[var(--rp-emerald)]" aria-hidden />
              <div>
                <div className="text-xs font-medium">{state.address || "—"}, {state.postalCode} {state.city}</div>
                <div className="text-[10px] text-muted-foreground">{state.country} · coordenadas calculadas vía Google Maps</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Contacto */}
        {step === 3 && (
          <div className="space-y-3 max-w-xl">
            <h3 className="text-sm font-medium">Persona de contacto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nombre completo" required error={errors.contactName}>
                <Input value={state.contactName} onChange={(e) => update("contactName", e.target.value)} placeholder="Ana García" className="h-9" />
              </Field>
              <Field label="Teléfono" required error={errors.contactPhone} hint="Para verificación SMS">
                <Input value={state.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} placeholder="+34 600 000 000" className="h-9 font-mono" inputMode="tel" />
              </Field>
            </div>
            <Field
              label="Email"
              required
              error={errors.contactEmail}
              hint={emailChecking ? "Comprobando disponibilidad…" : emailTaken ? "Email ya registrado · inicia sesión" : "Será tu usuario de acceso"}
            >
              <div className="relative">
                <Input
                  type="email"
                  value={state.contactEmail}
                  onChange={(e) => update("contactEmail", e.target.value)}
                  placeholder="ana@restaurante.com"
                  className={cn("h-9 pr-9", emailTaken && "border-[var(--rp-red)]/50", !emailTaken && state.contactEmail && EMAIL_REGEX.test(state.contactEmail) && !emailChecking && "border-[var(--rp-emerald)]/50")}
                />
                {emailChecking && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" aria-hidden />}
                {!emailChecking && !emailTaken && state.contactEmail && EMAIL_REGEX.test(state.contactEmail) && <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--rp-emerald)]" aria-hidden />}
                {!emailChecking && emailTaken && <X className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--rp-red)]" aria-hidden />}
              </div>
            </Field>
          </div>
        )}

        {/* Step 4: Marca */}
        {step === 4 && (
          <div className="space-y-3 max-w-xl">
            <h3 className="text-sm font-medium">Identidad de marca</h3>
            <Field label="Nombre comercial" required error={errors.brandName} hint="Como lo verán tus clientes en carta y reservas">
              <Input value={state.brandName} onChange={(e) => update("brandName", e.target.value)} placeholder="Restaurante Ana" className="h-9" />
            </Field>
            <Field label="Color principal" hint="Se aplicará a tu carta digital, emails y panel">
              <div className="flex flex-wrap gap-2">
                {BRAND_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => update("brandColor", c.value)}
                    className={cn("flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs", state.brandColor === c.value ? "border-foreground ring-1 ring-foreground/30" : "border-border/60")}
                    aria-label={`Color ${c.name}`}
                    aria-pressed={state.brandColor === c.value}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ background: c.value }} aria-hidden />
                    {c.name}
                  </button>
                ))}
              </div>
            </Field>
            {/* Preview */}
            <div className="rounded-md border border-border/60 p-3">
              <div className="text-[10px] uppercase text-muted-foreground font-mono mb-2">Preview</div>
              <div className="rounded-lg p-4" style={{ background: `color-mix(in oklab, ${state.brandColor} 12%, transparent)` }}>
                <div className="flex items-center gap-2">
                  <div className="rounded-md p-1.5" style={{ background: state.brandColor }}>
                    <Store className="h-4 w-4 text-[#062018]" aria-hidden />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: state.brandColor }}>{state.brandName || "Tu marca"}</div>
                    <div className="text-[10px] text-muted-foreground">Carta digital · reservas · TPV</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Capacidad */}
        {step === 5 && (
          <div className="space-y-3 max-w-xl">
            <h3 className="text-sm font-medium">Capacidad del primer local</h3>
            <Field label="Aforo total (plazas)" required error={errors.capacity} hint="Incluye interior + terraza. Lo usamos para dimensionar tu plan.">
              <Input
                type="number"
                value={state.capacity}
                onChange={(e) => update("capacity", Number(e.target.value))}
                min={1}
                max={2000}
                className="h-9 font-mono"
              />
            </Field>
            <div>
              <input
                type="range"
                min={10}
                max={300}
                value={Math.min(300, state.capacity)}
                onChange={(e) => update("capacity", Number(e.target.value))}
                className="w-full accent-[var(--rp-emerald)]"
                aria-label="Aforo"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>10</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300+</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { range: "1-50", label: "Pequeño", icon: Store },
                { range: "51-150", label: "Mediano", icon: Users },
                { range: "151+", label: "Grande", icon: Building2 },
              ].map((b) => {
                const Icon = b.icon;
                const isActive = (b.range === "1-50" && state.capacity <= 50) || (b.range === "51-150" && state.capacity > 50 && state.capacity <= 150) || (b.range === "151+" && state.capacity > 150);
                return (
                  <div key={b.range} className={cn("rounded-md border p-2 text-center", isActive ? "border-[var(--rp-emerald)]/50 bg-[var(--rp-emerald)]/[0.06]" : "border-border/50")}>
                    <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" aria-hidden />
                    <div className="text-[10px] font-mono">{b.range}</div>
                    <div className="text-[10px] text-muted-foreground">{b.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Plan confirm */}
        {step === 6 && selectedPlan && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-medium">Confirma tu plan</h3>
            <div className="rounded-xl border p-4" style={{ borderColor: `color-mix(in oklab, ${selectedPlan.color} 35%, transparent)` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-md p-1.5" style={{ background: `color-mix(in oklab, ${selectedPlan.color} 18%, transparent)` }}>
                    <selectedPlan.icon className="h-4 w-4" style={{ color: selectedPlan.color }} aria-hidden />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{selectedPlan.id}</div>
                    <div className="text-[11px] text-muted-foreground">{selectedPlan.tagline}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-display font-medium" style={{ color: selectedPlan.color }}>{selectedPlan.price}€</div>
                  <div className="text-[10px] text-muted-foreground font-mono">/mes</div>
                </div>
              </div>
              <Separator className="my-3" />
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {selectedPlan.features.map(f => (
                  <li key={f} className="text-[11px] flex items-center gap-1.5">
                    <Check className="h-3 w-3" style={{ color: selectedPlan.color }} aria-hidden /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md bg-foreground/[0.04] p-3 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span>{selectedPlan.id}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Empresa</span><span className="font-mono">{state.companyName || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Local</span><span>{state.city || "—"} · {state.capacity} pax</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{selectedPlan.price}€/mes</span></div>
              <Separator className="my-1" />
              <div className="flex justify-between font-medium"><span>Total a pagar</span><span className="font-mono" style={{ color: selectedPlan.color }}>{selectedPlan.price}€</span></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(0)}>Cambiar plan</Button>
            </div>
          </div>
        )}

        {/* Step 7: Legal */}
        {step === 7 && (
          <div className="space-y-3 max-w-xl">
            <h3 className="text-sm font-medium">Términos y consentimientos</h3>
            <div className="space-y-2">
              <label className={cn("flex items-start gap-3 rounded-md border p-3 cursor-pointer", state.legalAccepted ? "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/[0.04]" : errors.legalAccepted ? "border-[var(--rp-red)]/40" : "border-border/60")}>
                <Switch checked={state.legalAccepted} onCheckedChange={(v) => update("legalAccepted", v)} aria-label="Aceptar términos" />
                <div className="flex-1 text-xs">
                  <div className="font-medium flex items-center gap-1">Acepto los <a href="#" className="text-[var(--rp-emerald)] underline">Términos del Servicio</a> y la <a href="#" className="text-[var(--rp-emerald)] underline">Política de Privacidad</a> <span className="text-[var(--rp-red)]">*</span></div>
                  <p className="text-[10px] text-muted-foreground mt-1">Incluye DPA, cláusula de portabilidad y procedimiento de cancelación.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-md border border-border/60 p-3 cursor-pointer">
                <Switch checked={state.marketingAccepted} onCheckedChange={(v) => update("marketingAccepted", v)} aria-label="Consentimiento marketing" />
                <div className="flex-1 text-xs">
                  <div className="font-medium">Quiero recibir tips, novedades y ofertas</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Opcional. Puedes darte de baja en cualquier momento desde tu perfil.</p>
                </div>
              </label>
            </div>
            <div className="rounded-md border border-[var(--rp-violet)]/30 bg-[var(--rp-violet)]/[0.04] p-3 text-[11px] text-muted-foreground">
              <Shield className="h-3.5 w-3.5 inline mr-1 text-[var(--rp-violet)]" aria-hidden />
              Cumplimos RGPD/UE 2016/679. Tus datos se almacenan en EU (Cloudflare EU cells). No vendemos datos.
            </div>
          </div>
        )}

        {/* Step 8: Stripe Checkout */}
        {step === 8 && selectedPlan && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[var(--rp-violet)]" aria-hidden /> Pago con Stripe
            </h3>
            <div className="rounded-md border border-border/60 p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Subtotal</div>
                <div className="text-lg font-display font-medium" style={{ color: selectedPlan.color }}>{selectedPlan.price}€<span className="text-[10px] text-muted-foreground font-mono">/mes</span></div>
              </div>
              <Badge variant="outline" className="border-[var(--rp-violet)]/40 text-[var(--rp-violet)] text-[10px]">
                <Lock className="h-2.5 w-2.5 mr-1" aria-hidden /> Cifrado SSL · PCI DSS L1
              </Badge>
            </div>
            <Field label="Nombre del titular" required error={errors.cardName}>
              <Input value={state.cardName} onChange={(e) => update("cardName", e.target.value)} placeholder="COMO EN LA TARJETA" className="h-9" />
            </Field>
            <Field label="Número de tarjeta" required error={errors.cardNumber} hint="16 dígitos · sin espacios">
              <Input
                value={state.cardNumber}
                onChange={(e) => update("cardNumber", e.target.value.replace(/(.{4})/g, "$1 ").trim())}
                placeholder="4242 4242 4242 4242"
                className="h-9 font-mono"
                inputMode="numeric"
                maxLength={19}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Caducidad (MM/AA)" required error={errors.cardExpiry}>
                <Input value={state.cardExpiry} onChange={(e) => update("cardExpiry", e.target.value)} placeholder="12/27" className="h-9 font-mono" maxLength={5} />
              </Field>
              <Field label="CVC" required error={errors.cardCvc}>
                <Input value={state.cardCvc} onChange={(e) => update("cardCvc", e.target.value)} placeholder="123" className="h-9 font-mono" inputMode="numeric" maxLength={4} />
              </Field>
            </div>
            <div className="rounded-md bg-[var(--rp-yellow)]/[0.06] border border-[var(--rp-yellow)]/30 p-2.5 text-[11px] text-muted-foreground">
              <AlertTriangle className="h-3 w-3 inline mr-1 text-[var(--rp-yellow)]" aria-hidden />
              Demo · usa tarjeta <span className="font-mono text-foreground">4242 4242 4242 4242</span> (cualquier fecha futura + cualquier CVC).
            </div>
          </div>
        )}

        {/* Step 9: Provisioning */}
        {step === 9 && (
          <div className="space-y-4">
            {provisioningDone ? (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 rounded-full bg-[var(--rp-emerald)]/15 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-[var(--rp-emerald)]" aria-hidden />
                </div>
                <h3 className="text-lg font-display font-medium text-[var(--rp-emerald)]">¡Bienvenido a RestoPanel!</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Tu organización <span className="font-medium text-foreground">{state.brandName || state.companyName}</span> está lista. Te hemos enviado un email a <span className="font-mono text-foreground">{state.contactEmail}</span> con tus credenciales y enlaces de onboarding.
                </p>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl mx-auto">
                  {[
                    { label: "Tenant ID", value: "tnt_3f9a12" },
                    { label: "API key", value: "rp_live_••3f9a" },
                    { label: "Plan", value: state.plan || "—" },
                    { label: "Webhook URL", value: "/wh/tnt_3f9a" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-md bg-foreground/[0.04] p-2">
                      <div className="text-[9px] uppercase text-muted-foreground font-mono">{kpi.label}</div>
                      <div className="text-[11px] font-mono truncate">{kpi.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-2 justify-center">
                  <Button className="bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90" onClick={() => toast({ title: "Redirigiendo", description: "Abriendo tu panel…" })}>
                    <Rocket className="h-4 w-4 mr-1" aria-hidden /> Entrar al panel
                  </Button>
                  <Button variant="outline" onClick={reset}>Crear otra cuenta</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--rp-emerald)]" aria-hidden />
                  <div>
                    <h3 className="text-sm font-medium">Provisionando tu cuenta…</h3>
                    <p className="text-[11px] text-muted-foreground">Esto tarda ~30 segundos. No cierres esta ventana.</p>
                  </div>
                </div>
                <div className="space-y-2 max-w-2xl">
                  {PROVISIONING_STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const isDone = i < provisioningStep;
                    const isCurrent = i === provisioningStep;
                    return (
                      <div
                        key={s.id}
                        className={cn(
                          "flex items-center gap-3 rounded-md border px-3 py-2 transition-all",
                          isDone && "border-[var(--rp-emerald)]/40 bg-[var(--rp-emerald)]/[0.04]",
                          isCurrent && "border-[var(--rp-blue)]/40 bg-[var(--rp-blue)]/[0.06]",
                          !isDone && !isCurrent && "border-border/50 opacity-50"
                        )}
                      >
                        <div className={cn("rounded-md p-1.5", isDone ? "bg-[var(--rp-emerald)]/15" : isCurrent ? "bg-[var(--rp-blue)]/15" : "bg-foreground/[0.04]")}>
                          {isDone
                            ? <Check className="h-3.5 w-3.5 text-[var(--rp-emerald)]" aria-hidden />
                            : isCurrent
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--rp-blue)]" aria-hidden />
                            : <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />}
                        </div>
                        <span className={cn("text-xs flex-1", isDone && "text-[var(--rp-emerald)]", isCurrent && "font-medium")}>{s.label}</span>
                        {isDone && <span className="text-[10px] text-[var(--rp-emerald)] font-mono">OK</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <Progress value={(provisioningStep / PROVISIONING_STEPS.length) * 100} className="h-1.5" />
                  <div className="text-[10px] text-muted-foreground font-mono mt-1 text-center">{Math.min(provisioningStep, PROVISIONING_STEPS.length)}/{PROVISIONING_STEPS.length} pasos</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer nav */}
      {step < 9 && (
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => toast({ title: "Draft guardado", description: "Puedes continuar más tarde." })} className="text-[11px] text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-1" aria-hidden /> Guardar y salir
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={back}>
                <ChevronLeft className="h-4 w-4 mr-1" aria-hidden /> Atrás
              </Button>
            )}
            {step < 8 && (
              <Button size="sm" className="bg-[var(--rp-emerald)] text-[#062018] hover:bg-[var(--rp-emerald)]/90" onClick={next}>
                Continuar <ChevronRight className="h-4 w-4 ml-1" aria-hidden />
              </Button>
            )}
            {step === 8 && (
              <Button
                size="sm"
                className="bg-[var(--rp-violet)] hover:bg-[var(--rp-violet)]/90 text-white"
                onClick={next}
                disabled={checkoutProcessing}
              >
                {checkoutProcessing ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" aria-hidden /> Procesando…</> : <><Lock className="h-4 w-4 mr-1" aria-hidden /> Pagar y activar</>}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SignupFunnelView;
