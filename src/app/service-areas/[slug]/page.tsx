import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Quote } from "@/components/Quote";
import { SectionHead } from "@/components/SectionHead";
import { AREAS, AREA_BY_SLUG, nearby } from "@/data/areas";
import { CAPABILITIES, INDUSTRIES, SITE } from "@/data/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return AREAS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const a = AREA_BY_SLUG[slug];
  if (!a) return {};
  return {
    title: `Welding & Fabrication in ${a.name}, MI | ${SITE.name}`,
    description: `Precision welding and fabrication for ${a.name}, Michigan from RedHawk Fab in Port Huron. Send a print or CAD file for a quote and a lead time.`,
    alternates: { canonical: `/service-areas/${a.slug}` },
  };
}

export default async function AreaPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const a = AREA_BY_SLUG[slug];
  if (!a) notFound();
  const near = nearby(a.slug);

  return (
    <>
      <Nav />
      <main id="main">
        <section className="relative isolate overflow-hidden bg-ink pt-40 pb-20 md:pt-48 md:pb-28">
          <Image src={a.image} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/20" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" aria-hidden="true" />
          <div className="wrap relative">
            <p className="eyebrow rise rise-1">
              <Link href="/service-areas" className="hover:text-white">Service areas</Link> — {a.county} County
            </p>
            <h1 className="display display-xl rise rise-2 mt-6 max-w-[12ch]">
              Welding &amp; fabrication in <span className="chrome">{a.name}</span>
            </h1>
            <p className="lede rise rise-3 mt-8 max-w-[58ch]">
              {a.note}{" "}
              {a.miles === 0
                ? "Our shop is right here, and so are the parts."
                : `About ${a.miles} miles from our shop in Port Huron — close enough to walk a job together, deliver a part, or pick one up.`}
            </p>
            <div className="rise rise-4 mt-10 flex flex-wrap gap-4">
              <Link href="#quote" className="btn btn-red">Request a Quote</Link>
              <a href={`tel:${SITE.phoneE164}`} className="btn btn-ghost">Call {SITE.phoneDisplay}</a>
            </div>
          </div>
        </section>

        <section className="bg-ink py-20 md:py-28">
          <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <SectionHead
              eyebrow={`For ${a.name}`}
              title={<>What we do for <span className="chrome">{a.name}</span></>}
              lede={`The same shop and the same standard whether the print comes from ${a.name} or from across the state: precision parts, built to the drawing, delivered on the date we quoted.`}
            />
            <ul className="grid gap-4 sm:grid-cols-2">
              {CAPABILITIES.map((c, i) => (
                <li key={c.n} className={`plate plate-cut reveal reveal-d${i} p-6`}>
                  <span className="num text-[2rem] text-red">{c.n}</span>
                  <h3 className="display display-sm mt-3 !text-[1.375rem]">{c.name}</h3>
                  <p className="copy mt-2 text-steel-400">{c.blurb}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid-bg relative py-20 md:py-28">
          <div className="hazard absolute inset-x-0 top-0" aria-hidden="true" />
          <div className="wrap">
            <SectionHead eyebrow="Industries" title={<>Who calls us from <span className="chrome">{a.county} County</span></>} />
            <ul className="mt-12 grid gap-px bg-steel-700 sm:grid-cols-2 lg:grid-cols-3">
              {INDUSTRIES.map((ind, i) => (
                <li key={ind.name} className={`reveal reveal-d${i % 3} bg-steel-900 p-7`}>
                  <h3 className="display display-sm !text-[1.5rem]">{ind.name}</h3>
                  <p className="copy mt-2 text-steel-400">{ind.blurb}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Quote area={a.name} />

        <section className="bg-steel-900 py-16">
          <div className="wrap">
            <p className="label mb-5">Nearby</p>
            <ul className="flex flex-wrap gap-3">
              {near.map((n) => (
                <li key={n.slug}>
                  <Link href={`/service-areas/${n.slug}`} className="inline-flex items-center gap-2 border border-steel-700 px-4 py-2 text-[0.9375rem] text-steel-300 hover:border-red hover:text-white">
                    {n.name} <span className="label !text-[0.625rem] text-steel-400">~{n.miles} mi</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/service-areas" className="inline-flex items-center border border-steel-700 px-4 py-2 text-[0.9375rem] text-steel-300 hover:border-red hover:text-white">All areas</Link>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
