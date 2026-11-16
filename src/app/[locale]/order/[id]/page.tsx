import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n/dict";
import { href } from "@/lib/format";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { OrderDetail } from "@/components/order/OrderDetail";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ placed?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDict(locale).order.track, robots: { index: false } } : {};
}

// The id is an unguessable cuid shared only with the buyer (confirmation redirect).
export default async function OrderPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const placed = (await searchParams).placed === "1";
  const user = await currentUser();

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12 md:px-8 md:py-16">
      {placed && (
        <div className="mb-10 flex flex-col items-center text-center">
          <svg viewBox="0 0 80 80" className="size-20 text-brass" aria-hidden>
            <path d="M27 2h26l25 25v26L53 78H27L2 53V27z" fill="none" stroke="currentColor" strokeWidth="1.5" pathLength={1} className="stroke-draw" />
            <path d="M25 41l10 10 20-22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="stroke-draw [animation-delay:0.6s]" />
          </svg>
          <h1 className="hero-rise mt-6 font-display text-3xl md:text-4xl">{t.order.thanks}</h1>
          <p className="hero-rise mt-3 max-w-md text-smoke" style={{ animationDelay: "0.15s" }}>{t.order.body(order.number)}</p>
        </div>
      )}
      {!placed && <h1 className="mb-8 font-display text-3xl">{t.order.number} <span dir="ltr">{order.number}</span></h1>}
      <OrderDetail order={order} t={t} l={locale} />
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={href(locale, "/shop")} className="btn-dark">{t.order.keepShopping}</Link>
        {user && <Link href={href(locale, "/account/orders")} className="btn-line">{t.order.viewOrders}</Link>}
      </div>
    </div>
  );
}
