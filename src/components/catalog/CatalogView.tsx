"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { ProductCard } from "../product/ProductCard";
import { Drawer } from "../ui/Drawer";
import { useUI } from "@/store/ui";
import { money } from "@/lib/format";
import type { CatalogQuery, CatalogResult, Sort } from "@/lib/catalog";

const SORT_KEYS: Sort[] = ["popular", "newest", "price-asc", "price-desc"];
const PER = [12, 24, 36];
type Patch = Record<string, string | null>;

export function CatalogView({ data, query, basePath, categoryFacet }: {
  data: CatalogResult; query: CatalogQuery; basePath: string; categoryFacet: boolean;
}) {
  const { l, t } = useI18n();
  const c = t.catalog;
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const { panel, setPanel } = useUI();
  const [cols, setCols] = useState<3 | 4>(4);

  useEffect(() => {
    try { if (localStorage.getItem("vantor-cols") === "3") setCols(3); } catch {}
  }, []);
  const pickCols = (n: 3 | 4) => {
    setCols(n);
    try { localStorage.setItem("vantor-cols", String(n)); } catch {}
  };

  const url = (patch: Patch) => {
    const next = new URLSearchParams(sp.toString());
    if (!("page" in patch)) next.delete("page");
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const go = (patch: Patch) => start(() => router.push(url(patch), { scroll: false }));
  const toggleIn = (key: "brand" | "cat", arr: string[], v: string) => {
    const set = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
    go({ [key]: set.join(",") || null });
  };

  const { items, total, page, pages, facets } = data;
  const from = total ? (page - 1) * query.per + 1 : 0;
  const to = Math.min(page * query.per, total);

  // Active filter chips (each removes itself)
  const chips: { label: string; patch: Patch }[] = [
    ...query.cats.map((s) => ({ label: facets.categories.find((x) => x.slug === s)?.name ?? s, patch: { cat: query.cats.filter((x) => x !== s).join(",") || null } })),
    ...query.brands.map((s) => ({ label: facets.brands.find((x) => x.slug === s)?.name ?? s, patch: { brand: query.brands.filter((x) => x !== s).join(",") || null } })),
    ...(query.min != null || query.max != null
      ? [{ label: `${money(query.min ?? facets.bounds.min, l)} – ${money(query.max ?? facets.bounds.max, l)}`, patch: { min: null, max: null } }]
      : []),
    ...(query.stock ? [{ label: c.inStock, patch: { stock: null } }] : []),
    ...(query.sale ? [{ label: c.onSale, patch: { sale: null } }] : []),
  ];
  const clearAll: Patch = { cat: null, brand: null, min: null, max: null, stock: null, sale: null };

  const filters = (
    <div className="space-y-8">
      {categoryFacet && (
        <Group title={c.category}>
          {facets.categories.map((x) => (
            <Check key={x.slug} label={x.name} count={x.count} checked={query.cats.includes(x.slug)} onChange={() => toggleIn("cat", query.cats, x.slug)} />
          ))}
        </Group>
      )}
      <Group title={c.brand}>
        {facets.brands.map((x) => (
          <Check key={x.slug} label={x.name} ltr count={x.count} checked={query.brands.includes(x.slug)} onChange={() => toggleIn("brand", query.brands, x.slug)} />
        ))}
      </Group>
      {facets.bounds.max > facets.bounds.min && (
        <Group title={c.price}>
          <PriceRange
            key={`${query.min}-${query.max}-${facets.bounds.min}-${facets.bounds.max}`}
            bounds={facets.bounds}
            value={[query.min ?? facets.bounds.min, query.max ?? facets.bounds.max]}
            onCommit={([a, b]) => go({
              min: a > facets.bounds.min ? String(a) : null,
              max: b < facets.bounds.max ? String(b) : null,
            })}
          />
        </Group>
      )}
      <Group title={c.availability}>
        <Check label={c.inStock} checked={query.stock} onChange={() => go({ stock: query.stock ? null : "1" })} />
        <Check label={c.onSale} checked={query.sale} onChange={() => go({ sale: query.sale ? null : "1" })} />
      </Group>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 md:px-8">
      <div className="grid gap-10 lg:grid-cols-[250px_1fr] xl:gap-14">
        {/* Desktop sidebar */}
        <aside className="max-lg:hidden" aria-label={c.filters}>
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-6 pe-2">
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
              <h2 className="flex items-center gap-2 font-display text-xl"><SlidersHorizontal className="size-4 text-brass" strokeWidth={1.6} />{c.filters}</h2>
              {chips.length > 0 && <button onClick={() => go(clearAll)} className="text-sm text-smoke underline-offset-4 hover:text-ink hover:underline">{c.clearAll}</button>}
            </div>
            {filters}
          </div>
        </aside>

        <div className="min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line pb-4">
            <button onClick={() => setPanel("filters")} className="flex items-center gap-2 text-sm font-semibold lg:hidden">
              <SlidersHorizontal className="size-4" strokeWidth={1.6} /> {c.filters}
              {chips.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-brass text-[0.7rem] text-onyx">{chips.length}</span>}
            </button>
            <p className="text-sm text-smoke max-sm:hidden" aria-live="polite">{c.showing(from, to, total)}</p>
            <div className="ms-auto flex items-center gap-5">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-smoke max-md:sr-only">{c.sort}</span>
                <select value={query.sort} onChange={(e) => go({ sort: e.target.value === "popular" ? null : e.target.value })} className="select">
                  {SORT_KEYS.map((k) => <option key={k} value={k}>{c.sorts[k]}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm max-md:hidden">
                <span className="text-smoke">{c.perPage}</span>
                <select value={query.per} onChange={(e) => go({ per: e.target.value === "12" ? null : e.target.value })} className="select">
                  {PER.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <div className="flex items-center gap-1 max-xl:hidden" role="group" aria-label={c.grid}>
                {([3, 4] as const).map((n) => (
                  <button key={n} onClick={() => pickCols(n)} aria-pressed={cols === n} aria-label={`${n}`} className={`flex h-8 items-center gap-[3px] px-1.5 ${cols === n ? "text-ink" : "text-line hover:text-smoke"}`}>
                    {Array.from({ length: n }, (_, i) => <span key={i} className="h-3.5 w-[3px] bg-current" />)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap items-center gap-2">
              {chips.map((x) => (
                <li key={x.label}>
                  <button onClick={() => go(x.patch)} className="flex items-center gap-1.5 rounded-full border border-line bg-bone px-3 py-1 text-sm transition-colors hover:border-brass">
                    {x.label}<X className="size-3.5 text-smoke" strokeWidth={1.8} />
                  </button>
                </li>
              ))}
              <li><button onClick={() => go(clearAll)} className="px-2 text-sm text-smoke underline underline-offset-4 hover:text-ink">{c.clearAll}</button></li>
            </ul>
          )}

          {/* Grid */}
          <div className="relative mt-10">
            <div className={`absolute inset-x-0 -top-6 h-0.5 overflow-hidden ${pending ? "" : "invisible"}`} aria-hidden>
              <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] bg-brass" />
            </div>
            {items.length ? (
              <div className={`grid grid-cols-2 gap-x-4 gap-y-10 transition-opacity duration-300 md:gap-x-6 ${cols === 4 ? "md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-3"} ${pending ? "opacity-40" : ""}`}>
                {items.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 4} />)}
              </div>
            ) : (
              <Empty title={c.empty} body={c.emptyBody} action={chips.length ? <button onClick={() => go(clearAll)} className="btn-dark">{c.clearAll}</button> : null} />
            )}
          </div>

          {pages > 1 && (
            <nav className="mt-16 flex items-center justify-center gap-2" aria-label={c.page}>
              <PageLink href={page > 1 ? url({ page: String(page - 1) }) : null} label={c.prev}>
                {l === "ar" ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
              </PageLink>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={url({ page: n === 1 ? null : String(n) })} scroll={false} aria-current={n === page ? "page" : undefined}
                  className={`grid size-10 place-items-center text-sm tabular-nums transition-colors ${n === page ? "bg-onyx text-bone" : "border border-line hover:border-brass"}`}>
                  {n}
                </Link>
              ))}
              <PageLink href={page < pages ? url({ page: String(page + 1) }) : null} label={c.next}>
                {l === "ar" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
              </PageLink>
            </nav>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Drawer open={panel === "filters"} onClose={() => setPanel(null)} title={c.filters} side="start"
        footer={
          <div className="flex gap-3 border-t border-line p-5">
            {chips.length > 0 && <button onClick={() => go(clearAll)} className="btn-line flex-1">{c.clearAll}</button>}
            <button onClick={() => setPanel(null)} className="btn-dark flex-[2]">{c.showResults(total)}</button>
          </div>
        }>
        <div className={`p-6 transition-opacity ${pending ? "opacity-50" : ""}`}>{filters}</div>
      </Drawer>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-4 font-display text-lg">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

function Check({ label, count, checked, onChange, ltr }: { label: string; count?: number; checked: boolean; onChange: () => void; ltr?: boolean }) {
  return (
    <label className={`group flex cursor-pointer items-center gap-3 text-[0.95rem] ${count === 0 && !checked ? "opacity-45" : ""}`}>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} disabled={count === 0 && !checked} />
      <span className="grid size-[18px] shrink-0 place-items-center border border-smoke/50 bg-bone transition-colors group-hover:border-brass peer-checked:border-onyx peer-checked:bg-onyx peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brass">
        <svg viewBox="0 0 12 12" className={`size-3 text-brass ${checked ? "" : "invisible"}`} aria-hidden><path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
      </span>
      <span className="flex-1" dir={ltr ? "ltr" : undefined} style={ltr ? { textAlign: "start" } : undefined}>{label}</span>
      {count != null && <span className="text-xs tabular-nums text-smoke">{count}</span>}
    </label>
  );
}

/** Two overlaid native range inputs (keyboard + touch accessible) over a custom brass track. */
function PriceRange({ bounds, value, onCommit }: { bounds: { min: number; max: number }; value: [number, number]; onCommit: (v: [number, number]) => void }) {
  const { l, t } = useI18n();
  const [[a, b], set] = useState(value);
  const span = bounds.max - bounds.min || 1;
  const step = span > 5000 ? 100 : 50;
  const pos = (v: number) => ((v - bounds.min) / span) * 100;
  const commit = () => (a !== value[0] || b !== value[1]) && onCommit([a, b]);
  const thumb = "range-thumb pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent";

  return (
    <div>
      <div className="relative h-6" dir="ltr">
        <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-line" />
        <div className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-brass" style={{ left: `${pos(a)}%`, right: `${100 - pos(b)}%` }} />
        <input type="range" aria-label={t.catalog.from} min={bounds.min} max={bounds.max} step={step} value={a}
          onChange={(e) => set([Math.min(+e.target.value, b - step), b])} onPointerUp={commit} onKeyUp={commit} onBlur={commit} className={thumb} />
        <input type="range" aria-label={t.catalog.to} min={bounds.min} max={bounds.max} step={step} value={b}
          onChange={(e) => set([a, Math.max(+e.target.value, a + step)])} onPointerUp={commit} onKeyUp={commit} onBlur={commit} className={thumb} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm tabular-nums">
        <span><span className="text-smoke">{t.catalog.from} </span>{money(a, l)}</span>
        <span><span className="text-smoke">{t.catalog.to} </span>{money(b, l)}</span>
      </div>
    </div>
  );
}

function PageLink({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
  const cls = "grid size-10 place-items-center border border-line";
  return href ? (
    <Link href={href} scroll={false} aria-label={label} className={`${cls} hover:border-brass`}>{children}</Link>
  ) : (
    <span aria-hidden className={`${cls} opacity-35`}>{children}</span>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <svg viewBox="0 0 64 64" className="size-16 text-brass" aria-hidden>
        <path d="M22 3h20l19 19v20L42 61H22L3 42V22z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 32h16" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <p className="mt-6 font-display text-2xl">{title}</p>
      <p className="mt-2 max-w-sm text-smoke">{body}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
