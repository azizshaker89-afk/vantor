"use client";
import { useState } from "react";
import { useI18n } from "../I18nProvider";

type Key = "desc" | "specs" | "shipping";

export function DetailTabs({ desc, specs, tagline }: { desc: string; specs: [string, string][]; tagline: string }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Key>("specs");
  const keys: Key[] = ["specs", "desc", "shipping"];

  return (
    <section className="mx-auto max-w-4xl px-4 md:px-8">
      <div role="tablist" className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line sm:justify-center md:gap-12">
        {keys.map((k) => (
          <button key={k} role="tab" id={`pt-${k}`} aria-selected={tab === k} aria-controls={`pp-${k}`} onClick={() => setTab(k)}
            className={`relative shrink-0 whitespace-nowrap pb-4 font-display text-lg transition-colors md:text-xl ${tab === k ? "text-ink" : "text-smoke hover:text-ink"}`}>
            {t.pdp.tabs[k]}
            <span className={`absolute inset-x-0 -bottom-px h-[2px] bg-brass transition-transform duration-500 ${tab === k ? "scale-x-100" : "scale-x-0"}`} />
          </button>
        ))}
      </div>

      <div className="py-10">
        {tab === "specs" && (
          <dl id="pp-specs" role="tabpanel" aria-labelledby="pt-specs" className="mx-auto max-w-2xl divide-y divide-line border-y border-line">
            {specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[minmax(120px,40%)_1fr] gap-4 py-3.5 text-[0.95rem]">
                <dt className="text-smoke">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {tab === "desc" && (
          <div id="pp-desc" role="tabpanel" aria-labelledby="pt-desc" className="mx-auto max-w-2xl text-center">
            <p className="text-lg leading-9">{desc}</p>
            <p className="mt-6 font-display text-brass-deep">{tagline}</p>
          </div>
        )}
        {tab === "shipping" && (
          <ul id="pp-shipping" role="tabpanel" aria-labelledby="pt-shipping" className="mx-auto max-w-2xl space-y-4">
            {t.pdp.shippingBody.map((s) => (
              <li key={s} className="flex gap-3 leading-7">
                <svg viewBox="0 0 10 10" className="mt-2.5 size-2 shrink-0 text-brass" aria-hidden><path d="M3 0h4l3 3v4l-3 3H3L0 7V3z" fill="currentColor" /></svg>
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
