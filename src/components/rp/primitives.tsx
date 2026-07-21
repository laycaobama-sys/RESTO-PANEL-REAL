import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------- Section shell ---------- */
export function Section({
  id,
  index,
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-16 sm:py-24 border-t border-border/60", className)}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rp-gold-text">{index}</span>
            <span className="h-px w-8 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-balance">
            {title}
          </h2>
          {intro ? (
            <p className="mt-5 max-w-3xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              {intro}
            </p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}

/* ---------- Decision priority tag ---------- */
const TAG_STYLES: Record<string, string> = {
  Imprescindible:
    "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  Importante:
    "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
  Posterior:
    "border-foreground/20 bg-foreground/5 text-muted-foreground",
  Experimental:
    "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
};

export function Tag({
  kind,
  children,
  className,
}: {
  kind?: keyof typeof TAG_STYLES | string;
  children: React.ReactNode;
  className?: string;
}) {
  const style = (kind && TAG_STYLES[kind]) || TAG_STYLES.Posterior;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider",
        style,
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Glass card ---------- */
export function GlassCard({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "strong" | "gold" | "teal";
}) {
  const variants: Record<string, string> = {
    default: "rp-glass",
    strong: "rp-glass-strong",
    gold: "rp-glass rp-glow-gold",
    teal: "rp-glass rp-glow-teal",
  };
  return (
    <div className={cn("rounded-2xl p-5 sm:p-6", variants[variant], className)}>
      {children}
    </div>
  );
}

/* ---------- Mini stat ---------- */
export function Stat({
  label,
  value,
  sub,
  accent = "gold",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: "gold" | "teal" | "fg";
}) {
  const color =
    accent === "gold"
      ? "rp-gold-text"
      : accent === "teal"
      ? "rp-teal-text"
      : "text-foreground";
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-2 font-display text-2xl sm:text-3xl font-light", color)}>
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

/* ---------- Pill ---------- */
export function Pill({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "gold" | "teal" | "outline";
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-foreground/5 text-foreground/80 border-foreground/10",
    gold: "bg-[var(--gold)]/10 text-[var(--gold-soft)] border-[var(--gold)]/25",
    teal: "bg-[var(--teal)]/10 text-[var(--teal)] border-[var(--teal)]/25",
    outline: "bg-transparent text-muted-foreground border-foreground/15",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function H3({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-display text-xl sm:text-2xl font-medium tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function Lead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-sm sm:text-base leading-relaxed text-muted-foreground", className)}>
      {children}
    </p>
  );
}

/* ---------- Data table ---------- */
export function DataTable({
  head,
  rows,
  className,
}: {
  head: React.ReactNode[];
  rows: React.ReactNode[][];
  className?: string;
}) {
  return (
    <div className={cn("rp-glass overflow-hidden rounded-xl", className)}>
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-foreground/[0.03]">
              {head.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-border/40 last:border-0 transition-colors hover:bg-foreground/[0.025]"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cn("px-4 py-3 align-top", ci === 0 && "font-medium text-foreground")}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Bullet list with gold marker ---------- */
export function GoldList({
  items,
  className,
}: {
  items: React.ReactNode[];
  className?: string;
}) {
  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" />
          <span className="text-foreground/85">{it}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Key-value definition ---------- */
export function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-2 border-b border-border/40 last:border-0">
      <dt className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="text-sm text-foreground/90">{v}</dd>
    </div>
  );
}

/* ---------- Risk level tag ---------- */
const RISK_STYLES: Record<string, string> = {
  bajo: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  medio: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  alto: "border-[var(--gold)]/45 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
  crítico: "border-destructive/50 bg-destructive/10 text-destructive",
};

export function Risk({ level, children }: { level: "bajo" | "medio" | "alto" | "crítico"; children?: React.ReactNode }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider " +
        (RISK_STYLES[level] || RISK_STYLES.medio)
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      Riesgo {level}
      {children}
    </span>
  );
}

/* ---------- ADR / callout block ---------- */
export function Callout({
  id,
  kind = "adr",
  title,
  children,
}: {
  id?: string;
  kind?: "adr" | "warn" | "info" | "ok";
  title?: string;
  children: React.ReactNode;
}) {
  const styles: Record<string, { border: string; tag: string; label: string }> = {
    adr: { border: "border-[var(--gold)]/50", tag: "rp-gold-text", label: id ? `${id}` : "ADR" },
    warn: { border: "border-amber-400/50", tag: "text-amber-300", label: "Atención" },
    info: { border: "border-[var(--teal)]/50", tag: "rp-teal-text", label: "Info" },
    ok: { border: "border-emerald-400/50", tag: "text-emerald-300", label: "Decidido" },
  };
  const s = styles[kind];
  return (
    <div className={"rp-glass rounded-xl p-5 border-l-2 " + s.border}>
      <div className="flex items-center gap-3">
        <span className={"font-mono text-xs uppercase tracking-wider " + s.tag}>{s.label}</span>
        {title ? <span className="text-sm font-medium text-foreground">{title}</span> : null}
      </div>
      <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

/* ---------- Code block ---------- */
export function Code({ lang, children }: { lang?: string; children: string }) {
  return (
    <div className="rp-glass rounded-xl overflow-hidden">
      {lang ? (
        <div className="border-b border-border/40 px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          {lang}
        </div>
      ) : null}
      <pre className="overflow-x-auto rp-scroll-thin p-4 text-xs leading-relaxed font-mono text-foreground/85">
        {children}
      </pre>
    </div>
  );
}
