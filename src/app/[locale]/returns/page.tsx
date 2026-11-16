import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale, locales } from "@/i18n/dict";
import { pages } from "@/i18n/pages";
import { href } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { InfoArticle } from "@/components/content/InfoArticle";

type Props = { params: Promise<{ locale: string }> };
export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const p = pages[locale].returns;
  return { title: p.title, description: p.body, alternates: { languages: { ar: "/ar/returns", en: "/en/returns" } } };
}

export default async function ReturnsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const p = pages[locale].returns;
  return (
    <>
      <PageHeader title={p.title} body={p.body} crumbs={[{ label: t.catalog.home, href: href(locale, "/") }, { label: p.title }]} />
      <InfoArticle page={p} />
    </>
  );
}
