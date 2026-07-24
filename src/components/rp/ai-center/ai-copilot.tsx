"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles, Send, Mic, Minus, X, ShieldCheck, ArrowRight,
  AlertTriangle, Lock, ChevronRight, Cpu, MessageSquare,
} from "lucide-react";
import { useNav, type Section } from "@/components/rp/app/nav-store";

/* ============================================================
   Types
============================================================ */

type Role = "owner" | "manager" | "staff";
type Confidence = "alta" | "media" | "baja";

interface SourceChip { label: string }
interface Msg {
  id: string;
  role: "user" | "ai";
  content: string;
  ts: string;
  // AI extras
  sources?: SourceChip[];
  confidence?: Confidence;
  viewIn?: Section;
  viewInLabel?: string;
  noData?: boolean;
  denied?: boolean;
  streaming?: boolean;
}

/* ============================================================
   Demo responses — keyed by normalized query
============================================================ */

interface DemoResp {
  text: string;
  sources: string[];
  confidence: Confidence;
  viewIn?: { section: Section; label: string };
  restricted?: boolean; // requires role >= manager
}

const DEMO_RESPONSES: Record<string, DemoResp> = {
  "¿cuántas reservas tengo hoy?": {
    text: "Tienes 47 reservas hoy (+12% vs ayer). 38 confirmadas, 5 pendientes, 4 en lista de espera. La franja 21:30–22:30 está al 95%.",
    sources: ["D1 Reservations"],
    confidence: "alta",
    viewIn: { section: "reservas", label: "Ver reservas" },
  },
  "¿qué clientes vip llegan hoy?": {
    text: "8 clientes VIP con reserva hoy: Elena Marín (21:30, M12), Familia Ruiz (14:00, T3), Andrés Vidal (22:00, V1) y 5 más. Recomiendo greeting personalizado del maitre.",
    sources: ["CRM", "D1 Reservations"],
    confidence: "alta",
    viewIn: { section: "crm", label: "Ver CRM" },
  },
  "¿cuál es mi ocupación?": {
    text: "Ocupación actual: 78% (18/24 mesas). Terraza al 92%, Sala al 65%. Pico previsto en 25 minutos — sugiero abrir zona auxiliar.",
    sources: ["Durable Objects"],
    confidence: "alta",
    viewIn: { section: "reservas", label: "Ver en plano" },
  },
  "¿qué mesa genera más ingresos?": {
    text: "La Mesa 12 (terraza, capacidad 6) genera €4.820/mes, +22% sobre la media. Factores: vista, ubicación cercana a la entrada y tiempo medio de estancia más corto (rotación 3.2×).",
    sources: ["Billing", "Reservations"],
    confidence: "alta",
    viewIn: { section: "analytics", label: "Ver analítica" },
  },
  "¿qué campaña funcionó mejor?": {
    text: "La campaña 'Cumpleaños Marzo' generó €1.840 con €0 coste (ROI ∞). Es tu mejor campaña. Segunda: 'Menú Mediodía' con €1.620 (ROI 800%). Recomiendo escalar a abril.",
    sources: ["Campaign Attribution"],
    confidence: "alta",
    viewIn: { section: "campaigns", label: "Ver campañas" },
    restricted: true,
  },
  "¿cuánto facturaré mañana?": {
    text: "Facturación prevista mañana: €10.250 (confianza 78%, margen ±€1.200). Basado en: 186 reservas previstas, ticket medio €55 y factor de estacionalidad 1.08.",
    sources: ["Forecast v2.1"],
    confidence: "media",
    viewIn: { section: "analytics", label: "Ver forecast" },
    restricted: true,
  },
  "¿qué clientes recuperar?": {
    text: "23 clientes dormidos (+90 días) con ticket histórico > €50. De ellos 3 son VIP. El mejor canal para reactivación es WhatsApp (85% apertura). Estimo +€1.180 si lanzas esta semana.",
    sources: ["CRM"],
    confidence: "alta",
    viewIn: { section: "crm", label: "Ver CRM" },
  },
  "¿qué promoción funcionó mejor?": {
    text: "La promo 'Menú para dos entre semana' tuvo CTR 22% y convirtió 38 reservas en 7 días. La peor fue 'Promo Terraza': €460 ingresos con €140 coste. Recomiendo repetir la primera.",
    sources: ["Campaign Attribution"],
    confidence: "alta",
    viewIn: { section: "promotions", label: "Ver promociones" },
  },
  "¿por qué bajaron las reservas?": {
    text: "Las reservas cayeron 18% vs mismo martes del mes anterior. Causa principal: pausa de la campaña de Instagram el 8 de marzo (−31% en ese canal). Web y WhatsApp subieron +2% y +8% respectivamente.",
    sources: ["D1", "Campaign Attribution"],
    confidence: "alta",
    viewIn: { section: "reservas", label: "Ver reservas" },
  },
  "¿qué reseña responder primero?": {
    text: "Prioriza la reseña 2★ de 'Carlos M.' recibida hace 12 min: menciona tiempo de espera. La IA puede redactar una respuesta empática en español y ofrecer 10% descuento en próxima visita. Hay 4 reseñas más pendientes.",
    sources: ["Google Reviews"],
    confidence: "alta",
    viewIn: { section: "reviews", label: "Ver reseñas" },
  },
  "¿qué automatización debo activar?": {
    text: "Recomiendo activar 'Confirmación automática WhatsApp 2h antes'. Reduciría no-shows un 31% según histórico de 8 semanas. Impacto estimado: +€620/mes. Ya está creada, solo falta activar.",
    sources: ["Automations", "Reservations"],
    confidence: "media",
    viewIn: { section: "automatizaciones", label: "Ver automatizaciones" },
  },
  "¿cómo va el growth este mes?": {
    text: "Growth score: 78/100 (+6 vs mes anterior). Subidas: NPS 72 (+4), ROI campañas 340% (+45pp). Bajadas: ticket medio −4%. Top driver: la campaña 'Cumpleaños Marzo' generó €1.840 con coste cero.",
    sources: ["Growth Analytics"],
    confidence: "alta",
    viewIn: { section: "growth-analytics", label: "Ver Growth" },
  },
};

