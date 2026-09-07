import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/data/site";

const MARQUEE = ["Precision parts", "Weldments", "Frames", "Prototypes", "R&D builds", "Production runs", "Built to print", "On time", "Port Huron, MI"];

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
        <p className="eyebrow rise rise-1">Welding &amp; Fabrication<span className="hidden sm:inline"> — Port Huron, MI</span></p>
        <h1 className="display display-xl rise rise-2 mt-6 max-w-[17ch] [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]">
          <span className="chrome">Built to print.</span>
          <br />
          <span className="text-chrome">Delivered on time.</span>
        </h1>
        <p className="lede rise rise-3 mt-8 max-w-[52ch] [text-shadow:0_1px_12px_rgba(0,0,0,0.7)]">
          Precision welding and fabrication for automation, energy, industrial and agricultural work.
          Send us a print or a CAD file and we&rsquo;ll come back with a quote and a lead time.
        </p>
        <div className="rise rise-4 mt-10 flex flex-wrap items-center gap-4">
          <Link href="#quote" className="btn btn-red">
            Request a Quote
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </Link>
          <Link href="#work" className="btn btn-ghost">See the Work</Link>
          <a href={`tel:${SITE.phoneE164}`} className="label ml-2 !text-[0.8125rem] text-steel-300 hover:text-white">
            or call {SITE.phoneDisplay}
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
                {MARQUEE.map((t) => (
                  <span key={t} className="display display-sm flex items-center !text-[1.375rem] text-steel-300">
                    <span className="mx-7 text-red">✦</span>
                    {t}
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
