"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Terminal, Copy, Check, ChevronUp, ChevronDown, CornerDownLeft,
  PlayCircle, KeyRound, Rocket, ScrollText, Send, Radio, Package,
  Stethoscope, BookOpen,
} from "lucide-react";

/* =====================================================================
 * Tipos
 * ===================================================================== */

interface CommandDef {
  id: string;
  cmd: string;
  desc: string;
  icon: React.ElementType;
  /** Salida que se "imprime" en el terminal. Si es string, se imprime literal. */
  run: () => TerminalOutput;
}

type Tone = "default" | "gold" | "teal" | "green" | "red" | "muted";

type TerminalLine =
  | { kind: "input"; text: string }
  | { kind: "out"; text: string; tone?: Tone };

interface TerminalOutput {
  lines: TerminalLine[];
  /** Si la salida es "streaming" (rp logs --tail) se imprime línea a línea */
  stream?: boolean;
}

/* =====================================================================
 * Comandos demo
 * ===================================================================== */

const DEMO_COMMANDS: CommandDef[] = [
  {
    id: "login",
    cmd: "rp login",
    desc: "Autenticación OAuth",
    icon: KeyRound,
    run: () => ({
      lines: [
        { kind: "out", text: "Opening browser for OAuth...", tone: "muted" },
        { kind: "out", text: "✓ Logged in as ana.martinez@ramsesgroup.com · Organization: Ramses Group", tone: "green" },
        { kind: "out", text: "  Token cached at ~/.restopanel/credentials.json", tone: "muted" },
      ],
    }),
  },
  {
    id: "create-app",
    cmd: 'rp create-app "Reserva Widget"',
    desc: "Crear aplicación",
    icon: Rocket,
    run: () => ({
      lines: [
        { kind: "out", text: "Creating app 'Reserva Widget'...", tone: "muted" },
        { kind: "out", text: "✓ App created · client_id: rp_live_01HZXABCD · client_secret: [hidden]", tone: "green" },
        { kind: "out", text: "  Add this to your .env file:", tone: "muted" },
        { kind: "out", text: "  RESTOPANEL_CLIENT_ID=rp_live_01HZXABCD", tone: "gold" },
        { kind: "out", text: "  RESTOPANEL_CLIENT_SECRET=••••••••••••••••", tone: "gold" },
      ],
    }),
  },
  {
    id: "deploy",
    cmd: "rp deploy",
    desc: "Desplegar app",
    icon: Send,
    run: () => ({
      lines: [
        { kind: "out", text: "✓ Deploying...", tone: "green" },
        { kind: "out", text: "  Build: success (12.4s)", tone: "muted" },
        { kind: "out", text: "  Upload: success (3.1s · 4.2 MB)", tone: "muted" },
        { kind: "out", text: "  Live: https://widget.restopanel.com", tone: "teal" },
        { kind: "out", text: "✓ Deployment completed in 15.5s", tone: "green" },
      ],
    }),
  },
  {
    id: "logs",
    cmd: "rp logs --tail",
    desc: "Ver logs en tiempo real",
    icon: ScrollText,
    run: () => ({
      stream: true,
      lines: [
        { kind: "out", text: "Tailing logs from production... (Ctrl+C to stop)", tone: "muted" },
        { kind: "out", text: "[14:32:01] GET /v1/reservations 200 42ms", tone: "green" },
        { kind: "out", text: "[14:32:03] GET /v1/customers/cus_01HZX 200 31ms", tone: "green" },
        { kind: "out", text: "[14:32:05] POST /v1/reservations 201 89ms", tone: "gold" },
        { kind: "out", text: "[14:32:08] PATCH /v1/tables/tbl_01HZX 200 38ms", tone: "green" },
        { kind: "out", text: "[14:32:11] GET /v1/analytics/occupancy 200 124ms", tone: "green" },
        { kind: "out", text: "[14:32:14] POST /v1/ai/predict-no-show 200 312ms", tone: "teal" },
        { kind: "out", text: "[14:32:18] GET /v1/reservations?cursor=cur_01HZX 200 41ms", tone: "green" },
        { kind: "out", text: "[14:32:21] GET /v1/health 200 14ms", tone: "muted" },
        { kind: "out", text: "[14:32:25] POST /v1/webhooks/wh_01HZX/replay 200 76ms", tone: "gold" },
      ],
    }),
  },
  {
    id: "publish",
    cmd: "rp publish",
    desc: "Publicar en marketplace",
    icon: Send,
    run: () => ({
      lines: [
        { kind: "out", text: "Publishing 'Reserva Widget' to marketplace...", tone: "muted" },
        { kind: "out", text: "✓ App 'Reserva Widget' published to marketplace · Status: In Review", tone: "green" },
        { kind: "out", text: "  Review ETA: 2-5 business days", tone: "muted" },
        { kind: "out", text: "  Track at: https://marketplace.restopanel.com/apps/rp_live_01HZXABCD", tone: "teal" },
      ],
    }),
  },
  {
    id: "webhook",
    cmd: "rp webhook --listen",
    desc: "Escuchar webhooks localmente",
    icon: Radio,
    run: () => ({
      stream: true,
      lines: [
        { kind: "out", text: "Listening on port 3000...", tone: "muted" },
        { kind: "out", text: "Forwarding to: https://your-app.example.com/webhooks/rp", tone: "muted" },
        { kind: "out", text: "", tone: "muted" },
        { kind: "out", text: "[14:33:12] POST /webhook reservation.created ✓ 200", tone: "green" },
        { kind: "out", text: "[14:33:45] POST /webhook customer.updated ✓ 200", tone: "green" },
        { kind: "out", text: "[14:34:02] POST /webhook reservation.cancelled ✓ 200", tone: "green" },
        { kind: "out", text: "[14:34:18] POST /webhook review.created ✓ 200", tone: "gold" },
      ],
    }),
  },
  {
    id: "sdk",
    cmd: "rp sdk --generate --lang typescript",
    desc: "Generar SDK",
    icon: Package,
    run: () => ({
      lines: [
        { kind: "out", text: "Generating TypeScript SDK from OpenAPI spec...", tone: "muted" },
        { kind: "out", text: "✓ SDK generated: @restopanel/sdk@2.1.0 · 247 types · 89 endpoints", tone: "green" },
        { kind: "out", text: "  Output: ./generated/sdk/", tone: "muted" },
        { kind: "out", text: "  Install with: npm install ./generated/sdk", tone: "teal" },
      ],
    }),
  },
  {
    id: "doctor",
    cmd: "rp doctor",
    desc: "Diagnóstico del sistema",
    icon: Stethoscope,
    run: () => ({
      lines: [
        { kind: "out", text: "RestoPanel CLI · Health Check", tone: "gold" },
        { kind: "out", text: "────────────────────────────────────", tone: "muted" },
        { kind: "out", text: "API:      ✓", tone: "green" },
        { kind: "out", text: "Auth:     ✓", tone: "green" },
        { kind: "out", text: "D1:       ✓", tone: "green" },
        { kind: "out", text: "R2:       ✓", tone: "green" },
        { kind: "out", text: "KV:       ✓", tone: "green" },
        { kind: "out", text: "Queues:   ✓", tone: "green" },
        { kind: "out", text: "AI:       ✓", tone: "green" },
        { kind: "out", text: "────────────────────────────────────", tone: "muted" },
        { kind: "out", text: "All systems operational", tone: "teal" },
      ],
    }),
  },
];

