import Link from "next/link";
import type { Dict, Locale } from "@/i18n/dict";
import { href } from "@/lib/format";

// Each house line gets its own type treatment, the way real wordmarks differ.
const styles: Record<string, string> = {
  halden: "font-[family-name:var(--font-marcellus)] tracking-[0.35em] text-[1.35rem]",
  corvane: "font-serif italic text-[1.6rem]",
  noirline: "font-[family-name:var(--font-manrope)] font-bold tracking-[-0.03em] text-[1.45rem] lowercase",
  "atlas-hide": "font-[family-name:var(--font-manrope)] font-semibold tracking-[0.22em] text-[0.95rem] uppercase",
  brask: "font-[family-name:var(--font-marcellus)] text-[1.7rem] tracking-[0.08em] uppercase",
  "vantor-atelier": "font-[family-name:var(--font-marcellus)] tracking-[0.3em] text-[1rem] uppercase",
};

export function BrandStrip({ t, l, brands }: { t: Dict; l: Locale; brands: { slug: string; name: string; tagline: string }[] }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-24 md:px-8" aria-label={t.brands.title}>
      <ul className="grid grid-cols-2 items-center gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
        {brands.map((b) => (
          <li key={b.slug} dir="ltr">
            <Link href={`${href(l, "/shop")}?brand=${b.slug}`} className="group block text-center">
            <span className={`block text-ink/55 transition-colors group-hover:text-ink ${styles[b.slug] ?? ""}`}>{b.name}</span>
            <span className="mt-1 block text-xs text-smoke opacity-0 transition-opacity group-hover:opacity-100" dir="auto">{b.tagline}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
