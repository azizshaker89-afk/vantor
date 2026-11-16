"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Banknote, CreditCard, Loader2, Lock, Truck } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { useHydrated } from "../ui/useHydrated";
import { Field, FormError, TextArea, fieldCls, msg } from "../ui/Field";
import { useCart, cartTotal } from "@/store/cart";
import { GOVERNORATES, ZONES, shippingFor } from "@/lib/egypt";
import { href, money } from "@/lib/format";
import { placeOrder } from "@/actions/checkout";
import type { FieldErrors } from "@/lib/validation";
import { useCoupon } from "../cart/useCoupon";
import { CouponBox } from "../cart/CouponBox";
import { EmptyCart } from "../cart/CartView";

export interface CheckoutDefaults { name: string; phone: string; email: string; governorate: string; city: string; address: string; signedIn: boolean }

const OCT = "polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line pb-8">
      <legend className="mb-5 flex items-center gap-3 font-display text-xl">
        <span className="grid size-8 place-items-center bg-onyx text-sm text-brass-soft" style={{ clipPath: OCT }}>{n}</span>{title}
      </legend>
      {children}
    </fieldset>
  );
}

export function CheckoutForm({ d }: { d: CheckoutDefaults }) {
  const { l, t } = useI18n();
  const router = useRouter();
  const h = useHydrated();
  const lines = useCart((s) => s.lines);
  const subtotal = useCart(cartTotal);
  const c = useCoupon();
  const [f, setF] = useState({ ...d, notes: "", payment: "COD" as "COD" | "CARD_ON_DELIVERY" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState("");
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  if (!h) return <div className="h-[70vh]" />;
  if (lines.length === 0 && !done) return <EmptyCart />;

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: "" }));
  };
  const gov = GOVERNORATES.find((g) => g.id === f.governorate);
  const shipping = gov ? shippingFor(gov.id, subtotal) : null;
  const total = subtotal - c.discount + (shipping ?? 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("");
    start(async () => {
      const r = await placeOrder({
        name: f.name, phone: f.phone.replace(/\s/g, ""), email: f.email, governorate: f.governorate, city: f.city, address: f.address,
        notes: f.notes, payment: f.payment, coupon: c.result?.ok ? c.code ?? "" : "", items: lines.map((x) => ({ id: x.id, qty: x.qty })),
      });
      if (r.ok) {
        setDone(true);
        useCart.getState().clear();
        router.replace(`${href(l, `/order/${r.id}`)}?placed=1`);
        return;
      }
      setErrors(r.errors);
      if (r.stock) { useCart.getState().sync(r.stock); setNotice(t.checkout.stockChanged); }
      else if (r.errors.form) setNotice(msg(t.errors, r.errors.form));
      else if (r.errors.coupon) { c.remove(); setNotice(msg(t.errors, r.errors.coupon)); }
      document.querySelector("[aria-invalid=true]")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const row = "flex justify-between gap-4 py-1.5";
  const payOpt = (v: "COD" | "CARD_ON_DELIVERY", Icon: typeof Banknote, title: string, body: string) => (
    <label className={`flex cursor-pointer items-start gap-4 border p-4 transition-colors ${f.payment === v ? "border-brass bg-brass-soft/10" : "border-line bg-bone hover:border-smoke"}`}>
      <input type="radio" name="payment" value={v} checked={f.payment === v} onChange={set("payment")} className="mt-1 accent-[var(--color-brass)]" />
      <span className="flex-1"><span className="block font-semibold">{title}</span><span className="text-sm text-smoke">{body}</span></span>
      <Icon className="size-6 text-brass" strokeWidth={1.3} />
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="mx-auto grid max-w-[1280px] gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1fr_400px] lg:py-14">
      <div className="space-y-8">
        {!d.signedIn && (
          <p className="border border-line bg-bone px-5 py-4 text-sm">
            {t.checkout.loginHint}{" "}
            <Link href={`${href(l, "/login")}?next=${encodeURIComponent(href(l, "/checkout"))}`} className="font-semibold text-brass-deep underline underline-offset-4">{t.checkout.login}</Link>{" "}
            {t.checkout.loginTail}
          </p>
        )}
        <FormError>{notice}</FormError>

        <Step n={1} title={t.checkout.contact}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t.checkout.name} name="name" value={f.name} onChange={set("name")} error={errors.name} autoComplete="name" required />
            <Field label={t.checkout.phone} name="phone" value={f.phone} onChange={set("phone")} error={errors.phone} type="tel" inputMode="tel" dir="ltr" placeholder="01xxxxxxxxx" autoComplete="tel" required />
            <Field label={t.checkout.email} name="email" value={f.email} onChange={set("email")} error={errors.email} type="email" dir="ltr" autoComplete="email" className="md:col-span-2" />
          </div>
        </Step>

        <Step n={2} title={t.checkout.delivery}>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="gov" className="mb-1.5 block text-sm font-semibold">{t.checkout.governorate}</label>
              <select id="gov" value={f.governorate} onChange={set("governorate")} aria-invalid={!!errors.governorate} className={`${fieldCls} cursor-pointer`}>
                <option value="">{t.checkout.pick}</option>
                {GOVERNORATES.map((g) => <option key={g.id} value={g.id}>{l === "ar" ? g.ar : g.en}</option>)}
              </select>
              {errors.governorate ? <p role="alert" className="mt-1.5 text-xs text-sale">{msg(t.errors, errors.governorate)}</p>
                : gov && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-smoke"><Truck className="size-3.5 text-brass" />{t.checkout.eta(l === "ar" ? ZONES[gov.zone].daysAr : ZONES[gov.zone].daysEn)}</p>}
            </div>
            <Field label={t.checkout.city} name="city" value={f.city} onChange={set("city")} error={errors.city} autoComplete="address-level2" required />
            <Field label={t.checkout.address} name="address" value={f.address} onChange={set("address")} error={errors.address} placeholder={t.checkout.addressPh} autoComplete="street-address" className="md:col-span-2" required />
            <TextArea label={t.checkout.notes} name="notes" value={f.notes} onChange={set("notes")} rows={2} maxLength={300} className="md:col-span-2" />
          </div>
        </Step>

        <Step n={3} title={t.checkout.payment}>
          <div className="grid gap-3 md:grid-cols-2">
            {payOpt("COD", Banknote, t.checkout.cod, t.checkout.codBody)}
            {payOpt("CARD_ON_DELIVERY", CreditCard, t.checkout.card, t.checkout.cardBody)}
          </div>
        </Step>
      </div>

      <aside className="h-fit border border-line bg-bone lg:sticky lg:top-28">
        <h2 className="border-b border-line px-6 py-4 font-display text-xl">{t.checkout.review}</h2>
        <ul className="max-h-72 divide-y divide-line overflow-y-auto px-6">
          {lines.map((x) => (
            <li key={x.id} className="flex items-center gap-3 py-3">
              <div className="relative size-14 shrink-0 bg-onyx">
                <Image src={x.image} alt="" fill sizes="56px" className="object-cover" />
                <span className="absolute -top-2 -end-2 grid size-5 place-items-center rounded-full bg-brass text-[0.65rem] font-bold text-onyx">{x.qty}</span>
              </div>
              <p className="line-clamp-2 flex-1 text-sm">{x.name}</p>
              <p className="text-sm tabular-nums">{money(x.price * x.qty, l)}</p>
            </li>
          ))}
        </ul>
        <div className="border-t border-line px-6 py-5"><CouponBox c={c} /></div>
        <div className="border-t border-line px-6 py-5 text-sm">
          <p className={row}><span>{t.cart.subtotal}</span><span className="tabular-nums">{money(subtotal, l)}</span></p>
          {c.discount > 0 && <p className={`${row} text-[#3c6b3f]`}><span>{t.cartPage.discount}</span><span className="tabular-nums">−{money(c.discount, l)}</span></p>}
          <p className={row}><span>{t.cartPage.shipping}</span><span className={shipping == null ? "text-smoke" : "tabular-nums"}>{shipping == null ? t.cartPage.shippingCalc : shipping === 0 ? t.pdp.free : money(shipping, l)}</span></p>
          <p className={`${row} mt-2 border-t border-line pt-4 text-lg font-semibold`}><span>{t.cartPage.grand}</span><span className="tabular-nums text-brass-deep">{money(total, l)}</span></p>
          <button disabled={pending} className="btn-dark mt-5 w-full !py-4">
            {pending ? <><Loader2 className="size-4 animate-spin" />{t.checkout.placing}</> : <><Lock className="size-4" />{t.checkout.place}</>}
          </button>
          <p className="mt-3 text-center text-xs leading-5 text-smoke">{t.checkout.terms}</p>
          <Link href={href(l, "/cart")} className="mt-3 block text-center text-xs font-semibold text-smoke hover:text-ink">{t.checkout.back}</Link>
        </div>
      </aside>
    </form>
  );
}
