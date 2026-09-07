import Link from "next/link";
import { SITE } from "@/data/site";
import { AREAS } from "@/data/areas";
import { Email } from "./Email";

export function Footer() {
  return (
    <footer className="relative bg-steel-900">
      <div className="hazard" aria-hidden="true" />
      <div className="wrap py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-lift.png" alt={SITE.name} width={1024} height={932} className="h-44 w-auto md:h-52" />
            <p className="copy mt-6 max-w-[38ch] text-steel-400">
              Quality welding and fabrication in Port Huron, Michigan. Precision parts, built to print and delivered on time.
            </p>
          </div>
          <div>
            <p className="label mb-4">Contact</p>
            <a href={`tel:${SITE.phoneE164}`} className="display display-sm block text-chrome hover:text-red-hot">{SITE.phoneDisplay}</a>
            <Email user={SITE.emailUser} domain={SITE.emailDomain} className="mt-2 block break-all text-steel-300 hover:text-white" />
            <p className="mt-2 text-steel-300">{SITE.addressDisplay}</p>
            <p className="label mt-8 mb-3">Site</p>
            <ul className="grid grid-cols-2 gap-y-2 text-steel-300">
              {[["/#capabilities", "Capabilities"], ["/#work", "Work"], ["/#industries", "Industries"], ["/#process", "Process"], ["/#about", "About"], ["/service-areas", "Service areas"], ["/#quote", "Request a quote"]].map(([h, l]) => (
                <li key={h}><Link href={h} className="hover:text-white">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label mb-4">Where we work</p>
            <ul className="columns-2 gap-6 text-[0.9375rem] leading-7 text-steel-400">
              {AREAS.map((a) => (
                <li key={a.slug}><Link href={`/service-areas/${a.slug}`} className="hover:text-white">{a.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-steel-700 pt-6 text-[0.875rem] text-steel-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © {new Date().getFullYear()} {SITE.legalName} — All Rights Reserved.</p>
          <p className="label !text-[0.6875rem]">Port Huron · St. Clair County · Michigan</p>
        </div>
      </div>
    </footer>
  );
}
