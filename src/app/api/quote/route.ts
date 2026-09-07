import { SITE } from "@/data/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FileRef = { name?: string; size?: number; type?: string; url?: string; data?: string };
type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  quantity?: string;
  neededBy?: string;
  message?: string;
  /** honeypot — real people never fill this in */
  website?: string;
  /** ms since the form mounted */
  elapsed?: number;
  turnstile?: string;
  files?: FileRef[];
};

const clean = (v: unknown, max = 2000) =>
  typeof v === "string" ? v.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim().slice(0, max) : "";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BLOB_HOST_RE = /\.blob\.vercel-storage\.com$/;
/** Resend allows 40 MB per message; leave headroom for the encoding. */
const ATTACH_BUDGET = 22 * 1024 * 1024;
const ATTACH_MAX_EACH = 15 * 1024 * 1024;
const fmt = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

// Best-effort per-instance rate limit: 5 requests / 10 min / IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 5;
}

async function turnstileOk(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not enabled
  if (!token) return false;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const j = (await r.json()) as { success?: boolean };
    return Boolean(j.success);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return Response.json({ ok: false, error: "Too many requests — please try again in a few minutes." }, { status: 429 });
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
  }

  // Bot gates. Silent successes so a scraper learns nothing.
  if (clean(body.website)) return Response.json({ ok: true });
  if (typeof body.elapsed !== "number" || body.elapsed < 3000) return Response.json({ ok: true });
  if (!(await turnstileOk(body.turnstile, ip))) {
    return Response.json({ ok: false, error: "Please complete the verification and try again." }, { status: 400 });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 40);
  const company = clean(body.company, 120);
  const quantity = clean(body.quantity, 60);
  const neededBy = clean(body.neededBy, 120);
  const message = clean(body.message, 5000);

  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 422 });
  }
  // Link-stuffed messages are spam every time.
  if ((message.match(/https?:\/\//g) ?? []).length > 2) return Response.json({ ok: true });

  // Files: Blob URLs from our own store, or small inline fallbacks.
  const files: { name: string; size: number; type: string; url?: string; data?: string }[] = [];
  for (const f of (body.files ?? []).slice(0, 6)) {
    const fname = clean(f.name, 200).replace(/[\\/]/g, "_") || "attachment";
    const size = typeof f.size === "number" && f.size >= 0 ? f.size : 0;
    const type = clean(f.type, 100) || "application/octet-stream";
    if (f.url) {
      let u: URL;
      try { u = new URL(f.url); } catch { continue; }
      if (u.protocol !== "https:" || !BLOB_HOST_RE.test(u.hostname)) continue;
      files.push({ name: fname, size, type, url: u.toString() });
    } else if (typeof f.data === "string" && f.data.length <= 4.2 * 1024 * 1024) {
      files.push({ name: fname, size: Math.round(f.data.length * 0.75), type, data: f.data });
    }
  }

  if (!message && files.length === 0) {
    return Response.json({ ok: false, error: "Tell us a little about the project, or attach a print." }, { status: 422 });
  }

  const who = name || email;
  const lines = [
    `New quote request — ${SITE.name} website`,
    ``,
    `Name: ${name || "—"}`,
    company ? `Company: ${company}` : null,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    quantity ? `Quantity: ${quantity}` : null,
    neededBy ? `Needed by: ${neededBy}` : null,
    ``,
    `Project:`,
    message || "(no description — see attached files)",
    ``,
    files.length ? `Files (${files.length}):` : `Files: none`,
    ...files.map((f) => ` - ${f.name} (${fmt(f.size)})${f.url ? ` — ${f.url}` : " — attached"}`),
    ``,
    `Sent from the quote form · ${new Date().toLocaleString("en-US", { timeZone: SITE.timeZone })} ET · IP ${ip}`,
  ].filter((l): l is string => l !== null);
  const text = lines.join("\n");

  // Attachments: Resend fetches remote files itself (`path`), inline ones go as base64.
  const attachments: ({ filename: string; path: string } | { filename: string; content: string })[] = [];
  let budget = ATTACH_BUDGET;
  for (const f of files) {
    if (f.size > ATTACH_MAX_EACH || f.size > budget) continue;
    budget -= f.size;
    attachments.push(f.url ? { filename: f.name, path: f.url } : { filename: f.name, content: f.data! });
  }
  const skipped = files.filter((f) => !attachments.some((a) => a.filename === f.name));

  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL;
  const from = process.env.QUOTE_FROM_EMAIL;
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const destinations: Promise<boolean>[] = [];

  if (resendKey && to && from) {
    destinations.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${resendKey}`, "content-type": "application/json" },
        body: JSON.stringify({
          from,
          to: to.split(",").map((s) => s.trim()).filter(Boolean),
          reply_to: email,
          subject: `Quote request — ${who}${company ? ` (${company})` : ""}${files.length ? ` · ${files.length} file${files.length > 1 ? "s" : ""}` : ""}`,
          text:
            text +
            (skipped.length
              ? `\n\nToo large to attach (use the links above): ${skipped.map((f) => f.name).join(", ")}`
              : ""),
          attachments,
        }),
      })
        .then(async (r) => {
          if (!r.ok) console.error("resend", r.status, await r.text().catch(() => ""));
          return r.ok;
        })
        .catch((e) => (console.error("resend", e), false)),
    );
  }

  if (slackUrl) {
    destinations.push(
      fetch(slackUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "*" + lines[0] + "*\n" + lines.slice(2).join("\n") }),
      })
        .then((r) => r.ok)
        .catch(() => false),
    );
  }

  // Never tell somebody their request went through when there was nowhere to send it.
  if (destinations.length === 0) {
    return Response.json(
      { ok: false, error: `This form isn't connected yet — please email ${SITE.emailUser}@${SITE.emailDomain} or call ${SITE.phoneDisplay}.` },
      { status: 503 },
    );
  }
  const results = await Promise.all(destinations);
  if (!results.some(Boolean)) {
    return Response.json(
      { ok: false, error: `We couldn't get that through — please email ${SITE.emailUser}@${SITE.emailDomain} or call ${SITE.phoneDisplay}.` },
      { status: 502 },
    );
  }
  return Response.json({ ok: true });
}
