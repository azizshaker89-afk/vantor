import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { getDict, isLocale } from "@/i18n/dict";
import { href } from "@/lib/format";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { OrderDetail } from "@/components/order/OrderDetail";
import { FormError } from "@/components/ui/Field";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ n?: string; p?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDict(locale).track.title } : {};
}

// Plain GET form: works without JavaScript. Needs number AND phone so numbers alone can't be enumerated.
export default async function TrackPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const sp = await searchParams;
  const raw = (sp.n ?? "").trim().toUpperCase();
  const number = raw && !raw.startsWith("VN-") ? `VN-${raw.replace(/\D/g, "")}` : raw;
  const phone = (sp.p ?? "").replace(/\D/g, "");
  const order = number && phone ? await db.order.findFirst({ where: { number, phone }, include: { items: true } }) : null;
  const input = "w-full border border-line bg-bone px-4 py-3 outline-none focus:border-brass";

  return (
    <>
      <PageHeader title={t.track.title} body={t.track.body} crumbs={[{ label: t.catalog.home, href: href(locale, "/") }, { label: t.track.title }]} />
      <div className="mx-auto max-w-[1000px] px-4 py-10 md:px-8 md:py-14">
        <form className="mx-auto grid max-w-2xl gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="text-sm font-semibold">{t.track.number}
            <input name="n" defaultValue={sp.n} placeholder={t.track.numberPh} dir="ltr" required className={`${input} mt-1.5 font-normal uppercase`} />
          </label>
          <label className="text-sm font-semibold">{t.track.phone}
            <input name="p" defaultValue={sp.p} placeholder="01xxxxxxxxx" inputMode="tel" dir="ltr" required className={`${input} mt-1.5 font-normal`} />
          </label>
          <button className="btn-dark !py-3.5"><Search className="size-4" />{t.track.submit}</button>
        </form>
        <div className="mt-10">
          {order ? <OrderDetail order={order} t={t} l={locale} /> : number && phone && <div className="mx-auto max-w-2xl"><FormError>{t.track.notFound}</FormError></div>}
        </div>
      </div>
    </>
  );
}
