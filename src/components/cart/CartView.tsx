"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { useHydrated } from "../ui/useHydrated";
import { useCart, cartTotal } from "@/store/cart";
import { FREE_SHIPPING_OVER } from "@/lib/egypt";
import { href, money } from "@/lib/format";
import { useCoupon } from "./useCoupon";
import { CouponBox } from "./CouponBox";

export function CartView() {
  const { l, t } = useI18n();
  const h = useHydrated();
  const { lines, setQty, remove, clear } = useCart();
  const subtotal = useCart(cartTotal);
  const c = useCoupon();
  const Back = l === "ar" ? ArrowRight : ArrowLeft;

  if (!h) return <div className="mx-auto h-96 max-w-[1280px]" />;
  if (lines.length === 0) return <EmptyCart />;

  const left = Math.max(0, FREE_SHIPPING_OVER - subtotal);
  const row = "flex justify-between gap-4 py-2";

  return (
    <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1fr_360px] lg:py-14">
      <div>
        <div className="hidden grid-cols-[1fr_120px_130px_110px] border-b border-onyx pb-3 text-xs font-semibold uppercase tracking-wider text-smoke md:grid">
          <span>{t.cartPage.product}</span><span className="text-center">{t.cart.qty}</span><span className="text-end">{t.cartPage.total}</span><span />
        </div>
        <ul className="divide-y divide-line">
          {lines.map((x) => (
            <li key={x.id} className="grid grid-cols-[80px_1fr] items-center gap-x-4 gap-y-3 py-5 md:grid-cols-[1fr_120px_130px_110px] md:gap-0">
              <div className="flex items-center gap-4 max-md:contents">
                <Link href={href(l, `/p/${x.slug}`)} className="relative size-20 shrink-0 overflow-hidden bg-onyx">
                  <Image src={x.image} alt="" fill sizes="80px" className="object-cover" />
                </Link>
                <div className="min-w-0">
                  <Link href={href(l, `/p/${x.slug}`)} className="line-clamp-2 leading-snug hover:text-brass-deep">{x.name}</Link>
                  <p className="mt-1 text-sm tabular-nums text-smoke">{money(x.price, l)}</p>
                  {x.stock <= 3 && <p className="mt-1 text-xs text-brass-deep">{t.product.only(x.stock)}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 max-md:col-start-2 md:contents">
                <div className="flex items-center justify-self-center border border-line" role="group" aria-label={t.cart.qty}>
                  <button className="grid size-9 place-items-center hover:bg-stone disabled:opacity-30" onClick={() => setQty(x.id, x.qty - 1)} disabled={x.qty <= 1} aria-label={t.pdp.decrease}><Minus className="size-3.5" /></button>
                  <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{x.qty}</span>
                  <button className="grid size-9 place-items-center hover:bg-stone disabled:opacity-30" onClick={() => setQty(x.id, x.qty + 1)} disabled={x.qty >= x.stock} aria-label={t.pdp.increase}><Plus className="size-3.5" /></button>
                </div>
                <span className="text-end font-semibold tabular-nums">{money(x.price * x.qty, l)}</span>
                <button onClick={() => remove(x.id)} className="justify-self-end p-2 text-smoke hover:text-sale" aria-label={t.cart.remove}><Trash2 className="size-4" strokeWidth={1.5} /></button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-onyx pt-5 text-sm">
          <Link href={href(l, "/shop")} className="flex items-center gap-2 font-semibold hover:text-brass-deep"><Back className="size-4" />{t.cartPage.continue}</Link>
          <button onClick={clear} className="text-smoke underline-offset-4 hover:text-sale hover:underline">{t.cartPage.clear}</button>
        </div>
      </div>

      <aside className="h-fit border border-line bg-bone p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl">{t.cartPage.summary}</h2>
        <div className="mt-5">
          <p className="mb-2 text-sm">{left > 0 ? t.cart.freeLeft(money(left, l)) : t.cart.freeReached}</p>
          <div className="h-1 bg-line"><div className="h-full bg-brass transition-[width] duration-500" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_OVER) * 100)}%` }} /></div>
        </div>
        <div className="mt-6"><CouponBox c={c} /></div>
        <div className="mt-6 border-t border-line pt-4 text-sm">
          <p className={row}><span>{t.cart.subtotal}</span><span className="tabular-nums">{money(subtotal, l)}</span></p>
          {c.discount > 0 && <p className={`${row} text-[#3c6b3f]`}><span>{t.cartPage.discount}</span><span className="tabular-nums">−{money(c.discount, l)}</span></p>}
          <p className={row}><span>{t.cartPage.shipping}</span><span className="text-smoke">{left === 0 ? t.pdp.free : t.cartPage.shippingCalc}</span></p>
          <p className={`${row} mt-2 border-t border-line pt-4 text-lg font-semibold`}><span>{t.cartPage.grand}</span><span className="tabular-nums text-brass-deep">{money(subtotal - c.discount, l)}</span></p>
        </div>
        <Link href={href(l, "/checkout")} className="btn-dark mt-5 w-full">{t.cart.checkout}</Link>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-smoke"><ShieldCheck className="size-4 text-brass" />{t.cartPage.secure}</p>
      </aside>
    </div>
  );
}

export function EmptyCart() {
  const { l, t } = useI18n();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <div className="grid size-24 place-items-center text-brass" style={{ clipPath: "polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)", background: "var(--color-bone)" }}>
        <ShoppingBag className="size-9" strokeWidth={1.2} />
      </div>
      <p className="mt-6 font-display text-2xl">{t.cart.empty}</p>
      <p className="mt-2 text-smoke">{t.cart.emptyBody}</p>
      <Link href={href(l, "/shop")} className="btn-dark mt-8">{t.cart.backToShop}</Link>
    </div>
  );
}
