/**
 * Feature flags catalog + plan matrix (spec D.5).
 *
 * Three plans: starter | professional | enterprise.
 * Each feature row encodes per-plan access:
 *   - true  = unlimited access
 *   - false = blocked (no access)
 *   - number = quota (numeric limit, 0 = blocked, -1 = unlimited)
 *
 * The Gate component (<Gate feature="...">) and the useFeature hook
 * consume this catalog via the entitlements store (see
 * @/components/ui/feature-gate).
 *
 * Source of truth for the License Engine resolution.
 */

export type PlanId = "starter" | "professional" | "enterprise";

export type FeatureValue = boolean | number;

/** Stable, dotted feature keys used by the Gate component. */
export const FEATURE_FLAGS = {
  // Núcleo operativo
  pos: "tpv",
  kds: "kds",
  pda: "pda",
  // Carta digital
  qrMenu: "carta-qr",
  orderPay: "order-pay",
  multilangMenu: "carta-multilingue",
  // Reservas
  reservations: "reservas",
  floorPlan: "floor-plan",
  waitlist: "waitlist",
  demandForecast: "prediccion-demanda",
  yieldPricing: "yield-pricing",
  // Delivery
  deliveryOwn: "delivery-propio",
  deliveryAggregators: "delivery-agregadores",
  // CRM
  crmProfiles: "crm-perfiles",
  crmSegmentation: "crm-segmentacion",
  emailCampaigns: "campanas-email",
  whatsappBusiness: "whatsapp-business",
  loyalty: "fidelizacion",
  // Reputación
  aiReviewReplies: "respuestas-ia-reseñas",
  npsSurveys: "encuestas-nps",
  // Inventario
  recipes: "escandallos",
  stockCounts: "recuentos",
  suppliers: "proveedores",
  // Analítica
  opsDashboard: "dashboard-operativo",
  dataExport: "exportacion-csv",
  benchmarks: "benchmarks-colectivos",
  // Automatización
  triggers: "triggers",
  multiStepWorkflows: "workflows-multi-paso",
  // API
  apiRead: "api-lectura",
  apiWrite: "api-escritura",
  webhooks: "webhooks-salientes",
  // Organización
  multiLocation: "multi-local",
  customRoles: "roles-personalizados",
  granularPerms: "permisos-granulares",
  auditLog: "audit-log",
  // Soporte
  supportEmail: "soporte-email",
  supportChat: "soporte-chat",
  onboardingDedicated: "onboarding-dedicado",
  // Plataforma (internas)
  healthScore: "health-score",
  csmPortfolio: "csm-portfolio",
  playbookEngine: "playbook-engine",
  copilotAi: "copilot-ia",
  saasMetrics: "saas-metrics",
  menuEngineering: "menu-engineering",
  baseline: "baseline",
} as const;

export type FeatureKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

export interface FeatureCatalogEntry {
  key: FeatureKey;
  label: string;
  category: FeatureCategory;
  /** Short marketing-style description (ES). */
  description: string;
  /** Plans where this feature is unlocked (derived from PLAN_FEATURES). */
  minPlan?: PlanId;
}

export type FeatureCategory =
  | "Núcleo operativo"
  | "Carta digital"
  | "Reservas"
  | "Delivery"
  | "CRM"
  | "Reputación"
  | "Inventario"
  | "Analítica"
  | "Automatización"
  | "API"
  | "Organización"
  | "Soporte"
  | "Plataforma";