/* ============================================================
   Context-aware quick actions
============================================================ */

const SECTION_QUESTIONS: Partial<Record<Section, string[]>> = {
  dashboard: [
    "¿Qué está pasando hoy?",
    "¿Cuántas reservas tengo hoy?",
    "¿Cuál es mi ocupación?",
  ],
  executive: [
    "¿Qué acción tendría mayor impacto esta semana?",
    "¿Cuánto facturaré mañana?",
    "¿Por qué bajaron las reservas?",
  ],
  reservas: [
    "¿Cuántas reservas tengo hoy?",
    "¿Cuál es mi ocupación?",
    "¿Qué mesa genera más ingresos?",
  ],
  crm: [
    "¿Qué clientes VIP llegan hoy?",
    "¿Qué clientes recuperar?",
    "¿Cuántos clientes nuevos este mes?",
  ],
  marketing: [
    "¿Qué campaña funcionó mejor?",
    "¿Qué promoción funcionó mejor?",
    "¿Qué canal tiene mejor retorno?",
  ],
  automatizaciones: [
    "¿Qué automatización debo activar?",
    "¿Cuánto ahorro con automatizaciones?",
    "¿Qué automatización falló hoy?",
  ],
  "growth-analytics": [
    "¿Cómo va el growth este mes?",
    "¿Qué campaña funcionó mejor?",
    "¿Por qué bajó el ticket medio?",
  ],
  "growth-reputation": [
    "¿Qué reseña responder primero?",
    "¿Cuál es mi NPS?",
    "¿Cómo subió mi valoración en Google?",
  ],
  campaigns: [
    "¿Qué campaña funcionó mejor?",
    "¿Qué canal tiene mejor retorno?",
    "¿Qué segmento convierte más?",
  ],
  promotions: [
    "¿Qué promoción funcionó mejor?",
    "¿Qué promo canibalizó ventas?",
    "¿Qué promo repetir esta semana?",
  ],
  reviews: [
    "¿Qué reseña responder primero?",
    "¿Cuál es mi valoración media?",
    "¿Cuántas reseñas pendientes?",
  ],
  analytics: [
    "¿Qué mesa genera más ingresos?",
    "¿Cuánto facturaré mañana?",
    "¿Por qué bajó el ticket medio?",
  ],
  integraciones: [
    "¿Qué integración falla más?",
    "¿Qué webhook se retrasó?",
    "¿Qué API consume más cuota?",
  ],
  billing: [
    "¿Cuánto facturaré mañana?",
    "¿Cuál es mi margen bruto?",
    "¿Qué campaña generó más ingresos?",
  ],
  equipo: [
    "¿Quién vende más postres?",
    "¿Quién tiene peor rendimiento?",
    "¿Qué turno es más productivo?",
  ],
  configuracion: [
    "¿Qué ajuste mejoraría la ocupación?",
    "¿Qué permisos debo revisar?",
    "¿Cuál es mi configuración de IA?",
  ],
  superadmin: [
    "¿Qué local rinde peor?",
    "¿Cuál es el coste IA por local?",
    "¿Qué organización consume más?",
  ],
};

