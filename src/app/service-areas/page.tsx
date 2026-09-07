import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Quote } from "@/components/Quote";
import { SectionHead } from "@/components/SectionHead";
import { AREAS, COUNTIES } from "@/data/areas";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: `Service Areas — Welding & Fabrication across the Blue Water Region | ${SITE.name}`,
  description: `RedHawk Fab quotes and delivers welding and fabrication work across St. Clair, Sanilac, Lapeer and northern Macomb counties from its shop in Port Huron, Michigan.`,
  alternates: { canonical: "/service-areas" },
};

export default function ServiceAreasPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <section className="relative isolate overflow-hidden bg-ink pt-40 pb-20 md:pt-48 md:pb-28">
          <Image src="/band-sparks.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink" aria-hidden="true" />
          <div className="wrap relative">
            <p className="eyebrow rise rise-1">Service areas</p>
            <h1 className="display display-xl rise rise-2 mt-6 max-w-[12ch]">
              <span className="chrome">Port Huron</span> and everywhere a print comes from.
            </h1>
            <p className="lede rise rise-3 mt-8 max-w-[58ch]">
              We&rsquo;re a Port Huron shop. Most of our work is for customers across the Blue Water region, the Thumb and northern Macomb County — close enough to drop off a part or walk a job together. Farther than that, we ship.
            </p>
          </div>
        </section>

        <section className="bg-ink pb-24 md:pb-32">
          <div className="wrap">
            <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-4">
              {COUNTIES.map((c, i) => (
                <div key={c} className={`reveal reveal-d${i}`}>
                  <h2 className="display display-sm border-b border-steel-700 pb-3">{c} County</h2>
                  <ul className="mt-5 space-y-3">
                    {AREAS.filter((a) => a.county.startsWith(c)).map((a) => (
                      <li key={a.slug}>
                        <Link href={`/service-areas/${a.slug}`} className="group flex items-baseline justify-between gap-3 text-steel-300 hover:text-white">
                          <span className="text-[1.0625rem] font-medium">{a.name}</span>
                          <span className="label !text-[0.6875rem] text-steel-400 group-hover:text-red">{a.miles === 0 ? "home" : `~${a.miles} mi`}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-steel-900 py-24 md:py-32">
          <div className="wrap">
            <SectionHead eyebrow="Not on the list?" title={<>If you can send a print, <span className="chrome">we can quote it.</span></>} lede="The towns above are where we drive most. Parts ship from Port Huron to anywhere; attach the drawing and tell us where it's going." />
          </div>
        </section>
        <Quote />
      </main>
      <Footer />
    </>
  );
}
