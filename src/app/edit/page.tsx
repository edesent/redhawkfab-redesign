import type { Metadata } from "next";
import Home from "../page";

/** The home page with the text editor switched on (src/edit). Kept out of search. */
export const metadata: Metadata = {
  title: "Edit the website — RedHawk Fab",
  alternates: { canonical: "/" },
  robots: { index: false, follow: false },
};

export default Home;
