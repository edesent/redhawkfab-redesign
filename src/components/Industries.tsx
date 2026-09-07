import { INDUSTRIES } from "@/data/site";

function LogoSet({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="logos-set" aria-hidden={hidden}>
      {INDUSTRIES.map((l) => (
        <div key={l.src}>
          {/* Plain <img>: these are small, fixed-height badges and their own aspect ratios matter. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l.src} alt={hidden ? "" : l.alt} width={l.w} height={l.h} loading="lazy" decoding="async" />
        </div>
      ))}
    </div>
  );
}

export function Industries() {
  return (
    <section id="industries" className="bg-coal py-10">
      <div className="wrap">
        <h2 className="industries-title mb-10">INDUSTRIES WE SERVE</h2>
        <div className="logos">
          <div className="logos-track">
            <LogoSet />
            <LogoSet hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
