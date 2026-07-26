"use client";

/* ============================================================
 * RestoPanel · DemoAi — Copiloto IA (scripted)
 * ------------------------------------------------------------
 * Demo en vivo para el landing.
 *  - Conversación pre-cargada con efecto máquina de escribir
 *    (~35 char/seg). No llama a ninguna API.
 *  - Mensaje IA: respuesta textual + render de mini-card
 *    (18 avatares + bar chart de recencia) + CTA "Crear campaña".
 *  - "Pensando..." (3 puntos animados) antes de cada respuesta.
 *  - 3 chips de prompt sugeridos → cargan respuestas guionizadas.
 *  - Botón "Crear campaña" compone campaña animada
 *    (audiencia, canal, plantilla aparecen en secuencia).
 *  - Badge "demo" + nota "IA simulada".
 *  - Animaciones transform+opacity, respeta prefers-reduced-motion.
 * ============================================================ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Sparkles,
  Send,
  Megaphone,
  MessageSquare,
  ListChecks,
  TrendingUp,
  AlertTriangle,
  Star,
  Users,
  CheckCircle2,
} from "lucide-react";

/* ---------- Types ---------- */
type MsgRole = "user" | "ai";

interface RenderCard {
  kind: "vipRecency" | "topTables" | "forecast" | "urgentReviews";
}

interface ChatMessage {
  id: string;
  role: MsgRole;
  text: string;
  card?: RenderCard;
  buttons?: ("createCampaign" | "viewList")[];
}

/* ---------- Scripted conversation ---------- */
const INITIAL_CONVERSATION: ChatMessage[] = [
  {
    id: "u1",
    role: "user",
    text: "¿Cuántos clientes VIP no vienen desde hace 30 días?",
  },
  {
    id: "a1",
    role: "ai",
    text:
      "18 clientes VIP no vienen desde hace 30+ días. Suman 11.240€ de gasto histórico.",
    card: { kind: "vipRecency" },
    buttons: ["createCampaign", "viewList"],
  },
  {
    id: "a2",
    role: "ai",
    text: "¿Creo una campaña de recuperación por WhatsApp?",
  },
];

/* ---------- Suggested prompts (scripted responses) ---------- */
interface ScriptedPrompt {
  prompt: string;
  response: ChatMessage;
}

const PROMPTS: ScriptedPrompt[] = [
  {
    prompt: "¿Qué mesa genera más ingresos?",
    response: {
      id: "p1r",
      role: "ai",
      text:
        "La mesa M11 (Terraza) lidera con 8.420€ en los últimos 30 días, un 23% por encima de la media. Suele reservarse para grupos de 6-8.",
      card: { kind: "topTables" },
    },
  },
  {
    prompt: "¿Cuánto facturaré mañana?",
    response: {
      id: "p2r",
      role: "ai",
      text:
        "Según el patrón histórico y las reservas actuales, mañana facturarás aproximadamente 3.840€. Es sábado con 84% de ocupación prevista.",
      card: { kind: "forecast" },
    },
  },
  {
    prompt: "¿Qué reseñas necesitan respuesta urgente?",
    response: {
      id: "p3r",
      role: "ai",
      text:
        "2 reseñas de 1-2★ requieren respuesta hoy. Una menciona espera de 45min en terraza y la otra un error en la reserva. Ambas llevan más de 12h sin respuesta.",
      card: { kind: "urgentReviews" },
    },
  },
];

/* ---------- Typewriter hook (~35 chars/sec → 28.5 ms/char) ---------- */
const CHAR_INTERVAL_MS = 28;

