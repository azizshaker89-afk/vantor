import { notFound, redirect } from "next/navigation";
import { getDict, isLocale } from "@/i18n/dict";
import { href } from "@/lib/format";
import { currentUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { AccountNav } from "@/components/account/AccountNav";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await currentUser();
  if (!user) redirect(`${href(locale, "/login")}?next=${encodeURIComponent(href(locale, "/account"))}`);
  const t = getDict(locale);
  return (
    <>
      <PageHeader title={t.account.hello(user.name.split(" ")[0])} crumbs={[{ label: t.catalog.home, href: href(locale, "/") }, { label: t.account.title }]} />
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 md:px-8 lg:grid-cols-[230px_1fr] lg:py-14">
        <aside className="lg:sticky lg:top-28 lg:h-fit"><AccountNav /></aside>
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
