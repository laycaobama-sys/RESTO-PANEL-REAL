import type { MetadataRoute } from "next";

const SITE_URL = "https://restopanel.com";

/**
 * Sitemap.xml dinámico para RestoPanel.
 *
 * Incluye todas las secciones ancla del sitio público (#p-*) con prioridades
 * y frecuencias de cambio optimizadas para rastreo SEO tradicional.
 *
 * La homepage es la única ruta navegable; las secciones son anchors
 * dentro de la SPA, por lo que se listan con el fragmento correspondiente.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const sections = [
    { anchor: "", priority: 1.0, changeFreq: "weekly" as const },
    { anchor: "#problemas", priority: 0.9, changeFreq: "monthly" as const },
    { anchor: "#plataforma", priority: 0.9, changeFreq: "monthly" as const },
    { anchor: "#reservas", priority: 0.9, changeFreq: "monthly" as const },
    { anchor: "#mesas", priority: 0.9, changeFreq: "monthly" as const },
    { anchor: "#crm", priority: 0.9, changeFreq: "monthly" as const },
    { anchor: "#marketing", priority: 0.9, changeFreq: "monthly" as const },
    { anchor: "#automatizaciones", priority: 0.9, changeFreq: "monthly" as const },
    { anchor: "#reviews", priority: 0.9, changeFreq: "monthly" as const },
    { anchor: "#analytics", priority: 0.9, changeFreq: "monthly" as const },
    { anchor: "#ia", priority: 0.9, changeFreq: "monthly" as const },
    { anchor: "#lista-espera", priority: 0.8, changeFreq: "monthly" as const },
    { anchor: "#marketplace", priority: 0.8, changeFreq: "monthly" as const },
    { anchor: "#integraciones", priority: 0.8, changeFreq: "monthly" as const },
    { anchor: "#p-pricing", priority: 1.0, changeFreq: "weekly" as const },
    { anchor: "#faq", priority: 0.9, changeFreq: "monthly" as const },
    { anchor: "#seguridad", priority: 0.7, changeFreq: "monthly" as const },
    { anchor: "#confianza", priority: 0.7, changeFreq: "monthly" as const },
  ];

  return sections.map((s) => ({
    url: `${SITE_URL}${s.anchor}`,
    lastModified: now,
    changeFrequency: s.changeFreq,
    priority: s.priority,
  }));
}
