import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE } from "@/data/site";
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
const lato = localFont({
  variable: "--font-lato",
  display: "swap",
  src: [
    { path: "../fonts/lato-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/lato-700.woff2", weight: "700", style: "normal" },
  ],
});

const lusitana = localFont({
  variable: "--font-lusitana",
  display: "swap",
  src: [
    { path: "../fonts/lusitana-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/lusitana-700.woff2", weight: "700", style: "normal" },
  ],
});

const TITLE = `${SITE.name} — Quality Welding and Fabrication | Port Huron, MI`;

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
  themeColor: "#161616",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lato.variable} ${lusitana.variable}`}>
      <body className="min-h-screen bg-white">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
