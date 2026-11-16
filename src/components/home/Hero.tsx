"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { href } from "@/lib/format";

const IMAGES = ["/img/editorial/hero-watch.webp", "/img/editorial/hero-shades.webp", "/img/editorial/hero-leather.webp"];
const DURATION = 7000;
const R = 38;
const LEN = 2 * Math.PI * R;

/** The bezel: 60 minute ticks, with a brass arc that sweeps once per slide like a seconds hand. */
function Bezel({ index, total, running, onDone }: { index: number; total: number; running: boolean; onDone: () => void }) {
  return (
    <svg viewBox="0 0 100 100" className="size-[92px] -rotate-90" aria-hidden>
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const major = i % 5 === 0;
        const r1 = major ? 43 : 45;
        return (
          <line
            key={i}
            x1={50 + Math.cos(a) * r1} y1={50 + Math.sin(a) * r1}
            x2={50 + Math.cos(a) * 48} y2={50 + Math.sin(a) * 48}
            stroke="currentColor" strokeWidth={major ? 1.4 : 0.6} opacity={major ? 0.9 : 0.45}
          />
        );
      })}
      <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
      <circle
        key={`${index}-${running}`}
        cx="50" cy="50" r={R} fill="none" stroke="var(--color-brass)" strokeWidth="1.8" strokeLinecap="round"
        strokeDasharray={LEN}
        style={{
          ["--ring-len" as string]: LEN,
          strokeDashoffset: running ? undefined : 0,
          animation: running ? `sweep ${DURATION}ms linear forwards` : "none",
        }}
        onAnimationEnd={onDone}
      />
      <text x="50" y="50" className="rotate-90 origin-center" textAnchor="middle" dominantBaseline="central" fill="currentColor" fontSize="15" fontFamily="var(--font-marcellus)">
        {index + 1}/{total}
      </text>
    </svg>
  );
}

export function Hero() {
  const { l, t } = useI18n();
  const slides = t.hero;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [first, setFirst] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const go = useCallback((d: number) => { setFirst(false); setI((x) => (x + d + slides.length) % slides.length); }, [slides.length]);
  const s = slides[i];
  const Prev = l === "ar" ? ChevronRight : ChevronLeft;
  const Next = l === "ar" ? ChevronLeft : ChevronRight;

  return (
    <section
      className="relative isolate h-[min(86vh,780px)] min-h-[560px] overflow-hidden bg-onyx text-bone"
      aria-roledescription="carousel"
      aria-label="VANTOR"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {IMAGES.map((src, k) => (
        <div key={src} className={`absolute inset-0 -z-10 transition-opacity duration-[1200ms] ${k === i ? "opacity-100" : "opacity-0"}`} aria-hidden={k !== i}>
          <Image
            key={k === i ? `on-${i}` : "off"}
            src={src} alt="" fill priority={k === 0} sizes="100vw"
            className={`object-cover ${k === i ? "hero-zoom" : ""}`}
          />
        </div>
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-onyx/85 via-onyx/45 to-onyx/5 rtl:bg-gradient-to-l" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-onyx/70 to-transparent" />

      <div className="mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-24 md:px-12 md:pb-24 lg:justify-center lg:pb-0">
        <div key={i} className="max-w-[34rem]" aria-live="polite">
          <span className="hero-draw mb-7 block h-px w-24 bg-brass" style={{ animationDelay: first ? "200ms" : "0ms" }} />
          <h1 className="hero-rise font-display text-[2.6rem] leading-[1.1] md:text-[4.1rem]" style={{ animationDelay: first ? "350ms" : "0ms" }}>
            {s.title}
          </h1>
          <p className="hero-rise mt-5 max-w-md text-[1.05rem] leading-8 text-bone/80" style={{ animationDelay: first ? "550ms" : "120ms" }}>
            {s.body}
          </p>
          <Link
            href={href(l, s.href)}
            className="hero-rise mt-9 inline-block bg-brass px-9 py-4 text-sm font-semibold tracking-wide text-onyx transition-colors hover:bg-bone"
            style={{ animationDelay: first ? "750ms" : "220ms" }}
          >
            {s.cta}
          </Link>
        </div>
      </div>

      <div className="absolute end-4 top-4 flex scale-75 items-center gap-3 lg:end-auto lg:top-auto lg:bottom-10 lg:left-1/2 lg:-translate-x-1/2 lg:scale-100">
        <button onClick={() => go(-1)} aria-label={t.heroControls.prev} className="grid size-10 place-items-center rounded-full border border-bone/30 hover:border-brass hover:text-brass">
          <Prev className="size-4" strokeWidth={1.5} />
        </button>
        <Bezel index={i} total={slides.length} running={!paused && !reduced} onDone={() => go(1)} />
        <button onClick={() => go(1)} aria-label={t.heroControls.next} className="grid size-10 place-items-center rounded-full border border-bone/30 hover:border-brass hover:text-brass">
          <Next className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
