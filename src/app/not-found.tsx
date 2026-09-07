import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Nav solidFromStart />
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-ink px-6 pt-32 text-center">
        <p className="eyebrow [&::before]:hidden">404</p>
        <h1 className="display display-lg mt-4">That page isn&rsquo;t here.</h1>
        <Link href="/" className="btn btn-red mt-10">Back to RedHawk Fab</Link>
      </main>
      <Footer />
    </>
  );
}
