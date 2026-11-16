import Image from "next/image";
import { Check, X } from "lucide-react";
import type { Order, OrderItem } from "@prisma/client";
import type { Dict, Locale } from "@/i18n/dict";
import { GOVERNORATES } from "@/lib/egypt";
import { money } from "@/lib/format";

const FLOW = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

export const fmtDate = (d: Date, l: Locale) =>
  new Intl.DateTimeFormat(l === "ar" ? "ar-EG-u-nu-latn" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(d);

/** Status chip used in lists and the detail header. */
export function StatusBadge({ status, t }: { status: string; t: Dict }) {
  const tone: Record<string, string> = {
    PENDING: "bg-brass-soft/40 text-brass-deep", CONFIRMED: "bg-[#dfe7dc] text-[#3c6b3f]", SHIPPED: "bg-[#dde4ec] text-[#38506b]",
    DELIVERED: "bg-onyx text-bone", CANCELLED: "bg-sale/10 text-sale",
  };
  return <span className={`inline-block px-2.5 py-1 text-xs font-semibold ${tone[status] ?? ""}`}>{t.order.statuses[status] ?? status}</span>;
}

/** Four-step progress line; cancelled orders show a single struck state. */
export function Timeline({ status, t }: { status: string; t: Dict }) {
  if (status === "CANCELLED")
    return <p className="flex items-center gap-2 text-sm font-semibold text-sale"><X className="size-4" />{t.order.statuses.CANCELLED}</p>;
  const at = FLOW.indexOf(status);
  return (
    <ol className="grid grid-cols-4">
      {t.order.steps.map((s, i) => (
        <li key={s} className="relative flex flex-col items-center gap-2 text-center text-xs">
          {i > 0 && <span className={`absolute top-3.5 end-1/2 h-px w-full ${i <= at ? "bg-brass" : "bg-line"}`} aria-hidden />}
          <span className={`relative grid size-7 place-items-center rounded-full border ${i <= at ? "border-brass bg-brass text-onyx" : "border-line bg-bone text-smoke"}`}>
            {i <= at ? <Check className="size-3.5" strokeWidth={2.5} /> : i + 1}
          </span>
          <span className={i <= at ? "font-semibold" : "text-smoke"}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function OrderDetail({ order, t, l }: { order: Order & { items: OrderItem[] }; t: Dict; l: Locale }) {
  const gov = GOVERNORATES.find((g) => g.id === order.governorate);
  const row = "flex justify-between gap-4 py-1.5";
  return (
    <div className="border border-line bg-bone">
      <div className="grid grid-cols-2 gap-4 border-b border-line p-5 text-sm md:grid-cols-4 md:p-6">
        <div><p className="text-smoke">{t.order.number}</p><p className="mt-1 font-semibold" dir="ltr">{order.number}</p></div>
        <div><p className="text-smoke">{t.order.date}</p><p className="mt-1 font-semibold">{fmtDate(order.createdAt, l)}</p></div>
        <div><p className="text-smoke">{t.order.payment}</p><p className="mt-1 font-semibold">{t.order.pay[order.payment] ?? order.payment}</p></div>
        <div><p className="text-smoke">{t.order.status}</p><p className="mt-1"><StatusBadge status={order.status} t={t} /></p></div>
      </div>
      <div className="border-b border-line p-5 md:p-6"><Timeline status={order.status} t={t} /></div>

      <div className="grid md:grid-cols-[1fr_300px]">
        <div className="p-5 md:p-6">
          <h3 className="mb-3 text-sm font-semibold text-smoke">{t.order.items}</h3>
          <ul className="divide-y divide-line">
            {order.items.map((x) => (
              <li key={x.id} className="flex items-center gap-4 py-3">
                <div className="relative size-14 shrink-0 overflow-hidden bg-onyx"><Image src={x.image} alt="" fill sizes="56px" className="object-cover" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{l === "ar" ? x.nameAr : x.nameEn}</p>
                  <p className="text-xs text-smoke tabular-nums">{money(x.price, l)} <span dir="ltr">{t.order.qty(x.qty)}</span></p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{money(x.price * x.qty, l)}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-line p-5 text-sm max-md:border-t md:border-s md:p-6">
          <h3 className="mb-2 font-semibold text-smoke">{t.order.address}</h3>
          <p className="leading-7">{order.name}<br /><span dir="ltr">{order.phone}</span><br />{[order.address, order.city, gov ? (l === "ar" ? gov.ar : gov.en) : order.governorate].join(l === "ar" ? "، " : ", ")}</p>
          <div className="mt-5 border-t border-line pt-4">
            <p className={row}><span>{t.cartPage.total}</span><span className="tabular-nums">{money(order.subtotal, l)}</span></p>
            {order.discount > 0 && <p className={`${row} text-[#3c6b3f]`}><span>{t.cartPage.discount} <span dir="ltr" className="text-xs">({order.couponCode})</span></span><span className="tabular-nums">−{money(order.discount, l)}</span></p>}
            <p className={row}><span>{t.cartPage.shipping}</span><span className="tabular-nums">{order.shipping === 0 ? t.pdp.free : money(order.shipping, l)}</span></p>
            <p className={`${row} mt-1 border-t border-line pt-3 text-base font-semibold`}><span>{t.cartPage.grand}</span><span className="tabular-nums text-brass-deep">{money(order.total, l)}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
