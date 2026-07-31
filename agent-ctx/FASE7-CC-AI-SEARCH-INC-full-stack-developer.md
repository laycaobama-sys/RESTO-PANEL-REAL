# Task: FASE7-CC-AI-SEARCH-INC
Agent: full-stack-developer

## Task
Construir 3 componentes del Command Center Fase 7 (Super Admin) para RestoPanel:
- cc-executive-ai.tsx (IA Ejecutiva conversacional con evidencias)
- cc-search.tsx (búsqueda global tipo Spotlight con búsqueda semántica)
- cc-incidents.tsx (centro de incidencias con resumen IA)

Stack: Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, premium dark theme (gold #D4AF37, turquoise #3DD6C9, glassmorphism). Todo en español (es-ES), datos demo con badge, política "no inventar datos".

## Work Log
- Leí worklog.md y revisé patrones existentes: rp-glass, rp-glass-strong, rp-gold-text, rp-teal-text, rp-glow-teal, rp-scroll-thin, DemoBadge compartida, SectionTitle. Tokens de marca en globals.css confirmados.
- Revisé cc-platform-health.tsx (creado por otro agente Fase 7) para alinear estilo: header rp-glass-strong con icono en caja coloreada + DemoBadge + descripción + stats; cards rp-glass en grid responsivo; disclaimer "datos simulados" al pie.
- Revisé super-admin-view.tsx para coherencia (KPIs, ORGS, INFRA_STATUS, INCIDENTS).

### File 1: cc-executive-ai.tsx (~660 líneas)
- Export `CcExecutiveAi`. Todo `"use client"`.
- Tipos: Confidence (alta/media/baja), AiResponse (respuesta, datos, evidencias[], confianza{level,pct}, limitaciones?, acciones[], requiereAprobacion?, fuentes[], herramientas[]), ChatMessage (id, role, text?, response?, ts).
- Header rp-glass-strong: icono Sparkles en caja gold + título "IA Ejecutiva" + DemoBadge + descripción; a la derecha modelo "glm-4-flash · AI Gateway" con dot teal pulsante + botón "Historial".
- Chat area: scroll rp-scroll-thin max-h-[640px] min-h-[420px]. Intro de sesión centrada.
- UserMessage: burbuja derecha gold tint (border + bg gold), ts mono debajo.
- AiMessage: glass card con:
  * Header (Sparkles + "IA Ejecutiva · ts" + DemoBadge)
  * Respuesta ejecutiva (párrafo)
  * Datos analizados (Database icon + texto mono)
  * Evidencias (lista CheckCircle2 teal)
  * Confianza + Limitaciones (ConfidenceBadge Alta/Media/Baja con dot coloreado + AlertTriangle amber para limitaciones)
  * Acciones recomendadas (chips gold con ArrowUpRight + nota "Requiere aprobación · Lock" cuando aplica)
  * Fuentes citadas (chips mono neutros)
  * Herramientas utilizadas (chips mono teal: query_mrr, list_orgs, forecast_model, etc.)
  * Footer "no inventar datos": ShieldCheck teal + texto política
- 8 preguntas sugeridas en chips encima del input (mín 32px touch).
- Input box: input grande + kbd Enter + botón "Enviar" gold con estado loading (Loader2 spin).
- Suggested questions clickable → envía directamente.
- Conversación demo precargada: 1 user ("¿Qué restaurantes están perdiendo clientes?") + 1 AI con respuesta exacta del spec (Ramses -12%, Beach Club -8%, Sushi Bar VIP, confianza Alta 84%, limitación walk-ins, 3 acciones, 3 fuentes, 3 herramientas).
- Al enviar pregunta nueva: TypingIndicator (3 dots teal animados + "IA ejecutiva analizando datos…") por 1.1-2s, luego respuesta GENÉRICA PLAUSIBLE de un pool de 3 plantillas. TODAS las cifras marcadas "(demo)" para honrar "no inventar datos".
- Security notice al pie: rp-glass con ShieldCheck teal + texto exacto del spec (herramientas autorizadas, permisos antes de recuperar, no acceso libre a DB, correlation_id, política no inventar datos).
- Historial Dialog: lista queries con correlation_id demo.
- Responsivo: chips wrap, input full-width, max-w burbujas usuario.

### File 2: cc-search.tsx (~780 líneas)
- Export `CcSearch`. Spotlight/Command Palette style.
- Header rp-glass-strong: icono Search teal + título + DemoBadge + badge "Búsqueda semántica activa (Vectorize)" teal + botón "Búsqueda avanzada".
- Search bar rp-glass-strong con glow teal cuando focused: icono Search (cambia a teal al focus), input grande text-lg, botón limpiar X, kbd ⌘K.
- ⌘K / Ctrl+K global listener para enfocar.
- Dropdown panel AnimatePresence: absoluto top-full mt-2, rp-glass-strong, max-h-[70vh] scroll rp-scroll-thin.
- Datos demo: 15 items en 7 entidades (3 orgs, 2 locales, 4 clientes, 2 reservas, 1 factura, 1 incidencia, 2 docs). Cada item: id, type, title, subtitle, metadata, meta2, tags.
- ENTITY_META: 7 tipos con icono (Building2, Store, Users, CalendarCheck, FileText, AlertTriangle, BookOpen) y accent gold/teal/rose.
- Resultados agrupados por tipo en orden: Organizaciones → Locales → Clientes → Reservas → Facturas → Incidencias → Documentación. Cada grupo con header (icono + plural + count chip).
- Highlight matches: función `highlight` que rodea el término con `<mark>` gold.
- matchScore: scoring por title (100), subtitle (60), metadata (30), tag (20). Sort descendente.
- Cada result row: icono en caja, título + subtitle con highlight, metadata mono con highlight, meta2, chip VIP (Star gold). Mín 44px touch.
- Keyboard nav: ↑↓ mover active (ring teal + bg teal), Enter abrir (toast "Navegando a..."), Esc cerrar. Mouseenter actualiza active.
- Empty state "Sin resultados" con icono Search + botón "Búsqueda avanzada".
- Recent searches: 5 chips (Ramses, VIP Gold, INC-2025-001, MRR < 1000, no-shows Marbella) cuando query vacío. Se actualiza al navegar.
- Footer del dropdown: kbd hints (↑↓ navegar, Enter abrir, esc cerrar) + count + "Vectorize · N resultados".
- Helper chips debajo: Ramses, VIP, INC-2025, Beach Club, FAC-2025.
- Búsqueda avanzada Dialog: Select tipo entidad (8 opciones), Select organización (4), Select rango fechas (5), Input términos adicionales + nota Vectorize. Botones Limpiar / Aplicar.

### File 3: cc-incidents.tsx (~840 líneas)
- Export `CcIncidents`. Tipos exportados IncidentSeverity (critical/high/medium/low) + IncidentStatus (open/investigating/identified/monitoring/resolved).
- SEVERITY_META: critical=rose AlertOctagon, high=amber AlertTriangle, medium=gold AlertTriangle, low=muted AlertTriangle.
- STATUS_META: open=rose, investigating=amber, identified=gold, monitoring=teal, resolved=emerald. Cada uno con label/dot/cls/icon.
- SERVICE_ICON: API=Server, D1=Database, Queues=Mail, AI Gateway=BrainCircuit, Stripe=CreditCard, Reservations=CalendarCheck, Workers=Cpu, KV=Database.
- Header rp-glass-strong: icono AlertTriangle rose + "Centro de incidencias" + DemoBadge + descripción + botón "Nueva incidencia" gold.
- Stats grid 3 cols: Abiertas (rose), Investigando (amber), Críticas hoy (foreground).
- Filter bar rp-glass: status tabs (Todas/Abiertas/Investigando/Resueltas) con count chips + barra search (Input con icono) + Select severidad. Tabs con role="tablist"/"tab" aria-selected, scroll-x en móvil, min-h 40px.
- IncidentCard (rp-glass rounded-2xl p-4 sm:p-5):
  * Header: icono severidad en caja + ID mono + sev badge + status badge + título + impacto + createdAt
  * Grid 2 cols: servicios afectados (chips con icono) + organizaciones afectadas (count + names chips)
  * Responsable: avatar circular (iniciales gold o dashed muted si "Pendiente")
  * AI summary: caja teal accent (border + bg teal/[0.06]) con BrainCircuit + "Resumen IA" + DemoBadge + párrafo
  * Grid 2 cols: 2 MiniChart (error rate rose, latencia gold) + timeline
  * MiniChart: SVG sparkline con gradient fill, label mono, último valor destacado
  * Timeline: lista vertical con dot coloreado por status (rose/amber/gold/teal/emerald) + at mono + label + detail
  * Actions: Ver detalles (Eye), Asignar (UserPlus), Escalar (ArrowUp), Cerrar (XCircle rose outline) con min-h 32px
- 5 incidentes demo exactos del spec:
  1. INC-2025-001 critical investigating "Pico de errores 500 en API" 3 orgs API/D1
  2. INC-2025-002 high identified "Latencia elevada en AI Gateway" 1 org AI Gateway
  3. INC-2025-003 medium monitoring "Queue de emails retrasada" 12 orgs Queues
  4. INC-2025-004 low resolved "Webhook de Stripe duplicado" 1 org Stripe
  5. INC-2025-005 medium open "Aumento de no-shows en Ramses Barcelona" 1 org Reservations
- Acciones: details → IncidentDetailsDrawer (Drawer right con AI summary + charts + timeline completa + orgs); assign → toast; escalate → toast; close → AlertDialog confirmación → marca resolved + añade entrada timeline + toast.
- NewIncidentDialog: título (Input), severidad (Select 4 opciones), servicios afectados (chips toggle 8 opciones), descripción (Textarea). Crea INC-2025-006+ con timeline inicial y AI summary "Pendiente".
- Stats derivadas con useMemo. filtered con useMemo. AnimatePresence mode="popLayout" para lista.
- Empty state cuando no hay resultados con CheckCircle2 emerald.
- Footer: Zap gold + "datos demo · correlaciones con correlation_id registradas".

## Stage Summary
- 3 archivos creados:
  * `/home/z/my-project/src/components/rp/superadmin/cc-executive-ai.tsx` (~660 líneas)
  * `/home/z/my-project/src/components/rp/superadmin/cc-search.tsx` (~780 líneas)
  * `/home/z/my-project/src/components/rp/superadmin/cc-incidents.tsx` (~840 líneas)
- Todos empiezan con `"use client";`. Exportes `CcExecutiveAi`, `CcSearch`, `CcIncidents`.
- Tipos exportados en cc-incidents: IncidentSeverity, IncidentStatus.
- Stack: Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion (motion + AnimatePresence), shadcn/ui (Dialog, AlertDialog, Drawer, Select, Input, Textarea, Label, Button, Badge), lucide-react.
- Tema: dark premium con gold #D4AF37 + turquoise #3DD6C9 + glassmorphism (rp-glass / rp-glass-strong / rp-glow-teal / rp-scroll-thin / rp-grid-bg). Sin indigo/blue.
- Todo copy es-ES. Demo badge (amber) en cada header y en cajas IA. Política "no inventar datos": cifras no-demo solo de fuente citada; cifras demo marcadas explícitamente "(demo)".
- IA responses incluyen TODOS los campos requeridos: Respuesta ejecutiva, Datos analizados (periodo + fuente), Evidencias, Confianza (badge Alta ≥80% / Media ≥60% / Baja <60%), Limitaciones, Acciones recomendadas (chips + "Requiere aprobación"), Fuentes citadas (chips), Herramientas utilizadas (mono).
- Búsqueda: keyboard nav completo (↑↓ Enter Esc), highlight matches, agrupado por 7 tipos, recent searches, búsqueda avanzada dialog, badge semántica Vectorize.
- Incidencias: 5 demo exactos del spec, timeline vertical, AI summary teal, mini charts SVG, acciones con confirmación AlertDialog, nueva incidencia dialog.
- Responsive: layouts stacked en móvil, touch targets ≥32-44px, sin overflow horizontal, scroll-x en tabs cuando necesario, max-w en burbujas de chat.
- Lint: `bun run lint` → 0 errores, 0 warnings. TypeScript: mis 3 archivos no aparecen en `tsc --noEmit` (errores restantes son de archivos preexistentes no tocados: floor-editor, reservas-view, waitlist-panel, integrations-view, cc-feature-flags, landing, examples/, skills/).
- Dev server: compilando OK (GET / 200, compile ~250-400ms).
- No se modificó page.tsx ni super-admin-view.tsx (los componentes son autocontenidos y se integran como tabs desde la fase de integración).

## Próximos pasos sugeridos (para integrador)
- Integrar como tabs en super-admin-view.tsx: añadir tabs "IA Ejecutiva", "Búsqueda", "Incidencias" junto a "Salud plataforma" (cc-platform-health) y "Feature flags" (cc-feature-flags) ya creados por otros agentes.
- Verificar que los iconos Drawer direction="right" funcionan en mobile (vaul).
- Considerar conectar cc-executive-ai con endpoint /api/executive-ai real vía AI Gateway cuando esté disponible (mock actual con pool de respuestas demo).
