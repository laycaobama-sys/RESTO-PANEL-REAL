# FASE8-DEV-API · full-stack-developer

## Task
Construir 2 componentes para Fase 8 (Open Platform — Developer Portal + API Explorer) en Next.js 16 + TypeScript + Tailwind v4 con tema premium dark (dorado #D4AF37, turquesa #3DD6C9, glassmorphism).

## Files created
- `/home/z/my-project/src/components/rp/platform/dev-portal.tsx` — `DevPortal` export
- `/home/z/my-project/src/components/rp/platform/api-explorer.tsx` — `ApiExplorer` export

## Key features

### DevPortal (dev-portal.tsx)
- 5 tabs: API Keys | OAuth | Sandbox | Uso | Documentación
- **API Keys**: tabla desktop + card list móvil, 4 keys demo, masking secret con Mostrar/Ocultar, webhook secret con copy, scope chips, env/status badges, acciones (Copiar, Rotar AlertDialog, Revocar AlertDialog con warning de impacto). Diálogo Crear API key con grid de 10 scopes. Diálogo post-creación que revela secret una sola vez. Nota de seguridad en dorado.
- **OAuth**: 6 conexiones (Google, Meta, Microsoft, Slack, HubSpot, Notion) con status pill, scopes, fechas. Botones Conectar (diálogo consentimiento), Reautorizar, Desconectar.
- **Sandbox**: badge "Modo sandbox", base URL copiable, datos de prueba, tarjetas Stripe, snippet curl con copy, diálogo Resetear.
- **Uso**: 4 KPIs, gráfico SVG line+area 30 días, tabla Top endpoints, 2 cards Rate limits con progress bars.
- **Documentación**: sidebar 11 secciones, OpenAPI/Postman/GraphQL, code snippets 3 lenguajes (TS/Python/curl) con tabs.

### ApiExplorer (api-explorer.tsx)
- Layout 3 columnas desktop → stacked móvil/tablet.
- **Left**: árbol de 6 grupos / 19 endpoints, búsqueda, expand/collapse, method badges.
- **Center**: method+path read-only, headers editables (Auth prefill sk_test_, Idempotency-Key con Generar), query params editables (GET), body editor JSON con formateador y byte counter (POST/PATCH), botón Enviar (gold, loading state), botón Copiar cURL.
- **Right**: status badge por código, response time, request ID, headers colapsables, body JSON con syntax highlighting via regex (keys turquesa, strings verde, números ámbar, bool fucsia, null gris). Estado vacío antes de enviar. Notas contextuales verde/rosa. Demo response por endpoint (incluye error 403 para DELETE).

## Stack
- Next.js 16, TypeScript, Tailwind v4, shadcn/ui (Tabs, Dialog, AlertDialog, Select, Input, Label, Button, Badge, Checkbox, Collapsible)
- Design system: rp-glass, rp-gold-text, rp-teal-text, rp-glow-gold, rp-scroll-thin, rp-divider
- Lucide icons + inline SVG para árboles de recursos

## Responsive
- Desktop: tabla completa (API Keys), 3 columnas (Explorer)
- Tablet: stacked/2-col
- Móvil: card list, fully stacked, touch targets ≥44px, no horizontal overflow

## Copy & data
- Todo en es-ES. Datos demo, badged con "demo" en ámbar.

## Lint status
- `bun run lint` → ✅ 0 errors, 0 warnings
- Dev server compila limpio (dev.log sin errores)

## Integration notes
- Componentes self-contained, listos para integrarse en app-shell cuando se añada la sección `platform` al nav-store.
- Para montar: lazy-importar como el resto de secciones en `SectionRenderer` (app-shell.tsx).
