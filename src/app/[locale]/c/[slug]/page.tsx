import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n/dict";
import { getCategory, parseQuery, runCatalog } from "@/lib/catalog";
import { categoriesWithCounts } from "@/lib/queries";
import { href } from "@/lib/format";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { CatalogView } from "@/components/catalog/CatalogView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const c = await getCategory(slug, locale);
  if (!c) return {};
  return {
    title: c.name,
    description: c.desc,
    openGraph: { images: [c.image] },
    alternates: { canonical: `/${locale}/c/${slug}`, languages: { ar: `/ar/c/${slug}`, en: `/en/c/${slug}` } },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const category = await getCategory(slug, locale);
  if (!category) notFound();
  const t = getDict(locale);
  const query = parseQuery(await searchParams, slug);
  const [data, cats] = await Promise.all([runCatalog(query, locale), categoriesWithCounts(locale)]);

  return (
    <>
      <CatalogHeader
        title={category.name}
        body={category.desc}
        image={category.image}
        crumbs={[
          { label: t.catalog.home, href: href(locale, "/") },
          { label: t.catalog.shop, href: href(locale, "/shop") },
          { label: category.name },
        ]}
        cats={cats}
        active={slug}
        allLabel={t.catalog.all}
        allHref={href(locale, "/shop")}
        catHref={(s) => href(locale, `/c/${s}`)}
      />
      <CatalogView data={data} query={query} basePath={href(locale, `/c/${slug}`)} categoryFacet={false} />
    </>
  );
}
