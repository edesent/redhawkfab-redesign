"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { GALLERY } from "@/data/site";
import { SectionHead } from "./SectionHead";

export function Work() {
  const [open, setOpen] = useState<number | null>(null);
  const n = GALLERY.length;
  const step = useCallback((d: number) => setOpen((c) => (c === null ? c : (c + d + n) % n)), [n]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, step]);

  const [feature, ...rest] = GALLERY;

  return (
    <section id="work" className="bg-ink py-24 md:py-32">
      <div className="wrap">
        <SectionHead
          eyebrow="The Work"
          title={<>Out of the <span className="chrome">shop</span></>}
          lede="Frames, weldments and precision parts, photographed on the floor the day they were finished."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          <button type="button" onClick={() => setOpen(0)} className="reveal group relative aspect-[16/10] overflow-hidden lg:col-span-2 lg:aspect-auto lg:row-span-2" aria-label={`Open photo: ${feature.alt}`}>
            <Image src={feature.src} alt={feature.alt} fill sizes="(min-width: 1024px) 66vw, 100vw" style={{ objectPosition: feature.position }} className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" aria-hidden="true" />
            <p className="absolute bottom-5 left-5 right-5 text-left"><span className="label text-red">01</span><span className="display display-sm mt-1 block !text-[1.375rem] text-chrome">{feature.alt}</span></p>
          </button>
          {rest.map((g, i) => (
            <button
              key={g.src}
              type="button"
              onClick={() => setOpen(i + 1)}
              className={`reveal reveal-d${(i % 4) + 1} group relative aspect-[4/3] overflow-hidden`}
              aria-label={`Open photo: ${g.alt}`}
            >
              <Image src={g.src} alt={g.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" style={{ objectPosition: g.position }} className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
              <p className="absolute bottom-4 left-4 right-4 translate-y-2 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="label text-red">{String(i + 2).padStart(2, "0")}</span>
                <span className="mt-1 block text-[0.9375rem] leading-snug text-chrome">{g.alt}</span>
              </p>
              <span className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(233,235,238,0.1)]" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <div className="relative h-full w-full max-w-[1400px]" onClick={(e) => e.stopPropagation()}>
            <Image src={GALLERY[open].src} alt={GALLERY[open].alt} fill sizes="100vw" className="object-contain" priority />
            <p className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink to-transparent p-5 text-[0.9375rem] text-steel-300">
              <span><span className="label text-red">{String(open + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span><br />{GALLERY[open].alt}</span>
            </p>
            <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center bg-steel-800 text-chrome hover:bg-red">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
            </button>
            <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-0 top-1/2 flex h-14 w-12 -translate-y-1/2 items-center justify-center bg-steel-800/80 text-chrome hover:bg-red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute right-0 top-1/2 flex h-14 w-12 -translate-y-1/2 items-center justify-center bg-steel-800/80 text-chrome hover:bg-red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
