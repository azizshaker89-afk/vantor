"use client";
import { useEffect, useState, useTransition } from "react";
import { previewCoupon } from "@/actions/checkout";
import type { CouponResult } from "@/lib/coupons";
import { useCart } from "@/store/cart";

/** Keeps the stored coupon validated against the current cart (server-priced). */
export function useCoupon() {
  const lines = useCart((s) => s.lines);
  const code = useCart((s) => s.coupon);
  const setCoupon = useCart((s) => s.setCoupon);
  const [result, setResult] = useState<CouponResult | null>(null);
  const [pending, start] = useTransition();
  const key = lines.map((l) => `${l.id}:${l.qty}`).join(",");

  useEffect(() => {
    if (!code || lines.length === 0) { setResult(null); return; }
    let live = true;
    previewCoupon(code, lines.map((l) => ({ id: l.id, qty: l.qty }))).then((r) => live && setResult(r));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, key]);

  const apply = (raw: string) =>
    start(async () => {
      const r = await previewCoupon(raw, lines.map((l) => ({ id: l.id, qty: l.qty })));
      setResult(r);
      setCoupon(r.ok ? r.code : null);
    });

  return { code, result, pending, apply, remove: () => { setCoupon(null); setResult(null); }, discount: result?.ok ? result.discount : 0 };
}
