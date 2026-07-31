"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Battery,
  BatteryLow,
  ChevronRight,
  Clock,
  Cpu,
  Gauge,
  Info,
  Plug,
  Power,
  QrCode,
  Radio,
  RefreshCw,
  Settings2,
  Signal,
  Smartphone,
  Table,
  Thermometer,
  Users,
  Webhook,
  Wifi,
  XCircle,
  Zap,
  CheckCircle2,
  History,
  ShieldCheck,
} from "lucide-react";

/* =========================================================
 * Types
 * =======================================================*/
type SensorType =
  | "pressure"
  | "ble_beacon"
  | "qr_scan"
  | "temperature"
  | "occupancy"
  | "smart_table";

type SensorStatus = "online" | "offline" | "low_battery" | "error";

interface IoTSensor {
  id: string;
  type: SensorType;
  name: string;
  location: string;
  status: SensorStatus;
  battery?: number;
  lastSignal: string;
  firmwareVersion: string;
  data: { key: string; value: string; unit: string }[];
  mappedAction: string;
}

interface IoTEvent {
  id: string;
  timestamp: string;
  sensorId: string;
  event: string;
  actionTriggered: string;
  level: "info" | "warning" | "error";
}

/* =========================================================
 * Sensor type meta
 * =======================================================*/
const SENSOR_TYPE_META: Record<
  SensorType,
  { label: string; icon: React.ElementType; tone: string }
> = {
  pressure: { label: "Pressure", icon: Gauge, tone: "rp-gold-text" },
  ble_beacon: { label: "BLE Beacon", icon: Radio, tone: "rp-teal-text" },
  qr_scan: { label: "QR Scan", icon: QrCode, tone: "text-purple-300" },
  temperature: {
    label: "Temperature",
    icon: Thermometer,
    tone: "text-amber-300",
  },
  occupancy: { label: "Occupancy", icon: Users, tone: "text-sky-300" },
  smart_table: { label: "Smart Table", icon: Table, tone: "text-emerald-300" },
};

/* =========================================================
 * Sensor status meta
 * =======================================================*/
const SENSOR_STATUS_META: Record<
  SensorStatus,
  {
    label: string;
    dot: string;
    text: string;
    border: string;
    bg: string;
  }
> = {
  online: {
    label: "Online",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    border: "border-emerald-400/40",
    bg: "bg-emerald-400/10",
  },
  offline: {
    label: "Offline",
    dot: "bg-zinc-500",
    text: "text-zinc-400",
    border: "border-zinc-500/40",
    bg: "bg-zinc-500/10",
  },
  low_battery: {
    label: "Batería baja",
    dot: "bg-amber-400",
    text: "text-amber-300",
    border: "border-amber-400/40",
    bg: "bg-amber-400/10",
  },
  error: {
    label: "Error",
    dot: "bg-red-400",
    text: "text-red-300",
    border: "border-red-400/40",
    bg: "bg-red-400/10",
  },
};

/* =========================================================
 * Demo sensors (10)
 * =======================================================*/
