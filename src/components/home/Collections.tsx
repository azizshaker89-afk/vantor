import Image from "next/image";
import Link from "next/link";
import type { Dict, Locale } from "@/i18n/dict";
import { href } from "@/lib/format";
import { SectionHeading } from "../ui/SectionHeading";

type Cat = { slug: string; name: string; desc: string; image: string; count: number };

export function Collections({ t, l, categories }: { t: Dict; l: Locale; categories: Cat[] }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-24 md:px-8" aria-labelledby="collections">
      <SectionHeading id="collections" title={t.collections.title} body={t.collections.body} />
      <ul className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link href={href(l, `/c/${c.slug}`)} className="group relative block aspect-[3/4] overflow-hidden bg-onyx">
              <Image src={c.image} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-dial)] group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/85 via-onyx/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-bone md:p-7">
                <h3 className="font-display text-2xl md:text-[2rem]">{c.name}</h3>
                <p className="mt-1 text-sm text-bone/70">{c.count} {t.collections.items}</p>
                <span className="mt-4 block h-px w-10 bg-brass transition-[width] duration-700 group-hover:w-20" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
