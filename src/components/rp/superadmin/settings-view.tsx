"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Settings, Building2, CalendarDays, Users, Star, Sparkles, ShieldCheck,
  Upload, Palette, Globe, Clock, Coins, Save, AlertCircle, Check, Zap,
  Power, Lock, KeyRound, FileText, MapPin,
} from "lucide-react";

function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider", className)}>
      demo
    </Badge>
  );
}

function FieldRow({
  label, hint, children, htmlFor,
}: {
  label: string; hint?: string; children: React.ReactNode; htmlFor?: string;
}) {
  return (
    <div className="grid sm:grid-cols-3 gap-3 py-3 border-b border-border/40 last:border-0">
      <div className="sm:col-span-1">
        <Label htmlFor={htmlFor} className="text-sm font-medium">{label}</Label>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

function ToggleRow({
  label, hint, checked, onChange,
}: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/40 last:border-0">
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

function TabHeader({ icon: Icon, title, subtitle, demo }: { icon: React.ElementType; title: string; subtitle: string; demo?: boolean }) {
  return (
    <div className="flex items-start gap-3 mb-4 pb-3 border-b border-border/40">
      <div className="h-9 w-9 rounded-md bg-foreground/5 border border-border/60 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-medium tracking-tight">{title}</h2>
          {demo && <DemoBadge />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-2">
      <Button variant="outline">Descartar</Button>
      <Button onClick={onSave}>
        <Save className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Guardar cambios
      </Button>
    </div>
  );
}

/* ---------------- main ---------------- */
export function SettingsView() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState("general");

  // General
  const [general, setGeneral] = React.useState({
    orgName: "Ramses Group",
    domain: "ramses.restopanel.app",
    locale: "es-ES",
    timezone: "Europe/Madrid",
    currency: "EUR",
    vatEnabled: true,
    vatRate: 21,
    vatNumber: "ESB12345678",
    primary: "#D4AF37",
    accent: "#3DD6C9",
  });

  // Reservas
  const [reservas, setReservas] = React.useState({
    avgDuration: 90,
    gapBetween: 15,
    capacity: 120,
    autoConfirm: true,
    reminders: true,
    reminderTiming: 24,
    cancelPolicy: "24h",
    noShowPolicy: "marked",
    depositsEnabled: false,
    depositAmount: 10,
  });

  // CRM
  const [crm, setCrm] = React.useState({
    defaultTags: "VIP, cumpleaños, alérgico, frecuente",
    segmentsEnabled: true,
    segmentRule: "frecuencia ≥ 3 visitas / 90 días",
    consentDefault: "opt-in",
    consentRequired: true,
  });

  // Reputación
  const [rep, setRep] = React.useState({
    googleConnected: false,
    autoReply: false,
    autoReplyMode: "always-require",
    sentimentThresholdPositive: 4,
    sentimentThresholdNegative: 3,
  });

  // IA
  const [ia, setIa] = React.useState({
    enabled: true,
    monthlyBudget: 2000,
    fallbackDeterministic: true,
    killSwitch: false,
  });

  // Seguridad
  const [sec, setSec] = React.useState({
    mfaRequired: true,
    sessionTimeout: 60,
    ipAllowlist: "",
    auditRetention: 365,
  });

  const save = (section: string) => {
    toast({ title: "Configuración guardada (demo)", description: `Sección ${section} actualizada correctamente.` });
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <header className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-foreground/5 border border-border/60 flex items-center justify-center">
            <Settings className="h-5 w-5" aria-hidden />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight">Configuración</h1>
          <DemoBadge />
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Ajustes a nivel de organización. Aplican a todos los locales y usuarios según sus permisos.
        </p>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/60 flex-wrap h-auto">
          <TabsTrigger value="general"><Building2 className="h-3.5 w-3.5 mr-1.5" aria-hidden /> General</TabsTrigger>
          <TabsTrigger value="reservas"><CalendarDays className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Reservas</TabsTrigger>
          <TabsTrigger value="crm"><Users className="h-3.5 w-3.5 mr-1.5" aria-hidden /> CRM</TabsTrigger>
          <TabsTrigger value="reputacion"><Star className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Reputación</TabsTrigger>
          <TabsTrigger value="ia"><Sparkles className="h-3.5 w-3.5 mr-1.5" aria-hidden /> IA</TabsTrigger>
          <TabsTrigger value="seguridad"><ShieldCheck className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Seguridad</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" className="mt-4">
          <div className="rp-glass rounded-xl p-5">
            <TabHeader icon={Building2} title="General" subtitle="Identidad y datos base de la organización" demo />
            <FieldRow label="Nombre de la organización" htmlFor="org-name" hint="Visible en facturas y comunicaciones">
              <Input id="org-name" value={general.orgName} onChange={(e) => setGeneral({ ...general, orgName: e.target.value })} />
            </FieldRow>
            <FieldRow label="Logo" hint="PNG o SVG · máx 1MB · fondo transparente recomendado">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-lg border border-dashed border-border/60 bg-foreground/5 flex items-center justify-center text-muted-foreground">
                  <Building2 className="h-6 w-6" aria-hidden />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => toast({ title: "Subir logo (demo)", description: "Selector de archivos abierto." })}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Subir logo
                </Button>
              </div>
            </FieldRow>
            <FieldRow label="Colores de marca" hint="Personaliza el acento dorado y turquesa de tu panel">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative h-11 w-11 rounded-md border border-border/60 overflow-hidden">
                    <input type="color" value={general.primary} onChange={(e) => setGeneral({ ...general, primary: e.target.value })} className="absolute inset-0 w-full h-full cursor-pointer opacity-0" aria-label="Color primario" />
                    <div className="h-full w-full" style={{ background: general.primary }} />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono">{general.primary}</div>
                    <div className="text-[10px] text-muted-foreground">Primario</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative h-11 w-11 rounded-md border border-border/60 overflow-hidden">
                    <input type="color" value={general.accent} onChange={(e) => setGeneral({ ...general, accent: e.target.value })} className="absolute inset-0 w-full h-full cursor-pointer opacity-0" aria-label="Color acento" />
                    <div className="h-full w-full" style={{ background: general.accent }} />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono">{general.accent}</div>
                    <div className="text-[10px] text-muted-foreground">Acento</div>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setGeneral({ ...general, primary: "#D4AF37", accent: "#3DD6C9" })}>
                  <Palette className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Restablecer marca
                </Button>
              </div>
            </FieldRow>
            <FieldRow label="Dominio personalizado" htmlFor="domain" hint="Subdominio donde se accede a tu panel">
              <div className="flex items-center gap-2">
                <Input id="domain" value={general.domain} onChange={(e) => setGeneral({ ...general, domain: e.target.value })} className="font-mono text-sm" />
                <Badge variant="outline" className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px]"><Check className="h-2.5 w-2.5 mr-1" /> verificado</Badge>
              </div>
            </FieldRow>
            <FieldRow label="Idioma y región" htmlFor="locale">
              <Select value={general.locale} onValueChange={(v) => setGeneral({ ...general, locale: v })}>
                <SelectTrigger id="locale" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="es-ES">Español (España)</SelectItem>
                  <SelectItem value="es-MX">Español (México)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="fr-FR">Français</SelectItem>
                  <SelectItem value="pt-PT">Português</SelectItem>
                  <SelectItem value="it-IT">Italiano</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Zona horaria" htmlFor="tz">
              <Select value={general.timezone} onValueChange={(v) => setGeneral({ ...general, timezone: v })}>
                <SelectTrigger id="tz" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Madrid">Europe/Madrid (UTC+1)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                  <SelectItem value="America/Mexico_City">America/Mexico_City (UTC-6)</SelectItem>
                  <SelectItem value="America/Argentina/Buenos_Aires">America/Buenos_Aires (UTC-3)</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Moneda" htmlFor="currency">
              <Select value={general.currency} onValueChange={(v) => setGeneral({ ...general, currency: v })}>
                <SelectTrigger id="currency" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                  <SelectItem value="MXN">Mexican Peso ($MXN)</SelectItem>
                  <SelectItem value="ARS">Argentine Peso ($ARS)</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Configuración IVA" hint="Aplica impuestos automáticamente a facturas y depósitos">
              <div className="space-y-3">
                <ToggleRow label="Activar IVA" checked={general.vatEnabled} onChange={(v) => setGeneral({ ...general, vatEnabled: v })} />
                {general.vatEnabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="vat-rate" className="text-xs">Tipo de IVA (%)</Label>
                      <Input id="vat-rate" type="number" min={0} max={100} value={general.vatRate} onChange={(e) => setGeneral({ ...general, vatRate: Number(e.target.value) })} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="vat-number" className="text-xs">NIF/CIF</Label>
                      <Input id="vat-number" value={general.vatNumber} onChange={(e) => setGeneral({ ...general, vatNumber: e.target.value })} className="mt-1.5 font-mono" />
                    </div>
                  </div>
                )}
              </div>
            </FieldRow>
            <SaveBar onSave={() => save("General")} />
          </div>
        </TabsContent>

        {/* RESERVAS */}
        <TabsContent value="reservas" className="mt-4">
          <div className="rp-glass rounded-xl p-5">
            <TabHeader icon={CalendarDays} title="Reservas" subtitle="Configuración operativa de reservas y turnos" demo />
            <FieldRow label="Duración media (min)" htmlFor="avg-dur" hint="Duración típica de una mesa ocupada">
              <div className="flex items-center gap-3">
                <Slider value={[reservas.avgDuration]} min={30} max={240} step={5} onValueChange={(v) => setReservas({ ...reservas, avgDuration: v[0] })} className="flex-1" />
                <span className="w-14 text-right font-mono text-sm rp-gold-text">{reservas.avgDuration} min</span>
              </div>
            </FieldRow>
            <FieldRow label="Tiempo entre reservas (min)" htmlFor="gap" hint="Margen de limpieza entre servicios">
              <div className="flex items-center gap-3">
                <Slider value={[reservas.gapBetween]} min={0} max={60} step={5} onValueChange={(v) => setReservas({ ...reservas, gapBetween: v[0] })} className="flex-1" />
                <span className="w-14 text-right font-mono text-sm rp-gold-text">{reservas.gapBetween} min</span>
              </div>
            </FieldRow>
            <FieldRow label="Capacidad por turno" htmlFor="cap" hint="Comensales máximos simultáneos">
              <Input id="cap" type="number" min={1} value={reservas.capacity} onChange={(e) => setReservas({ ...reservas, capacity: Number(e.target.value) })} className="max-w-[160px]" />
            </FieldRow>
            <FieldRow label="Confirmación automática" hint="Confirma reservas automáticamente sin revisión manual">
              <Switch checked={reservas.autoConfirm} onCheckedChange={(v) => setReservas({ ...reservas, autoConfirm: v })} aria-label="Confirmación automática" />
            </FieldRow>
            <FieldRow label="Recordatorios automáticos" hint="Envía recordatorios por email/WhatsApp antes del servicio">
              <div className="space-y-3">
                <Switch checked={reservas.reminders} onCheckedChange={(v) => setReservas({ ...reservas, reminders: v })} aria-label="Recordatorios automáticos" />
                {reservas.reminders && (
                  <div className="flex items-center gap-3">
                    <Label htmlFor="rem-timing" className="text-xs shrink-0">Enviar</Label>
                    <Select value={String(reservas.reminderTiming)} onValueChange={(v) => setReservas({ ...reservas, reminderTiming: Number(v) })}>
                      <SelectTrigger id="rem-timing" className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 horas antes</SelectItem>
                        <SelectItem value="12">12 horas antes</SelectItem>
                        <SelectItem value="24">24 horas antes</SelectItem>
                        <SelectItem value="48">48 horas antes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </FieldRow>
            <FieldRow label="Política de cancelación" htmlFor="cancel" hint="Ventana mínima para cancelar sin cargo">
              <Select value={reservas.cancelPolicy} onValueChange={(v) => setReservas({ ...reservas, cancelPolicy: v })}>
                <SelectTrigger id="cancel" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible (hasta 2h antes)</SelectItem>
                  <SelectItem value="24h">Moderada (24h antes)</SelectItem>
                  <SelectItem value="48h">Estricta (48h antes)</SelectItem>
                  <SelectItem value="no-refund">No reembolsable</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Política de no-show" htmlFor="noshow" hint="Acción cuando un cliente no se presenta">
              <Select value={reservas.noShowPolicy} onValueChange={(v) => setReservas({ ...reservas, noShowPolicy: v })}>
                <SelectTrigger id="noshow" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="marked">Marcar en CRM (sin cargo)</SelectItem>
                  <SelectItem value="charge-deposit">Cobrar depósito</SelectItem>
                  <SelectItem value="block-3">Bloquear nuevas reservas 3 días</SelectItem>
                  <SelectItem value="block-30">Bloquear nuevas reservas 30 días</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Depósitos" hint="Cobra un depósito al confirmar la reserva">
              <div className="space-y-3">
                <ToggleRow label="Activar depósitos" checked={reservas.depositsEnabled} onChange={(v) => setReservas({ ...reservas, depositsEnabled: v })} />
                {reservas.depositsEnabled && (
                  <div>
                    <Label htmlFor="dep-amt" className="text-xs">Importe del depósito (€)</Label>
                    <Input id="dep-amt" type="number" min={0} value={reservas.depositAmount} onChange={(e) => setReservas({ ...reservas, depositAmount: Number(e.target.value) })} className="mt-1.5 max-w-[160px]" />
                  </div>
                )}
              </div>
            </FieldRow>
            <SaveBar onSave={() => save("Reservas")} />
          </div>
        </TabsContent>

        {/* CRM */}
        <TabsContent value="crm" className="mt-4">
          <div className="rp-glass rounded-xl p-5">
            <TabHeader icon={Users} title="CRM" subtitle="Etiquetado, segmentación y consentimientos" demo />
            <FieldRow label="Tags por defecto" htmlFor="tags" hint="Etiquetas disponibles para clasificar clientes">
              <Input id="tags" value={crm.defaultTags} onChange={(e) => setCrm({ ...crm, defaultTags: e.target.value })} />
            </FieldRow>
            <FieldRow label="Segmentación automática" hint="Crea segmentos basados en comportamiento">
              <ToggleRow label="Activar reglas de segmentación" checked={crm.segmentsEnabled} onChange={(v) => setCrm({ ...crm, segmentsEnabled: v })} />
            </FieldRow>
            {crm.segmentsEnabled && (
              <FieldRow label="Regla de segmento VIP" htmlFor="seg-rule" hint="Condición para incluir clientes en el segmento VIP">
                <Input id="seg-rule" value={crm.segmentRule} onChange={(e) => setCrm({ ...crm, segmentRule: e.target.value })} className="font-mono text-sm" />
              </FieldRow>
            )}
            <FieldRow label="Consentimiento por defecto" hint="Estado inicial de consentimiento de marketing">
              <div className="space-y-3">
                <Select value={crm.consentDefault} onValueChange={(v) => setCrm({ ...crm, consentDefault: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opt-in">Opt-in (consentimiento explícito)</SelectItem>
                    <SelectItem value="opt-out">Opt-out (asentido salvo objeción)</SelectItem>
                    <SelectItem value="none">Sin consentimiento (no marketing)</SelectItem>
                  </SelectContent>
                </Select>
                <ToggleRow label="Requerir checkbox de consentimiento en formularios" checked={crm.consentRequired} onChange={(v) => setCrm({ ...crm, consentRequired: v })} />
              </div>
            </FieldRow>
            <SaveBar onSave={() => save("CRM")} />
          </div>
        </TabsContent>

        {/* REPUTACIÓN */}
        <TabsContent value="reputacion" className="mt-4">
          <div className="rp-glass rounded-xl p-5">
            <TabHeader icon={Star} title="Reputación" subtitle="Google Reviews y análisis de sentimiento" demo />
            <FieldRow label="Conexión con Google Business Profile" hint="Necesario para sincronizar reseñas">
              <div className="flex items-center gap-3">
                {rep.googleConnected ? (
                  <Badge className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300"><Check className="h-3 w-3 mr-1" /> conectado</Badge>
                ) : (
                  <Badge className="border-amber-400/40 bg-amber-400/10 text-amber-300"><AlertCircle className="h-3 w-3 mr-1" /> no conectado (demo)</Badge>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => { setRep({ ...rep, googleConnected: true }); toast({ title: "Google conectado (demo)", description: "Sincronizando reseñas…" }); }}>
                  Conectar Google
                </Button>
              </div>
            </FieldRow>
            <FieldRow label="Aprobación de respuestas automáticas" hint="Las respuestas IA a reseñas requieren siempre aprobación humana">
              <div className="space-y-3">
                <ToggleRow label="Requerir aprobación humana (siempre)" checked={rep.autoReplyMode === "always-require"} onChange={(v) => setRep({ ...rep, autoReplyMode: v ? "always-require" : "auto-positive" })} />
                <div className="rounded-md border border-border/40 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
                  <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 rp-teal-text" aria-hidden />
                  <span>Recomendado: siempre requerir aprobación. Evita respuestas automáticas inapropiadas en reseñas sensibles.</span>
                </div>
              </div>
            </FieldRow>
            <FieldRow label="Umbral de sentimiento positivo" hint="Puntuación mínima para considerar una reseña positiva">
              <div className="flex items-center gap-3">
                <Slider value={[rep.sentimentThresholdPositive]} min={1} max={5} step={1} onValueChange={(v) => setRep({ ...rep, sentimentThresholdPositive: v[0] })} className="flex-1" />
                <span className="w-12 text-right font-mono text-sm rp-teal-text">≥ {rep.sentimentThresholdPositive}/5</span>
              </div>
            </FieldRow>
            <FieldRow label="Umbral de alerta de sentimiento negativo" hint="Puntuación máxima que activa alerta al gerente">
              <div className="flex items-center gap-3">
                <Slider value={[rep.sentimentThresholdNegative]} min={1} max={5} step={1} onValueChange={(v) => setRep({ ...rep, sentimentThresholdNegative: v[0] })} className="flex-1" />
                <span className="w-12 text-right font-mono text-sm text-rose-300">≤ {rep.sentimentThresholdNegative}/5</span>
              </div>
            </FieldRow>
            <SaveBar onSave={() => save("Reputación")} />
          </div>
        </TabsContent>

        {/* IA */}
        <TabsContent value="ia" className="mt-4">
          <div className="rp-glass rounded-xl p-5">
            <TabHeader icon={Sparkles} title="IA" subtitle="Configuración de capacidades de IA" demo />
            <FieldRow label="IA habilitada" hint="Activa respuestas automáticas, segmentación y analítica con IA">
              <ToggleRow label="Activar IA en toda la organización" checked={ia.enabled} onChange={(v) => setIa({ ...ia, enabled: v })} />
            </FieldRow>
            <FieldRow label="Presupuesto mensual de IA" htmlFor="ia-budget" hint="Límite de créditos consumidos por mes">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Slider value={[ia.monthlyBudget]} min={500} max={10000} step={100} onValueChange={(v) => setIa({ ...ia, monthlyBudget: v[0] })} className="flex-1" disabled={!ia.enabled} />
                  <span className="w-20 text-right font-mono text-sm rp-gold-text">{ia.monthlyBudget.toLocaleString("es-ES")} cr</span>
                </div>
                <div className="text-[11px] text-muted-foreground">Uso actual: 412 / {ia.monthlyBudget.toLocaleString("es-ES")} ({((412 / ia.monthlyBudget) * 100).toFixed(1)}%)</div>
              </div>
            </FieldRow>
            <FieldRow label="Fallback determinista" hint="Si la IA falla o agota presupuesto, usar reglas deterministas">
              <ToggleRow label="Activar fallback" checked={ia.fallbackDeterministic} onChange={(v) => setIa({ ...ia, fallbackDeterministic: v })} />
            </FieldRow>
            <FieldRow label="Kill switch" hint="Desactiva inmediatamente todas las llamadas IA (emergencia)">
              <div className="space-y-3">
                <div className={cn(
                  "rounded-lg border p-3 flex items-start gap-3",
                  ia.killSwitch ? "border-rose-400/50 bg-rose-400/10" : "border-border/40 bg-foreground/[0.02]"
                )}>
                  <Power className={cn("h-5 w-5 mt-0.5 shrink-0", ia.killSwitch ? "text-rose-300" : "text-muted-foreground")} aria-hidden />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{ia.killSwitch ? "IA DESACTIVADA" : "IA operativa"}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {ia.killSwitch ? "Todas las llamadas IA están pausadas. Solo respuestas deterministas."
                                     : "El kill switch desactiva IA en toda la organización al instante."}
                    </div>
                  </div>
                  <Switch checked={ia.killSwitch} onCheckedChange={(v) => setIa({ ...ia, killSwitch: v })} aria-label="Kill switch IA" />
                </div>
              </div>
            </FieldRow>
            <SaveBar onSave={() => save("IA")} />
          </div>
        </TabsContent>

        {/* SEGURIDAD */}
        <TabsContent value="seguridad" className="mt-4">
          <div className="rp-glass rounded-xl p-5">
            <TabHeader icon={ShieldCheck} title="Seguridad" subtitle="Controles de acceso y auditoría" demo />
            <FieldRow label="MFA obligatorio" hint="Todos los miembros deben activar autenticación multifactor">
              <ToggleRow label="Requerir MFA" checked={sec.mfaRequired} onChange={(v) => setSec({ ...sec, mfaRequired: v })} />
            </FieldRow>
            <FieldRow label="Timeout de sesión (min)" htmlFor="sess" hint="Inactividad máxima antes de cerrar sesión">
              <Select value={String(sec.sessionTimeout)} onValueChange={(v) => setSec({ ...sec, sessionTimeout: Number(v) })}>
                <SelectTrigger id="sess" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="240">4 horas</SelectItem>
                  <SelectItem value="720">12 horas</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="IP allowlist" htmlFor="ip" hint="Lista de IPs/CIDR permitidas (vacío = todas)">
              <div className="space-y-2">
                <Input id="ip" placeholder="192.168.1.0/24, 84.123.45.67" value={sec.ipAllowlist} onChange={(e) => setSec({ ...sec, ipAllowlist: e.target.value })} className="font-mono text-sm" />
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" aria-hidden /> Formato: una IP o rango CIDR por línea o separado por comas.
                </div>
              </div>
            </FieldRow>
            <FieldRow label="Retención del log de auditoría (días)" htmlFor="audit" hint="Cuánto tiempo se conservan los eventos de auditoría">
              <Select value={String(sec.auditRetention)} onValueChange={(v) => setSec({ ...sec, auditRetention: Number(v) })}>
                <SelectTrigger id="audit" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="90">90 días</SelectItem>
                  <SelectItem value="180">180 días</SelectItem>
                  <SelectItem value="365">1 año</SelectItem>
                  <SelectItem value="1095">3 años (Enterprise)</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <Separator className="my-3 bg-border/40" />
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/40 p-3">
                <KeyRound className="h-4 w-4 rp-teal-text mb-1.5" aria-hidden />
                <div className="text-xs font-medium">SSO/SAML</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Disponible en plan Enterprise</div>
              </div>
              <div className="rounded-lg border border-border/40 p-3">
                <FileText className="h-4 w-4 rp-teal-text mb-1.5" aria-hidden />
                <div className="text-xs font-medium">Eventos auditados</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">8.412 eventos este mes</div>
              </div>
              <div className="rounded-lg border border-border/40 p-3">
                <Zap className="h-4 w-4 rp-teal-text mb-1.5" aria-hidden />
                <div className="text-xs font-medium">Política contraseñas</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">12+ car · 1 may · 1 número</div>
              </div>
            </div>
            <SaveBar onSave={() => save("Seguridad")} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
