"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertAdmin } from "@/lib/admin";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

/** Changes status; cancelling returns stock to the shelf, un-cancelling takes it back (if still available). */
export async function setOrderStatus(id: string, status: string): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  if (!STATUSES.includes(status)) return { ok: false, error: "حالة غير صحيحة" };
  try {
    await db.$transaction(async (tx) => {
      const o = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
      if (o.status === status) return;
      if (status === "CANCELLED")
        for (const it of o.items) await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.qty }, sold: { decrement: it.qty } } });
      if (o.status === "CANCELLED")
        for (const it of o.items) {
          const r = await tx.product.updateMany({ where: { id: it.productId, stock: { gte: it.qty } }, data: { stock: { decrement: it.qty }, sold: { increment: it.qty } } });
          if (r.count === 0) throw new Error("STOCK");
        }
      await tx.order.update({ where: { id }, data: { status } });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "STOCK") return { ok: false, error: "المخزون مش كفاية عشان نرجّع الطلب ده" };
    throw e;
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/[locale]", "layout");
  return { ok: true };
}
