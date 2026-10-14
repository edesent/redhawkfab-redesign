import Link from "next/link";
import { copy, text } from "@/content";
import { SectionHead } from "./SectionHead";

export function Process() {
  return (
    <section id="process" className="grid-bg relative py-24 md:py-32">
      <div className="hazard absolute inset-x-0 top-0" aria-hidden="true" />
      <div className="wrap">
        <SectionHead edit="process" />
        <ol className="mt-16 grid gap-px bg-steel-700 sm:grid-cols-2 xl:grid-cols-4">
          {copy.process.steps.map((_, i) => (
            <li key={i} className={`reveal reveal-d${i} relative bg-steel-900 p-8 pt-10`}>
              <span className="num absolute -top-5 left-8 bg-red px-3 py-1 text-[1.5rem] text-white [clip-path:polygon(6px_0,100%_0,100%_calc(100%-6px),calc(100%-6px)_100%,0_100%,0_6px)]">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="display display-sm mt-4" {...text(`process.steps.${i}.name`)} />
              <p className="copy mt-3 text-steel-400" {...text(`process.steps.${i}.blurb`)} />
            </li>
          ))}
        </ol>
        <div className="reveal mt-12 flex flex-wrap items-center gap-5">
          <Link href="#quote" className="btn btn-red"><span {...text("process.cta")} /></Link>
          <p className="copy text-steel-400" {...text("process.files")} />
        </div>
      </div>
    </section>
  );
}
