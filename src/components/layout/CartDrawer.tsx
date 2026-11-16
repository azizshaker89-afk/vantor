"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { Drawer } from "../ui/Drawer";
import { useCart, cartTotal } from "@/store/cart";
import { href, money } from "@/lib/format";
import { FREE_SHIPPING_OVER } from "@/lib/egypt";
import { useHydrated } from "../ui/useHydrated";

export function CartDrawer() {
  const { l, t } = useI18n();
  const hydrated = useHydrated();
  const { lines, open, setOpen, setQty, remove } = useCart();
  const total = useCart(cartTotal);
  const close = () => setOpen(false);
  const left = Math.max(0, FREE_SHIPPING_OVER - total);
  const items = hydrated ? lines : [];

  return (
    <Drawer
      open={open}
      onClose={close}
      title={t.cart.title}
      footer={
        items.length > 0 && (
          <div className="border-t border-line p-6">
            <div className="mb-4">
              <p className="mb-2 text-sm">{left > 0 ? t.cart.freeLeft(money(left, l)) : t.cart.freeReached}</p>
              <div className="h-1 bg-line">
                <div className="h-full bg-brass transition-[width] duration-500" style={{ width: `${Math.min(100, (total / FREE_SHIPPING_OVER) * 100)}%` }} />
              </div>
            </div>
            <div className="mb-5 flex items-center justify-between text-lg">
              <span>{t.cart.subtotal}</span>
              <span className="font-semibold tabular-nums">{money(total, l)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href={href(l, "/cart")} onClick={close} className="border border-ink py-3 text-center text-sm font-semibold hover:bg-ink hover:text-bone">
                {t.cart.viewCart}
              </Link>
              <Link href={href(l, "/checkout")} onClick={close} className="bg-brass py-3 text-center text-sm font-semibold text-onyx hover:bg-brass-deep hover:text-bone">
                {t.cart.checkout}
              </Link>
            </div>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center px-8 py-16 text-center">
          <ShoppingBag className="mb-5 size-16 text-line" strokeWidth={1} />
          <p className="font-display text-xl">{t.cart.empty}</p>
          <p className="mt-1 mb-6 text-sm text-smoke">{t.cart.emptyBody}</p>
          <Link href={href(l, "/shop")} onClick={close} className="bg-brass px-6 py-3 text-sm font-semibold text-onyx hover:bg-brass-deep hover:text-bone">
            {t.cart.backToShop}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((x) => (
            <li key={x.id} className="flex gap-4 px-6 py-5">
              <Link href={href(l, `/p/${x.slug}`)} onClick={close} className="relative size-20 shrink-0 overflow-hidden bg-onyx">
                <Image src={x.image} alt="" fill sizes="80px" className="object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={href(l, `/p/${x.slug}`)} onClick={close} className="line-clamp-2 text-[0.95rem] leading-snug hover:text-brass-deep">{x.name}</Link>
                <span className="mt-1 text-sm text-brass-deep tabular-nums">{money(x.price, l)}</span>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center border border-line" role="group" aria-label={t.cart.qty}>
                    <button className="grid size-8 place-items-center hover:bg-stone disabled:opacity-30" onClick={() => setQty(x.id, x.qty - 1)} disabled={x.qty <= 1} aria-label="-">
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">{x.qty}</span>
                    <button className="grid size-8 place-items-center hover:bg-stone disabled:opacity-30" onClick={() => setQty(x.id, x.qty + 1)} disabled={x.qty >= x.stock} aria-label="+">
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button onClick={() => remove(x.id)} className="text-smoke hover:text-sale" aria-label={t.cart.remove}>
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
