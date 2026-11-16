import Image from "next/image";
import Link from "next/link";
import type { Order, OrderItem } from "@prisma/client";
import type { Dict, Locale } from "@/i18n/dict";
import { href, money } from "@/lib/format";
import { StatusBadge, fmtDate } from "../order/OrderDetail";

export function OrderList({ orders, t, l }: { orders: (Order & { items: OrderItem[] })[]; t: Dict; l: Locale }) {
  return (
    <ul className="divide-y divide-line border border-line bg-bone">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={href(l, `/account/orders/${o.number}`)} className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5 transition-colors hover:bg-stone/60">
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {o.items.slice(0, 3).map((x) => (
                <div key={x.id} className="relative size-12 overflow-hidden rounded-full border-2 border-bone bg-onyx"><Image src={x.image} alt="" fill sizes="48px" className="object-cover" /></div>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold" dir="ltr">{o.number}</p>
              <p className="text-xs text-smoke">{fmtDate(o.createdAt, l)} · {t.cartPage.items(o.items.reduce((a, x) => a + x.qty, 0))}</p>
            </div>
            <StatusBadge status={o.status} t={t} />
            <p className="w-28 text-end font-semibold tabular-nums">{money(o.total, l)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
