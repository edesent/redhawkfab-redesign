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
  phoneDisplay: "+1.5866755982",
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
  { src: "/industries/automation.png", alt: "Automation", w: 139, h: 100 },
  { src: "/industries/energy.png", alt: "Energy — oil and gas", w: 112, h: 100 },
  { src: "/industries/industrial.png", alt: "Industrial", w: 160, h: 100 },
  { src: "/industries/prototype.jpg", alt: "Prototype", w: 100, h: 100 },
  { src: "/industries/agriculture.png", alt: "Agriculture", w: 100, h: 100 },
  { src: "/industries/rd.png", alt: "Research and development", w: 100, h: 100 },
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
