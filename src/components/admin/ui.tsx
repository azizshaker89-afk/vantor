import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PageTitle({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[1.7rem] leading-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-smoke">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, action, children, className = "", pad = true }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`min-w-0 border border-line bg-bone ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-[0.95rem] font-semibold">{title}</h2>
          {action}
        </header>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

/** Data table shell: horizontal scroll on small screens, sticky header. */
export function Table({ head, children, empty }: { head: React.ReactNode[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto border border-line bg-bone">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-line bg-stone/60 text-start text-xs text-smoke">
          <tr>{head.map((h, i) => <th key={i} scope="col" className="px-4 py-3 text-start font-semibold whitespace-nowrap">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="p-10 text-center text-smoke">مفيش نتايج.</p>}
    </div>
  );
}

export const td = "px-4 py-3 align-middle";

export function Pager({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  const btn = "grid size-9 place-items-center border border-line bg-bone text-sm hover:border-brass";
  return (
    <nav className="mt-5 flex items-center justify-center gap-1.5" aria-label="الصفحات">
      {page > 1 && <Link href={href(page - 1)} className={btn} aria-label="السابق"><ChevronRight className="size-4" /></Link>}
      <span className="px-3 text-sm tabular-nums text-smoke">{page} / {pages}</span>
      {page < pages && <Link href={href(page + 1)} className={btn} aria-label="التالي"><ChevronLeft className="size-4" /></Link>}
    </nav>
  );
}

export const inputCls = "w-full border border-line bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass";
