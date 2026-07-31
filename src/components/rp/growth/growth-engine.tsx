"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Gauge,
  Activity,
  Flame,
  Snowflake,
  Thermometer,
  Mail,
  Phone,
  Eye,
  Plus,
  Upload,
  Link as LinkIcon,
  Copy,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Beaker,
  GraduationCap,
  UserCheck,
  UserPlus,
  MousePointerClick,
  BarChart3,
  Award,
  Gift,
  CalendarClock,
  MailCheck, MailOpen,
  Building2,
  MapPin,
  LayoutGrid,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  ArrowDown,
  Lightbulb,
  PlayCircle,
  Percent,
  Megaphone,
  Plug,
  FileText,
} from "lucide-react";

/* =====================================================================
 * Types
 * ===================================================================== */

type LeadStage = "Nuevo" | "Demo" | "Trial" | "Propuesta" | "Cerrado" | "Perdido";
type Plan = "Starter" | "Growth" | "Enterprise";
type LeadSource = "Web" | "Referral" | "Ads" | "Outbound";

interface PipelineLead {
  id: string;
  company: string;
  contact: string;
  email: string;
  plan: Plan;
  stage: LeadStage;
  value: number;
  source: LeadSource;
  owner: string;
  lastActivity: string;
}

interface ScoredLead {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  source: string;
  score: number;
  status: string;
  lastActivity: string;
  rep: string;
  industry: string;
  size: number;
  visits: number;
  demoRequests: number;
  emailOpens: number;
  trialUsage: number;
  fit: number;
  timeline: { ts: string; text: string; icon: React.ElementType }[];
}

interface Affiliate {
  id: string;
  name: string;
  code: string;
  clicks: number;
  signups: number;
  conversions: number;
  revenue: number;
  commission: number;
  status: "Activo" | "Pausado";
}

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  control: { label: string; value: number; metric: string };
  variant: { label: string; value: number; metric: string };
  sample: number;
  significance: number;
  duration: string;
  status: "Ganadora: A" | "Ganadora: B" | "En curso";
  audience: string;
}

interface OnboardStep {
  id: string;
  label: string;
  completed: boolean;
  dropoff: number;
  avgTime: string;
}

interface AcademyModule {
  id: string;
  title: string;
  duration: string;
  completion: number;
  icon: React.ElementType;
}

