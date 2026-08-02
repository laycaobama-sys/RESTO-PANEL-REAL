"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Megaphone,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
  Plus,
  Play,
  Pause,
  Copy,
  Trash2,
  Send,
  ChevronRight,
  Filter,
  Sparkles,
  Calendar,
  TrendingUp,
  Eye,
  MousePointerClick,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types & demo data                                                  */
/* ------------------------------------------------------------------ */

type Channel = "email" | "whatsapp" | "sms";
type CampaignStatus = "borrador" | "activa" | "pausada" | "finalizada";

interface Segment {
  id: string;
  name: string;
  rule: string;
  count: number;
  field: SegmentField;
  operator: SegmentOperator;
  value: string;
}

interface Campaign {
  id: string;
  name: string;
  segmentId: string;
  channel: Channel;
  status: CampaignStatus;
  sent: number;
  openRate: number;
  ctr: number;
  createdAt: string;
  templateId: string;
}

interface Template {
  id: string;
  name: string;
  channel: Channel;
  subject: string;
  preview: string;
  lastUsed: string;
  body: string;
}

type SegmentField = "visitas" | "ltv" | "ultima_visita" | "etiqueta" | "cumpleanos_mes";
type SegmentOperator = "eq" | "gte" | "lte" | "in" | "not_in";

const FIELD_LABELS: Record<SegmentField, string> = {
  visitas: "Visitas totales",
  ltv: "LTV (€)",
  ultima_visita: "Días desde última visita",
  etiqueta: "Etiqueta",
  cumpleanos_mes: "Cumpleaños en mes",
};

const OPERATOR_LABELS: Record<SegmentOperator, string> = {
  eq: "=",
  gte: "≥",
  lte: "≤",
  in: "es uno de",
  not_in: "no es ninguno de",
};

const DEMO_SEGMENTS: Segment[] = [
  {
    id: "s1",
    name: "VIP",
    rule: "Etiqueta = VIP",
    count: 12,
    field: "etiqueta",
    operator: "eq",
    value: "VIP",
  },
  {
    id: "s2",
    name: "Inactivos 90 días",
    rule: "Días desde última visita ≥ 90",
    count: 184,
    field: "ultima_visita",
    operator: "gte",
    value: "90",
  },
  {
    id: "s3",
    name: "Cumpleaños este mes",
    rule: "Cumpleaños en mes = actual",
    count: 37,
    field: "cumpleanos_mes",
    operator: "eq",
    value: "actual",
  },
  {
    id: "s4",
    name: "Riesgo de no-show",
    rule: "Etiqueta = riesgo AND visitas ≤ 5",
    count: 9,
    field: "etiqueta",
    operator: "eq",
    value: "riesgo",
  },
  {
    id: "s5",
    name: "Clientes nuevos",
    rule: "Visitas totales ≤ 1",
    count: 56,
    field: "visitas",
    operator: "lte",
    value: "1",
  },
];

