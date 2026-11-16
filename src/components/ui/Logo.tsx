// VANTOR mark: a V set inside an octagonal "bezel" — a nod to watch cases.
export function Mark({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d="M22 3h20l19 19v20L42 61H22L3 42V22z" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M24.5 9h15l15.5 15.5v15L39.5 55h-15L9 39.5v-15z" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.55" />
      <path d="M19 19h6.6L32 39.2 38.4 19H45L34.6 47h-5.2z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex flex-col items-center gap-1 text-brass ${className}`} dir="ltr">
      <Mark className={compact ? "size-9" : "size-11"} />
      {!compact && (
        <span className="font-[family-name:var(--font-marcellus)] text-[1.35rem] leading-none tracking-[0.42em] ps-[0.42em] text-ink">
          VANTOR
        </span>
      )}
    </span>
  );
}
