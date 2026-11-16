import "server-only";
import type { Prisma } from "@prisma/client";

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function orderWhere(sp: { q?: string; status?: string }): Prisma.OrderWhereInput {
  const q = sp.q?.trim();
  return {
    ...(sp.status && (ORDER_STATUSES as readonly string[]).includes(sp.status) ? { status: sp.status } : {}),
    ...(q ? { OR: [{ number: { contains: q.toUpperCase() } }, { name: { contains: q } }, { phone: { contains: q } }, { email: { contains: q.toLowerCase() } }] } : {}),
  };
}
