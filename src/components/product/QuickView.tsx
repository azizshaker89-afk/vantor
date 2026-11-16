"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { Mark } from "../ui/Logo";
import { useUI } from "@/store/ui";
import { useCart } from "@/store/cart";
import { href, money, pct } from "@/lib/format";

/** Global modal opened from any product card's eye button. */
export function QuickView() {
  const { l, t } = useI18n();
  const p = useUI((s) => s.quick);
  const close = useUI((s) => s.setQuick);
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!p) return;
    setQty(1);
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    box.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [p, close]);

  if (!p) return null;
  const off = pct(p.price, p.compareAt);
  const soldOut = p.stock === 0;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <div className="absolute inset-0 animate-[fade-in_0.3s_ease] bg-onyx/60" onClick={() => close(null)} />
      <div ref={box} tabIndex={-1} role="dialog" aria-modal="true" aria-label={p.name}
        className="relative grid max-h-[90dvh] w-full max-w-4xl animate-[pop-in_0.45s_var(--ease-dial)] overflow-y-auto bg-bone outline-none md:grid-cols-2">
        <button onClick={() => close(null)} aria-label={t.header.close} className="absolute top-3 end-3 z-10 grid size-9 place-items-center rounded-full bg-bone/90 hover:text-brass-deep">
          <X className="size-5" strokeWidth={1.5} />
        </button>
        <div className="relative aspect-square bg-onyx">
          <Image src={p.image} alt={p.name} fill sizes="(min-width:768px) 450px, 100vw" className="object-cover" />
          <Mark className="absolute bottom-4 start-4 size-8 text-brass/70" />
          {off > 0 && <span className="absolute top-4 start-4 grid size-12 place-items-center rounded-full bg-onyx text-sm font-bold text-bone ring-1 ring-bone/15" dir="ltr">-{off}%</span>}
        </div>
        <div className="flex flex-col p-7 md:p-9">
          <p dir="ltr" className="text-sm font-semibold uppercase tracking-[0.25em] text-brass-deep" style={{ textAlign: "start" }}>{p.brand}</p>
          <h2 className="mt-2 font-display text-[1.8rem] leading-tight">{p.name}</h2>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold tabular-nums text-brass-deep">{money(p.price, l)}</span>
            {off > 0 && <s className="tabular-nums text-smoke">{money(p.compareAt!, l)}</s>}
          </div>
          <p className="mt-4 leading-7 text-ink/80">{p.desc}</p>
          <p className="mt-4 text-sm text-smoke">{p.category}</p>
          <div className="mt-auto pt-8">
            <div className="flex gap-3">
              <div className="flex items-center border border-onyx/80" role="group" aria-label={t.pdp.qty}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={soldOut} aria-label={t.pdp.decrease} className="grid size-11 place-items-center disabled:opacity-30"><Minus className="size-4" /></button>
                <output className="w-7 text-center font-semibold tabular-nums">{qty}</output>
                <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))} disabled={soldOut} aria-label={t.pdp.increase} className="grid size-11 place-items-center disabled:opacity-30"><Plus className="size-4" /></button>
              </div>
              <button disabled={soldOut} className="btn-dark flex-1"
                onClick={() => { add({ id: p.id, slug: p.slug, name: p.name, image: p.image, price: p.price, stock: p.stock }, qty); close(null); }}>
                <ShoppingBag className="size-4" strokeWidth={1.6} /> {soldOut ? t.product.soldOut : t.product.addToCart}
              </button>
            </div>
            <Link href={href(l, `/p/${p.slug}`)} onClick={() => close(null)} className="mt-4 inline-block text-sm font-semibold underline underline-offset-4 hover:text-brass-deep">
              {t.pdp.fullDetails}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
