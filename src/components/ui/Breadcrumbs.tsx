import Link from "next/link";

export interface Crumb { label: string; href?: string }

export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 text-sm text-smoke">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-line">/</span>}
            {c.href ? (
              <Link href={c.href} className="transition-colors hover:text-brass-deep">{c.label}</Link>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
