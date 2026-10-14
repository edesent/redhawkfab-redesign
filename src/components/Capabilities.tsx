import { copy, text } from "@/content";
import { SectionHead } from "./SectionHead";

export function Capabilities() {
  return (
    <section id="capabilities" className="relative bg-ink py-24 md:py-32">
      <div className="wrap">
        <SectionHead edit="capabilities" />
        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {copy.capabilities.items.map((_, i) => (
            <article key={i} className={`plate plate-cut rivets reveal reveal-d${i} group relative flex flex-col p-7 pt-8 xl:min-h-[300px] transition-transform duration-300 hover:-translate-y-1`}>
              <p className="num text-[3.5rem] text-steel-600 transition-colors duration-300 group-hover:text-red">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="display display-sm mt-auto pt-6 xl:pt-10" {...text(`capabilities.items.${i}.name`)} />
              <p className="copy mt-3 text-steel-400" {...text(`capabilities.items.${i}.blurb`)} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
