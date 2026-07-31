"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import {
  Database,
  HardDrive,
  Layers,
  Archive,
  ArchiveRestore,
  RotateCcw,
  Download,
  Upload,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  History,
  RefreshCw,
  ShieldCheck,
  Server,
  Globe,
  MapPin,
  Zap,
  Cloud,
  DatabaseBackup,
  Boxes,
  FileArchive,
  FileText,
  Network,
  Cpu,
  Timer,
  Activity,
  TrendingUp,
  Plus,
  Eye,
  Settings2,
  CircleCheck,
  CircleX,
  CloudOff,
  CloudCog,
  ServerCog,
  ServerCrash,
  Workflow,
  Save,
  ListChecks,
  Sparkles,
} from "lucide-react";

/* =====================================================================
 * Tipos compartidos
 * ===================================================================== */

type BackupType = "D1 database" | "R2 objects" | "KV namespace" | "Vectorize index";
type BackupStatus = "success" | "failed" | "partial" | "in-progress";
type BackupFrequency = "Hourly" | "Daily" | "Weekly" | "Monthly";

interface BackupEntry {
  ts: string;
  type: BackupType;
  size: string;
  duration: string;
  status: BackupStatus;
  id: string;
}

interface RestoreHistoryItem {
  ts: string;
  backupDate: string;
  scope: string;
  duration: string;
  initiatedBy: string;
  result: "success" | "failed" | "partial";
  rollbackable: boolean;
}

type RegionStatus = "healthy" | "warning" | "failover";

interface FailoverRegion {
  region: string;
  flag: string;
  target: string;
  mode: "Active-Active" | "Active-Passive";
  healthCheck: string;
  switchTime: string;
  lastTest: string;
  status: RegionStatus;
}

interface Snapshot {
  ts: string;
  size: string;
  type: BackupFrequency;
  status: BackupStatus;
  id: string;
}

interface R2Backup {
  prefix: string;
  size: string;
  versions: number;
  files: { name: string; size: string; modified: string }[];
}

interface KVBackup {
  namespace: string;
  entries: number;
  size: string;
  ts: string;
}

interface VectorizeSnapshot {
  index: string;
  embeddings: number;
  size: string;
  ts: string;
}

/* =====================================================================
 * Utilidades
 * ===================================================================== */

