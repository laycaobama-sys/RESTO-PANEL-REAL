"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles, Send, Mic, ShieldCheck, ChevronRight,
  Database, TrendingUp, Clock, BookOpen,
  Lightbulb, AlertTriangle, CheckCircle2, History, Euro,
  Zap, ArrowRight, Lock, FileText, BarChart3, ExternalLink,
} from "lucide-react";

/* ============================================================
   Types
============================================================ */

type Confidence = "alta" | "media" | "baja";

interface AiSource {
  label: string;
}

interface AiDrillDown {
  label: string;
  icon: React.ElementType;
}

interface AiRecommendation {
  text: string;
  requiresApproval: boolean;
  ctaLabel: string;
}

interface AiMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  ts: string;
  // AI structured payload
  dataAnalyzed?: string;
  reasoning?: string;
  facts?: string;
  predictions?: string;
  confidence?: { level: Confidence; pct: number };
  sources?: AiSource[];
  period?: string;
  recommendation?: AiRecommendation;
  drillDown?: AiDrillDown[];
  limitations?: string;
  isDemo?: boolean;
}

interface RecentQuery {
  id: string;
  text: string;
  ago: string;
}

/* ============================================================
   Demo data — pre-loaded conversation
============================================================ */

const SUGGESTED_QUESTIONS = [
  "¿Qué está pasando hoy?",
  "¿Por qué han bajado las reservas?",
  "¿Qué camarero vende más?",
  "¿Qué mesa genera más ingresos?",
  "¿Qué cliente debo recuperar?",
  "¿Cuánto voy a facturar mañana?",
  "¿Por qué aumentaron los no-shows?",
  "¿Qué campaña funcionó mejor?",
  "¿Qué restaurante está rindiendo peor?",
  "¿Qué acción tendría mayor impacto esta semana?",
];

const RECENT_QUERIES: RecentQuery[] = [
  { id: "q1", text: "¿Por qué han bajado las reservas?", ago: "hace 2 min" },
  { id: "q2", text: "¿Qué acción tendría mayor impacto esta semana?", ago: "hace 5 min" },
  { id: "q3", text: "¿Cuánto voy a facturar mañana?", ago: "hace 12 min" },
  { id: "q4", text: "¿Qué cliente debo recuperar?", ago: "hace 28 min" },
  { id: "q5", text: "¿Qué camarero vende más?", ago: "hace 1 h" },
];

const INITIAL_MESSAGES: AiMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "¿Por qué han bajado las reservas?",
    ts: "10:42",
  },
  {
    id: "m2",
    role: "ai",
    content:
      "Las reservas han caído un 18% frente al mismo martes del mes anterior. La principal causa parece ser una reducción del 31% en reservas procedentes de campañas de Instagram.",
    ts: "10:42",
    dataAnalyzed: "1-21 enero 2025 vs 1-21 diciembre 2024 · D1 + Campaign attribution",
    reasoning:
      "1) Reservas totales: 1.247 vs 1.521 (-18%). 2) Desglose por canal: Web +2%, Google +5%, WhatsApp +8%, Instagram -31%, Phone -12%. 3) La caída de Instagram explica el 68% de la disminución total. 4) La campaña 'Enero sin reservas' en Instagram se pausó el 8 de enero.",
    facts: "Reservas cayeron 18%. Instagram -31%. Campaña pausada 8 ene.",
    predictions:
      "Si no se reactiva la campaña, se proyecta -22% la próxima semana.",
    confidence: { level: "media", pct: 65 },
    sources: [
      { label: "D1 reservations" },
      { label: "Campaign attribution" },
      { label: "Instagram Ads API" },
    ],
    period: "1-21 enero 2025 vs 1-21 diciembre 2024",
    recommendation: {
      text: "Reactivar campaña Instagram 'Enero sin reservas' y lanzar acción específica para turno de noche.",
      requiresApproval: true,
      ctaLabel: "Reactivar campaña",
    },
    drillDown: [
      { label: "Ver campaña", icon: BarChart3 },
      { label: "Ver datos reservas", icon: Database },
      { label: "Ver atribución", icon: ExternalLink },
    ],
    limitations: "Faltan datos completos de atribución para el 15% de las reservas.",
  },
  {
    id: "m3",
    role: "user",
    content: "¿Qué acción tendría mayor impacto esta semana?",
    ts: "10:44",
  },
  {
    id: "m4",
    role: "ai",
    content:
      "Recuperar 14 clientes VIP que no visitan en 60+ días. Impacto estimado: +€2.380 ingresos, +8 reservas. Es la acción de mayor ROI disponible.",
    ts: "10:44",
    dataAnalyzed: "CRM + Billing + Reservations · Últimos 90 días",
    reasoning:
      "1) 14 clientes VIP con LTV medio €3.840 sin visita en 60+ días. 2) Tasa de recuperación histórica con WhatsApp personalizado: 57%. 3) Ingreso medio por recuperación: €170. 4) ROI estimado: 900% (coste €0 con WhatsApp incluido en plan). 5) Alternativas evaluadas: campaña email (ROI 310%), promoción martes (ROI 280%).",
    facts: "14 VIPs inactivos. 57% recuperación histórica. €170 ingreso medio.",
    predictions: "8 de 14 VIPs responderán, generando ~€1.360-€2.380.",
    confidence: { level: "alta", pct: 82 },
    sources: [
      { label: "CRM customer_profiles" },
      { label: "CRM customer_events" },
      { label: "Billing invoices" },
    ],
    period: "Datos: últimos 90 días. Proyección: próximos 7 días.",
    recommendation: {
      text: "Enviar WhatsApp personalizado a 14 VIPs inactivos con oferta de retorno.",
      requiresApproval: true,
      ctaLabel: "Crear campaña WhatsApp",
    },
    drillDown: [
      { label: "Ver lista VIPs", icon: BookOpen },
      { label: "Crear campaña", icon: Zap },
      { label: "Ver histórico recuperaciones", icon: History },
    ],
  },
];

