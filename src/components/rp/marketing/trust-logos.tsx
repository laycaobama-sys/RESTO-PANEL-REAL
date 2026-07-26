"use client";

/**
 * TrustLogos — CSS-only infinite marquee with two rows (opposite directions).
 * - 8 fictional restaurant brands, text-based (no images)
 * - monochrome 55% → 100% on hover
 * - edge mask gradient
 * - pause on hover (group-hover pause)
 * - prefers-reduced-motion → static, no animation
 */

import * as React from "react";
import { cn } from "@/lib/utils";

const LOGOS_ROW_A = [
  "La Tagliatella",
  "Grupo Ramses",
  "Sushi Bar Tokyo",
  "Beach Club Marbella",
  "Hotel Andalucía",
];

const LOGOS_ROW_B = [
  "Bistro Central",
  "Casa Marena",
  "El Patio",
  "Restaurante Lumen",
  "Mar & Luna",
];

function LogoGlyph({ name }: { name: string }) {
  const glyphs = ["◆", "●", "▲", "✦", "❖", "✚", "⬢", "✱"];
  const glyph = glyphs[name.length % glyphs.length];
  return (
    <div className="flex items-center gap-2 px-6 shrink-0">
      <span
        className="text-lg leading-none"
        aria-hidden
      >
        {glyph}
      </span>
      <span className="whitespace-nowrap text-sm font-medium tracking-tight">
        {name}
      </span>
    </div>
  );
}

function MarqueeRow({
  items,
  direction = "left",
  duration = 32,
  reduced = false,
}: {
  items: string[];
  direction?: "left" | "right";
  duration?: number;
  reduced?: boolean;
}) {
  if (reduced) {
    // Static fallback — no transform, no animation, just centered list.
    return (
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        />
        <div className="flex items-center justify-center text-white/55">
          {items.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="transition-colors duration-300 hover:!text-white"
            >
              <LogoGlyph name={name} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const track = [...items, ...items];
  return (
    <div className="group relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      />
      <div
        className={cn(
          "flex w-max items-center text-white/55 transition-[opacity] duration-300",
          "group-hover:[animation-play-state:paused]",
        )}
        style={{
          animation: `rp-marquee-${direction} ${duration}s linear infinite`,
        }}
      >
        {track.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="transition-colors duration-300 hover:!text-white"
          >
            <LogoGlyph name={name} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrustLogos({ className }: { className?: string }) {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return (
    <section className={cn("w-full", className)}>
      <style>{`
        @keyframes rp-marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes rp-marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          Con la confianza de 1.200+ restaurantes
        </p>
        <div className="mt-2 flex w-full flex-col gap-1">
          <MarqueeRow
            items={LOGOS_ROW_A}
            direction="left"
            duration={36}
            reduced={reduced}
          />
          <MarqueeRow
            items={LOGOS_ROW_B}
            direction="right"
            duration={42}
            reduced={reduced}
          />
        </div>
      </div>
    </section>
  );
}

export default TrustLogos;
