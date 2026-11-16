import "server-only";
import { db } from "./db";

export type CouponResult =
  | { ok: true; code: string; discount: number; label: string }
  | { ok: false; reason: "invalid" | "expired" | "min"; min?: number };

/** Validates a code against the subtotal. Shared by the cart preview and order placement. */
export async function evaluateCoupon(raw: string, subtotal: number): Promise<CouponResult> {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false, reason: "invalid" };
  const c = await db.coupon.findUnique({ where: { code } });
  if (!c || !c.active) return { ok: false, reason: "invalid" };
  if (c.expiresAt && c.expiresAt < new Date()) return { ok: false, reason: "expired" };
  if (subtotal < c.minTotal) return { ok: false, reason: "min", min: c.minTotal };
  const discount = c.type === "PERCENT" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
  return { ok: true, code, discount, label: c.type === "PERCENT" ? `${c.value}%` : `${c.value}` };
}
