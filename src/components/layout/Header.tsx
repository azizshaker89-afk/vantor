"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { Logo } from "../ui/Logo";
import { Drawer } from "../ui/Drawer";
import { SearchSuggest } from "./SearchSuggest";
import { useCart, cartCount, cartTotal } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useUI } from "@/store/ui";
import { useHydrated } from "../ui/useHydrated";
import { href, money } from "@/lib/format";

type NavCat = { slug: string; name: string };

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -top-1.5 -end-2 grid min-w-4 h-4 place-items-center rounded-full bg-brass px-1 text-[0.65rem] font-bold leading-none text-onyx">
      {n}
    </span>
  );
}

export function Header({ categories }: { categories: NavCat[] }) {
  const { l, t } = useI18n();
  const path = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const count = useCart(cartCount);
  const total = useCart(cartTotal);
  const setCartOpen = useCart((s) => s.setOpen);
  const wish = useWishlist((s) => s.ids.length);
  const { panel, setPanel } = useUI();
  const [compact, setCompact] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const on = () => setCompact(window.scrollY > 120);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setPanel(null), [path, setPanel]);

  const other = l === "ar" ? "en" : "ar";
  const switchHref = path.replace(/^\/(ar|en)/, `/${other}`);
  const links = [
    { href: href(l, "/"), label: t.nav.home },
    ...categories.map((c) => ({ href: href(l, `/c/${c.slug}`), label: c.name })),
    { href: href(l, "/about"), label: t.nav.about, wide: true },
    { href: href(l, "/contact"), label: t.nav.contact, wide: true },
  ];
  const isActive = (h: string) => (h === `/${l}` ? path === h : path.startsWith(h));

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-line/70 bg-stone/95 backdrop-blur transition-[box-shadow] duration-300 ${compact ? "shadow-[0_6px_24px_-12px_rgba(0,0,0,0.25)]" : ""}`}
      >
        <div
          className={`mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 transition-[height] duration-300 md:px-8 ${compact ? "h-16" : "h-[var(--header-h)]"}`}
        >
          {/* Start: nav (desktop) / menu button (mobile) */}
          <div className="flex items-center">
            <button className="flex items-center gap-2 text-sm lg:hidden" onClick={() => setPanel("menu")} aria-label={t.header.menu}>
              <Menu className="size-6" strokeWidth={1.4} />
              <span className="max-sm:hidden">{t.header.menu}</span>
            </button>
            <nav className="max-lg:hidden" aria-label="Main">
              <ul className="flex items-center gap-5 whitespace-nowrap text-[0.92rem] xl:gap-7 xl:text-[0.95rem]">
                {links.map((x) => (
                  <li key={x.href} className={"wide" in x && x.wide ? "max-xl:hidden" : undefined}>
                    <Link
                      href={x.href}
                      className={`relative py-2 transition-colors hover:text-brass-deep ${isActive(x.href) ? "text-brass-deep after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-brass" : ""}`}
                    >
                      {x.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <Link href={href(l, "/")} aria-label="VANTOR" className="justify-self-center">
            <Logo compact={compact} />
          </Link>

          {/* End: actions */}
          <div className="flex items-center justify-end gap-4 md:gap-5">
            <button onClick={() => setPanel("search")} aria-label={t.header.search} className="max-lg:hidden hover:text-brass-deep">
              <Search className="size-5" strokeWidth={1.5} />
            </button>
            <Link href={href(l, "/account")} aria-label={t.header.account} className="max-lg:hidden hover:text-brass-deep">
              <User className="size-5" strokeWidth={1.5} />
            </Link>
            <Link href={href(l, "/wishlist")} aria-label={t.header.wishlist} className="relative max-lg:hidden hover:text-brass-deep">
              <Heart className="size-5" strokeWidth={1.5} />
              {hydrated && <Badge n={wish} />}
            </Link>
            <button onClick={() => setCartOpen(true)} className="flex items-center gap-2.5 hover:text-brass-deep" aria-label={t.header.cart}>
              <span className="relative">
                <ShoppingBag className="size-5" strokeWidth={1.5} />
                {hydrated && <Badge n={count} />}
              </span>
              <span className="text-sm font-semibold tabular-nums max-md:hidden">{money(hydrated ? total : 0, l)}</span>
            </button>
            <Link
              href={switchHref}
              hrefLang={other}
              className="flex items-center gap-1.5 rounded-full border border-brass/60 px-3 py-1 text-sm transition-colors hover:bg-brass hover:text-onyx"
            >
              <Globe className="size-3.5" strokeWidth={1.5} />
              <span className="max-sm:hidden">{t.header.switchLang}</span>
              <span className="sm:hidden">{t.header.switchLangShort}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <Drawer open={panel === "menu"} onClose={() => setPanel(null)} title={t.header.menu} side="start">
        <form
          className="border-b border-line p-5"
          onSubmit={(e) => { e.preventDefault(); router.push(`${href(l, "/shop")}?q=${encodeURIComponent(q)}`); }}
        >
          <label className="flex items-center gap-2 border border-line bg-stone px-3 py-2.5">
            <Search className="size-4 text-smoke" strokeWidth={1.5} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.header.searchPlaceholder} className="w-full bg-transparent text-sm outline-none" />
          </label>
        </form>
        <ul className="py-2">
          {[...links, { href: href(l, "/account"), label: t.header.account }].map((x) => (
            <li key={x.href}>
              <Link href={x.href} className={`block border-b border-line/60 px-6 py-4 font-display text-xl ${isActive(x.href) ? "text-brass-deep" : ""}`}>
                {x.label}
              </Link>
            </li>
          ))}
        </ul>
      </Drawer>

      {/* Search overlay */}
      <div className={`fixed inset-x-0 top-0 z-[70] bg-stone shadow-xl transition-transform duration-500 ease-[var(--ease-dial)] ${panel === "search" ? "translate-y-0" : "-translate-y-full"}`} aria-hidden={panel !== "search"}>
        <form
          className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-10"
          onSubmit={(e) => { e.preventDefault(); router.push(`${href(l, "/shop")}?q=${encodeURIComponent(q)}`); }}
        >
          <Search className="size-6 text-brass" strokeWidth={1.4} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.header.searchPlaceholder}
            className="w-full border-b border-line bg-transparent py-3 font-display text-2xl outline-none focus:border-brass focus-visible:outline-none"
            tabIndex={panel === "search" ? 0 : -1}
            ref={(el) => { if (el && panel === "search") el.focus(); }}
          />
          <button type="button" onClick={() => setPanel(null)} aria-label={t.header.close} tabIndex={panel === "search" ? 0 : -1}>
            <X className="size-6" strokeWidth={1.4} />
          </button>
        </form>
        {panel === "search" && <SearchSuggest q={q} onPick={() => setPanel(null)} />}
      </div>
      {panel === "search" && <div className="fixed inset-0 z-[65] bg-onyx/40" onClick={() => setPanel(null)} />}
    </>
  );
}
