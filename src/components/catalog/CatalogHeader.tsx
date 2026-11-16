import Image from "next/image";
import Link from "next/link";
import type { Crumb } from "../ui/Breadcrumbs";
import { PageHeader } from "../ui/PageHeader";

interface Cat { slug: string; name: string; image: string; count: number }

/** Compact title band, then an octagon "dial" switcher. */
export function CatalogHeader({ title, body, crumbs, cats, active, allLabel, allHref, catHref }: {
  title: string; body: string; image?: string; crumbs: Crumb[];
  cats: Cat[]; active: string | null; allLabel: string; allHref: string; catHref: (slug: string) => string;
}) {
  return (
    <>
      <PageHeader title={title} body={body} crumbs={crumbs} />

      <nav aria-label="Collections" className="mx-auto max-w-[1440px] px-4 md:px-8">
        <ul className="no-scrollbar -mt-px flex gap-6 overflow-x-auto py-6 md:justify-center md:gap-8">
          <Dial href={allHref} label={allLabel} active={active === null} />
          {cats.map((c) => (
            <Dial key={c.slug} href={catHref(c.slug)} label={c.name} image={c.image} count={c.count} active={active === c.slug} />
          ))}
        </ul>
      </nav>
    </>
  );
}

const OCT = "polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)";

function Dial({ href, label, image, count, active }: { href: string; label: string; image?: string; count?: number; active: boolean }) {
  return (
    <li className="shrink-0">
      <Link href={href} aria-current={active ? "page" : undefined} className="group flex flex-col items-center gap-3 text-center">
        <span className={`grid size-16 place-items-center p-[2px] transition-colors md:size-[72px] ${active ? "bg-brass" : "bg-line group-hover:bg-brass"}`} style={{ clipPath: OCT }}>
          <span className="relative grid size-full place-items-center overflow-hidden bg-onyx" style={{ clipPath: OCT }}>
            {image ? (
              <Image src={image} alt="" fill sizes="72px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <svg viewBox="0 0 24 24" className="size-6 text-brass" aria-hidden>
                {[0, 1, 2, 3].map((i) => <rect key={i} x={i % 2 ? 13 : 4} y={i > 1 ? 13 : 4} width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.3" />)}
              </svg>
            )}
          </span>
        </span>
        <span className={`text-sm leading-tight ${active ? "font-semibold text-brass-deep" : ""}`}>
          {label}
          {count != null && <span className="ms-1 text-xs text-smoke">({count})</span>}
        </span>
      </Link>
    </li>
  );
}
