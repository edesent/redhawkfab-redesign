import { readPath } from "@/content";
import { sameOrigin, sessionEmail } from "@/edit/auth";
import { readCopy, writeCopy } from "@/edit/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Change = { key: string; from: string; to: string };

const MAX_LEN = 800;
const KEY_RE = /^[A-Za-z]+(\.(?:[A-Za-z]+|\d{1,3}))*$/;
/** One line of plain text, the way it renders. */
const tidy = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
const clip = (s: string, n = 160) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function setPath(root: unknown, path: string, value: string) {
  const parts = path.split(".");
  let node = root as Record<string, unknown>;
  for (const p of parts.slice(0, -1)) node = node[p] as Record<string, unknown>;
  node[parts.at(-1)!] = value;
}

const noStore = { "cache-control": "no-store" };

/** The live copy.json from GitHub — newer than the deployed page right after a publish. */
export async function GET() {
  if (!(await sessionEmail())) return Response.json({ error: "Sign in again." }, { status: 401 });
  try {
    return Response.json(await readCopy(), { headers: noStore });
  } catch (e) {
    console.error("edit read", e);
    return Response.json({ error: "Couldn’t load the site text. Try again in a minute." }, { status: 502 });
  }
}

/**
 * Publish: apply the changed phrases to the newest copy.json and commit it.
 * Every change says what the text was when the page loaded; if someone else
 * (ChatGPT, Eli) has changed that phrase since, nothing is saved and the newer
 * text comes back so the editor can show it.
 */
export async function POST(req: Request) {
  const email = await sessionEmail();
  if (!email) return Response.json({ error: "Your sign-in ran out. Sign in again to publish." }, { status: 401 });
  if (!sameOrigin(req)) return Response.json({ error: "Bad origin." }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { changes?: unknown } | null;
  const raw = Array.isArray(body?.changes) ? body.changes : [];
  const changes: Change[] = [];
  for (const c of raw.slice(0, 300) as Partial<Change>[]) {
    if (typeof c?.key !== "string" || !KEY_RE.test(c.key) || typeof c.from !== "string" || typeof c.to !== "string") {
      return Response.json({ error: "That change couldn’t be read." }, { status: 400 });
    }
    const to = tidy(c.to);
    if (!to) return Response.json({ error: "Text can’t be left empty.", key: c.key }, { status: 400 });
    if (to.length > MAX_LEN) return Response.json({ error: `Keep each piece of text under ${MAX_LEN} characters.`, key: c.key }, { status: 400 });
    changes.push({ key: c.key, from: tidy(c.from), to });
  }
  if (!changes.length) return Response.json({ error: "Nothing to publish." }, { status: 400 });

  try {
    // Two tries: a commit can land between our read and our write.
    for (let attempt = 0; attempt < 2; attempt++) {
      const { copy, sha } = await readCopy();
      const conflicts: string[] = [];
      const applied: Change[] = [];
      for (const c of changes) {
        const now = readPath(copy, c.key);
        if (now === undefined) conflicts.push(c.key);
        else if (now === c.to) continue;
        else if (tidy(now) !== c.from) conflicts.push(c.key);
        else applied.push({ ...c, from: now });
      }
      if (conflicts.length) return Response.json({ error: "conflict", conflicts, copy, sha }, { status: 409 });
      if (!applied.length) return Response.json({ ok: true, commit: null, copy, sha });

      for (const c of applied) setPath(copy, c.key, c.to);
      const subject =
        applied.length === 1
          ? `Edit site text: ${applied[0].key}`
          : `Edit site text: ${applied.length} changes (${applied.slice(0, 3).map((c) => c.key).join(", ")}${applied.length > 3 ? ", …" : ""})`;
      const lines = applied.map((c) => `${c.key}\n  was: ${clip(c.from)}\n  now: ${clip(c.to)}`);
      const host = req.headers.get("host");
      const message = `${subject}\n\n${lines.join("\n\n")}\n\nEdited by ${email} on ${host}.`;

      const done = await writeCopy(copy, sha, message);
      if (done) return Response.json({ ok: true, commit: done.commit, url: done.url, copy, sha: done.fileSha });
    }
    return Response.json({ error: "The site changed while saving. Publish again." }, { status: 409 });
  } catch (e) {
    console.error("edit publish", e);
    return Response.json({ error: "Publishing failed — nothing was changed. Try again in a minute." }, { status: 502 });
  }
}
