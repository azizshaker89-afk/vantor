import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gem, Receipt, Wrench } from "lucide-react";
import { getDict, isLocale, locales } from "@/i18n/dict";
import { pages } from "@/i18n/pages";
import { href } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Props = { params: Promise<{ locale: string }> };
export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const p = pages[locale].about;
  return { title: p.title, description: p.body, alternates: { languages: { ar: "/ar/about", en: "/en/about" } } };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const p = pages[locale].about;
  const icons = [Gem, Receipt, Wrench];
  return (
    <>
      <PageHeader title={p.title} crumbs={[{ label: t.catalog.home, href: href(locale, "/") }, { label: p.title }]} />

      <section className="mx-auto grid max-w-[1100px] items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-8 md:py-20">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden bg-onyx">
          <Image src="/img/editorial/story-wrist.webp" alt="" fill sizes="(min-width:768px) 384px, 100vw" className="object-cover" />
        </div>
        <div>
          <p className="font-display text-2xl leading-relaxed md:text-[1.7rem]">{p.body}</p>
          <span className="my-6 block h-px w-16 bg-brass" />
          {p.story.map((s) => <p key={s} className="mt-4 leading-8 text-ink/80">{s}</p>)}
        </div>
      </section>

      <section className="bg-onyx text-bone">
        <dl className="mx-auto grid max-w-[1100px] grid-cols-2 gap-px bg-bone/10 md:grid-cols-4">
          {p.numbers.map(([n, label]) => (
            <div key={label} className="bg-onyx py-10 text-center">
              <dt className="sr-only">{label}</dt>
              <dd className="font-display text-4xl text-brass-soft" dir="ltr">{n}</dd>
              <dd className="mt-2 text-sm text-bone/70">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-16 md:px-8 md:py-20">
        <SectionHeading title={p.valuesTitle} />
        <div className="grid gap-6 md:grid-cols-3">
          {p.values.map(([h, b], i) => {
            const Icon = icons[i];
            return (
              <div key={h} className="border border-line bg-bone p-7">
                <Icon className="size-7 text-brass" strokeWidth={1.3} />
                <h3 className="mt-5 font-display text-xl">{h}</h3>
                <p className="mt-2 text-sm leading-7 text-smoke">{b}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center"><Link href={href(locale, "/shop")} className="btn-dark">{p.cta}</Link></div>
      </section>
    </>
  );
}
