"use client";

/* =========================================================
 * RestoPanel · Hardware sin fricción
 * ---------------------------------------------------------
 * Fase 8 · Emparejamiento QR, device list, wizard 3 pasos,
 * tarjetas de dispositivos, banner "no servers" y
 * diagnóstico de red. Cero DNS, cero API keys, cero servidores.
 * =======================================================*/

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Plus, QrCode, Smartphone, Printer, Monitor, CreditCard,
  RefreshCw, Loader2,
  CheckCircle2, XCircle, Activity, Signal, Gauge, Ban,
  ArrowRight, ArrowLeft, ServerOff, KeyRound,
  Network, AlertTriangle, Info, Cpu, HardDrive,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/

type DeviceType = "TPV" | "PDA" | "Impresora" | "KDS" | "Lector" | "Cajón";
type DeviceStatus = "online" | "offline";

interface Device {
  id: string;
  tipo: DeviceType;
  nombre: string;
  modelo: string;
  estado: DeviceStatus;
  ultimaConexion: string; // "hace 2 min"
  version?: string;
  ip?: string;
  signal?: number; // 0..100
}

interface DiagnosticResult {
  label: string;
  value: string;
  status: "ok" | "warn" | "fail";
  icon: React.ElementType;
}

type WizardTipo = "TPV" | "PDA" | "Impresora" | "KDS";

/* =========================================================
 * Mock data
 * =======================================================*/

const DEVICE_TYPE_META: Record<DeviceType, { icon: React.ElementType; tone: string }> = {
  TPV:        { icon: Monitor,    tone: "text-[var(--gold-soft)]" },
  PDA:        { icon: Smartphone, tone: "text-[var(--teal)]" },
  Impresora:  { icon: Printer,    tone: "text-violet-300" },
  KDS:        { icon: Monitor,    tone: "text-amber-300" },
  Lector:     { icon: CreditCard, tone: "text-emerald-300" },
  Cajón:      { icon: HardDrive,  tone: "text-rose-300" },
};

const DEVICES_INIT: Device[] = [
  { id: "d1", tipo: "TPV",       nombre: "TPV Caja 1",         modelo: "Sunmi T2",          estado: "online",  ultimaConexion: "ahora",       version: "v2.4.1", ip: "192.168.1.21", signal: 95 },
  { id: "d2", tipo: "PDA",       nombre: "PDA Lucía",          modelo: "Sunmi L2k",         estado: "online",  ultimaConexion: "hace 1 min",  version: "v1.8.0", ip: "192.168.1.34", signal: 78 },
  { id: "d3", tipo: "Impresora", nombre: "Impresora Cocina",   modelo: "Star TSP143",       estado: "online",  ultimaConexion: "ahora",       ip: "192.168.1.50", signal: 100 },
  { id: "d4", tipo: "KDS",       nombre: "KDS Cocina",         modelo: "Tablet Samsung",    estado: "online",  ultimaConexion: "ahora",       version: "v0.9.4", ip: "192.168.1.61", signal: 88 },
  { id: "d5", tipo: "Impresora", nombre: "Impresora Barra",    modelo: "Epson TM-m30",      estado: "offline", ultimaConexion: "hace 14 min", ip: "192.168.1.51" },
  { id: "d6", tipo: "Lector",    nombre: "Lector TPV Caja 1",  modelo: "Stripe Reader M2",  estado: "online",  ultimaConexion: "ahora",       ip: "—",           signal: 92 },
  { id: "d7", tipo: "Cajón",     nombre: "Cajón Caja 1",       modelo: "Posiflex CR-4000",  estado: "online",  ultimaConexion: "ahora",       ip: "192.168.1.22" },
  { id: "d8", tipo: "PDA",       nombre: "PDA Carlos",         modelo: "Sunmi L2k",         estado: "offline", ultimaConexion: "hace 2 h",    version: "v1.8.0", ip: "—",           signal: 0 },
];

