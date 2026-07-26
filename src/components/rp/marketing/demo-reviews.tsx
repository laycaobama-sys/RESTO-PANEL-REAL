"use client";

/* ============================================================
 * RestoPanel · DemoReviews — Google Reviews
 * ------------------------------------------------------------
 * Demo en vivo para el landing.
 *  - Distribución de valoraciones (5★→1★) animada al hacer scroll
 *  - Evolución de la valoración: SVG line chart 12 meses 4.6→4.9★
 *  - Topic cloud (comida, servicio, precio, ambiente, espera, limpieza)
 *  - Reseña en vivo + respuesta IA con efecto máquina de escribir
 *  - Botón "Publicar" → toast
 *  - Comparativa tiempo de respuesta: 48h → 2min
 *  - Badge "demo"
 *  - Animaciones transform+opacity, respeta prefers-reduced-motion
 * ============================================================ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Star,
  Sparkles,
  Clock,
  TrendingUp,
  Send,
  RefreshCw,
  Star as GoogleStar,
} from "lucide-react";

/* ---------- Demo data ---------- */
const DISTRIBUTION: { stars: 5 | 4 | 3 | 2 | 1; count: number; pct: number }[] = [
  { stars: 5, count: 905, pct: 72.6 },
  { stars: 4, count: 215, pct: 17.2 },
  { stars: 3, count: 75, pct: 6.0 },
  { stars: 2, count: 32, pct: 2.6 },
  { stars: 1, count: 20, pct: 1.6 },
];

const EVOLUTION: { month: string; rating: number }[] = [
  { month: "Nov", rating: 4.6 },
  { month: "Dic", rating: 4.61 },
  { month: "Ene", rating: 4.63 },
  { month: "Feb", rating: 4.65 },
  { month: "Mar", rating: 4.67 },
  { month: "Abr", rating: 4.7 },
  { month: "May", rating: 4.73 },
  { month: "Jun", rating: 4.78 },
  { month: "Jul", rating: 4.82 },
  { month: "Ago", rating: 4.85 },
  { month: "Sep", rating: 4.88 },
  { month: "Oct", rating: 4.9 },
];

const TOPICS: { label: string; freq: number; tone: "pos" | "neu" | "neg" }[] = [
  { label: "comida", freq: 480, tone: "pos" },
  { label: "servicio", freq: 420, tone: "pos" },
  { label: "ambiente", freq: 310, tone: "pos" },
  { label: "precio", freq: 240, tone: "neu" },
  { label: "espera", freq: 95, tone: "neg" },
  { label: "limpieza", freq: 60, tone: "neg" },
];

const DEMO_REVIEW = {
  author: "María García",
  initials: "MG",
  location: "Ramses Madrid",
  date: "Hace 2 días",
  rating: 5,
  text:
    "El cochinillo estaba espectacular y el servicio fue muy atento. El ambiente del salón principal muy acogedor. ¡Volveré seguro!",
};

const AI_REPLY =
  "¡Gracias por tu reseña, María! Nos alegra muchísimo que disfrutasteis del cochinillo y el ambiente del salón. Ya le hemos hecho llegar tus palabras al equipo. ¡Os esperamos pronto para probar la nueva carta de otoño! — Equipo Ramses Madrid";

/* ---------- Typewriter hook ---------- */
function useTypewriter(text: string, started: boolean, reduce: boolean | null) {
  const [displayed, setDisplayed] = React.useState("");
  React.useEffect(() => {
    if (!started || !text) {
      setDisplayed("");
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
    }, 24);
    return () => clearInterval(interval);
  }, [text, started, reduce]);
  return displayed;
}

/* ============================================================
 * Component
 * ============================================================ */
