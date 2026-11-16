import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVars } from "../fonts";
import { getDict, isLocale, locales } from "@/i18n/dict";
import { I18nProvider } from "@/components/I18nProvider";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MobileBar } from "@/components/layout/MobileBar";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { QuickView } from "@/components/product/QuickView";
import { navCategories } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/seo";

export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDict(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: "%s | VANTOR" },
    description: t.meta.description,
    icons: { icon: "/icon.svg" },
    alternates: { languages: { ar: "/ar", en: "/en", "x-default": "/ar" } },
    openGraph: {
      siteName: "VANTOR", type: "website", locale: locale === "ar" ? "ar_EG" : "en_US",
      title: t.meta.title, description: t.meta.description,
      images: [{ url: "/img/editorial/story-wrist.webp", alt: "VANTOR" }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = { themeColor: "#efebe5" };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const [categories, s] = await Promise.all([navCategories(locale), getSettings()]);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={fontVars}>
      <body className="min-h-dvh">
        <I18nProvider locale={locale}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[100] focus:bg-bone focus:px-4 focus:py-2">
            {locale === "ar" ? "انتقل للمحتوى" : "Skip to content"}
          </a>
          <TopBar t={t} />
          <Header categories={categories} />
          <main id="main">{children}</main>
          <Footer t={t} l={locale} categories={categories} s={s} />
          <CartDrawer />
          <QuickView />
          <MobileBar />
          <FloatingActions whatsapp={s.whatsapp} />
        </I18nProvider>
      </body>
    </html>
  );
}
