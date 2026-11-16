import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getDict, isLocale } from "@/i18n/dict";
import { href } from "@/lib/format";
import { currentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth/AuthForm";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ next?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDict(locale).auth.loginTitle, robots: { index: false } } : {};
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (await currentUser()) redirect(href(locale, "/account"));
  const { next } = await searchParams;
  return (
    <div className="px-4 py-12 md:px-8 md:py-16">
      <AuthForm mode="login" next={next} />
    </div>
  );
}
