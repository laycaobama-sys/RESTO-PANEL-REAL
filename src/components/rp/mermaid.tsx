"use client";

import * as React from "react";
import mermaid from "mermaid";

let idc = 0;

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    darkMode: true,
    background: "transparent",
    primaryColor: "#1a1813",
    primaryTextColor: "#F5F4F0",
    primaryBorderColor: "#D4AF37",
    lineColor: "#3DD6C9",
    secondaryColor: "#161513",
    tertiaryColor: "#0c0b0a",
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: "13px",
    nodeBorder: "#D4AF37",
    clusterBkg: "rgba(212,175,55,0.05)",
    clusterBorder: "rgba(212,175,55,0.3)",
    edgeLabelBackground: "#161513",
  },
  flowchart: { curve: "basis", htmlLabels: true },
  securityLevel: "loose",
});

export function Mermaid({ chart, className }: { chart: string; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const id = `mmd-${++idc}`;
    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (cancelled) return;
        if (ref.current) {
          ref.current.innerHTML = svg;
          setErr(null);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (err) {
    return (
      <div className="rp-glass rounded-xl p-4 overflow-x-auto rp-scroll-thin">
        <div className="text-[11px] font-mono uppercase tracking-wider text-destructive mb-2">
          Mermaid render error
        </div>
        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{err}</pre>
        <pre className="mt-3 text-xs text-foreground/70 whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={
        "rp-glass rounded-xl p-4 overflow-x-auto rp-scroll-thin [&>svg]:max-w-full [&>svg]:h-auto " +
        (className ?? "")
      }
      role="img"
    />
  );
}
