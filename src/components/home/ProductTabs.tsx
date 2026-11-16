"use client";
import { useState } from "react";
import { useI18n } from "../I18nProvider";
import { ProductCard } from "../product/ProductCard";
import type { CardProduct } from "@/lib/types";

type Key = "featured" | "new" | "best";

export function ProductTabs({ tabs }: { tabs: Record<Key, CardProduct[]> }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Key>("featured");
  const keys: Key[] = ["featured", "new", "best"];

  return (
    <div>
      <div role="tablist" className="mb-10 flex justify-center gap-8" aria-label={t.featured.title}>
        {keys.map((k) => (
          <button
            key={k}
            role="tab"
            id={`tab-${k}`}
            aria-selected={tab === k}
            aria-controls="tabpanel"
            onClick={() => setTab(k)}
            className={`relative pb-2 font-display text-lg transition-colors ${tab === k ? "text-ink" : "text-smoke hover:text-ink"}`}
          >
            {t.featured.tabs[k]}
            <span className={`absolute inset-x-0 -bottom-px h-[2px] origin-center bg-brass transition-transform duration-500 ${tab === k ? "scale-x-100" : "scale-x-0"}`} />
          </button>
        ))}
      </div>
      <div id="tabpanel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {tabs[tab].map((p) => <ProductCard key={`${tab}-${p.id}`} p={p} />)}
      </div>
    </div>
  );
}