export const FEATURE_CATALOG: FeatureCatalogEntry[] = [
  // Núcleo operativo
  { key: "tpv", label: "TPV", category: "Núcleo operativo", description: "Terminal punto de venta y cobro." },
  { key: "kds", label: "KDS (pantallas cocina)", category: "Núcleo operativo", description: "Visualización de comandas en cocina." },
  { key: "pda", label: "Comandero PDA", category: "Núcleo operativo", description: "Toma de comandas en sala desde móvil." },
  // Carta digital
  { key: "carta-qr", label: "Carta QR dinámica", category: "Carta digital", description: "Carta digital con QR y edición en vivo." },
  { key: "order-pay", label: "Order & Pay", category: "Carta digital", description: "Pedido y pago directo desde la carta QR.", minPlan: "professional" },
  { key: "carta-multilingue", label: "Carta multilingüe", category: "Carta digital", description: "Traducciones automáticas de carta.", minPlan: "professional" },
  // Reservas
  { key: "reservas", label: "Motor de reservas", category: "Reservas", description: "Calendario y gestión de reservas online." },
  { key: "floor-plan", label: "Floor plan interactivo", category: "Reservas", description: "Mapa de mesas arrastrable.", minPlan: "professional" },
  { key: "waitlist", label: "Lista de espera inteligente", category: "Reservas", description: "Waitlist con SMS automático.", minPlan: "professional" },
  { key: "prediccion-demanda", label: "Predicción IA de demanda", category: "Reservas", description: "Forecast de ocupación por franja.", minPlan: "professional" },
  { key: "yield-pricing", label: "Yield pricing por franja", category: "Reservas", description: "Pricing dinámico por franja horaria.", minPlan: "enterprise" },
  // Delivery
  { key: "delivery-propio", label: "Delivery propio", category: "Delivery", description: "Pedidos delivery directos desde tu web.", minPlan: "professional" },
  { key: "delivery-agregadores", label: "Agregadores (Glovo/Uber)", category: "Delivery", description: "Integración con agregadores.", minPlan: "professional" },
  // CRM
  { key: "crm-perfiles", label: "Fichas de cliente", category: "CRM", description: "Base de datos de clientes con historial." },
  { key: "crm-segmentacion", label: "Segmentación", category: "CRM", description: "Etiquetas y segmentos dinámicos.", minPlan: "professional" },
  { key: "campanas-email", label: "Campañas email", category: "CRM", description: "Envíos masivos con plantillas." },
  { key: "whatsapp-business", label: "WhatsApp Business", category: "CRM", description: "Mensajería WhatsApp vía API oficial.", minPlan: "enterprise" },
  { key: "fidelizacion", label: "Fidelización (sellos)", category: "CRM", description: "Programa de sellos y recompensas.", minPlan: "professional" },
  // Reputación
  { key: "respuestas-ia-reseñas", label: "Respuestas IA a reseñas", category: "Reputación", description: "Respuestas sugeridas a reseñas Google/TripAdvisor.", minPlan: "professional" },
  { key: "encuestas-nps", label: "Encuestas NPS automáticas", category: "Reputación", description: "NPS post-visita automatizado.", minPlan: "professional" },
  // Inventario
  { key: "escandallos", label: "Escandallos", category: "Inventario", description: "Cálculo de coste por plato.", minPlan: "professional" },
  { key: "recuentos", label: "Recuentos", category: "Inventario", description: "Recuentos de stock periódicos.", minPlan: "professional" },
  { key: "proveedores", label: "Gestión de proveedores", category: "Inventario", description: "Órdenes de compra y proveedores.", minPlan: "professional" },
  // Analítica
  { key: "dashboard-operativo", label: "Dashboard operativo", category: "Analítica", description: "KPIs en tiempo real del local." },
  { key: "exportacion-csv", label: "Exportación CSV/Excel", category: "Analítica", description: "Descarga de datos en CSV/XLSX.", minPlan: "professional" },
  { key: "benchmarks-colectivos", label: "Benchmarks colectivos", category: "Analítica", description: "Comparativa anónima con el sector.", minPlan: "enterprise" },
  // Automatización
  { key: "triggers", label: "Triggers (no-show, cumpleaños)", category: "Automatización", description: "Disparadores automáticos de acciones." },
  { key: "workflows-multi-paso", label: "Workflows multi-paso", category: "Automatización", description: "Encadenamiento de acciones condicionales.", minPlan: "professional" },
  // API
  { key: "api-lectura", label: "API lectura", category: "API", description: "Endpoints GET públicos." },
  { key: "api-escritura", label: "API escritura", category: "API", description: "Endpoints POST/PUT/PATCH.", minPlan: "enterprise" },
  { key: "webhooks-salientes", label: "Webhooks salientes", category: "API", description: "Notificaciones HTTP a sistemas externos.", minPlan: "enterprise" },
  // Organización
  { key: "multi-local", label: "Multi-local", category: "Organización", description: "Gestión de varios locales desde una cuenta." },
  { key: "roles-personalizados", label: "Roles personalizados", category: "Organización", description: "Crea roles a medida.", minPlan: "professional" },
  { key: "permisos-granulares", label: "Permisos granulares", category: "Organización", description: "Permisos por módulo y acción.", minPlan: "professional" },
  { key: "audit-log", label: "Audit log", category: "Organización", description: "Trazabilidad de cambios.", minPlan: "professional" },
  // Soporte
  { key: "soporte-email", label: "Soporte email", category: "Soporte", description: "Atención por email." },
  { key: "soporte-chat", label: "Soporte chat", category: "Soporte", description: "Atención por chat en vivo.", minPlan: "professional" },
  { key: "onboarding-dedicado", label: "Onboarding dedicado", category: "Soporte", description: "CSM dedicado y onboarding presencial.", minPlan: "enterprise" },
  // Plataforma (internas)
  { key: "health-score", label: "Health Score IA", category: "Plataforma", description: "Puntuación de salud 0-100 por cuenta.", minPlan: "enterprise" },
  { key: "csm-portfolio", label: "Cartera CSM", category: "Plataforma", description: "Asignación y gestión de CSM por cuenta.", minPlan: "enterprise" },
  { key: "playbook-engine", label: "Motor de playbooks", category: "Plataforma", description: "Playbooks automáticos (onboarding, churn, etc.).", minPlan: "enterprise" },
  { key: "copilot-ia", label: "Copiloto IA", category: "Plataforma", description: "Asistente IA conversacional con contexto de negocio.", minPlan: "professional" },
  { key: "saas-metrics", label: "Métricas SaaS internas", category: "Plataforma", description: "MRR, NRR, churn y cohortes internas.", minPlan: "enterprise" },
  { key: "menu-engineering", label: "Menu Engineering", category: "Plataforma", description: "Matriz 4-cuadrantes de platos.", minPlan: "professional" },
  { key: "baseline", label: "Baseline KPIs", category: "Plataforma", description: "Medición antes/después de la activación.", minPlan: "professional" },
];

