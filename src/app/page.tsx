import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Capabilities } from "@/components/Capabilities";
import { Work } from "@/components/Work";
import { Mission } from "@/components/Mission";
import { Industries } from "@/components/Industries";
import { Process } from "@/components/Process";
import { Areas } from "@/components/Areas";
import { Quote } from "@/components/Quote";
import { Footer } from "@/components/Footer";
import { Schema } from "@/components/Schema";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Capabilities />
        <Work />
        <Mission />
        <Industries />
        <Process />
        <Areas />
        <Quote />
      </main>
      <Footer />
      <Schema />
    </>
  );
}
