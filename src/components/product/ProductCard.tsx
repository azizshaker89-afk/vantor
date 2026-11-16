"use client";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, Plus, ShoppingBag } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { Mark } from "../ui/Logo";
import { Price } from "../ui/Price";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "../ui/useHydrated";
import { useUI } from "@/store/ui";
import { href, pct } from "@/lib/format";
import type { CardProduct } from "@/lib/types";

function Tile({ p, priority }: { p: CardProduct; priority?: boolean }) {
  const { t } = useI18n();
  const off = pct(p.price, p.compareAt);
  return (
    <div className="relative aspect-square overflow-hidden bg-onyx">
      <Image src={p.image} alt={p.name} fill priority={priority} sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 48vw" className={`object-cover ${p.stock === 0 ? "opacity-60 grayscale-[40%]" : ""}`} />
      <Mark className="absolute bottom-3 start-3 size-5 text-brass/60" />
      {off > 0 && (
        <span className="absolute top-3 start-3 grid size-10 place-items-center rounded-full bg-onyx text-[0.7rem] font-bold text-bone ring-1 ring-bone/15" dir="ltr">
          -{off}%
        </span>
      )}
      {p.stock === 0 && (
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-onyx/80 py-2 text-center text-sm tracking-wide text-bone">{t.product.soldOut}</span>
      )}
    </div>
  );
}

export function ProductCard({ p, priority }: { p: CardProduct; priority?: boolean }) {
  const { l, t } = useI18n();
  const h = useHydrated();
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.ids.includes(p.id));
  const toggle = useWishlist((s) => s.toggle);
  const quick = useUI((s) => s.setQuick);
  const link = href(l, `/p/${p.slug}`);
  const soldOut = p.stock === 0;
  const doAdd = () => add({ id: p.id, slug: p.slug, name: p.name, image: p.image, price: p.price, stock: p.stock });
  const heart = (
    <Heart className={`size-5 ${h && wished ? "fill-brass text-brass" : ""}`} strokeWidth={1.5} />
  );

  const meta = (
    <>
      <h3 className="mt-3 truncate px-1 text-[0.9rem] leading-normal">
        <Link href={link} className="hover:text-brass-deep focus-visible:outline-none">{p.name}</Link>
      </h3>
      <p className="mt-0.5 text-xs text-smoke" dir="ltr">{p.brand}</p>
      <Price price={p.price} compareAt={p.compareAt} l={l} className="mt-1.5" />
    </>
  );

  return (
    <article className="pcard group relative text-center">
      {/* In-flow card (always rendered; carries touch actions on small screens) */}
      <div className="relative">
        <Link href={link} tabIndex={-1} aria-hidden>
          <Tile p={p} priority={priority} />
        </Link>
        <button
          onClick={() => toggle(p.id)}
          aria-label={wished ? t.product.wishlistRemove : t.product.wishlistAdd}
          aria-pressed={h && wished}
          className="absolute top-3 end-3 grid size-9 place-items-center rounded-full bg-bone/90 text-ink lg:hidden"
        >
          {heart}
        </button>
        {!soldOut && (
          <button onClick={doAdd} aria-label={t.product.addToCart} className="absolute bottom-3 end-3 grid size-9 place-items-center rounded-full bg-brass text-onyx lg:hidden">
            <Plus className="size-5" strokeWidth={1.8} />
          </button>
        )}
      </div>
      {meta}

      {/* Desktop hover panel: lifts the card onto bone and reveals description + actions */}
      <div className="pcard-panel absolute -inset-x-3 -top-3 hidden bg-bone p-3 pb-5 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.35)] transition-[opacity,transform] duration-300 ease-[var(--ease-dial)] lg:block">
        <Link href={link} tabIndex={-1} aria-hidden>
          <Tile p={p} />
        </Link>
        {meta}
        <p className="mt-3 line-clamp-2 px-2 text-sm leading-6 text-smoke">{p.desc}</p>
        <div className="mt-4 flex items-center justify-between gap-2 px-1">
          <button onClick={() => toggle(p.id)} aria-label={wished ? t.product.wishlistRemove : t.product.wishlistAdd} aria-pressed={h && wished} className="grid size-10 place-items-center hover:text-brass-deep">
            {heart}
          </button>
          <button
            onClick={doAdd}
            disabled={soldOut}
            className="flex flex-1 items-center justify-center gap-2 bg-onyx py-2.5 text-sm font-semibold text-bone transition-colors hover:bg-brass hover:text-onyx disabled:cursor-not-allowed disabled:bg-line disabled:text-smoke"
          >
            <ShoppingBag className="size-4" strokeWidth={1.6} />
            {soldOut ? t.product.soldOut : t.product.addToCart}
          </button>
          <button onClick={() => quick(p)} aria-label={t.pdp.quickView} title={t.pdp.quickView} className="grid size-10 place-items-center hover:text-brass-deep">
            <Eye className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </article>
  );
}
