"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LogOut, Package, Heart } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { href } from "@/lib/format";
import { logout } from "@/actions/auth";

export function AccountNav() {
  const { l, t } = useI18n();
  const path = usePathname();
  const items = [
    { to: "/account", label: t.account.title, Icon: LayoutGrid, exact: true },
    { to: "/account/orders", label: t.account.orders, Icon: Package },
    { to: "/wishlist", label: t.wishlist.title, Icon: Heart },
  ];
  const base = "flex shrink-0 items-center gap-3 px-4 py-3 text-sm transition-colors";
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto border border-line bg-bone p-2 lg:flex-col" aria-label={t.account.title}>
      {items.map(({ to, label, Icon, exact }) => {
        const full = href(l, to);
        const on = exact ? path === full : path.startsWith(full);
        return (
          <Link key={to} href={full} aria-current={on ? "page" : undefined} className={`${base} ${on ? "bg-onyx text-bone" : "hover:bg-stone"}`}>
            <Icon className={`size-4 ${on ? "text-brass" : "text-smoke"}`} strokeWidth={1.6} />{label}
          </Link>
        );
      })}
      <form action={logout.bind(null, l)} className="lg:mt-2 lg:border-t lg:border-line lg:pt-2">
        <button className={`${base} w-full text-smoke hover:text-sale`}><LogOut className="size-4" strokeWidth={1.6} />{t.account.logout}</button>
      </form>
    </nav>
  );
}
