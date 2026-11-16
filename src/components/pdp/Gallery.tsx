"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { useI18n } from "../I18nProvider";
import { Mark } from "../ui/Logo";

/** Main frame with cursor-follow zoom on desktop, swipe on touch, and a thumbnail rail. */
export function Gallery({ images, name, badge }: { images: string[]; name: string; badge?: React.ReactNode }) {
  const { l, t } = useI18n();
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const touch = useRef<number | null>(null);
  const go = (d: number) => setI((v) => (v + d + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:gap-4">
      {/* Thumbnail rail: beside the frame on desktop, below it on mobile */}
      <div className="order-2 flex gap-3 md:order-none md:w-[88px] md:flex-col" role="tablist" aria-label={name}>
        {images.map((src, k) => (
          <button
            key={src}
            role="tab"
            aria-selected={i === k}
            aria-label={`${t.pdp.image} ${k + 1}`}
            onClick={() => setI(k)}
            className={`relative aspect-square w-[72px] overflow-hidden bg-onyx outline-offset-2 transition md:w-full ${i === k ? "ring-2 ring-brass" : "opacity-60 hover:opacity-100"}`}
          >
            <Image src={src} alt="" fill sizes="88px" className="object-cover" />
          </button>
        ))}
      </div>

      <div className="relative flex-1">
        <div
          className="relative aspect-square cursor-zoom-in overflow-hidden bg-onyx"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseLeave={() => setZoom(null)}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current == null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            touch.current = null;
            if (Math.abs(dx) > 40) go((dx < 0 ? 1 : -1) * (l === "ar" ? -1 : 1));
          }}
        >
          {images.map((src, k) => (
            <Image
              key={src}
              src={src}
              alt={k === 0 ? name : ""}
              fill
              priority={k === 0}
              sizes="(min-width:1024px) 45vw, 100vw"
              className={`object-cover transition-[opacity,transform] duration-500 ease-[var(--ease-dial)] ${i === k ? "opacity-100" : "opacity-0"}`}
              style={i === k && zoom ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%`, transitionProperty: "opacity" } : undefined}
            />
          ))}
          <Mark className="pointer-events-none absolute bottom-4 start-4 size-8 text-brass/70" />
          {badge}
          <span className="pointer-events-none absolute bottom-4 end-4 rounded-full bg-onyx/60 px-3 py-1 text-xs tabular-nums text-bone md:hidden" dir="ltr">
            {i + 1} / {images.length}
          </span>
        </div>
        <p className="mt-2 text-center text-xs text-smoke max-md:hidden">{t.pdp.zoom}</p>
      </div>
    </div>
  );
}
