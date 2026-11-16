import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { abs, jsonLd } from "@/lib/seo";
import { getDict, isLocale, locales } from "@/i18n/dict";
import { allProductSlugs, getProduct } from "@/lib/catalog";
import { href, pct } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Gallery } from "@/components/pdp/Gallery";
import { BuyBox } from "@/components/pdp/BuyBox";
import { DetailTabs } from "@/components/pdp/DetailTabs";
import { RecentlyViewed } from "@/components/pdp/RecentlyViewed";
import { ProductCard } from "@/components/product/ProductCard";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const revalidate = 60;
export async function generateStaticParams() {
  const rows = await allProductSlugs();
  return locales.flatMap((locale) => rows.map((r) => ({ locale, slug: r.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const p = await getProduct(slug, locale);
  if (!p) return {};
  return {
    title: p.card.name,
    description: p.card.desc,
    openGraph: { title: p.card.name, description: p.card.desc, images: [{ url: p.card.image, width: 900, height: 900, alt: p.card.name }], type: "website", locale: locale === "ar" ? "ar_EG" : "en_US" },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: `/${locale}/p/${slug}`, languages: { ar: `/ar/p/${slug}`, en: `/en/p/${slug}` } },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const p = await getProduct(slug, locale);
  if (!p) notFound();
  const t = getDict(locale);
  const { card } = p;
  const off = pct(card.price, card.compareAt);

  const url = abs(href(locale, `/p/${card.slug}`));
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: card.name,
      description: card.desc,
      image: p.gallery.map(abs),
      sku: p.sku,
      url,
      brand: { "@type": "Brand", name: card.brand },
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "EGP",
        price: card.price,
        itemCondition: "https://schema.org/NewCondition",
        availability: card.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: t.catalog.home, item: abs(href(locale, "/")) },
        { name: card.category, item: abs(href(locale, `/c/${p.categorySlug}`)) },
        { name: card.name, item: url },
      ].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <div className="mx-auto max-w-[1440px] px-4 pt-6 md:px-8 md:pt-8">
        <Breadcrumbs
          className="mb-6 md:mb-8"
          items={[
            { label: t.catalog.home, href: href(locale, "/") },
            { label: card.category, href: href(locale, `/c/${p.categorySlug}`) },
            { label: card.name },
          ]}
        />
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 xl:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Gallery
              images={p.gallery}
              name={card.name}
              badge={
                <>
                  {off > 0 && (
                    <span className="absolute top-4 start-4 grid size-14 place-items-center rounded-full bg-onyx font-bold text-bone ring-1 ring-bone/15" dir="ltr">-{off}%</span>
                  )}
                  {card.isNew && !off && (
                    <span className="absolute top-4 start-4 bg-brass px-3 py-1 text-xs font-bold text-onyx">{locale === "ar" ? "جديد" : "New"}</span>
                  )}
                </>
              }
            />
          </div>
          <BuyBox p={card} sku={p.sku} brandSlug={p.brandSlug} categorySlug={p.categorySlug} />
        </div>
      </div>

      <div className="mt-20 border-t border-line pt-14 md:mt-24">
        <DetailTabs desc={card.desc} specs={p.specs} tagline={p.brandTagline} />
      </div>

      {p.related.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 pt-16 md:px-8" aria-labelledby="related">
          <SectionHeading id="related" title={t.pdp.related} body={t.pdp.relatedBody} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {p.related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}

      <RecentlyViewed
        current={{ id: card.id, slug: card.slug, image: card.image, price: card.price, compareAt: card.compareAt, brand: card.brand, nameAr: p.nameAr, nameEn: p.nameEn }}
      />
      <div className="pb-24" />
    </>
  );
}
