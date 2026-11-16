import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n/dict";
import { href, money } from "@/lib/format";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { OrderList } from "@/components/account/OrderList";
import { ProfileForms } from "@/components/account/ProfileForms";
import { fmtDate } from "@/components/order/OrderDetail";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDict(locale).account.title, robots: { index: false } } : {};
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const user = await requireUser(locale);
  const orders = await db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: true } });
  const live = orders.filter((o) => o.status !== "CANCELLED");
  const stats = [
    [t.account.ordersCount, String(orders.length)],
    [t.account.spent, money(live.reduce((a, o) => a + o.total, 0), locale)],
    [t.account.active, String(orders.filter((o) => ["PENDING", "CONFIRMED", "SHIPPED"].includes(o.status)).length)],
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="mb-4 text-sm text-smoke">{t.account.since(fmtDate(user.createdAt, locale))}</p>
        <div className="grid grid-cols-3 border border-line bg-bone">
          {stats.map(([k, v], i) => (
            <div key={k} className={`p-5 md:p-6 ${i ? "border-s border-line" : ""}`}>
              <p className="text-xs text-smoke md:text-sm">{k}</p>
              <p className="mt-2 font-display text-xl tabular-nums md:text-2xl">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">{t.account.recent}</h2>
          {orders.length > 3 && <Link href={href(locale, "/account/orders")} className="text-sm font-semibold text-brass-deep hover:text-ink">{t.account.allOrders}</Link>}
        </div>
        {orders.length ? <OrderList orders={orders.slice(0, 3)} t={t} l={locale} /> : (
          <div className="border border-dashed border-line p-10 text-center">
            <p className="text-smoke">{t.account.none}</p>
            <Link href={href(locale, "/shop")} className="btn-dark mt-5">{t.account.startShopping}</Link>
          </div>
        )}
      </section>

      <ProfileForms name={user.name} phone={user.phone ?? ""} email={user.email} />
    </div>
  );
}