/** Plan matrix: per-plan value for every feature key. */
export const PLAN_FEATURES: Record<PlanId, Record<FeatureKey, FeatureValue>> = {
  starter: {
    tpv: true,
    kds: 1,
    pda: 1,
    "carta-qr": true,
    "order-pay": false,
    "carta-multilingue": false,
    reservas: true,
    "floor-plan": false,
    waitlist: false,
    "prediccion-demanda": false,
    "yield-pricing": false,
    "delivery-propio": false,
    "delivery-agregadores": false,
    "crm-perfiles": 200,
    "crm-segmentacion": false,
    "campanas-email": 50,
    "whatsapp-business": 0,
    fidelizacion: false,
    "respuestas-ia-reseñas": false,
    "encuestas-nps": false,
    escandallos: false,
    recuentos: false,
    proveedores: false,
    "dashboard-operativo": true,
    "exportacion-csv": false,
    "benchmarks-colectivos": false,
    triggers: 3,
    "workflows-multi-paso": false,
    "api-lectura": true,
    "api-escritura": false,
    "webhooks-salientes": false,
    "multi-local": 1,
    "roles-personalizados": false,
    "permisos-granulares": false,
    "audit-log": false,
    "soporte-email": true,
    "soporte-chat": false,
    "onboarding-dedicado": false,
    "health-score": false,
    "csm-portfolio": false,
    "playbook-engine": false,
    "copilot-ia": false,
    "saas-metrics": false,
    "menu-engineering": false,
    baseline: false,
  },
  professional: {
    tpv: true,
    kds: 3,
    pda: 3,
    "carta-qr": true,
    "order-pay": true,
    "carta-multilingue": true,
    reservas: true,
    "floor-plan": true,
    waitlist: true,
    "prediccion-demanda": true,
    "yield-pricing": false,
    "delivery-propio": true,
    "delivery-agregadores": true,
    "crm-perfiles": -1,
    "crm-segmentacion": true,
    "campanas-email": 500,
    "whatsapp-business": 0,
    fidelizacion: true,
    "respuestas-ia-reseñas": true,
    "encuestas-nps": true,
    escandallos: true,
    recuentos: true,
    proveedores: true,
    "dashboard-operativo": true,
    "exportacion-csv": true,
    "benchmarks-colectivos": false,
    triggers: 25,
    "workflows-multi-paso": true,
    "api-lectura": true,
    "api-escritura": false,
    "webhooks-salientes": false,
    "multi-local": 3,
    "roles-personalizados": true,
    "permisos-granulares": true,
    "audit-log": true,
    "soporte-email": true,
    "soporte-chat": true,
    "onboarding-dedicado": false,
    "health-score": false,
    "csm-portfolio": false,
    "playbook-engine": false,
    "copilot-ia": true,
    "saas-metrics": false,
    "menu-engineering": true,
    baseline: true,
  },
  enterprise: {
    tpv: true,
    kds: -1,
    pda: -1,
    "carta-qr": true,
    "order-pay": true,
    "carta-multilingue": true,
    reservas: true,
    "floor-plan": true,
    waitlist: true,
    "prediccion-demanda": true,
    "yield-pricing": true,
    "delivery-propio": true,
    "delivery-agregadores": true,
    "crm-perfiles": -1,
    "crm-segmentacion": true,
    "campanas-email": -1,
    "whatsapp-business": 500,
    fidelizacion: true,
    "respuestas-ia-reseñas": true,
    "encuestas-nps": true,
    escandallos: true,
    recuentos: true,
    proveedores: true,
    "dashboard-operativo": true,
    "exportacion-csv": true,
    "benchmarks-colectivos": true,
    triggers: -1,
    "workflows-multi-paso": true,
    "api-lectura": true,
    "api-escritura": true,
    "webhooks-salientes": true,
    "multi-local": -1,
    "roles-personalizados": true,
    "permisos-granulares": true,
    "audit-log": true,
    "soporte-email": true,
    "soporte-chat": true,
    "onboarding-dedicado": true,
    "health-score": true,
    "csm-portfolio": true,
    "playbook-engine": true,
    "copilot-ia": true,
    "saas-metrics": true,
    "menu-engineering": true,
    baseline: true,
  },
};