interface FunnelStage {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface Kpi {
  id: string;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ElementType;
  accent: "gold" | "teal";
}

/* =====================================================================
 * Demo data
 * ===================================================================== */

const FUNNEL: FunnelStage[] = [
  { id: "visit", label: "Visitantes", value: 12400, color: "#3DD6C9" },
  { id: "leads", label: "Leads", value: 890, color: "#5BCFC2" },
  { id: "trials", label: "Trials", value: 247, color: "#7BC8B8" },
  { id: "act", label: "Activados", value: 142, color: "#D4AF37" },
  { id: "paid", label: "Pagos", value: 89, color: "#C9A233" },
  { id: "exp", label: "Expansión", value: 23, color: "#A8862A" },
];

const KPIS: Kpi[] = [
  { id: "mrr", label: "MRR", value: "€48.250", trend: "+8,2%", trendUp: true, icon: DollarSign, accent: "gold" },
  { id: "arr", label: "ARR", value: "€579.000", trend: "+8,2%", trendUp: true, icon: TrendingUp, accent: "teal" },
  { id: "cac", label: "CAC", value: "€412", trend: "−6,4%", trendUp: true, icon: Users, accent: "teal" },
  { id: "ltv", label: "LTV", value: "€3.840", trend: "+4,1%", trendUp: true, icon: Award, accent: "gold" },
  { id: "ltvcac", label: "LTV/CAC", value: "9,3x", trend: "+0,8x", trendUp: true, icon: Gauge, accent: "gold" },
  { id: "churn", label: "Churn", value: "2,1%", trend: "−0,3pp", trendUp: true, icon: Activity, accent: "teal" },
  { id: "nrr", label: "NRR", value: "112%", trend: "+3pp", trendUp: true, icon: TrendingUp, accent: "gold" },
  { id: "act", label: "Activación", value: "57%", trend: "+4pp", trendUp: true, icon: UserCheck, accent: "teal" },
];

const PIPELINE_LEADS: PipelineLead[] = [
  { id: "pl1", company: "Bistró Lucero", contact: "María Ortega", email: "maria@bistrolucero.es", plan: "Growth", stage: "Demo", value: 4800, source: "Web", owner: "Carlos R.", lastActivity: "Hace 2 h" },
  { id: "pl2", company: "Grupo Gastrolab", contact: "Javier Pons", email: "jpons@gastrolab.com", plan: "Enterprise", stage: "Propuesta", value: 24000, source: "Referral", owner: "Ana M.", lastActivity: "Hace 5 h" },
  { id: "pl3", company: "Tapas & Co", contact: "Lucía Ferrer", email: "lucia@tapasandco.es", plan: "Starter", stage: "Trial", value: 1440, source: "Ads", owner: "Carlos R.", lastActivity: "Ayer" },
  { id: "pl4", company: "Sakura Sushi Chain", contact: "Hiro Tanaka", email: "hiro@sakura.io", plan: "Enterprise", stage: "Cerrado", value: 36000, source: "Outbound", owner: "Ana M.", lastActivity: "Hace 3 d" },
  { id: "pl5", company: "Café del Norte", contact: "Pablo Sanchís", email: "pablo@cafedelnorte.es", plan: "Growth", stage: "Nuevo", value: 4800, source: "Web", owner: "Lucía V.", lastActivity: "Hace 1 h" },
  { id: "pl6", company: "Marisquería Oceano", contact: "Bea Marín", email: "bea@oceano.es", plan: "Growth", stage: "Demo", value: 6200, source: "Referral", owner: "Carlos R.", lastActivity: "Hace 6 h" },
  { id: "pl7", company: "Pizzería Bella Roma", contact: "Marco Rossi", email: "marco@bellaroma.it", plan: "Starter", stage: "Perdido", value: 0, source: "Ads", owner: "Lucía V.", lastActivity: "Hace 8 d" },
  { id: "pl8", company: "Hotel Aurora", contact: "Sofía Reig", email: "sofia@aurora.hotels", plan: "Enterprise", stage: "Propuesta", value: 48000, source: "Outbound", owner: "Ana M.", lastActivity: "Hace 1 d" },
  { id: "pl9", company: "Foodie Concepts", contact: "Diego Campos", email: "diego@foodie.es", plan: "Growth", stage: "Cerrado", value: 7200, source: "Web", owner: "Carlos R.", lastActivity: "Hace 4 d" },
  { id: "pl10", company: "Verde Vegan Bistro", contact: "Nora Sala", email: "nora@verdevegan.com", plan: "Starter", stage: "Trial", value: 1440, source: "Referral", owner: "Lucía V.", lastActivity: "Hace 3 h" },
];

const SCORED_LEADS: ScoredLead[] = [
  {
    id: "sl1", company: "Bistró Lucero", contact: "María Ortega", email: "maria@bistrolucero.es",
    phone: "+34 612 345 678", source: "Web", score: 88, status: "Hot lead", lastActivity: "Hace 2 h",
    rep: "Carlos R.", industry: "Restaurantes", size: 25, visits: 14, demoRequests: 3, emailOpens: 22, trialUsage: 78, fit: 92,
    timeline: [
      { ts: "Hace 2 h", text: "Abrió email con propuesta Growth", icon: MailOpen },
      { ts: "Hace 1 d", text: "Solicitó segunda demo", icon: CalendarClock },
      { ts: "Hace 3 d", text: "Trial activado · 78% de features usadas", icon: PlayCircle },
      { ts: "Hace 5 d", text: "Primera demo completada", icon: Eye },
    ],
  },
  {
    id: "sl2", company: "Grupo Gastrolab", contact: "Javier Pons", email: "jpons@gastrolab.com",
    phone: "+34 633 221 100", source: "Referral", score: 94, status: "Hot lead", lastActivity: "Hace 5 h",
    rep: "Ana M.", industry: "Cadenas", size: 180, visits: 32, demoRequests: 5, emailOpens: 41, trialUsage: 91, fit: 95,
    timeline: [
      { ts: "Hace 5 h", text: "Propuesta Enterprise enviada", icon: MailCheck },
      { ts: "Hace 2 d", text: "Call con CFO agendada", icon: Phone },
      { ts: "Hace 4 d", text: "Trial multi-local activado", icon: PlayCircle },
    ],
  },
  {
    id: "sl3", company: "Tapas & Co", contact: "Lucía Ferrer", email: "lucia@tapasandco.es",
    phone: "+34 644 556 778", source: "Google Ads", score: 62, status: "Warm lead", lastActivity: "Ayer",
    rep: "Carlos R.", industry: "Tapas", size: 12, visits: 6, demoRequests: 1, emailOpens: 8, trialUsage: 34, fit: 70,
    timeline: [
      { ts: "Ayer", text: "Inició trial Starter", icon: PlayCircle },
      { ts: "Hace 3 d", text: "Visitó pricing 2 veces", icon: MousePointerClick },
    ],
  },
  {
    id: "sl4", company: "Sakura Sushi Chain", contact: "Hiro Tanaka", email: "hiro@sakura.io",
    phone: "+34 699 888 012", source: "Outbound", score: 90, status: "Hot lead", lastActivity: "Hace 3 d",
    rep: "Ana M.", industry: "Cadenas", size: 60, visits: 21, demoRequests: 4, emailOpens: 18, trialUsage: 65, fit: 88,
    timeline: [
      { ts: "Hace 3 d", text: "Contrato firmado · Enterprise", icon: CheckCircle2 },
      { ts: "Hace 6 d", text: "Negociación de SLA", icon: Phone },
    ],
  },
  {
    id: "sl5", company: "Café del Norte", contact: "Pablo Sanchís", email: "pablo@cafedelnorte.es",
    phone: "+34 611 222 333", source: "Web", score: 54, status: "Warm lead", lastActivity: "Hace 1 h",
    rep: "Lucía V.", industry: "Cafeterías", size: 8, visits: 4, demoRequests: 1, emailOpens: 5, trialUsage: 12, fit: 65,
    timeline: [
      { ts: "Hace 1 h", text: "Rellenó formulario de contacto", icon: UserPlus },
      { ts: "Hace 2 d", text: "Vino de blog post SEO", icon: MousePointerClick },
    ],
  },
  {
    id: "sl6", company: "Marisquería Oceano", contact: "Bea Marín", email: "bea@oceano.es",
    phone: "+34 622 333 444", source: "Referral", score: 71, status: "Warm lead", lastActivity: "Hace 6 h",
    rep: "Carlos R.", industry: "Marisquerías", size: 18, visits: 9, demoRequests: 2, emailOpens: 12, trialUsage: 41, fit: 75,
    timeline: [
      { ts: "Hace 6 h", text: "Demo completada · muy interesada", icon: Eye },
      { ts: "Hace 1 d", text: "Referral de Hotel Aurora", icon: Gift },
    ],
  },
  {
    id: "sl7", company: "Pizzería Bella Roma", contact: "Marco Rossi", email: "marco@bellaroma.it",
    phone: "+39 333 444 555", source: "Meta Ads", score: 28, status: "Cold lead", lastActivity: "Hace 8 d",
    rep: "Lucía V.", industry: "Italiana", size: 6, visits: 2, demoRequests: 0, emailOpens: 1, trialUsage: 0, fit: 40,
    timeline: [
      { ts: "Hace 8 d", text: "Clic en anuncio, sin demo", icon: MousePointerClick },
    ],
  },
  {
    id: "sl8", company: "Hotel Aurora", contact: "Sofía Reig", email: "sofia@aurora.hotels",
    phone: "+34 655 666 777", source: "Outbound", score: 86, status: "Hot lead", lastActivity: "Hace 1 d",
    rep: "Ana M.", industry: "Hoteles", size: 220, visits: 18, demoRequests: 4, emailOpens: 24, trialUsage: 58, fit: 90,
    timeline: [
      { ts: "Hace 1 d", text: "Propuesta multi-propiedad enviada", icon: MailCheck },
      { ts: "Hace 4 d", text: "Demo ejecutiva completada", icon: Eye },
    ],
  },
  {
    id: "sl9", company: "Foodie Concepts", contact: "Diego Campos", email: "diego@foodie.es",
    phone: "+34 677 888 999", source: "Web", score: 81, status: "Hot lead", lastActivity: "Hace 4 d",
    rep: "Carlos R.", industry: "Dark kitchens", size: 35, visits: 11, demoRequests: 2, emailOpens: 19, trialUsage: 52, fit: 82,
    timeline: [
      { ts: "Hace 4 d", text: "Cerrado · Growth anual", icon: CheckCircle2 },
    ],
  },
  {
    id: "sl10", company: "Verde Vegan Bistro", contact: "Nora Sala", email: "nora@verdevegan.com",
    phone: "+34 688 999 000", source: "Referral", score: 47, status: "Cold lead", lastActivity: "Hace 3 h",
    rep: "Lucía V.", industry: "Vegano", size: 10, visits: 3, demoRequests: 0, emailOpens: 4, trialUsage: 8, fit: 55,
    timeline: [
      { ts: "Hace 3 h", text: "Trial iniciado · sin actividad", icon: PlayCircle },
    ],
  },
  {
    id: "sl11", company: "Brasería El Roble", contact: "Víctor Pons", email: "victor@elroble.es",
    phone: "+34 690 111 222", source: "LinkedIn", score: 59, status: "Warm lead", lastActivity: "Hace 9 h",
    rep: "Ana M.", industry: "Braserías", size: 22, visits: 5, demoRequests: 1, emailOpens: 9, trialUsage: 22, fit: 68,
    timeline: [
      { ts: "Hace 9 h", text: "Conectó por LinkedIn", icon: Users },
    ],
  },
  {
    id: "sl12", company: "Sushi Bar Kuro", contact: "Aya Mori", email: "aya@kurobar.es",
    phone: "+34 601 222 333", source: "Web", score: 65, status: "Warm lead", lastActivity: "Hace 12 h",
    rep: "Carlos R.", industry: "Japonesa", size: 14, visits: 7, demoRequests: 1, emailOpens: 11, trialUsage: 31, fit: 72,
    timeline: [
      { ts: "Hace 12 h", text: "Descargó guía de reservas", icon: FileText },
    ],
  },
];

const LEAD_SOURCES: DonutSlice[] = [
  { id: "web", label: "Web", value: 42, color: "#D4AF37" },
  { id: "ref", label: "Referral", value: 28, color: "#3DD6C9" },
  { id: "gads", label: "Google Ads", value: 15, color: "#E8C766" },
  { id: "mads", label: "Meta Ads", value: 8, color: "#2BA89E" },
  { id: "li", label: "LinkedIn", value: 5, color: "#A8862A" },
  { id: "ob", label: "Outbound", value: 2, color: "#5BCFC2" },
];

const AFFILIATES: Affiliate[] = [
  { id: "af1", name: "María López", code: "MARIA20", clicks: 1240, signups: 38, conversions: 12, revenue: 1820, commission: 364, status: "Activo" },
  { id: "af2", name: "Consultoría Gastro", code: "GASTRO15", clicks: 980, signups: 27, conversions: 9, revenue: 1340, commission: 268, status: "Activo" },
  { id: "af3", name: "Javier Pons", code: "JAVI10", clicks: 760, signups: 19, conversions: 6, revenue: 890, commission: 178, status: "Activo" },
  { id: "af4", name: "Foodie Blog", code: "FOODIE25", clicks: 540, signups: 12, conversions: 4, revenue: 620, commission: 124, status: "Activo" },
  { id: "af5", name: "Lucía Ferrer", code: "LUCIA12", clicks: 410, signups: 8, conversions: 2, revenue: 310, commission: 62, status: "Pausado" },
  { id: "af6", name: "Hostelería Pro", code: "HOSTEL18", clicks: 380, signups: 7, conversions: 1, revenue: 180, commission: 36, status: "Activo" },
  { id: "af7", name: "Diego Campos", code: "DIEGO08", clicks: 220, signups: 4, conversions: 0, revenue: 0, commission: 0, status: "Activo" },
];

const EXPERIMENTS: Experiment[] = [
  {
    id: "exp1",
    name: "Hero CTA: 'Crear cuenta' vs 'Empieza gratis'",
    hypothesis: "Un CTA con menor compromiso ('Empieza gratis') aumentará la conversión del visitante a signup.",
    control: { label: "Crear cuenta", value: 12, metric: "% conversión" },
    variant: { label: "Empieza gratis", value: 18, metric: "% conversión" },
    sample: 847, significance: 87, duration: "14 días",
    status: "Ganadora: B", audience: "Tráfico orgánico landing",
  },
  {
    id: "exp2",
    name: "Pricing: mensual vs anual default",
    hypothesis: "Mostrar el plan anual por defecto aumentará la conversión a anual y el LTV.",
    control: { label: "Mensual default", value: 34, metric: "% anual" },
    variant: { label: "Anual default", value: 42, metric: "% anual" },
    sample: 1234, significance: 72, duration: "21 días",
    status: "En curso", audience: "Visitantes página pricing",
  },
  {
    id: "exp3",
    name: "Landing: con video vs sin video",
    hypothesis: "Un video en hero aumenta el tiempo en página y la conversión a demo.",
    control: { label: "Sin video", value: 8, metric: "% demo" },
    variant: { label: "Con video", value: 11, metric: "% demo" },
    sample: 567, significance: 65, duration: "10 días",
    status: "En curso", audience: "Tráfico ads",
  },
  {
    id: "exp4",
    name: "Email subject: IA mention vs no mention",
    hypothesis: "Mencionar IA en el asunto del email aumenta la apertura por curiosidad.",
    control: { label: "Sin IA", value: 28, metric: "% open rate" },
    variant: { label: "Con IA", value: 38, metric: "% open rate" },
    sample: 890, significance: 91, duration: "7 días",
    status: "Ganadora: B", audience: "Leads warm email",
  },
];

const ONBOARD_FUNNEL: OnboardStep[] = [
  { id: "s1", label: "Signup", completed: true, dropoff: 0, avgTime: "0 min" },
  { id: "s2", label: "Verify email", completed: true, dropoff: 12, avgTime: "3 min" },
  { id: "s3", label: "Create org", completed: true, dropoff: 8, avgTime: "2 min" },
  { id: "s4", label: "Add location", completed: true, dropoff: 18, avgTime: "5 min" },
  { id: "s5", label: "Configure floor", completed: true, dropoff: 24, avgTime: "12 min" },
  { id: "s6", label: "First reservation", completed: true, dropoff: 14, avgTime: "1 día" },
  { id: "s7", label: "Activate automation", completed: false, dropoff: 31, avgTime: "2 días" },
  { id: "s8", label: "Dashboard complete", completed: false, dropoff: 9, avgTime: "1 día" },
];

const ACADEMY: AcademyModule[] = [
  { id: "m1", title: "Primeros pasos", duration: "5 min", completion: 89, icon: PlayCircle },
  { id: "m2", title: "Configuración de sala", duration: "10 min", completion: 72, icon: LayoutGrid },
  { id: "m3", title: "Gestor de reservas", duration: "8 min", completion: 68, icon: CalendarClock },
  { id: "m4", title: "CRM y clientes", duration: "12 min", completion: 54, icon: Users },
  { id: "m5", title: "Automatizaciones", duration: "15 min", completion: 38, icon: Activity },
  { id: "m6", title: "Marketing y campañas", duration: "12 min", completion: 31, icon: Megaphone },
  { id: "m7", title: "Analytics y BI", duration: "10 min", completion: 28, icon: BarChart3 },
  { id: "m8", title: "API e integraciones", duration: "20 min", completion: 12, icon: Plug },
];

const STAGE_ORDER: LeadStage[] = ["Nuevo", "Demo", "Trial", "Propuesta", "Cerrado", "Perdido"];
const PLAN_OPTIONS: Plan[] = ["Starter", "Growth", "Enterprise"];
const SOURCE_OPTIONS: LeadSource[] = ["Web", "Referral", "Ads", "Outbound"];

/* =====================================================================
 * Helpers
 * ===================================================================== */

function scoreTier(score: number): { label: string; icon: React.ElementType; cls: string } {
  if (score >= 80) return { label: "Hot", icon: Flame, cls: "bg-red-500/15 text-red-300 border-red-500/30" };
  if (score >= 50) return { label: "Warm", icon: Thermometer, cls: "bg-[var(--gold)]/15 text-[var(--gold-soft)] border-[var(--gold)]/30" };
  return { label: "Cold", icon: Snowflake, cls: "bg-foreground/10 text-muted-foreground border-border/40" };
}

function stageColor(stage: LeadStage): string {
  switch (stage) {
    case "Nuevo": return "bg-[var(--teal)]/15 text-[var(--teal)] border-[var(--teal)]/30";
    case "Demo": return "bg-[var(--gold)]/15 text-[var(--gold-soft)] border-[var(--gold)]/30";
    case "Trial": return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    case "Propuesta": return "bg-blue-500/15 text-sky-300 border-blue-500/30";
    case "Cerrado": return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "Perdido": return "bg-red-500/15 text-red-300 border-red-500/30";
  }
}

function planColor(plan: Plan): string {
  switch (plan) {
    case "Starter": return "bg-foreground/10 text-muted-foreground border-border/40";
    case "Growth": return "bg-[var(--gold)]/15 text-[var(--gold-soft)] border-[var(--gold)]/30";
    case "Enterprise": return "bg-[var(--teal)]/15 text-[var(--teal)] border-[var(--teal)]/30";
  }
}

function sourceIcon(s: LeadSource | string): React.ElementType {
  switch (s) {
    case "Web": return MousePointerClick;
    case "Referral": return Gift;
    case "Ads":
    case "Google Ads":
    case "Meta Ads": return Target;
    case "Outbound": return Phone;
    case "LinkedIn": return Users;
    default: return Activity;
  }
}

function fmtMoney(n: number): string {
  return "€" + n.toLocaleString("es-ES");
}

function fmtNum(n: number): string {
  return n.toLocaleString("es-ES");
}

/* Donut SVG builder */
function DonutChart({ data, size = 180 }: { data: DonutSlice[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - 28) / 2;
  const c = 2 * Math.PI * r;
  // Pre-compute each slice's dash array and start offset via an immutable fold.
  const slices = data.reduce<
    { id: string; color: string; dash: string; offset: number; len: number }[]
  >((acc, d) => {
    const len = (d.value / total) * c;
    const startOffset = acc.reduce((s, x) => s + x.len, 0);
    return [
      ...acc,
      { id: d.id, color: d.color, dash: `${len} ${c - len}`, offset: startOffset, len },
    ];
  }, []);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="overflow-visible">
      <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
        {slices.map((d) => (
          <circle
            key={d.id}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={14}
            strokeDasharray={d.dash}
            strokeDashoffset={-d.offset}
            strokeLinecap="butt"
          />
        ))}
        <text
          transform="rotate(90)"
          textAnchor="middle"
          dominantBaseline="middle"
          y={-4}
          className="fill-foreground font-display"
          style={{ fontSize: 22, fontWeight: 600 }}
        >
          {total}%
        </text>
        <text
          transform="rotate(90)"
          textAnchor="middle"
          dominantBaseline="middle"
          y={16}
          className="fill-muted-foreground"
          style={{ fontSize: 10, letterSpacing: "0.15em" }}
        >
          FUENTES
        </text>
      </g>
    </svg>
  );
}

/* Funnel SVG */
function FunnelViz() {
  const max = FUNNEL[0].value;
  const W = 760;
  const H = 60 * FUNNEL.length + 40;
  const barH = 44;
  const gap = 16;
  return (
    <div className="w-full overflow-x-auto rp-scroll-thin">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" role="img" aria-label="Embudo de conversión">
        <defs>
          <linearGradient id="funGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#A8862A" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="funTeal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3DD6C9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2BA89E" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {FUNNEL.map((s, i) => {
          const ratio = s.value / max;
          const w = Math.max(120, (W - 320) * ratio + 120);
          const x = (W - w) / 2;
          const y = 10 + i * (barH + gap);
          const fill = i < 3 ? "url(#funTeal)" : "url(#funGold)";
          const conv = i > 0 ? ((s.value / FUNNEL[i - 1].value) * 100).toFixed(1) : "100";
          return (
            <g key={s.id}>
              <rect x={x} y={y} width={w} height={barH} rx={8} fill={fill} opacity={0.92} />
              <text
                x={x + 14}
                y={y + barH / 2 + 5}
                className="fill-black font-display"
                style={{ fontSize: 14, fontWeight: 600 }}
              >
                {s.label}
              </text>
              <text
                x={x + w - 14}
                y={y + barH / 2 + 5}
                textAnchor="end"
                className="fill-black"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                {fmtNum(s.value)}
              </text>
              {i > 0 && (
                <g transform={`translate(${W / 2}, ${y - gap / 2})`}>
                  <rect x={-34} y={-9} width={68} height={18} rx={9} className="fill-foreground/5 stroke-border/60" strokeWidth={1} />
                  <text textAnchor="middle" y={4} className="fill-[var(--gold-soft)]" style={{ fontSize: 10, fontWeight: 600 }}>
                    {conv}%
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* =====================================================================
 * Sub-components
 * ===================================================================== */

function SectionHeader({ title, subtitle, badge, action }: {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 mb-5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-display text-xl sm:text-2xl tracking-tight">{title}</h2>
          {badge && (
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-[0.15em] border-[var(--gold)]/30 text-[var(--gold-soft)] bg-[var(--gold)]/5">
              {badge}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground border-border/60">
            demo
          </Badge>
        </div>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const accent =
    kpi.accent === "gold"
      ? "from-[var(--gold)]/15 to-transparent border-[var(--gold)]/25"
      : "from-[var(--teal)]/15 to-transparent border-[var(--teal)]/25";
  const Icon = kpi.icon;
  const iconColor = kpi.accent === "gold" ? "text-[var(--gold)]" : "text-[var(--teal)]";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("rounded-xl border bg-gradient-to-br p-4 rp-glass", accent)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground">{kpi.label}</span>
        <Icon className={cn("h-4 w-4", iconColor)} aria-hidden />
      </div>
      <div className="mt-2 font-display text-2xl tracking-tight">{kpi.value}</div>
      {kpi.trend && (
        <div className={cn("mt-1 text-xs flex items-center gap-1", kpi.trendUp ? "text-emerald-400" : "text-red-400")}>
          <TrendingUp className="h-3 w-3" aria-hidden />
          {kpi.trend}
          <span className="text-muted-foreground">vs mes anterior</span>
        </div>
      )}
    </motion.div>
  );
}

function GlassCard({ className, children, glow }: { className?: string; children: React.ReactNode; glow?: "gold" | "teal" }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 rp-glass p-5 sm:p-6",
        glow === "gold" && "rp-glow-gold",
        glow === "teal" && "rp-glow-teal",
        className
      )}
    >
      {children}
    </div>
  );
}

function StageSelect({ value, onChange }: { value: LeadStage; onChange: (s: LeadStage) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors min-h-[28px]",
            stageColor(value)
          )}
          aria-label={`Cambiar etapa del lead (${value})`}
        >
          {value}
          <ChevronDown className="h-3 w-3" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
          Mover a etapa
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STAGE_ORDER.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => onChange(s)}
            className={cn("cursor-pointer text-sm gap-2", value === s && "bg-foreground/5")}
          >
            <span className={cn("h-2 w-2 rounded-full", stageColor(s).split(" ")[0])} aria-hidden />
            {s}
            {value === s && <Check className="h-3.5 w-3.5 ml-auto text-[var(--gold-soft)]" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* =====================================================================
 * Pipeline tab
 * ===================================================================== */

function PipelineTab() {
  const [leads, setLeads] = React.useState<PipelineLead[]>(PIPELINE_LEADS);
  const [newOpen, setNewOpen] = React.useState(false);

  function changeStage(id: string, stage: LeadStage) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
    const lead = leads.find((l) => l.id === id);
    if (lead) {
      toast({ title: "Etapa actualizada", description: `${lead.company} movida a "${stage}"` });
    }
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {KPIS.map((k) => <KpiCard key={k.id} kpi={k} />)}
      </div>

      {/* Funnel */}
      <GlassCard>
        <SectionHeader
          title="Embudo de conversión"
          subtitle="Visitantes → Expansión · últimos 30 días"
          badge="Pipeline"
        />
        <FunnelViz />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {FUNNEL.map((s, i) => {
            const conv = i > 0 ? ((s.value / FUNNEL[i - 1].value) * 100).toFixed(1) + "%" : "—";
            return (
              <div key={s.id} className="rounded-lg border border-border/40 bg-foreground/5 p-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden />
                  <span className="text-[11px] text-muted-foreground truncate">{s.label}</span>
                </div>
                <div className="mt-1 font-display text-lg">{fmtNum(s.value)}</div>
                <div className="text-[10px] text-muted-foreground">conv. {conv}</div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Pipeline table */}
      <GlassCard>
        <SectionHeader
          title="Pipeline de ventas"
          subtitle="Arrastra visualmente el estado con el dropdown de cada lead"
          badge="10 leads · demo"
          action={
            <Button onClick={() => setNewOpen(true)} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]">
              <Plus className="h-4 w-4 mr-1.5" aria-hidden />
              Nuevo lead
            </Button>
          }
        />
        <div className="overflow-x-auto rp-scroll-thin -mx-2 px-2">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="text-left border-b border-border/60 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Empresa / Contacto</th>
                <th className="py-2 pr-3 font-medium">Plan</th>
                <th className="py-2 pr-3 font-medium">Etapa</th>
                <th className="py-2 pr-3 font-medium text-right">Valor</th>
                <th className="py-2 pr-3 font-medium">Fuente</th>
                <th className="py-2 pr-3 font-medium">Owner</th>
                <th className="py-2 pr-3 font-medium">Última activ.</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {leads.map((l) => {
                  const SrcIcon = sourceIcon(l.source);
                  return (
                    <motion.tr
                      key={l.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border/30 hover:bg-foreground/[0.03] transition-colors"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="font-medium truncate">{l.company}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{l.contact} · {l.email}</div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge variant="outline" className={cn("text-[11px]", planColor(l.plan))}>{l.plan}</Badge>
                      </td>
                      <td className="py-2.5 pr-3">
                        <StageSelect value={l.stage} onChange={(s) => changeStage(l.id, s)} />
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono tabular-nums">
                        {l.value > 0 ? fmtMoney(l.value) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <SrcIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                          {l.source}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-muted-foreground">{l.owner}</td>
                      <td className="py-2.5 pr-3 text-xs text-muted-foreground">{l.lastActivity}</td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.15em] text-[10px]">Total pipeline:</span>
          <span className="font-display text-base text-foreground">
            {fmtMoney(leads.filter((l) => l.stage !== "Cerrado" && l.stage !== "Perdido").reduce((s, l) => s + l.value, 0))}
          </span>
          <span className="text-muted-foreground">·</span>
          <span>{leads.filter((l) => l.stage === "Cerrado").length} cerrados</span>
          <span className="text-muted-foreground">·</span>
          <span>{leads.filter((l) => l.stage === "Perdido").length} perdidos</span>
        </div>
      </GlassCard>

      <NewLeadDialog open={newOpen} onOpenChange={setNewOpen} onCreate={(lead) => {
        setLeads((prev) => [lead, ...prev]);
        toast({ title: "Lead creado", description: `${lead.company} añadido al pipeline` });
        setNewOpen(false);
      }} />
    </div>
  );
}

function NewLeadDialog({ open, onOpenChange, onCreate }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (l: PipelineLead) => void;
}) {
  const [company, setCompany] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [plan, setPlan] = React.useState<Plan>("Growth");
  const [source, setSource] = React.useState<LeadSource>("Web");
  const [value, setValue] = React.useState("4800");

  function submit() {
    if (!company.trim() || !contact.trim()) {
      toast({ title: "Faltan datos", description: "Empresa y contacto son obligatorios", variant: "destructive" });
      return;
    }
    onCreate({
      id: "pl-" + Date.now(),
      company: company.trim(),
      contact: contact.trim(),
      email: email.trim() || "—",
      plan, stage: "Nuevo",
      value: parseInt(value || "0", 10) || 0,
      source, owner: "Lucía V.",
      lastActivity: "Ahora",
    });
    setCompany(""); setContact(""); setEmail(""); setValue("4800");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo lead</DialogTitle>
          <DialogDescription>Crea un nuevo lead en el pipeline. Entrará en etapa "Nuevo".</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="nl-company">Empresa</Label>
            <Input id="nl-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Bistró Lucero" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nl-contact">Contacto</Label>
            <Input id="nl-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="María Ortega" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nl-email">Email</Label>
            <Input id="nl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria@empresa.es" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Plan de interés</Label>
              <Select value={plan} onValueChange={(v) => setPlan(v as Plan)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLAN_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fuente</Label>
              <Select value={source} onValueChange={(v) => setSource(v as LeadSource)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nl-value">Valor estimado (€)</Label>
            <Input id="nl-value" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]">
            Crear lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * Leads tab
 * ===================================================================== */

function LeadsTab() {
  const [profileLead, setProfileLead] = React.useState<ScoredLead | null>(null);
  const [showFormula, setShowFormula] = React.useState(false);
  const reduce = useReducedMotion();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Lead list */}
        <div className="lg:col-span-2 space-y-3">
          <GlassCard className="!p-4 sm:!p-5">
            <SectionHeader
              title="Leads con scoring IA"
              subtitle="Score 0–100 basado en fit + engagement + intención"
              badge={`${SCORED_LEADS.length} leads`}
              action={
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1.5" aria-hidden />
                  Importar leads
                </Button>
              }
            />
            <div className="space-y-2 max-h-[640px] overflow-y-auto rp-scroll-thin pr-1">
              {SCORED_LEADS.map((l, i) => {
                const tier = scoreTier(l.score);
                const TierIcon = tier.icon;
                return (
                  <motion.div
                    key={l.id}
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.02 }}
                    className="rounded-lg border border-border/40 bg-foreground/[0.02] hover:bg-foreground/[0.04] hover:border-border/60 transition-colors p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{l.company}</span>
                          <Badge variant="outline" className={cn("text-[10px]", tier.cls)}>
                            <TierIcon className="h-3 w-3 mr-1" aria-hidden />
                            {tier.label} · {l.score}
                          </Badge>
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
                          {l.contact} · {l.email} · {l.phone}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                          <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" aria-hidden />{l.industry}</span>
                          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" aria-hidden />{l.size} emp.</span>
                          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden />{l.lastActivity}</span>
                          <span className="inline-flex items-center gap-1"><UserCheck className="h-3 w-3" aria-hidden />{l.rep}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <TooltipProvider delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-9 w-9 p-0" aria-label="Llamar" onClick={() => toast({ title: "Llamando…", description: l.phone })}>
                                <Phone className="h-4 w-4" aria-hidden />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Llamar</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-9 w-9 p-0" aria-label="Email" onClick={() => toast({ title: "Abriendo email", description: l.email })}>
                                <Mail className="h-4 w-4" aria-hidden />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Email</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-9 w-9 p-0" aria-label="Ver perfil" onClick={() => setProfileLead(l)}>
                                <Eye className="h-4 w-4" aria-hidden />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver perfil</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    {/* score bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={l.score} className="h-1.5 flex-1" />
                      <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{l.score}/100</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Side panel: sources + formula */}
        <div className="space-y-4">
          <GlassCard>
            <SectionHeader title="Fuentes de leads" badge="Distribución" />
            <div className="flex flex-col items-center gap-4">
              <DonutChart data={LEAD_SOURCES} />
              <ul className="w-full space-y-1.5">
                {LEAD_SOURCES.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden />
                    <span className="flex-1">{s.label}</span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">{s.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          <GlassCard glow="gold">
            <button
              className="w-full flex items-center justify-between text-left"
              onClick={() => setShowFormula((v) => !v)}
              aria-expanded={showFormula}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-[var(--gold-soft)]" aria-hidden />
                <span className="font-medium text-sm">Fórmula de scoring</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", showFormula && "rotate-180")} aria-hidden />
            </button>
            <AnimatePresence initial={false}>
              {showFormula && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-border/40 space-y-2 text-xs">
                    <div className="font-mono text-[11px] text-muted-foreground">
                      Score = visitas_web(20%) + demo_requests(30%) + email_engagement(15%) + trial_usage(25%) + company_fit(10%)
                    </div>
                    <ul className="space-y-1.5">
                      <FormulaRow label="website_visits" pct={20} desc="Nº y recencia de visitas" />
                      <FormulaRow label="demo_requests" pct={30} desc="Solicitudes de demostración" />
                      <FormulaRow label="email_engagement" pct={15} desc="Aperturas + clics en emails" />
                      <FormulaRow label="trial_usage" pct={25} desc="% features usadas en trial" />
                      <FormulaRow label="company_fit" pct={10} desc="Industry + tamaño vs ICP" />
                    </ul>
                    <div className="pt-2 mt-2 border-t border-border/30 text-[11px] text-muted-foreground">
                      <span className="text-red-300">Hot ≥ 80</span> · <span className="text-[var(--gold-soft)]">Warm 50–79</span> · <span>Cold &lt; 50</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>

      <LeadProfileDialog lead={profileLead} onClose={() => setProfileLead(null)} />
    </div>
  );
}

function FormulaRow({ label, pct, desc }: { label: string; pct: number; desc: string }) {
  return (
    <li className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[11px] text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground truncate">{desc}</div>
      </div>
      <div className="w-16">
        <Progress value={pct * 4} className="h-1" />
      </div>
      <span className="text-[10px] font-mono tabular-nums text-muted-foreground w-8 text-right">{pct}%</span>
    </li>
  );
}

function LeadProfileDialog({ lead, onClose }: { lead: ScoredLead | null; onClose: () => void }) {
  return (
    <Dialog open={!!lead} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {lead && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {lead.company}
                <Badge variant="outline" className={cn("text-[10px]", scoreTier(lead.score).cls)}>
                  {scoreTier(lead.score).label} · {lead.score}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {lead.contact} · {lead.email} · {lead.phone}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Score breakdown */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2">Desglose de score</div>
                <div className="grid grid-cols-2 gap-2">
                  <ScoreCell label="Visitas web" v={lead.visits} max={40} unit="" />
                  <ScoreCell label="Demo requests" v={lead.demoRequests} max={10} unit="" />
                  <ScoreCell label="Email opens" v={lead.emailOpens} max={50} unit="" />
                  <ScoreCell label="Trial usage" v={lead.trialUsage} max={100} unit="%" />
                  <ScoreCell label="Company fit" v={lead.fit} max={100} unit="%" />
                  <ScoreCell label="Industry" v={lead.size} max={250} unit=" emp." />
                </div>
              </div>
              {/* Activity timeline */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2">Timeline de actividad</div>
                <ol className="space-y-2.5 relative pl-5">
                  <span className="absolute left-[7px] top-1 bottom-1 w-px bg-border/60" aria-hidden />
                  {lead.timeline.map((t, i) => {
                    const TI = t.icon;
                    return (
                      <li key={i} className="relative">
                        <span className="absolute -left-5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--gold)]/20 ring-2 ring-background">
                          <TI className="h-2.5 w-2.5 text-[var(--gold-soft)]" aria-hidden />
                        </span>
                        <div className="text-xs">{t.text}</div>
                        <div className="text-[10px] text-muted-foreground">{t.ts}</div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>Cerrar</Button>
              <Button className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]" onClick={() => { toast({ title: "Email enviado", description: lead.email }); onClose(); }}>
                <Mail className="h-4 w-4 mr-1.5" aria-hidden />
                Enviar email
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ScoreCell({ label, v, max, unit }: { label: string; v: number; max: number; unit: string }) {
  const pct = Math.min(100, (v / max) * 100);
  return (
    <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-2">
      <div className="text-[10px] text-muted-foreground truncate">{label}</div>
      <div className="font-mono text-sm tabular-nums">{v}{unit}</div>
      <Progress value={pct} className="h-1 mt-1" />
    </div>
  );
}

/* =====================================================================
 * Afiliados tab
 * ===================================================================== */

function AfiliadosTab() {
  const [code, setCode] = React.useState("");
  const [generated, setGenerated] = React.useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const overview: { label: string; value: string; icon: React.ElementType; accent: "gold" | "teal" }[] = [
    { label: "Afiliados activos", value: "34", icon: Users, accent: "gold" },
    { label: "Referidos", value: "89", icon: UserPlus, accent: "teal" },
    { label: "Convertidos", value: "52 (58%)", icon: UserCheck, accent: "gold" },
    { label: "Revenue", value: "€4.680", icon: DollarSign, accent: "teal" },
    { label: "Comisión pagada", value: "€1.872", icon: Percent, accent: "gold" },
    { label: "ROI programa", value: "150%", icon: TrendingUp, accent: "teal" },
  ];

  function gen() {
    const slug = (code || "AFILIADO").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || "AFILIADO";
    const suffix = Math.floor(Math.random() * 90 + 10);
    setGenerated(`https://restopanel.com/ref/${slug}${suffix}`);
    toast({ title: "Enlace generado", description: "Copiado al portapapeles" });
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {overview.map((o) => {
          const Icon = o.icon;
          const accent = o.accent === "gold" ? "text-[var(--gold)]" : "text-[var(--teal)]";
          return (
            <GlassCard key={o.label} className="!p-4">
              <Icon className={cn("h-4 w-4 mb-2", accent)} aria-hidden />
              <div className="font-display text-xl">{o.value}</div>
              <div className="text-[11px] text-muted-foreground">{o.label}</div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Top afiliados */}
        <div className="lg:col-span-2">
          <GlassCard>
            <SectionHeader title="Top afiliados" subtitle="Por revenue generado · últimos 90 días" badge="Programa activo" />
            <div className="overflow-x-auto rp-scroll-thin -mx-2 px-2">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left border-b border-border/60 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Afiliado</th>
                    <th className="py-2 pr-3 font-medium">Código</th>
                    <th className="py-2 pr-3 font-medium text-right">Clicks</th>
                    <th className="py-2 pr-3 font-medium text-right">Signups</th>
                    <th className="py-2 pr-3 font-medium text-right">Conv.</th>
                    <th className="py-2 pr-3 font-medium text-right">Revenue</th>
                    <th className="py-2 pr-3 font-medium text-right">Comisión</th>
                    <th className="py-2 pr-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {AFFILIATES.map((a) => (
                    <tr key={a.id} className="border-b border-border/30 hover:bg-foreground/[0.03] transition-colors">
                      <td className="py-2.5 pr-3 font-medium">{a.name}</td>
                      <td className="py-2.5 pr-3">
                        <button
                          className="font-mono text-[11px] text-[var(--gold-soft)] hover:underline"
                          onClick={() => { navigator.clipboard?.writeText(`https://restopanel.com/ref/${a.code}`).catch(() => {}); toast({ title: "Copiado", description: `Enlace de ${a.name}` }); }}
                        >
                          {a.code}
                        </button>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-muted-foreground">{fmtNum(a.clicks)}</td>
                      <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-muted-foreground">{a.signups}</td>
                      <td className="py-2.5 pr-3 text-right font-mono tabular-nums">{a.conversions}</td>
                      <td className="py-2.5 pr-3 text-right font-mono tabular-nums">{fmtMoney(a.revenue)}</td>
                      <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-[var(--gold-soft)]">{fmtMoney(a.commission)}</td>
                      <td className="py-2.5 pr-3">
                        <Badge variant="outline" className={cn("text-[10px]", a.status === "Activo" ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" : "border-border/40 text-muted-foreground")}>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Link generator + rules */}
        <div className="space-y-4">
          <GlassCard glow="gold">
            <SectionHeader title="Generador de enlace" badge="Afiliado" />
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="af-code">Nombre o código del afiliado</Label>
                <Input id="af-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="MARIA20" />
              </div>
              <Button onClick={gen} className="w-full bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]">
                <LinkIcon className="h-4 w-4 mr-1.5" aria-hidden />
                Generar enlace
              </Button>
              {generated && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-2.5"
                >
                  <code className="flex-1 text-xs font-mono text-[var(--gold-soft)] truncate">{generated}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label="Copiar enlace"
                    onClick={() => { navigator.clipboard?.writeText(generated).catch(() => {}); toast({ title: "Copiado" }); }}
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                </motion.div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-4 w-4 text-[var(--teal)]" aria-hidden />
              <span className="font-medium text-sm">Reglas de comisión</span>
            </div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[var(--gold-soft)] mt-0.5 shrink-0" aria-hidden />
                <span><span className="font-medium">20% del primer año</span> para afiliados registrados en el programa.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[var(--gold-soft)] mt-0.5 shrink-0" aria-hidden />
                <span><span className="font-medium">10%</span> para referidos cliente-a-cliente (split entre ambos).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[var(--gold-soft)] mt-0.5 shrink-0" aria-hidden />
                <span>Payout mensual a partir de <span className="font-medium">€50</span> acumulados.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[var(--gold-soft)] mt-0.5 shrink-0" aria-hidden />
                <span>Atribución por <span className="font-mono text-xs">first-touch</span> con cookie de 90 días.</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full mt-4" onClick={() => setSettingsOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" aria-hidden />
              Crear programa de afiliados
            </Button>
          </GlassCard>
        </div>
      </div>

      <ProgramDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

function ProgramDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [pct, setPct] = React.useState("20");
  const [days, setDays] = React.useState("365");
  const [autoApprove, setAutoApprove] = React.useState(true);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear programa de afiliados</DialogTitle>
          <DialogDescription>Configura las reglas del programa. Los cambios aplican a nuevos afiliados.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pr-pct">Comisión (%)</Label>
              <Input id="pr-pct" type="number" value={pct} onChange={(e) => setPct(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-days">Duración cookie (días)</Label>
              <Input id="pr-days" type="number" value={days} onChange={(e) => setDays(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pr-name">Nombre del programa</Label>
            <Input id="pr-name" defaultValue="RestoPanel Partners" />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/40 p-3">
            <div>
              <div className="text-sm font-medium">Aprobación automática</div>
              <div className="text-[11px] text-muted-foreground">Acepta afiliados sin revisión manual</div>
            </div>
            <Switch checked={autoApprove} onCheckedChange={setAutoApprove} aria-label="Aprobación automática" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => { toast({ title: "Programa creado", description: `Comisión ${pct}% · cookie ${days} días` }); onOpenChange(false); }} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]">
            Crear programa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * A/B Testing tab
 * ===================================================================== */

function ABTestingTab() {
  const [exp, setExp] = React.useState<Experiment | null>(null);
  const [newOpen, setNewOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Experimentos A/B"
        subtitle="Pruebas activas y finalizadas en acquisition y conversión"
        badge={`${EXPERIMENTS.length} experimentos`}
        action={
          <Button onClick={() => setNewOpen(true)} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]">
            <Plus className="h-4 w-4 mr-1.5" aria-hidden />
            Nuevo experimento
          </Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {EXPERIMENTS.map((ex, i) => (
          <ABCard key={ex.id} exp={ex} index={i} onView={() => setExp(ex)} />
        ))}
      </div>
      <ExperimentDialog exp={exp} onClose={() => setExp(null)} />
      <NewExperimentDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

function ABCard({ exp, index, onView }: { exp: Experiment; index: number; onView: () => void }) {
  const reduce = useReducedMotion();
  const winner = exp.status === "Ganadora: A" ? "A" : exp.status === "Ganadora: B" ? "B" : null;
  const sigColor = exp.significance >= 90 ? "text-emerald-400" : exp.significance >= 75 ? "text-[var(--gold-soft)]" : "text-muted-foreground";
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <GlassCard className="h-full flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Beaker className="h-4 w-4 text-[var(--teal)]" aria-hidden />
            <h3 className="font-medium text-sm leading-tight">{exp.name}</h3>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] shrink-0",
              exp.status === "En curso"
                ? "border-[var(--teal)]/30 text-[var(--teal)] bg-[var(--teal)]/10"
                : "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
            )}
          >
            {exp.status}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2">{exp.hypothesis}</p>

        {/* Variants comparison */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <VariantBar label={`A · ${exp.control.label}`} value={exp.control.value} metric={exp.control.metric} winner={winner === "A"} />
          <VariantBar label={`B · ${exp.variant.label}`} value={exp.variant.value} metric={exp.variant.metric} winner={winner === "B"} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center mt-auto pt-3 border-t border-border/40">
          <Stat label="Muestra" value={fmtNum(exp.sample)} />
          <Stat label="Significancia" value={`${exp.significance}%`} color={sigColor} />
          <Stat label="Duración" value={exp.duration} />
        </div>
        <Button variant="ghost" size="sm" className="w-full mt-3" onClick={onView}>
          Ver resultados
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden />
        </Button>
      </GlassCard>
    </motion.div>
  );
}

function VariantBar({ label, value, metric, winner }: { label: string; value: number; metric: string; winner: boolean }) {
  return (
    <div className={cn("rounded-md border p-2.5", winner ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/40 bg-foreground/[0.02]")}>
      <div className="text-[10px] text-muted-foreground truncate">{label}</div>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="font-display text-lg tabular-nums">{value}%</span>
        <span className="text-[9px] text-muted-foreground">{metric.replace("% ", "")}</span>
      </div>
      <Progress value={value} className="h-1 mt-1.5" />
      {winner && (
        <div className="mt-1.5 text-[10px] text-emerald-400 flex items-center gap-1">
          <Check className="h-3 w-3" aria-hidden /> Ganadora
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
      <div className={cn("font-mono text-sm tabular-nums mt-0.5", color)}>{value}</div>
    </div>
  );
}

function ExperimentDialog({ exp, onClose }: { exp: Experiment | null; onClose: () => void }) {
  return (
    <Dialog open={!!exp} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {exp && (
          <>
            <DialogHeader>
              <DialogTitle className="leading-tight">{exp.name}</DialogTitle>
              <DialogDescription>
                Audiencia: {exp.audience} · {exp.duration} · {fmtNum(exp.sample)} muestras
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-1">Hipótesis</div>
                <p className="text-sm">{exp.hypothesis}</p>
              </div>
              {/* Bar chart */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-2">Resultado principal</div>
                <div className="space-y-3">
                  <ExpBarRow label={`A · ${exp.control.label}`} value={exp.control.value} metric={exp.control.metric} color="bg-foreground/30" winner={exp.status === "Ganadora: A"} />
                  <ExpBarRow label={`B · ${exp.variant.label}`} value={exp.variant.value} metric={exp.variant.metric} color="bg-[var(--gold)]" winner={exp.status === "Ganadora: B"} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="Significancia" value={`${exp.significance}%`} color={exp.significance >= 90 ? "text-emerald-400" : "text-[var(--gold-soft)]"} />
                <Stat label="Muestra" value={fmtNum(exp.sample)} />
                <Stat label="Duración" value={exp.duration} />
              </div>
              {exp.status !== "En curso" && (
                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
                  <span><span className="font-medium">{exp.status}</span> · implementa la variante ganadora en producción.</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>Cerrar</Button>
              {exp.status !== "En curso" ? (
                <Button className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]" onClick={() => { toast({ title: "Variante aplicada", description: exp.variant.label }); onClose(); }}>
                  Aplicar ganadora
                </Button>
              ) : (
                <Button variant="outline" onClick={() => { toast({ title: "Experimento pausado" }); onClose(); }}>Pausar</Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ExpBarRow({ label, value, metric, color, winner }: { label: string; value: number; metric: string; color: string; winner: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs truncate flex-1">{label}</span>
        <span className={cn("font-mono text-sm tabular-nums", winner && "text-emerald-400")}>{value}% {metric.replace("% ", "")}</span>
      </div>
      <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value * 2.5)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("h-full rounded-full", winner ? "bg-emerald-500" : color)}
        />
      </div>
    </div>
  );
}

function NewExperimentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [hypothesis, setHypothesis] = React.useState("");
  const [control, setControl] = React.useState("");
  const [variant, setVariant] = React.useState("");
  const [metric, setMetric] = React.useState("% conversión");
  const [audience, setAudience] = React.useState("Tráfico orgánico");
  const [duration, setDuration] = React.useState("14");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo experimento A/B</DialogTitle>
          <DialogDescription>Define la hipótesis, las variantes y la métrica principal.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ne-hyp">Hipótesis</Label>
            <Textarea id="ne-hyp" value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} placeholder="Si cambiamos X, esperamos que Y aumente porque…" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ne-control">Variante A (control)</Label>
              <Input id="ne-control" value={control} onChange={(e) => setControl(e.target.value)} placeholder="CTA actual" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ne-variant">Variante B</Label>
              <Input id="ne-variant" value={variant} onChange={(e) => setVariant(e.target.value)} placeholder="CTA nuevo" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Métrica principal</Label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="% conversión">% conversión</SelectItem>
                <SelectItem value="% open rate">% open rate</SelectItem>
                <SelectItem value="% CTR">% CTR</SelectItem>
                <SelectItem value="% anual">% anual</SelectItem>
                <SelectItem value="% demo">% demo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ne-aud">Audiencia</Label>
              <Input id="ne-aud" value={audience} onChange={(e) => setAudience(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ne-dur">Duración (días)</Label>
              <Input id="ne-dur" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (!hypothesis.trim() || !control.trim() || !variant.trim()) {
                toast({ title: "Faltan datos", description: "Completa hipótesis y variantes", variant: "destructive" });
                return;
              }
              toast({ title: "Experimento creado", description: `${control} vs ${variant} · ${duration} días` });
              setHypothesis(""); setControl(""); setVariant("");
              onOpenChange(false);
            }}
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          >
            Crear experimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================================
 * Onboarding tab
 * ===================================================================== */

function OnboardingTab() {
  const [days, setDays] = React.useState(true);
  return (
    <div className="space-y-6">
      {/* TTFV */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard glow="teal" className="md:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-[var(--teal)]" aria-hidden />
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">Time to first value</span>
          </div>
          <div className="font-display text-3xl">2,4 días</div>
          <div className="text-xs text-muted-foreground">media hasta primera reserva activa</div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300 bg-emerald-500/10">−18% vs Q3</Badge>
          </div>
        </GlassCard>
        <GlassCard className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-medium text-sm">Onboarding funnel</h3>
              <p className="text-[11px] text-muted-foreground">Drop-off entre pasos · media de tiempo por paso</p>
            </div>
          </div>
          <OnboardFunnel />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Checklist */}
        <GlassCard>
          <SectionHeader title="Checklist de onboarding" subtitle="Cliente: Grupo Gastrolab · nuevo" badge="7 / 8 pasos" />
          <ol className="space-y-2">
            {ONBOARD_FUNNEL.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3 rounded-md border border-border/40 bg-foreground/[0.02] p-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10 text-xs font-mono shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{s.label}</span>
                    {s.completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {s.completed ? "Completado" : "Pendiente"} · {s.avgTime}
                    {s.dropoff > 0 && <span className="text-red-400/80"> · {s.dropoff}% drop-off</span>}
                  </div>
                </div>
                {!s.completed && (
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-[11px]">Recordar</Button>
                )}
              </li>
            ))}
          </ol>
        </GlassCard>

        {/* Academy */}
        <GlassCard>
          <SectionHeader
            title="Academia RestoPanel"
            subtitle="Módulos formativos · completión media"
            badge="8 módulos"
          />
          <ul className="space-y-2 max-h-[420px] overflow-y-auto rp-scroll-thin pr-1">
            {ACADEMY.map((m) => {
              const Icon = m.icon;
              return (
                <li key={m.id} className="flex items-center gap-3 rounded-md border border-border/40 bg-foreground/[0.02] p-2.5 hover:bg-foreground/[0.04] transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--gold)]/10 text-[var(--gold)] shrink-0">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{m.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">· {m.duration}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Progress value={m.completion} className="h-1 flex-1" />
                      <span className="text-[10px] font-mono tabular-nums text-muted-foreground w-9 text-right">{m.completion}%</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 px-2 shrink-0" onClick={() => toast({ title: "Abriendo módulo", description: m.title })}>
                    Ver módulo
                  </Button>
                </li>
              );
            })}
          </ul>
        </GlassCard>
      </div>

      {/* Automation */}
      <GlassCard glow="gold">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--gold)]/10 text-[var(--gold)] shrink-0">
              <MailCheck className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h3 className="font-medium">Onboarding automation</h3>
              <p className="text-sm text-muted-foreground">Secuencia automática de emails: <span className="font-mono text-[var(--gold-soft)]">día 1 · 3 · 7 · 14</span></p>
              <p className="text-[11px] text-muted-foreground mt-1">Emails con tips, screenshots y CTA a Academia. Abren 47% · CTR 12%.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
              {days ? "Activa" : "Pausada"}
            </Badge>
            <Switch checked={days} onCheckedChange={setDays} aria-label="Activar onboarding automation" />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function OnboardFunnel() {
  const base = 100;
  // Immutable fold: each step's value = 100 − sum of previous dropoffs.
  const bars = ONBOARD_FUNNEL.map((s, idx) => {
    const prevDrop = ONBOARD_FUNNEL.slice(0, idx).reduce((sum, x) => sum + x.dropoff, 0);
    const val = Math.max(0, base - prevDrop);
    return { ...s, val };
  });
  return (
    <div className="space-y-2">
      {bars.map((b, i) => (
        <div key={b.id} className="flex items-center gap-3">
          <div className="w-32 shrink-0 text-xs text-muted-foreground truncate">{b.label}</div>
          <div className="flex-1 h-6 rounded bg-foreground/5 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${b.val}%` }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className={cn("h-full rounded", b.completed ? "bg-gradient-to-r from-[var(--teal)] to-[var(--teal-deep)]" : "bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)]")}
            />
            <span className="absolute inset-y-0 right-2 flex items-center text-[10px] font-mono text-muted-foreground">
              {b.val}%
            </span>
          </div>
          <div className="w-20 shrink-0 text-right text-[11px] text-muted-foreground">{b.avgTime}</div>
          {i > 0 && b.dropoff > 0 && (
            <div className="w-16 shrink-0 text-right text-[10px] text-red-400/80 font-mono">−{b.dropoff}%</div>
          )}
        </div>
      ))}
    </div>
  );
}

/* =====================================================================
 * Main export
 * ===================================================================== */

const TABS = [
  { id: "pipeline", label: "Pipeline", icon: TrendingUp },
  { id: "leads", label: "Leads", icon: Users },
  { id: "afiliados", label: "Afiliados", icon: Gift },
  { id: "ab", label: "A/B Testing", icon: Beaker },
  { id: "onboarding", label: "Onboarding", icon: GraduationCap },
] as const;

export function GrowthEngine() {
  const [tab, setTab] = React.useState<string>("pipeline");
  const reduce = useReducedMotion();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--gold)]/10 text-[var(--gold)]">
              <TrendingUp className="h-4 w-4" aria-hidden />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">Growth Engine</h1>
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-[0.15em] border-[var(--gold)]/30 text-[var(--gold-soft)] bg-[var(--gold)]/5">
              demo
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Adquisición, conversión y expansión de RestoPanel · Pipeline, leads con scoring IA, afiliados, A/B testing y onboarding.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto rp-scroll-thin -mx-1 px-1 pb-1">
          <TabsList className="inline-flex w-auto min-w-full">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.id} value={t.id} className="gap-1.5 min-h-[40px]">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  <span>{t.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        <TabsContent value="pipeline" className="mt-5 focus-visible:outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <PipelineTab />
          </motion.div>
        </TabsContent>
        <TabsContent value="leads" className="mt-5 focus-visible:outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <LeadsTab />
          </motion.div>
        </TabsContent>
        <TabsContent value="afiliados" className="mt-5 focus-visible:outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <AfiliadosTab />
          </motion.div>
        </TabsContent>
        <TabsContent value="ab" className="mt-5 focus-visible:outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ABTestingTab />
          </motion.div>
        </TabsContent>
        <TabsContent value="onboarding" className="mt-5 focus-visible:outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <OnboardingTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
