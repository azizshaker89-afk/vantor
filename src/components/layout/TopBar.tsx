import { Banknote, RefreshCw, Truck } from "lucide-react";
import type { Dict } from "@/i18n/dict";

const icons = [Truck, Banknote, RefreshCw];

export function TopBar({ t }: { t: Dict }) {
  return (
    <div className="bg-onyx text-[0.8rem] text-bone/85">
      <ul className="mx-auto flex h-9 max-w-[1440px] items-center justify-center gap-8 px-4 overflow-hidden">
        {t.topbar.map((text, i) => {
          const Icon = icons[i];
          return (
            <li key={text} className={`flex items-center gap-2 whitespace-nowrap ${i > 0 ? "max-md:hidden" : ""}`}>
              <Icon className="size-3.5 text-brass" strokeWidth={1.6} aria-hidden />
              {text}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
