import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Industries } from "@/components/Industries";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Schema } from "@/components/Schema";

export default function Home() {
  return (
    <>
      <Hero />
      <main id="main">
        <About />
        <Gallery />
        <Industries />
        <Contact />
      </main>
      <Footer />
      <Schema />
    </>
  );
}
