import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n/dict";
import { href } from "@/lib/format";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { OrderList } from "@/components/account/OrderList";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDict(locale).account.orders, robots: { index: false } } : {};
}

export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const user = await requireUser(locale, `/${locale}/account/orders`);
  const orders = await db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: true } });
  return (
    <section>
      <h2 className="mb-5 font-display text-2xl">{t.account.orders}</h2>
      {orders.length ? <OrderList orders={orders} t={t} l={locale} /> : (
        <div className="border border-dashed border-line p-10 text-center">
          <p className="text-smoke">{t.account.none}</p>
          <Link href={href(locale, "/shop")} className="btn-dark mt-5">{t.account.startShopping}</Link>
        </div>
      )}
    </section>
  );
}