const DEMO_SENSORS: IoTSensor[] = [
  {
    id: "SP-M03",
    type: "pressure",
    name: "Sensor presión M03",
    location: "Mesa M3 · Terraza",
    status: "online",
    battery: 87,
    lastSignal: "hace 3s",
    firmwareVersion: "v2.4.1",
    data: [{ key: "Peso", value: "42", unit: "kg" }],
    mappedAction: "Sugiere cambio a 'Seated' (mesa ocupada con comensales)",
  },
  {
    id: "SP-M07",
    type: "pressure",
    name: "Sensor presión M07",
    location: "Mesa M7 · Terraza",
    status: "online",
    battery: 92,
    lastSignal: "hace 5s",
    firmwareVersion: "v2.4.1",
    data: [{ key: "Peso", value: "0", unit: "kg" }],
    mappedAction: "Sugiere cambio a 'Available' (mesa libre, sin peso)",
  },
  {
    id: "BLE-001",
    type: "ble_beacon",
    name: "Baliza BLE Recepción",
    location: "Recepción",
    status: "online",
    battery: 95,
    lastSignal: "hace 1s",
    firmwareVersion: "v1.8.0",
    data: [
      {
        key: "Detecta",
        value: "cliente VIP Elena Marín a 5m",
        unit: "",
      },
    ],
    mappedAction: "Notifica maître — cliente VIP detectado en recepción",
  },
  {
    id: "BLE-002",
    type: "ble_beacon",
    name: "Baliza BLE Cocina",
    location: "Cocina",
    status: "online",
    battery: 88,
    lastSignal: "hace 2s",
    firmwareVersion: "v1.8.0",
    data: [
      { key: "Detecta", value: "runner Pedro en cocina", unit: "" },
    ],
    mappedAction: "Tracking personal — registra presencia en cocina",
  },
  {
    id: "QR-T03",
    type: "qr_scan",
    name: "QR Mesa T03",
    location: "Mesa T3 · Terraza",
    status: "online",
    battery: undefined,
    lastSignal: "hace 12s",
    firmwareVersion: "n/a (passive)",
    data: [
      {
        key: "Escaneado",
        value: "14:32 — cliente accede a carta digital",
        unit: "",
      },
    ],
    mappedAction: "Actualiza preferencias CRM — origen: carta digital",
  },
  {
    id: "TMP-001",
    type: "temperature",
    name: "Sensor temperatura cocina",
    location: "Cocina",
    status: "online",
    battery: 78,
    lastSignal: "hace 8s",
    firmwareVersion: "v3.1.2",
    data: [
      { key: "Temperatura", value: "22", unit: "°C" },
      { key: "Estado", value: "Normal", unit: "" },
    ],
    mappedAction: "Monitor de seguridad alimentaria — registro continuo",
  },
  {
    id: "OCC-VIP",
    type: "occupancy",
    name: "Ocupación zona VIP",
    location: "Zona VIP",
    status: "online",
    battery: 84,
    lastSignal: "hace 4s",
    firmwareVersion: "v2.0.5",
    data: [
      { key: "Comensales", value: "8/12", unit: "" },
      { key: "Ocupación", value: "67", unit: "%" },
    ],
    mappedAction: "Actualiza heatmap de ocupación en tiempo real",
  },
  {
    id: "ST-V1",
    type: "smart_table",
    name: "Mesa inteligente V1",
    location: "Mesa V1 · VIP",
    status: "offline",
    battery: 0,
    lastSignal: "hace 23min",
    firmwareVersion: "v4.2.0",
    data: [
      { key: "Estado", value: "Sin señal desde 13:45", unit: "" },
    ],
    mappedAction: "Requiere mantenimiento — ticket creado #MNT-0042",
  },
  {
    id: "SP-M12",
    type: "pressure",
    name: "Sensor presión M12",
    location: "Mesa M12 · Sala",
    status: "online",
    battery: 76,
    lastSignal: "hace 6s",
    firmwareVersion: "v2.4.1",
    data: [{ key: "Peso", value: "28", unit: "kg" }],
    mappedAction: "Confirma ocupación — mesa en servicio activo",
  },
  {
    id: "BLE-003",
    type: "ble_beacon",
    name: "Baliza BLE Barra",
    location: "Barra",
    status: "low_battery",
    battery: 12,
    lastSignal: "hace 9s",
    firmwareVersion: "v1.8.0",
    data: [
      { key: "Detecta", value: "camarero Ana en barra", unit: "" },
    ],
    mappedAction: "Tracking personal — registrada presencia en barra",
  },
];

/* =========================================================
 * Demo IoT events
 * =======================================================*/
