"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Database, Upload, FileText, Search, Activity, BarChart3,
  CheckCircle2, Clock, AlertTriangle, Trash2, RefreshCw, Download,
  Eye, HardDrive, Zap, Cpu, Layers, ShieldCheck, FileWarning,
  ChevronRight, Sparkles, TrendingUp, Server, Hash, Gauge,
} from "lucide-react";

/* ============================================================
   Types
============================================================ */

type DocumentStatus = "indexed" | "processing" | "pending" | "error";
type DocumentType =
  | "menu" | "policy" | "manual" | "faq"
  | "procedure" | "location_info" | "custom";

interface KnowledgeDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  storageKey: string;
  status: DocumentStatus;
  chunks: number;
  embeddings: number;
  uploadedBy: string;
  uploadedAt: string;
  indexedAt?: string;
  version: number;
  checksum: string;
  error?: string;
}

interface SearchResult {
  id: string;
  docId: string;
  docName: string;
  docType: DocumentType;
  snippet: string;
  matchStart: number;
  matchEnd: number;
  similarity: number; // 0-1
  chunkIndex: number;
}

interface PipelineStep {
  id: number;
  label: string;
  detail: string;
  icon: React.ElementType;
  done: boolean;
}

interface PipelineLogEntry {
  id: string;
  ts: string;
  doc: string;
  steps: number;
  duration: string;
  result: "ok" | "error";
  message?: string;
}

/* ============================================================
   Demo data
============================================================ */

const DOC_TYPE_META: Record<
  DocumentType,
  { label: string; cls: string }
