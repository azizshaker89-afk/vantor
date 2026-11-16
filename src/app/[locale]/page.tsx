import type { Metadata } from "next";
import { getDict, isLocale } from "@/i18n/dict";
import { notFound } from "next/navigation";
import { homeData } from "@/lib/queries";
import { Hero } from "@/components/home/Hero";
import { Collections } from "@/components/home/Collections";
import { Promos } from "@/components/home/Promos";
import { ProductTabs } from "@/components/home/ProductTabs";
import { Favourites } from "@/components/home/Favourites";
import { Features } from "@/components/home/Features";
import { BrandStrip } from "@/components/home/BrandStrip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { abs, jsonLd } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: { canonical: `/${locale}`, languages: { ar: "/ar", en: "/en", "x-default": "/ar" } } };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const data = await homeData(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd([
            { "@context": "https://schema.org", "@type": "OnlineStore", name: "VANTOR", url: abs("/"), logo: abs("/icon.svg"), description: t.meta.description, areaServed: "EG", currenciesAccepted: "EGP", paymentAccepted: "Cash, Credit Card" },
            { "@context": "https://schema.org", "@type": "WebSite", name: "VANTOR", url: abs(`/${locale}`), inLanguage: locale, potentialAction: { "@type": "SearchAction", target: `${abs(`/${locale}/shop`)}?q={search_term_string}`, "query-input": "required name=search_term_string" } },
          ]),
        }}
      />
      <Hero />
      <Collections t={t} l={locale} categories={data.categories} />
      <Promos t={t} l={locale} />
      <section className="mx-auto max-w-[1280px] px-4 pt-20 md:px-8" aria-labelledby="selected">
        <SectionHeading id="selected" title={t.featured.title} body={t.featured.body} />
        <ProductTabs tabs={data.tabs} />
      </section>
      <Favourites t={t} l={locale} products={data.favourites} />
      <Features t={t} />
      <BrandStrip t={t} l={locale} brands={data.brands} />
    </>
  );
}
