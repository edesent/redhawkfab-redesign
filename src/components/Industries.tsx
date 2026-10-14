import Image from "next/image";
import { copy, text } from "@/content";
import { SectionHead } from "./SectionHead";

/** One per industries.items in copy.json, same order — so renaming one keeps its photo. */
const IMG = [
  "/industries/automation.jpg",
  "/industries/energy.jpg",
  "/industries/industrial.jpg",
  "/industries/prototype.jpg",
  "/industries/agriculture.jpg",
  "/industries/rd.jpg",
];

export function Industries() {
  return (
    <section id="industries" className="bg-ink py-24 md:py-32">
      <div className="wrap">
        <SectionHead edit="industries" />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.industries.items.map((_, i) => (
            <article key={i} className={`reveal reveal-d${(i % 3) + 1} group relative aspect-[4/3] overflow-hidden`}>
              <Image src={IMG[i]} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="label text-red">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display display-md mt-1 !text-[2.25rem] text-chrome" {...text(`industries.items.${i}.name`)} />
                <p className="copy mt-2 max-w-[36ch] text-steel-300 opacity-0 transition-all duration-300 group-hover:opacity-100 lg:translate-y-2 lg:group-hover:translate-y-0" {...text(`industries.items.${i}.blurb`)} />
              </div>
              <span className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(233,235,238,0.1)] transition-shadow duration-300 group-hover:shadow-[inset_0_0_0_2px_var(--color-red)]" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
