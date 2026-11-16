"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { useHydrated } from "../ui/useHydrated";
import { ProductCard } from "../product/ProductCard";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import { href } from "@/lib/format";
import type { CardProduct } from "@/lib/types";

export function WishlistView() {
  const { l, t } = useI18n();
  const h = useHydrated();
  const ids = useWishlist((s) => s.ids);
  const [items, setItems] = useState<CardProduct[] | null>(null);
  const key = ids.join(",");

  // Fetch once per locale/id-set; removing a heart filters locally without a refetch.
  useEffect(() => {
    if (!h) return;
    if (!key) { setItems([]); return; }
    const ctrl = new AbortController();
    fetch(`/api/products?l=${l}&ids=${encodeURIComponent(key)}`, { signal: ctrl.signal })
      .then((r) => r.json()).then(setItems).catch(() => {});
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h, l]);

  if (!h || items === null)
    return (
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-4 gap-y-10 px-4 py-12 md:grid-cols-4 md:gap-x-6 md:px-8">
        {Array.from({ length: Math.min(ids.length || 4, 8) }, (_, i) => <div key={i} className="aspect-square animate-pulse bg-line/60" />)}
      </div>
    );

  const shown = items.filter((p) => ids.includes(p.id));
  if (shown.length === 0)
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <div className="grid size-24 place-items-center bg-bone text-brass" style={{ clipPath: "polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)" }}>
          <Heart className="size-9" strokeWidth={1.2} />
        </div>
        <p className="mt-6 font-display text-2xl">{t.wishlist.empty}</p>
        <p className="mt-2 text-smoke">{t.wishlist.emptyBody}</p>
        <Link href={href(l, "/shop")} className="btn-dark mt-8">{t.cart.backToShop}</Link>
      </div>
    );

  const addAll = () => {
    const { add } = useCart.getState();
    shown.filter((p) => p.stock > 0).forEach((p) => add({ id: p.id, slug: p.slug, name: p.name, image: p.image, price: p.price, stock: p.stock }));
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 lg:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <p className="text-sm text-smoke">{t.cartPage.items(shown.length)}</p>
        <div className="flex items-center gap-5">
          <button onClick={() => useWishlist.setState({ ids: [] })} className="text-sm text-smoke hover:text-sale">{t.wishlist.clear}</button>
          <button onClick={addAll} className="btn-dark !py-2.5"><ShoppingBag className="size-4" strokeWidth={1.6} />{t.wishlist.addAll}</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {shown.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
