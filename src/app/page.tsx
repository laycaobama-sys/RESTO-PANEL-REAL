"use client";

import { useNav } from "@/components/rp/app/nav-store";
import { Landing } from "@/components/rp/landing/landing";
import { AppShell } from "@/components/rp/app/app-shell";
import { BrandMark } from "@/components/rp/app/brand";

export default function Page() {
  const view = useNav((s) => s.view);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {view === "landing" ? <Landing /> : <AppShell />}
      <Footer />
    </div>
  );
}

function Footer() {
  const view = useNav((s) => s.view);
  const setView = useNav((s) => s.setView);
  return (
    <footer className="mt-auto border-t border-border/60 rp-glass-strong">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-8 w-8" />
              <div className="leading-tight">
                <div className="font-display text-lg tracking-tight">RestoPanel</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  El sistema operativo del restaurante
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Software para restaurantes que convierte cada servicio en más ingresos. Reservas,
              mesas, CRM, marketing, reputación e IA en una sola plataforma.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-300/90">Datos demo · producto navegable</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Producto
            </div>
            <ul className="space-y-1.5 text-sm text-foreground/80">
              <li><a href="#p-pricing" className="hover:text-[var(--gold)]">Precios</a></li>
              <li><a href="#p-plataforma" className="hover:text-[var(--gold)]">Plataforma</a></li>
              <li><a href="#p-faq" className="hover:text-[var(--gold)]">Preguntas frecuentes</a></li>
              <li>
                <button onClick={() => setView("app")} className="hover:text-[var(--gold)]">
                  Ver dashboard
                </button>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
              Empresa
            </div>
            <ul className="space-y-1.5 text-sm text-foreground/80">
              <li>Sobre RestoPanel</li>
              <li>Blog</li>
              <li>Centro de ayuda</li>
              <li>Contacto</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© 2025 RestoPanel. Todos los derechos reservados.</div>
          <div className="font-mono">
            {view === "landing" ? "Landing" : "Dashboard"} · demo navegable
          </div>
        </div>
      </div>
    </footer>
  );
}