function useTypewriter(text: string, started: boolean, reduce: boolean | null) {
  const [displayed, setDisplayed] = React.useState("");
  React.useEffect(() => {
    if (!started || !text) {
      setDisplayed(started && text ? text : "");
      return;
    }
    if (reduce) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, CHAR_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [text, started, reduce]);
  return displayed;
}

/* ============================================================
 * Component
 * ============================================================ */
export function DemoAi() {
  const reduce = useReducedMotion();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [typingIndex, setTypingIndex] = React.useState(0); // index of message currently typing
  const [thinking, setThinking] = React.useState(false);
  const [campaignOpen, setCampaignOpen] = React.useState(false);
  const [campaignStep, setCampaignStep] = React.useState(0); // 0,1,2,3 — 3 = done
  const [promptChipsVisible, setPromptChipsVisible] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  // Initial conversation playback
  React.useEffect(() => {
    let cancelled = false;
    let i = 0;
    const step = () => {
      if (cancelled) return;
      if (i >= INITIAL_CONVERSATION.length) {
        setPromptChipsVisible(true);
        return;
      }
      const msg = INITIAL_CONVERSATION[i];
      setThinking(true);
      const thinkDelay = reduce ? 50 : 900;
      setTimeout(() => {
        if (cancelled) return;
        setThinking(false);
        setMessages((prev) => [...prev, msg]);
        setTypingIndex(i);
        const typeDur = reduce
          ? 100
          : Math.min(2800, msg.text.length * CHAR_INTERVAL_MS + 200);
        i += 1;
        setTimeout(step, typeDur);
      }, thinkDelay);
    };
    step();
    return () => {
      cancelled = true;
    };
  }, [reduce]);

  // Auto-scroll on new messages
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking, campaignOpen, campaignStep]);

  const handlePrompt = (p: ScriptedPrompt) => {
    if (typingIndex === -999) return; // optional guard
    // Add user message
    const userMsg: ChatMessage = {
      id: `pu-${Date.now()}`,
      role: "user",
      text: p.prompt,
    };
    setMessages((prev) => [...prev, userMsg]);
    setPromptChipsVisible(false);
    setThinking(true);
    setTimeout(
      () => {
        setThinking(false);
        setMessages((prev) => [...prev, p.response]);
      },
      reduce ? 80 : 1100
    );
  };

  const handleCreateCampaign = () => {
    setCampaignOpen(true);
    setCampaignStep(0);
    [600, 1200, 1800].forEach((delay, idx) => {
      setTimeout(() => setCampaignStep(idx + 1), reduce ? 50 : delay);
    });
  };

  return (
    <div className="rp-glass-strong rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)]">
            <Sparkles className="h-4 w-4 text-background" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg sm:text-xl font-medium tracking-tight">
                Copiloto IA
              </h3>
              <Badge variant="outline" className="border-[var(--gold)]/40 text-[var(--gold-soft)]">
                demo
              </Badge>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Workers AI · Llama 3.1 8B · en línea
            </div>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div
        ref={scrollRef}
        className="mt-4 max-h-[460px] min-h-[300px] space-y-3 overflow-y-auto rp-scroll-thin rounded-xl border border-border/60 bg-foreground/[0.02] p-3 sm:p-4"
      >
        {messages.map((m, idx) => (
          <ChatBubble
            key={m.id}
            message={m}
            typing={idx === typingIndex && !reduce}
            onCampaignClick={handleCreateCampaign}
            onViewListClick={() =>
              toast({
                title: "Listado preparado",
                description: "18 clientes VIP inactivos exportados al CRM.",
              })
            }
          />
        ))}

        {/* Thinking indicator */}
        <AnimatePresence>
          {thinking && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)]">
                <Sparkles className="h-3.5 w-3.5 text-background" />
              </div>
              <div className="rp-glass rounded-full px-3 py-1.5">
                <span className="mr-2 text-xs text-muted-foreground">Pensando</span>
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
                      animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        delay: d * 0.18,
                      }}
                    />
                  ))}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Campaign composer (animated) */}
        <AnimatePresence>
          {campaignOpen && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/[0.06] p-3"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Megaphone className="h-4 w-4 rp-gold-text" />
                Campaña de recuperación
              </div>
              <div className="mt-3 space-y-2">
                {[
                  {
                    label: "Audiencia",
                    value: "18 clientes VIP inactivos 30d+",
                    icon: Users,
                  },
                  {
                    label: "Canal",
                    value: "WhatsApp Cloud API · plantilla aprobada",
                    icon: MessageSquare,
                  },
                  {
                    label: "Plantilla",
                    value:
                      "Hola {nombre}, hace tiempo que no te vemos en {restaurante}. ¿Te guardamos una mesa este viernes? — Equipo {restaurante}",
                    icon: ListChecks,
                  },
                ].map((row, idx) => {
                  const visible = campaignStep > idx;
                  return (
                    <AnimatePresence key={idx}>
                      {visible && (
                        <motion.div
                          initial={reduce ? false : { opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-2 rounded-md border border-border/60 bg-foreground/[0.03] p-2"
                        >
                          <row.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 rp-gold-text" />
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                              {row.label}
                            </div>
                            <div className="text-xs text-foreground/85">{row.value}</div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })}
                {campaignStep >= 3 && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 pt-1 text-xs text-emerald-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Campaña lista para lanzar · 0,06€/mensaje · coste estimado 1,08€
                  </motion.div>
                )}
              </div>
              {campaignStep >= 3 && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    className="h-9 min-h-[44px] bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-background hover:opacity-90"
                    onClick={() =>
                      toast({
                        title: "Campaña lanzada",
                        description: "18 mensajes WhatsApp encolados.",
                      })
                    }
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Lanzar ahora
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 min-h-[44px]"
                    onClick={() => setCampaignOpen(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prompt chips */}
      <AnimatePresence>
        {promptChipsVisible && !campaignOpen && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Sugerencias
            </div>
            <div className="flex flex-wrap gap-2">
              {PROMPTS.map((p) => (
                <button
                  key={p.prompt}
                  onClick={() => handlePrompt(p)}
                  className="rounded-full border border-[var(--teal)]/40 bg-[var(--teal)]/[0.06] px-3 py-1.5 text-xs text-[var(--teal)] transition-all hover:bg-[var(--teal)]/[0.14] min-h-[36px]"
                >
                  {p.prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-4 text-[11px] text-muted-foreground">
        IA simulada con datos de demostración. No requiere conexión.
      </p>
    </div>
  );
}

/* ---------- Chat bubble ---------- */
function ChatBubble({
  message,
  typing,
  onCampaignClick,
  onViewListClick,
}: {
  message: ChatMessage;
  typing: boolean;
  onCampaignClick: () => void;
  onViewListClick: () => void;
}) {
  const reduce = useReducedMotion();
  const displayed = useTypewriter(message.text, true, reduce);
  const shown = typing ? displayed : message.text;
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)]">
          <Sparkles className="h-3.5 w-3.5 text-background" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
          isUser
            ? "bg-gradient-to-br from-[var(--gold)]/90 to-[var(--gold-deep)]/90 text-background"
            : "rp-glass text-foreground/90"
        )}
      >
        <p className="leading-relaxed">
          {shown}
          {typing && !reduce && (
            <span className="ml-0.5 inline-block h-3 w-0.5 -translate-y-0.5 animate-pulse bg-current align-middle" />
          )}
        </p>

        {/* Card attachment */}
        {message.card && <RenderCard kind={message.card.kind} />}

        {/* Buttons */}
        {message.buttons && message.buttons.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.buttons.includes("createCampaign") && (
              <Button
                size="sm"
                onClick={onCampaignClick}
                className="h-8 min-h-[36px] bg-background/20 text-background hover:bg-background/30"
              >
                <Megaphone className="mr-1.5 h-3.5 w-3.5" />
                Crear campaña
              </Button>
            )}
            {message.buttons.includes("viewList") && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onViewListClick}
                className="h-8 min-h-[36px] bg-background/10 text-background hover:bg-background/20"
              >
                <ListChecks className="mr-1.5 h-3.5 w-3.5" />
                Ver listado
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ---------- Render card per kind ---------- */
function RenderCard({ kind }: { kind: RenderCard["kind"] }) {
  const reduce = useReducedMotion();
  if (kind === "vipRecency") {
    // 18 avatar dots + recency bar chart
    const dots = Array.from({ length: 18 }, (_, i) => i);
    const buckets = [
      { label: "30–45 días", count: 7, pct: 100 },
      { label: "46–60 días", count: 6, pct: 86 },
      { label: "61–90 días", count: 3, pct: 43 },
      { label: "90+ días", count: 2, pct: 28 },
    ];
    return (
      <div className="mt-3 rounded-lg border border-[var(--gold)]/30 bg-background/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Users className="h-3.5 w-3.5 rp-gold-text" />
            18 clientes VIP inactivos
          </div>
          <div className="text-xs text-muted-foreground">11.240€ histórico</div>
        </div>
        {/* Avatar dots */}
        <div className="mt-2 flex flex-wrap gap-1">
          {dots.map((i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className="h-5 w-5 rounded-full bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold-deep)]"
            />
          ))}
        </div>
        {/* Recency bars */}
        <div className="mt-3 space-y-1.5">
          {buckets.map((b, i) => (
            <div key={b.label} className="flex items-center gap-2 text-[11px]">
              <span className="w-20 text-muted-foreground">{b.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/10">
                <motion.div
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${b.pct}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)]"
                />
              </div>
              <span className="w-6 text-right font-mono text-foreground/80">{b.count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "topTables") {
    const top = [
      { name: "M11", rev: 8420 },
      { name: "M12", rev: 7180 },
      { name: "M5", rev: 5940 },
      { name: "M1", rev: 4610 },
      { name: "M2", rev: 3870 },
    ];
    const max = top[0].rev;
    return (
      <div className="mt-3 rounded-lg border border-[var(--teal)]/30 bg-background/30 p-3">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <TrendingUp className="h-3.5 w-3.5 text-[var(--teal)]" />
          Top 5 mesas por ingresos (30 días)
        </div>
        <div className="mt-2 space-y-1.5">
          {top.map((t, i) => (
            <div key={t.name} className="flex items-center gap-2 text-[11px]">
              <span className="w-8 font-mono text-foreground/80">{t.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/10">
                <motion.div
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${(t.rev / max) * 100}%` }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-[var(--teal-deep)] to-[var(--teal)]"
                />
              </div>
              <span className="w-16 text-right font-mono text-foreground/80">
                €{t.rev.toLocaleString("es-ES")}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "forecast") {
    const days = [
      { d: "Mié", val: 3120 },
      { d: "Jue", val: 3480 },
      { d: "Vie", val: 3680 },
      { d: "Sáb", val: 3840 },
      { d: "Dom", val: 2980 },
    ];
    const max = Math.max(...days.map((d) => d.val));
    return (
      <div className="mt-3 rounded-lg border border-[var(--gold)]/30 bg-background/30 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Pronóstico de facturación · próximos 5 días</span>
          <span className="rp-gold-text font-mono">3.840€</span>
        </div>
        <div className="mt-3 flex h-20 items-end gap-2">
          {days.map((d, i) => (
            <div key={d.d} className="flex flex-1 flex-col items-center gap-1">
              <motion.div
                initial={reduce ? false : { height: 0 }}
                animate={{ height: `${(d.val / max) * 100}%` }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={cn(
                  "w-full rounded-t-sm",
                  i === 3
                    ? "bg-gradient-to-t from-[var(--gold)] to-[var(--gold-soft)]"
                    : "bg-foreground/20"
                )}
              />
              <span className="text-[10px] font-mono text-muted-foreground">{d.d}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "urgentReviews") {
    return (
      <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/[0.06] p-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-200">
          <AlertTriangle className="h-3.5 w-3.5" />
          2 reseñas urgentes
        </div>
        <ul className="mt-2 space-y-1.5">
          {[
            { author: "Pedro M.", stars: 1, snippet: "Esperamos 45 min en terraza..." },
            { author: "Ana R.", stars: 2, snippet: "No encontraron nuestra reserva..." },
          ].map((r, i) => (
            <li key={i} className="rounded-md bg-foreground/[0.03] p-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.author}</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, s) => (
                    <Star
                      key={s}
                      className={cn(
                        "h-2.5 w-2.5",
                        s < r.stars ? "fill-rose-400 text-rose-400" : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </span>
              </div>
              <div className="mt-0.5 text-muted-foreground">{r.snippet}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}

export default DemoAi;
