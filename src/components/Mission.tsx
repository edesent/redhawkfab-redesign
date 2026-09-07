import Image from "next/image";

const PILLARS = [
  { k: "Precise", v: "Products that reflect the unique needs of the client — built to the print, checked against the print." },
  { k: "High quality", v: "An expectation of high quality on every piece, not just the ones somebody is going to look at closely." },
  { k: "Timely", v: "We go above and beyond to deliver on time. The lead time we quote is the lead time you get." },
];

export function Mission() {
  return (
    <section id="about" className="relative overflow-hidden bg-steel-900 py-24 md:py-32">
      {/* Their eagle, huge and ghosted into the steel. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt="" aria-hidden="true" className="pointer-events-none absolute -right-24 -top-16 w-[720px] max-w-none opacity-[0.07] lg:w-[900px]" />
      <div className="wrap relative grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="reveal">
          <p className="eyebrow">About RedHawk Fab</p>
          <blockquote className="display display-md mt-6 max-w-[20ch] !leading-[1.02] !tracking-normal !normal-case text-chrome">
            &ldquo;Our mission is to create precise products that reflect the unique needs of our clients — maintaining an expectation of high quality while delivering timely results.&rdquo;
          </blockquote>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {PILLARS.map((p, i) => (
              <div key={p.k} className={`reveal reveal-d${i + 1} border-l-2 border-red pl-5`}>
                <h3 className="display display-sm !text-[1.5rem]">{p.k}</h3>
                <p className="copy mt-2 text-steel-400">{p.v}</p>
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
