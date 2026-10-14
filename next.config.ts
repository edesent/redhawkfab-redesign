import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // edit.redhawkfab.com serves this same site with the text editor on; keep
  // that copy out of search results.
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "edit\\..+" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