const DEFAULT_QUESTIONS = [
  "¿Cuántas reservas tengo hoy?",
  "¿Qué clientes VIP llegan hoy?",
  "¿Cuál es mi ocupación?",
  "¿Qué campaña funcionó mejor?",
  "¿Cuánto facturaré mañana?",
];

const SECTION_LABELS: Partial<Record<Section, string>> = {
  dashboard: "Dashboard",
  executive: "Centro Ejecutivo",
  reservas: "Reservas",
  crm: "Clientes",
  marketing: "Marketing",
  automatizaciones: "Automatizaciones",
  "growth-analytics": "Growth Analytics",
  "growth-reputation": "Centro Reputación",
  campaigns: "Campañas",
  promotions: "Promociones",
  reviews: "Google Reviews",
  analytics: "Analytics",
  integraciones: "Integraciones",
  billing: "Facturación",
  equipo: "Equipo",
  configuracion: "Configuración",
  superadmin: "Super Admin",
};

/* ============================================================
   Helpers
============================================================ */

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[¿?¡!.,;:]/g, "")
    .trim();
}

function nowTime(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function hasPermission(role: Role, resp: DemoResp | undefined): boolean {
  if (!resp?.restricted) return true;
  return role === "owner" || role === "manager";
}

function confidenceTone(c: Confidence): { cls: string; label: string; pct: string } {
  if (c === "alta") return { cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", label: "Confianza: Alta", pct: "92%" };
  if (c === "media") return { cls: "border-amber-400/40 bg-amber-400/10 text-amber-300", label: "Confianza: Media", pct: "78%" };
  return { cls: "border-rose-400/40 bg-rose-400/10 text-rose-300", label: "Confianza: Baja", pct: "45%" };
}

/* ============================================================
   Floating button
============================================================ */

function FloatingButton({ open, onToggle, hasInsight }: { open: boolean; onToggle: () => void; hasInsight: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      onClick={onToggle}
      aria-label={open ? "Cerrar Copilot IA" : "Abrir Copilot IA"}
      aria-expanded={open}
      initial={reduce ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.2 }}
      whileHover={reduce ? undefined : { scale: 1.06 }}
      whileTap={reduce ? undefined : { scale: 0.95 }}
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center text-black shadow-2xl",
        "bg-gradient-to-br from-[var(--gold-soft)] via-[var(--gold)] to-[var(--gold-deep)]",
        "ring-2 ring-[var(--gold)]/40 ring-offset-2 ring-offset-background"
      )}
    >
      {/* Glow ring */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full opacity-60 animate-ping"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--gold) 35%, transparent) 0%, transparent 70%)" }}
      />
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.span
            key="x"
            initial={reduce ? false : { rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={reduce ? undefined : { rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative"
          >
            <X className="h-6 w-6" />
          </motion.span>
        ) : (
          <motion.span
            key="sp"
            initial={reduce ? false : { rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={reduce ? undefined : { rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative"
          >
            <Sparkles className="h-6 w-6" />
          </motion.span>
        )}
      </AnimatePresence>
      {/* Notification dot */}
      {hasInsight && !open && (
        <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[var(--teal)] ring-2 ring-background flex items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-black/60" />
        </span>
      )}
    </motion.button>
  );
}

/* ============================================================
   Typing indicator
============================================================ */

function TypingDots() {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-center gap-1 px-1 py-0.5" aria-label="Copilot está escribiendo">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[var(--gold-soft)]"
          animate={reduce ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   AI message bubble
============================================================ */

function AiMessage({ msg }: { msg: Msg }) {
  const reduce = useReducedMotion();
  const go = useNav((s) => s.go);
  const conf = msg.confidence ? confidenceTone(msg.confidence) : null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-2.5"
    >
      <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black shrink-0">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="rp-glass rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed text-foreground/90">
          {msg.content}
          {msg.streaming && <span className="inline-block w-1 h-3.5 ml-0.5 bg-[var(--gold-soft)] animate-pulse align-middle" aria-hidden />}
        </div>

        {/* Sources + confidence row */}
        {!msg.streaming && !msg.denied && !msg.noData && (
          <div className="flex flex-wrap items-center gap-1.5">
            {msg.sources?.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--teal)]/30 bg-[var(--teal)]/[0.08] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]"
              >
                <span className="h-1 w-1 rounded-full bg-[var(--teal)]" />
                {s.label}
              </span>
            ))}
            {conf && (
              <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider", conf.cls)}>
                {conf.label}
              </span>
            )}
          </div>
        )}

        {/* Ver en módulo */}
        {!msg.streaming && msg.viewIn && !msg.denied && !msg.noData && (
          <button
            onClick={() => go(msg.viewIn!)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-[var(--gold-soft)] hover:bg-[var(--gold)]/[0.16] transition-colors min-h-[36px]"
          >
            <ArrowRight className="h-3 w-3" />
            {msg.viewInLabel}
            <ChevronRight className="h-3 w-3 opacity-60" />
          </button>
        )}

        {/* No data notice */}
        {!msg.streaming && msg.noData && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300">
            <AlertTriangle className="h-3 w-3" />
            <span>No tengo datos suficientes</span>
          </div>
        )}

        {/* Denied notice */}
        {!msg.streaming && msg.denied && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-300">
            <Lock className="h-3 w-3" />
            <span>Permiso requerido</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ============================================================
   User message bubble
============================================================ */

function UserMessage({ msg }: { msg: Msg }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end gap-2.5"
    >
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] px-3.5 py-2.5 text-sm text-black font-medium">
        {msg.content}
      </div>
    </motion.div>
  );
}

/* ============================================================
   Role pill
============================================================ */

function RoleSelector({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  const roles: { id: Role; label: string }[] = [
    { id: "owner", label: "Owner" },
    { id: "manager", label: "Manager" },
    { id: "staff", label: "Staff" },
  ];
  return (
    <div className="flex items-center gap-1 rounded-md border border-border/60 bg-foreground/[0.03] p-0.5">
      {roles.map((r) => (
        <button
          key={r.id}
          onClick={() => onChange(r.id)}
          className={cn(
            "h-6 rounded px-2 text-[10px] font-mono uppercase tracking-wider transition-colors",
            role === r.id
              ? "bg-[var(--gold)]/20 text-[var(--gold-soft)]"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={role === r.id}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   Copilot panel
============================================================ */

function CopilotPanel({
  onClose,
  onMinimize,
  role,
  onRoleChange,
}: {
  onClose: () => void;
  onMinimize: () => void;
  role: Role;
  onRoleChange: (r: Role) => void;
}) {
  const reduce = useReducedMotion();
  const section = useNav((s) => s.section);
  const org = useNav((s) => s.org);
  const location = useNav((s) => s.location);

  const [messages, setMessages] = React.useState<Msg[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hola Ana. Soy tu Copilot IA conectado a Cloudflare Workers AI (Llama 3.1 8B). Pregúntame sobre reservas, clientes, ocupación, campañas o facturación. Estoy aislado por organización.",
      ts: nowTime(),
      sources: [{ label: "Workers AI" }],
      confidence: "alta",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [streamingId, setStreamingId] = React.useState<string | null>(null);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const streamTimer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  // Cleanup any active stream timer
  React.useEffect(() => {
    return () => {
      if (streamTimer.current) clearInterval(streamTimer.current);
    };
  }, []);

  // Context-aware quick actions
  const quickActions = React.useMemo(() => {
    const list = SECTION_QUESTIONS[section] ?? DEFAULT_QUESTIONS;
    return list.slice(0, 4);
  }, [section]);

  const sectionLabel = SECTION_LABELS[section] ?? "Dashboard";

  function findResponse(query: string): DemoResp | undefined {
    const norm = normalize(query);
    // Exact match
    if (DEMO_RESPONSES[norm]) return DEMO_RESPONSES[norm];
    // Fuzzy: keyword match
    for (const key of Object.keys(DEMO_RESPONSES)) {
      const keyTokens = key.split(" ").filter((t) => t.length > 3);
      const matches = keyTokens.filter((t) => norm.includes(t));
      if (matches.length >= Math.ceil(keyTokens.length * 0.6)) {
        return DEMO_RESPONSES[key];
      }
    }
    return undefined;
  }

  function streamResponse(id: string, fullText: string) {
    setStreamingId(id);
    let i = 0;
    const chunkSize = Math.max(2, Math.ceil(fullText.length / 50));
    streamTimer.current = setInterval(() => {
      i += chunkSize;
      const partial = fullText.slice(0, i);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: partial } : m))
      );
      if (i >= fullText.length) {
        if (streamTimer.current) clearInterval(streamTimer.current);
        streamTimer.current = null;
        setStreamingId(null);
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, streaming: false } : m))
        );
      }
    }, 20);
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping || streamingId) return;

    const userMsg: Msg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      ts: nowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Find response
    const resp = findResponse(trimmed);

    // Simulate thinking delay then stream
    setTimeout(() => {
      setIsTyping(false);

      // Permission check
      if (resp && !hasPermission(role, resp)) {
        const deniedMsg: Msg = {
          id: `a-${Date.now()}`,
          role: "ai",
          content: "Tu rol no permite consultar esta información. Esta consulta requiere permiso de Manager o superior. Contacta con un administrador de la organización si necesitas acceso.",
          ts: nowTime(),
          denied: true,
        };
        setMessages((prev) => [...prev, deniedMsg]);
        return;
      }

      if (!resp) {
        // No data
        const noDataMsg: Msg = {
          id: `a-${Date.now()}`,
          role: "ai",
          content: "No tengo datos suficientes para responder a esa consulta. (demo) Prueba con una de las acciones sugeridas o reformula tu pregunta sobre reservas, clientes, ocupación, campañas o facturación.",
          ts: nowTime(),
          noData: true,
        };
        setMessages((prev) => [...prev, noDataMsg]);
        return;
      }

      const aiMsg: Msg = {
        id: `a-${Date.now()}`,
        role: "ai",
        content: "",
        ts: nowTime(),
        streaming: true,
        sources: resp.sources.map((s) => ({ label: s })),
        confidence: resp.confidence,
        viewIn: resp.viewIn?.section,
        viewInLabel: resp.viewIn?.label,
      };
      setMessages((prev) => [...prev, aiMsg]);
      // Begin streaming
      streamResponse(aiMsg.id, resp.text);
    }, 650);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, y: 24, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      role="dialog"
      aria-label="Copilot IA"
      className={cn(
        "fixed z-50 flex flex-col rp-glass-strong rounded-t-2xl sm:rounded-2xl overflow-hidden",
        "left-0 right-0 bottom-0 sm:left-auto sm:right-4 sm:bottom-24 sm:w-[400px]",
        "h-[min(560px,85vh)] sm:h-[min(560px,calc(100vh-8rem))]",
        "ring-1 ring-[var(--gold)]/30 shadow-2xl"
      )}
    >
      {/* Header */}
      <header className="flex items-center gap-2 px-3 sm:px-4 h-14 border-b border-border/60 bg-gradient-to-r from-[var(--gold)]/[0.08] to-transparent shrink-0">
        <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-medium truncate">Copilot IA</span>
            <span className="inline-flex items-center gap-1 rounded border border-[var(--gold)]/30 bg-[var(--gold)]/[0.08] px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-[var(--gold-soft)] shrink-0">
              <Cpu className="h-2.5 w-2.5" />
              Llama 3.1 8B
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Workers AI · en línea
          </div>
        </div>
        <RoleSelector role={role} onChange={onRoleChange} />
        <button
          onClick={onMinimize}
          aria-label="Minimizar Copilot"
          className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors shrink-0"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={onClose}
          aria-label="Cerrar Copilot"
          className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Context indicator */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-border/40 bg-foreground/[0.02] shrink-0">
        <MessageSquare className="h-3 w-3 text-[var(--teal)] shrink-0" aria-hidden />
        <span className="text-[11px] text-muted-foreground">
          Contexto: <span className="text-foreground/85 font-medium">{sectionLabel}</span>
          <span className="mx-1 text-muted-foreground/60">·</span>
          <span className="text-foreground/85">{location ?? org}</span>
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rp-scroll-thin px-3 sm:px-4 py-4 space-y-4"
        aria-live="polite"
      >
        {messages.map((m) =>
          m.role === "user" ? (
            <UserMessage key={m.id} msg={m} />
          ) : (
            <AiMessage key={m.id} msg={m} />
          )
        )}
        {isTyping && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2.5"
          >
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="rp-glass rounded-2xl rounded-tl-sm px-3 py-2.5">
              <TypingDots />
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick actions */}
      <div className="px-3 sm:px-4 pt-2 pb-2 border-t border-border/40 shrink-0">
        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto rp-scroll-thin -mx-1 px-1">
          {quickActions.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={isTyping || !!streamingId}
              className="shrink-0 min-h-[36px] rounded-full border border-border/60 bg-foreground/[0.03] px-3 py-1.5 text-[11px] text-foreground/80 hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/[0.08] hover:text-[var(--gold-soft)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-foreground/[0.04] px-2 py-1.5 focus-within:border-[var(--gold)]/50 transition-colors">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Pregunta a la IA…"
            aria-label="Mensaje al Copilot IA"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-muted-foreground text-foreground"
            disabled={isTyping || !!streamingId}
          />
          <button
            aria-label="Entrada de voz (demo)"
            disabled
            className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-[var(--teal)] transition-colors shrink-0"
            title="Voz (demo · no disponible)"
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isTyping || !!streamingId}
            aria-label="Enviar mensaje"
            className="h-9 w-9 flex items-center justify-center rounded-md bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-black hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Security notice */}
        <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground/80">
          <ShieldCheck className="h-2.5 w-2.5 text-emerald-400/80" aria-hidden />
          <span>IA aislada por organización · Permiso validado · Sin acceso a otros restaurantes</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Main AiCopilot
============================================================ */

export function AiCopilot() {
  const [open, setOpen] = React.useState(false);
  const [minimized, setMinimized] = React.useState(false);
  const [role, setRole] = React.useState<Role>("owner");
  const [hasInsight] = React.useState(true);

  // Open panel (un-minimizes if was minimized)
  function handleToggle() {
    if (open && !minimized) {
      setOpen(false);
    } else {
      setOpen(true);
      setMinimized(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setMinimized(false);
  }

  function handleMinimize() {
    setMinimized(true);
  }

  return (
    <>
      <FloatingButton open={open && !minimized} onToggle={handleToggle} hasInsight={hasInsight} />
      <AnimatePresence>
        {open && !minimized && (
          <CopilotPanel
            onClose={handleClose}
            onMinimize={handleMinimize}
            role={role}
            onRoleChange={setRole}
          />
        )}
      </AnimatePresence>
    </>
  );
}
