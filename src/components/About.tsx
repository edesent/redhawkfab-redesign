import Image from "next/image";

export function About() {
  return (
    <section id="about" className="bg-tan py-10">
      <div className="wrap">
        <h2 className="section-title mb-10">
          About RedHawk Fab
          <hr className="section-rule" />
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center md:gap-12">
          <div className="relative aspect-[2/1] w-full">
            <Image
              src="/about.jpg"
              alt="Welding a steel frame on the fixture table"
              fill
              sizes="(min-width: 1280px) 532px, (min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="mb-6 text-center md:mb-0">
            <h3 className="h4 mb-4 md:mb-6">Our Mission</h3>
            <p className="copy">
              At RedHawk Fab, our mission is to create precise products that reflect the unique
              needs of our clients. We are committed to maintaining an Expectation of High Quality
              while delivering Timely results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
