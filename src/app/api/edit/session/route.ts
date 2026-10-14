import { cookies } from "next/headers";
import { SESSION_COOKIE, sameOrigin, sessionEmail } from "@/edit/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ email: await sessionEmail() }, { headers: { "cache-control": "no-store" } });
}

/** Sign out. */
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Bad origin." }, { status: 403 });
  (await cookies()).delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
