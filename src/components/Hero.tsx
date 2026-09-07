import Image from "next/image";
import { SITE } from "@/data/site";

/**
 * Their header: logo on top, headline on a rule, one line of copy, one button,
 * all centred over a darkened photo. Heights are theirs — 675 / 746 / 780.
 */
export function Hero() {
  return (
    <header className="relative flex min-h-[675px] flex-col bg-hero md:min-h-[746px] xl:min-h-[780px]">
      <Image
        src="/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/20" aria-hidden="true" />

      <div className="relative flex flex-col items-center pt-2 md:pt-6">
        <a href="/" aria-label={`${SITE.name} — home`} className="block">
          <Image
            src="/logo.png"
            alt={SITE.name}
            width={200}
            height={200}
            priority
            className="h-[110px] w-[110px] object-contain md:h-[200px] md:w-[200px]"
            style={{ filter: "drop-shadow(0 0 18px rgba(255,255,255,0.28))" }}
          />
        </a>
      </div>

      <div className="wrap relative mt-[88px] flex flex-col items-center pb-[72px] md:mt-[188px] md:pb-6">
        <h1 className="hero-title w-full md:max-w-[668px] xl:max-w-[770px]">{SITE.tagline}</h1>
        <p className="mt-2 mb-2 w-full text-center text-[22px] leading-[33px] text-white md:mt-4 md:mb-4 md:max-w-[668px] xl:max-w-[750px]">
          We go above and beyond for our customers when it comes to delivering on time quality
          precision parts.
        </p>
        <a href="#quote" className="btn btn-light mt-8">
          Get Started
        </a>
      </div>
    </header>
  );
}