const DEMO_EVENTS: IoTEvent[] = [
  {
    id: "EV1",
    timestamp: "14:32:18",
    sensorId: "QR-T03",
    event: "QR escaneado — acceso a carta digital",
    actionTriggered: "Preferencias CRM actualizadas + notificación a camarero",
    level: "info",
  },
  {
    id: "EV2",
    timestamp: "14:32:11",
    sensorId: "BLE-001",
    event: "Cliente VIP Elena Marín detectado (5m)",
    actionTriggered: "Notificación push al maître + history entry",
    level: "info",
  },
  {
    id: "EV3",
    timestamp: "14:31:54",
    sensorId: "SP-M03",
    event: "Peso establecido en 42kg (mesa ocupada)",
    actionTriggered: "Sugerencia automática: estado → 'Seated'",
    level: "info",
  },
  {
    id: "EV4",
    timestamp: "14:31:42",
    sensorId: "ST-V1",
    event: "Pérdida de señal — sin heartbeat",
    actionTriggered: "Ticket de mantenimiento #MNT-0042 creado",
    level: "error",
  },
  {
    id: "EV5",
    timestamp: "14:31:28",
    sensorId: "BLE-003",
    event: "Batería por debajo del 15%",
    actionTriggered: "Alerta de batería baja al supervisor de turno",
    level: "warning",
  },
  {
    id: "EV6",
    timestamp: "14:31:05",
    sensorId: "TMP-001",
    event: "Temperatura 22°C — dentro de rango",
    actionTriggered: "Registro continuo en log de seguridad alimentaria",
    level: "info",
  },
  {
    id: "EV7",
    timestamp: "14:30:48",
    sensorId: "OCC-VIP",
    event: "Ocupación VIP: 8/12 (67%)",
    actionTriggered: "Heatmap actualizado + ajuste de turnos VIP",
    level: "info",
  },
  {
    id: "EV8",
    timestamp: "14:30:22",
    sensorId: "SP-M07",
    event: "Peso 0kg detectado (mesa liberada)",
    actionTriggered: "Sugerencia: estado → 'Available' + recordatorio limpieza",
    level: "info",
  },
  {
    id: "EV9",
    timestamp: "14:29:54",
    sensorId: "BLE-002",
    event: "Runner Pedro entró en cocina",
    actionTriggered: "Tracking log actualizado — recoger pedido M9",
    level: "info",
  },
  {
    id: "EV10",
    timestamp: "14:29:31",
    sensorId: "SP-M12",
    event: "Peso 28kg — mesa ocupada confirmada",
    actionTriggered: "Confirma ocupación + sync con reservation state",
    level: "info",
  },
];

/* =========================================================
 * Helpers
 * =======================================================*/
function batteryTone(battery?: number): string {
  if (battery === undefined) return "text-muted-foreground";
  if (battery < 15) return "text-red-300";
  if (battery < 30) return "text-amber-300";
  return "text-emerald-300";
}

function BatteryGlyph({ battery }: { battery?: number }) {
  if (battery === undefined) return null;
  if (battery < 15) return <BatteryLow className="h-3 w-3" />;
  return <Battery className="h-3 w-3" />;
}

function levelMeta(level: IoTEvent["level"]) {
  switch (level) {
    case "info":
      return {
        text: "text-sky-300",
        bg: "bg-sky-400/10",
        border: "border-sky-400/30",
        dot: "bg-sky-400",
      };
    case "warning":
      return {
        text: "text-amber-300",
        bg: "bg-amber-400/10",
        border: "border-amber-400/30",
        dot: "bg-amber-400",
      };
    case "error":
      return {
        text: "text-red-300",
        bg: "bg-red-400/10",
        border: "border-red-400/30",
        dot: "bg-red-400",
      };
  }
}

/* =========================================================
 * Overview stats
 * =======================================================*/
function OverviewStats({ sensors }: { sensors: IoTSensor[] }) {
  const reduce = useReducedMotion();
  const total = sensors.length;
  const online = sensors.filter((s) => s.status === "online").length;
  const offline = sensors.filter((s) => s.status === "offline").length;
  const lowBat = sensors.filter((s) => s.status === "low_battery").length;
  const errorCount = sensors.filter((s) => s.status === "error").length;

  const items = [
    {
      label: "Sensores conectados",
      value: `${total}`,
      icon: Cpu,
      accent: "rp-gold-text",
    },
    {
      label: "Online",
      value: `${online}`,
      icon: Wifi,
      accent: "text-emerald-300",
    },
    {
      label: "Offline",
      value: `${offline}`,
      icon: Power,
      accent: "text-zinc-400",
    },
    {
      label: "Batería baja",
      value: `${lowBat}`,
      icon: BatteryLow,
      accent: "text-amber-300",
    },
    {
      label: "Errores",
      value: `${errorCount}`,
      icon: AlertTriangle,
      accent: "text-red-300",
    },
  ];

  return (
    <div className="rp-glass grid grid-cols-2 gap-2 rounded-2xl p-3 sm:grid-cols-5 sm:gap-3 sm:p-4">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div
            key={it.label}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: reduce ? 0 : i * 0.04 }}
            className="flex items-center gap-2.5 rounded-xl bg-foreground/[0.03] px-3 py-2"
          >
            <Icon className={cn("h-4 w-4 shrink-0", it.accent)} />
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground truncate">
                {it.label}
              </div>
              <div
                className={cn(
                  "font-display text-lg font-light tabular-nums sm:text-xl",
                  it.accent,
                )}
              >
                {it.value}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* =========================================================
 * Sensor card
 * =======================================================*/
