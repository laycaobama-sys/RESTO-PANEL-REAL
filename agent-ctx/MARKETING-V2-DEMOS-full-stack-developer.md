# Task ID: MARKETING-V2-DEMOS
# Agent: full-stack-developer

## Task
Construir 6 componentes demo interactivos para el landing v2 de RestoPanel (plano de mesas, CRM, IA copiloto, reseñas Google, calculadora de ROI, FAQ). Next.js 16 + TypeScript + Tailwind CSS v4 + Framer Motion. Tema dark premium (gold #D4AF37, turquoise #3DD6C9, glassmorphism).

## Contexto previo consultado
- `/home/z/my-project/worklog.md` — estado general del proyecto (Next.js 16 listo, dev server activo en :3000, design tokens en globals.css con `rp-glass`/`rp-glass-strong`/`rp-gold-text`/`rp-teal-text`/`rp-glow-gold`/`rp-scroll-thin`).
- `src/components/rp/primitives.tsx` — patrones: GlassCard, Tag, Stat, Pill, DataTable, GoldList, Callout, Code.
- `src/components/rp/reservas/floor-editor.tsx` — patrones de estado de mesas y zonas.
- `src/components/rp/crm/crm-view.tsx` — patrón de chips de alérgenos, VIP, lista de clientes.
- `src/components/rp/reviews/reviews-view.tsx` — patrón de distribución de estrellas y respuestas IA.
- `src/components/rp/ai-center/ai-copilot.tsx` — patrón de chat con streaming y typing indicator.
- `src/app/globals.css` — tokens `--gold`, `--gold-soft`, `--gold-deep`, `--teal`, `--teal-deep`, `prefers-reduced-motion`.
- `src/hooks/use-toast.ts` y `src/components/ui/toaster.tsx` — pattern de toast (función `toast` exportada + `<Toaster />` instalado en `layout.tsx`).

## Archivos creados (6)

### 1. `src/components/rp/marketing/demo-floor.tsx` — `DemoFloor`
Plano de mesas interactivo:
- 12 mesas (4 redondas · 4 cuadradas · 4 rectangulares) en 2 zonas (Sala + Terraza) con grid sutil de fondo.
- Drag and drop con pointer events (sin librerías externas, soporta touch y ratón).
- Click en mesa → cicla estado `free → reserved → occupied → cleaning → free`.
- Estados coloreados: free=emerald, reserved=gold, occupied=rose, cleaning=amber.
- **Timeline bar** inferior con servicio 13:00–23:00, bloques de reserva coloreados por estado, marcador "ahora" 19:42 turquesa.
- Toggle "Tiempo real" — cuando ON, simula servicio de viernes ×60: cada 2.4s cicla estado de 1-2 mesas aleatorias (deshabilita drag).
- Panel lateral con: % ocupación, próximas 3 reservas, leyenda con 4 estados y contadores, hint "Arrastra las mesas".
- Botón "Reiniciar" restaura el estado inicial.
- Badge "demo" + nota inferior de datos de demostración.
- Responsive: `min-w-[640px]` con `overflow-x-auto rp-scroll-thin` en móvil.
- Animaciones transform+opacity con `useReducedMotion()` respetado.

### 2. `src/components/rp/marketing/demo-crm.tsx` — `DemoCrm`
CRM interactivo:
- Layout 2 columnas: listado de 6 clientes (izquierda) + perfil seleccionado (derecha).
- Cada cliente en lista: avatar gradiente (iniciales), nombre, badge VIP (corona), visitas, última visita, chevron indicator.
- Perfil seleccionado: avatar gradiente grande, nombre, VIP badge, **LTV grande dorado**, ticket medio, visitas + última visita.
- 3 chips de preferencias: alérgenos, mesa favorita, zona preferida.
- "Próximo cumpleaños: N días" (badge turquesa) + notas internas (amber).
- Timeline vertical de visitas (4-5 visitas por cliente) con stagger animado: fecha, party size, mesa, rating en estrellas doradas.
- **Segment builder** inferior: 5 chips de regla (VIP, Sin visita 30d, Ticket > 60€, Alergia gluten, Zona Terraza) toggglable → recuento "N clientes" recalculado en vivo sobre base demo de 2.180.
- Badge "demo" + nota inferior.
- Responsive: 1 col en móvil, 2 cols en lg.

### 3. `src/components/rp/marketing/demo-ai.tsx` — `DemoAi`
Copiloto IA (scripted, sin API):
- Conversación pre-cargada auto-play al montar:
  - User: "¿Cuántos clientes VIP no vienen desde hace 30 días?"
  - IA (tras "Pensando..." 900ms): "18 clientes. Suman 11.240€ de gasto histórico." + mini-card con 18 avatar dots dorados animados + bar chart de recencia (4 buckets 30-45d/46-60d/61-90d/90+d) + botones "Crear campaña" y "Ver listado".
  - IA (segundo mensaje): "¿Creo una campaña de recuperación por WhatsApp?"
- **Typewriter effect** a ~35 chars/seg (intervalo 28ms) con cursor dorado pulsante. Respeta `prefers-reduced-motion` (instantáneo).
- Botón "Crear campaña" → composer animado: aparecen secuencialmente (600/1200/1800ms) 3 filas (Audiencia, Canal, Plantilla) + coste estimado + CTA "Lanzar ahora" (toast) + "Cerrar".
- **3 chips de prompt sugeridos** (aparecen tras conversación inicial, clickables):
  - "¿Qué mesa genera más ingresos?" → respuesta + bar chart top 5 mesas por ingresos (turquesa)
  - "¿Cuánto facturaré mañana?" → respuesta + bar chart pronóstico 5 días (con sábado destacado en dorado)
  - "¿Qué reseñas necesitan respuesta urgente?" → respuesta + lista de 2 reseñas urgentes (rose, con estrellas y snippet)
- "Pensando..." indicator con 3 dots animados (stagger 0.18s, opacity 0.3→1→0.3).
- Auto-scroll del contenedor de chat.
- Badge "demo" + nota "IA simulada con datos de demostración. No requiere conexión."

### 4. `src/components/rp/marketing/demo-reviews.tsx` — `DemoReviews`
Reseñas Google:
- **Distribución de valoraciones**: 5 barras (5★→1★) animadas con `whileInView` (width 0→pct%, delay escalonado).
- **Evolución 12 meses**: SVG line chart 4.6→4.9★ con gradiente dorado, área degradada, puntos, `pathLength` animation (1.2s easeInOut), etiquetas de meses y guías horizontales.
- **Topic cloud**: 6 temas con tamaño por frecuencia (#comida 3xl gold-soft, #servicio 2xl gold-soft, #ambiente 2xl gold-soft, #precio xl muted, #espera lg rose, #limpieza sm rose).
- **Reseña + respuesta IA**: tarjeta de reseña entrante (María García, 5★, texto real en español) + tarjeta IA con **typewriter** (24ms/char) de la respuesta sugerida. Botón "Variante" regenera. Botones "Publicar" (toast) y "Editar" (toast).
- Comparativa tiempo de respuesta: "Antes: 48h media → Ahora: 2 min con IA" + "-99,9% tiempo de respuesta · +34% conversión a nueva visita".
- Badge "demo" + nota inferior.

### 5. `src/components/rp/marketing/roi-calculator.tsx` — `RoiCalculator`
Calculadora de ROI (sección de mayor conversión):
- Layout 2 columnas: inputs izquierda, outputs derecha **sticky** (`lg:sticky lg:top-6`).
- **5 inputs** (Slider + Input numérico sincronizados):
  - Reservas al mes: 300 (50-2000)
  - Ticket medio: €48 (15-200)
  - No-show actual: 18% (0-40)
  - Personas en sala: 7 (1-30)
  - Horas semanales gestión manual: 12h (2-40)
- **Outputs** con **count-up animation** (rAF + easeOutCubic, 600ms):
  - Big number "Puedes recuperar €18.430 al año" (gold, display 4xl/5xl).
  - Breakdown 4 filas (icono + label + valor mono):
    - No-shows evitados: €9.720/año — `reservas × 12 × no-show% × ticket × 31%`
    - Mesas vía waitlist: €4.180/año — `reservas × 12 × no-show% × ticket × 13,4%`
    - Horas liberadas: €3.100/año — `horas × 15€ × 52 × 33%`
    - Uplift CRM: €1.430/año — `reservas × 12 × ticket × 0,83%`
  - Payback: 1.4 meses (turquesa) — `(plan €1.788 + onboarding €400) / (ahorro anual / 12)`
  - ROI año 1: 412% (gold) — `(ahorro − coste efectivo €3.599) / coste efectivo × 100`
- **"Ver fórmula"** expandible (Framer Motion height auto): muestra 6 filas con label + fórmula mono + asunción itálica.
- CTAs: "Enviarme el informe" (toast) + "Descargar PDF" (toast).
- Disclaimer con checkmark turquesa: "Estimaciones basadas en datos de la industria. No son garantías."
- Badge "demo".
- Inputs sincronizados bidireccional (slider → input, input → slider), clamp min/max.

### 6. `src/components/rp/marketing/faq-section.tsx` — `FaqSection`
FAQ con structured data:
- 12 preguntas reales en español (es-ES): migración CoverManager, permanencia, TPVs compatibles, RGPD, IA, instalación, multi-local, cancelación, soporte español, formación, móvil, ROI.
- Cada respuesta 2-3 frases concretas.
- Accordion custom con Framer Motion (height 0→auto, opacity 0→1, 0.25s easeInOut), numeración 01-12 en círculo, chevron rotación 180°.
- Una sola sección abierta a la vez (toggle).
- Stagger entrance con `whileInView` (delay escalonado hasta 0.3s).
- **JSON-LD `FAQPage` schema** en `<script type="application/ld+json">` con las 12 preguntas/respuestas.
- CTA "Contactar" inferior: card con icono MessageCircle en círculo dorado + 2 botones ("Contactar" → toast, "Reservar demo" → toast).
- Header centrado con eyebrow "FAQ" + título display 5xl + badge "demo".

## Características comunes (todas las demos)
- `"use client";` en la primera línea de los 6 archivos.
- Animaciones transform + opacity exclusivamente, `useReducedMotion()` respetado en todas las animaciones.
- Copy en español (es-ES), datos demo badged "demo".
- Touch targets ≥44px (min-h-[44px] en botones, min-h-[36px] en chips, min-h-[64px] en accordion items).
- Sin overflow horizontal en móvil (overflow-x-auto rp-scroll-thin donde hace falta).
- Sin colores indigo/azul excepto donde el spec lo requiere (avatar gradientes CRM usan fuchsia/purple/teal/amber/emerald, nunca indigo).
- Toaster ya instalado globalmente en `src/app/layout.tsx`.
- `framer-motion` ya en package.json (v12.23.2).

## Lint status
- `cd /home/z/my-project && bun run lint 2>&1 | tail -15` → **0 errores, 0 warnings**. Solo el output de `$ eslint .` sin nada más.
- Verificación adicional: `npx eslint src/components/rp/marketing/` → limpio.
- Dev server: `tail dev.log` muestra compilación 200 OK sin errores (`✓ Compiled in 300ms` aprox).

## Stage Summary
- 6 archivos nuevos en `src/components/rp/marketing/`: demo-floor.tsx, demo-crm.tsx, demo-ai.tsx, demo-reviews.tsx, roi-calculator.tsx, faq-section.tsx.
- Todos exportan nombre + default.
- Listos para integrarse como secciones del landing en `src/app/page.tsx` (que el main agent puede wirear).
- Lint: 0 errores, 0 warnings. Dev server 200 OK.
- Cumplen todos los requisitos: typewriter (35 char/seg en IA, 24 char/seg en reviews), "Pensando..." 3 dots animados, segment builder live, count-up rAF en ROI, JSON-LD FAQPage, badges "demo", responsive 2-col→1-col, touch targets ≥44px, prefers-reduced-motion respetado.
