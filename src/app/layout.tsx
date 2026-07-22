import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const SITE_URL = "https://restopanel.com";
const TITLE = "RestoPanel · Software de Reservas y Gestión para Restaurantes";
const DESCRIPTION =
  "RestoPanel es el software de reservas y gestión para restaurantes, grupos gastronómicos, hoteles y ocio nocturno. Centraliza reservas, plano de mesas, CRM, automatizaciones, eventos, lista de espera y analítica en un único panel. Reduce no-shows, aumenta la ocupación y fideliza clientes con datos propios.";
const KEYWORDS = [
  "software de reservas para restaurantes",
  "sistema de reservas online hostelería",
  "gestor de reservas restaurantes",
  "CRM para restaurantes",
  "plano de mesas digital",
  "reducir no-shows restaurantes",
  "lista de espera virtual",
  "software para discotecas y ocio nocturno",
  "gestión de eventos y entradas",
  "automatizaciones para restaurantes",
  "analytics para hostelería",
  "software multi-local restaurantes",
  "cola virtual restaurantes",
  "fidelización de clientes hostelería",
  "motor de reservas online",
  "libro de reservas digital",
  "panel de control restaurantes",
  "RestoPanel",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · RestoPanel",
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: "RestoPanel" }],
  creator: "RestoPanel",
  publisher: "RestoPanel",
  applicationName: "RestoPanel",
  category: "Software de gestión para hostelería",
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/",
      "es": "/",
      "en": "/en",
      "pt-BR": "/pt-br",
    },
  },
  icons: {
    icon: [
      { url: "/brand/isotipo.png", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/brand/isotipo.png", sizes: "180x180" }],
    shortcut: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: ["en_US", "pt_BR"],
    url: SITE_URL,
    siteName: "RestoPanel",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/brand/isotipo.png",
        width: 1024,
        height: 1024,
        alt: "RestoPanel — Software de reservas y gestión para restaurantes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/brand/isotipo.png"],
    creator: "@restopanel",
    site: "@restopanel",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "google-site-verification-token",
  },
  other: {
    "theme-color": "#0a0a0b",
    "msapplication-TileColor": "#D4AF37",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "RestoPanel",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Restaurant Management Software",
      operatingSystem: "Web",
      description:
        "Software de reservas y gestión integral para restaurantes, grupos gastronómicos, hoteles y ocio nocturno. Centraliza reservas, plano de mesas, CRM, automatizaciones, eventos, lista de espera y analítica.",
      url: SITE_URL,
      logo: `${SITE_URL}/brand/isotipo.png`,
      image: `${SITE_URL}/brand/isotipo.png`,
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "69",
          priceCurrency: "EUR",
          description: "Para restaurantes independientes. 1 local, 3 usuarios.",
        },
        {
          "@type": "Offer",
          name: "Professional",
          price: "149",
          priceCurrency: "EUR",
          description: "Para grupos en crecimiento. 5 locales, 10 usuarios, IA y WhatsApp.",
        },
        {
          "@type": "Offer",
          name: "Enterprise",
          price: "399",
          priceCurrency: "EUR",
          description: "Para cadenas y operaciones multi-país. Locales y usuarios ilimitados.",
        },
      ],
      featureList: [
        "Reservas online multi-canal (web, Google, WhatsApp, Instagram, teléfono)",
        "Plano de mesas interactivo en tiempo real",
        "CRM con perfil 360° del cliente y fidelización",
        "Automatizaciones configurables (recordatorios, reconfirmaciones, campañas)",
        "Gestión de eventos, entradas y control de accesos",
        "Lista de espera y cola virtual",
        "Analytics operativos y de rentabilidad",
        "Gestión multi-local con roles y permisos",
        "Integraciones con Stripe, WhatsApp, Google Business Profile, Meta",
        "Reducción de no-shows con reglas automáticas",
      ],
      audience: {
        "@type": "BusinessAudience",
        audienceType: "Restaurantes, grupos gastronómicos, hoteles, discotecas, beach clubs, espacios de eventos",
      },
      areaServed: ["España", "Latinoamérica", "Internacional"],
      inLanguage: ["es-ES", "es", "en", "pt-BR"],
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "RestoPanel",
      url: SITE_URL,
      logo: `${SITE_URL}/brand/isotipo.png`,
      description:
        "RestoPanel es el sistema operativo de reservas y experiencias para restaurantes y ocio nocturno.",
      sameAs: [
        "https://twitter.com/restopanel",
        "https://www.linkedin.com/company/restopanel",
        "https://www.instagram.com/restopanel",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        availableLanguage: ["Spanish", "English", "Portuguese"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "RestoPanel",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "es-ES",
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Qué es RestoPanel?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "RestoPanel es un software de reservas y gestión integral para restaurantes, grupos gastronómicos, hoteles y ocio nocturno. Centraliza reservas, plano de mesas, CRM, automatizaciones, eventos, lista de espera y analítica en un único panel para que cada negocio opere mejor, proteja sus ingresos y fidelice a sus clientes con datos propios.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué negocios pueden utilizar RestoPanel?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "RestoPanel está diseñado para restaurantes independientes, grupos de restauración, cadenas, hoteles con departamentos de F&B, rooftops, bares, discotecas, beach clubs, festivales, clubs nocturnos y espacios de eventos.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cómo ayuda RestoPanel a reducir los no-shows?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "RestoPanel reduce el riesgo de no-shows con confirmaciones automáticas, reconfirmaciones por email, SMS o WhatsApp, garantías con tarjeta según política, prepago de menús o entradas, y reglas configurables por cliente, horario, zona o tipo de reserva. No elimina completamente los no-shows, pero los reduce de forma medible.",
          },
        },
        {
          "@type": "Question",
          name: "¿Puedo gestionar varios locales con RestoPanel?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. RestoPanel es multi-local por diseño. Cada organización puede tener uno o varios restaurantes, con roles y permisos por local, comparativas entre locales, y analítica consolidada. El plan Professional incluye 5 locales y Enterprise locales ilimitados.",
          },
        },
        {
          "@type": "Question",
          name: "¿Puedo utilizar RestoPanel para eventos y ocio nocturno?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. RestoPanel incluye gestión de eventos, venta de entradas, listas de invitados, check-in, control de accesos, aforos, zonas VIP, mesas, botellas, packs y métricas de venta. Permite gestionar restaurante y ocio nocturno desde la misma organización.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cómo funciona la lista de espera de RestoPanel?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "RestoPanel gestiona una cola virtual con registro de cliente, número de personas, preferencia de zona, horario, tiempo estimado, aviso automático por WhatsApp/SMS/email, confirmación, caducidad, historial de intentos y reubicación cuando existe disponibilidad.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué datos guarda el CRM de RestoPanel?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "El CRM guarda historial de visitas, fecha de última visita, gasto total, ticket medio, frecuencia, preferencias, alergias, notas, valoraciones, cumpleaños, etiquetas, consentimientos de marketing, segmentos, clientes VIP, clientes inactivos y fuente de adquisición. El cliente es dueño de sus datos y puede exportarlos o eliminarlos.",
          },
        },
        {
          "@type": "Question",
          name: "¿Puedo importar mis clientes existentes?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. RestoPanel permite importar clientes desde CSV o desde integraciones conectadas. Los datos se validan y se asocian a la organización de forma aislada, respetando el consentimiento de marketing de cada cliente.",
          },
        },
        {
          "@type": "Question",
          name: "¿En qué idiomas está disponible RestoPanel?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "RestoPanel está disponible principalmente en español de España, con adaptaciones culturales para Latinoamérica. Los titulares y claims también están disponibles en inglés y portugués de Brasil.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cómo se protegen los datos en RestoPanel?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "RestoPanel aplica aislamiento estricto por organización (multi-tenant), cifrado en tránsito y reposo, gestión de secretos fuera del código, MFA, revocación de sesiones, auditoría inmutable, consentimientos por canal y finalidad, y cumplimiento GDPR. Los datos de una organización nunca son accesibles desde otra.",
          },
        },
        {
          "@type": "Question",
          name: "¿Puedo controlar permisos por usuario?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. RestoPanel implementa RBAC granular con roles predeterminados (Owner, Director, Gerente, Maitre, Recepción, Camarero, Cocina, Barra, Marketing, Contabilidad, Auditor, Solo Lectura) y roles personalizados. Los permisos se asignan por organización, local, usuario, equipo, rol, recurso y acción.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué integraciones ofrece RestoPanel?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "RestoPanel se integra con Stripe (facturación), WhatsApp Cloud API (mensajería), Google Business Profile (reseñas), Google Maps, Meta e Instagram (reservas y contenido), Resend (email), Slack (alertas), Zapier y Make (automatización genérica), y dispone de API pública para integraciones personalizadas.",
          },
        },
        {
          "@type": "Question",
          name: "¿Tiene API RestoPanel?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. RestoPanel ofrece una API pública versionada (/v1) con OpenAPI, claves API con scopes, idempotencia, paginación, filtros, webhooks firmados y un portal para desarrolladores. El plan Professional incluye API básica y Enterprise API completa.",
          },
        },
        {
          "@type": "Question",
          name: "¿Puedo cambiar de plan en cualquier momento?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. Puedes cambiar de plan en cualquier momento desde el panel de facturación. Los cambios se prorratean automáticamente y los límites del nuevo plan se aplican de inmediato. No hay permanencia.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrains.variable} ${fraunces.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
