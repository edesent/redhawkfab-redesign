import Image from "next/image";
import { copy, text } from "@/content";

export function Mission() {
  return (
    <section id="about" className="relative overflow-hidden bg-steel-900 py-24 md:py-32">
      {/* Their eagle, huge and ghosted into the steel. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt="" aria-hidden="true" className="pointer-events-none absolute -right-24 -top-16 w-[720px] max-w-none opacity-[0.07] lg:w-[900px]" />
      <div className="wrap relative grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="reveal">
          <p className="eyebrow" {...text("about.eyebrow")} />
          <blockquote className="display display-md mt-6 max-w-[20ch] !leading-[1.02] !tracking-normal !normal-case text-chrome">
            &ldquo;<span {...text("about.quote")} />&rdquo;
          </blockquote>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {copy.about.pillars.map((_, i) => (
              <div key={i} className={`reveal reveal-d${i + 1} border-l-2 border-red pl-5`}>
                <h3 className="display display-sm !text-[1.5rem]" {...text(`about.pillars.${i}.name`)} />
                <p className="copy mt-2 text-steel-400" {...text(`about.pillars.${i}.text`)} />
              </div>
            ))}
          </div>
        </div>
        <div className="reveal reveal-d2 relative aspect-[3/4] max-h-[640px] w-full overflow-hidden lg:justify-self-end lg:w-[440px]">
          <Image src="/portrait.jpg" alt="RedHawk Fab welder at the bench, arc lit" fill sizes="(min-width: 1024px) 440px, 100vw" className="object-cover" />
          <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(233,235,238,0.14)]" aria-hidden="true" />
          <div className="hazard absolute inset-x-0 bottom-0" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
