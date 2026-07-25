"use client";

/**
 * AnimatedCounter — count-up number driven by IntersectionObserver.
 * - easeOutExpo-like easing (cubic-bezier feel)
 * - tabular-nums
 * - optional micro-increment after initial count (e.g. +1 every 4s)
 * - respects prefers-reduced-motion (shows final value instantly)
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number; // ms, default 1600
  decimals?: number; // default 0
  format?: (n: number) => string;
  className?: string;
  /** If true, increments value by +1 every `incrementInterval` ms after the initial count */
  microIncrement?: boolean;
  incrementInterval?: number; // ms, default 4000
  prefix?: string;
  suffix?: string;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedCounter({
  value,
  duration = 1600,
  decimals = 0,
  format,
  className,
  microIncrement = false,
  incrementInterval = 4000,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  const reducedRef = React.useRef(false);
  const currentTargetRef = React.useRef(value);

  // prefers-reduced-motion
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedRef.current = mq.matches;
    };
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // IntersectionObserver to start animation
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Count-up animation via requestAnimationFrame
  React.useEffect(() => {
    if (!started) return;
    if (reducedRef.current) {
      setDisplay(currentTargetRef.current);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const to = currentTargetRef.current;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(t);
      const next = from + (to - from) * eased;
      setDisplay(next);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, duration]);

  // Micro-increment after initial count
  React.useEffect(() => {
    if (!started || !microIncrement || reducedRef.current) return;
    const id = window.setInterval(() => {
      currentTargetRef.current += 1;
      setDisplay(currentTargetRef.current);
    }, incrementInterval);
    return () => window.clearInterval(id);
  }, [started, microIncrement, incrementInterval]);

  const formatted = format
    ? format(display)
    : display.toLocaleString("es-ES", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return (
    <span
      ref={ref}
      className={cn("tabular-nums", className)}
      style={{ fontVariantNumeric: "tabular-nums" }}
      aria-label={`${prefix}${format ? format(value) : value.toLocaleString("es-ES")}${suffix}`}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export default AnimatedCounter;
