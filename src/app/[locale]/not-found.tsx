"use client";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import { href } from "@/lib/format";

export default function NotFound() {
  const { l, t } = useI18n();
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <svg viewBox="0 0 120 120" className="size-32 text-brass" aria-hidden>
        <path d="M41 4h38l37 37v38l-37 37H41L4 79V41z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="60" y1="18" x2="60" y2={i % 3 ? "23" : "28"} stroke="currentColor" strokeWidth="1.2" transform={`rotate(${i * 30} 60 60)`} />
        ))}
        <line x1="60" y1="60" x2="60" y2="34" stroke="currentColor" strokeWidth="2" transform="rotate(-50 60 60)" />
        <line x1="60" y1="60" x2="60" y2="40" stroke="currentColor" strokeWidth="2.5" transform="rotate(120 60 60)" />
        <circle cx="60" cy="60" r="2.5" fill="currentColor" />
      </svg>
      <p className="mt-8 font-display text-6xl text-brass-deep" dir="ltr">404</p>
      <h1 className="mt-4 font-display text-3xl">{t.notFound.title}</h1>
      <p className="mt-3 text-smoke">{t.notFound.body}</p>
      <Link href={href(l, "/shop")} className="btn-dark mt-10">{t.notFound.cta}</Link>
    </section>
  );
}
