"use client";

/* ============================================================
 * RestoPanel · FaqSection — Preguntas frecuentes
 * ------------------------------------------------------------
 *  - 12 preguntas reales en español (es-ES)
 *  - Acordeón con animación de altura (Framer Motion)
 *  - Schema JSON-LD FAQPage en <script type="application/ld+json">
 *  - CTA "Contactar" al final
 *  - Animaciones transform+opacity, respeta prefers-reduced-motion
 * ============================================================ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ChevronDown, Plus, MessageCircle, ArrowRight } from "lucide-react";

/* ---------- FAQ data ---------- */
interface QA {
  q: string;
  a: string;
}

const FAQS: QA[] = [
  {
    q: "¿Puedo migrar desde CoverManager?",
    a: "Sí. Importamos reservas, clientes y configuración de zona desde CoverManager, TheFork y Google Reserves sin coste durante el onboarding. La migración típica dura entre 3 y 7 días según el volumen de datos.",
  },
  {
    q: "¿Hay permanencia?",
    a: "No. Todos los planes son mensuales o anuales sin permanencia. Puedes cancelar en cualquier momento desde el panel de facturación y conservar la exportación completa de tus datos.",
  },
  {
    q: "¿Qué TPVs son compatibles?",
    a: "Integramos con Sumup, Square, Lightspeed, Toast y cualquier TPV con exportación CSV/API. La sincronización de tickets en tiempo real está disponible para Sumup y Square; el resto se sincroniza cada 15 minutos.",
  },
  {
    q: "¿Cumple con el RGPD?",
    a: "Sí. Aplicamos aislamiento estricto por organización (multi-tenant), cifrado en tránsito y reposo, gestión de consentimientos por canal y finalidad, registro de auditoría inmutable y derecho de acceso, rectificación y supresión desde el propio panel.",
  },
  {
    q: "¿Cómo funciona la IA?",
    a: "El Copiloto IA combina modelos Llama 3.1 con tus datos propios (reservas, CRM, tickets, reseñas) mediante RAG. Cada consulta se ejecuta en tu namespace aislado; los datos nunca se comparten entre organizaciones ni se usan para entrenar modelos.",
  },
  {
    q: "¿Necesito instalar algo?",
    a: "No. RestoPanel funciona 100% en el navegador. Solo necesitas una conexión a internet y un dispositivo moderno (móvil, tablet o PC). Para WhatsApp y Stripe basta con conectar tu cuenta en el panel de integraciones.",
  },
  {
    q: "¿Puedo gestionar varios locales?",
    a: "Sí. RestoPanel es multi-local por diseño. El plan Professional incluye 5 locales y Enterprise locales ilimitados, con roles y permisos por local, comparativas entre locales y analítica consolidada.",
  },
  {
    q: "¿Qué pasa si cancelo?",
    a: "Puedes exportar todos tus datos (clientes, reservas, reseñas, campañas) en CSV hasta 30 días después de la cancelación. Tras ese periodo se eliminan definitivamente de nuestros servidores según política RGPD.",
  },
  {
    q: "¿Hay soporte en español?",
    a: "Sí. Todo el soporte es en español de España, con horario de lunes a sábado de 9:00 a 22:00. El plan Enterprise incluye soporte 24/7 por teléfono, email y WhatsApp con tiempo de respuesta inferior a 2 horas.",
  },
  {
    q: "¿Incluye formación?",
    a: "Sí. Todos los planes incluyen una sesión de onboarding de 60 minutos. Professional añade 2 sesiones de formación por rol (maitre, sala, marketing) y Enterprise incluye formación presencial y un customer success manager dedicado.",
  },
  {
    q: "¿Funciona en móvil?",
    a: "Sí. Toda la interfaz es responsive y hay app nativa para iOS y Android con notificaciones push, plano de mesas táctil, escaneo de QR para check-in y modo offline para sala con mala cobertura.",
  },
  {
    q: "¿Cómo se calcula el ROI?",
    a: "El ROI combina 4 fuentes: no-shows evitados con confirmaciones automáticas, mesas recuperadas vía lista de espera, horas de personal liberadas por automatizaciones y uplift de ticket por personalización del CRM. La calculadora del landing muestra cada componente con su fórmula.",
  },
];

/* ============================================================
 * Component
 * ============================================================ */
export function FaqSection() {
  const reduce = useReducedMotion();
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  const toggle = (i: number) => setOpenIdx((cur) => (cur === i ? null : i));

  // JSON-LD FAQPage schema
  const jsonLd = React.useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
    []
  );

  return (
    <section className="relative scroll-mt-24 py-16 sm:py-24 border-t border-border/60">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        {/* Header */}
        <header className="mb-10 sm:mb-14 text-center">
          <div className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--gold)]/60" />
            <span className="rp-gold-text">FAQ</span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--gold)]/60" />
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-balance">
            Preguntas frecuentes
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground">
              Todo lo que necesitas saber antes de empezar.
            </p>
            <Badge variant="outline" className="border-[var(--gold)]/40 text-[var(--gold-soft)]">
              demo
            </Badge>
          </div>
        </header>

        {/* Accordion */}
        <div className="space-y-2.5">
          {FAQS.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={i}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className={cn(
                  "rp-glass overflow-hidden rounded-xl border transition-colors",
                  isOpen
                    ? "border-[var(--gold)]/40 bg-[var(--gold)]/[0.04]"
                    : "border-border/60 hover:border-border"
                )}
              >
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center gap-3 px-4 sm:px-5 py-4 text-left min-h-[64px]"
                  aria-expanded={isOpen}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-mono transition-colors",
                      isOpen
                        ? "border-[var(--gold)]/60 bg-[var(--gold)]/15 text-[var(--gold)]"
                        : "border-border/60 text-muted-foreground"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-sm sm:text-base font-medium pr-2",
                      isOpen ? "text-foreground" : "text-foreground/85"
                    )}
                  >
                    {f.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isOpen ? "text-[var(--gold)]" : "text-muted-foreground"
                      )}
                    />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-4 pl-14 sm:pl-16">
                        <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-foreground/[0.02] p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)]">
            <MessageCircle className="h-5 w-5 text-background" />
          </div>
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-medium">
              ¿No encuentras tu respuesta?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Habla con nuestro equipo en menos de 2 minutos. Sin compromiso.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              className="h-11 min-h-[44px] bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] text-background hover:opacity-90"
              onClick={() =>
                toast({
                  title: "Solicitud enviada",
                  description: "Te contactaremos en menos de 2 horas.",
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Contactar
            </Button>
            <Button
              variant="outline"
              className="h-11 min-h-[44px] border-border/60"
              onClick={() =>
                toast({ title: "Demo agendada", description: "Te enviamos confirmación por email." })
              }
            >
              Reservar demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}

export default FaqSection;
