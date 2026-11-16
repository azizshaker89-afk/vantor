/** Horizontal single-hue bars with the value written beside each bar (no color-only encoding). */
export function BarList({ items, format = (v: number) => String(v), label }: { items: { label: string; value: number }[]; format?: (v: number) => string; label: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  if (!items.length) return <p className="py-6 text-center text-sm text-smoke">مفيش بيانات في الفترة دي.</p>;
  return (
    <ul className="space-y-3" aria-label={label}>
      {items.map((i) => (
        <li key={i.label} className="grid grid-cols-[minmax(5.5rem,auto)_1fr_auto] items-center gap-3 text-sm" title={`${i.label}: ${format(i.value)}`}>
          <span className="truncate">{i.label}</span>
          <span className="h-2.5 bg-stone" aria-hidden>
            <span className="block h-full rounded-e-[4px] bg-brass" style={{ width: `${Math.max(2, (i.value / max) * 100)}%` }} />
          </span>
          <span className="tabular-nums text-ink/80">{format(i.value)}</span>
        </li>
      ))}
    </ul>
  );
}
