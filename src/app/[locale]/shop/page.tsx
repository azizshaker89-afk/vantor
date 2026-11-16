import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n/dict";
import { parseQuery, runCatalog } from "@/lib/catalog";
import { categoriesWithCounts } from "@/lib/queries";
import { href } from "@/lib/format";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { CatalogView } from "@/components/catalog/CatalogView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDict(locale);
  const q = (await searchParams).q;
  return {
    title: typeof q === "string" && q ? t.catalog.searchTitle(q) : t.catalog.allTitle,
    description: t.catalog.allBody,
    alternates: { canonical: `/${locale}/shop`, languages: { ar: "/ar/shop", en: "/en/shop" } },
    ...(typeof q === "string" && q ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const query = parseQuery(await searchParams);
  const [data, cats] = await Promise.all([runCatalog(query, locale), categoriesWithCounts(locale)]);
  const title = query.q ? t.catalog.searchTitle(query.q) : t.catalog.allTitle;

  return (
    <>
      <CatalogHeader
        title={title}
        body={t.catalog.allBody}
        image="/img/editorial/hero-watch.webp"
        crumbs={[{ label: t.catalog.home, href: href(locale, "/") }, { label: t.catalog.shop }]}
        cats={cats}
        active={null}
        allLabel={t.catalog.all}
        allHref={href(locale, "/shop")}
        catHref={(s) => href(locale, `/c/${s}`)}
      />
      <CatalogView data={data} query={query} basePath={href(locale, "/shop")} categoryFacet />
    </>
  );
}
