import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

/** Compact title band shared by catalog, account and content pages. */
export function PageHeader({ title, body, crumbs }: { title: string; body?: string; crumbs: Crumb[] }) {
  return (
    <section className="border-b border-line bg-bone">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center px-4 py-8 text-center md:px-8 md:py-10">
        <Breadcrumbs items={crumbs} />
        <h1 className="hero-rise mt-4 font-display text-[1.9rem] leading-tight md:text-[2.4rem]">{title}</h1>
        <span className="hero-draw mt-3 block h-px w-16 bg-brass" style={{ animationDelay: "0.2s" }} />
        {body && <p className="mt-3 max-w-md text-sm leading-7 text-smoke">{body}</p>}
      </div>
    </section>
  );
}