function SensorCard({
  sensor,
  index,
  reduce,
  onSignal,
  onReconfigure,
  onDisconnect,
}: {
  sensor: IoTSensor;
  index: number;
  reduce: boolean;
  onSignal: () => void;
  onReconfigure: () => void;
  onDisconnect: () => void;
}) {
  const typeMeta = SENSOR_TYPE_META[sensor.type];
  const statusMeta = SENSOR_STATUS_META[sensor.status];
  const TypeIcon = typeMeta.icon;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: reduce ? 0 : index * 0.04 }}
      className={cn(
        "rp-glass flex flex-col rounded-2xl p-4 ring-1",
        sensor.status === "offline" && "ring-red-400/20 opacity-80",
        sensor.status === "error" && "ring-red-400/30 rp-glow-gold",
        sensor.status === "low_battery" && "ring-amber-400/20",
        sensor.status === "online" && "ring-emerald-400/15",
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl border",
            "border-border/40 bg-foreground/[0.04]",
          )}
        >
          <TypeIcon className={cn("h-5 w-5", typeMeta.tone)} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-medium tracking-tight text-foreground">
              {sensor.id}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border px-1 py-0.5 text-[9px] font-mono uppercase tracking-wider",
                statusMeta.border,
                statusMeta.bg,
                statusMeta.text,
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  statusMeta.dot,
                  sensor.status === "online" && "animate-pulse",
                )}
              />
              {statusMeta.label}
            </span>
          </div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {sensor.name}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
            <Table className="h-2.5 w-2.5" />
            {sensor.location}
          </div>
        </div>
      </div>

      {/* Battery + signal + firmware */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-foreground/[0.03] py-1.5">
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
            Batería
          </div>
          <div
            className={cn(
              "mt-0.5 flex items-center justify-center gap-1 font-mono text-xs tabular-nums",
              batteryTone(sensor.battery),
            )}
          >
            <BatteryGlyph battery={sensor.battery} />
            {sensor.battery !== undefined ? `${sensor.battery}%` : "n/a"}
          </div>
        </div>
        <div className="rounded-md bg-foreground/[0.03] py-1.5">
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
            Señal
          </div>
          <div className="mt-0.5 flex items-center justify-center gap-1 font-mono text-xs text-muted-foreground">
            <Signal className="h-3 w-3" />
            {sensor.lastSignal}
          </div>
        </div>
        <div className="rounded-md bg-foreground/[0.03] py-1.5">
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
            Firmware
          </div>
          <div className="mt-0.5 font-mono text-xs text-foreground/80">
            {sensor.firmwareVersion}
          </div>
        </div>
      </div>

      {/* Sensor data */}
      <div className="mt-3 space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Datos del sensor
        </div>
        {sensor.data.map((d, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between gap-2 rounded-md bg-foreground/[0.03] px-2 py-1.5"
          >
            <span className="text-[11px] text-muted-foreground">{d.key}:</span>
            <span className="font-mono text-xs text-foreground">
              {d.value}
              {d.unit && (
                <span className="ml-1 text-muted-foreground">{d.unit}</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Mapped action */}
      <div className="mt-3 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/[0.06] p-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
          <Zap className="h-2.5 w-2.5" />
          Acción mapeada
        </div>
        <p className="mt-1 text-xs leading-relaxed text-foreground/85">
          → {sensor.mappedAction}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onSignal}
          className="h-9 min-h-9 px-2.5 text-[11px]"
        >
          <Activity className="mr-1 h-3 w-3" />
          Ver señal
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReconfigure}
          className="h-9 min-h-9 px-2.5 text-[11px]"
        >
          <Settings2 className="mr-1 h-3 w-3" />
          Reconfigurar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDisconnect}
          className="h-9 min-h-9 px-2.5 text-[11px] text-red-300 hover:text-red-200"
        >
          <Power className="mr-1 h-3 w-3" />
          Desconectar
        </Button>
      </div>
    </motion.article>
  );
}