export function DemoReviews() {
  const reduce = useReducedMotion();
  const [regenKey, setRegenKey] = React.useState(0);
  const [replyStarted, setReplyStarted] = React.useState(false);

  // Start typewriter after a brief delay
  React.useEffect(() => {
    setReplyStarted(false);
    const t = setTimeout(() => setReplyStarted(true), reduce ? 0 : 700);
    return () => clearTimeout(t);
  }, [regenKey, reduce]);

  const regen = () => {
    setRegenKey((k) => k + 1);
    toast({ title: "Nueva respuesta IA generada", description: "Variante alternativa lista." });
  };

  return (
    <div className="rp-glass-strong rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight">
            Reseñas Google gestionadas con IA
          </h3>
          <Badge variant="outline" className="border-[var(--gold)]/40 text-[var(--gold-soft)]">
            demo
          </Badge>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/60 bg-foreground/[0.03] px-2.5 py-1 text-xs">
          <GoogleStar className="h-3.5 w-3.5 text-muted-foreground" />
          1.247 reseñas · 4.9★
        </div>
      </div>

      {/* Top grid: distribution + evolution */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* Distribution */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-border/60 bg-foreground/[0.02] p-4"
        >
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Star className="h-4 w-4 rp-gold-text" />
            Distribución de valoraciones
          </div>
          <div className="mt-3 space-y-1.5">
            {DISTRIBUTION.map((d, i) => (
              <div key={d.stars} className="flex items-center gap-2 text-xs">
                <span className="flex w-12 items-center gap-1 font-mono text-muted-foreground">
                  {d.stars}
                  <Star className="h-2.5 w-2.5 fill-[var(--gold)] text-[var(--gold)]" />
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-foreground/10">
                  <motion.div
                    initial={reduce ? false : { width: 0 }}
                    whileInView={{ width: `${d.pct}%` }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      d.stars >= 4
                        ? "bg-gradient-to-r from-[var(--gold-deep)] via-[var(--gold)] to-[var(--gold-soft)]"
                        : d.stars === 3
                        ? "bg-amber-400/70"
                        : "bg-rose-400/70"
                    )}
                  />
                </div>
                <span className="w-16 text-right font-mono text-muted-foreground">
                  {d.count.toLocaleString("es-ES")}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Evolution SVG */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-border/60 bg-foreground/[0.02] p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-[var(--teal)]" />
              Evolución · 12 meses
            </div>
            <div className="text-xs">
              <span className="font-mono text-muted-foreground">4.6 → </span>
              <span className="font-mono rp-gold-text">4.9★</span>
            </div>
          </div>
          <EvolutionChart data={EVOLUTION} reduce={!!reduce} />
        </motion.div>
      </div>

      {/* Topic cloud */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4 }}
        className="mt-4 rounded-xl border border-border/60 bg-foreground/[0.02] p-4"
      >
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Temas más mencionados
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {TOPICS.map((t, i) => {
            const sizeClass =
              t.freq > 400
                ? "text-2xl sm:text-3xl"
                : t.freq > 200
                ? "text-xl sm:text-2xl"
                : t.freq > 100
                ? "text-lg"
                : "text-sm";
            const toneClass =
              t.tone === "pos"
                ? "text-[var(--gold-soft)]"
                : t.tone === "neg"
                ? "text-rose-300"
                : "text-muted-foreground";
            return (
              <motion.span
                key={t.label}
                initial={reduce ? false : { opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={cn("font-display font-light", sizeClass, toneClass)}
              >
                #{t.label}
              </motion.span>
            );
          })}
        </div>
      </motion.div>

      {/* Live review + AI reply */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Review */}
        <div className="rounded-xl border border-border/60 bg-foreground/[0.02] p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Reseña entrante
          </div>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-300 to-purple-500 text-sm font-semibold text-background">
              {DEMO_REVIEW.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-medium">{DEMO_REVIEW.author}</span>
                <span className="text-xs text-muted-foreground">· {DEMO_REVIEW.location}</span>
                  <span className="ml-auto flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star
                        key={s}
                        className={cn(
                          "h-3 w-3",
                          s < DEMO_REVIEW.rating
                            ? "fill-[var(--gold)] text-[var(--gold)]"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                {DEMO_REVIEW.text}
              </p>
              <div className="mt-1.5 text-[11px] text-muted-foreground">{DEMO_REVIEW.date}</div>
            </div>
          </div>
        </div>

        {/* AI reply */}
        <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.04] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider rp-gold-text">
              <Sparkles className="h-3.5 w-3.5" />
              Respuesta sugerida por IA
            </div>
            <button
              onClick={regen}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-border/60 px-2 text-[11px] text-muted-foreground transition-colors hover:bg-foreground/[0.05]"
            >
              <RefreshCw className="h-3 w-3" />
              Variante
            </button>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)]">
              <Sparkles className="h-4 w-4 text-background" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Equipo Ramses Madrid</span>
                <Badge
                  variant="outline"
                  className="border-[var(--teal)]/40 text-[var(--teal)] text-[10px]"
                >
                  IA · 96% confianza
                </Badge>
              </div>
              <p className="mt-2 min-h-[72px] text-sm leading-relaxed text-foreground/85">
                <TypewriterText
                  key={regenKey}
                  text={AI_REPLY}
                  started={replyStarted}
                  reduce={!!reduce}
                />
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              className="h-9 min-h-[44px] bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-background hover:opacity-90"
              onClick={() =>
                toast({
                  title: "Respuesta publicada en Google",
                  description: "Visible públicamente en menos de 2 minutos.",
                })
              }
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Publicar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 min-h-[44px]"
              onClick={() => toast({ title: "Editando respuesta", description: "Editor abierto." })}
            >
              Editar
            </Button>
          </div>
        </div>
      </div>

      {/* Response time comparison */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-foreground/[0.02] p-4">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <div className="flex flex-1 flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            Antes: <span className="font-mono text-rose-300">48h media</span>
          </span>
          <span className="text-muted-foreground/60">→</span>
          <span className="text-muted-foreground">
            Ahora: <span className="font-mono rp-gold-text">2 min con IA</span>
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          -99,9% tiempo de respuesta · +34% conversión a nueva visita
        </div>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Datos de demostración. La integración real conecta con Google Business Profile.
      </p>
    </div>
  );
}

/* ---------- Typewriter text component ---------- */
function TypewriterText({
  text,
  started,
  reduce,
}: {
  text: string;
  started: boolean;
  reduce: boolean;
}) {
  const displayed = useTypewriter(text, started, reduce);
  return (
    <>
      {displayed}
      {started && displayed.length < text.length && !reduce && (
        <span className="ml-0.5 inline-block h-3 w-0.5 -translate-y-0.5 animate-pulse bg-current align-middle" />
      )}
    </>
  );
}

/* ---------- Evolution chart (SVG) ---------- */
function EvolutionChart({
  data,
  reduce,
}: {
  data: { month: string; rating: number }[];
  reduce: boolean;
}) {
  const W = 320;
  const H = 110;
  const padX = 8;
  const padY = 12;
  const min = 4.5;
  const max = 5.0;
  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (W - padX * 2);
    const y = H - padY - ((d.rating - min) / (max - min)) * (H - padY * 2);
    return [x, y] as [number, number];
  });
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const areaD = `${pathD} L ${points[points.length - 1][0].toFixed(1)} ${H - padY} L ${points[0][0].toFixed(1)} ${H - padY} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
      <defs>
        <linearGradient id="rp-evolution-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rp-evolution-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--gold-deep)" />
          <stop offset="100%" stopColor="var(--gold-soft)" />
        </linearGradient>
      </defs>
      {/* horizontal guides */}
      {[4.6, 4.7, 4.8, 4.9].map((g) => {
        const y = H - padY - ((g - min) / (max - min)) * (H - padY * 2);
        return (
          <line
            key={g}
            x1={padX}
            y1={y}
            x2={W - padX}
            y2={y}
            stroke="currentColor"
            strokeOpacity={0.06}
            strokeDasharray="2 4"
          />
        );
      })}
      <motion.path
        d={areaD}
        fill="url(#rp-evolution-fill)"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#rp-evolution-line)"
        strokeWidth={2}
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r={i === points.length - 1 ? 4 : 2}
          fill={i === points.length - 1 ? "var(--gold)" : "var(--gold-deep)"}
          stroke="var(--background)"
          strokeWidth={1}
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + i * 0.07 }}
        />
      ))}
      {/* month labels */}
      {data.map((d, i) => (
        <text
          key={d.month}
          x={padX + (i / (data.length - 1)) * (W - padX * 2)}
          y={H - 1}
          textAnchor="middle"
          className="fill-current text-muted-foreground"
          style={{ fontSize: 8, opacity: 0.5 }}
        >
          {d.month}
        </text>
      ))}
    </svg>
  );
}

export default DemoReviews;