/* ============================================================
   Demo response generator — for new user questions
============================================================ */

const DEMO_RESPONSES: Array<Omit<AiMessage, "id" | "role" | "ts" | "content">> = [
  {
    content:
      "Hoy hay 47 reservas confirmadas (+12% vs ayer), ocupación prevista 78% y proyección de ingresos €4.100. El servicio de cena está al 92% con 2 mesas aún disponibles. (demo)",
    dataAnalyzed: "Hoy · D1 + Analytics Engine + Billing",
    reasoning:
      "1) Reservas confirmadas: 47 (comida 21, cena 26). 2) Ocupación: 78% sobre 66 cubiertos. 3) Ingresos a las 14:00: €1.842 (45% del objetivo). 4) Pico de cena previsto a las 21:00. 5) No-shows actuales: 3 (tasa 6.4%).",
    facts: "47 reservas. €1.842 facturados hasta ahora. Ocupación 78%.",
    predictions: "Cierre estimado: €4.100 (±5%) si no hay cancelaciones adicionales.",
    confidence: { level: "alta", pct: 88 },
    sources: [
      { label: "D1 reservations" },
      { label: "Analytics Engine" },
      { label: "Billing invoices" },
    ],
    period: "Hoy 27 ene 2025 · 14:00 CET",
    recommendation: {
      text: "Mantener plan actual. Monitorizar mesa 14 (reserva de 5 pax sin confirmar).",
      requiresApproval: false,
      ctaLabel: "Ver plano de mesas",
    },
    drillDown: [
      { label: "Ver datos", icon: Database },
      { label: "Ver reservas", icon: BookOpen },
      { label: "Ver clientes", icon: ExternalLink },
    ],
    limitations: "Proyección de cierre puede variar según cancelaciones de última hora.",
  },
  {
    content:
      "María García (camarera turno noche) es la que más vende: €48/ticket medio, +27% sobre la media del equipo. Le sigue Javier Ruiz con €41/ticket. (demo)",
    dataAnalyzed: "Últimos 30 días · Staff + POS + Reservations",
    reasoning:
      "1) Tickets por camarero: María €48, Javier €41, Carlos €35, Laura €33. 2) María recomienda postres en 68% de mesas vs 24% media. 3) Upselling de vinos: María 42%, Javier 28%. 4) Horas trabajadas: María 180h, Javier 165h.",
    facts: "María €48/ticket. +27% sobre media. Recomendación postres 68%.",
    predictions: "Si María capacita al equipo en técnicas de upselling, ticket medio +8% en 4 semanas.",
    confidence: { level: "alta", pct: 84 },
    sources: [
      { label: "POS tickets" },
      { label: "Staff shifts" },
      { label: "Reservations" },
    ],
    period: "1-27 enero 2025",
    recommendation: {
      text: "Sesión de capacitación de 30 min con María sobre upselling de postres y vinos.",
      requiresApproval: false,
      ctaLabel: "Programar sesión",
    },
    drillDown: [
      { label: "Ver equipo", icon: BookOpen },
      { label: "Ver tickets", icon: Database },
      { label: "Ver rankings", icon: BarChart3 },
    ],
  },
  {
    content:
      "La Mesa 7 (sala VIP) genera más ingresos: €12.480 este mes, ticket medio €84, ocupación 91%. Es la mesa con mayor rentabilidad por m². (demo)",
    dataAnalyzed: "Mes en curso · Floor + POS + Billing",
    reasoning:
      "1) Ingresos por mesa: M7 €12.480, M14 €9.230, M4 €7.810, M12 €6.450. 2) Ticket medio M7: €84 vs media €38. 3) Ocupación M7: 91%. 4) Rotación M7: 2.8 servicios/día. 5) M7 suele asignarse a reservas VIP y eventos.",
    facts: "M7 €12.480/mes. Ticket €84. Ocupación 91%.",
    predictions: "M7 generará ~€14.200 al cierre de mes si mantiene la tendencia.",
    confidence: { level: "media", pct: 76 },
    sources: [
      { label: "POS tickets" },
      { label: "Floor assignments" },
      { label: "Billing" },
    ],
    period: "1-27 enero 2025",
    recommendation: {
      text: "Priorizar M7 para reservas VIP y eventos premium. Considerar menú degustación exclusivo.",
      requiresApproval: true,
      ctaLabel: "Ver configuración mesa",
    },
    drillDown: [
      { label: "Ver plano", icon: BookOpen },
      { label: "Ver ingresos por mesa", icon: Database },
      { label: "Ver histórico M7", icon: History },
    ],
    limitations: "Datos de eventos privados no completamente desglosados.",
  },
];

