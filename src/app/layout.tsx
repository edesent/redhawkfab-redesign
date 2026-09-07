import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE } from "@/data/site";
import { Reveal } from "@/components/Reveal";
import "./globals.css";

/**
 * DEMO BUILD. Until NEXT_PUBLIC_SITE_LIVE=true every page carries
 * noindex,nofollow and robots.txt disallows everything — this site re-hosts
 * RedHawk Fab's own copy and photos, and an indexed demo can outrank their
 * real site. `./go-live.sh --live` flips both.
 */
const LIVE = process.env.NEXT_PUBLIC_SITE_LIVE === "true";

// Self-hosted: next/font/google downloads at build time and a blip on Vercel's
// build workers kills the whole production deploy.
const barlow = localFont({
  variable: "--font-barlow",
  display: "swap",
  src: [
    { path: "../fonts/barlow-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/barlow-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/barlow-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/barlow-700.woff2", weight: "700", style: "normal" },
  ],
});

const condensed = localFont({
  variable: "--font-barlow-condensed",
  display: "swap",
  src: [
    { path: "../fonts/barlow-condensed-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/barlow-condensed-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/barlow-condensed-800.woff2", weight: "800", style: "normal" },
    { path: "../fonts/barlow-condensed-900.woff2", weight: "900", style: "normal" },
  ],
});

const TITLE = `${SITE.name} — Precision Welding & Fabrication | Port Huron, MI`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: TITLE,
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE.name,
    url: SITE.url,
    title: TITLE,
    description: SITE.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Welding in the RedHawk Fab shop" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: SITE.description, images: ["/og.jpg"] },
  icons: {
    icon: [{ url: "/icon.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: LIVE
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
    : { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0c0e",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${condensed.variable}`}>
      <body className="min-h-screen bg-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-red focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <Reveal />
      </body>
    </html>
  );
}
