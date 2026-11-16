import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n/dict";
import { href } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { WishlistView } from "@/components/wishlist/WishlistView";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDict(locale).wishlist.title, robots: { index: false } } : {};
}

export default async function WishlistPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  return (
    <>
      <PageHeader title={t.wishlist.title} body={t.wishlist.body} crumbs={[{ label: t.catalog.home, href: href(locale, "/") }, { label: t.wishlist.title }]} />
      <WishlistView />
    </>
  );
}