/* =========================================================
 * Signal history dialog
 * =======================================================*/
function SignalHistoryDialog({
  sensor,
  open,
  onOpenChange,
}: {
  sensor: IoTSensor | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!sensor) return null;
  // Generate demo signal samples
  const samples = Array.from({ length: 12 }).map((_, i) => {
    const baseTime = new Date();
    baseTime.setSeconds(baseTime.getSeconds() - i * 8);
    const time = baseTime.toLocaleTimeString("es-ES", { hour12: false });
    const rssi = -45 - Math.round(Math.random() * 25);
    const isOnline = sensor.status !== "offline" || i < 3;
    return {
      time,
      rssi,
      status: isOnline ? "online" : "offline",
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Signal className="h-4 w-4 rp-teal-text" />
            Historial de señal — {sensor.id}
          </DialogTitle>
          <DialogDescription>
            Últimas 12 lecturas de RSSI del sensor ({sensor.location}).
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-1 overflow-y-auto rp-scroll-thin">
          {samples.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md border border-border/40 bg-foreground/[0.02] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    s.status === "online" ? "bg-emerald-400" : "bg-zinc-500",
                  )}
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {s.time}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tabular-nums text-foreground">
                  RSSI {s.rssi}dBm
                </span>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-wider",
                    s.status === "online" ? "text-emerald-300" : "text-zinc-400",
                  )}
                >
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-md border border-border/40 bg-foreground/[0.02] px-3 py-2 text-[11px] text-muted-foreground">
          <Info className="h-3 w-3 shrink-0" />
          Datos demo — en producción se alimentan del stream de telemetría del
          sensor.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * Event log
 * =======================================================*/
function EventLog({ events, reduce }: { events: IoTEvent[]; reduce: boolean }) {
  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">Log de eventos</h3>
        <Badge
          variant="outline"
          className="border-border/40 bg-foreground/[0.04] text-muted-foreground text-[10px] font-mono uppercase tracking-wider"
        >
          {events.length} recientes
        </Badge>
      </div>
      <div className="max-h-96 space-y-1.5 overflow-y-auto rp-scroll-thin pr-1">
        <AnimatePresence initial={false}>
          {events.map((ev, i) => {
            const lm = levelMeta(ev.level);
            return (
              <motion.div
                key={ev.id}
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: reduce ? 0 : i * 0.02 }}
                className={cn(
                  "rounded-lg border px-3 py-2",
                  lm.border,
                  lm.bg,
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 rounded-full", lm.dot)} />
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {ev.timestamp}
                    </span>
                    <span className="font-mono text-[11px] text-foreground/80">
                      {ev.sensorId}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-mono uppercase tracking-wider",
                      lm.text,
                    )}
                  >
                    {ev.level}
                  </span>
                </div>
                <div className="mt-1 text-xs text-foreground/85">{ev.event}</div>
                <div className="mt-1 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <Zap className="mt-0.5 h-2.5 w-2.5 shrink-0 text-[var(--teal)]" />
                  <span>{ev.actionTriggered}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =========================================================
 * Webhook info
 * =======================================================*/
function WebhookInfo() {
  const [copied, setCopied] = React.useState(false);
  const endpoint = "POST /v1/webhooks/iot-sensors";

  const handleCopy = () => {
    try {
      navigator.clipboard?.writeText(endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="rp-glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Webhook className="h-4 w-4 rp-gold-text" />
        <h3 className="text-sm font-medium text-foreground">
          Endpoint de ingesta
        </h3>
        <Badge
          variant="outline"
          className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] font-mono uppercase tracking-wider"
        >
          webhook
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-foreground/[0.04] px-3 py-2">
        <code className="overflow-x-auto rp-scroll-thin font-mono text-xs text-foreground">
          {endpoint}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 min-h-9 shrink-0 px-2 text-[11px]"
        >
          {copied ? (
            <CheckCircle2 className="h-3 w-3 text-emerald-300" />
          ) : (
            <Smartphone className="h-3 w-3" />
          )}
          <span className="ml-1">{copied ? "Copiado" : "Copiar"}</span>
        </Button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Recibe señales de hardware. Valida firma HMAC. Traduce señales en
        eventos de sala accionables (cambio de estado, notificaciones,
        mantenimiento, tracking). Idempotente por <span className="font-mono text-foreground/80">sensor_id + timestamp</span>.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border/40 bg-foreground/[0.02] px-2.5 py-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Autenticación
          </div>
          <div className="mt-0.5 text-xs text-foreground/85">
            HMAC-SHA256
          </div>
        </div>
        <div className="rounded-md border border-border/40 bg-foreground/[0.02] px-2.5 py-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Formato
          </div>
          <div className="mt-0.5 text-xs text-foreground/85">JSON · UTF-8</div>
        </div>
        <div className="rounded-md border border-border/40 bg-foreground/[0.02] px-2.5 py-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Throughput
          </div>
          <div className="mt-0.5 text-xs text-foreground/85">
            ~500 events/seg
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Hardware note
 * =======================================================*/
function HardwareNote() {
  return (
    <div className="rp-glass rounded-2xl border-l-2 border-amber-400/50 p-4 sm:p-5">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
            Nota de hardware
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            El módulo IoT requiere hardware físico (sensores de presión, balizas
            BLE, lectores QR, sondas de temperatura, mesas inteligentes). Las
            demostraciones muestran el flujo completo de ingesta, traducción y
            acción. No se simulan datos sin indicar claramente que son demo.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * Main component
 * =======================================================*/
export function FloorIot() {
  const { toast } = useToast();
  const reduce = useReducedMotion();
  const [signalSensor, setSignalSensor] = React.useState<IoTSensor | null>(
    null,
  );
  const [signalOpen, setSignalOpen] = React.useState(false);

  const handleSignal = (s: IoTSensor) => {
    setSignalSensor(s);
    setSignalOpen(true);
  };

  const handleReconfigure = (s: IoTSensor) => {
    toast({
      title: "Reconfiguración iniciada",
      description: `${s.id} — formulario de configuración abierto (demo)`,
    });
  };

  const handleDisconnect = (s: IoTSensor) => {
    toast({
      title: "Desconexión solicitada",
      description: `${s.id} (${s.name}) — pendiente confirmación del supervisor (demo)`,
    });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <section
        aria-labelledby="floor-iot-title"
        className="flex flex-col gap-5"
      >
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                id="floor-iot-title"
                className="font-display text-2xl font-light tracking-tight text-foreground sm:text-3xl"
              >
                IoT y Sensores
              </h2>
              <Badge
                variant="outline"
                className="border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)] text-[10px] font-mono uppercase tracking-wider"
              >
                demo
              </Badge>
              <Badge
                variant="outline"
                className="border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider"
              >
                Pendiente de proveedor
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Ingesta de telemetría en tiempo real. Cada señal se traduce en un
              evento accionable del sistema de sala.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300">
              Stream activo
            </span>
          </div>
        </header>

        {/* Overview stats */}
        <OverviewStats sensors={DEMO_SENSORS} />

        {/* Hardware note */}
        <HardwareNote />

        {/* Sensor grid */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground sm:text-base">
              Sensores desplegados
            </h3>
            <Badge
              variant="outline"
              className="border-border/40 bg-foreground/[0.04] text-muted-foreground text-[10px] font-mono uppercase tracking-wider"
            >
              {DEMO_SENSORS.length} dispositivos
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {DEMO_SENSORS.map((s, i) => (
              <SensorCard
                key={s.id}
                sensor={s}
                index={i}
                reduce={reduce}
                onSignal={() => handleSignal(s)}
                onReconfigure={() => handleReconfigure(s)}
                onDisconnect={() => handleDisconnect(s)}
              />
            ))}
          </div>
        </div>

        {/* Event log */}
        <EventLog events={DEMO_EVENTS} reduce={reduce} />

        {/* Webhook info */}
        <WebhookInfo />

        {/* Signal dialog */}
        <SignalHistoryDialog
          sensor={signalSensor}
          open={signalOpen}
          onOpenChange={setSignalOpen}
        />
      </section>
    </TooltipProvider>
  );
}
