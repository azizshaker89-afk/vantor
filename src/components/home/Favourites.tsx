import type { Dict, Locale } from "@/i18n/dict";
import type { CardProduct } from "@/lib/types";
import { SectionHeading } from "../ui/SectionHeading";
import { ProductCard } from "../product/ProductCard";

export function Favourites({ t, products }: { t: Dict; l: Locale; products: CardProduct[] }) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-20 md:px-8" aria-labelledby="favourites">
      <SectionHeading id="favourites" title={t.favourites.title} body={t.favourites.body} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
