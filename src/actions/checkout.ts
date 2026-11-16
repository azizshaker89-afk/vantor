"use server";
import { db } from "@/lib/db";
import { sessionUserId } from "@/lib/auth";
import { evaluateCoupon, type CouponResult } from "@/lib/coupons";
import { GOVERNORATES, shippingFor } from "@/lib/egypt";
import { checkoutSchema, fieldErrors, type FieldErrors } from "@/lib/validation";

type Line = { id: string; qty: number };

/** Re-prices the cart from the DB: the client never decides what anything costs. */
async function price(items: Line[]) {
  const rows = await db.product.findMany({ where: { id: { in: items.map((i) => i.id) }, active: true } });
  const lines = items.flatMap((i) => {
    const p = rows.find((r) => r.id === i.id);
    return p ? [{ p, qty: i.qty }] : [];
  });
  return { lines, subtotal: lines.reduce((a, x) => a + x.p.price * x.qty, 0) };
}

export async function previewCoupon(code: string, items: Line[]): Promise<CouponResult> {
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) return { ok: false, reason: "invalid" };
  const { subtotal } = await price(items.map((i) => ({ id: String(i.id), qty: Math.max(1, Math.min(20, Math.floor(Number(i.qty) || 1))) })));
  return evaluateCoupon(String(code ?? "").slice(0, 30), subtotal);
}

export type PlaceResult =
  | { ok: true; id: string; number: string }
  | { ok: false; errors: FieldErrors; stock?: { id: string; available: number }[] };

export async function placeOrder(input: unknown): Promise<PlaceResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const { lines, subtotal } = await price(d.items);
  if (lines.length !== d.items.length) return { ok: false, errors: { form: "unavailable" } };
  const short = lines.filter((x) => x.p.stock < x.qty).map((x) => ({ id: x.p.id, available: x.p.stock }));
  if (short.length) return { ok: false, errors: { form: "stock" }, stock: short };

  let discount = 0;
  let couponCode: string | null = null;
  if (d.coupon) {
    const c = await evaluateCoupon(d.coupon, subtotal);
    if (!c.ok) return { ok: false, errors: { coupon: `coupon_${c.reason}` } };
    discount = c.discount;
    couponCode = c.code;
  }
  const shipping = shippingFor(d.governorate, subtotal);
  const gov = GOVERNORATES.find((g) => g.id === d.governorate)!;
  const userId = await sessionUserId();

  try {
    const order = await db.$transaction(async (tx) => {
      // Conditional decrement guards against two buyers taking the last piece at once.
      for (const x of lines) {
        const r = await tx.product.updateMany({ where: { id: x.p.id, stock: { gte: x.qty } }, data: { stock: { decrement: x.qty }, sold: { increment: x.qty } } });
        if (r.count === 0) throw new Error("STOCK");
      }
      if (couponCode) await tx.coupon.update({ where: { code: couponCode }, data: { uses: { increment: 1 } } });
      const last = await tx.order.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
      const seq = last ? Number(last.number.replace(/\D/g, "")) + 1 : 10240;
      return tx.order.create({
        data: {
          number: `VN-${seq}`,
          userId,
          name: d.name, phone: d.phone, email: d.email || null,
          governorate: gov.id, city: d.city, address: d.address, notes: d.notes || null,
          payment: d.payment,
          subtotal, shipping, discount, total: Math.max(0, subtotal - discount) + shipping, couponCode,
          items: { create: lines.map((x) => ({ productId: x.p.id, nameAr: x.p.nameAr, nameEn: x.p.nameEn, image: x.p.image, price: x.p.price, qty: x.qty })) },
        },
      });
    });
    return { ok: true, id: order.id, number: order.number };
  } catch (e) {
    if (e instanceof Error && e.message === "STOCK") return { ok: false, errors: { form: "stock" } };
    throw e;
  }
}
