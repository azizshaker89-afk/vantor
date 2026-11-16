import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n/dict";
import { href } from "@/lib/format";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDict(locale).checkout.title, robots: { index: false } } : {};
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const user = await currentUser();
  // Signed-in customers get their details and last delivery address pre-filled.
  const last = user ? await db.order.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }) : null;

  return (
    <>
      <PageHeader title={t.checkout.title} crumbs={[{ label: t.catalog.home, href: href(locale, "/") }, { label: t.cartPage.title, href: href(locale, "/cart") }, { label: t.checkout.title }]} />
      <CheckoutForm
        d={{
          name: user?.name ?? "", phone: user?.phone ?? "", email: user?.email ?? "",
          governorate: last?.governorate ?? "", city: last?.city ?? "", address: last?.address ?? "", signedIn: !!user,
        }}
      />
    </>
  );
}
