import Image from "next/image";
import Link from "next/link";
import type { Dict, Locale } from "@/i18n/dict";
import { href } from "@/lib/format";

const IMG = ["/img/editorial/banner-wallet.webp", "/img/editorial/banner-cuff.webp"];

export function Promos({ t, l }: { t: Dict; l: Locale }) {
  return (
    <section className="mx-auto grid max-w-[1440px] gap-5 px-4 pt-16 md:px-8 lg:grid-cols-2">
      {t.promos.map((p, i) => (
        <article key={p.title} className="relative isolate flex min-h-[300px] items-center overflow-hidden bg-onyx text-bone md:min-h-[340px]">
          <Image src={IMG[i]} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-onyx/90 via-onyx/60 to-onyx/0 rtl:bg-gradient-to-l" />
          <div className="max-w-sm p-8 md:p-11">
            <p className="text-sm text-brass-soft">{p.kicker}</p>
            <h3 className="mt-2 font-display text-[1.75rem] leading-tight md:text-[2.1rem]">{p.title}</h3>
            <p className="mt-3 text-sm leading-7 text-bone/75">{p.body}</p>
            <Link href={href(l, p.href)} className="mt-6 inline-block bg-brass px-6 py-3 text-sm font-semibold text-onyx hover:bg-bone">
              {p.cta}
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
