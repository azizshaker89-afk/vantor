import { money } from "@/lib/format";
import type { Locale } from "@/i18n/dict";

export function Price({ price, compareAt, l, className = "" }: { price: number; compareAt?: number | null; l: Locale; className?: string }) {
  return (
    <span className={`inline-flex flex-wrap items-baseline justify-center gap-x-2 ${className}`}>
      {compareAt && compareAt > price ? <s className="text-sm text-smoke/80">{money(compareAt, l)}</s> : null}
      <span className="font-semibold text-brass-deep">{money(price, l)}</span>
    </span>
  );
}