const STATUS_STYLES: Record<BackupStatus, { badge: string; dot: string; label: string }> = {
  success: { badge: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400", label: "Exitoso" },
  failed: { badge: "border-red-400/50 bg-red-400/10 text-red-300", dot: "bg-red-400", label: "Fallido" },
  partial: { badge: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400", label: "Parcial" },
  "in-progress": { badge: "border-sky-400/40 bg-sky-400/10 text-sky-300", dot: "bg-sky-400", label: "En curso" },
};

const TYPE_STYLES: Record<BackupType, string> = {
  "D1 database": "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]",
  "R2 objects": "border-amber-400/40 bg-amber-400/10 text-amber-300",
  "KV namespace": "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
  "Vectorize index": "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
};

const REGION_STATUS_STYLES: Record<RegionStatus, { badge: string; dot: string; label: string }> = {
  healthy: { badge: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400", label: "Sano" },
  warning: { badge: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400", label: "Degradado" },
  failover: { badge: "border-red-400/50 bg-red-400/10 text-red-300", dot: "bg-red-400", label: "Failover" },
};

function TypeIcon({ type, className }: { type: BackupType; className?: string }) {
  const map: Record<BackupType, React.ElementType> = {
    "D1 database": Database,
    "R2 objects": HardDrive,
    "KV namespace": Boxes,
    "Vectorize index": Layers,
  };
  const Icon = map[type];
  return <Icon className={className} aria-hidden />;
}

/* =====================================================================
 * Datos demo — Backups
 * ===================================================================== */

const SCHEDULE: {
  frequency: BackupFrequency;
  type: BackupType;
  schedule: string;
  retention: string;
  lastRun: string;
  status: BackupStatus;
  size: string;
}[] = [
  { frequency: "Hourly", type: "D1 database", schedule: "Cada hora (0 *)", retention: "24 snapshots (1 día)", lastRun: "hace 12 min", status: "success", size: "84 MB" },
  { frequency: "Hourly", type: "R2 objects", schedule: "Cada hora (15 *)", retention: "24 snapshots (1 día)", lastRun: "hace 8 min", status: "success", size: "1.2 GB" },
  { frequency: "Daily", type: "D1 database", schedule: "Diario 03:00 UTC", retention: "7 snapshots (1 semana)", lastRun: "ayer 03:00", status: "success", size: "86 MB" },
  { frequency: "Daily", type: "R2 objects", schedule: "Diario 03:30 UTC", retention: "7 snapshots (1 semana)", lastRun: "ayer 03:30", status: "success", size: "1.4 GB" },
  { frequency: "Daily", type: "KV namespace", schedule: "Diario 04:00 UTC", retention: "7 snapshots (1 semana)", lastRun: "ayer 04:00", status: "success", size: "12 MB" },
  { frequency: "Weekly", type: "D1 database", schedule: "Lunes 02:00 UTC", retention: "4 snapshots (1 mes)", lastRun: "hace 3 días", status: "success", size: "92 MB" },
  { frequency: "Weekly", type: "R2 objects", schedule: "Lunes 02:30 UTC", retention: "4 snapshots (1 mes)", lastRun: "hace 3 días", status: "partial", size: "1.5 GB" },
  { frequency: "Monthly", type: "D1 database", schedule: "Día 1 del mes 01:00 UTC", retention: "12 snapshots (1 año)", lastRun: "hace 18 días", status: "success", size: "98 MB" },
  { frequency: "Monthly", type: "R2 objects", schedule: "Día 1 del mes 01:30 UTC", retention: "12 snapshots (1 año)", lastRun: "hace 18 días", status: "success", size: "1.6 GB" },
];

const RECENT_BACKUPS: BackupEntry[] = [
  { ts: "hace 12 min", type: "D1 database", size: "84 MB", duration: "1m 24s", status: "success", id: "bak_d1_202501211242" },
  { ts: "hace 12 min", type: "R2 objects", size: "1.2 GB", duration: "4m 12s", status: "success", id: "bak_r2_202501211242" },
  { ts: "hace 1 h", type: "D1 database", size: "84 MB", duration: "1m 18s", status: "success", id: "bak_d1_202501211142" },
  { ts: "hace 2 h", type: "D1 database", size: "84 MB", duration: "1m 22s", status: "success", id: "bak_d1_202501211042" },
  { ts: "hace 3 h", type: "R2 objects", size: "1.2 GB", duration: "4m 18s", status: "partial", id: "bak_r2_202501210942" },
  { ts: "ayer 03:00", type: "D1 database", size: "86 MB", duration: "1m 32s", status: "success", id: "bak_d1_202501200300" },
  { ts: "ayer 03:30", type: "R2 objects", size: "1.4 GB", duration: "4m 28s", status: "success", id: "bak_r2_202501200330" },
  { ts: "ayer 04:00", type: "KV namespace", size: "12 MB", duration: "12s", status: "success", id: "bak_kv_202501200400" },
  { ts: "hace 3 días", type: "D1 database", size: "92 MB", duration: "1m 48s", status: "success", id: "bak_d1_202501180200" },
  { ts: "hace 3 días", type: "R2 objects", size: "1.5 GB", duration: "5m 12s", status: "partial", id: "bak_r2_202501180230" },
];

/* =====================================================================
 * Datos demo — Restore history
 * ===================================================================== */

const RESTORE_HISTORY: RestoreHistoryItem[] = [
  { ts: "hace 4 días", backupDate: "2025-01-17 14:00", scope: "Tabla: reservations (org_01HZX8K)", duration: "3m 12s", initiatedBy: "A. Martínez", result: "success", rollbackable: true },
  { ts: "hace 8 días", backupDate: "2025-01-13 09:00", scope: "KV namespace: AVAILABILITY", duration: "12s", initiatedBy: "Sistema (auto)", result: "success", rollbackable: false },
  { ts: "hace 12 días", backupDate: "2025-01-09 02:00", scope: "Org completa: org_01HZX9Y2", duration: "6m 48s", initiatedBy: "P. Núñez", result: "success", rollbackable: false },
  { ts: "hace 18 días", backupDate: "2025-01-03 14:00", scope: "Full database", duration: "5m 42s", initiatedBy: "A. Martínez", result: "success", rollbackable: false },
  { ts: "hace 25 días", backupDate: "2024-12-28 03:00", scope: "Tabla: customers", duration: "2m 18s", initiatedBy: "P. Núñez", result: "partial", rollbackable: false },
];

/* =====================================================================
 * Datos demo — Failover
 * ===================================================================== */

const FAILOVER_REGIONS: FailoverRegion[] = [
  { region: "Europa (EU-West)", flag: "🇪🇺", target: "América Norte (NA-East)", mode: "Active-Active", healthCheck: "5s", switchTime: "~3 min", lastTest: "15 ene · passed", status: "healthy" },
  { region: "América Norte (NA-East)", flag: "🇺🇸", target: "Europa (EU-West)", mode: "Active-Active", healthCheck: "5s", switchTime: "~3 min", lastTest: "15 ene · passed", status: "healthy" },
  { region: "Asia-Pacífico (AP-Southeast)", flag: "🇸🇬", target: "América Norte (NA-East)", mode: "Active-Passive", healthCheck: "10s", switchTime: "~8 min", lastTest: "15 ene · passed", status: "healthy" },
  { region: "Sudamérica (SA-East)", flag: "🇧🇷", target: "América Norte (NA-East)", mode: "Active-Passive", healthCheck: "10s", switchTime: "~9 min", lastTest: "12 ene · passed", status: "warning" },
];

const FAILOVER_SIM_RESULT = {
  source: "Europa (EU-West)",
  target: "América Norte (NA-East)",
  switchTime: "3min 12s",
  lostRequests: 0,
  rpo: "2min (objetivo <5min ✓)",
  rto: "3min 12s (objetivo <15min ✓)",
  impact: "API (3min downtime), D1 (0 downtime, replicated)",
  recovery: "Exitosa · Región Europa reiniciada · Sincronización completada",
};

/* =====================================================================
 * Datos demo — Snapshots
 * ===================================================================== */

const D1_SNAPSHOTS: Snapshot[] = [
  { ts: "hoy 12:42", size: "84 MB", type: "Hourly", status: "success", id: "snap_d1_h_202501211242" },
  { ts: "hoy 11:42", size: "84 MB", type: "Hourly", status: "success", id: "snap_d1_h_202501211142" },
  { ts: "ayer 03:00", size: "86 MB", type: "Daily", status: "success", id: "snap_d1_d_202501200300" },
  { ts: "hace 3 días", size: "92 MB", type: "Weekly", status: "success", id: "snap_d1_w_202501180200" },
  { ts: "hace 18 días", size: "98 MB", type: "Monthly", status: "success", id: "snap_d1_m_202501030100" },
];

const R2_BACKUPS: R2Backup[] = [
  {
    prefix: "exports/d1/2025/01/",
    size: "1.6 GB",
    versions: 21,
    files: [
      { name: "d1_export_20250121.sql.gz", size: "84 MB", modified: "hace 12 min" },
      { name: "d1_export_20250120.sql.gz", size: "86 MB", modified: "ayer" },
      { name: "d1_export_20250119.sql.gz", size: "84 MB", modified: "hace 2 días" },
      { name: "d1_export_20250118.sql.gz", size: "92 MB", modified: "hace 3 días" },
    ],
  },
  {
    prefix: "exports/r2/2025/01/",
    size: "8.4 GB",
    versions: 21,
    files: [
      { name: "r2_export_20250121.tar.gz", size: "1.2 GB", modified: "hace 12 min" },
      { name: "r2_export_20250120.tar.gz", size: "1.4 GB", modified: "ayer" },
      { name: "r2_export_20250119.tar.gz", size: "1.2 GB", modified: "hace 2 días" },
    ],
  },
  {
    prefix: "exports/kv/2025/01/",
    size: "84 MB",
    versions: 21,
    files: [
      { name: "kv_availability_20250121.json.gz", size: "12 MB", modified: "hace 12 min" },
      { name: "kv_availability_20250120.json.gz", size: "12 MB", modified: "ayer" },
      { name: "kv_availability_20250119.json.gz", size: "11 MB", modified: "hace 2 días" },
    ],
  },
  {
    prefix: "exports/audit/2025/01/",
    size: "312 MB",
    versions: 21,
    files: [
      { name: "audit_20250121.jsonl.gz", size: "18 MB", modified: "hace 12 min" },
      { name: "audit_20250120.jsonl.gz", size: "16 MB", modified: "ayer" },
    ],
  },
];

const KV_BACKUPS: KVBackup[] = [
  { namespace: "AVAILABILITY", entries: 12480, size: "12 MB", ts: "ayer 04:00" },
  { namespace: "CONFIG", entries: 412, size: "412 KB", ts: "ayer 04:00" },
];

const VECTORIZE_SNAPSHOT: VectorizeSnapshot = {
  index: "menu-embeddings-prod",
  embeddings: 84200,
  size: "284 MB",
  ts: "ayer 04:00",
};

const RETENTION_POLICY = [
  { freq: "Hourly" as BackupFrequency, count: 24, span: "1 día" },
  { freq: "Daily" as BackupFrequency, count: 7, span: "1 semana" },
  { freq: "Weekly" as BackupFrequency, count: 4, span: "1 mes" },
  { freq: "Monthly" as BackupFrequency, count: 12, span: "1 año" },
];

/* =====================================================================
 * Sub-componentes UI
 * ===================================================================== */

function GlassPanel({
  children,
  className,
  strong,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        strong ? "rp-glass-strong" : "rp-glass",
        "rounded-2xl p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  trend,
  accent = "fg",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  trend?: "up" | "down" | "flat";
  accent?: "gold" | "teal" | "fg" | "red" | "green" | "amber";
}) {
  const colorMap: Record<string, string> = {
    gold: "rp-gold-text",
    teal: "rp-teal-text",
    fg: "text-foreground",
    red: "text-red-300",
    green: "text-emerald-300",
    amber: "text-amber-300",
  };
  const trendIcon =
    trend === "up" ? (
      <TrendingUp className="h-3 w-3 text-emerald-400" aria-hidden />
    ) : trend === "down" ? (
      <RotateCcw className="h-3 w-3 text-red-400" aria-hidden />
    ) : trend === "flat" ? (
      <Activity className="h-3 w-3 text-muted-foreground" aria-hidden />
    ) : null;
  return (
    <GlassPanel className="p-3 sm:p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={cn("font-display text-xl sm:text-2xl font-light", colorMap[accent])}>
          {value}
        </span>
        {trendIcon}
      </div>
      {sub ? <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div> : null}
    </GlassPanel>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: BackupStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider", s.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}

/* =====================================================================
 * TAB: Backups
 * ===================================================================== */

function BackupsTab() {
  const reduce = useReducedMotion();
  const [creating, setCreating] = React.useState(false);

  function createBackup() {
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      toast({
        title: "Backup iniciado (demo)",
        description: "Tipo: Full · Estimado: 2min",
      });
    }, 3000);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Backup status */}
      <GlassPanel strong>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <SectionLabel>Estado de backups & DR</SectionLabel>
          <Button
            onClick={createBackup}
            disabled={creating}
            className="h-9 shrink-0"
          >
            {creating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" aria-hidden />
                Iniciando…
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                Crear backup ahora
              </>
            )}
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rp-glass rounded-xl p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Último backup</div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden />
              <span className="text-sm font-medium text-foreground">hace 12min</span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">D1 + R2 · Exitoso</div>
          </div>
          <div className="rp-glass rounded-xl p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Próximo backup</div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[var(--teal)]" aria-hidden />
              <span className="text-sm font-medium text-foreground">en 48min</span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">Hourly · D1 + R2</div>
          </div>
          <div className="rp-glass rounded-xl p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Frecuencia</div>
            <div className="mt-1.5 text-sm font-medium text-foreground">Cada hora</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">Hourly + Daily + Weekly + Monthly</div>
          </div>
          <div className="rp-glass rounded-xl p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Backups almacenados</div>
            <div className="mt-1.5 text-sm font-medium text-[var(--gold-soft)]">847</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">12.4 GB usados en R2</div>
          </div>
        </div>
      </GlassPanel>

      {/* Backup schedule */}
      <GlassPanel>
        <SectionLabel>Programación de backups</SectionLabel>
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Frecuencia", "Tipo", "Programa", "Retención", "Última", "Estado", "Tamaño"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((s, i) => (
                <motion.tr
                  key={i}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduce ? 0 : i * 0.03 }}
                  className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025]"
                >
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      {s.frequency === "Hourly" ? <Clock className="h-3 w-3 text-muted-foreground" aria-hidden /> :
                       s.frequency === "Daily" ? <Timer className="h-3 w-3 text-muted-foreground" aria-hidden /> :
                       s.frequency === "Weekly" ? <History className="h-3 w-3 text-muted-foreground" aria-hidden /> :
                       <Archive className="h-3 w-3 text-muted-foreground" aria-hidden />}
                      <span className="font-medium text-foreground">{s.frequency}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono", TYPE_STYLES[s.type])}>
                      <TypeIcon type={s.type} className="h-2.5 w-2.5" />
                      {s.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{s.schedule}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.retention}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{s.lastRun}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={s.status} /></td>
                  <td className="px-3 py-2.5 font-mono text-foreground">{s.size}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* Recent backups */}
      <GlassPanel>
        <SectionLabel>Backups recientes ({RECENT_BACKUPS.length})</SectionLabel>
        <ul className="divide-y divide-border/40 max-h-[460px] overflow-y-auto rp-scroll-thin">
          {RECENT_BACKUPS.map((b, i) => (
            <li key={i} className="py-2.5 flex items-center gap-3 flex-wrap text-xs">
              <code className="font-mono text-[10px] text-muted-foreground shrink-0 hidden sm:inline">{b.id}</code>
              <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono shrink-0", TYPE_STYLES[b.type])}>
                <TypeIcon type={b.type} className="h-2.5 w-2.5" />
                {b.type}
              </span>
              <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
                <span className="text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden />
                  {b.ts}
                </span>
                <span className="font-mono text-foreground">{b.size}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{b.duration}</span>
              </div>
              <StatusBadge status={b.status} />
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px]"
                  onClick={() => toast({ title: `Restaurar ${b.id} (demo)`, description: "Iniciando wizard de restauración…" })}
                >
                  <ArchiveRestore className="h-3 w-3 mr-1" aria-hidden />
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => toast({ title: `Descarga iniciada (demo)`, description: `${b.id} · ${b.size}` })}
                  aria-label="Descargar"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </GlassPanel>

      {/* Backup verification */}
      <GlassPanel>
        <SectionLabel>Verificación de restauración</SectionLabel>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-400/15 text-emerald-300">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Última verificación: 15 ene</div>
              <div className="text-[11px] text-muted-foreground">Tiempo: 6min · Resultado: <span className="text-emerald-300">Passed ✓</span></div>
            </div>
          </div>
          <div className="flex-1 min-w-[200px] rp-glass rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
            Cada backup semanal se restaura en un entorno aislado para validar integridad, schema y consistencia referencial. Última verificación: 6 min · 12 tablas · 8.2M filas · 0 errores.
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0"
            onClick={() => toast({ title: "Verificación programada (demo)", description: "Se ejecutará esta noche 03:00 UTC" })}
          >
            <Play className="h-3 w-3 mr-1.5" aria-hidden />
            Ejecutar ahora
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}

