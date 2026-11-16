import type { InfoPage } from "@/i18n/pages";

/** Long-form policy body: numbered sections with a brass octagon index. */
export function InfoArticle({ page }: { page: InfoPage }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      {page.updated && <p className="mb-8 text-center text-xs text-smoke">{page.updated}</p>}
      <ol className="space-y-10">
        {page.sections.map((s, i) => (
          <li key={s.h} className="grid grid-cols-[40px_1fr] gap-4">
            <span className="grid size-9 place-items-center bg-onyx text-sm tabular-nums text-brass-soft" style={{ clipPath: "polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)" }}>{i + 1}</span>
            <div>
              <h2 className="font-display text-xl leading-9">{s.h}</h2>
              {s.p?.map((p) => <p key={p} className="mt-3 leading-8 text-ink/80">{p}</p>)}
              {s.list && (
                <ul className="mt-3 space-y-2">
                  {s.list.map((x) => <li key={x} className="flex gap-3 leading-7 text-ink/80"><span className="mt-3 size-1.5 shrink-0 rotate-45 bg-brass" />{x}</li>)}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
