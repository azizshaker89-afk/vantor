"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingBag, SlidersHorizontal, Store, User } from "lucide-react";
import { useUI } from "@/store/ui";
import { useI18n } from "../I18nProvider";
import { useCart, cartCount } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "../ui/useHydrated";
import { href } from "@/lib/format";

export function MobileBar() {
  const { l, t } = useI18n();
  const h = useHydrated();
  const count = useCart(cartCount);
  const setOpen = useCart((s) => s.setOpen);
  const wish = useWishlist((s) => s.ids.length);
  const setPanel = useUI((s) => s.setPanel);
  const catalog = /^\/(ar|en)\/(shop|c\/)/.test(usePathname());
  const item = "flex flex-1 flex-col items-center gap-1 py-2 text-[0.72rem] font-semibold";
  const badge = (n: number) =>
    h && <span className="absolute -top-1.5 -end-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-brass px-1 text-[0.6rem] leading-none text-onyx">{n}</span>;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-bone/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Quick">
      <Link href={href(l, "/shop")} className={item}><Store className="size-5" strokeWidth={1.4} />{t.mobile.shop}</Link>
      {catalog && <button onClick={() => setPanel("filters")} className={item}><SlidersHorizontal className="size-5" strokeWidth={1.4} />{t.catalog.filters}</button>}
      <Link href={href(l, "/wishlist")} className={item}><span className="relative"><Heart className="size-5" strokeWidth={1.4} />{badge(wish)}</span>{t.mobile.wishlist}</Link>
      <button onClick={() => setOpen(true)} className={item}><span className="relative"><ShoppingBag className="size-5" strokeWidth={1.4} />{badge(count)}</span>{t.mobile.cart}</button>
      <Link href={href(l, "/account")} className={item}><User className="size-5" strokeWidth={1.4} />{t.mobile.account}</Link>
    </nav>
  );
}
