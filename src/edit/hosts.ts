/**
 * The site with the text editor switched on. Same deployment as the public
 * site; only these hostnames load the editor. edit.localhost resolves to your
 * own machine, for trying it with `npm run dev`.
 */
export const EDIT_HOSTS = ["edit.redhawkfab.com", "edit.redhawkfab.elijahdesent.com", "edit.localhost"];

/** Where published text shows up — named in the editor's "it's live" message. */
export const PUBLIC_SITE = "redhawkfab.com";

export function isEditHost(host: string | null | undefined) {
  return Boolean(host) && EDIT_HOSTS.includes(host!.toLowerCase().split(":")[0]);
}

/**
 * The origin the browser used. `req.url` carries the server's own hostname
 * under `next start`, which would send the sign-in cookie and the redirect
 * to different hosts.
 */
export function requestOrigin(req: Request) {
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || new URL(req.url).protocol.replace(":", "");
  return `${proto}://${req.headers.get("host")}`;
}