> = {
  menu: { label: "Menu", cls: "border-[var(--gold)]/45 bg-[var(--gold)]/12 text-[var(--gold-soft)]" },
  policy: { label: "Política", cls: "border-[var(--teal)]/45 bg-[var(--teal)]/12 text-[var(--teal)]" },
  manual: { label: "Manual", cls: "border-sky-400/40 bg-sky-400/10 text-sky-300" },
  faq: { label: "FAQ", cls: "border-amber-400/45 bg-amber-400/12 text-amber-300" },
  procedure: { label: "Procedimiento", cls: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300" },
  location_info: { label: "Info local", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  custom: { label: "Custom", cls: "border-foreground/25 bg-foreground/8 text-muted-foreground" },
};

const STATUS_META: Record<
  DocumentStatus,
  { label: string; cls: string; icon: React.ElementType }
> = {
  indexed: { label: "Indexado", cls: "border-emerald-400/45 bg-emerald-400/12 text-emerald-300", icon: CheckCircle2 },
  processing: { label: "Procesando", cls: "border-amber-400/45 bg-amber-400/12 text-amber-300", icon: RefreshCw },
  pending: { label: "Pendiente", cls: "border-foreground/25 bg-foreground/8 text-muted-foreground", icon: Clock },
  error: { label: "Error", cls: "border-destructive/50 bg-destructive/12 text-destructive", icon: AlertTriangle },
};

const DEMO_DOCUMENTS: KnowledgeDocument[] = [
  { id: "d1", name: "menu-navidad-2024.pdf", type: "menu", size: 245_000, storageKey: "orgs/org_001/ai-knowledge/d1", status: "indexed", chunks: 12, embeddings: 12, uploadedBy: "Lucía M.", uploadedAt: "12 dic 2024", indexedAt: "12 dic 2024 · 14:02", version: 2, checksum: "a3f9…b21c" },
  { id: "d2", name: "politica-cancelacion.md", type: "policy", size: 8_000, storageKey: "orgs/org_001/ai-knowledge/d2", status: "indexed", chunks: 3, embeddings: 3, uploadedBy: "Carlos R.", uploadedAt: "4 ene 2025", indexedAt: "4 ene 2025 · 09:18", version: 1, checksum: "7c1e…d4f0" },
  { id: "d3", name: "manual-camareros.pdf", type: "manual", size: 1_200_000, storageKey: "orgs/org_001/ai-knowledge/d3", status: "indexed", chunks: 45, embeddings: 45, uploadedBy: "Marta V.", uploadedAt: "20 nov 2024", indexedAt: "20 nov 2024 · 11:44", version: 3, checksum: "9b22…01ae" },
  { id: "d4", name: "faq-clientes.txt", type: "faq", size: 15_000, storageKey: "orgs/org_001/ai-knowledge/d4", status: "indexed", chunks: 8, embeddings: 8, uploadedBy: "Lucía M.", uploadedAt: "8 ene 2025", indexedAt: "8 ene 2025 · 16:30", version: 1, checksum: "2d8a…c77b" },
  { id: "d5", name: "procedimiento-limpieza.md", type: "procedure", size: 12_000, storageKey: "orgs/org_001/ai-knowledge/d5", status: "processing", chunks: 0, embeddings: 0, uploadedBy: "Carlos R.", uploadedAt: "hace 1 min", version: 1, checksum: "f51c…9e02" },
  { id: "d6", name: "info-terraza.pdf", type: "location_info", size: 340_000, storageKey: "orgs/org_001/ai-knowledge/d6", status: "indexed", chunks: 6, embeddings: 6, uploadedBy: "Marta V.", uploadedAt: "2 ene 2025", indexedAt: "2 ene 2025 · 10:12", version: 1, checksum: "4a90…1b7d" },
  { id: "d7", name: "carta-vinos-2025.pdf", type: "menu", size: 180_000, storageKey: "orgs/org_001/ai-knowledge/d7", status: "error", chunks: 0, embeddings: 0, uploadedBy: "Lucía M.", uploadedAt: "hace 12 min", version: 1, checksum: "—", error: "Extracción de texto fallida: PDF corrupto" },
  { id: "d8", name: "protocolo-alergias.md", type: "procedure", size: 22_000, storageKey: "orgs/org_001/ai-knowledge/d8", status: "indexed", chunks: 5, embeddings: 5, uploadedBy: "Carlos R.", uploadedAt: "15 dic 2024", indexedAt: "15 dic 2024 · 13:55", version: 2, checksum: "6e3d…a8f1" },
];

const SUGGESTED_QUERIES = [
  "¿Cuál es la política de cancelación?",
  "¿Qué platos sin gluten hay?",
  "¿Cómo se limpia la terraza?",
  "¿Qué hacer si un cliente tiene alergia?",
];

const DEMO_SEARCH_RESULTS: Record<string, SearchResult[]> = {
  default: [],
  "¿Cuál es la política de cancelación?": [
    { id: "s1", docId: "d2", docName: "politica-cancelacion.md", docType: "policy", snippet: "Las reservas pueden cancelarse sin cargo hasta 24 horas antes de la fecha. Pasado ese plazo se cobrará el 50% del menú contratado.", matchStart: 28, matchEnd: 39, similarity: 0.94, chunkIndex: 1 },
    { id: "s2", docId: "d4", docName: "faq-clientes.txt", docType: "faq", snippet: "P: ¿Puedo cancelar mi reserva? R: Sí, sin coste hasta 24h antes. Si tienes un evento privado, consulta las condiciones específicas en tu contrato.", matchStart: 24, matchEnd: 32, similarity: 0.88, chunkIndex: 3 },
    { id: "s3", docId: "d1", docName: "menu-navidad-2024.pdf", docType: "menu", snippet: "Menú Navidad requiere reserva con tarjeta. Cancelaciones a menos de 48h tienen un cargo fijo de 30€/persona en fin de semana.", matchStart: 33, matchEnd: 45, similarity: 0.71, chunkIndex: 5 },
  ],
  "¿Qué platos sin gluten hay?": [
    { id: "s4", docId: "d1", docName: "menu-navidad-2024.pdf", docType: "menu", snippet: "Opciones sin gluten: risotto trufa, tartar de atún, solomillo wagyu. Todos los postres salvo tiramisú tienen versión sin gluten.", matchStart: 0, matchEnd: 18, similarity: 0.91, chunkIndex: 2 },
    { id: "s5", docId: "d4", docName: "faq-clientes.txt", docType: "faq", snippet: "P: ¿Tenéis opciones celíacos? R: Sí, más del 60% de la carta es sin gluten o adaptable. Pídelo al camarero al llegar.", matchStart: 22, matchEnd: 30, similarity: 0.85, chunkIndex: 6 },
    { id: "s6", docId: "d8", docName: "protocolo-alergias.md", docType: "procedure", snippet: "Protocolo alergias: el equipo de cocina debe verificar ingredientes en la ficha técnica antes de confirmar un plato sin gluten.", matchStart: 35, matchEnd: 47, similarity: 0.74, chunkIndex: 1 },
  ],
  "¿Cómo se limpia la terraza?": [
    { id: "s7", docId: "d5", docName: "procedimiento-limpieza.md", docType: "procedure", snippet: "Limpieza terraza: barrer primero, luego fregar con detergente neutro. Renovar toldos cada 90 días. Verificar drenajes tras lluvia.", matchStart: 0, matchEnd: 17, similarity: 0.96, chunkIndex: 0 },
    { id: "s8", docId: "d6", docName: "info-terraza.pdf", docType: "location_info", snippet: "La terraza tiene 24 mesas, superficie de porcelánico. Se limpia al cierre de cada servicio. Materiales en el cuarto de limpieza B2.", matchStart: 0, matchEnd: 7, similarity: 0.79, chunkIndex: 2 },
    { id: "s9", docId: "d3", docName: "manual-camareros.pdf", docType: "manual", snippet: "Antes de abrir el servicio, asignar 2 camareros a la revisión de terraza: mesas, sombras, limpieza. Reportar incidencias en la app.", matchStart: 50, matchEnd: 58, similarity: 0.66, chunkIndex: 14 },
  ],
  "¿Qué hacer si un cliente tiene alergia?": [
    { id: "s10", docId: "d8", docName: "protocolo-alergias.md", docType: "procedure", snippet: "Si un cliente reporta alergia: anotar el alérgeno, avisar al chef, marcar ticket con rojo. Nunca servir sin confirmación de cocina.", matchStart: 27, matchEnd: 35, similarity: 0.97, chunkIndex: 0 },
    { id: "s11", docId: "d4", docName: "faq-clientes.txt", docType: "faq", snippet: "P: ¿Cómo gestionáis alergias? R: Cada plato tiene ficha de alérgenos. Nuestro equipo está formado en protocolo de seguridad alimentaria.", matchStart: 21, matchEnd: 29, similarity: 0.89, chunkIndex: 5 },
    { id: "s12", docId: "d3", docName: "manual-camareros.pdf", docType: "manual", snippet: "Capítulo 4 — Alérgenos: camarero debe preguntar siempre al cliente por intolerancias antes de recomendar platos del día.", matchStart: 14, matchEnd: 24, similarity: 0.78, chunkIndex: 22 },
  ],
};

const PIPELINE_STEPS: PipelineStep[] = [
  { id: 1, label: "Subida a R2", detail: "orgs/{org_id}/ai-knowledge/{doc_id}", icon: HardDrive, done: true },
  { id: 2, label: "Extracción de texto", detail: "Parser PDF / TXT / MD / DOCX", icon: FileText, done: true },
  { id: 3, label: "Chunking", detail: "500 tokens · 50 overlap", icon: Layers, done: true },
  { id: 4, label: "Generación de embeddings", detail: "@cf/baai/bge-base-en-v1.5", icon: Cpu, done: true },
  { id: 5, label: "Indexado en Vectorize", detail: "namespace: org_{org_id}", icon: Database, done: true },
];

const PIPELINE_LOG: PipelineLogEntry[] = [
  { id: "p1", ts: "hace 1 min", doc: "procedimiento-limpieza.md", steps: 3, duration: "—", result: "ok", message: "En paso 4 de 5" },
  { id: "p2", ts: "hace 12 min", doc: "carta-vinos-2025.pdf", steps: 1, duration: "0.8s", result: "error", message: "PDF corrupto" },
  { id: "p3", ts: "hace 2h", doc: "Reindexación completa (8 docs)", steps: 5, duration: "47.2s", result: "ok", message: "79 embeddings reemplazados" },
  { id: "p4", ts: "hace 5h", doc: "manual-camareros.pdf", steps: 5, duration: "8.4s", result: "ok", message: "45 embeddings · v3" },
  { id: "p5", ts: "ayer · 18:30", doc: "faq-clientes.txt", steps: 5, duration: "2.1s", result: "ok", message: "8 embeddings · v1" },
];

const EMBEDDINGS_BY_TYPE = [
  { type: "menu", label: "Menu", pct: 40, color: "#D4AF37" },
  { type: "manual", label: "Manual", pct: 25, color: "#38BDF8" },
  { type: "procedure", label: "Procedimiento", pct: 10, color: "#E879F9" },
  { type: "faq", label: "FAQ", pct: 10, color: "#FBBF24" },
  { type: "policy", label: "Política", pct: 8, color: "#3DD6C9" },
  { type: "location_info", label: "Info local", pct: 7, color: "#34D399" },
];

const QUERY_TREND_30D = [
  18, 22, 19, 24, 31, 28, 26, 34, 30, 36, 41, 38, 44, 39, 47,
  52, 48, 55, 61, 58, 63, 59, 67, 71, 64, 72, 78, 74, 82, 88,
];

/* ============================================================
   Helpers
============================================================ */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ============================================================
   Shared sub-components
============================================================ */

function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      demo
    </span>
  );
}

function VectorizeBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--teal)]/40 bg-[var(--teal)]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--teal)]">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--teal)] opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
      </span>
      Vectorize activo
    </span>
  );
}

function DocTypeBadge({ type }: { type: DocumentType }) {
  const meta = DOC_TYPE_META[type];
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", meta.cls)}>
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", meta.cls)}>
      <Icon className={cn("h-3 w-3", status === "processing" && "animate-spin")} aria-hidden />
      {meta.label}
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

/* ============================================================
   Donut chart (embeddings by type)
============================================================ */

function DonutChart({ data, size = 200 }: { data: typeof EMBEDDINGS_BY_TYPE; size?: number }) {
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Precompute cumulative offsets before render (no mutation during render)
  const segments: Array<{ seg: typeof data[number]; length: number; offset: number }> = [];
  for (let i = 0, acc = 0; i < data.length; i++) {
    const length = (data[i].pct / 100) * circumference;
    segments.push({ seg: data[i], length, offset: acc });
    acc += length;
  }
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label="Distribución de embeddings por tipo de documento">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="color-mix(in oklab, var(--foreground) 8%, transparent)" strokeWidth={stroke} />
        {segments.map(({ seg, length, offset }) => {
          const dash = `${length} ${circumference - length}`;
          return (
            <circle
              key={seg.type}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          );
        })}
        <text x="50%" y="46%" textAnchor="middle" className="fill-foreground font-display text-2xl">79</text>
        <text x="50%" y="58%" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-wider">embeddings</text>
      </svg>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-2 w-full">
        {data.map((seg) => (
          <li key={seg.type} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-foreground/80 flex-1 truncate">{seg.label}</span>
            <span className="font-mono text-muted-foreground">{seg.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   Line chart (query trend 30d)
============================================================ */

function LineChart({ data }: { data: number[] }) {
  const w = 520;
  const h = 160;
  const pad = 24;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const areaPath = `${path} L ${points[points.length - 1][0].toFixed(1)} ${h - pad} L ${pad} ${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Tendencia de consultas semánticas últimos 30 días">
      <defs>
        <linearGradient id="rp-kn-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={pad} x2={w - pad} y1={pad + t * (h - pad * 2)} y2={pad + t * (h - pad * 2)} stroke="color-mix(in oklab, var(--foreground) 8%, transparent)" strokeWidth="1" />
      ))}
      <path d={areaPath} fill="url(#rp-kn-area)" />
      <path d={path} fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="3.5" fill="#D4AF37" />
      <text x={pad} y={h - 6} className="fill-muted-foreground font-mono" fontSize="9">hace 30d</text>
      <text x={w - pad} y={h - 6} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="9">hoy</text>
    </svg>
  );
}

/* ============================================================
   Document preview dialog (extracted text)
============================================================ */

function DocPreviewDialog({ doc, open, onOpenChange }: { doc: KnowledgeDocument | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!doc) return null;
  const previewText = getPreviewText(doc);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rp-scroll-thin rp-glass-strong">
        <DialogHeader>
          <DialogTitle className="font-mono text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            {doc.name}
          </DialogTitle>
          <DialogDescription className="sr-only">Vista previa del texto extraído del documento.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <DocTypeBadge type={doc.type} />
            <StatusBadge status={doc.status} />
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-foreground/[0.03] px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
              <Hash className="h-3 w-3" aria-hidden />v{doc.version}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-foreground/[0.03] px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
              {formatBytes(doc.size)}
            </span>
          </div>
          <div className="rounded-lg border border-border/60 bg-foreground/[0.03] p-3">
            <SectionLabel icon={Database}>R2 storage key</SectionLabel>
            <code className="mt-1.5 block font-mono text-[11px] text-[var(--teal)] break-all">{doc.storageKey}</code>
          </div>
          {doc.status === "error" ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-destructive">
                <FileWarning className="h-3 w-3" aria-hidden />Error de extracción
              </div>
              <p className="mt-1.5 text-xs text-foreground/80">{doc.error}</p>
            </div>
          ) : (
            <div>
              <SectionLabel icon={FileText}>Texto extraído (chunk 1 de {doc.chunks || 1})</SectionLabel>
              <pre className="mt-1.5 whitespace-pre-wrap rounded-lg border border-border/60 bg-background/40 p-3 font-mono text-[11px] leading-relaxed text-foreground/80 max-h-72 overflow-y-auto rp-scroll-thin">
                {previewText}
              </pre>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md border border-border/60 bg-foreground/[0.03] p-2">
              <div className="font-display text-lg text-[var(--gold-soft)]">{doc.chunks}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">chunks</div>
            </div>
            <div className="rounded-md border border-border/60 bg-foreground/[0.03] p-2">
              <div className="font-display text-lg text-[var(--teal)]">{doc.embeddings}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">embeddings</div>
            </div>
            <div className="rounded-md border border-border/60 bg-foreground/[0.03] p-2">
              <div className="font-mono text-sm text-foreground/80 mt-1">{doc.checksum}</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">checksum</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button className="min-h-[40px] rounded-md border border-border/60 bg-foreground/[0.03] px-4 text-sm hover:bg-foreground/[0.06] transition-colors">
              Cerrar
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getPreviewText(doc: KnowledgeDocument): string {
  const map: Record<string, string> = {
    d1: "MENÚ NAVIDAD 2024\n\nEntrantes\n• Foie micuit con compota de manzana\n• Tartar de atún rojo con aguacate\n• Sopa de marisco con azafrán\n\nPrincipales\n• Solomillo wagyu con trufa negra\n• Risotto de setas con parmesano\n• Lubina salvaje al horno\n\nPostres\n• Tiramisú casero\n• Coulant de chocolate\n• Sorbete de mandarina\n\nPrecio: 95€/persona (sin vino). Reserva con tarjeta. Cancelaciones a menos de 48h: cargo 30€/pax.",
    d2: "# POLÍTICA DE CANCELACIÓN\n\nLas reservas pueden cancelarse sin cargo hasta 24 horas antes de la fecha. Pasado ese plazo se cobrará el 50% del menú contratado.\n\nEn eventos privados o reservas de grupo (+8 pax), el plazo se extiende a 72 horas y el cargo es del 100%.\n\nNo-shows: se cargará el importe íntegro en la tarjeta de garantía.",
    d3: "MANUAL DE CAMAREROS — v3\n\n1. APERTURA DEL SERVICIO\n   - Llegar 30 min antes\n   - Revisar reservas del día\n   - Montaje de mesas según plano\n\n2. ATENCIÓN AL CLIENTE\n   - Saludar con sonrisa\n   - Presentar carta y recomendaciones\n   - Preguntar alergias e intolerancias SIEMPRE\n\n3. COBRO Y CIERRE\n   - Verificar cuenta antes de entregar\n   - Ofrecer propina electrónica\n   - Recoger mesa en menos de 4 min",
    d4: "FAQ CLIENTES\n\nP: ¿Tenéis opciones veganas?\nR: Sí, más del 40% de la carta es vegana o adaptable.\n\nP: ¿Puedo cancelar mi reserva?\nR: Sí, sin coste hasta 24h antes.\n\nP: ¿Aceptáis mascotas?\nR: Solo en terraza y con correa.\n\nP: ¿Tenéis aparcamiento?\nR: Convenio con parking público a 50m (descuento 20%).\n\nP: ¿Cómo gestionáis alergias?\nR: Cada plato tiene ficha de alérgenos. Equipo formado en protocolo de seguridad alimentaria.",
    d5: "[Procesando… documento en cola de extracción]",
    d6: "INFO TERRAZA\n\nLa terraza dispone de 24 mesas (96 cubiertos). Superficie de porcelánico antibacteriano. Toldos motorizados con sensor de viento.\n\nCuarto de limpieza: sala B2. Inventario de productos validado cada lunes.\n\nCierre de terraza por clima adverso: decisión del gerente de turno.",
    d7: "[No se pudo extraer texto — PDF corrupto]",
    d8: "# PROTOCOLO DE ALERGIAS — v2\n\n1. Si un cliente reporta alergia: anotar el alérgeno, avisar al chef, marcar ticket con rojo.\n2. Nunca servir sin confirmación de cocina.\n3. Verificar ficha técnica de ingredientes.\n4. Utensilios dedicados para platos sin gluten.\n5. Formación obligatoria del equipo cada 6 meses.",
  };
  return map[doc.id] || "(sin texto disponible)";
}

/* ============================================================
   Documents tab
============================================================ */

function DocumentsTab({ docs, setDocs }: { docs: KnowledgeDocument[]; setDocs: React.Dispatch<React.SetStateAction<KnowledgeDocument[]>>; }) {
  const { toast } = useToast();
  const reduced = useReducedMotion();
  const [previewDoc, setPreviewDoc] = React.useState<KnowledgeDocument | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<KnowledgeDocument | null>(null);
  const [confirmReindex, setConfirmReindex] = React.useState<KnowledgeDocument | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [uploadType, setUploadType] = React.useState<DocumentType>("menu");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const enter = reduced ? {} : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };

  function simulateUpload(fileName: string) {
    const newId = `d${Date.now()}`;
    const newDoc: KnowledgeDocument = {
      id: newId,
      name: fileName,
      type: uploadType,
      size: 100_000 + Math.floor(Math.random() * 500_000),
      storageKey: `orgs/org_001/ai-knowledge/${newId}`,
      status: "pending",
      chunks: 0,
      embeddings: 0,
      uploadedBy: "Tú",
      uploadedAt: "hace unos segundos",
      version: 1,
      checksum: "pend…",
    };
    setDocs((d) => [newDoc, ...d]);
    toast({ title: "Documento subido a R2", description: `${fileName} · cola de indexación` });
    // pending -> processing (1s)
    setTimeout(() => {
      setDocs((d) => d.map((x) => x.id === newId ? { ...x, status: "processing" } : x));
    }, 1000);
    // processing -> indexed (2s)
    setTimeout(() => {
      const chunks = 4 + Math.floor(Math.random() * 12);
      setDocs((d) => d.map((x) => x.id === newId ? {
        ...x, status: "indexed", chunks, embeddings: chunks,
        indexedAt: "hace unos segundos",
        checksum: Math.random().toString(16).slice(2, 6) + "…" + Math.random().toString(16).slice(2, 6),
      } : x));
      toast({ title: "Indexación completada", description: `${fileName} · ${chunks} chunks · ${chunks} embeddings` });
    }, 3000);
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: "Archivo demasiado grande", description: "Máximo 10 MB por documento." });
      return;
    }
    simulateUpload(f.name);
  }

  function reindex(doc: KnowledgeDocument) {
    setConfirmReindex(null);
    setDocs((d) => d.map((x) => x.id === doc.id ? { ...x, status: "processing", chunks: 0, embeddings: 0 } : x));
    toast({ title: "Reindexando…", description: `${doc.name} · regenerando embeddings` });
    setTimeout(() => {
      const chunks = doc.chunks || 6;
      setDocs((d) => d.map((x) => x.id === doc.id ? {
        ...x, status: "indexed", chunks, embeddings: chunks,
        version: x.version + 1,
        indexedAt: "hace unos segundos",
      } : x));
      toast({ title: "Reindexación completada", description: `${doc.name} · v${doc.version + 1} · ${chunks} embeddings` });
    }, 1500);
  }

  function remove(doc: KnowledgeDocument) {
    setConfirmDel(null);
    setDocs((d) => d.filter((x) => x.id !== doc.id));
    toast({ title: "Documento eliminado", description: `${doc.name} · embeddings purgados de Vectorize` });
  }

  function retry(doc: KnowledgeDocument) {
    setDocs((d) => d.map((x) => x.id === doc.id ? { ...x, status: "processing", error: undefined } : x));
    toast({ title: "Reintentando extracción", description: doc.name });
    setTimeout(() => {
      const chunks = 6 + Math.floor(Math.random() * 6);
      setDocs((d) => d.map((x) => x.id === doc.id ? {
        ...x, status: "indexed", chunks, embeddings: chunks,
        indexedAt: "hace unos segundos",
        checksum: Math.random().toString(16).slice(2, 6) + "…" + Math.random().toString(16).slice(2, 6),
      } : x));
      toast({ title: "Indexación completada", description: `${doc.name} · ${chunks} embeddings` });
    }, 2000);
  }

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Zona de subida de documentos"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={cn(
          "rp-glass rounded-2xl p-6 sm:p-8 border-2 border-dashed transition-colors cursor-pointer text-center",
          dragOver ? "border-[var(--gold)] bg-[var(--gold)]/[0.06]" : "border-border/60 hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/[0.03]"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.docx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold-deep)]/20 border border-[var(--gold)]/30 flex items-center justify-center">
          <Upload className="h-5 w-5 text-[var(--gold-soft)]" aria-hidden />
        </div>
        <p className="mt-3 text-sm text-foreground">
          Arrastra un documento o <span className="rp-gold-text font-medium">haz clic para subir</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground font-mono">
          PDF · TXT · MD · DOCX · máx 10 MB
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Tipo:</span>
          <Select value={uploadType} onValueChange={(v) => setUploadType(v as DocumentType)}>
            <SelectTrigger className="w-[180px] h-9 rp-glass" aria-label="Tipo de documento">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(DOC_TYPE_META) as DocumentType[]).map((t) => (
                <SelectItem key={t} value={t}>{DOC_TYPE_META[t].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-md bg-[var(--gold)] px-3 py-1.5 text-xs font-medium text-black hover:bg-[var(--gold-soft)] transition-colors"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden />
            Subir documento
          </button>
        </div>
      </div>

      {/* Document list */}
      <div className="rp-glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 sm:px-5 py-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h3 className="text-sm font-medium">Documentos indexados</h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">{docs.length} docs</span>
        </div>
        {/* Desktop table header */}
        <div className="hidden lg:grid grid-cols-[2.2fr_1fr_0.8fr_0.8fr_0.6fr_0.9fr_1.2fr] gap-3 px-5 py-2 border-b border-border/40 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <span>Nombre</span>
          <span>Tipo</span>
          <span>Tamaño</span>
          <span>Estado</span>
          <span>v</span>
          <span>Chunks / Embed</span>
          <span className="text-right">Acciones</span>
        </div>
        <ul className="divide-y divide-border/40">
          <AnimatePresence initial={false}>
            {docs.map((doc) => (
              <motion.li
                key={doc.id}
                {...enter}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 sm:px-5 py-3"
              >
                {/* Desktop row */}
                <div className="hidden lg:grid grid-cols-[2.2fr_1fr_0.8fr_0.8fr_0.6fr_0.9fr_1.2fr] gap-3 items-center">
                  <div className="min-w-0">
                    <div className="font-mono text-[13px] text-foreground truncate">{doc.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">por {doc.uploadedBy} · {doc.uploadedAt}{doc.indexedAt ? ` · indexado ${doc.indexedAt}` : ""}</div>
                  </div>
                  <div><DocTypeBadge type={doc.type} /></div>
                  <div className="font-mono text-xs text-muted-foreground">{formatBytes(doc.size)}</div>
                  <div><StatusBadge status={doc.status} /></div>
                  <div className="font-mono text-xs text-muted-foreground">v{doc.version}</div>
                  <div className="font-mono text-xs">
                    <span className="text-[var(--teal)]">{doc.chunks}</span>
                    <span className="text-muted-foreground"> / </span>
                    <span className="text-[var(--gold-soft)]">{doc.embeddings}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <DocActions doc={doc} onView={() => { setPreviewDoc(doc); setPreviewOpen(true); }} onReindex={() => setConfirmReindex(doc)} onDelete={() => setConfirmDel(doc)} onDownload={() => toast({ title: "Descargando…", description: `${doc.name} · R2 presigned URL` })} onRetry={() => retry(doc)} />
                  </div>
                </div>

                {/* Mobile card */}
                <div className="lg:hidden space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[13px] text-foreground truncate">{doc.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">por {doc.uploadedBy} · {doc.uploadedAt}</div>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <DocTypeBadge type={doc.type} />
                    <span className="inline-flex items-center rounded-md border border-border/60 bg-foreground/[0.03] px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{formatBytes(doc.size)}</span>
                    <span className="inline-flex items-center rounded-md border border-border/60 bg-foreground/[0.03] px-2 py-0.5 text-[10px] font-mono text-muted-foreground">v{doc.version}</span>
                    <span className="inline-flex items-center rounded-md border border-border/60 bg-foreground/[0.03] px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {doc.chunks} chunks · {doc.embeddings} emb
                    </span>
                  </div>
                  {doc.status === "error" && doc.error && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive flex items-start gap-2">
                      <FileWarning className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
                      <span>{doc.error}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <DocActions doc={doc} onView={() => { setPreviewDoc(doc); setPreviewOpen(true); }} onReindex={() => setConfirmReindex(doc)} onDelete={() => setConfirmDel(doc)} onDownload={() => toast({ title: "Descargando…", description: `${doc.name} · R2 presigned URL` })} onRetry={() => retry(doc)} />
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <DocPreviewDialog doc={previewDoc} open={previewOpen} onOpenChange={setPreviewOpen} />

      {/* Delete confirm */}
      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="max-w-md rp-glass-strong">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden />
              Eliminar documento
            </DialogTitle>
            <DialogDescription>
              Se eliminarán todos los embeddings asociados. Esta acción es irreversible.
            </DialogDescription>
          </DialogHeader>
          {confirmDel && (
            <div className="rounded-md border border-border/60 bg-foreground/[0.03] p-3 font-mono text-xs text-foreground/80 break-all">
              {confirmDel.name}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="min-h-[40px] rounded-md border border-border/60 bg-foreground/[0.03] px-4 text-sm hover:bg-foreground/[0.06] transition-colors">
                Cancelar
              </button>
            </DialogClose>
            <button
              onClick={() => confirmDel && remove(confirmDel)}
              className="min-h-[40px] rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              Eliminar definitivamente
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reindex confirm */}
      <Dialog open={!!confirmReindex} onOpenChange={(o) => !o && setConfirmReindex(null)}>
        <DialogContent className="max-w-md rp-glass-strong">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="h-4 w-4 text-[var(--gold)]" aria-hidden />
              Reindexar documento
            </DialogTitle>
            <DialogDescription>
              Se extraerá el texto de nuevo y se regenerarán los embeddings. La versión aumentará en 1.
            </DialogDescription>
          </DialogHeader>
          {confirmReindex && (
            <div className="rounded-md border border-border/60 bg-foreground/[0.03] p-3 font-mono text-xs text-foreground/80 break-all">
              {confirmReindex.name} · v{confirmReindex.version} → v{confirmReindex.version + 1}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <button className="min-h-[40px] rounded-md border border-border/60 bg-foreground/[0.03] px-4 text-sm hover:bg-foreground/[0.06] transition-colors">
                Cancelar
              </button>
            </DialogClose>
            <button
              onClick={() => confirmReindex && reindex(confirmReindex)}
              className="min-h-[40px] rounded-md bg-[var(--gold)] px-4 text-sm font-medium text-black hover:bg-[var(--gold-soft)] transition-colors"
            >
              Reindexar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocActions({ doc, onView, onReindex, onDelete, onDownload, onRetry }: {
  doc: KnowledgeDocument;
  onView: () => void;
  onReindex: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onRetry: () => void;
}) {
  const btn = "min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-md border border-border/60 bg-foreground/[0.03] text-foreground/70 hover:text-[var(--gold-soft)] hover:border-[var(--gold)]/40 transition-colors";
  return (
    <>
      <button className={btn} onClick={onView} title="Ver" aria-label={`Ver ${doc.name}`}>
        <Eye className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button className={btn} onClick={onReindex} title="Reindexar" aria-label={`Reindexar ${doc.name}`}>
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button className={btn} onClick={onDownload} title="Descargar" aria-label={`Descargar ${doc.name}`}>
        <Download className="h-3.5 w-3.5" aria-hidden />
      </button>
      {doc.status === "error" && (
        <button
          onClick={onRetry}
          className="min-h-[36px] inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 px-2.5 text-[11px] font-mono uppercase tracking-wider text-amber-300 hover:bg-amber-400/15 transition-colors"
        >
          <RefreshCw className="h-3 w-3" aria-hidden /> Reintentar
        </button>
      )}
      <button
        className={cn(btn, "hover:text-destructive hover:border-destructive/40")}
        onClick={onDelete}
        title="Eliminar"
        aria-label={`Eliminar ${doc.name}`}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </button>
    </>
  );
}

/* ============================================================
   Semantic search tab
============================================================ */

function SearchTab() {
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [activeQuery, setActiveQuery] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [maxResults, setMaxResults] = React.useState(5);
  const [minSimilarity, setMinSimilarity] = React.useState(0.5);
  const reduced = useReducedMotion();

  function runSearch(q: string) {
    if (!q.trim()) return;
    setActiveQuery(q);
    setSearching(true);
    setResults([]);
    setTimeout(() => {
      const all = DEMO_SEARCH_RESULTS[q] || [];
      const filtered = all
        .filter((r) => r.similarity >= minSimilarity)
        .slice(0, maxResults);
      setResults(filtered);
      setSearching(false);
    }, 600);
  }

  const enter = reduced ? {} : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-5">
      <div className="rp-glass rounded-2xl p-5 sm:p-6 space-y-4">
        <SectionLabel icon={Search}>Búsqueda semántica</SectionLabel>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") runSearch(query); }}
              placeholder="Busca en la base de conocimiento…"
              aria-label="Consulta semántica"
              className="min-h-[48px] w-full rounded-lg border border-border/60 bg-background/40 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--gold)]/50 focus:ring-1 focus:ring-[var(--gold)]/30"
            />
          </div>
          <button
            onClick={() => runSearch(query)}
            disabled={!query.trim() || searching}
            className="min-h-[48px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--gold)] px-4 text-sm font-medium text-black hover:bg-[var(--gold-soft)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searching ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
            Buscar
          </button>
        </div>

        {/* Suggested queries */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Consultas sugeridas</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); runSearch(q); }}
                className="min-h-[36px] inline-flex items-center rounded-full border border-border/60 bg-foreground/[0.03] px-3 py-1.5 text-xs text-foreground/80 hover:border-[var(--gold)]/40 hover:text-[var(--gold-soft)] hover:bg-[var(--gold)]/[0.06] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Search settings */}
        <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Nº resultados</label>
            <div className="mt-1.5 flex gap-1.5">
              {[5, 10, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setMaxResults(n)}
                  className={cn(
                    "min-h-[36px] flex-1 rounded-md border px-3 text-xs font-mono transition-colors",
                    maxResults === n ? "border-[var(--gold)]/50 bg-[var(--gold)]/12 text-[var(--gold-soft)]" : "border-border/60 bg-foreground/[0.03] text-muted-foreground hover:text-foreground"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Similitud mínima</label>
            <div className="mt-1.5 flex gap-1.5">
              {[0.5, 0.7, 0.9].map((n) => (
                <button
                  key={n}
                  onClick={() => setMinSimilarity(n)}
                  className={cn(
                    "min-h-[36px] flex-1 rounded-md border px-3 text-xs font-mono transition-colors",
                    minSimilarity === n ? "border-[var(--teal)]/50 bg-[var(--teal)]/12 text-[var(--teal)]" : "border-border/60 bg-foreground/[0.03] text-muted-foreground hover:text-foreground"
                  )}
                >
                  {n.toFixed(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {activeQuery && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <SectionLabel icon={Database}>Resultados para: “{activeQuery}”</SectionLabel>
            <span className="text-[11px] font-mono text-muted-foreground">{results.length} encontrados</span>
          </div>
          {searching ? (
            <div className="rp-glass rounded-xl p-8 text-center text-sm text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin inline-block mr-2 text-[var(--gold)]" aria-hidden />
              Generando embeddings y consultando Vectorize…
            </div>
          ) : results.length === 0 ? (
            <div className="rp-glass rounded-xl p-8 text-center text-sm text-muted-foreground">
              Sin resultados por encima del umbral de similitud.
            </div>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence>
                {results.map((r, i) => (
                  <motion.li
                    key={r.id}
                    {...enter}
                    transition={{ duration: 0.2, delay: reduced ? 0 : i * 0.04 }}
                    className="rp-glass rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-[var(--gold)] shrink-0" aria-hidden />
                        <span className="font-mono text-[13px] text-foreground truncate">{r.docName}</span>
                        <DocTypeBadge type={r.docType} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-foreground/[0.03] px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                          <Hash className="h-3 w-3" aria-hidden />chunk {r.chunkIndex}
                        </span>
                        <SimilarityPill score={r.similarity} />
                      </div>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-foreground/85">
                      <HighlightedSnippet snippet={r.snippet} start={r.matchStart} end={r.matchEnd} />
                    </p>
                    <button
                      onClick={() => toast({ title: "Abriendo documento completo", description: r.docName })}
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium rp-gold-text hover:underline"
                    >
                      Ver documento completo
                      <ChevronRight className="h-3 w-3" aria-hidden />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[var(--teal)]" aria-hidden />
            Búsqueda semántica vía Cloudflare Vectorize. Los embeddings están aislados por organización (namespace <span className="font-mono">org_{"{org_id}"}</span>).
          </p>
        </div>
      )}
    </div>
  );
}

function SimilarityPill({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const cls = score >= 0.9
    ? "border-emerald-400/45 bg-emerald-400/12 text-emerald-300"
    : score >= 0.75
    ? "border-[var(--gold)]/45 bg-[var(--gold)]/12 text-[var(--gold-soft)]"
    : "border-amber-400/45 bg-amber-400/12 text-amber-300";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider", cls)}>
      <Gauge className="h-3 w-3" aria-hidden />
      {pct}% similitud
    </span>
  );
}

function HighlightedSnippet({ snippet, start, end }: { snippet: string; start: number; end: number }) {
  if (start < 0 || end <= start || end > snippet.length) return <>{snippet}</>;
  return (
    <>
      {snippet.slice(0, start)}
      <mark className="rounded bg-[var(--gold)]/25 px-0.5 text-foreground">{snippet.slice(start, end)}</mark>
      {snippet.slice(end)}
    </>
  );
}

/* ============================================================
   Indexing tab
============================================================ */

function IndexingTab({ docs }: { docs: KnowledgeDocument[] }) {
  const { toast } = useToast();
  const reduced = useReducedMotion();
  const [reindexing, setReindexing] = React.useState(false);
  const [confirmAll, setConfirmAll] = React.useState(false);

  const totalChunks = docs.reduce((s, d) => s + d.chunks, 0);
  const totalEmb = docs.reduce((s, d) => s + d.embeddings, 0);

  function reindexAll() {
    setConfirmAll(false);
    setReindexing(true);
    setTimeout(() => {
      setReindexing(false);
      toast({
        title: "Reindexación completada",
        description: "12.400 embeddings actualizados.",
      });
    }, 3000);
  }

  const enter = reduced ? {} : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-5">
      {/* Status row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Documentos" value={String(docs.length)} accent="gold" />
        <StatCard icon={Layers} label="Chunks totales" value={String(totalChunks)} accent="teal" />
        <StatCard icon={Cpu} label="Embeddings" value={String(totalEmb)} accent="gold" />
        <StatCard icon={Clock} label="Última reindexación" value="hace 2h" accent="teal" />
      </div>

      {/* Pipeline */}
      <div className="rp-glass rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h3 className="text-sm font-medium">Pipeline de indexación</h3>
          </div>
          <button
            onClick={() => setConfirmAll(true)}
            disabled={reindexing}
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1.5 text-xs font-medium text-[var(--gold-soft)] hover:bg-[var(--gold)]/15 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", reindexing && "animate-spin")} aria-hidden />
            {reindexing ? "Reindexando…" : "Reindexar todo"}
          </button>
        </div>

        <ol className="space-y-3">
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.id}
                {...enter}
                transition={{ duration: 0.2, delay: reduced ? 0 : i * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className={cn(
                  "shrink-0 h-9 w-9 rounded-full flex items-center justify-center border",
                  step.done
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                    : "border-amber-400/40 bg-amber-400/10 text-amber-300"
                )}>
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-muted-foreground">Paso {step.id}</span>
                    {step.done && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/8 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />ok
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-foreground mt-0.5">{step.label}</div>
                  <code className="text-[11px] font-mono text-muted-foreground break-all">{step.detail}</code>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="hidden sm:block absolute" aria-hidden />
                )}
              </motion.li>
            );
          })}
        </ol>
      </div>

      {/* Pipeline log */}
      <div className="rp-glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
          <Server className="h-4 w-4 text-[var(--teal)]" aria-hidden />
          <h3 className="text-sm font-medium">Log de indexación</h3>
          <span className="ml-auto text-[11px] font-mono text-muted-foreground">últimas 5 operaciones</span>
        </div>
        <ul className="divide-y divide-border/40">
          {PIPELINE_LOG.map((log) => (
            <li key={log.id} className="px-4 sm:px-5 py-3 grid grid-cols-1 sm:grid-cols-[1fr_2fr_0.7fr_0.7fr_1.4fr] gap-2 sm:gap-3 items-center">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  log.result === "ok" ? "bg-emerald-400" : "bg-destructive"
                )} />
                <span className="text-[11px] font-mono text-muted-foreground truncate">{log.ts}</span>
              </div>
              <span className="font-mono text-xs text-foreground truncate">{log.doc}</span>
              <span className="text-[11px] font-mono text-muted-foreground">{log.steps}/5 pasos</span>
              <span className="text-[11px] font-mono text-muted-foreground">{log.duration}</span>
              <span className={cn("text-[11px]", log.result === "ok" ? "text-emerald-300" : "text-destructive")}>{log.message}</span>
            </li>
          ))}
        </ul>
      </div>

      <Dialog open={confirmAll} onOpenChange={setConfirmAll}>
        <DialogContent className="max-w-md rp-glass-strong">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="h-4 w-4 text-[var(--gold)]" aria-hidden />
              Reindexar todos los documentos
            </DialogTitle>
            <DialogDescription>
              Reindexará todos los documentos. Los embeddings existentes se reemplazarán.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-amber-400/30 bg-amber-400/[0.06] p-3 text-xs text-amber-200/90">
            Operación estimada en ~50s. Durante la reindexación, las búsquedas semánticas usarán la versión anterior hasta completar el reemplazo atómico.
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="min-h-[40px] rounded-md border border-border/60 bg-foreground/[0.03] px-4 text-sm hover:bg-foreground/[0.06] transition-colors">
                Cancelar
              </button>
            </DialogClose>
            <button
              onClick={reindexAll}
              className="min-h-[40px] rounded-md bg-[var(--gold)] px-4 text-sm font-medium text-black hover:bg-[var(--gold-soft)] transition-colors"
            >
              Reindexar todo
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent: "gold" | "teal" }) {
  return (
    <div className="rp-glass rounded-xl p-4">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5", accent === "gold" ? "text-[var(--gold)]" : "text-[var(--teal)]")} aria-hidden />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className={cn("mt-1.5 font-display text-2xl font-light", accent === "gold" ? "rp-gold-text" : "rp-teal-text")}>{value}</div>
    </div>
  );
}

/* ============================================================
   Stats tab
============================================================ */

function StatsTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Documentos" value="8" accent="gold" />
        <StatCard icon={Layers} label="Chunks totales" value="79" accent="teal" />
        <StatCard icon={Cpu} label="Embeddings" value="79" accent="gold" />
        <StatCard icon={HardDrive} label="Almacenamiento R2" value="2.3 GB" accent="teal" />
        <StatCard icon={Search} label="Consultas Vectorize hoy" value="890" accent="gold" />
        <StatCard icon={Zap} label="Latencia media" value="28 ms" accent="teal" />
        <StatCard icon={TrendingUp} label="Cache hit ratio" value="34%" accent="gold" />
        <StatCard icon={Sparkles} label="Coste estimado" value="€0.12/mes" accent="teal" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rp-glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-[var(--gold)]" aria-hidden />
            <h3 className="text-sm font-medium">Embeddings por tipo</h3>
          </div>
          <DonutChart data={EMBEDDINGS_BY_TYPE} />
        </div>
        <div className="rp-glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[var(--teal)]" aria-hidden />
            <h3 className="text-sm font-medium">Tendencia de consultas · 30 días</h3>
          </div>
          <LineChart data={QUERY_TREND_30D} />
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Mín: 18/día</span>
            <span>Máx: 88/día</span>
            <span className="text-emerald-300">▲ +28% vs mes anterior</span>
          </div>
        </div>
      </div>

      <div className="rp-glass rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-[var(--teal)]" aria-hidden />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Métricas agregadas a nivel de organización. Los embeddings están aislados por namespace <span className="font-mono">org_{"{org_id}"}</span> en Cloudflare Vectorize. Los documentos se almacenan cifrados en R2. (demo)
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   Main component
============================================================ */

export function AiKnowledge() {
  const [docs, setDocs] = React.useState<KnowledgeDocument[]>(DEMO_DOCUMENTS);

  return (
    <div className="space-y-5">
      <header className="rp-glass-strong rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Database className="h-5 w-5 text-[var(--gold)]" aria-hidden />
              <h2 className="font-display text-xl sm:text-2xl font-medium tracking-tight">
                Base de Conocimiento IA
              </h2>
              <DemoBadge />
              <VectorizeBadge />
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
              RAG por restaurante. Sube documentos, genera embeddings y consulta tu conocimiento con búsqueda semántica. Aislado por organización en Cloudflare Vectorize + R2.
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="bg-transparent p-0 h-auto flex flex-wrap gap-1 rp-glass rounded-xl w-full justify-start">
          {[
            { v: "documents", l: "Documentos", i: FileText },
            { v: "search", l: "Búsqueda semántica", i: Search },
            { v: "indexing", l: "Indexación", i: Activity },
            { v: "stats", l: "Estadísticas", i: BarChart3 },
          ].map((t) => (
            <TabsTrigger
              key={t.v}
              value={t.v}
              className="min-h-[40px] data-[state=active]:bg-[var(--gold)]/12 data-[state=active]:text-[var(--gold-soft)] data-[state=active]:shadow-none rounded-lg px-3 sm:px-4 text-xs sm:text-sm"
            >
              <t.i className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              <span className="hidden sm:inline">{t.l}</span>
              <span className="sm:hidden">{t.l.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="documents" className="mt-4 focus-visible:outline-none">
          <DocumentsTab docs={docs} setDocs={setDocs} />
        </TabsContent>
        <TabsContent value="search" className="mt-4 focus-visible:outline-none">
          <SearchTab />
        </TabsContent>
        <TabsContent value="indexing" className="mt-4 focus-visible:outline-none">
          <IndexingTab docs={docs} />
        </TabsContent>
        <TabsContent value="stats" className="mt-4 focus-visible:outline-none">
          <StatsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AiKnowledge;
