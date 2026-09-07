import { SITE } from "@/data/site";
import { Email } from "./Email";
import { Hours } from "./Hours";
import { QuoteForm } from "./QuoteForm";
import { SectionHead } from "./SectionHead";

export function Quote({ area }: { area?: string }) {
  return (
    <section id="contact" className="relative bg-ink py-24 md:py-32">
      <div id="quote" className="absolute -top-24" aria-hidden="true" />
      <div className="wrap">
        <SectionHead
          eyebrow="Request a quote"
          title={<>Send the print. <span className="chrome">Get a date.</span></>}
          lede={
            area
              ? `Fabrication for ${area} and the rest of the Blue Water region. Attach a drawing or CAD file and we'll reply with a price and a lead time.`
              : "Attach a PDF drawing or a CAD file, tell us how many and when you need them, and we'll reply with a price and a lead time."
          }
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="plate plate-cut rivets reveal p-6 sm:p-10">
            <QuoteForm area={area} />
          </div>

          <aside className="reveal reveal-d2 flex flex-col gap-6">
            <div className="plate plate-cut p-7">
              <p className="label">Call or text</p>
              <a href={`tel:${SITE.phoneE164}`} className="display display-md mt-2 block !text-[2.125rem] text-chrome hover:text-red-hot">
                {SITE.phoneDisplay}
              </a>
              <p className="label mt-6">Email a print</p>
              <Email user={SITE.emailUser} domain={SITE.emailDomain} className="mt-1 block break-all text-[1.0625rem] text-chrome hover:text-red-hot" />
              <p className="label mt-6">Shop</p>
              <p className="mt-1 text-[1.0625rem] text-chrome">{SITE.addressDisplay}</p>
            </div>
            <div className="plate plate-cut p-7">
              <p className="label mb-3">Hours</p>
              <Hours />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
