import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getDict, isLocale } from "@/i18n/dict";
import { href } from "@/lib/format";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { OrderDetail } from "@/components/order/OrderDetail";

type Props = { params: Promise<{ locale: string; number: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, number } = await params;
  return isLocale(locale) ? { title: `${getDict(locale).order.number} ${decodeURIComponent(number)}`, robots: { index: false } } : {};
}

export default async function AccountOrderPage({ params }: Props) {
  const { locale, number } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const user = await requireUser(locale, `/${locale}/account/orders/${number}`);
  // Scoped to the signed-in user: another customer's number returns 404.
  const order = await db.order.findFirst({ where: { number: decodeURIComponent(number), userId: user.id }, include: { items: true } });
  if (!order) notFound();
  const Back = locale === "ar" ? ArrowRight : ArrowLeft;
  return (
    <section>
      <Link href={href(locale, "/account/orders")} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-smoke hover:text-ink"><Back className="size-4" />{t.account.back}</Link>
      <OrderDetail order={order} t={t} l={locale} />
    </section>
  );
}
