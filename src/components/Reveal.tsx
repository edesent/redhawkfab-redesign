"use client";
import { useEffect } from "react";

/**
 * One observer for the whole document. Elements opt in with class="reveal";
 * anything already on screen at load is revealed immediately so the hero never
 * flashes empty.
 */
export function Reveal() {
  useEffect(() => {
    const targets = () => Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets().forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    targets().forEach((el) => io.observe(el));

    // New nodes after client navigation.
    const mo = new MutationObserver(() => targets().forEach((el) => io.observe(el)));
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
