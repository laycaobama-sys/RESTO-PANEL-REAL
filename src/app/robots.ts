import type { MetadataRoute } from "next";

const SITE_URL = "https://restopanel.com";

/**
 * robots.txt para RestoPanel.
 *
 * - Permite rastreo completo a motores de búsqueda tradicionales (Googlebot, Bingbot, etc.).
 * - Permite rastreo a agentes de IA / Answer Engines (ChatGPT, Perplexity, Claude, etc.)
 *   para optimización AEO (Answer Engine Optimization).
 * - Bloquea rutas internas de la aplicación (/app/*) y APIs.
 * - Apunta al sitemap.xml para descubrimiento rápido.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Motores de búsqueda tradicionales
        userAgent: "*",
        allow: "/",
        disallow: ["/app", "/api", "/_next"],
      },
      {
        // Answer engines y crawlers de IA — acceso completo al contenido público
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/app", "/api"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/app", "/api"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/app", "/api"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/app", "/api"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/app", "/api"],
      },
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: ["/app", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
