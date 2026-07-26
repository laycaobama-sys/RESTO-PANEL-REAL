"use client";

/**
 * Shared chart utilities for animated, interactive SVG charts.
 *
 * Used by:
 *   - src/components/rp/dashboard/home.tsx
 *   - src/components/rp/executive/exec-cockpit.tsx
 *   - src/components/rp/growth/growth-analytics.tsx
 *
 * Design rules (strict):
 *   - All animations use ONLY transform and opacity (no width/height/top/left
 *     animating — that triggers layout and jank).
 *   - prefers-reduced-motion fully respected: when the user has reduced motion
 *     enabled, every helper returns the final state immediately.
 *   - Entrance animations are once-only (after first visible, they stay).
 *   - Tooltips follow the cursor inside the chart container and never go
 *     off-screen (clamped to the visible viewport of the container).
 *   - Crosshair only on line/area charts (provided as helper, opted in per chart).
 *   - Hover dimming: active series at full opacity, others at 0.35.
 *   - Clickable legend toggles series on/off.
 */

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  useInView — IntersectionObserver, once-only                       */
/* ------------------------------------------------------------------ */

export interface UseInViewOptions extends IntersectionObserverInit {
  /** Fire only once (default true). When false, `inView` toggles back to false on exit. */
  once?: boolean;
}

export function useInView<T extends Element = HTMLDivElement>(
  options: UseInViewOptions = {}
): { ref: React.RefObject<T | null>; inView: boolean } {
  const { once = true, root = null, rootMargin = "0px 0px -10% 0px", threshold = 0.15 } = options;
  const ref = React.useRef<T>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Server-side / unsupported: assume visible so final state renders.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            if (once) obs.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { root, rootMargin, threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once, root, rootMargin, threshold]);

  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/*  Animation primitives (CSS-driven, transform+opacity only)         */
/* ------------------------------------------------------------------ */