export const PLAN_DISPLAY: Record<PlanId, { name: string; price: number; accent: "muted" | "gold" | "teal" }> = {
  starter: { name: "Starter", price: 49, accent: "muted" },
  professional: { name: "Professional", price: 99, accent: "gold" },
  enterprise: { name: "Enterprise", price: 249, accent: "teal" },
};

export const PLAN_ORDER: PlanId[] = ["starter", "professional", "enterprise"];

/* ------------------------------------------------------------------ */
/*  Pure License Engine: can() / limitOf()                            */
/* ------------------------------------------------------------------ */

/**
 * can(plan, featureKey): whether the plan grants access to the feature.
 * - true → true
 * - false → false
 * - number → true if > 0 or -1, false if 0
 */
export function can(plan: PlanId, feature: FeatureKey): boolean {
  const v = PLAN_FEATURES[plan][feature];
  if (v === true) return true;
  if (v === false) return false;
  // numeric
  return v !== 0;
}

/**
 * limitOf(plan, featureKey): the numeric limit.
 * - true → -1 (unlimited)
 * - false → 0 (blocked)
 * - number → the number (-1 = unlimited, 0 = blocked)
 */
export function limitOf(plan: PlanId, feature: FeatureKey): number {
  const v = PLAN_FEATURES[plan][feature];
  if (v === true) return -1;
  if (v === false) return 0;
  return v;
}

/** Find the minimum plan that grants access to a feature. */
export function minPlanFor(feature: FeatureKey): PlanId | null {
  for (const p of PLAN_ORDER) {
    if (can(p, feature)) return p;
  }
  return null;
}

/** Human-readable reason when access is denied. */
export function denyReason(
  plan: PlanId,
  feature: FeatureKey,
  currentUsage?: { used: number; limit: number; unit?: string }
): string | null {
  const v = PLAN_FEATURES[plan][feature];
  const entry = FEATURE_CATALOG.find((e) => e.key === feature);
  const label = entry?.label ?? feature;
  if (v === true) return null;
  if (v === false) {
    const min = minPlanFor(feature);
    if (!min) return `"${label}" no está disponible en ningún plan.`;
    const minName = PLAN_DISPLAY[min].name;
    return `Requiere plan ${minName}.`;
  }
  // numeric
  if (v === 0) {
    const min = minPlanFor(feature);
    const minName = min ? PLAN_DISPLAY[min].name : "superior";
    return `Requiere plan ${minName}.`;
  }
  // numeric limit reached?
  if (currentUsage && currentUsage.limit > 0 && currentUsage.used >= currentUsage.limit) {
    const unit = currentUsage.unit ? ` ${currentUsage.unit}` : "";
    return `Límite alcanzado: ${currentUsage.used}/${currentUsage.limit}${unit}.`;
  }
  return null;
}
