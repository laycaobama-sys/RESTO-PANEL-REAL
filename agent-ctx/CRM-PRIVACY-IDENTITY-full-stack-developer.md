# Task ID: CRM-PRIVACY-IDENTITY
# Agent: full-stack-developer

## Task
Construir 2 componentes para la fase CRM de "RestoPanel": Privacy/GDPR Manager (`CrmPrivacy`) y Identity Resolution (`CrmIdentity`). Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, tema dark premium (gold #D4AF37, turquoise #3DD6C9, glassmorphism).

## Work Log
- Leí `worklog.md` para alinear convenciones (design tokens rp-glass, rp-gold-text, rp-teal-text, rp-glow-gold, rp-scroll-thin, prefers-reduced-motion handling).
- Estudié `crm-intelligence.tsx`, `crm-loyalty.tsx`, `crm-view.tsx` para alinear patrones (DemoBadge, SectionTitle, motion + useReducedMotion, toneBadge helper, Badges outline con tones gold/teal/emerald/amber/destructive, min-h-11 en botones para touch targets ≥44px).
- Verifiqué shadcn/ui disponibles: Tabs, Dialog, AlertDialog, Switch, Checkbox, Select, Input, Label, Textarea, Button, Badge — todos en `src/components/ui/`.
- Verifiqué `useToast` hook en `@/hooks/use-toast` (API estándar shadcn).

### File 1 — `src/components/rp/crm/crm-privacy.tsx` (export `CrmPrivacy`)
- Tipos exactos del spec: `ConsentChannel`, `ConsentPurpose`, `ConsentRecord` (con `history`), `DataRequest` (con `artifacts`). Añadidos tipos auxiliares `AuditEntry` para el log de auditoría.
- Constantes meta: `CHANNELS` (5: email, whatsapp, sms, push, phone), `PURPOSES` (5: service, marketing, analytics, profiling, third_party; `required: true` para service), `SOURCE_LABEL` (web_form/api/manual/imported → es-ES).
- Meta auxiliar: `REQ_TYPE_META` (access/rectification/export/deletion/anonymization/restriction/portability con icono + tone), `REQ_STATUS_META` (pending/processing/completed/rejected), `AUDIT_CATEGORY_META` (consent/data_request/export/anonymization/staff_access/retention/rectification), `RESULT_META` (success/denied/error).
- **Demo data**:
  - `SEED_GRID` (Record<ConsentChannel, Record<ConsentPurpose, ConsentSeed>>) → `seedConsent()` genera 25 ConsentRecords con historial inmutable simulado.
  - `DEMO_REQUESTS`: 6 solicitudes DR-2025-001 a DR-2025-006 cubriendo todos los tipos y estados (access completed, rectification completed, export completed con artifacts JSON+CSV, restriction processing, deletion pending, anonymization rejected).
  - `DEMO_AUDIT`: 10 entradas inmutables con actor (user/system), acción, categoría, recurso, IP redactada (84.124.x.x / 192.168.x.x / 10.0.x.x), motivo, resultado.
- **Layout con Tabs**: Consentimientos | Derechos de datos | Solicitudes | Auditoría.

#### Consentimientos tab
- Matriz 5×5: filas = canales, columnas = finalidades. Cada celda = Switch con estado OK/OFF. Service siempre bloqueado (Lock icon).
- Desktop: tabla HTML con sticky header (canal \ finalidad) y sticky first column (canales) para scroll horizontal sin perder contexto. overflow-x-auto rp-scroll-thin.
- Mobile (lg:hidden): cards apiladas por canal, cada finalidad con su toggle en una row de 44px min.
- Click en toggle (no service) → Dialog de confirmación mostrando canal, finalidad, estado actual y nuevo estado, con explicación contextual ("Al revocar… La retirada no afecta a la licitud del tratamiento previo" / "Al otorgar… conforme a la política de privacidad"). Botón de confirmación color context (gold si otorga, destructive si revoca).
- Toggle actualiza estado, grantedAt/revokedAt, source="manual", añade entrada a `history`, hace toast y push a auditoría.
- Note (info, teal): "El consentimiento de servicio es obligatorio para prestar el servicio. Los demás consentimientos son voluntarios y pueden retirarse en cualquier momento. La retirada del consentimiento no afecta a la licitud del tratamiento previo."
- Historial inmutable: lista append-only en max-h-96 overflow-y-auto rp-scroll-thin. Cada entrada: dot (emerald si granted, destructive si revoked), badge action, canal, purpose, timestamp es-ES, "por {by}", "origen {source}". AnimatePresence con motion.li opacity+y.

#### Derechos de datos tab
- Grid sm:2 xl:3 de 6 cards (Acceso, Rectificación, Exportación, Eliminación, Anonimización, Restricción). Cada card: icono, título, descripción, botón CTA.
- Acceso → toast + crea DataRequest de tipo access.
- Rectificación → Dialog con 3 campos (campo a corregir, nuevo valor, motivo opcional) → crea DataRequest con reason compuesto.
- Exportación → toast + crea DataRequest con artifacts ["export-personal-data.json", "export-personal-data.csv"].
- Eliminación → AlertDialog DESTRUCTIVE con description exacta del spec ("¿Solicitar eliminación? Se iniciarán las obligaciones legales de retención. Algunos datos pueden conservarse por obligación legal.") + reason textarea opcional.
- Anonimización → AlertDialog DESTRUCTIVE con description exacta del spec ("La anonimización es irreversible. Todos los datos personales se reemplazarán por valores anónimos. El historial analítico se conservará agregado.") + **TYPED confirmation**: input donde el usuario debe escribir exactamente "ANONIMIZAR". Botón Confirmar deshabilitado hasta que el input coincida.
- Restricción → toast + crea DataRequest.

#### Solicitudes tab
- Filtro por estado: Todas / Pendientes / Procesando / Completadas / Rechazadas (pills con aria-pressed, min-h-36px).
- Botón "Nueva solicitud" → Dialog con Select (7 tipos) + Textarea motivo.
- Desktop: tabla HTML con 7 columnas (ID mono gold, Tipo badge, Estado badge, Solicitada, Completada, Solicitante, Acción ChevronRight). Filas clicables → detail dialog. AnimatePresence motion.tr.
- Mobile: cards apiladas con ID + estado + tipo + fecha.
- Detail dialog (max-w-2xl): header con ID mono + Tipo badge + Estado badge; grid 2-col con Solicitada/Completada/Solicitante/Tipo; motivo; **timeline de procesamiento** (3 nodos: creada → en proceso → completada/rechazada, color-coded emerald/teal/destructive); artifacts con botones de descarga (FileJson/FileSpreadsheet icons); nota final sobre audit trail inmutable.

#### Auditoría tab
- Filtro por categoría: Todas / Consentimientos / Solicitudes / Exportaciones / Anonimizaciones / Acceso staff / Rectificaciones / Retención.
- Botón "Exportar auditoría" → toast.
- Lista en max-h-[28rem] overflow-y-auto. Cada entrada: icono categoría + label categoría en col fija 44px, acción + result badge, recurso en mono, actor (UserCog/Bot icon), timestamp es-ES + relativo, IP (Server icon, redacted), motivo si existe. AnimatePresence motion.li.
- Note (info, teal): "La auditoría de privacidad es inmutable. Cada acceso a datos personales se registra. Los logs no contienen datos sensibles completos."

#### Retention policy card (bottom, visible across all tabs)
- 4 cards: Datos transaccionales (6 años · obligación legal AGP/fiscal), Datos de marketing (hasta retirada del consentimiento), Datos analíticos agregados (Indefinido · anónimos), Logs de auditoría (2 años).
- Botón "Configurar retención" → Dialog con las 4 políticas marcadas como Obligatorio + Save → toast.

### File 2 — `src/components/rp/crm/crm-identity.tsx` (export `CrmIdentity`)
- Tipos exactos del spec: `MatchConfidence`, `MergeStatus`, `DuplicateMatch` (con `matchReasons`, `customerA/B`), `MergeRecord` (con `fieldsMerged`, `reversed`). Añadido tipo auxiliar `MatchingRule`.
- Meta: `CONFIDENCE_META` (high=emerald, medium=gold, low=amber, ambiguous=destructive, con description), `STATUS_META` (proposed=amber, approved=teal, rejected=destructive, completed=emerald, reversed=muted), `FIELD_LABELS` (name/email/phone/preferences/history/points → es-ES).
- **Demo data**:
  - `DEMO_MATCHES`: 5 duplicados (dup-001 a dup-005) cubriendo los 4 escenarios del spec:
    1. dup-001 "Elena Marín" vs "Elena Marín García" — HIGH (email+phone match, name no)
    2. dup-002 "Javier Soler" vs "J. Soler" — MEDIUM (phone match, email no)
    3. dup-003 "Marta Iborra" vs "Marta I." — AMBIGUOUS (phone match, email no, name partial)
    4. dup-004 "Andrés Vidal" vs "Andres Vidal" — LOW (no field matches, name similarity only)
    5. dup-005 "Lucía Pons" vs "Lucía Pons" — HIGH (all fields match)
  - `DEMO_MERGE_HISTORY`: 5 merges (mr-001 a mr-005) con source→target, fieldsMerged, reversed (mr-003 reversed), motivos (auto-merge vs manual).
  - `DEMO_RULES`: 7 reglas de matching (email exacto, teléfono normalizado, email+teléfono, nombre similar+teléfono, nombre similar+email diferente, customer code, identificador externo) con confidence, autoMerge, active.
- **Layout con Tabs**: Duplicados | Historial de merges | Reglas de matching.

#### Duplicados tab
- Header con count de propuestas pendientes + botón "Buscar duplicados" (loading 1s con RefreshCw animate-spin → toast "3 duplicados encontrados").
- MatchCard para cada duplicado:
  - Header: ID mono, Confidence badge (con dot color), Status badge, fecha propuesta.
  - **Warning ambiguo** (solo si confidence="ambiguous"): banner destructive "Confianza ambigua — requiere revisión manual. No fusionar automáticamente. Las señales entran en conflicto…".
  - 2 CustomerCards side-by-side (md:grid-cols-2) con CustomerCard component: side letter (A=teal, B=gold), customer.id mono, name font-display, email/phone mono con icons, lastVisit/visitCount en footer. CustomerCard soporta selectable mode (cursor-pointer, hover border gold, ring glow si primary).
  - Match reasons table: campo / valor A / valor B / match (✓ emerald o ✗ destructive).
  - Acciones (si status="proposed"): Fusionar (gold) / Rechazar (destructive outline) / Ver detalles (ghost). Si no proposed: solo Ver detalles.
- Note (info, teal): "Los perfiles no se fusionan automáticamente cuando existe ambigüedad. Las fusiones son reversibles y auditables."
- **Merge dialog** (max-w-2xl): selección de perfil primario (A o B) clickeable (CustomerCard selectable con isPrimary ring gold), visualización Source→Target con ArrowRight, **checkboxes de campos a fusionar** (name, email, phone, preferences, history, points) en grid 3-col con label interactiva, motivo textarea **obligatorio**, nota teal sobre reversibilidad. Validación: motivo required + al menos 1 campo.
- Reject dialog: motivo opcional → marca status=rejected.
- Details dialog (max-w-2xl): header con badges, 2 CustomerCards, comparativa campo por campo, fechas propuesta/resuelta, resolvedBy, reason.

#### Historial de merges tab
- Header con count total + count reversed + botón "Exportar historial".
- Desktop: tabla HTML (Source→Target con mono IDs + nombres, Fecha, Por, Campos como chips, Estado con Revertida badge + reversedAt, Acción Revertir).
- Mobile: cards apiladas con source→target, IDs mono, fecha/por, chips de campos, motivo, botón Revertir.
- **Revertir** AlertDialog: "Revertir fusión. Se restaurará el perfil original. Los datos creados después de la fusión se mantendrán en el perfil target." con confirmación.

#### Reglas de matching tab
- Header con count de reglas + count con auto-merge + botón "Nueva regla".
- Grid md:2 de rule cards: icono categoría, condition font-medium, description text-xs, confidence badge, dos switches (Auto-merge disabled si confidence != high con note, Activa).
- Toggle auto-merge en regla no-high-confidence → toast destructive "Auto-merge no disponible. Solo las reglas de alta confianza pueden fusionar automáticamente."
- Note (info, teal): "Las reglas de matching son configurables por organización. La fusión automática solo se permite para coincidencias de alta confianza. Las coincidencias ambiguas siempre requieren revisión manual."
- Nueva regla dialog: condition input, description textarea, confidence select (con descripción), auto-merge switch (disabled si no high).

### Estilo y UX (ambos archivos)
- Todos los archivos empiezan con `"use client";`.
- Tema dark premium: rp-glass para cards, gold (#D4AF37) para acciones primarias, teal (#3DD6C9) para info/auditabilidad, destructive para eliminación/anonimización/rechazo, amber para pending/ambiguous.
- Animaciones Framer Motion con `useReducedMotion()` (fallback sin motion cuando reduce=true). Solo transform (y) + opacity. AnimatePresence en listas y dialogs.
- Touch targets ≥44px: min-h-11 en botones primarios, min-h-[44px] en filas mobile y opciones de reglas.
- Responsive: matrices en desktop (lg:block) y cards apiladas en mobile (lg:hidden). Tablas con overflow-x-auto rp-scroll-thin. Sin overflow horizontal de página.
- Toda copy en español (es-ES). Fechas con toLocaleString("es-ES").
- DemoBadge en cada SectionTitle.
- AlertDialog para acciones destructivas (eliminación, anonimización, reversión de merge). Anonimización requiere TYPED confirmation "ANONIMIZAR".
- IDs mono (DR-2025-XXX, dup-XXX, mr-XXX, rule-X, aud-XXX).
- Notas explicativas (Note component) con copy exacto del spec.

### Lint y TypeScript
- `bun run lint` → 0 errores, 0 warnings.
- `bunx tsc --noEmit` → 0 errores en mis 2 archivos.
- Fix aplicado: refactoricé `seedConsent()` en crm-privacy.tsx para usar `SEED_GRID: Record<ConsentChannel, Record<ConsentPurpose, ConsentSeed>>` (en lugar de `Partial<Record<Partial<Record>>>`) para evitar error TS2769 en `Object.keys(grid[channel])`.
- Dev server compila limpio (✓ Compiled in 479ms en último build verificado).

## Stage Summary
- 2 archivos creados:
  - `src/components/rp/crm/crm-privacy.tsx` (~2050 líneas) — export `CrmPrivacy`
  - `src/components/rp/crm/crm-identity.tsx` (~1100 líneas) — export `CrmIdentity`
- **CrmPrivacy** cumple la spec completa: tipos exactos (ConsentChannel, ConsentPurpose, ConsentRecord con history, DataRequest con artifacts), 4 tabs (Consentimientos con matriz 5×5 + historial inmutable + note; Derechos de datos con 6 cards ARCO/POL; Solicitudes con tabla + filtros + detail dialog + nueva solicitud; Auditoría inmutable con filtros + export + note), retention policy card configurable al pie. Destructive flows (eliminación, anonimización) con AlertDialog; anonimización requiere TYPED confirmation. Consent service bloqueado con Lock icon. Click en toggle abre confirm dialog con explicación contextual. Cada acción genera entrada de auditoría + toast.
- **CrmIdentity** cumple la spec completa: tipos exactos (MatchConfidence, MergeStatus, DuplicateMatch con matchReasons, MergeRecord con fieldsMerged), 3 tabs (Duplicados con 5 demo matches cubriendo high/medium/low/ambiguous + MatchCard con 2 CustomerCards side-by-side + reasons table + acciones Fusionar/Rechazar/Ver detalles + warning ambiguo + scan button loading; Historial de merges con 5 records + Revertir AlertDialog; Reglas de matching con 7 rules + auto-merge solo para high + Nueva regla dialog). Merge dialog con selección de primario + checkboxes de campos + motivo obligatorio. Reversión con confirmación.
- GDPR compliance tratado en serio: consentimiento granular por canal×finalidad, historial inmutable, derechos ARCO/POL completos, anonimización con confirmación tipada, auditoría con IP redactada, política de retención por tipo de dato.
- Lint OK. TypeScript OK. Dev server OK.
- Pendiente: integración en `crm-view.tsx` (no requerida por esta tarea — los exports `CrmPrivacy` y `CrmIdentity` están listos para ser wired como tabs adicionales).
