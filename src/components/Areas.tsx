import Image from "next/image";
import Link from "next/link";
import { AREAS, COUNTIES } from "@/data/areas";
import { SectionHead } from "./SectionHead";

/** Homepage band: the service area as a photo plate with the town list on it. */
export function Areas() {
  return (
    <section id="areas" className="relative overflow-hidden bg-steel-900 py-24 md:py-32">
      <Image src="/band-workshop.jpg" alt="" fill sizes="100vw" className="object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-steel-900 via-steel-900/85 to-steel-900/40" aria-hidden="true" />
      <div className="wrap relative">
        <SectionHead
          eyebrow="Areas we serve"
          title={<>The Blue Water region <span className="chrome">and the Thumb</span></>}
          lede="Based in Port Huron. We quote and deliver across St. Clair, Sanilac, Lapeer and northern Macomb counties — and ship anywhere a print comes from."
        />
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {COUNTIES.map((c, i) => (
            <div key={c} className={`reveal reveal-d${i}`}>
              <h3 className="display display-sm border-b border-steel-600 pb-3 !text-[1.5rem]">{c} County</h3>
              <ul className="mt-4 space-y-2 text-steel-300">
                {AREAS.filter((a) => a.county.startsWith(c)).map((a) => (
                  <li key={a.slug}>
                    <Link href={`/service-areas/${a.slug}`} className="group inline-flex items-baseline gap-2 hover:text-white">
                      <span className="h-px w-3 bg-red opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                      {a.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link href="/service-areas" className="btn btn-ghost reveal mt-12">All service areas</Link>
      </div>
    </section>
  );
}
