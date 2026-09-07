import { SITE } from "@/data/site";
import { AREAS } from "@/data/areas";

const DAY: Record<string, string> = {
  Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday",
};
const to24 = (t: string) => {
  const m = /^(\d{2}):(\d{2}) (am|pm)$/.exec(t)!;
  let h = Number(m[1]);
  if (m[3] === "pm" && h !== 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
};

/** LocalBusiness JSON-LD. Phone, hours and service area only — no email on purpose. */
export function Schema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE.url}/#business`,
    name: SITE.name,
    alternateName: SITE.legalName,
    url: SITE.url,
    telephone: SITE.phoneE164,
    image: `${SITE.url}/og.jpg`,
    logo: `${SITE.url}/logo.png`,
    description: SITE.description,
    address: { "@type": "PostalAddress", addressLocality: SITE.address.locality, addressRegion: SITE.address.region, addressCountry: "US" },
    areaServed: AREAS.map((a) => ({ "@type": "City", name: `${a.name}, MI` })),
    openingHoursSpecification: SITE.hours
      .filter((h) => h.open)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: DAY[h.day], opens: to24(h.open!), closes: to24(h.close!) })),
    knowsAbout: ["Welding", "Metal fabrication", "Precision parts", "Prototyping", "Weldments"],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
