import { CAPABILITIES } from "@/data/site";
import { SectionHead } from "./SectionHead";

export function Capabilities() {
  return (
    <section id="capabilities" className="relative bg-ink py-24 md:py-32">
      <div className="wrap">
        <SectionHead
          eyebrow="Capabilities"
          title={<>What we <span className="chrome">build</span></>}
          lede="Welding and fabrication done to the drawing. Every job starts with your print and ends with a part that matches it — on the date we quoted."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {CAPABILITIES.map((c, i) => (
            <article key={c.n} className={`plate plate-cut rivets reveal reveal-d${i} group relative flex flex-col p-7 pt-8 xl:min-h-[300px] transition-transform duration-300 hover:-translate-y-1`}>
              <p className="num text-[3.5rem] text-steel-600 transition-colors duration-300 group-hover:text-red">{c.n}</p>
              <h3 className="display display-sm mt-auto pt-6 xl:pt-10">{c.name}</h3>
              <p className="copy mt-3 text-steel-400">{c.blurb}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
