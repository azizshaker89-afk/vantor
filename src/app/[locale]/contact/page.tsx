import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Phone, Plus } from "lucide-react";
import { getDict, isLocale, locales } from "@/i18n/dict";
import { href } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/content/ContactForm";
import { getSettings, prettyPhone } from "@/lib/settings";

type Props = { params: Promise<{ locale: string }> };
export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDict(locale);
  return { title: t.contactPage.title, description: t.contactPage.body, alternates: { languages: { ar: "/ar/contact", en: "/en/contact" } } };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const s = await getSettings();
  const info = [
    { Icon: Phone, k: t.footer.phone, v: <a href={`https://wa.me/${s.whatsapp}`} dir="ltr" className="hover:text-brass-deep">{prettyPhone(s.phone)}</a> },
    { Icon: Mail, k: t.footer.email, v: <a href={`mailto:${s.email}`} className="hover:text-brass-deep">{s.email}</a> },
    { Icon: MapPin, k: t.footer.address, v: t.footer.addressValue },
    { Icon: Clock, k: t.footer.hours, v: t.footer.hoursValue },
  ];
  return (
    <>
      <PageHeader title={t.contactPage.title} body={t.contactPage.body} crumbs={[{ label: t.catalog.home, href: href(locale, "/") }, { label: t.contactPage.title }]} />
      <section className="mx-auto grid max-w-[1100px] gap-8 px-4 py-12 md:px-8 md:py-16 lg:grid-cols-[320px_1fr]">
        <ul className="h-fit divide-y divide-bone/10 bg-onyx p-2 text-bone">
          {info.map(({ Icon, k, v }) => (
            <li key={k} className="flex gap-4 p-5">
              <Icon className="mt-0.5 size-5 shrink-0 text-brass" strokeWidth={1.4} />
              <div><p className="text-xs text-bone/60">{k}</p><div className="mt-1 text-sm">{v}</div></div>
            </li>
          ))}
        </ul>
        <ContactForm />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 md:px-8">
        <SectionHeading title={t.contactPage.faq} />
        <div className="divide-y divide-line border-y border-line">
          {t.contactPage.faqs.map(([q, a]) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <Plus className="size-4 shrink-0 text-brass transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="pb-5 leading-8 text-smoke">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
