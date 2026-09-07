"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "@/data/site";

const NAV = [
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#work", label: "Work" },
  { href: "/#industries", label: "Industries" },
  { href: "/#process", label: "Process" },
  { href: "/service-areas", label: "Areas" },
  { href: "/#contact", label: "Contact" },
];

export function Nav({ solidFromStart = false }: { solidFromStart?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const solid = solidFromStart || scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "bg-ink/92 shadow-[0_1px_0_rgba(233,235,238,0.08)] backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="wrap flex h-[76px] items-center gap-6 md:h-[88px]">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${SITE.name} — home`} onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" width={1024} height={693} className="h-9 w-auto brightness-125 md:h-11" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-wordmark.png" alt={SITE.name} width={874} height={239} className="h-6 w-auto brightness-125 contrast-105 md:h-7" />
        </Link>

        <nav className="ml-auto hidden items-center gap-7 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="label !text-[0.8125rem] text-steel-300 transition-colors hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/#quote" className="btn btn-red ml-auto hidden !min-h-[46px] !px-5 !text-[0.9375rem] lg:ml-0 lg:inline-flex">
          Request a Quote
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="ml-auto flex h-11 w-11 items-center justify-center text-chrome lg:hidden"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
            {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
          </svg>
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-steel-700 bg-ink lg:hidden"
      >
        <nav className="wrap flex flex-col py-4" aria-label="Mobile">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="display display-sm border-b border-steel-700 py-4 !text-[1.75rem]">
              {n.label}
            </Link>
          ))}
          <Link href="/#quote" onClick={() => setOpen(false)} className="btn btn-red mt-6 w-full">
            Request a Quote
          </Link>
          <a href={`tel:${SITE.phoneE164}`} className="label mt-6 text-center text-steel-300">
            {SITE.phoneDisplay}
          </a>
        </nav>
      </div>
    </header>
  );
}
