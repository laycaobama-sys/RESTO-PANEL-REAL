"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  ShieldCheck,
  AlertTriangle,
  Database,
  Quote,
  Wrench,
  CheckCircle2,
  Lock,
  Clock,
  ArrowUpRight,
  BrainCircuit,
  CornerDownLeft,
  Loader2,
} from "lucide-react";

/* ---------------- shared bits ---------------- */


/* ---------------- types ---------------- */
type Confidence = "alta" | "media" | "baja";

interface AiResponse {
  respuesta: string;
  datos: string; // "Últimos 14 días · D1 reservations + CRM"
  evidencias: string[];
  confianza: { level: Confidence; pct: number };
  limitaciones?: string;
  acciones: string[];
  requiereAprobacion?: boolean;
  fuentes: string[];
  herramientas: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text?: string; // user text
  response?: AiResponse; // ai response
  ts: string; // "14:32"
}

/* ---------------- demo data ---------------- */
const SUGGESTED_QUESTIONS = [
  "¿Qué restaurantes están perdiendo clientes?",
  "¿Por qué cayó el MRR?",
  "¿Qué organizaciones debo contactar hoy?",
  "¿Qué clientes tienen riesgo de cancelar?",
  "¿Qué módulo consume más recursos?",
  "¿Qué anomalías ocurrieron esta semana?",
  "¿Qué factores explican el aumento de no-shows?",
  "¿Cuál será el MRR dentro de tres meses?",
];

const PRELOADED: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    text: "¿Qué restaurantes están perdiendo clientes?",
    ts: "14:31",
  },
  {
    id: "m2",
    role: "ai",
    ts: "14:32",
    response: {
      respuesta:
        "3 organizaciones muestran señales de pérdida de clientes en las últimas 2 semanas. Ramses Group lidera la tendencia con -12% en reservas recurrentes.",
      datos: "Últimos 14 días · D1 reservations + CRM",
      evidencias: [
        "Ramses Group: -12% reservas recurrentes (de 89 a 78)",
        "Beach Club Marbella: -8% clientes nuevos",
        "Sushi Bar Tokyo: 3 cancelaciones VIP en 7 días",
      ],
      confianza: { level: "alta", pct: 84 },
      limitaciones: "No se incluyen datos de walk-ins no registrados",
      acciones: [
        "Contactar Ramses Group (Owner: Ana Martínez)",
        "Revisar Beach Club campañas",
        "Sugerir oferta retención Sushi Bar VIPs",
      ],
      requiereAprobacion: true,
      fuentes: ["D1 reservations", "CRM customer_visits", "Analytics Engine"],
      herramientas: [
        "query_reservations_trend",
        "list_org_segments",
        "churn_risk_score",
      ],
    },
  },
];

/* ---------- generic plausible AI responses for new prompts ---------- */
const GENERIC_RESPONSES: AiResponse[] = [
  {
    respuesta:
      "He revisado los datos disponibles y la métrica solicitada muestra una tendencia moderada en el periodo analizado. La señal principal se concentra en 2-3 organizaciones, sin alcanzar umbral crítico.",
    datos: "Últimos 30 días · D1 + Analytics Engine",
    evidencias: [
      "Tendencia estable en el agregado de la plataforma (demo)",
      "2 organizaciones con variación superior al rango habitual (demo)",
      "Sin picos anómalos detectados por el detector de outliers (demo)",
    ],
    confianza: { level: "media", pct: 67 },
    limitaciones:
      "Datos insuficientes para Q3 2024. La proyección requiere mínimo 90 días de histórico.",
    acciones: [
      "Revisar organizaciones con variación atípica (demo)",
      "Confirmar hipótesis con datos cualitativos del equipo de cuenta",
    ],
    requiereAprobacion: true,
    fuentes: ["D1 reservations", "Analytics Engine", "Stripe MRR export"],
    herramientas: ["query_mrr", "list_orgs", "forecast_model"],
  },
  {
    respuesta:
      "La señal solicitada se cruza con varios factores. No hay una causa única dominante: la combinación de estacionalidad, comportamiento de clientes y eventos de infraestructura explica la mayor parte de la variación observada.",
    datos: "Últimos 30 días · D1 + Analytics Engine + Status page",
    evidencias: [
      "Componente estacional detectado (demo) — contribución moderada",
      "Correlación con 1 incidente de infraestructura (demo)",
      "Segmento de clientes VIP con menor variación que el resto (demo)",
    ],
    confianza: { level: "media", pct: 71 },
    limitaciones:
      "No se puede aislar causalidad sin test A/B. Recomendado validar con experimento controlado.",
    acciones: [
      "Diseñar test A/B para aislar la variable principal (demo)",
      "Revisar plan de comunicación con organizaciones afectadas",
      "Contactar Ramses Group",
    ],
    requiereAprobacion: true,
    fuentes: ["Analytics Engine", "D1 reservations", "Status page"],
    herramientas: ["forecast_model", "query_reservations_trend", "churn_risk_score"],
  },
  {
    respuesta:
      "La proyección solicitada combina histórico reciente y modelo de forecast. La incertidumbre aumenta con el horizonte temporal; el resultado debe interpretarse como un rango, no como un valor puntual.",
    datos: "Últimos 90 días · D1 + Analytics Engine",
    evidencias: [
      "Modelo forecast_model ejecutado sobre 90 días de histórico (demo)",
      "Intervalo de confianza calculado · no se publica valor puntual (demo)",
      "Tendencia base: estable con estacionalidad conocida (demo)",
    ],
    confianza: { level: "baja", pct: 54 },
    limitaciones:
      "Forecast < 60% de confianza. No se inventan datos: el rango se presenta como orientativo.",
    acciones: [
      "Revisar plan de forecast con el equipo de datos",
      "Reforzar histórico antes de publicar proyección externa",
    ],
    requiereAprobacion: true,
    fuentes: ["Analytics Engine", "Stripe MRR export"],
    herramientas: ["forecast_model", "query_mrr"],
  },
];

