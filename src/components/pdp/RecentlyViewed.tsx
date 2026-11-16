"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useI18n } from "../I18nProvider";
import { useHydrated } from "../ui/useHydrated";
import { useRecent, type RecentItem } from "@/store/recent";
import { href, money } from "@/lib/format";

/** Records the current product, then shows the shopper's other recent views. */
export function RecentlyViewed({ current }: { current: RecentItem }) {
  const { l, t } = useI18n();
  const h = useHydrated();
  const push = useRecent((s) => s.push);
  const items = useRecent((s) => s.items);

  // Record after mount so the strip below never lists the product you're on.
  useEffect(() => push(current), [current, push]);

  const others = items.filter((x) => x.id !== current.id).slice(0, 6);
  if (!h || others.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-20 md:px-8" aria-labelledby="recent">
      <h2 id="recent" className="mb-6 font-display text-2xl">{t.pdp.recent}</h2>
      <ul className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {others.map((x) => (
          <li key={x.id} className="w-[150px] shrink-0 md:w-[170px]">
            <Link href={href(l, `/p/${x.slug}`)} className="group block">
              <div className="relative aspect-square overflow-hidden bg-onyx">
                <Image src={x.image} alt="" fill sizes="170px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <p className="mt-2 line-clamp-1 text-sm group-hover:text-brass-deep">{l === "ar" ? x.nameAr : x.nameEn}</p>
              <p className="text-sm font-semibold tabular-nums text-brass-deep">{money(x.price, l)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
