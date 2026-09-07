"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { GALLERY } from "@/data/site";

/**
 * Their photo gallery: one 16:9 stage with edge arrows and a "1/9" counter,
 * plus a row of 95×68 thumbnails (hidden on phones, exactly as on their site).
 */
export function Gallery() {
  const [i, setI] = useState(0);
  const n = GALLERY.length;
  const go = useCallback((d: number) => setI((c) => (c + d + n) % n), [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section id="gallery" className="bg-coal pt-10 pb-10 md:pb-4" aria-label="Photo gallery">
      <div className="wrap">
        <div className="relative aspect-video w-full overflow-hidden bg-coal">
          {GALLERY.map((g, k) => (
            <Image
              key={g.src}
              src={g.src}
              alt={g.alt}
              fill
              priority={k === 0}
              sizes="(min-width: 1280px) 1112px, (min-width: 768px) calc(100vw - 88px), calc(100vw - 48px)"
              style={{ objectPosition: g.position }}
              className={`object-cover transition-opacity duration-300 ${k === i ? "opacity-100" : "opacity-0"}`}
              aria-hidden={k !== i}
            />
          ))}

          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute top-1/2 left-0 flex h-11 w-9 -translate-y-1/2 items-center justify-center bg-coal/25 text-white hover:bg-coal/50"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden="true">
              <path fillRule="evenodd" d="M15.804 19.544a.774.774 0 0 1-1.061-.03L7 11.63l7.742-7.42a.773.773 0 0 1 1.061 0 .697.697 0 0 1 0 1.017L9.09 11.66l6.745 6.867a.698.698 0 0 1-.031 1.016" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute top-1/2 right-0 flex h-11 w-9 -translate-y-1/2 items-center justify-center bg-coal/25 text-white hover:bg-coal/50"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden="true">
              <path fillRule="evenodd" d="M7.236 4.195a.773.773 0 0 1 1.06.031l7.743 7.883-7.742 7.42a.773.773 0 0 1-1.06 0 .697.697 0 0 1 0-1.017l6.712-6.433-6.745-6.868a.697.697 0 0 1 .032-1.016" />
            </svg>
          </button>

          <p className="absolute right-0 bottom-0 bg-coal/50 p-2 text-[16px] leading-6 text-white" aria-live="polite">
            {i + 1}/{n}
          </p>
        </div>

        <ul className="mt-[15px] hidden h-[73px] gap-[10px] md:flex" role="tablist" aria-label="Choose a photo">
          {GALLERY.map((g, k) => (
            <li key={g.src} className="h-[68px] w-[95px] shrink-0">
              <button
                type="button"
                role="tab"
                aria-selected={k === i}
                aria-label={`Photo ${k + 1}: ${g.alt}`}
                onClick={() => setI(k)}
                className={`relative block h-full w-full outline-offset-0 ${k === i ? "outline-3 outline-thumb" : "outline-none"}`}
                style={k === i ? { outline: "3px solid var(--color-thumb)" } : undefined}
              >
                <Image src={g.src} alt="" fill sizes="95px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
