/**
 * Everything on the page that is a fact about the business lives here.
 * Sourced from redhawkfab.com (their GoDaddy site) on 2026-09-07.
 */
export const SITE = {
  name: "RedHawk Fab",
  /** How they write it in their own footer / contact block. */
  legalName: "RedHawkFab",
  tagline: "Quality welding and fabrication.",
  description:
    "Quality welding and fabrication in Port Huron, Michigan. We go above and beyond for our customers when it comes to delivering on-time, quality precision parts.",
  /** Demo host until they go live — see README. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://redhawkfab.elijahdesent.com",
  phoneDisplay: "(586) 675-5982",
  phoneE164: "+15866755982",
  /** Split so the address never appears assembled in the HTML. */
  emailUser: "FabWithRedHawk",
  emailDomain: "gmail.com",
  address: { locality: "Port Huron", region: "MI", country: "USA" },
  addressDisplay: "Port Huron, MI, USA",
  /** Index 0 = Sunday, to line up with Date#getDay(). */
  hours: [
    { day: "Sun", open: null, close: null },
    { day: "Mon", open: "06:00 am", close: "05:30 pm" },
    { day: "Tue", open: "06:00 am", close: "05:30 pm" },
    { day: "Wed", open: "06:00 am", close: "05:30 pm" },
    { day: "Thu", open: "06:00 am", close: "05:30 pm" },
    { day: "Fri", open: "06:00 am", close: "05:30 pm" },
    { day: "Sat", open: "07:00 am", close: "01:00 pm" },
  ] as const,
  /** Their own contact block; the shop runs on Eastern time. */
  timeZone: "America/Detroit",
} as const;

export const INDUSTRIES = [
  { name: "Automation", blurb: "Frames, guarding, mounts and fixtures for automated cells." },
  { name: "Energy", blurb: "Oil and gas hardware built to spec and delivered on schedule." },
  { name: "Industrial", blurb: "Plant and process work — weldments, brackets, structural repair." },
  { name: "Prototype", blurb: "First articles and one-offs for teams who need a part in hand." },
  { name: "Agriculture", blurb: "Implements, attachments and repairs that hold up in the field." },
  { name: "R&D", blurb: "Iterative builds for engineers still figuring out the final design." },
] as const;

export const CAPABILITIES = [
  {
    n: "01",
    name: "Welding",
    blurb: "Clean, consistent welds on structural and precision work — from a single piece to a production run.",
  },
  {
    n: "02",
    name: "Fabrication",
    blurb: "Frames, weldments, brackets and assemblies cut, formed and built to your print.",
  },
  {
    n: "03",
    name: "Prototypes & R&D",
    blurb: "One-offs and first articles turned around fast, with the fit and finish of a finished part.",
  },
  {
    n: "04",
    name: "Production Parts",
    blurb: "Repeatable precision parts, quoted with a real lead time and delivered when we said.",
  },
] as const;

export const PROCESS = [
  { n: "01", name: "Send the print", blurb: "Attach a PDF drawing or a CAD file — STEP, DWG, DXF, SolidWorks — right on this page." },
  { n: "02", name: "Get a quote and a lead time", blurb: "We review the print and reply with a price and a delivery date, not a guess." },
  { n: "03", name: "We build to print", blurb: "Welding and fabrication to the drawing, checked against the drawing." },
  { n: "04", name: "Delivered on time", blurb: "The date we quoted is the date it ships. That is the whole reputation." },
] as const;

/**
 * Gallery, in the order the live site shows it (their six shop photos first),
 * followed by the three supplied welding photographs.
 * `position` is the focal point the live site uses for that slide.
 */
export const GALLERY = [
  { src: "/gallery/01.jpg", alt: "Long welded steel cross-frame on a yellow shop cart, ready for finishing", position: "56.85% 23.57%" },
  { src: "/gallery/02.jpg", alt: "Close-up of a ground and polished circular weld seam on plate steel", position: "50% 50%" },
  { src: "/gallery/03.jpg", alt: "Welded steel frame assembly clamped on the fabrication table", position: "50% 50%" },
  { src: "/gallery/04.jpg", alt: "Fabricated steel bracket after welding", position: "50% 50%" },
  { src: "/gallery/05.jpg", alt: "Steel weldment standing on the shop floor", position: "50% 50%" },
  { src: "/gallery/06.jpg", alt: "I-beam section with gusset plates, welds complete", position: "50% 50%" },
  { src: "/gallery/07.jpg", alt: "TIG welding a stainless tube joint", position: "50% 50%" },
  { src: "/gallery/08.jpg", alt: "MIG welding a steel plate seam, sparks flying", position: "50% 50%" },
  { src: "/gallery/09.jpg", alt: "Welder working at a fixture table in the shop", position: "50% 50%" },
] as const;
