import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // /edit is the home page with the owner's text editor on; keep it out of search.
  async headers() {
    return [{ source: "/edit", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  // edit.redhawkfab.com is attached to the project from an earlier plan; if its
  // DNS is ever added, send it to the editor.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "edit\\.redhawkfab\\.com" }],
        destination: "https://www.redhawkfab.com/edit",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