function pickDemoResponse(): Omit<AiMessage, "id" | "role" | "ts"> {
  const base = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
  return { ...base, isDemo: true };
}

/* ============================================================
   Sub-components
============================================================ */

function ConfidenceBadge({ level, pct }: { level: Confidence; pct: number }) {
  const styles: Record<Confidence, string> = {
    alta: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    media: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    baja: "border-destructive/40 bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider",
        styles[level]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      Confianza {level} · {pct}%
    </span>
  );
}

function SourceChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/8 px-2 py-0.5 text-[11px] font-mono text-[var(--teal)]">
      <Database className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}

function SectionLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      <Icon className="h-3 w-3" aria-hidden />
      {children}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1.5" aria-label="IA escribiendo">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   AI Message bubble
============================================================ */

function AiBubble({ message }: { message: AiMessage }) {
  const { toast } = useToast();
  const [executed, setExecuted] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3 max-w-full"
    >
      {/* Avatar */}
      <div className="shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black ring-1 ring-[var(--gold)]/40">
        <Sparkles className="h-4 w-4" aria-hidden />
      </div>

      {/* Bubble */}
      <div className="flex-1 min-w-0 rp-glass rounded-2xl rounded-tl-md p-4 sm:p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--gold-soft)]">IA Ejecutiva</span>
            {message.isDemo && (
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300">
                demo
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{message.ts}</span>
        </div>

        {/* 1. Respuesta directa */}
        <div>
          <SectionLabel icon={Sparkles}>Respuesta directa</SectionLabel>
          <p className="mt-1.5 text-sm sm:text-[15px] leading-relaxed text-foreground">
            {message.content}
          </p>
        </div>

        {/* 2. Datos analizados */}
        {message.dataAnalyzed && (
          <div className="flex flex-col gap-1">
            <SectionLabel icon={Database}>Datos analizados</SectionLabel>
            <p className="text-xs text-muted-foreground font-mono">{message.dataAnalyzed}</p>
          </div>
        )}

        {/* 3. Razonamiento */}
        {message.reasoning && (
          <div className="rounded-lg border border-border/60 bg-foreground/[0.03] p-3">
            <SectionLabel icon={Lightbulb}>Razonamiento</SectionLabel>
            <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-foreground/85 whitespace-pre-line">
              {message.reasoning}
            </p>
          </div>
        )}

        {/* 4. Hechos vs Predicciones */}
        <div className="grid sm:grid-cols-2 gap-2">
          {message.facts && (
            <div className="rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/8 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                Hechos
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">{message.facts}</p>
            </div>
          )}
          {message.predictions && (
            <div className="rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/8 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
                <TrendingUp className="h-3 w-3" aria-hidden />
                Predicción
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">{message.predictions}</p>
            </div>
          )}
        </div>

        {/* 5. Confianza + 7. Periodo */}
        <div className="flex flex-wrap items-center gap-2">
          {message.confidence && (
            <ConfidenceBadge level={message.confidence.level} pct={message.confidence.pct} />
          )}
          {message.period && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-foreground/[0.03] px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden />
              {message.period}
            </span>
          )}
        </div>

        {/* 6. Fuentes citadas */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <SectionLabel icon={FileText}>Fuentes citadas</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((s, i) => (
                <SourceChip key={i} label={s.label} />
              ))}
            </div>
          </div>
        )}

        {/* 8. Recomendación */}
        {message.recommendation && (
          <div className="rounded-lg border-l-2 border-[var(--gold)]/60 bg-[var(--gold)]/[0.06] p-3">
            <SectionLabel icon={Zap}>Recomendación</SectionLabel>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground">
              {message.recommendation.text}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setExecuted(true);
                  toast({
                    title: "Acción iniciada",
                    description: message.recommendation!.ctaLabel,
                  });
                }}
                disabled={executed}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-md bg-[var(--gold)] px-3 py-1.5 text-xs font-medium text-black hover:bg-[var(--gold-soft)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {executed ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Ejecutada
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5" aria-hidden />
                    {message.recommendation.ctaLabel}
                  </>
                )}
              </button>
              {message.recommendation.requiresApproval && (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-300">
                  <Lock className="h-3 w-3" aria-hidden />
                  Requiere aprobación
                </span>
              )}
            </div>
          </div>
        )}

        {/* 9. Profundizar */}
        {message.drillDown && message.drillDown.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <SectionLabel icon={ArrowRight}>Profundizar</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {message.drillDown.map((d, i) => (
                <button
                  key={i}
                  onClick={() =>
                    toast({
                      title: "Abriendo detalle",
                      description: d.label,
                    })
                  }
                  className="min-h-[36px] inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-foreground/[0.03] px-2.5 py-1 text-xs text-foreground/80 hover:border-[var(--gold)]/40 hover:text-[var(--gold-soft)] transition-colors"
                >
                  <d.icon className="h-3.5 w-3.5" aria-hidden />
                  {d.label}
                  <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 10. Limitaciones */}
        {message.limitations && (
          <div className="flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-400/[0.06] p-2.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-300" aria-hidden />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                Limitaciones
              </div>
              <p className="mt-0.5 text-xs text-foreground/80">{message.limitations}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function UserBubble({ message }: { message: AiMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] sm:max-w-[75%]">
        <div className="rounded-2xl rounded-tr-md border border-[var(--gold)]/30 bg-[var(--gold)]/[0.10] px-4 py-2.5">
          <p className="text-sm leading-relaxed text-foreground">{message.content}</p>
        </div>
        <div className="mt-1 text-right text-[10px] font-mono text-muted-foreground">
          {message.ts}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Sidebar (desktop only)
============================================================ */

function AiSidebar() {
  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 rp-glass-strong rounded-2xl p-5 gap-5 h-fit sticky top-4">
      {/* Consultas recientes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          <h3 className="text-sm font-medium">Consultas recientes</h3>
        </div>
        <div className="space-y-1.5">
          {RECENT_QUERIES.map((q) => (
            <button
              key={q.id}
              className="w-full min-h-[40px] text-left rounded-md border border-border/60 bg-foreground/[0.02] px-3 py-2 hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/[0.06] transition-colors group"
            >
              <div className="text-xs font-medium text-foreground/90 truncate group-hover:text-[var(--gold-soft)]">
                {q.text}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{q.ago}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px rp-divider" />

      {/* Datos utilizados hoy */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-[var(--teal)]" aria-hidden />
          <h3 className="text-sm font-medium">Datos utilizados hoy</h3>
        </div>
        <div className="space-y-1.5 text-xs">
          {[
            { src: "D1 reservations", n: 47 },
            { src: "Analytics Engine", n: 12 },
            { src: "CRM profiles", n: 8 },
            { src: "Billing invoices", n: 23 },
            { src: "Campaign attribution", n: 5 },
            { src: "Instagram Ads API", n: 3 },
          ].map((d) => (
            <div key={d.src} className="flex items-center justify-between">
              <span className="text-foreground/80 truncate">{d.src}</span>
              <span className="font-mono text-[var(--teal)] shrink-0 ml-2">{d.n}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px rp-divider" />

      {/* Coste IA hoy */}
      <div className="rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-3">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[var(--gold-soft)]">
          <Euro className="h-3 w-3" aria-hidden />
          Coste IA hoy
        </div>
        <div className="mt-1 font-display text-2xl font-light rp-gold-text">€0,42</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">98 consultas · 1,2 s media</div>
      </div>
    </aside>
  );
}

/* ============================================================
   Main component
============================================================ */

export function ExecAi() {
  const reduceMotion = useReducedMotion();
  const [messages, setMessages] = React.useState<AiMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new message
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }, [messages, isTyping, reduceMotion]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const userMsg: AiMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      ts,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking + response
    window.setTimeout(() => {
      const demo = pickDemoResponse();
      const aiMsg: AiMessage = {
        id: `a-${Date.now()}`,
        role: "ai",
        ts,
        ...demo,
      };
      setMessages((m) => [...m, aiMsg]);
      setIsTyping(false);
    }, 1400);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="flex gap-5">
      {/* Chat column */}
      <div className="flex-1 min-w-0 flex flex-col rp-glass-strong rounded-2xl overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-border/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black ring-1 ring-[var(--gold)]/40 shrink-0">
              <Sparkles className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base sm:text-lg font-medium tracking-tight truncate">
                  IA Ejecutiva
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300">
                  demo
                </span>
              </div>
              <div className="text-[11px] font-mono text-muted-foreground truncate">
                Modelo: glm-4-flash vía AI Gateway · 1.2s latencia media
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[var(--teal)] shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)] animate-pulse" />
            en línea
          </div>
        </header>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto rp-scroll-thin px-4 sm:px-5 py-5 space-y-5 max-h-[58vh] min-h-[420px]"
          aria-live="polite"
        >
          {messages.map((m) =>
            m.role === "user" ? (
              <UserBubble key={m.id} message={m} />
            ) : (
              <AiBubble key={m.id} message={m} />
            )
          )}

          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="flex gap-3"
              >
                <div className="shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black ring-1 ring-[var(--gold)]/40">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </div>
                <div className="rp-glass rounded-2xl rounded-tl-md px-4 py-2.5">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestions */}
        <div className="px-4 sm:px-5 pt-3 border-t border-border/60">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Preguntas sugeridas
          </div>
          <div className="flex gap-1.5 overflow-x-auto rp-scroll-thin pb-2 -mx-1 px-1">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => send(q)}
                disabled={isTyping}
                className="shrink-0 min-h-[36px] inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-foreground/[0.03] px-3 py-1.5 text-xs text-foreground/80 hover:border-[var(--gold)]/40 hover:text-[var(--gold-soft)] hover:bg-[var(--gold)]/[0.06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-3 w-3 text-[var(--gold)]" aria-hidden />
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-5 py-3 border-t border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-border/60 bg-foreground/[0.03] px-3 py-2 focus-within:border-[var(--gold)]/40 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta a la IA Ejecutiva…"
                disabled={isTyping}
                className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-muted-foreground disabled:opacity-50"
                aria-label="Pregunta a la IA Ejecutiva"
              />
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                className="shrink-0 h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-[var(--teal)] hover:bg-foreground/5 transition-colors"
                aria-label="Entrada de voz (decorativo)"
                tabIndex={-1}
              >
                <Mic className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--gold)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--gold-soft)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Enviar pregunta"
            >
              <Send className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>

          {/* Security notice */}
          <div className="mt-2.5 flex items-start gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[var(--teal)]" aria-hidden />
            <p className="leading-relaxed">
              La IA utiliza únicamente datos autorizados del restaurante. Respeta permisos RBAC.
              No accede a datos de otros restaurantes. Toda consulta se registra con{" "}
              <span className="font-mono text-[var(--teal)]">correlation_id</span>. Protección contra
              prompt injection activada.
            </p>
          </div>
        </form>
      </div>

      {/* Sidebar (desktop only) */}
      <AiSidebar />
    </div>
  );
}