/* ---------------- helpers ---------------- */
function nowTs(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function ConfidenceBadge({ level, pct }: { level: Confidence; pct: number }) {
  const map = {
    alta: {
      label: "Alta",
      cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
      dot: "bg-emerald-400",
    },
    media: {
      label: "Media",
      cls: "border-amber-400/40 bg-amber-400/10 text-amber-300",
      dot: "bg-amber-400",
    },
    baja: {
      label: "Baja",
      cls: "border-rose-400/40 bg-rose-400/10 text-rose-300",
      dot: "bg-rose-400",
    },
  }[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono",
        map.cls
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", map.dot)} />
      Confianza {map.label} · {pct}%
    </span>
  );
}

/* ---------------- typing indicator ---------------- */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="text-[11px] font-mono">IA ejecutiva analizando datos…</span>
    </div>
  );
}

/* ---------------- AI message card ---------------- */
function AiMessage({ msg }: { msg: ChatMessage }) {
  const r = msg.response!;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3"
    >
      <div className="h-8 w-8 shrink-0 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/10 flex items-center justify-center">
        <BrainCircuit className="h-4 w-4 text-[var(--teal)]" aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <div className="rp-glass rounded-2xl rounded-tl-md p-4 sm:p-5 space-y-4">
          {/* header row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
              <Sparkles className="h-3 w-3 rp-gold-text" aria-hidden />
              IA Ejecutiva · {msg.ts}
            </div>
            
          </div>

          {/* respuesta ejecutiva */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
              Respuesta ejecutiva
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{r.respuesta}</p>
          </div>

          {/* datos analizados */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-foreground/70">
            <Database className="h-3.5 w-3.5 text-[var(--teal)]" aria-hidden />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Datos analizados:
            </span>
            <span>{r.datos}</span>
          </div>

          {/* evidencias */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Evidencias
            </div>
            <ul className="space-y-1.5">
              {r.evidencias.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground/85">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[var(--teal)]" aria-hidden />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* confianza + limitaciones */}
          <div className="flex flex-wrap items-center gap-2">
            <ConfidenceBadge level={r.confianza.level} pct={r.confianza.pct} />
            {r.limitaciones && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-400/5 px-2 py-0.5 text-[11px] text-amber-200/90">
                <AlertTriangle className="h-3 w-3" aria-hidden />
                <span className="font-mono">Limitaciones:</span>
                <span className="truncate max-w-[260px] sm:max-w-md">{r.limitaciones}</span>
              </span>
            )}
          </div>

          {/* acciones recomendadas */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Acciones recomendadas
            </div>
            <div className="flex flex-wrap gap-1.5">
              {r.acciones.map((a, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/5 px-2.5 py-1 text-[11px] text-foreground/90"
                >
                  <ArrowUpRight className="h-3 w-3 rp-gold-text" aria-hidden />
                  {a}
                </span>
              ))}
            </div>
            {r.requiereAprobacion && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-300/90">
                <Lock className="h-3 w-3" aria-hidden />
                Requiere aprobación · no se ejecuta automáticamente
              </div>
            )}
          </div>

          {/* fuentes citadas */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Quote className="h-3 w-3" aria-hidden />
              Fuentes citadas
            </div>
            <div className="flex flex-wrap gap-1.5">
              {r.fuentes.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md border border-border/50 bg-foreground/[0.04] px-2 py-0.5 text-[11px] font-mono text-foreground/80"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* herramientas utilizadas */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Wrench className="h-3 w-3" aria-hidden />
              Herramientas utilizadas
            </div>
            <div className="flex flex-wrap gap-1.5">
              {r.herramientas.map((h, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded border border-[var(--teal)]/25 bg-[var(--teal)]/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-[var(--teal)]"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* no inventar datos notice */}
          <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground/80 flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 rp-teal-text" aria-hidden />
            Política &quot;no inventar datos&quot;: toda cifra sin marca &quot;demo&quot; proviene
            de fuente citada. Las cifras marcadas &quot;demo&quot; son simuladas.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- user message bubble ---------------- */
function UserMessage({ msg }: { msg: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] sm:max-w-[70%]">
        <div className="rounded-2xl rounded-tr-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2.5">
          <p className="text-sm text-foreground/95">{msg.text}</p>
        </div>
        <div className="mt-1 text-right text-[10px] font-mono text-muted-foreground">
          Tú · {msg.ts}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- main component ---------------- */
export function CcExecutiveAi() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(PRELOADED);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || isTyping) return;
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: q,
      ts: nowTs(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // simulate latency then deliver a generic plausible response
    const latency = 1100 + Math.random() * 900;
    window.setTimeout(() => {
      const response = GENERIC_RESPONSES[
        Math.floor(Math.random() * GENERIC_RESPONSES.length)
      ];
      const aiMsg: ChatMessage = {
        id: uid(),
        role: "ai",
        ts: nowTs(),
        response: { ...response },
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, latency);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <section aria-label="IA Ejecutiva" className="space-y-4">
      {/* Header */}
      <div className="rp-glass-strong rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 rp-gold-text" aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-lg sm:text-xl font-medium tracking-tight">
                  IA Ejecutiva
                </h3>
                
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Asistente conversacional con acceso a herramientas autorizadas de la plataforma.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-border/40 bg-foreground/[0.03] px-3 py-2 flex items-center gap-2">
              <div className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--teal)] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Modelo
                </div>
                <div className="text-xs font-mono text-foreground/90">
                  glm-4-flash · AI Gateway
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setHistoryOpen(true)}
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Historial
            </Button>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="rp-glass rounded-2xl flex flex-col overflow-hidden">
        {/* messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto rp-scroll-thin p-4 sm:p-5 space-y-5 max-h-[640px] min-h-[420px]"
        >
          {/* system intro */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-foreground/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3 w-3 rp-gold-text" aria-hidden />
              Sesión iniciada · contexto: Super Admin · datos demo
            </div>
          </div>

          {messages.map((m) =>
            m.role === "user" ? (
              <UserMessage key={m.id} msg={m} />
            ) : (
              <AiMessage key={m.id} msg={m} />
            )
          )}

          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 shrink-0 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/10 flex items-center justify-center">
                  <BrainCircuit className="h-4 w-4 text-[var(--teal)]" aria-hidden />
                </div>
                <div className="rp-glass rounded-2xl rounded-tl-md px-4 py-3">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* suggestion chips */}
        <div className="border-t border-border/40 px-4 sm:px-5 pt-3 pb-2">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3 w-3 rp-gold-text" aria-hidden />
            Preguntas sugeridas
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                disabled={isTyping}
                className="rounded-full border border-border/50 bg-foreground/[0.03] px-3 py-1.5 text-[11px] text-foreground/85 transition-colors hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/5 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed min-h-[32px]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* input */}
        <form
          onSubmit={onSubmit}
          className="border-t border-border/40 p-3 sm:p-4 flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta ejecutiva…"
              disabled={isTyping}
              className="w-full rounded-xl border border-border/50 bg-background/60 px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--gold)]/50 focus:ring-1 focus:ring-[var(--gold)]/30 transition-colors disabled:opacity-60"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded border border-border/50 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <CornerDownLeft className="h-2.5 w-2.5" aria-hidden />
              Enter
            </kbd>
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="h-11 px-4 bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <>
                <Send className="h-4 w-4 mr-1.5" aria-hidden />
                Enviar
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Security notice */}
      <div className="rp-glass rounded-xl p-3 sm:p-4 flex items-start gap-3">
        <div className="h-8 w-8 shrink-0 rounded-lg border border-[var(--teal)]/25 bg-[var(--teal)]/[0.08] flex items-center justify-center">
          <ShieldCheck className="h-4 w-4 text-[var(--teal)]" aria-hidden />
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
          La IA utiliza <strong className="text-foreground/90">herramientas autorizadas</strong>.
          Aplica permisos antes de recuperar información. No accede libremente a la base de datos.
          Toda consulta se registra con <code className="font-mono text-[var(--teal)]">correlation_id</code>{" "}
          y se conserva para auditoría. Las respuestas se rigen por la política{" "}
          <strong className="text-foreground/90">&quot;no inventar datos&quot;</strong>: las cifras
          sin marca &quot;demo&quot; provienen de fuente citada.
        </p>
      </div>

      {/* History dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 rp-gold-text" aria-hidden />
              Historial de consultas
            </DialogTitle>
            <DialogDescription>
              Últimas consultas ejecutivas en esta sesión (demo).
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto rp-scroll-thin space-y-2">
            {messages
              .filter((m) => m.role === "user")
              .slice()
              .reverse()
              .map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-border/40 p-2.5 hover:bg-foreground/[0.03]"
                >
                  <div className="text-[10px] font-mono text-muted-foreground mb-0.5">
                    {m.ts} · correlation_id: demo-{m.id}
                  </div>
                  <div className="text-sm text-foreground/90">{m.text}</div>
                </div>
              ))}
            {messages.filter((m) => m.role === "user").length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-6">
                Sin consultas en esta sesión.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
