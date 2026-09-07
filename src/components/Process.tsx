import Link from "next/link";
import { PROCESS } from "@/data/site";
import { SectionHead } from "./SectionHead";

export function Process() {
  return (
    <section id="process" className="grid-bg relative py-24 md:py-32">
      <div className="hazard absolute inset-x-0 top-0" aria-hidden="true" />
      <div className="wrap">
        <SectionHead
          eyebrow="How a quote works"
          title={<>Print in. <span className="chrome">Part out.</span></>}
          lede="No forms to download, no phone tag. Attach the drawing, tell us when you need it, and you'll hear back with a price and a date."
        />
        <ol className="mt-16 grid gap-px bg-steel-700 sm:grid-cols-2 xl:grid-cols-4">
          {PROCESS.map((s, i) => (
            <li key={s.n} className={`reveal reveal-d${i} relative bg-steel-900 p-8 pt-10`}>
              <span className="num absolute -top-5 left-8 bg-red px-3 py-1 text-[1.5rem] text-white [clip-path:polygon(6px_0,100%_0,100%_calc(100%-6px),calc(100%-6px)_100%,0_100%,0_6px)]">{s.n}</span>
              <h3 className="display display-sm mt-4">{s.name}</h3>
              <p className="copy mt-3 text-steel-400">{s.blurb}</p>
            </li>
          ))}
        </ol>
        <div className="reveal mt-12 flex flex-wrap items-center gap-5">
          <Link href="#quote" className="btn btn-red">Send a print for a quote</Link>
          <p className="copy text-steel-400">PDF, DWG, DXF, STEP, IGES, SolidWorks — up to 50 MB a file.</p>
        </div>
      </div>
    </section>
  );
}