/* =====================================================================
 * TAB: Restauración
 * ===================================================================== */

function RestorationTab() {
  const reduce = useReducedMotion();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [selectedBackup, setSelectedBackup] = React.useState<string>(RECENT_BACKUPS[0].id);
  const [scope, setScope] = React.useState<"full" | "tables" | "org">("full");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [restoring, setRestoring] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [pitrOpen, setPitrOpen] = React.useState(false);

  const selected = RECENT_BACKUPS.find((b) => b.id === selectedBackup) ?? RECENT_BACKUPS[0];

  function executeRestore() {
    setConfirmOpen(false);
    setRestoring(true);
    setResult(null);
    setTimeout(() => {
      setRestoring(false);
      setResult("Restauración completada en 5min 42s · 0 errores");
      setStep(1);
      toast({ title: "Restauración completada (demo)", description: "5min 42s · 0 errores" });
    }, 3500);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Restore wizard */}
      <GlassPanel strong>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <SectionLabel>Asistente de restauración</SectionLabel>
          <Button variant="outline" size="sm" className="h-8" onClick={() => setPitrOpen(true)}>
            <History className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Point-in-time recovery (D1 Time Travel)
          </Button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto rp-scroll-thin pb-1">
          {[
            { n: 1, label: "Seleccionar backup" },
            { n: 2, label: "Seleccionar scope" },
            { n: 3, label: "Confirmar" },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setStep(s.n as 1 | 2 | 3)}
                className={cn(
                  "min-h-[36px] inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-colors",
                  step === s.n
                    ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                    : step > s.n
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                    : "border-border/60 text-muted-foreground",
                )}
                aria-current={step === s.n ? "step" : undefined}
              >
                <span className={cn(
                  "flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-mono",
                  step === s.n ? "bg-[var(--gold)] text-black" : step > s.n ? "bg-emerald-400 text-black" : "bg-foreground/10",
                )}>
                  {step > s.n ? <CheckCircle2 className="h-3 w-3" aria-hidden /> : s.n}
                </span>
                <span className="font-medium">{s.label}</span>
              </button>
              {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Backup a restaurar</label>
                <Select value={selectedBackup} onValueChange={setSelectedBackup}>
                  <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RECENT_BACKUPS.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.id} · {b.type} · {b.size} · {b.ts}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="rp-glass rounded-lg p-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div><div className="text-[10px] font-mono uppercase text-muted-foreground">ID</div><div className="font-mono text-foreground mt-0.5">{selected.id}</div></div>
                    <div><div className="text-[10px] font-mono uppercase text-muted-foreground">Tipo</div><div className="text-foreground mt-0.5">{selected.type}</div></div>
                    <div><div className="text-[10px] font-mono uppercase text-muted-foreground">Tamaño</div><div className="font-mono text-foreground mt-0.5">{selected.size}</div></div>
                    <div><div className="text-[10px] font-mono uppercase text-muted-foreground">Fecha</div><div className="text-foreground mt-0.5">{selected.ts}</div></div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} className="h-9">
                    Continuar
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Alcance de la restauración</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {([
                    { id: "full", label: "Base de datos completa", desc: "Restaura todo el D1", icon: Database },
                    { id: "tables", label: "Tablas específicas", desc: "Selecciona tablas concretas", icon: ListChecks },
                    { id: "org", label: "Organización específica", desc: "Restaura una sola org", icon: Server },
                  ] as const).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setScope(opt.id)}
                      className={cn(
                        "text-left rounded-lg border p-3 transition-colors min-h-[88px]",
                        scope === opt.id
                          ? "border-[var(--gold)]/50 bg-[var(--gold)]/10"
                          : "border-border/60 hover:bg-foreground/[0.025]",
                      )}
                      aria-pressed={scope === opt.id}
                    >
                      <opt.icon className={cn("h-4 w-4 mb-2", scope === opt.id ? "text-[var(--gold)]" : "text-muted-foreground")} aria-hidden />
                      <div className="text-sm font-medium text-foreground">{opt.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                {scope === "tables" && (
                  <div className="rp-glass rounded-lg p-3 text-xs text-muted-foreground">
                    Tablas seleccionadas: <code className="font-mono text-foreground">reservations</code>, <code className="font-mono text-foreground">customers</code> · demás excluidas.
                  </div>
                )}
                {scope === "org" && (
                  <div className="rp-glass rounded-lg p-3 text-xs text-muted-foreground">
                    Org seleccionada: <code className="font-mono text-foreground">org_01HZX8K7Y9</code> · Ramses Group · 1 local.
                  </div>
                )}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-9">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                    Atrás
                  </Button>
                  <Button onClick={() => setStep(3)} className="h-9">
                    Continuar
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div className="rp-glass rounded-lg p-3 border-l-2 border-amber-400/50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-300" aria-hidden />
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-300">Impacto de la restauración</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Esto reemplazará los datos actuales con el backup de <span className="font-mono text-foreground">{selected.ts}</span>.
                    Alcance: <span className="text-foreground">{scope === "full" ? "toda la base de datos · todas las organizaciones" : scope === "tables" ? "tablas específicas" : "una organización"}</span>.
                    Estimación de duración: <span className="text-foreground">6min</span>.
                  </p>
                </div>
                <div className="rp-glass rounded-lg p-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div><div className="text-[10px] font-mono uppercase text-muted-foreground">Backup</div><div className="font-mono text-foreground mt-0.5 text-[11px]">{selected.id}</div></div>
                    <div><div className="text-[10px] font-mono uppercase text-muted-foreground">Alcance</div><div className="text-foreground mt-0.5">{scope === "full" ? "Full DB" : scope === "tables" ? "Tablas" : "Org"}</div></div>
                    <div><div className="text-[10px] font-mono uppercase text-muted-foreground">Estimación</div><div className="text-foreground mt-0.5">~6min</div></div>
                  </div>
                </div>
                {restoring && (
                  <div className="rp-glass rounded-lg p-3 flex items-center gap-2 text-xs">
                    <RefreshCw className="h-3.5 w-3.5 text-[var(--teal)] animate-spin" aria-hidden />
                    <span className="text-foreground">Restaurando… esto puede tardar varios minutos.</span>
                  </div>
                )}
                {result && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rp-glass rounded-lg p-3 border-l-2 border-emerald-400/50 flex items-center gap-2 text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden />
                    <span className="text-foreground">{result}</span>
                  </motion.div>
                )}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} className="h-9" disabled={restoring}>
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                    Atrás
                  </Button>
                  <Button
                    onClick={() => setConfirmOpen(true)}
                    disabled={restoring}
                    className="h-9"
                  >
                    <ArchiveRestore className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                    Ejecutar restauración
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </GlassPanel>

      {/* Restore history */}
      <GlassPanel>
        <SectionLabel>Historial de restauraciones ({RESTORE_HISTORY.length})</SectionLabel>
        <ul className="divide-y divide-border/40">
          {RESTORE_HISTORY.map((r, i) => (
            <li key={i} className="py-2.5 flex items-center gap-3 flex-wrap text-xs">
              <span className="font-mono text-muted-foreground w-28 shrink-0 hidden sm:inline">{r.ts}</span>
              <div className="flex-1 min-w-0">
                <div className="text-foreground/85 truncate">{r.scope}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Backup: <span className="font-mono">{r.backupDate}</span> · {r.duration} · por {r.initiatedBy}
                </div>
              </div>
              <span className={cn(
                "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                r.result === "success" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" :
                r.result === "partial" ? "border-amber-400/40 bg-amber-400/10 text-amber-300" :
                "border-red-400/50 bg-red-400/10 text-red-300",
              )}>
                {r.result === "success" ? <CircleCheck className="h-3 w-3" aria-hidden /> : <CircleX className="h-3 w-3" aria-hidden />}
                {r.result}
              </span>
              {r.rollbackable && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px]"
                  onClick={() => toast({ title: `Rollback iniciado (demo)`, description: `Revertir restauración de ${r.backupDate}` })}
                >
                  <RotateCcw className="h-3 w-3 mr-1" aria-hidden />
                  Rollback
                </Button>
              )}
            </li>
          ))}
        </ul>
      </GlassPanel>

      <p className="text-[11px] text-muted-foreground">
        Time Travel permite recuperar datos hasta 30 días atrás. Para retención mayor, se usan exports cifrados en R2.
      </p>

      {/* Confirm dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-300" aria-hidden />
              Confirmar restauración
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esto reemplazará los datos actuales con el backup seleccionado. La operación es irreversible, pero se creará un snapshot del estado previo para rollback (24h).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rp-glass rounded-lg p-3 text-xs space-y-1 my-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Backup:</span><span className="font-mono text-foreground">{selected.id}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Alcance:</span><span className="text-foreground">{scope === "full" ? "Full DB · todas las orgs" : scope === "tables" ? "Tablas específicas" : "Organización específica"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Estimación:</span><span className="text-foreground">~6min</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Snapshot previo:</span><span className="text-emerald-300">Sí · 24h rollback</span></div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeRestore}>
              <ArchiveRestore className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Restaurar ahora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Point-in-time recovery dialog */}
      <Dialog open={pitrOpen} onOpenChange={setPitrOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4 text-[var(--gold)]" aria-hidden />
              Point-in-time recovery · D1 Time Travel
            </DialogTitle>
            <DialogDescription>
              Recupera datos hasta 30 días atrás. Selecciona timestamp y alcance para previsualizar qué datos se recuperarían.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Fecha</label>
                <Input type="date" defaultValue="2025-01-15" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Hora (UTC)</label>
                <Input type="time" defaultValue="14:30" className="h-9 text-sm font-mono" />
              </div>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Alcance</label>
              <Select defaultValue="full">
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Base de datos completa</SelectItem>
                  <SelectItem value="tables">Tablas específicas</SelectItem>
                  <SelectItem value="org">Organización específica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rp-glass rounded-lg p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Datos que se recuperarían</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><div className="text-[10px] text-muted-foreground">Reservas</div><div className="font-mono text-foreground">312.4808</div></div>
                <div><div className="text-[10px] text-muted-foreground">Clientes</div><div className="font-mono text-foreground">8.412</div></div>
                <div><div className="text-[10px] text-muted-foreground">Audit logs</div><div className="font-mono text-foreground">428.182</div></div>
                <div><div className="text-[10px] text-muted-foreground">Orgs</div><div className="font-mono text-foreground">128</div></div>
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground italic">Vista previa · datos en timestamp 2025-01-15 14:30 UTC</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPitrOpen(false)}>Cancelar</Button>
            <Button onClick={() => { setPitrOpen(false); toast({ title: "Time Travel iniciado (demo)", description: "Restauración en background" }); }}>
              <History className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Restaurar a este punto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =====================================================================
 * TAB: Failover
 * ===================================================================== */

function FailoverTab() {
  const reduce = useReducedMotion();
  const [simRegion, setSimRegion] = React.useState<string>("eu");
  const [simulating, setSimulating] = React.useState(false);
  const [simResult, setSimResult] = React.useState<typeof FAILOVER_SIM_RESULT | null>(null);
  const [realFailoverOpen, setRealFailoverOpen] = React.useState(false);

  function runSimulation() {
    setSimulating(true);
    setSimResult(null);
    setTimeout(() => {
      setSimulating(false);
      setSimResult(FAILOVER_SIM_RESULT);
      toast({ title: "Simulación completada (demo)", description: "Failover Europa → NA-East · 3min 12s" });
    }, 3000);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Failover status */}
      <GlassPanel strong>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <SectionLabel>Estado de failover multi-región</SectionLabel>
          <Button variant="outline" size="sm" className="h-8" onClick={() => toast({ title: "Test de failover programado (demo)", description: "Se ejecutará en ventana de baja carga" })}>
            <Play className="h-3 w-3 mr-1.5" aria-hidden />
            Programar test
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rp-glass rounded-xl p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Topología</div>
            <div className="mt-1.5 text-sm font-medium text-foreground">Active-Active</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">4 regiones</div>
          </div>
          <div className="rp-glass rounded-xl p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Failovers activos</div>
            <div className="mt-1.5 text-sm font-medium text-emerald-300">0</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">todas las regiones OK</div>
          </div>
          <div className="rp-glass rounded-xl p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Último test</div>
            <div className="mt-1.5 text-sm font-medium text-foreground">15 ene</div>
            <div className="mt-0.5 text-[11px] text-emerald-300">passed ✓</div>
          </div>
          <div className="rp-glass rounded-xl p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">RPO objetivo</div>
            <div className="mt-1.5 text-sm font-medium text-[var(--gold-soft)]">&lt;5min</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">RTO objetivo &lt;15min</div>
          </div>
        </div>
      </GlassPanel>

      {/* Failover matrix */}
      <GlassPanel>
        <SectionLabel>Matriz de failover por región</SectionLabel>
        <div className="overflow-x-auto rp-scroll-thin">
          <table className="w-full text-xs border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Región", "Destino failover", "Modo", "Health check", "Switch (est.)", "Último test", "Estado"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FAILOVER_REGIONS.map((r, i) => (
                <motion.tr
                  key={r.region}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduce ? 0 : i * 0.05 }}
                  className="border-b border-border/40 last:border-0 hover:bg-foreground/[0.025]"
                >
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-muted-foreground" aria-hidden />
                      <span className="mr-1">{r.flag}</span>
                      <span className="font-medium text-foreground whitespace-nowrap">{r.region}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground whitespace-nowrap">
                      <ArrowRight className="h-3 w-3 text-[var(--teal)]" aria-hidden />
                      <span className="mr-1">{FAILOVER_REGIONS.find((x) => x.region === r.target)?.flag}</span>
                      <span>{r.target}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn(
                      "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                      r.mode === "Active-Active" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-amber-400/40 bg-amber-400/10 text-amber-300",
                    )}>
                      {r.mode}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{r.healthCheck}</td>
                  <td className="px-3 py-2.5 font-mono text-foreground">{r.switchTime}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{r.lastTest}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider", REGION_STATUS_STYLES[r.status].badge)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", REGION_STATUS_STYLES[r.status].dot)} aria-hidden />
                      {REGION_STATUS_STYLES[r.status].label}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* Failover simulation */}
      <GlassPanel strong>
        <SectionLabel>Simulación de failover (interactiva)</SectionLabel>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Select value={simRegion} onValueChange={setSimRegion}>
            <SelectTrigger className="h-9 w-full sm:w-[260px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="eu">🇪🇺 Europa (EU-West) → 🇺🇸 NA-East</SelectItem>
              <SelectItem value="na">🇺🇸 NA-East → 🇪🇺 Europa (EU-West)</SelectItem>
              <SelectItem value="ap">🇸🇬 AP-Southeast → 🇺🇸 NA-East</SelectItem>
              <SelectItem value="sa">🇧🇷 SA-East → 🇺🇸 NA-East</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={runSimulation}
            disabled={simulating}
            className="h-9 shrink-0"
          >
            {simulating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" aria-hidden />
                Simulando…
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                Iniciar simulación
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setRealFailoverOpen(true)}
            className="h-9 shrink-0 border-red-400/40 text-red-300 hover:bg-red-400/10"
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Ejecutar failover real
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {simResult && (
            <motion.div
              key="sim-result"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rp-glass rounded-xl p-4 border-l-2 border-[var(--gold)]/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--gold)]/15 text-[var(--gold)]">
                  <ServerCog className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Simulación de failover: {simResult.source} → {simResult.target}</div>
                  <div className="text-[11px] text-muted-foreground">Completado · autorecuperación exitosa</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rp-glass rounded-lg p-3">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5">Métricas verificadas</div>
                  <dl className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Tiempo de switch</dt>
                      <dd className="font-mono text-foreground">{simResult.switchTime}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Requests perdidas</dt>
                      <dd className="font-mono text-emerald-300">{simResult.lostRequests}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">RPO</dt>
                      <dd className="font-mono text-emerald-300">{simResult.rpo}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">RTO</dt>
                      <dd className="font-mono text-emerald-300">{simResult.rto}</dd>
                    </div>
                  </dl>
                </div>
                <div className="rp-glass rounded-lg p-3">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5">Servicios afectados</div>
                  <p className="text-xs text-foreground/85 leading-relaxed">{simResult.impact}</p>
                  <div className="mt-2 pt-2 border-t border-border/40">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Autorecuperación</div>
                    <p className="text-xs text-emerald-300 leading-relaxed">{simResult.recovery}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>

      {/* Real failover confirm */}
      <AlertDialog open={realFailoverOpen} onOpenChange={setRealFailoverOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-300">
              <AlertCircle className="h-4 w-4" aria-hidden />
              ADVERTENCIA · Failover real
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esto iniciará un failover <span className="text-foreground font-medium">real</span> de la región seleccionada. Solo para Super Admin en caso de emergencia. Los usuarios de la región origen experimentarán desconexión temporal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rp-glass rounded-lg p-3 text-xs space-y-1 my-2 border-l-2 border-red-400/60">
            <div className="flex justify-between"><span className="text-muted-foreground">Región origen:</span><span className="font-mono text-foreground">Europa (EU-West)</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Destino:</span><span className="font-mono text-foreground">NA-East</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Switch estimado:</span><span className="font-mono text-foreground">~3 min</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Usuarios afectados:</span><span className="text-amber-300">~ 2.4K activos</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Permisos:</span><span className="text-red-300">Super Admin requerido</span></div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setRealFailoverOpen(false);
                toast({
                  title: "Failover real iniciado (demo)",
                  description: "ADVERTENCIA · Esto es una demostración · No se ejecuta realmente",
                });
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Zap className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Confirmar failover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* =====================================================================
 * TAB: Snapshots
 * ===================================================================== */

function SnapshotsTab() {
  const [retentionOpen, setRetentionOpen] = React.useState(false);
  const [browseR2, setBrowseR2] = React.useState<R2Backup | null>(null);

  return (
    <div className="flex flex-col gap-5">
      {/* D1 snapshots */}
      <GlassPanel>
        <SectionLabel>
          <span className="inline-flex items-center gap-2">
            <Database className="h-3 w-3" aria-hidden />
            D1 snapshots ({D1_SNAPSHOTS.length})
          </span>
        </SectionLabel>
        <ul className="divide-y divide-border/40">
          {D1_SNAPSHOTS.map((s, i) => (
            <li key={i} className="py-2.5 flex items-center gap-3 flex-wrap text-xs">
              <code className="font-mono text-[10px] text-muted-foreground shrink-0 hidden sm:inline">{s.id}</code>
              <span className="font-mono text-[var(--gold-soft)] shrink-0 w-28">{s.ts}</span>
              <span className={cn(
                "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider shrink-0",
                s.type === "Hourly" ? "border-sky-400/40 bg-sky-400/10 text-sky-300" :
                s.type === "Daily" ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]" :
                s.type === "Weekly" ? "border-amber-400/40 bg-amber-400/10 text-amber-300" :
                "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]",
              )}>
                {s.type}
              </span>
              <span className="font-mono text-foreground shrink-0">{s.size}</span>
              <div className="flex-1" />
              <StatusBadge status={s.status} />
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px]"
                onClick={() => toast({ title: `Restaurar ${s.id} (demo)`, description: "Iniciando wizard de restauración…" })}
              >
                <ArchiveRestore className="h-3 w-3 mr-1" aria-hidden />
                Restore
              </Button>
            </li>
          ))}
        </ul>
      </GlassPanel>

      {/* R2 object versions */}
      <GlassPanel>
        <SectionLabel>
          <span className="inline-flex items-center gap-2">
            <HardDrive className="h-3 w-3" aria-hidden />
            R2 object versions ({R2_BACKUPS.length})
          </span>
        </SectionLabel>
        <ul className="divide-y divide-border/40">
          {R2_BACKUPS.map((b, i) => (
            <li key={i} className="py-2.5 flex items-center gap-3 flex-wrap text-xs">
              <code className="font-mono text-[10px] text-[var(--teal)] shrink-0">{b.prefix}</code>
              <span className="font-mono text-foreground shrink-0">{b.size}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{b.versions} versiones</span>
              <div className="flex-1" />
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px]"
                onClick={() => setBrowseR2(b)}
              >
                <Eye className="h-3 w-3 mr-1" aria-hidden />
                Browse
              </Button>
            </li>
          ))}
        </ul>
      </GlassPanel>

      {/* KV backups */}
      <GlassPanel>
        <SectionLabel>
          <span className="inline-flex items-center gap-2">
            <Boxes className="h-3 w-3" aria-hidden />
            KV backups ({KV_BACKUPS.length})
          </span>
        </SectionLabel>
        <ul className="divide-y divide-border/40">
          {KV_BACKUPS.map((k, i) => (
            <li key={i} className="py-2.5 flex items-center gap-3 flex-wrap text-xs">
              <code className="font-mono text-fuchsia-300 shrink-0">{k.namespace}</code>
              <span className="font-mono text-foreground shrink-0">{k.entries.toLocaleString("es-ES")} entries</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-mono text-foreground shrink-0">{k.size}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground shrink-0">{k.ts}</span>
              <div className="flex-1" />
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px]"
                onClick={() => toast({ title: `Restaurar KV ${k.namespace} (demo)`, description: `${k.entries} entries` })}
              >
                <ArchiveRestore className="h-3 w-3 mr-1" aria-hidden />
                Restore
              </Button>
            </li>
          ))}
        </ul>
      </GlassPanel>

      {/* Vectorize index snapshots */}
      <GlassPanel>
        <SectionLabel>
          <span className="inline-flex items-center gap-2">
            <Layers className="h-3 w-3" aria-hidden />
            Vectorize index snapshots
          </span>
        </SectionLabel>
        <div className="flex items-center gap-3 flex-wrap text-xs py-1">
          <code className="font-mono text-[var(--gold-soft)] shrink-0">{VECTORIZE_SNAPSHOT.index}</code>
          <span className="font-mono text-foreground shrink-0">{VECTORIZE_SNAPSHOT.embeddings.toLocaleString("es-ES")} embeddings</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-mono text-foreground shrink-0">{VECTORIZE_SNAPSHOT.size}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground shrink-0">{VECTORIZE_SNAPSHOT.ts}</span>
          <div className="flex-1" />
          <StatusBadge status="success" />
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            onClick={() => toast({ title: `Restaurar Vectorize ${VECTORIZE_SNAPSHOT.index} (demo)`, description: `${VECTORIZE_SNAPSHOT.embeddings} embeddings` })}
          >
            <ArchiveRestore className="h-3 w-3 mr-1" aria-hidden />
            Restore
          </Button>
        </div>
      </GlassPanel>

      {/* Retention policy (collapsible) */}
      <Collapsible open={retentionOpen} onOpenChange={setRetentionOpen}>
        <GlassPanel>
          <CollapsibleTrigger className="w-full flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-[var(--gold)]" aria-hidden />
              <span className="text-sm font-medium text-foreground">Política de retención</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", retentionOpen && "rotate-180")} aria-hidden />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {RETENTION_POLICY.map((r) => (
                <div key={r.freq} className="rp-glass rounded-lg p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{r.freq}</div>
                  <div className="mt-1 text-lg font-display text-foreground">{r.count}</div>
                  <div className="text-[11px] text-muted-foreground">snapshots · {r.span}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-[11px] text-muted-foreground flex-1 min-w-[200px]">
                Política agregada: 24 hourly + 7 daily + 4 weekly + 12 monthly = <span className="text-foreground">47 snapshots</span> por tipo · retención máxima 1 año.
              </p>
              <Button variant="outline" size="sm" className="h-8" onClick={() => toast({ title: "Configuración de retención (demo)", description: "Cambios guardados" })}>
                <Settings2 className="h-3 w-3 mr-1.5" aria-hidden />
                Configurar retención
              </Button>
            </div>
          </CollapsibleContent>
        </GlassPanel>
      </Collapsible>

      {/* Storage cost */}
      <GlassPanel>
        <SectionLabel>Coste de almacenamiento</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rp-glass rounded-lg p-3">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Usado</div>
            <div className="mt-1 text-lg font-display text-[var(--gold-soft)]">12.4 GB</div>
          </div>
          <div className="rp-glass rounded-lg p-3">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Coste / mes</div>
            <div className="mt-1 text-lg font-display text-foreground">€62</div>
          </div>
          <div className="rp-glass rounded-lg p-3">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Crecimiento</div>
            <div className="mt-1 text-lg font-display text-amber-300 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden />
              +2.1% / mes
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* R2 browse dialog */}
      <Dialog open={!!browseR2} onOpenChange={(o) => !o && setBrowseR2(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono text-sm">
              <HardDrive className="h-4 w-4 text-[var(--teal)]" aria-hidden />
              {browseR2?.prefix}
            </DialogTitle>
            <DialogDescription>
              {browseR2?.versions} versiones · {browseR2?.size} total
            </DialogDescription>
          </DialogHeader>
          {browseR2 && (
            <div className="py-2 max-h-[50vh] overflow-y-auto rp-scroll-thin">
              <ul className="divide-y divide-border/40">
                {browseR2.files.map((f, i) => (
                  <li key={i} className="py-2 flex items-center gap-3 text-xs">
                    <FileArchive className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
                    <code className="font-mono text-foreground flex-1 min-w-0 truncate">{f.name}</code>
                    <span className="font-mono text-muted-foreground shrink-0">{f.size}</span>
                    <span className="text-muted-foreground shrink-0 hidden sm:inline">{f.modified}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 shrink-0"
                      onClick={() => toast({ title: `Descarga iniciada (demo)`, description: f.name })}
                      aria-label="Descargar"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrowseR2(null)}>Cerrar</Button>
            <Button onClick={() => { setBrowseR2(null); toast({ title: "Restauración masiva (demo)", description: "Selecciona scope en el wizard" }); }}>
              <ArchiveRestore className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Restaurar este prefijo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =====================================================================
 * Componente principal
 * ===================================================================== */

type BkpTab = "backups" | "restore" | "failover" | "snapshots";

const TABS: { id: BkpTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: "backups", label: "Backups", icon: DatabaseBackup, description: "Estado, programación, verificación y backup on-demand" },
  { id: "restore", label: "Restauración", icon: ArchiveRestore, description: "Wizard de 3 pasos, historial y point-in-time recovery (Time Travel)" },
  { id: "failover", label: "Failover", icon: Globe, description: "Matriz multi-región, simulación interactiva y failover real" },
  { id: "snapshots", label: "Snapshots", icon: Archive, description: "D1, R2, KV y Vectorize · retención y coste de almacenamiento" },
];

export function CloudOpsBackup() {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<BkpTab>("backups");

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-black ring-1 ring-[var(--gold)]/40 shrink-0">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-medium tracking-tight truncate">
                Backups & DR
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300">
                demo
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                RPO &lt;5min · RTO &lt;15min
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Backup & Disaster Recovery ·{" "}
              <span className="text-[var(--gold-soft)]">D1 + R2 + KV + Vectorize</span>
              <span className="mx-1.5">·</span>
              <span className="text-[var(--teal)]">4 regiones Active-Active</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => toast({ title: "Estado refrescado (demo)", description: "Backups y DR · OK" })}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto rp-scroll-thin -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 min-h-[44px] inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors",
              tab === t.id
                ? "border-[var(--gold)]/50 bg-[var(--gold)]/15 text-[var(--gold-soft)]"
                : "border-border/60 bg-foreground/[0.02] text-muted-foreground hover:text-foreground hover:border-foreground/30",
            )}
            aria-pressed={tab === t.id}
          >
            <t.icon className="h-4 w-4" aria-hidden />
            <span className="font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab description */}
      <div className="text-xs text-muted-foreground -mt-2">
        {TABS.find((t) => t.id === tab)?.description}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "backups" && <BackupsTab />}
          {tab === "restore" && <RestorationTab />}
          {tab === "failover" && <FailoverTab />}
          {tab === "snapshots" && <SnapshotsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
