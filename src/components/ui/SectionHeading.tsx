export function SectionHeading({ title, body, id }: { title: string; body?: string; id?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-xl text-center md:mb-12">
      <h2 id={id} className="font-display text-[2rem] leading-tight md:text-[2.6rem]">{title}</h2>
      <div className="mx-auto my-4 flex w-28 items-center gap-2 text-brass" aria-hidden>
        <span className="h-px flex-1 bg-current opacity-50" />
        <svg viewBox="0 0 10 10" className="size-2.5"><path d="M3 0h4l3 3v4l-3 3H3L0 7V3z" fill="currentColor" /></svg>
        <span className="h-px flex-1 bg-current opacity-50" />
      </div>
      {body && <p className="text-smoke">{body}</p>}
    </div>
  );
}
