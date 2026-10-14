import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/data/site";
import { copy, text } from "@/content";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink">
      <Image
        src="/hero.jpg"
        alt="A RedHawk Fab welder laying a bead on a steel frame"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_50%] lg:object-[62%_50%]"
      />
      {/* Type over a photo needs a side wash, not one flat scrim. */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/78 to-ink/10 lg:via-ink/60" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/40 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" aria-hidden="true" />
      {/* Weld-arc glow behind the headline. */}
      <div className="arc absolute -left-40 top-1/3 h-[60vh] w-[60vw] rounded-full bg-red/10 blur-3xl" aria-hidden="true" />

      <div className="wrap relative pt-40 pb-16 md:pb-24 lg:pb-28">
        <p className="eyebrow rise rise-1"><span {...text("hero.eyebrow")} /><span className="hidden sm:inline"> <span {...text("hero.eyebrowPlace")} /></span></p>
        <h1 className="display display-xl rise rise-2 mt-6 max-w-[17ch] [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]">
          <span className="chrome" {...text("hero.headline")} />
          <br />
          <span className="text-chrome" {...text("hero.headlineAccent")} />
        </h1>
        <p className="lede rise rise-3 mt-8 max-w-[52ch] [text-shadow:0_1px_12px_rgba(0,0,0,0.7)]" {...text("hero.lede")} />
        <div className="rise rise-4 mt-10 flex flex-wrap items-center gap-4">
          <Link href="#quote" className="btn btn-red">
            <span {...text("hero.ctaQuote")} />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </Link>
          <Link href="#work" className="btn btn-ghost"><span {...text("hero.ctaWork")} /></Link>
          <a href={`tel:${SITE.phoneE164}`} className="label ml-2 !text-[0.8125rem] text-steel-300 hover:text-white">
            <span {...text("hero.call")} /> {SITE.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Capability ticker on a steel bar. */}
      <div className="relative border-t border-steel-700 bg-steel-900/90 backdrop-blur">
        <div className="hazard absolute inset-x-0 -top-[6px]" aria-hidden="true" />
        <div className="marquee py-4" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center">
                {copy.hero.ticker.map((_, i) => (
                  <span key={i} className="display display-sm flex items-center !text-[1.375rem] text-steel-300">
                    <span className="mx-7 text-red">✦</span>
                    <span {...text(`hero.ticker.${i}`)} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
