"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Banknote, Check, Gift, Heart, Link2, Minus, Plus, RefreshCw, ShoppingBag, Truck } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "../ui/useHydrated";
import { href, money, pct } from "@/lib/format";
import { FREE_SHIPPING_OVER, GOVERNORATES, ZONES, shippingFor } from "@/lib/egypt";
import type { CardProduct } from "@/lib/types";

export function BuyBox({ p, sku, brandSlug, categorySlug }: { p: CardProduct; sku: string; brandSlug: string; categorySlug: string }) {
  const { l, t } = useI18n();
  const router = useRouter();
  const h = useHydrated();
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.ids.includes(p.id));
  const toggle = useWishlist((s) => s.toggle);
  const [qty, setQty] = useState(1);
  const [gov, setGov] = useState("");
  const [copied, setCopied] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const actions = useRef<HTMLDivElement>(null);
  useEffect(() => setPageUrl(window.location.href), []);

  const soldOut = p.stock === 0;
  const low = p.stock > 0 && p.stock <= 5;
  const off = pct(p.price, p.compareAt);
  const line = { id: p.id, slug: p.slug, name: p.name, image: p.image, price: p.price, stock: p.stock };

  useEffect(() => {
    const el = actions.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const g = GOVERNORATES.find((x) => x.id === gov);
  const fee = g ? shippingFor(g.id, p.price * qty) : 0;

  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  return (
    <div>
      <Link href={`${href(l, "/shop")}?brand=${brandSlug}`} dir="ltr" className="inline-block text-sm font-semibold uppercase tracking-[0.25em] text-brass-deep hover:text-ink">
        {p.brand}
      </Link>
      <h1 className="mt-3 font-display text-[2rem] leading-tight md:text-[2.5rem]">{p.name}</h1>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-[1.75rem] font-semibold tabular-nums text-brass-deep">{money(p.price, l)}</span>
        {off > 0 && (
          <>
            <s className="text-lg tabular-nums text-smoke">{money(p.compareAt!, l)}</s>
            <span className="bg-sale px-2.5 py-1 text-xs font-bold text-bone">{t.pdp.save(money(p.compareAt! - p.price, l))}</span>
          </>
        )}
      </div>

      <p className="mt-5 leading-8 text-ink/80">{p.desc}</p>

      {/* Stock */}
      <div className="mt-6">
        <p className={`flex items-center gap-2 text-sm font-semibold ${soldOut ? "text-sale" : low ? "text-brass-deep" : "text-[#3c6b3f]"}`}>
          <span className="size-2 rounded-full bg-current" />
          {soldOut ? t.pdp.outOfStock : low ? t.product.only(p.stock) : t.pdp.inStock}
        </p>
        {low && (
          <div className="mt-2 h-1 w-48 bg-line" aria-hidden>
            <div className="h-full bg-brass" style={{ width: `${(p.stock / 10) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div ref={actions} className="mt-7 flex gap-3">
        <div className="flex items-center border border-onyx/80" role="group" aria-label={t.pdp.qty}>
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={soldOut || qty <= 1} aria-label={t.pdp.decrease} className="grid size-12 place-items-center disabled:opacity-30">
            <Minus className="size-4" />
          </button>
          <output className="w-8 text-center font-semibold tabular-nums" aria-live="polite">{qty}</output>
          <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))} disabled={soldOut || qty >= p.stock} aria-label={t.pdp.increase} className="grid size-12 place-items-center disabled:opacity-30">
            <Plus className="size-4" />
          </button>
        </div>
        <button onClick={() => add(line, qty)} disabled={soldOut} className="btn-dark flex-1">
          <ShoppingBag className="size-4" strokeWidth={1.6} />
          {soldOut ? t.product.soldOut : t.product.addToCart}
        </button>
        <button onClick={() => toggle(p.id)} aria-pressed={h && wished} aria-label={h && wished ? t.product.wishlistRemove : t.product.wishlistAdd}
          className="grid size-[50px] shrink-0 place-items-center border border-line transition-colors hover:border-brass">
          <Heart className={`size-5 ${h && wished ? "fill-brass text-brass" : ""}`} strokeWidth={1.5} />
        </button>
      </div>
      <button
        onClick={() => { add(line, qty); useCart.getState().setOpen(false); router.push(href(l, "/checkout")); }}
        disabled={soldOut}
        className="btn-line mt-3 w-full"
      >
        {t.pdp.buyNow}
      </button>

      {/* Delivery estimate */}
      <div className="mt-8 border border-line bg-bone p-5">
        <label className="flex flex-wrap items-center gap-3 text-sm">
          <Truck className="size-5 text-brass" strokeWidth={1.4} />
          <span className="font-semibold">{t.pdp.deliveryTitle}</span>
          <select value={gov} onChange={(e) => setGov(e.target.value)} className="select ms-auto max-w-[55%] text-sm">
            <option value="">{t.pdp.deliveryPick}</option>
            {GOVERNORATES.map((x) => <option key={x.id} value={x.id}>{l === "ar" ? x.ar : x.en}</option>)}
          </select>
        </label>
        {g && (
          <p className="mt-3 text-sm text-smoke" aria-live="polite">
            {t.pdp.deliveryTo(
              fee === 0 ? t.pdp.free : money(fee, l),
              l === "ar" ? ZONES[g.zone].daysAr : ZONES[g.zone].daysEn,
            )}
            {fee > 0 && p.price * qty < FREE_SHIPPING_OVER && <span className="block text-xs">{t.cart.freeLeft(money(FREE_SHIPPING_OVER - p.price * qty, l))}</span>}
          </p>
        )}
      </div>

      <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
        {[Banknote, RefreshCw, Gift].map((Icon, k) => (
          <li key={k} className="flex flex-col items-center gap-2 py-2">
            <Icon className="size-5 text-brass" strokeWidth={1.4} />
            {t.pdp.guarantees[k]}
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-2 border-t border-line pt-6 text-sm">
        <div className="flex gap-2"><dt className="text-smoke">{t.pdp.sku}:</dt><dd dir="ltr" className="font-mono text-xs leading-6">{sku}</dd></div>
        <div className="flex gap-2"><dt className="text-smoke">{t.pdp.category}:</dt><dd><Link href={href(l, `/c/${categorySlug}`)} className="hover:text-brass-deep">{p.category}</Link></dd></div>
        <div className="flex items-center gap-3">
          <dt className="text-smoke">{t.pdp.share}:</dt>
          <dd className="flex items-center gap-3">
            <a href={`https://wa.me/?text=${encodeURIComponent(p.name)}%20${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-brass-deep">
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z" /></svg>
            </a>
            <button onClick={copy} className="flex items-center gap-1 hover:text-brass-deep" aria-live="polite">
              {copied ? <Check className="size-4 text-brass" /> : <Link2 className="size-4" />}
              <span className="text-xs">{copied ? t.pdp.copied : t.pdp.copy}</span>
            </button>
          </dd>
        </div>
      </dl>

      {/* Sticky purchase bar once the main actions scroll away */}
      <div
        className={`fixed inset-x-0 bottom-[calc(57px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-bone/95 backdrop-blur transition-transform duration-500 ease-[var(--ease-dial)] lg:bottom-0 ${sticky ? "translate-y-0" : "translate-y-[150%]"}`}
        aria-hidden={!sticky}
      >
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:px-8">
          <div className="relative size-12 shrink-0 overflow-hidden bg-onyx"><Image src={p.image} alt="" fill sizes="48px" className="object-cover" /></div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{p.name}</p>
            <p className="text-sm tabular-nums text-brass-deep">{money(p.price, l)}</p>
          </div>
          <button onClick={() => add(line, qty)} disabled={soldOut} tabIndex={sticky ? 0 : -1} className="btn-dark !px-5 !py-3">
            <ShoppingBag className="size-4" strokeWidth={1.6} />
            <span className="max-sm:hidden">{soldOut ? t.product.soldOut : t.product.addToCart}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