/** Returns the entrance progress (0 → 1) given `inView` + reduced motion. */
export function useEntranceProgress(inView: boolean, durationMs = 700): number {
  const reduce = useReducedMotion();
  const [p, setP] = React.useState(reduce ? 1 : 0);
  React.useEffect(() => {
    if (reduce) {
      setP(1);
      return;
    }
    if (!inView) {
      setP(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setP(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, durationMs, reduce]);
  return p;
}

/** Compute a stroke-dasharray/dashoffset pair for a path of given length. */
export function drawDash(length: number, progress: number): { dasharray: string; dashoffset: number } {
  const safe = Math.max(0, length);
  return {
    dasharray: `${safe}`,
    dashoffset: safe * (1 - progress),
  };
}

/* ------------------------------------------------------------------ */
/*  CursorTooltip — follows cursor, clamps inside container          */
/* ------------------------------------------------------------------ */

export interface CursorTooltipPos {
  /** x in container coords (px). null hides the tooltip. */
  x: number | null;
  /** y in container coords (px). null hides the tooltip. */
  y: number | null;
}

export interface CursorTooltipProps {
  position: CursorTooltipPos;
  /** Container ref used to clamp the tooltip within its bounds. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Optional accessor: where to render relative to cursor (default: right + below). */
  offset?: { x: number; y: number };
  /** Estimated width/height used to flip when crossing container edges. */
  estimatedSize?: { width: number; height: number };
  children: React.ReactNode;
  /** Optional className override. */
  className?: string;
}

export function CursorTooltip({
  position,
  containerRef,
  offset = { x: 14, y: 14 },
  estimatedSize = { width: 180, height: 80 },
  children,
  className,
}: CursorTooltipProps) {
  const { x, y } = position;
  // Track the container size with a ResizeObserver so we never read the
  // ref synchronously during render (React refs rule).
  const [size, setSize] = React.useState<{ w: number; h: number }>({ w: 0, h: 0 });
  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    return undefined;
  }, [containerRef]);

  if (x == null || y == null) return null;
  const { w: cw, h: ch } = size;

  // Default position: right + below cursor.
  let left = x + offset.x;
  let top = y + offset.y;
  // Flip horizontally if overflowing right edge.
  if (cw > 0 && left + estimatedSize.width > cw - 8) {
    left = x - estimatedSize.width - offset.x;
  }
  if (left < 8) left = 8;
  // Flip vertically if overflowing bottom edge.
  if (ch > 0 && top + estimatedSize.height > ch - 8) {
    top = y - estimatedSize.height - offset.y;
  }
  if (top < 8) top = 8;

  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-30 rp-glass-strong rounded-md border border-[var(--gold)]/40 px-3 py-2 text-[11px] shadow-xl",
        className
      )}
      style={{
        left,
        top,
        // Use transform for positioning entry (no width/height/top/left animation).
        transform: "translateZ(0)",
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ClickableLegend — click to toggle a series                         */
/* ------------------------------------------------------------------ */

export interface LegendItem {
  id: string;
  label: string;
  color: string;
  /** Optional small dashed swatch style for "forecast"-like items. */
  dashed?: boolean;
}

export interface ClickableLegendProps {
  items: LegendItem[];
  /** Set of hidden series ids. */
  hidden: Set<string>;
  onToggle: (id: string) => void;
  className?: string;
}

export function ClickableLegend({ items, hidden, onToggle, className }: ClickableLegendProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]", className)}>
      {items.map((it) => {
        const isHidden = hidden.has(it.id);
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onToggle(it.id)}
            aria-pressed={!isHidden}
            aria-label={`${isHidden ? "Mostrar" : "Ocultar"} serie ${it.label}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors",
              "hover:bg-foreground/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40",
              isHidden && "opacity-40 line-through"
            )}
          >
            {it.dashed ? (
              <span
                className="h-0.5 w-3 rounded-sm"
                style={{
                  background: "transparent",
                  borderTop: `2px dashed ${it.color}`,
                  height: 0,
                }}
              />
            ) : (
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} />
            )}
            <span className="text-muted-foreground">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TimeRangeSelector — 7d / 30d / 90d / año                          */
/* ------------------------------------------------------------------ */

export type TimeRange = "7d" | "30d" | "90d" | "año";

export interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
  className?: string;
  /** Optional override of the available ranges. */
  ranges?: TimeRange[];
}

const DEFAULT_RANGES: TimeRange[] = ["7d", "30d", "90d", "año"];

export function TimeRangeSelector({
  value,
  onChange,
  className,
  ranges = DEFAULT_RANGES,
}: TimeRangeSelectorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border/60 bg-card/40 p-0.5 overflow-x-auto rp-scroll-thin",
        className
      )}
      role="tablist"
      aria-label="Selector de rango temporal"
    >
      {ranges.map((r) => {
        const active = r === value;
        return (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(r)}
            className={cn(
              "min-h-[28px] rounded px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap",
              active
                ? "bg-[var(--gold)] text-black font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {r}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Crosshair (vertical line) — for line/area charts                  */
/* ------------------------------------------------------------------ */

export interface CrosshairProps {
  /** x position in svg user units, or null to hide. */
  x: number | null;
  /** top y in svg user units. */
  y1: number;
  /** bottom y in svg user units. */
  y2: number;
  color?: string;
  dash?: string;
}

export function Crosshair({ x, y1, y2, color = "var(--gold)", dash = "3 3" }: CrosshairProps) {
  if (x == null) return null;
  return (
    <line
      x1={x}
      x2={x}
      y1={y1}
      y2={y2}
      stroke={color}
      strokeWidth={1}
      strokeDasharray={dash}
      opacity={0.7}
      pointerEvents="none"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Hover dimming helper                                               */
/* ------------------------------------------------------------------ */

/**
 * Given a set of series ids and the active id, returns the opacity to use
 * for `id`. Active (or any when none active) = 1, others = 0.35.
 */
export function seriesOpacity(activeId: string | null, id: string): number {
  if (activeId == null) return 1;
  return activeId === id ? 1 : 0.35;
}

/* ------------------------------------------------------------------ */
/*  Path length measurement (for draw-in animations)                  */
/* ------------------------------------------------------------------ */

/**
 * Returns a ref callback that measures a path/polyline's `getTotalLength()`
 * once mounted and stores it in state. Safe for SSR (returns 0 on server).
 */
export function usePathLength<T extends SVGPathElement | SVGLineElement | SVGPolylineElement>(): {
  ref: React.RefObject<T | null>;
  length: number;
} {
  const ref = React.useRef<T>(null);
  const [length, setLength] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // getTotalLength exists on SVGGeometryElement (path, line, polyline, etc.)
    const anyEl = el as unknown as { getTotalLength?: () => number };
    if (typeof anyEl.getTotalLength === "function") {
      try {
        setLength(anyEl.getTotalLength() || 0);
      } catch {
        setLength(0);
      }
    }
  }, []);
  return { ref, length };
}

/* ------------------------------------------------------------------ */
/*  Mock dataset generator for time range switching                    */
/* ------------------------------------------------------------------ */

/**
 * Deterministic pseudo-random generator (seeded) so the same range always
 * yields the same values (avoids flicker on re-render).
 */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/**
 * Generates a deterministic series of `n` numeric values given a range id.
 * Used to provide alternative datasets when the time range selector changes.
 */
export function buildSeries(range: TimeRange, base: number[], seed = 7): number[] {
  const rand = seededRandom(seed + range.length * 13);
  // Multiplier scales the data shape based on range; longer ranges are noisier.
  const n = base.length;
  const noiseAmp =
    range === "7d" ? 0.05 : range === "30d" ? 0.12 : range === "90d" ? 0.2 : 0.32;
  return base.map((v, i) => {
    // gentle trend (longer ranges → higher values overall, simulating growth)
    const trend = range === "año" ? 1 + i * 0.04 : range === "90d" ? 1 + i * 0.02 : 1;
    const noise = 1 + (rand() - 0.5) * noiseAmp;
    return Math.max(0, Math.round(v * trend * noise));
  });
}
