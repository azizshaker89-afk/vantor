import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dict";
import { href } from "@/lib/format";
import { Logo } from "../ui/Logo";
import { prettyPhone, type StoreSettings } from "@/lib/settings";

export function Footer({ t, l, categories, s }: { t: Dict; l: Locale; categories: { slug: string; name: string }[]; s: StoreSettings }) {
  const care = ["/account", "/cart", "/wishlist", "/track"];
  const pages = ["/about", "/contact", "/shipping", "/returns", "/privacy"];
  const col = "font-display text-lg text-brass mb-5";
  const link = "text-bone/70 hover:text-brass transition-colors";

  return (
    <footer className="mt-24">
      {/* Octagon divider, echoing the reference's ornament */}
      <div className="mx-auto mb-14 flex max-w-[1440px] items-center gap-4 px-8 text-brass" aria-hidden>
        <span className="h-px flex-1 bg-gradient-to-l from-brass/60 to-transparent rtl:bg-gradient-to-r" />
        <svg viewBox="0 0 10 10" className="size-3"><path d="M3 0h4l3 3v4l-3 3H3L0 7V3z" fill="none" stroke="currentColor" /></svg>
        <span className="h-px flex-1 bg-gradient-to-r from-brass/60 to-transparent rtl:bg-gradient-to-l" />
      </div>

      <div className="bg-onyx text-bone">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-16 md:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div className="max-lg:text-center">
            <Link href={href(l, "/")} className="inline-block [&_span.text-ink]:text-bone" aria-label="VANTOR">
              <Logo />
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-7 text-bone/70 max-lg:mx-auto">{t.footer.about}</p>
            <div className="mt-6 flex gap-3 max-lg:justify-center">
              {[{ I: Facebook, n: "Facebook" }, { I: Instagram, n: "Instagram" }].map(({ I, n }) => (
                <a key={n} href="#" aria-label={n} className="grid size-10 place-items-center rounded-full border border-brass/50 text-bone/80 hover:bg-brass hover:text-onyx">
                  <I className="size-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className={col}>{t.footer.shop}</h3>
            <ul className="space-y-3 text-sm">
              {categories.map((c) => (
                <li key={c.slug}><Link className={link} href={href(l, `/c/${c.slug}`)}>{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={col}>{t.footer.care}</h3>
            <ul className="space-y-3 text-sm">
              {t.footer.careLinks.map((x, i) => (
                <li key={x}><Link className={link} href={href(l, care[i])}>{x}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={col}>{t.footer.pages}</h3>
            <ul className="space-y-3 text-sm">
              {t.footer.pageLinks.map((x, i) => (
                <li key={x}><Link className={link} href={href(l, pages[i])}>{x}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={col}>{t.footer.contact}</h3>
            <dl className="space-y-4 text-sm">
              <div><dt className="font-semibold">{t.footer.phone}</dt><dd><a className={link} dir="ltr" href={`tel:${s.phone}`}>{prettyPhone(s.phone)}</a></dd></div>
              <div><dt className="font-semibold">{t.footer.email}</dt><dd><a className={link} href={`mailto:${s.email}`}>{s.email}</a></dd></div>
              <div><dt className="font-semibold">{t.footer.address}</dt><dd className="text-bone/70">{t.footer.addressValue}</dd></div>
              <div><dt className="font-semibold">{t.footer.hours}</dt><dd className="text-bone/70">{t.footer.hoursValue}</dd></div>
            </dl>
          </div>
        </div>
        <div className="bg-brass text-onyx">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-6 py-4 text-sm max-md:justify-center max-md:text-center md:px-8 max-lg:pb-20">
            <p>© {new Date().getFullYear()} <b>VANTOR</b>. {t.footer.rights}</p>
            <p>{t.footer.bottom}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
