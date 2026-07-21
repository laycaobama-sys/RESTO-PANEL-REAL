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

export const metadata: Metadata = {
  title: "RestoPanel — Fase 0 · Fundación Enterprise",
  description:
    "Fundación estratégica, arquitectónica y de producto de RestoPanel, plataforma SaaS Enterprise multiempresa para restaurantes. Marca, Design System, arquitectura Cloudflare, tenancy, modelo de datos, seguridad y roadmap.",
  keywords: [
    "RestoPanel",
    "SaaS",
    "restaurantes",
    "multi-tenant",
    "Cloudflare",
    "Enterprise",
    "reservas",
    "CRM",
    "Design System",
  ],
  authors: [{ name: "RestoPanel Architecture" }],
  icons: {
    icon: "/brand/isotipo.png",
    apple: "/brand/isotipo.png",
  },
  openGraph: {
    title: "RestoPanel — Fase 0 · Fundación Enterprise",
    description:
      "Fundación estratégica y arquitectónica de RestoPanel: plataforma SaaS multiempresa para hostelería.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrains.variable} ${fraunces.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
