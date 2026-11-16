import { Banknote, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import type { Dict } from "@/i18n/dict";

const icons = [Truck, Banknote, RefreshCw, ShieldCheck];

export function Features({ t }: { t: Dict }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-24 md:px-8">
      <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
        {t.features.map((f, i) => {
          const I = icons[i];
          return (
            <li key={f.title} className="flex items-start gap-4 bg-stone-deep p-7">
              <I className="mt-1 size-6 shrink-0 text-brass" strokeWidth={1.4} aria-hidden />
              <div>
                <h3 className="font-display text-lg">{f.title}</h3>
                <p className="mt-1 text-sm text-smoke">{f.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
