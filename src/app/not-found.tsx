import Link from "next/link";
import { SITE } from "@/data/site";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-tan px-6 text-center">
      <p className="section-title mb-4">Page not found</p>
      <p className="copy mb-8">That page isn&rsquo;t here. {SITE.name} is a one-page site.</p>
      <Link href="/" className="btn btn-dark">Back to the site</Link>
    </main>
  );
}
