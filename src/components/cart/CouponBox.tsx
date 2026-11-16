"use client";
import { useState } from "react";
import { Tag, X } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { money } from "@/lib/format";
import type { useCoupon } from "./useCoupon";

export function CouponBox({ c }: { c: ReturnType<typeof useCoupon> }) {
  const { l, t } = useI18n();
  const [v, setV] = useState("");
  const err = c.result && !c.result.ok ? c.result : null;
  const errText = err ? (err.reason === "min" ? t.errors.coupon_min(money(err.min ?? 0, l)) : err.reason === "expired" ? t.errors.coupon_expired : t.errors.coupon_invalid) : null;

  if (c.code && c.result?.ok)
    return (
      <div className="flex items-center justify-between border border-dashed border-brass bg-brass-soft/15 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-semibold text-brass-deep"><Tag className="size-4" />{t.cartPage.couponOk(c.code)}</span>
        <button onClick={c.remove} className="flex items-center gap-1 text-xs text-smoke hover:text-sale"><X className="size-3.5" />{t.cartPage.removeCoupon}</button>
      </div>
    );

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); if (v.trim()) c.apply(v); }} className="flex">
        <label className="sr-only" htmlFor="coupon">{t.cartPage.coupon}</label>
        <input id="coupon" value={v} onChange={(e) => setV(e.target.value.toUpperCase())} placeholder={t.cartPage.couponPh} dir="ltr" autoComplete="off"
          className="min-w-0 flex-1 border border-line bg-bone px-4 py-2.5 text-sm uppercase tracking-wider outline-none focus:border-brass placeholder:normal-case placeholder:tracking-normal" />
        <button disabled={c.pending || !v.trim()} className="btn-dark !px-5 !py-2.5">{t.cartPage.apply}</button>
      </form>
      {errText ? <p role="alert" className="mt-2 text-xs text-sale">{errText}</p> : <p className="mt-2 text-xs text-smoke">{t.cartPage.hint}</p>}
    </div>
  );
}
