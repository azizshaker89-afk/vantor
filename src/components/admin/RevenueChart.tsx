"use client";
import { useEffect, useRef, useState } from "react";
import { Table2, LineChart } from "lucide-react";

type Point = { date: string; revenue: number; orders: number };

const nf = new Intl.NumberFormat("en-US");
const compact = (v: number) => (v >= 1000 ? `${nf.format(Math.round(v / 100) / 10)}k` : nf.format(v));
const fmtDay = (d: string, long = false) =>
  new Intl.DateTimeFormat("ar-EG-u-nu-latn", long ? { weekday: "long", day: "numeric", month: "long" } : { day: "numeric", month: "short" }).format(new Date(`${d}T00:00:00`));

/** Single-series revenue area: brass line, recessive grid, crosshair + tooltip, keyboard stepping, table view. */
export function RevenueChart({ data }: { data: Point[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [table]);

  const H = 240, padL = 44, padR = 12, padT = 12, padB = 28;
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const step = niceStep(max / 4);
  const top = Math.ceil(max / step) * step;
  const x = (i: number) => padL + (data.length === 1 ? 0 : (i / (data.length - 1)) * (w - padL - padR));
  const y = (v: number) => padT + (1 - v / top) * (H - padT - padB);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.revenue).toFixed(1)}`).join("");
  const area = `${line}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const every = Math.ceil(data.length / Math.max(2, Math.floor((w - padL) / 70)));
  const h = hover != null ? data[hover] : null;

  const pick = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    const rel = (clientX - r.left - padL) / (w - padL - padR);
    setHover(Math.max(0, Math.min(data.length - 1, Math.round(rel * (data.length - 1)))));
  };

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button onClick={() => setTable((v) => !v)} className="flex items-center gap-1.5 text-xs text-smoke hover:text-ink">
          {table ? <><LineChart className="size-3.5" />عرض كرسم</> : <><Table2 className="size-3.5" />عرض كجدول</>}
        </button>
      </div>
      {table ? (
        <div className="max-h-[240px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-bone text-xs text-smoke"><tr><th className="py-2 text-start">اليوم</th><th className="text-start">الطلبات</th><th className="text-end">الإيراد (ج.م)</th></tr></thead>
            <tbody className="divide-y divide-line">{[...data].reverse().map((d) => <tr key={d.date}><td className="py-1.5">{fmtDay(d.date)}</td><td className="tabular-nums">{d.orders}</td><td className="text-end tabular-nums">{nf.format(d.revenue)}</td></tr>)}</tbody>
          </table>
        </div>
      ) : (
        <div
          ref={box} dir="ltr" className="relative h-[240px] w-full min-w-0 overflow-hidden touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-brass/50"
          tabIndex={0} role="img" aria-label={`الإيراد اليومي لآخر ${data.length} يوم، أعلى يوم ${nf.format(max)} ج.م`}
          onPointerMove={(e) => pick(e.clientX)} onPointerLeave={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") setHover((v) => Math.min(data.length - 1, (v ?? -1) + 1));
            if (e.key === "ArrowLeft") setHover((v) => Math.max(0, (v ?? data.length) - 1));
            if (e.key === "Escape") setHover(null);
          }}
        >
          {w > 0 && <svg width={w} height={H} className="block">
            <defs>
              <linearGradient id="rev-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="var(--color-brass)" stopOpacity="0.22" />
                <stop offset="1" stopColor="var(--color-brass)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth="1" strokeDasharray={t ? "2 4" : undefined} />
                <text x={padL - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-smoke text-[10px] tabular-nums">{compact(t)}</text>
              </g>
            ))}
            {data.map((d, i) => i % every === 0 && (
              <text key={d.date} x={x(i)} y={H - 8} textAnchor="middle" className="fill-smoke text-[10px]">{fmtDay(d.date)}</text>
            ))}
            <path d={area} fill="url(#rev-fill)" />
            <path d={line} fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {h && hover != null && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={padT} y2={y(0)} stroke="var(--color-ink)" strokeOpacity="0.25" />
                <circle cx={x(hover)} cy={y(h.revenue)} r="5" fill="var(--color-brass)" stroke="var(--color-bone)" strokeWidth="2" />
              </g>
            )}
          </svg>}
          {h && hover != null && (
            <div
              className="pointer-events-none absolute top-2 z-10 min-w-36 border border-line bg-bone px-3 py-2 text-xs shadow-lg"
              style={{ left: Math.min(Math.max(x(hover) - 72, 0), w - 150) }}
              dir="rtl"
            >
              <p className="text-smoke">{fmtDay(h.date, true)}</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">{nf.format(h.revenue)} ج.م</p>
              <p className="text-smoke">{h.orders} طلب</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function niceStep(raw: number) {
  const p = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}
