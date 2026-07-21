import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-lg overflow-hidden", className)}
      style={{
        background: "radial-gradient(circle at 30% 25%, #1a1815 0%, #0c0b0a 70%)",
        boxShadow:
          "inset 0 0 0 1px color-mix(in oklab, var(--gold) 35%, transparent), 0 2px 12px -2px color-mix(in oklab, var(--gold) 40%, transparent)",
      }}
    >
      <svg viewBox="0 0 32 32" fill="none" className="h-[78%] w-[78%]" aria-hidden>
        <rect x="6" y="6" width="20" height="20" rx="3" stroke="#D4AF37" strokeWidth="1.5" opacity="0.55" />
        <path d="M11 22V10h5.2c2.1 0 3.6 1.2 3.6 3.2 0 1.5-.9 2.5-2.3 2.9L20.5 22h-2.4l-2.6-5.6H13V22h-2z" fill="#D4AF37" />
        <circle cx="22.5" cy="9.5" r="1.2" fill="#3DD6C9" />
      </svg>
    </span>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark className="h-8 w-8" />
      {!compact && (
        <span className="font-display text-lg tracking-tight">RestoPanel</span>
      )}
    </div>
  );
}
