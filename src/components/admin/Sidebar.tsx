"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, ExternalLink, FolderTree, LogOut, Mail, Menu, Package, Settings, ShoppingCart, TicketPercent, Users, X } from "lucide-react";
import { Mark } from "../ui/Logo";
import { adminLogout } from "@/actions/admin/session";

const NAV = [
  { href: "/admin", label: "نظرة عامة", Icon: BarChart3, exact: true },
  { href: "/admin/orders", label: "الطلبات", Icon: ShoppingCart, badge: "orders" },
  { href: "/admin/products", label: "المنتجات", Icon: Package },
  { href: "/admin/catalog", label: "الأقسام والبراندات", Icon: FolderTree },
  { href: "/admin/coupons", label: "الكوبونات", Icon: TicketPercent },
  { href: "/admin/customers", label: "العملاء", Icon: Users },
  { href: "/admin/messages", label: "الرسائل", Icon: Mail, badge: "messages" },
  { href: "/admin/settings", label: "الإعدادات", Icon: Settings },
] as const;

export function Sidebar({ name, badges }: { name: string; badges: { orders: number; messages: number } }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="لوحة التحكم">
      {NAV.map(({ href, label, Icon, ...x }) => {
        const on = "exact" in x ? path === href : path.startsWith(href);
        const n = "badge" in x ? badges[x.badge] : 0;
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${on ? "bg-bone/10 text-bone" : "text-bone/60 hover:bg-bone/5 hover:text-bone"}`}>
            <Icon className={`size-[18px] ${on ? "text-brass" : ""}`} strokeWidth={1.6} />
            <span className="flex-1">{label}</span>
            {n > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brass px-1.5 text-[0.68rem] font-bold text-onyx">{n}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const foot = (
    <div className="border-t border-bone/10 p-3 text-sm">
      <p className="px-3 pb-2 text-xs text-bone/40">مسجل كـ <span className="text-bone/70">{name}</span></p>
      <a href="/ar" target="_blank" className="flex items-center gap-3 px-3 py-2.5 text-bone/60 hover:text-bone"><ExternalLink className="size-[18px]" strokeWidth={1.6} />فتح المتجر</a>
      <form action={adminLogout}><button className="flex w-full items-center gap-3 px-3 py-2.5 text-bone/60 hover:text-[#e8a191]"><LogOut className="size-[18px]" strokeWidth={1.6} />تسجيل الخروج</button></form>
    </div>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-3 px-6 py-5">
      <Mark className="size-8 text-brass" />
      <span dir="ltr" className="font-[family-name:var(--font-marcellus)] text-lg tracking-[0.3em] text-bone">VANTOR</span>
    </Link>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-onyx print:!hidden lg:flex">{brand}{nav}{foot}</aside>

      {/* Mobile top bar + drawer */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-onyx px-4 py-3 print:hidden lg:hidden">
        <Link href="/admin" className="flex items-center gap-2"><Mark className="size-7 text-brass" /><span dir="ltr" className="tracking-[0.3em] text-bone">VANTOR</span></Link>
        <button onClick={() => setOpen(true)} aria-label="القائمة" className="text-bone"><Menu className="size-6" /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-onyx/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 start-0 flex w-72 flex-col bg-onyx">
            <div className="flex items-center justify-between pe-4">{brand}<button onClick={() => setOpen(false)} aria-label="إغلاق" className="text-bone"><X className="size-5" /></button></div>
            {nav}{foot}
          </aside>
        </div>
      )}
    </>
  );
}
