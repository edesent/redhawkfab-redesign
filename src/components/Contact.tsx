"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SITE } from "@/data/site";
import { Email } from "./Email";
import { Hours } from "./Hours";
import { QuoteForm } from "./QuoteForm";

/**
 * Their contact block: details on the left, round photo on the right, and a
 * "Drop us a line!" button that swaps the details for the form in place.
 * `#quote` in the URL (the hero button) opens the form directly.
 */
export function Contact() {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const check = () => { if (window.location.hash === "#quote") setShowForm(true); };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  return (
    <section id="contact" className="bg-tan py-10">
      <div className="wrap">
        <h2 className="section-title mb-10 text-center">
          Contact Us
          <hr className="section-rule" />
        </h2>
        <div id="quote" className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center md:gap-12">
          <div className="order-2 md:order-1 md:self-center md:pb-6">
            {showForm ? (
              <QuoteForm onCancel={() => setShowForm(false)} />
            ) : (
              <div>
                <p className="copy mb-10">Call or email for your fabrication needs.</p>
                <h3 className="h4 mb-6">{SITE.legalName}</h3>
                <p className="copy mb-6">{SITE.addressDisplay}</p>
                <p className="copy mb-10">
                  <a href={`tel:${SITE.phoneE164}`} className="text-link">{SITE.phoneDisplay}</a>
                  <br />
                  <Email user={SITE.emailUser} domain={SITE.emailDomain} className="text-link" />
                </p>
                <h3 className="h4 mb-6">Hours</h3>
                <div className="mb-6 md:mb-0">
                  <Hours />
                </div>
                <button type="button" onClick={() => setShowForm(true)} className="btn btn-dark mt-6 w-full md:w-auto">
                  Drop us a line!
                </button>
              </div>
            )}
          </div>
          <div className="order-1 md:order-2 md:self-start">
            <div className="relative aspect-square w-full overflow-hidden rounded-full">
              <Image
                src="/contact.jpg"
                alt="Welder at work in the RedHawk Fab shop"
                fill
                sizes="(min-width: 1280px) 532px, (min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