const DEMO_TEMPLATES: Template[] = [
  {
    id: "t1",
    name: "Recordatorio de reserva T-24h",
    channel: "email",
    subject: "Te esperamos mañana, {{nombre}}",
    preview: "Confirmamos tu reserva para {{fecha}} a las {{hora}}…",
    lastUsed: "Hace 2 días",
    body: "Hola {{nombre}},\n\nTe recordamos tu reserva en {{restaurante}} para {{fecha}} a las {{hora}}.\n\n¿Necesitas modificar algo? Respóndenos a este correo.\n\n¡Te esperamos!",
  },
  {
    id: "t2",
    name: "Cupón de cumpleaños",
    channel: "whatsapp",
    subject: "🎁 Feliz cumpleaños, {{nombre}}",
    preview: "Tienes un postre de cortesía para canjear esta semana…",
    lastUsed: "Hace 5 días",
    body: "¡Feliz cumpleaños, {{nombre}}! 🎂\n\nPara celebrarlo te invitamos a un postre de cortesía en tu próxima visita (válido hasta {{valido_hasta}}).\n\nMenciona este mensaje al reservar.",
  },
  {
    id: "t3",
    name: "Recuperación inactivos",
    channel: "email",
    subject: "Te echamos de menos, {{nombre}}",
    preview: "Hace un tiempo que no vienes por aquí…",
    lastUsed: "Hace 1 semana",
    body: "Hola {{nombre}},\n\nHace {{dias}} días que no vienes por {{restaurante}}. Te invitamos a volver con un 15% de descuento en tu próxima cena.\n\nUsa el código TE-ECHAMOS-DE-MENOS al reservar.",
  },
  {
    id: "t4",
    name: "Confirmación SMS",
    channel: "sms",
    subject: "Reserva confirmada",
    preview: "{{restaurante}}: tu mesa para {{pax}} el {{fecha}} a las {{hora}} está confirmada.",
    lastUsed: "Hace 3 días",
    body: "{{restaurante}}: tu mesa para {{pax}} el {{fecha}} a las {{hora}} está confirmada. Responde STOP para cancelar avisos.",
  },
];

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    name: "Cupón cumpleaños marzo",
    segmentId: "s3",
    channel: "whatsapp",
    status: "activa",
    sent: 28,
    openRate: 82,
    ctr: 41,
    createdAt: "10 mar 2025",
    templateId: "t2",
  },
  {
    id: "c2",
    name: "Recuperación inactivos Q1",
    segmentId: "s2",
    channel: "email",
    status: "pausada",
    sent: 120,
    openRate: 34,
    ctr: 12,
    createdAt: "01 mar 2025",
    templateId: "t3",
  },
  {
    id: "c3",
    name: "Bienvenida clientes nuevos",
    segmentId: "s5",
    channel: "email",
    status: "activa",
    sent: 56,
    openRate: 68,
    ctr: 28,
    createdAt: "20 feb 2025",
    templateId: "t1",
  },
  {
    id: "c4",
    name: "Cena VIP exclusiva",
    segmentId: "s1",
    channel: "sms",
    status: "borrador",
    sent: 0,
    openRate: 0,
    ctr: 0,
    createdAt: "16 mar 2025",
    templateId: "t4",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const CHANNEL_META: Record<Channel, { label: string; icon: React.ElementType; tone: string }> = {
  email: { label: "Email", icon: Mail, tone: "border-sky-400/40 bg-sky-400/10 text-sky-300" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, tone: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  sms: { label: "SMS", icon: Smartphone, tone: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold-soft)]" },
};

const STATUS_META: Record<CampaignStatus, { label: string; tone: string; icon: React.ElementType }> = {
  borrador: { label: "Borrador", tone: "border-foreground/25 bg-foreground/5 text-muted-foreground", icon: FileText },
  activa: { label: "Activa", tone: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", icon: Play },
  pausada: { label: "Pausada", tone: "border-amber-400/40 bg-amber-400/10 text-amber-300", icon: Pause },
  finalizada: { label: "Finalizada", tone: "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]", icon: CheckCircle2 },
};


function ChannelPill({ channel }: { channel: Channel }) {
  const m = CHANNEL_META[channel];
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium", m.tone)}>
      <Icon className="h-3 w-3" aria-hidden />
      {m.label}
    </span>
  );
}

function StatusPill({ status }: { status: CampaignStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider", m.tone)}>
      <Icon className="h-3 w-3" aria-hidden />
      {m.label}
    </span>
  );
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty states                                                       */
/* ------------------------------------------------------------------ */

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rp-glass flex flex-col items-center justify-center rounded-2xl p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-foreground/[0.03]">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="mt-4 font-display text-lg font-medium tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-4" variant="outline" onClick={onAction}>
          <Plus className="h-4 w-4" aria-hidden />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* New segment dialog (rule builder)                                  */
/* ------------------------------------------------------------------ */

function NewSegmentDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (s: Omit<Segment, "id" | "count">) => void;
}) {
  const [name, setName] = React.useState("");
  const [field, setField] = React.useState<SegmentField>("visitas");
  const [operator, setOperator] = React.useState<SegmentOperator>("gte");
  const [value, setValue] = React.useState("");
  const [errors, setErrors] = React.useState<{ name?: string; value?: string }>({});

  React.useEffect(() => {
    if (open) {
      setName("");
      setField("visitas");
      setOperator("gte");
      setValue("");
      setErrors({});
    }
  }, [open]);

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: typeof errors = {};
    if (!name.trim()) e.name = "El nombre del segmento es obligatorio.";
    if (!value.trim()) e.value = "El valor de la regla es obligatorio.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const rule = `${FIELD_LABELS[field]} ${OPERATOR_LABELS[operator]} ${value}`;
    onCreate({ name: name.trim(), rule, field, operator, value: value.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo segmento</DialogTitle>
          <DialogDescription>
            Define una regla simple. Las reglas avanzadas (AND/OR, anidadas) están disponibles en el builder completo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="seg-name" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Nombre del segmento <span className="text-destructive">*</span>
            </label>
            <Input
              id="seg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Clientes alto LTV"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "seg-name-err" : undefined}
            />
            {errors.name && (
              <p id="seg-name-err" className="text-[11px] text-destructive" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border/60 bg-foreground/[0.02] p-3">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <Filter className="h-3 w-3 text-[var(--teal)]" aria-hidden />
              Regla
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="space-y-1">
                <label htmlFor="seg-field" className="text-[11px] text-muted-foreground">Campo</label>
                <Select value={field} onValueChange={(v) => setField(v as SegmentField)}>
                  <SelectTrigger id="seg-field" aria-label="Campo de la regla">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(FIELD_LABELS) as SegmentField[]).map((f) => (
                      <SelectItem key={f} value={f}>{FIELD_LABELS[f]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label htmlFor="seg-op" className="text-[11px] text-muted-foreground">Operador</label>
                <Select value={operator} onValueChange={(v) => setOperator(v as SegmentOperator)}>
                  <SelectTrigger id="seg-op" aria-label="Operador de la regla">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(OPERATOR_LABELS) as SegmentOperator[]).map((o) => (
                      <SelectItem key={o} value={o}>{OPERATOR_LABELS[o]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label htmlFor="seg-val" className="text-[11px] text-muted-foreground">
                  Valor <span className="text-destructive">*</span>
                </label>
                <Input
                  id="seg-val"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ej. 100"
                  aria-invalid={!!errors.value}
                  aria-describedby={errors.value ? "seg-val-err" : undefined}
                />
              </div>
            </div>
            {errors.value && (
              <p id="seg-val-err" className="mt-2 text-[11px] text-destructive" role="alert">
                {errors.value}
              </p>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Vista previa:{" "}
              <span className="font-mono text-foreground/80">
                {FIELD_LABELS[field]} {OPERATOR_LABELS[operator]} {value || "…"}
              </span>
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4" aria-hidden />
              Crear segmento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* New campaign dialog                                                */
/* ------------------------------------------------------------------ */

function NewCampaignDialog({
  open,
  onOpenChange,
  segments,
  templates,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  segments: Segment[];
  templates: Template[];
  onCreate: (c: Omit<Campaign, "id" | "status" | "sent" | "openRate" | "ctr" | "createdAt">) => void;
}) {
  const [name, setName] = React.useState("");
  const [segmentId, setSegmentId] = React.useState<string>("");
  const [channel, setChannel] = React.useState<Channel>("email");
  const [templateId, setTemplateId] = React.useState<string>("");
  const [errors, setErrors] = React.useState<{ name?: string; segmentId?: string; templateId?: string }>({});

  React.useEffect(() => {
    if (open) {
      setName("");
      setSegmentId(segments[0]?.id ?? "");
      setChannel("email");
      setTemplateId(templates[0]?.id ?? "");
      setErrors({});
    }
  }, [open, segments, templates]);

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: typeof errors = {};
    if (!name.trim()) e.name = "El nombre es obligatorio.";
    if (!segmentId) e.segmentId = "Selecciona un segmento.";
    if (!templateId) e.templateId = "Selecciona una plantilla.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onCreate({ name: name.trim(), segmentId, channel, templateId });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva campaña</DialogTitle>
          <DialogDescription>
            La campaña se crea como borrador. Podrás activarla cuando esté lista.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="camp-name" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Nombre <span className="text-destructive">*</span>
            </label>
            <Input
              id="camp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Promoción primavera VIP"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "camp-name-err" : undefined}
            />
            {errors.name && (
              <p id="camp-name-err" className="text-[11px] text-destructive" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="camp-seg" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Segmento <span className="text-destructive">*</span>
              </label>
              <Select value={segmentId} onValueChange={setSegmentId}>
                <SelectTrigger id="camp-seg" aria-label="Segmento de la campaña">
                  <SelectValue placeholder="Selecciona…" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.segmentId && (
                <p className="text-[11px] text-destructive" role="alert">{errors.segmentId}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="camp-chan" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Canal
              </label>
              <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
                <SelectTrigger id="camp-chan" aria-label="Canal de la campaña">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="camp-tpl" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Plantilla <span className="text-destructive">*</span>
            </label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger id="camp-tpl" aria-label="Plantilla de la campaña">
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.templateId && (
              <p className="text-[11px] text-destructive" role="alert">{errors.templateId}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4" aria-hidden />
              Crear campaña (borrador)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* New template dialog                                                */
/* ------------------------------------------------------------------ */

function NewTemplateDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (t: Omit<Template, "id" | "lastUsed">) => void;
}) {
  const [name, setName] = React.useState("");
  const [channel, setChannel] = React.useState<Channel>("email");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [errors, setErrors] = React.useState<{ name?: string; subject?: string; body?: string }>({});

  React.useEffect(() => {
    if (open) {
      setName("");
      setChannel("email");
      setSubject("");
      setBody("");
      setErrors({});
    }
  }, [open]);

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: typeof errors = {};
    if (!name.trim()) e.name = "El nombre es obligatorio.";
    if (!subject.trim()) e.subject = "El asunto es obligatorio.";
    if (!body.trim()) e.body = "El cuerpo no puede estar vacío.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onCreate({
      name: name.trim(),
      channel,
      subject: subject.trim(),
      preview: body.trim().slice(0, 80),
      body: body.trim(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva plantilla</DialogTitle>
          <DialogDescription>
            Usa <code className="rounded bg-foreground/10 px-1 font-mono text-[var(--gold-soft)]">{"{{variables}}"}</code> para personalizar.
            Variables disponibles: <span className="font-mono">nombre, fecha, hora, pax, restaurante</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="tpl-name" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Nombre <span className="text-destructive">*</span>
              </label>
              <Input
                id="tpl-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Confirmación de reserva"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "tpl-name-err" : undefined}
              />
              {errors.name && (
                <p id="tpl-name-err" className="text-[11px] text-destructive" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="tpl-chan" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Canal
              </label>
              <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
                <SelectTrigger id="tpl-chan" aria-label="Canal de la plantilla">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="tpl-subject" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Asunto / título <span className="text-destructive">*</span>
            </label>
            <Input
              id="tpl-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej. Te esperamos mañana, {{nombre}}"
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? "tpl-subject-err" : undefined}
            />
            {errors.subject && (
              <p id="tpl-subject-err" className="text-[11px] text-destructive" role="alert">
                {errors.subject}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="tpl-body" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Cuerpo <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="tpl-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder={"Hola {{nombre}},\n\nTe esperamos el {{fecha}} a las {{hora}}…"}
              className="resize-none font-mono text-xs"
              aria-invalid={!!errors.body}
              aria-describedby={errors.body ? "tpl-body-err" : undefined}
            />
            {errors.body && (
              <p id="tpl-body-err" className="text-[11px] text-destructive" role="alert">
                {errors.body}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Variables: <span className="font-mono text-[var(--teal)]">{"{{nombre}}"}</span>{" "}
              <span className="font-mono text-[var(--teal)]">{"{{fecha}}"}</span>{" "}
              <span className="font-mono text-[var(--teal)]">{"{{hora}}"}</span>{" "}
              <span className="font-mono text-[var(--teal)]">{"{{pax}}"}</span>{" "}
              <span className="font-mono text-[var(--teal)]">{"{{restaurante}}"}</span>
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4" aria-hidden />
              Crear plantilla
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Campaign details panel                                             */
/* ------------------------------------------------------------------ */

function CampaignDetails({
  campaign,
  segment,
  template,
  onClose,
  onStatusChange,
  onDelete,
  onDuplicate,
}: {
  campaign: Campaign;
  segment: Segment | undefined;
  template: Template | undefined;
  onClose: () => void;
  onStatusChange: (status: CampaignStatus) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [pauseOpen, setPauseOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [duplicated, setDuplicated] = React.useState(false);

  const metrics = [
    { id: "sent", label: "Enviados", value: campaign.sent, icon: Send, tone: "text-foreground" },
    { id: "open", label: "Apertura", value: `${campaign.openRate}%`, icon: Eye, tone: "rp-gold-text" },
    { id: "ctr", label: "CTR", value: `${campaign.ctr}%`, icon: MousePointerClick, tone: "rp-teal-text" },
  ];

  return (
    <section
      className="rp-glass-strong rounded-2xl p-5 sm:p-6"
      aria-labelledby={`camp-${campaign.id}-title`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 id={`camp-${campaign.id}-title`} className="font-display text-xl font-medium tracking-tight">
              {campaign.name}
            </h3>
            <StatusPill status={campaign.status} />
            
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {segment ? `Segmento: ${segment.name} (${segment.count} contactos)` : "Segmento desconocido"}
            {" · "}
            {template ? `Plantilla: ${template.name}` : "Sin plantilla"}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar panel de detalles">
          <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
        </Button>
      </div>

      {/* Metrics */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.id} className="rounded-xl border border-border/50 bg-foreground/[0.02] p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                <Icon className="h-3 w-3" aria-hidden />
                {m.label}
              </div>
              <div className={cn("mt-1.5 font-display text-2xl font-light", m.tone)}>
                {m.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Meta */}
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Canal</dt>
          <dd className="mt-1"><ChannelPill channel={campaign.channel} /></dd>
        </div>
        <div>
          <dt className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Creada</dt>
          <dd className="mt-1 inline-flex items-center gap-1.5 text-foreground/90">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            {campaign.createdAt}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Regla segmento</dt>
          <dd className="mt-1 font-mono text-[11px] text-muted-foreground">{segment?.rule ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Asunto plantilla</dt>
          <dd className="mt-1 text-[11px] text-foreground/90 truncate">{template?.subject ?? "—"}</dd>
        </div>
      </dl>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
        {campaign.status === "activa" ? (
          <Button variant="outline" onClick={() => setPauseOpen(true)}>
            <Pause className="h-4 w-4" aria-hidden />
            Pausar
          </Button>
        ) : campaign.status === "pausada" ? (
          <Button onClick={() => onStatusChange("activa")}>
            <Play className="h-4 w-4" aria-hidden />
            Reanudar
          </Button>
        ) : campaign.status === "borrador" ? (
          <Button onClick={() => onStatusChange("activa")}>
            <Play className="h-4 w-4" aria-hidden />
            Activar
          </Button>
        ) : (
          <Badge variant="outline" className="border-foreground/20 text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden /> Finalizada
          </Badge>
        )}
        <Button
          variant="outline"
          onClick={() => {
            onDuplicate();
            setDuplicated(true);
            setTimeout(() => setDuplicated(false), 1800);
          }}
          aria-label="Duplicar campaña"
        >
          <Copy className="h-4 w-4" aria-hidden />
          {duplicated ? "Duplicada ✓" : "Duplicar"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setDeleteOpen(true)}
          className="text-destructive hover:text-destructive"
          aria-label="Eliminar campaña"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Eliminar
        </Button>
      </div>

      {/* Confirm pause */}
      <AlertDialog open={pauseOpen} onOpenChange={setPauseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Pausar la campaña “{campaign.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              La campaña dejará de enviar mensajes inmediatamente. Los contactos que ya
              estaban en cola podrían recibirla. Puedes reanudarla en cualquier momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onStatusChange("pausada")}
              className="bg-amber-500 text-black hover:bg-amber-500/90"
            >
              Sí, pausar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar la campaña “{campaign.name}”</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la campaña y su configuración,
              pero se conservarán los eventos de auditoría y métricas históricas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Segment card                                                       */
/* ------------------------------------------------------------------ */

function SegmentCard({
  segment,
  onCreateCampaign,
}: {
  segment: Segment;
  onCreateCampaign: (s: Segment) => void;
}) {
  return (
    <li className="rp-glass rounded-xl p-4 transition-colors hover:border-[var(--gold)]/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">{segment.name}</h3>
            
          </div>
          <p className="mt-1.5 text-[11px] font-mono text-muted-foreground">
            <Filter className="mr-1 inline h-3 w-3 text-[var(--teal)]" aria-hidden />
            {segment.rule}
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-light rp-gold-text">{segment.count}</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            contactos
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="outline" onClick={() => onCreateCampaign(segment)}>
          <Megaphone className="h-3.5 w-3.5" aria-hidden />
          Crear campaña
        </Button>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Campaign row                                                       */
/* ------------------------------------------------------------------ */

function CampaignRow({
  campaign,
  segment,
  selected,
  onSelect,
}: {
  campaign: Campaign;
  segment: Segment | undefined;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        aria-label={`Ver detalles de ${campaign.name}`}
        className={cn(
          "group w-full text-left rounded-xl border p-4 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
          selected
            ? "border-[var(--gold)]/60 bg-[var(--gold)]/[0.06] rp-glow-gold"
            : "border-border/50 bg-foreground/[0.02] hover:border-[var(--gold)]/30 hover:bg-foreground/[0.04]"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{campaign.name}</span>
              <StatusPill status={campaign.status} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {segment ? `${segment.name} · ${segment.count} contactos` : "Segmento desconocido"}
            </p>
          </div>
          <ChannelPill channel={campaign.channel} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md border border-border/40 bg-foreground/[0.02] py-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Enviados</div>
            <div className="mt-0.5 text-sm font-medium">{campaign.sent}</div>
          </div>
          <div className="rounded-md border border-border/40 bg-foreground/[0.02] py-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Apertura</div>
            <div className="mt-0.5 text-sm font-medium rp-gold-text">{campaign.openRate}%</div>
          </div>
          <div className="rounded-md border border-border/40 bg-foreground/[0.02] py-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">CTR</div>
            <div className="mt-0.5 text-sm font-medium rp-teal-text">{campaign.ctr}%</div>
          </div>
        </div>
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Template card                                                      */
/* ------------------------------------------------------------------ */

function TemplateCard({ template }: { template: Template }) {
  return (
    <li className="rp-glass rounded-xl p-4 transition-colors hover:border-[var(--teal)]/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--teal)]" aria-hidden />
            <h3 className="text-sm font-medium">{template.name}</h3>
            
          </div>
          <p className="mt-1.5 text-sm font-medium text-foreground/90 truncate">{template.subject}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">{template.preview}</p>
        </div>
        <ChannelPill channel={template.channel} />
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3" aria-hidden />
          Último uso: {template.lastUsed}
        </span>
        <Button size="sm" variant="ghost" aria-label="Editar plantilla">
          Editar
        </Button>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Main Marketing view                                                */
/* ------------------------------------------------------------------ */

export function MarketingView() {
  const [tab, setTab] = React.useState<"segmentos" | "campanas" | "plantillas">("segmentos");
  const [segments, setSegments] = React.useState<Segment[]>(DEMO_SEGMENTS);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [templates, setTemplates] = React.useState<Template[]>(DEMO_TEMPLATES);

  const [newSegmentOpen, setNewSegmentOpen] = React.useState(false);
  const [newCampaignOpen, setNewCampaignOpen] = React.useState(false);
  const [newTemplateOpen, setNewTemplateOpen] = React.useState(false);

  const [selectedCampaignId, setSelectedCampaignId] = React.useState<string | null>(null);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) ?? null;
  const segmentOf = (id: string) => segments.find((s) => s.id === id);
  const templateOf = (id: string) => templates.find((t) => t.id === id);

  function handleCreateSegment(s: Omit<Segment, "id" | "count">) {
    const newSeg: Segment = {
      ...s,
      id: `s${Date.now()}`,
      count: Math.floor(Math.random() * 200) + 10,
    };
    setSegments((prev) => [newSeg, ...prev]);
  }

  function handleCreateCampaign(c: Omit<Campaign, "id" | "status" | "sent" | "openRate" | "ctr" | "createdAt">) {
    const today = new Date();
    const created = `${String(today.getDate()).padStart(2, "0")} ${today.toLocaleDateString("es-ES", { month: "short" })} ${today.getFullYear()}`;
    const newCamp: Campaign = {
      ...c,
      id: `c${Date.now()}`,
      status: "borrador",
      sent: 0,
      openRate: 0,
      ctr: 0,
      createdAt: created,
    };
    setCampaigns((prev) => [newCamp, ...prev]);
  }

  function handleCreateTemplate(t: Omit<Template, "id" | "lastUsed">) {
    const newTpl: Template = { ...t, id: `t${Date.now()}`, lastUsed: "Nunca" };
    setTemplates((prev) => [newTpl, ...prev]);
  }

  function handleStatusChange(id: string, status: CampaignStatus) {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }

  function handleDuplicate(id: string) {
    const c = campaigns.find((x) => x.id === id);
    if (!c) return;
    const dup: Campaign = {
      ...c,
      id: `c${Date.now()}`,
      name: `${c.name} (copia)`,
      status: "borrador",
      sent: 0,
      openRate: 0,
      ctr: 0,
      createdAt: "Hoy",
    };
    setCampaigns((prev) => [dup, ...prev]);
  }

  function handleDelete(id: string) {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    setSelectedCampaignId(null);
  }

  function handleCreateCampaignFromSegment(s: Segment) {
    setTab("campanas");
    setNewCampaignOpen(true);
    // pre-segment selection happens via initial state in NewCampaignDialog (first segment)
    // For demo we just open the dialog; user can pick this segment manually.
    void s;
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
              Marketing
            </h1>
            
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Segmenta, lanza campañas multicanal y reutiliza plantillas con variables dinámicas.
          </p>
        </div>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="w-full justify-start overflow-x-auto rp-scroll-thin sm:w-auto" aria-label="Vistas de marketing">
          <TabsTrigger value="segmentos" aria-label="Vista de segmentos" className="min-h-9">
            <Users className="h-4 w-4" aria-hidden />
            Segmentos
          </TabsTrigger>
          <TabsTrigger value="campanas" aria-label="Vista de campañas" className="min-h-9">
            <Megaphone className="h-4 w-4" aria-hidden />
            Campañas
          </TabsTrigger>
          <TabsTrigger value="plantillas" aria-label="Vista de plantillas" className="min-h-9">
            <FileText className="h-4 w-4" aria-hidden />
            Plantillas
          </TabsTrigger>
        </TabsList>

        {/* SEGMENTOS */}
        <TabsContent value="segmentos" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionLabel icon={Users}>Segmentos definidos</SectionLabel>
            <Button onClick={() => setNewSegmentOpen(true)} className="min-h-11 sm:self-auto">
              <Plus className="h-4 w-4" aria-hidden />
              Nuevo segmento
            </Button>
          </div>
          {segments.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sin segmentos"
              description="Crea tu primer segmento definiendo una regla simple (campo, operador, valor)."
              actionLabel="Nuevo segmento"
              onAction={() => setNewSegmentOpen(true)}
            />
          ) : (
            <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {segments.map((s) => (
                <SegmentCard
                  key={s.id}
                  segment={s}
                  onCreateCampaign={handleCreateCampaignFromSegment}
                />
              ))}
            </ul>
          )}
          <div className="flex justify-end">
            
          </div>
        </TabsContent>

        {/* CAMPAÑAS */}
        <TabsContent value="campanas" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionLabel icon={Megaphone}>Campañas</SectionLabel>
            <Button onClick={() => setNewCampaignOpen(true)} className="min-h-11 sm:self-auto">
              <Plus className="h-4 w-4" aria-hidden />
              Nueva campaña
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
            {/* List */}
            <div>
              {campaigns.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="Sin campañas"
                  description="Crea tu primera campaña seleccionando un segmento, un canal y una plantilla."
                  actionLabel="Nueva campaña"
                  onAction={() => setNewCampaignOpen(true)}
                />
              ) : (
                <ul className="space-y-3">
                  {campaigns.map((c) => (
                    <CampaignRow
                      key={c.id}
                      campaign={c}
                      segment={segmentOf(c.segmentId)}
                      selected={c.id === selectedCampaignId}
                      onSelect={() => setSelectedCampaignId(c.id === selectedCampaignId ? null : c.id)}
                    />
                  ))}
                </ul>
              )}
            </div>

            {/* Detail panel */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              {selectedCampaign ? (
                <CampaignDetails
                  campaign={selectedCampaign}
                  segment={segmentOf(selectedCampaign.segmentId)}
                  template={templateOf(selectedCampaign.templateId)}
                  onClose={() => setSelectedCampaignId(null)}
                  onStatusChange={(status) => handleStatusChange(selectedCampaign.id, status)}
                  onDelete={() => handleDelete(selectedCampaign.id)}
                  onDuplicate={() => handleDuplicate(selectedCampaign.id)}
                />
              ) : (
                <div className="rp-glass flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-foreground/[0.03]">
                    <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-medium tracking-tight">
                    Selecciona una campaña
                  </h3>
                  <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
                    Haz clic en una campaña de la lista para ver sus métricas y acciones.
                  </p>
                  <div className="mt-4">
                    
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* PLANTILLAS */}
        <TabsContent value="plantillas" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionLabel icon={FileText}>Plantillas</SectionLabel>
            <Button onClick={() => setNewTemplateOpen(true)} className="min-h-11 sm:self-auto">
              <Plus className="h-4 w-4" aria-hidden />
              Nueva plantilla
            </Button>
          </div>
          {templates.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Sin plantillas"
              description="Crea una plantilla reutilizable con variables dinámicas para tus campañas."
              actionLabel="Nueva plantilla"
              onAction={() => setNewTemplateOpen(true)}
            />
          ) : (
            <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </ul>
          )}
          <div className="flex justify-end">
            
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <NewSegmentDialog
        open={newSegmentOpen}
        onOpenChange={setNewSegmentOpen}
        onCreate={handleCreateSegment}
      />
      <NewCampaignDialog
        open={newCampaignOpen}
        onOpenChange={setNewCampaignOpen}
        segments={segments}
        templates={templates}
        onCreate={handleCreateCampaign}
      />
      <NewTemplateDialog
        open={newTemplateOpen}
        onOpenChange={setNewTemplateOpen}
        onCreate={handleCreateTemplate}
      />
    </div>
  );
}
