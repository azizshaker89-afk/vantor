"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { href, money } from "@/lib/format";
import type { CardProduct } from "@/lib/types";

/** Debounced live results under the search field. */
export function SearchSuggest({ q, onPick }: { q: string; onPick: () => void }) {
  const { l, t } = useI18n();
  const [items, setItems] = useState<CardProduct[] | null>(null);
  const term = q.trim();

  useEffect(() => {
    if (term.length < 2) { setItems(null); return; }
    const ctl = new AbortController();
    const id = setTimeout(() => {
      fetch(`/api/search?l=${l}&q=${encodeURIComponent(term)}`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((d) => setItems(d.items))
        .catch(() => {});
    }, 220);
    return () => { clearTimeout(id); ctl.abort(); };
  }, [term, l]);

  if (!items) return null;
  const Arrow = l === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="mx-auto max-w-3xl px-6 pb-10">
      {items.length === 0 ? (
        <p className="text-smoke">{t.search.none}</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-smoke">{t.search.suggestions}</p>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((p) => (
              <li key={p.id}>
                <Link href={href(l, `/p/${p.slug}`)} onClick={onPick} className="group flex items-center gap-3">
                  <span className="relative size-16 shrink-0 overflow-hidden bg-onyx">
                    <Image src={p.image} alt="" fill sizes="64px" className="object-cover transition-transform group-hover:scale-110" />
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm leading-snug group-hover:text-brass-deep">{p.name}</span>
                    <span className="text-sm font-semibold tabular-nums text-brass-deep">{money(p.price, l)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={`${href(l, "/shop")}?q=${encodeURIComponent(term)}`} onClick={onPick}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:text-brass-deep hover:underline">
            {t.search.viewAll(term)} <Arrow className="size-4" />
          </Link>
        </>
      )}
    </div>
  );
}
