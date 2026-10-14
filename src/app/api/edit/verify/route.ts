import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_DAYS, emailFromLink, sessionToken } from "@/edit/auth";
import { isEditHost, requestOrigin } from "@/edit/hosts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The link from the sign-in email: trade it for a 30-day session cookie on this host. */
export async function GET(req: Request) {
  if (!isEditHost(req.headers.get("host"))) return new Response("Not found", { status: 404 });
  const origin = requestOrigin(req);

  const email = emailFromLink(new URL(req.url).searchParams.get("t") ?? undefined);
  if (!email) return NextResponse.redirect(`${origin}/?signin=expired`, 303);

  const res = NextResponse.redirect(`${origin}/`, 303);
  res.cookies.set(SESSION_COOKIE, sessionToken(email), {
    httpOnly: true,
    secure: origin.startsWith("https:"),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  return res;
}