const DEVICE_CARDS: Device[] = [
  { id: "c1", tipo: "TPV",       nombre: "TPV Caja 1",       modelo: "Sunmi T2",      estado: "online",  ultimaConexion: "ahora", version: "v2.4.1" },
  { id: "c2", tipo: "PDA",       nombre: "PDA Lucía",        modelo: "Sunmi L2k",     estado: "online",  ultimaConexion: "ahora", version: "v1.8.0" },
  { id: "c3", tipo: "Impresora", nombre: "Impresora Cocina", modelo: "Star TSP143",   estado: "online",  ultimaConexion: "ahora" },
  { id: "c4", tipo: "KDS",       nombre: "KDS Cocina",       modelo: "Tablet Samsung", estado: "online",  ultimaConexion: "ahora", version: "v0.9.4" },
];

/* =========================================================
 * Shared atoms
 * =======================================================*/

function DemoBadge() {
  return (
    <Badge variant="outline" className="border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider">
      demo
    </Badge>
  );
}

function SectionCard({
  title, desc, icon: Icon, action, children, className,
}: {
  title: string; desc?: string; icon: React.ElementType;
  action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("rp-glass rounded-2xl overflow-hidden flex flex-col min-w-0", className)}>
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-foreground/[0.05] text-[var(--gold)] shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg leading-tight truncate">{title}</h2>
            {desc && <p className="text-[11px] text-muted-foreground truncate">{desc}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4 flex-1 min-w-0">{children}</div>
    </section>
  );
}

function StatusBadge({ status }: { status: DeviceStatus }) {
  if (status === "online") {
    return (
      <Badge variant="outline" className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px]">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
        Online
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-rose-400/40 bg-rose-400/10 text-rose-300 text-[10px]">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-1.5" />
      Offline
    </Badge>
  );
}

function SignalBars({ value }: { value: number }) {
  const bars = value >= 80 ? 4 : value >= 60 ? 3 : value >= 30 ? 2 : value > 0 ? 1 : 0;
  return (
    <div className="flex items-end gap-0.5 h-3.5" aria-label={`Señal ${value}%`}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            "w-1 rounded-sm",
            i <= bars ? (value >= 80 ? "bg-emerald-400" : value >= 50 ? "bg-amber-400" : "bg-rose-400") : "bg-foreground/20"
          )}
          style={{ height: `${25 + (i - 1) * 25}%` }}
        />
      ))}
    </div>
  );
}

/* =========================================================
 * Mock QR code (decorative)
 * =======================================================*/

