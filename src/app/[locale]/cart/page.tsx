import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n/dict";
import { href } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { CartView } from "@/components/cart/CartView";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDict(locale).cartPage.title, robots: { index: false } } : {};
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  return (
    <>
      <PageHeader title={t.cartPage.title} crumbs={[{ label: t.catalog.home, href: href(locale, "/") }, { label: t.cartPage.title }]} />
      <CartView />
    </>
  );
}