const INSTALL_COMMANDS = [
  { label: "npm", value: "npm install -g restopanel-cli" },
  { label: "brew", value: "brew install restopanel-cli" },
  { label: "curl", value: "curl -fsSL https://restopanel.com/install.sh | sh" },
];

/* =====================================================================
 * Utilidades
 * ===================================================================== */

function toneClass(tone?: Tone): string {
  switch (tone) {
    case "gold": return "text-[var(--gold-soft)]";
    case "teal": return "text-[var(--teal)]";
    case "green": return "text-emerald-300";
    case "red": return "text-destructive";
    case "muted": return "text-muted-foreground";
    default: return "text-foreground/90";
  }
}

/* =====================================================================
 * Componente principal
 * ===================================================================== */

export function DevCli() {
  const [history, setHistory] = React.useState<TerminalLine[][]>([]);
  const [currentInput, setCurrentInput] = React.useState<string>("");
  const [cmdHistory, setCmdHistory] = React.useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = React.useState<number>(-1);
  const [streaming, setStreaming] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Saludo inicial
  React.useEffect(() => {
    setHistory([[
      { kind: "out", text: "RestoPanel CLI v1.2.0  (demo)", tone: "gold" },
      { kind: "out", text: "Type a command, or click a suggestion below.", tone: "muted" },
      { kind: "out", text: "Try: rp doctor", tone: "muted" },
    ]]);
  }, []);

  // Auto-scroll
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, streaming]);

  function pushOutput(out: TerminalOutput, cmdStr: string) {
    if (out.stream) {
      setStreaming(true);
      // Print "streaming" output line-by-line
      const lines = out.lines;
      let idx = 0;
      setHistory((h) => [...h, [{ kind: "input", text: cmdStr }]]);
      const tick = () => {
        if (idx >= lines.length) {
          setStreaming(false);
          return;
        }
        const line = lines[idx];
        setHistory((h) => {
          const next = [...h];
          next[next.length - 1] = [...next[next.length - 1], line];
          return next;
        });
        idx++;
        setTimeout(tick, 220);
      };
      tick();
    } else {
      setHistory((h) => [...h, [{ kind: "input", text: cmdStr }, ...out.lines]]);
    }
  }

  function runCommand(cmdStr: string) {
    const trimmed = cmdStr.trim();
    if (!trimmed || streaming) return;
    setCmdHistory((h) => [...h.filter((c) => c !== trimmed), trimmed]);
    setHistoryIdx(-1);

    // Normalize: strip leading "$ rp" / "rp" prefix
    const normalized = trimmed.replace(/^\$\s*/, "").replace(/^rp\s*/, "").replace(/^rp$/, "").trim();
    const fullCmd = normalized ? `rp ${normalized}` : "rp";

    // Match against demo commands (match by prefix of id)
    const match = DEMO_COMMANDS.find((c) => {
      const cmdTokens = c.cmd.replace(/^\$\s*/, "").split(/\s+/);
      const inTokens = fullCmd.split(/\s+/);
      // Match first 2 tokens (rp <subcommand>) + flags presence
      if (inTokens.length < 2) return c.cmd.replace(/^\$\s*/, "") === fullCmd;
      if (cmdTokens[1] !== inTokens[1]) return false;
      // Subcommand-specific: check if all required tokens are present
      const required = cmdTokens.slice(2).filter((t) => !t.startsWith("--"));
      return required.every((t) => inTokens.includes(t));
    });

    if (match) {
      pushOutput(match.run(), trimmed);
    } else if (normalized === "" || normalized === "rp") {
      setHistory((h) => [...h, [{ kind: "input", text: trimmed }, { kind: "out", text: "RestoPanel CLI · type 'rp <command>' or pick a suggestion.", tone: "muted" }]]);
    } else if (normalized === "help" || normalized === "--help" || normalized === "-h") {
      setHistory((h) => [...h, [{ kind: "input", text: trimmed }, { kind: "out", text: "Available commands:", tone: "gold" }, ...DEMO_COMMANDS.map((c) => ({ kind: "out" as const, text: `  ${c.cmd.padEnd(45)} ${c.desc}`, tone: "muted" as const }))]]);
    } else if (normalized === "clear" || normalized === "cls") {
      setHistory([]);
    } else if (normalized === "version" || normalized === "--version" || normalized === "-v") {
      setHistory((h) => [...h, [{ kind: "input", text: trimmed }, { kind: "out", text: "restopanel-cli v1.2.0", tone: "gold" }]]);
    } else {
      setHistory((h) => [...h, [
        { kind: "input", text: trimmed },
        { kind: "out", text: `command not found: ${normalized.split(/\s+/)[0]}`, tone: "red" },
        { kind: "out", text: "Type 'help' or pick a suggestion below.", tone: "muted" },
      ]]);
    }
    setCurrentInput("");
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(currentInput);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setCurrentInput(cmdHistory[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistoryIdx(-1);
        setCurrentInput("");
      } else {
        setHistoryIdx(nextIdx);
        setCurrentInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setHistory([]);
    }
  }

  // Build the current text content for "copy all"
  const allText = history
    .map((block) =>
      block
        .map((l) => (l.kind === "input" ? `$ ${l.text}` : l.text))
        .join("\n")
    )
    .join("\n");

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="rp-glass rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--teal)]/10 border border-[var(--gold)]/30 flex items-center justify-center">
            <Terminal className="h-6 w-6 text-[var(--gold-soft)]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">RestoPanel CLI</h1>
              <Badge className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] uppercase tracking-wider">demo</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Simulador interactivo de la consola <code className="text-[var(--teal)] font-mono">restopanel-cli</code>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="gap-1.5 font-mono">
            <Terminal className="h-3 w-3" />
            restopanel-cli v1.2.0
          </Badge>
          <CopyButton value={allText} label="Copiar todo" />
        </div>
      </header>

      {/* Command suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          <PlayCircle className="h-3.5 w-3.5" />
          Sugerencias
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_COMMANDS.map((c) => (
            <button
              key={c.id}
              onClick={() => runCommand(c.cmd)}
              disabled={streaming}
              className={cn(
                "shrink-0 min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-border/60 bg-foreground/[0.02] px-3 py-2 text-xs font-mono transition-colors",
                "hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/5 hover:text-[var(--gold-soft)]",
                streaming && "opacity-50 cursor-not-allowed"
              )}
              aria-label={`Ejecutar ${c.cmd}`}
            >
              <c.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate max-w-[260px]">{c.cmd}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Terminal */}
      <div className="rp-glass-strong rounded-2xl overflow-hidden border border-border/60">
        {/* Title bar */}
        <div className="border-b border-border/40 px-4 py-2.5 flex items-center gap-3 bg-foreground/[0.03]">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-destructive/70" />
            <span className="h-3 w-3 rounded-full bg-amber-400/70" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
          </div>
          <span className="text-xs font-mono text-muted-foreground flex-1 truncate">
            ana.martinez@ramses — restopanel-cli
          </span>
          {streaming && (
            <Badge variant="outline" className="text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              streaming
            </Badge>
          )}
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          className="bg-[#0a0a0a]/80 p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed min-h-[360px] max-h-[60vh] overflow-y-auto rp-scroll-thin"
          onClick={() => inputRef.current?.focus()}
          role="log"
          aria-live="polite"
          aria-label="Salida del terminal"
        >
          {history.map((block, bi) => (
            <div key={bi} className="mb-3">
              <div className="flex items-start gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyBlock(block);
                  }}
                  className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity text-muted-foreground hover:text-[var(--gold-soft)]"
                  aria-label="Copiar bloque"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <div className="flex-1 min-w-0">
                  {block.map((line, li) => (
                    <Line key={li} line={line} />
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="group">
            <div className="flex items-start gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyBlock([{ kind: "input", text: currentInput }]);
                }}
                className="shrink-0 mt-0.5 text-muted-foreground hover:text-[var(--gold-soft)] transition-colors"
                aria-label="Copiar comando"
              >
                <Copy className="h-3 w-3" />
              </button>
              <div className="flex-1 min-w-0 flex items-center">
                <span className="text-[var(--gold-soft)] select-none">$&nbsp;</span>
                <span className="text-emerald-300 select-none">rp&nbsp;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={onKey}
                  disabled={streaming}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  className="flex-1 bg-transparent outline-none text-foreground caret-[var(--gold)] disabled:opacity-50"
                  placeholder={streaming ? "streaming..." : "escribe un comando..."}
                  aria-label="Entrada del terminal"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ChevronUp className="h-3 w-3" />
          <ChevronDown className="h-3 w-3" />
          historial
        </span>
        <span className="inline-flex items-center gap-1">
          <kbd className="rounded border border-border/60 px-1.5 py-0.5">↵</kbd>
          ejecutar
        </span>
        <span className="inline-flex items-center gap-1">
          <kbd className="rounded border border-border/60 px-1.5 py-0.5">Ctrl</kbd>
          +
          <kbd className="rounded border border-border/60 px-1.5 py-0.5">L</kbd>
          limpiar
        </span>
        <span className="ml-auto inline-flex items-center gap-1">
          <CornerDownLeft className="h-3 w-3" />
          pulsa cualquier sugerencia
        </span>
      </div>

      {/* Features list */}
      <section className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-[var(--gold-soft)]" />
          <h2 className="font-display text-lg font-medium tracking-tight">Comandos disponibles</h2>
          <Badge variant="outline">{DEMO_COMMANDS.length}</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEMO_COMMANDS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => runCommand(c.cmd)}
              disabled={streaming}
              className="group text-left rounded-xl border border-border/60 bg-foreground/[0.02] p-4 hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/5 transition-colors min-h-[110px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-md bg-foreground/[0.05] flex items-center justify-center">
                  <c.icon className="h-4 w-4 text-[var(--gold-soft)]" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
              </div>
              <code className="text-xs font-mono text-foreground break-all leading-tight">{c.cmd}</code>
              <p className="text-xs text-muted-foreground mt-1.5 flex-1">{c.desc}</p>
              <div className="flex items-center gap-1 text-[10px] text-[var(--gold-soft)] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="h-3 w-3" /> Ejecutar
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Install instructions */}
      <section className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-4 w-4 text-[var(--gold-soft)]" />
          <h2 className="font-display text-lg font-medium tracking-tight">Instalación</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {INSTALL_COMMANDS.map((ic) => (
            <div key={ic.label} className="rounded-xl border border-border/60 bg-[#0a0a0a]/60 overflow-hidden">
              <div className="border-b border-border/40 px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{ic.label}</span>
                <CopyButton value={ic.value} label="Copiar" className="border-0 bg-transparent px-1 py-0 min-h-[24px] text-[10px]" />
              </div>
              <pre className="p-4 text-xs font-mono text-foreground/90 overflow-x-auto rp-scroll-thin"><code><span className="text-[var(--gold-soft)]">$</span> {ic.value}</code></pre>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Requisitos: Node.js ≥ 20 · macOS, Linux o Windows. La instalación global expone el comando <code className="text-[var(--teal)] font-mono">rp</code>.
        </p>
      </section>
    </div>
  );
}

/* =====================================================================
 * Sub-componentes
 * ===================================================================== */

function Line({ line }: { line: TerminalLine }) {
  if (line.kind === "input") {
    return (
      <div className="flex items-center">
        <span className="text-[var(--gold-soft)] select-none">$&nbsp;</span>
        <span className="text-emerald-300 select-none">rp&nbsp;</span>
        <span className="text-foreground">{line.text.replace(/^\$\s*/, "").replace(/^rp\s*/, "").replace(/^rp$/, "")}</span>
      </div>
    );
  }
  return (
    <div className={cn("whitespace-pre-wrap break-words", toneClass(line.tone))}>
      {line.text || "\u00a0"}
    </div>
  );
}

function copyBlock(block: TerminalLine[]) {
  const text = block.map((l) => (l.kind === "input" ? `$ rp ${l.text.replace(/^\$\s*/, "").replace(/^rp\s*/, "")}` : l.text)).join("\n");
  try {
    navigator.clipboard?.writeText(text);
  } catch {
    /* noop */
  }
  toast({ title: "Copiado", description: "Bloque copiado al portapapeles" });
}

/* =====================================================================
 * Copy button (reused)
 * ===================================================================== */

function CopyButton({ value, label, className }: { value: string; label: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        try {
          navigator.clipboard?.writeText(value);
        } catch {
          /* noop */
        }
        setCopied(true);
        toast({ title: "Copiado", description: label });
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 min-h-[36px] rounded-md border border-border/60 bg-foreground/[0.03] px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors",
        className
      )}
      aria-label={label}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? "Copiado" : label}</span>
    </button>
  );
}
