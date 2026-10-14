/**
 * Reads and commits src/content/copy.json through the GitHub contents API.
 * Vercel deploys main on every commit, so a commit here is a publish.
 */

const REPO = process.env.EDIT_REPO ?? "edesent/redhawkfab-redesign";
const BRANCH = process.env.EDIT_BRANCH ?? "main";
const FILE = "src/content/copy.json";

async function gh(path: string, init: RequestInit = {}) {
  const token = process.env.EDIT_GITHUB_TOKEN;
  if (!token) throw new Error("EDIT_GITHUB_TOKEN is not set.");
  return fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "redhawkfab-text-editor",
      ...init.headers,
    },
  });
}

/** The copy as it is on the branch right now, not as it was at the last build. */
export async function readCopy(): Promise<{ copy: Record<string, unknown>; sha: string }> {
  const r = await gh(`/contents/${FILE}?ref=${BRANCH}`);
  if (!r.ok) throw new Error(`GitHub read failed (${r.status})`);
  const j = (await r.json()) as { content: string; sha: string };
  return { copy: JSON.parse(Buffer.from(j.content, "base64").toString("utf8")), sha: j.sha };
}

/** Returns null when the file changed underneath us (sha mismatch) — read again and retry. */
export async function writeCopy(copy: unknown, sha: string, message: string) {
  const r = await gh(`/contents/${FILE}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(copy, null, 2) + "\n").toString("base64"),
      sha,
      branch: BRANCH,
    }),
  });
  if (r.status === 409 || r.status === 422) return null;
  if (!r.ok) throw new Error(`GitHub commit failed (${r.status}): ${(await r.text()).slice(0, 300)}`);
  const j = (await r.json()) as { content: { sha: string }; commit: { sha: string; html_url: string } };
  return { fileSha: j.content.sha, commit: j.commit.sha, url: j.commit.html_url };
}

/** Vercel reports each commit's deploy back to GitHub as the "Vercel" status. */
export async function deployState(commit: string): Promise<"pending" | "live" | "failed"> {
  const r = await gh(`/commits/${commit}/status`);
  if (!r.ok) return "pending";
  const j = (await r.json()) as { statuses: { context: string; state: string }[] };
  const s = j.statuses.find((x) => x.context === "Vercel")?.state;
  return s === "success" ? "live" : s === "failure" || s === "error" ? "failed" : "pending";
}