function MockQRCode({ size = 180, animated = false }: { size?: number; animated?: boolean }) {
  // Generate a deterministic pseudo-random pattern
  const cells = 21;
  const cellSize = size / cells;
  const pattern: boolean[][] = [];
  // Use a seeded approach for stable render
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let y = 0; y < cells; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < cells; x++) {
      // Always render corner finder patterns
      const isCorner =
        (x < 7 && y < 7) ||
        (x >= cells - 7 && y < 7) ||
        (x < 7 && y >= cells - 7);
      row.push(isCorner ? true : rand() > 0.5);
    }
    pattern.push(row);
  }

  return (
    <div
      className="relative rounded-xl bg-white p-3 shrink-0"
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
        role="img"
        aria-label="Código QR de emparejamiento"
      >
        <rect x="0" y="0" width={size} height={size} fill="white" />
        {pattern.map((row, y) =>
          row.map((on, x) =>
            on ? (
              <rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="black"
                rx={cellSize * 0.15}
              />
            ) : null
          )
        )}
        {/* Corner finder squares */}
        {[[0, 0], [cells - 7, 0], [0, cells - 7]].map(([cx, cy]) => (
          <g key={`finder-${cx}-${cy}`}>
            <rect x={cx * cellSize} y={cy * cellSize} width={7 * cellSize} height={7 * cellSize} fill="black" rx={cellSize * 0.4} />
            <rect x={(cx + 1) * cellSize} y={(cy + 1) * cellSize} width={5 * cellSize} height={5 * cellSize} fill="white" rx={cellSize * 0.3} />
            <rect x={(cx + 2) * cellSize} y={(cy + 2) * cellSize} width={3 * cellSize} height={3 * cellSize} fill="black" rx={cellSize * 0.2} />
          </g>
        ))}
      </svg>
      {animated && (
        <motion.div
          className="absolute left-3 right-3 h-0.5 bg-[var(--gold)] shadow-[0_0_8px_var(--gold)] pointer-events-none"
          initial={{ top: 12 }}
          animate={{ top: [12, size + 12, 12] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}
      {/* Center logo */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="size-8 rounded-lg bg-[var(--gold)] grid place-items-center text-black font-display text-xs font-bold shadow-lg border-2 border-white">
          RP
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Device table
 * =======================================================*/

function DeviceTable({
  devices, onRevoke,
}: {
  devices: Device[];
  onRevoke: (d: Device) => void;
}) {
  return (
    <div className="rounded-xl border border-border/40 overflow-hidden">
      <div className="overflow-x-auto rp-scroll-thin">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/40 bg-foreground/[0.02]">
              <th className="px-3 py-2.5 font-mono">Tipo</th>
              <th className="px-3 py-2.5 font-mono">Nombre</th>
              <th className="px-3 py-2.5 font-mono">Modelo</th>
              <th className="px-3 py-2.5 font-mono">Estado</th>
              <th className="px-3 py-2.5 font-mono">Última conexión</th>
              <th className="px-3 py-2.5 font-mono text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => {
              const meta = DEVICE_TYPE_META[d.tipo];
              const Icon = meta.icon;
              return (
                <tr key={d.id} className="border-b border-border/20 last:border-0 hover:bg-foreground/[0.02]">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("size-4 shrink-0", meta.tone)} />
                      <span className="font-mono text-[11px] text-muted-foreground">{d.tipo}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium leading-tight">{d.nombre}</div>
                    {d.version && <div className="text-[10px] text-muted-foreground font-mono">{d.version}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{d.modelo}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={d.estado} />
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3" />
                      <span>{d.ultimaConexion}</span>
                    </div>
                    {d.signal !== undefined && d.estado === "online" && (
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <SignalBars value={d.signal} />
                        <span className="text-[10px] text-muted-foreground tabular-nums">{d.signal}%</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevoke(d)}
                      className="h-8 text-[11px] text-rose-300 hover:text-rose-200 hover:bg-rose-500/10"
                    >
                      <Ban className="size-3.5 mr-1" /> Revocar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/* =========================================================
 * Device cards (visual)
 * =======================================================*/

function DeviceVisualCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {DEVICE_CARDS.map((d) => {
        const meta = DEVICE_TYPE_META[d.tipo];
        const Icon = meta.icon;
        return (
          <motion.div
            key={d.id}
            initial={false}
            whileHover={{ y: -2 }}
            className="rounded-xl border border-border/40 bg-foreground/[0.02] p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className={cn("grid size-10 place-items-center rounded-lg bg-foreground/[0.04]", meta.tone)}>
                <Icon className="size-5" />
              </div>
              <StatusBadge status={d.estado} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-mono">{d.tipo}</div>
              <div className="font-display text-base leading-tight truncate">{d.nombre}</div>
              <div className="text-[11px] text-muted-foreground truncate mt-0.5">{d.modelo}</div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
              {d.version && (
                <Badge variant="outline" className="border-border/40 text-[10px] text-muted-foreground font-mono">
                  {d.version}
                </Badge>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto">{d.ultimaConexion}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * No servers banner
 * =======================================================*/

function NoServersBanner() {
  return (
    <div className="rounded-2xl border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="grid size-10 place-items-center rounded-full bg-[var(--teal)]/15 text-[var(--teal)] shrink-0">
        <ServerOff className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-base leading-tight">
          El restaurante no toca servidores, ni API keys, ni DNS
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          RestoPanel gestiona la infraestructura por ti. El emparejamiento es por QR,
          las actualizaciones son OTA y la red se monitoriza automáticamente.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 shrink-0">
        <Badge variant="outline" className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px]">
          <ServerOff className="size-3 mr-1" /> 0 servidores
        </Badge>
        <Badge variant="outline" className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px]">
          <KeyRound className="size-3 mr-1" /> 0 API keys
        </Badge>
        <Badge variant="outline" className="border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px]">
          <Network className="size-3 mr-1" /> 0 DNS
        </Badge>
      </div>
    </div>
  );
}

/* =========================================================
 * QR pairing card (large)
 * =======================================================*/

function QrPairingCard({ onRegenerate }: { onRegenerate: () => void }) {
  const [secondsLeft, setSecondsLeft] = React.useState(300); // 5 min
  React.useEffect(() => {
    const t = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  function reset() {
    setSecondsLeft(300);
    onRegenerate();
  }

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <SectionCard
      title="Emparejamiento por QR"
      desc="Escanea con la app del dispositivo para conectarlo"
      icon={QrCode}
    >
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <MockQRCode size={180} />
        <div className="flex-1 min-w-0 space-y-3 w-full">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-mono">Código válido por</div>
            <div className="font-display text-3xl tabular-nums text-[var(--gold-soft)]">
              {mm}:{ss}
            </div>
          </div>
          <div className="rounded-lg border border-border/40 bg-foreground/[0.02] p-2.5 text-xs text-muted-foreground leading-snug">
            <Info className="size-3.5 inline mr-1 text-[var(--teal)]" />
            Abre la app RestoPanel en el dispositivo, pulsa «Conectar» y escanea este código. El emparejamiento es end-to-end cifrado.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={reset} variant="outline" size="sm" className="h-9">
              <RefreshCw className="size-3.5 mr-1.5" /> Regenerar código
            </Button>
            <Button variant="ghost" size="sm" className="h-9 text-muted-foreground">
              <Network className="size-3.5 mr-1.5" /> Ver red local
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* =========================================================
 * Diagnostics
 * =======================================================*/

function DiagnosticsCard() {
  const { toast } = useToast();
  const [scanning, setScanning] = React.useState(false);
  const [results, setResults] = React.useState<DiagnosticResult[] | null>(null);

  function runDiagnostic() {
    setScanning(true);
    setResults(null);
    window.setTimeout(() => {
      setScanning(false);
      setResults([
        { label: "Latencia TPV → nube", value: "82 ms", status: "ok", icon: Activity },
        { label: "Latencia PDA → nube", value: "118 ms", status: "ok", icon: Activity },
        { label: "Impresora Cocina", value: "Online · 1.2 KB/s", status: "ok", icon: Printer },
        { label: "Impresora Barra", value: "Sin respuesta (timeout 5s)", status: "fail", icon: Printer },
        { label: "Señal PDA Carlos", value: "0% · fuera de cobertura", status: "fail", icon: Signal },
        { label: "Señal PDA Lucía", value: "78% · buena", status: "ok", icon: Signal },
        { label: "Router local", value: "Online · 5 dispositivos", status: "ok", icon: Network },
        { label: "Ancho de banda", value: "1.8 Mbps · óptimo para comandas", status: "ok", icon: Gauge },
      ]);
      toast({
        title: "Diagnóstico completado",
        description: "2 incidencias detectadas. Revisa Impresora Barra y PDA Carlos.",
        variant: "destructive",
      });
    }, 1500);
  }

  return (
    <SectionCard
      title="Diagnóstico de red"
      desc="Comprueba latencia, impresoras y señal de PDAs"
      icon={Activity}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={runDiagnostic}
          disabled={scanning}
          className="h-8"
        >
          {scanning ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Activity className="size-3.5 mr-1" />}
          {scanning ? "Escaneando…" : "Ejecutar"}
        </Button>
      }
    >
      {scanning && (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 rounded-md bg-foreground/[0.04] animate-pulse" />
          ))}
        </div>
      )}

      {!scanning && !results && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Network className="size-8 mx-auto mb-2 opacity-40" />
          Pulsa «Ejecutar» para analizar la red local y la conectividad de los dispositivos.
        </div>
      )}

      {!scanning && results && (
        <ul className="space-y-1.5">
          {results.map((r) => {
            const Icon = r.icon;
            const tone =
              r.status === "ok"
                ? "border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-300"
                : r.status === "warn"
                  ? "border-amber-400/30 bg-amber-400/[0.06] text-amber-300"
                  : "border-rose-400/30 bg-rose-400/[0.06] text-rose-300";
            return (
              <li
                key={r.label}
                className={cn("rounded-md border p-2.5 flex items-center gap-2.5", tone)}
              >
                <Icon className="size-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium leading-tight">{r.label}</div>
                  <div className="text-[11px] opacity-80 leading-snug truncate">{r.value}</div>
                </div>
                {r.status === "ok" ? (
                  <CheckCircle2 className="size-4 shrink-0" />
                ) : r.status === "warn" ? (
                  <AlertTriangle className="size-4 shrink-0" />
                ) : (
                  <XCircle className="size-4 shrink-0" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

/* =========================================================
 * Add device wizard (3 steps)
 * =======================================================*/

function AddDeviceWizard({
  open, onOpenChange, onConnected,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConnected: (nombre: string, tipo: WizardTipo) => void;
}) {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [tipo, setTipo] = React.useState<WizardTipo | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [detected, setDetected] = React.useState(false);
  const [nombre, setNombre] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      // reset on close
      setStep(1);
      setTipo(null);
      setScanning(false);
      setDetected(false);
      setNombre("");
    }
  }, [open]);

  // Step 2 scanning timer
  React.useEffect(() => {
    if (step !== 2 || !scanning) return;
    const t = window.setTimeout(() => {
      setScanning(false);
      setDetected(true);
    }, 3000);
    return () => window.clearTimeout(t);
  }, [step, scanning]);

  function selectTipo(t: WizardTipo) {
    setTipo(t);
    setStep(2);
    setScanning(true);
    setDetected(false);
  }

  function gotoStep3() {
    if (!tipo) return;
    setNombre(`${tipo} nuevo`);
    setStep(3);
  }

  function handleConnect() {
    if (!tipo) return;
    onConnected(nombre || `${tipo} nuevo`, tipo);
    onOpenChange(false);
    toast({
      title: "Dispositivo conectado",
      description: `✓ ${nombre || tipo + " nuevo"} conectado correctamente.`,
    });
  }

  const TIPO_OPTIONS: { id: WizardTipo; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "TPV", label: "TPV", icon: Monitor, desc: "Terminal punto de venta" },
    { id: "PDA", label: "PDA", icon: Smartphone, desc: "Móvil de comanda en sala" },
    { id: "Impresora", label: "Impresora", icon: Printer, desc: "Cocina, barra o caja" },
    { id: "KDS", label: "KDS", icon: HardDrive, desc: "Pantalla de cocina" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rp-glass-strong border-border/60 max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-4 text-[var(--gold-soft)]" />
            Añadir dispositivo
          </DialogTitle>
          <DialogDescription>
            Paso {step} de 3 · asistente guiado sin servidores ni claves manuales.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                s < step
                  ? "bg-emerald-400"
                  : s === step
                    ? "bg-[var(--gold)]"
                    : "bg-foreground/15"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: tipo de dispositivo */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -8 }}
              className="space-y-3 py-2"
            >
              <div className="text-sm font-medium">Selecciona tipo de dispositivo</div>
              <div className="grid grid-cols-2 gap-2">
                {TIPO_OPTIONS.map((o) => {
                  const Icon = o.icon;
                  const active = tipo === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => selectTipo(o.id)}
                      className={cn(
                        "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all",
                        active
                          ? "bg-[var(--gold)]/10 border-[var(--gold)]/50"
                          : "bg-foreground/[0.02] border-border/40 hover:bg-foreground/[0.05]"
                      )}
                    >
                      <div className={cn(
                        "grid size-9 place-items-center rounded-lg",
                        active ? "bg-[var(--gold)]/15 text-[var(--gold-soft)]" : "bg-foreground/[0.04] text-muted-foreground"
                      )}>
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-tight">{o.label}</div>
                        <div className="text-[11px] text-muted-foreground leading-snug">{o.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: escanear QR */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -8 }}
              className="py-2 flex flex-col items-center gap-3"
            >
              <div className="text-sm font-medium text-center">
                Escanea el código QR
              </div>
              <p className="text-[11px] text-muted-foreground text-center max-w-xs">
                Abre la app RestoPanel en el dispositivo, pulsa «Conectar» y enfoca el código.
              </p>
              <MockQRCode size={160} animated={scanning} />
              <div className="flex items-center gap-2 text-xs">
                {scanning ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin text-[var(--gold-soft)]" />
                    <span className="text-muted-foreground">Esperando escaneo…</span>
                  </>
                ) : detected ? (
                  <>
                    <CheckCircle2 className="size-3.5 text-emerald-300" />
                    <span className="text-emerald-300 font-medium">¡Dispositivo detectado!</span>
                  </>
                ) : null}
              </div>
              <div className="flex justify-between w-full gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                  <ArrowLeft className="size-3.5 mr-1" /> Atrás
                </Button>
                <Button
                  size="sm"
                  disabled={!detected}
                  onClick={gotoStep3}
                  className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
                >
                  Continuar <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: nombrar y conectar */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -8 }}
              className="space-y-3 py-2"
            >
              <div className="text-sm font-medium">Nombrando dispositivo</div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Nombre visible</Label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={`Mi ${tipo?.toLowerCase()}`}
                  className="mt-1 h-10"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  El nombre aparece en el device list y en los logs.
                </p>
              </div>
              <div className="rounded-md border border-border/40 bg-foreground/[0.02] p-2.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="size-3 text-emerald-300" />
                  <span className="text-foreground font-medium">Dispositivo detectado</span>
                </div>
                <div className="font-mono text-[10px]">
                  Tipo: <strong className="text-foreground">{tipo}</strong> · ID: <strong className="text-foreground">RP-DM-4821</strong>
                </div>
              </div>
              <div className="flex justify-between gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                  <ArrowLeft className="size-3.5 mr-1" /> Atrás
                </Button>
                <Button
                  size="sm"
                  onClick={handleConnect}
                  className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)]"
                >
                  <CheckCircle2 className="size-3.5 mr-1" /> Conectar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button variant="ghost" size="sm">Cancelar</Button>
          </DialogClose>
          <div className="text-[10px] text-muted-foreground font-mono">
            {tipo && `Tipo: ${tipo}`}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Main view
 * =======================================================*/

export function HardwareView() {
  const { toast } = useToast();
  const [devices, setDevices] = React.useState<Device[]>(DEVICES_INIT);
  const [wizardOpen, setWizardOpen] = React.useState(false);

  function handleRevoke(d: Device) {
    setDevices((prev) => prev.filter((x) => x.id !== d.id));
    toast({
      title: "Dispositivo revocado",
      description: `${d.nombre} (${d.tipo}) ha sido desconectado del panel.`,
      variant: "destructive",
    });
  }

  function handleConnected(nombre: string, tipo: WizardTipo) {
    const meta = DEVICE_TYPE_META[tipo];
    const newDevice: Device = {
      id: `d${Date.now()}`,
      tipo,
      nombre,
      modelo: "Nuevo",
      estado: "online",
      ultimaConexion: "ahora",
      version: "v1.0.0",
      ip: "192.168.1.99",
      signal: 90,
    };
    setDevices((prev) => [newDevice, ...prev]);
    // suppress unused meta warning by referencing it
    void meta;
    toast({
      title: `✓ ${nombre} conectado`,
      description: `${tipo} añadido a tu red RestoPanel.`,
    });
  }

  function handleRegenerate() {
    toast({
      title: "Código QR regenerado",
      description: "El nuevo código es válido por 5 minutos.",
    });
  }

  const online = devices.filter((d) => d.estado === "online").length;
  const offline = devices.filter((d) => d.estado === "offline").length;

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight">Hardware sin fricción</h1>
            <DemoBadge />
            <Badge variant="outline" className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px]">
              Fase 8
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Emparejamiento QR, device list, wizard y diagnóstico. Sin servidores ni API keys.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Badge variant="outline" className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 font-mono uppercase tracking-wider text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
            {online} online
          </Badge>
          {offline > 0 && (
            <Badge variant="outline" className="border-rose-400/40 bg-rose-400/10 text-rose-300 font-mono uppercase tracking-wider text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-1.5" />
              {offline} offline
            </Badge>
          )}
          <Button onClick={() => setWizardOpen(true)} className="bg-[var(--gold)] text-black hover:bg-[var(--gold-soft)] h-10">
            <Plus className="size-4 mr-1.5" /> Añadir dispositivo
          </Button>
        </div>
      </header>

      <NoServersBanner />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 items-start">
        {/* Left: device table */}
        <div className="space-y-5 min-w-0">
          <SectionCard
            title="Dispositivos conectados"
            desc={`${devices.length} dispositivos · ${online} online · ${offline} offline`}
            icon={Cpu}
          >
            <DeviceTable devices={devices} onRevoke={handleRevoke} />
          </SectionCard>

          <SectionCard
            title="Tarjetas de dispositivos"
            desc="Vista rápida del estado de cada equipo"
            icon={Monitor}
          >
            <DeviceVisualCards />
          </SectionCard>
        </div>

        {/* Right: QR pairing + diagnostics */}
        <div className="space-y-5">
          <QrPairingCard onRegenerate={handleRegenerate} />
          <DiagnosticsCard />
        </div>
      </div>

      <AddDeviceWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onConnected={handleConnected}
      />
    </div>
  );
}

/* =========================================================
 * Notes
 * =========================================================
 * - MockQRCode: genera un patrón 21x21 con 3 finder patterns (esquinas) y un logo RP central. Modo `animated` muestra una línea de scan que se desplaza verticalmente (2s loop).
 * - Wizard 3 pasos: 1) tipo (4 opciones), 2) scan QR (3s timer → "¡Dispositivo detectado!"), 3) input nombre + "Conectar" → toast "✓ X conectado".
 * - Device table con tipo/nombre/modelo/estado/última conexión + signal bars/acciones (Revocar). min-w-[720px] + overflow-x-auto rp-scroll-thin.
 * - No servers banner: 3 badges "0 servidores / 0 API keys / 0 DNS".
 * - QR pairing card: countdown 5:00 → 0:00 con interval, "Regenerar código" resetea a 5:00 + toast.
 * - Diagnostics: botón ejecutar → 1.5s spinner → lista de 8 resultados (6 ok, 2 fail) + toast con variant destructive.
 * - useToast exclusivamente en handlers (handleRevoke, handleConnected, handleRegenerate, DiagnosticsCard.runDiagnostic, AddDeviceWizard.handleConnect).
 * - Sin `any`, TypeScript strict. Responsive 390/768/1280+ (grid-cols-1 lg:grid-cols-[1fr_400px], sm:grid-cols-2 xl:grid-cols-4 en device cards, overflow-x-auto rp-scroll-thin en tabla).
 * =======================================================*/
