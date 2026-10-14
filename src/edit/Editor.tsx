"use client";

import "./editor.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { readPath } from "@/content";
import { PUBLIC_SITE } from "./hosts";

/**
 * Click-to-edit for every element tagged data-edit (see src/content). Changes
 * collect here, survive a reload in localStorage, and go to /api/edit/copy as
 * one commit when the owner presses Publish.
 */

type Copy = Record<string, unknown>;
type Note = { tone: "info" | "good" | "bad"; text: string };
type Deploy = { commit: string; state: "pending" | "live" | "failed"; startedAt: number };
type Draft = Record<string, { from: string; to: string }>;
type Change = { key: string; from: string; to: string };
type Confirm = { kind: "publish"; changes: Change[] } | { kind: "exit" };

const DRAFT_KEY = "rh-edit-draft";
const tidy = (s: string) => s.replace(/\s+/g, " ").trim();
const tagged = (key?: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(key ? `[data-edit="${CSS.escape(key)}"]` : "[data-edit]"));
const editableOf = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLElement>("[data-edit]") : null);
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
const clip = (s: string, n = 140) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
/** What we tell people a publish takes to reach the live site (Vercel build + deploy). */
const LIVE_SECONDS = 120;

function loadDraft(): Draft {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}") as Draft;
  } catch {
    return {};
  }
}
function saveDraft(d: Draft) {
  try {
    if (Object.keys(d).length) localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

/** "plaintext-only" keeps pasted formatting out; older Firefox only knows "true". */
function editMode() {
  try {
    const d = document.createElement("div");
    d.contentEditable = "plaintext-only";
    return d.contentEditable === "plaintext-only" ? "plaintext-only" : "true";
  } catch {
    return "true";
  }
}

/** Centred over a dimmed page — sign-in, the publish warning, and exit. */
function Dialog({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center overflow-y-auto bg-ink/80 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="edit-dialog-title" className="plate plate-cut rivets w-full max-w-[480px] p-7 sm:p-9">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-red" aria-hidden="true" />
        <h2 id="edit-dialog-title" className="display display-sm text-chrome">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

/** `onClose` leaves edit mode (EditGate reloads the page fresh, without the editor). */
export function Editor({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(false);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const [deploy, setDeploy] = useState<Deploy | null>(null);
  const [addr, setAddr] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const base = useRef<Copy | null>(null);
  const pending = useRef(new Map<string, string>());
  const conflicts = useRef(new Set<string>());
  const before = useRef("");

  /** Make every tagged element show the newest text: unpublished change, else what's on GitHub. */
  const paint = useCallback(() => {
    if (!base.current) return;
    for (const el of tagged()) {
      const key = el.dataset.edit!;
      const want = pending.current.get(key) ?? readPath(base.current, key);
      if (want !== undefined && el !== document.activeElement && el.textContent !== want) el.textContent = want;
      el.toggleAttribute("data-changed", pending.current.has(key));
      el.toggleAttribute("data-conflict", conflicts.current.has(key));
    }
  }, []);

  const remember = useCallback(() => {
    setCount(pending.current.size);
    const d: Draft = {};
    for (const [k, to] of pending.current) d[k] = { from: readPath(base.current, k) ?? "", to };
    saveDraft(d);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.dataset.editor = "";
    const url = new URL(location.href);
    if (url.searchParams.get("signin") === "expired") {
      setNote({ tone: "bad", text: "That sign-in link has expired. Send yourself a new one." });
      url.searchParams.delete("signin");
      history.replaceState(null, "", url);
    }
    fetch("/api/edit/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { email?: string | null }) => setEmail(j.email ?? null))
      .catch(() => setEmail(null));
    return () => {
      delete html.dataset.editor;
    };
  }, []);

  // Signed in: load the text as it is on GitHub now, which can be newer than this build.
  useEffect(() => {
    if (!email) return;
    let live = true;
    fetch("/api/edit/copy", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) return setEmail(null);
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as { copy: Copy };
        if (!live) return;
        base.current = j.copy;
        // Changes left unpublished last time come back — unless that text has since changed.
        for (const [k, d] of Object.entries(loadDraft())) {
          if (readPath(j.copy, k) === d.from && d.to !== d.from) pending.current.set(k, d.to);
        }
        remember();
        setReady(true);
        if (pending.current.size) {
          setNote({ tone: "info", text: `${plural(pending.current.size, "change")} you hadn’t published yet ${pending.current.size === 1 ? "is" : "are"} back, outlined in gold.` });
        }
      })
      .catch(() => setNote({ tone: "bad", text: "Couldn’t load the site text. Reload the page to try again." }));
    return () => {
      live = false;
    };
  }, [email, remember]);

  const editing = Boolean(email) && ready && !preview;

  useEffect(() => {
    if (!editing) return;
    const html = document.documentElement;
    const mode = editMode();
    html.dataset.editing = "";

    const arm = () => {
      for (const el of tagged()) {
        if (el.contentEditable !== mode) {
          el.contentEditable = mode;
          el.spellcheck = true;
        }
      }
      paint();
    };
    arm();
    // Client-side page changes and the mobile menu bring in new tagged elements.
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(arm);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const onInput = (e: Event) => {
      const el = editableOf(e.target);
      if (!el) return;
      const key = el.dataset.edit!;
      const value = tidy(el.textContent ?? "");
      if (value === readPath(base.current, key)) pending.current.delete(key);
      else pending.current.set(key, value);
      conflicts.current.delete(key);
      // The same phrase can appear twice (desktop and mobile menu, the looping ticker).
      for (const twin of tagged(key)) if (twin !== el) twin.textContent = value;
      paint();
      remember();
    };
    const onFocusIn = (e: FocusEvent) => {
      const el = editableOf(e.target);
      if (el) before.current = el.textContent ?? "";
    };
    const onFocusOut = (e: FocusEvent) => {
      const el = editableOf(e.target);
      if (!el) return;
      if (!tidy(el.textContent ?? "")) {
        el.textContent = before.current;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        setNote({ tone: "bad", text: "Text can’t be left empty, so the old wording is back." });
      }
      requestAnimationFrame(paint);
    };
    const onKey = (e: KeyboardEvent) => {
      const el = editableOf(e.target);
      if (!el) return;
      if (e.key === "Enter") {
        e.preventDefault();
        el.blur();
      } else if (e.key === "Escape") {
        el.textContent = before.current;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.blur();
      }
    };
    const onPaste = (e: ClipboardEvent) => {
      if (!editableOf(e.target)) return;
      e.preventDefault();
      document.execCommand("insertText", false, (e.clipboardData?.getData("text/plain") ?? "").replace(/\s+/g, " "));
    };
    const onDrop = (e: DragEvent) => {
      if (editableOf(e.target)) e.preventDefault();
    };
    // Clicking a button's words should put the cursor there, not follow the link.
    const onClick = (e: MouseEvent) => {
      const el = editableOf(e.target);
      if (el?.closest("a, button")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("input", onInput);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("keydown", onKey);
    document.addEventListener("paste", onPaste);
    document.addEventListener("drop", onDrop);
    window.addEventListener("click", onClick, true);
    return () => {
      delete html.dataset.editing;
      mo.disconnect();
      cancelAnimationFrame(raf);
      for (const el of tagged()) {
        el.removeAttribute("contenteditable");
        el.removeAttribute("spellcheck");
      }
      document.removeEventListener("input", onInput);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("drop", onDrop);
      window.removeEventListener("click", onClick, true);
    };
  }, [editing, paint, remember]);

  // Dialogs sit over a dimmed page; keep the page behind them still.
  const dialogOpen = email === null || confirm !== null;
  useEffect(() => {
    if (!dialogOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [dialogOpen]);

  useEffect(() => {
    if (!confirm) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setConfirm(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirm]);

  // The countdown shown while a publish goes live.
  useEffect(() => {
    if (deploy?.state !== "pending") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [deploy]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (pending.current.size) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  // After a publish, watch for Vercel to finish the deploy (about 2 minutes).
  useEffect(() => {
    if (deploy?.state !== "pending") return;
    let tries = 0;
    const t = setInterval(async () => {
      if (++tries > 72) return clearInterval(t);
      const j = (await fetch(`/api/edit/status?commit=${deploy.commit}`, { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null)) as { state?: Deploy["state"] } | null;
      if (j?.state && j.state !== "pending") setDeploy({ ...deploy, state: j.state });
    }, 5000);
    return () => clearInterval(t);
  }, [deploy]);

  async function requestLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    try {
      const r = await fetch("/api/edit/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: addr }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (r.ok) setSent(addr.trim());
      else setNote({ tone: "bad", text: j.error ?? "Couldn’t send the link. Try again." });
    } catch {
      setNote({ tone: "bad", text: "Couldn’t reach the server. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  /** Publish asks first: what's changing, and that the live site needs about 2 minutes. */
  function askPublish() {
    (document.activeElement as HTMLElement | null)?.blur();
    const changes = [...pending.current].map(([key, to]) => ({ key, from: readPath(base.current, key) ?? "", to }));
    if (changes.length) setConfirm({ kind: "publish", changes });
  }

  async function publish(changes: Change[]) {
    if (!changes.length || busy) return;
    setConfirm(null);
    setBusy(true);
    setDeploy(null);
    setNote({ tone: "info", text: "Publishing…" });
    try {
      const r = await fetch("/api/edit/copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ changes }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        error?: string;
        conflicts?: string[];
        copy?: Copy;
        commit?: string | null;
      };
      if (r.status === 401) {
        setReady(false);
        setEmail(null);
        setNote({ tone: "bad", text: "Your sign-in ran out. Sign in again — your changes are saved on this device." });
        return;
      }
      if (j.error === "conflict" && j.copy && j.conflicts) {
        base.current = j.copy;
        for (const k of j.conflicts) {
          pending.current.delete(k);
          conflicts.current.add(k);
        }
        remember();
        paint();
        setNote({
          tone: "bad",
          text: `Nothing was published: someone else changed ${plural(j.conflicts.length, "piece")} of this text after you opened the page. Their newer wording is showing, highlighted in gold — make your change there again, then publish.`,
        });
        return;
      }
      if (!r.ok || !j.copy) {
        setNote({ tone: "bad", text: j.error ?? "Publishing failed. Try again." });
        return;
      }
      base.current = j.copy;
      pending.current.clear();
      conflicts.current.clear();
      remember();
      paint();
      if (j.commit) {
        setDeploy({ commit: j.commit, state: "pending", startedAt: Date.now() });
        setNow(Date.now());
        setNote(null);
      } else {
        setNote({ tone: "good", text: "That’s already the text on the site." });
      }
    } catch {
      setNote({ tone: "bad", text: "Couldn’t reach the server. Nothing was published — try again." });
    } finally {
      setBusy(false);
    }
  }

  function discard() {
    pending.current.clear();
    conflicts.current.clear();
    remember();
    paint();
    setNote(null);
  }

  /** Throw away unpublished text, forget the saved draft, and reload the live page fresh. */
  async function exit(signOut: boolean) {
    pending.current.clear();
    conflicts.current.clear();
    saveDraft({});
    if (signOut) await fetch("/api/edit/session", { method: "DELETE" }).catch(() => null);
    onClose();
  }

  const left = deploy ? Math.max(0, LIVE_SECONDS - Math.floor((now - deploy.startedAt) / 1000)) : 0;
  const status: Note | null =
    note ??
    (deploy?.state === "pending"
      ? {
          tone: "info",
          text: left
            ? `Published. ${PUBLIC_SITE} shows it in about ${clock(left)} — until then it still has the old wording.`
            : `Still updating ${PUBLIC_SITE} — almost there.`,
        }
      : deploy?.state === "live"
        ? { tone: "good", text: `Live now on ${PUBLIC_SITE}.` }
        : deploy?.state === "failed"
          ? { tone: "bad", text: "Your text is saved, but the live site didn’t rebuild. Let Eli know." }
          : null);

  if (email === null) {
    return sent ? (
      <Dialog title="Check your email">
        <p className="copy mt-4">
          We sent a sign-in link to <span className="text-chrome">{sent}</span>. It works for 20 minutes.
        </p>
        <p className="copy mt-3 text-steel-400">
          Not in your inbox after a minute? Look in Spam and mark it “Not spam” so the next one comes straight through.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button type="button" onClick={() => setSent(null)} className="text-[0.9375rem] text-steel-300 underline hover:text-white">
            Use a different email
          </button>
          <button type="button" onClick={onClose} className="text-[0.9375rem] text-steel-400 underline hover:text-white">
            Close
          </button>
        </div>
      </Dialog>
    ) : (
      <Dialog title="Edit this website">
        <form onSubmit={requestLink}>
          <p className="copy mt-3">Enter your email and we’ll send you a link to sign in.</p>
          <label htmlFor="edit-email" className="label mt-7 block">
            Email
          </label>
          <input
            id="edit-email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            placeholder="you@example.com"
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            className="mt-2 min-h-[50px] w-full border border-steel-600 bg-ink px-4 text-[1.0625rem] text-chrome placeholder:text-steel-600 focus:border-red"
          />
          <button type="submit" disabled={busy} className="btn btn-red mt-4 w-full">
            {busy ? "Sending…" : "Email me a sign-in link"}
          </button>
          <button type="button" onClick={onClose} className="mt-5 text-[0.875rem] text-steel-400 underline hover:text-white">
            Close
          </button>
        </form>
        {note && (
          <p aria-live="polite" className={`mt-5 text-[0.9375rem] ${note.tone === "bad" ? "text-[#f5b301]" : "text-steel-300"}`}>
            {note.text}
          </p>
        )}
      </Dialog>
    );
  }

  return (
    <>
    <div
      role="region"
      aria-label="Website text editor"
      className="fixed inset-x-0 bottom-0 z-[90] bg-steel-900/95 text-[0.9375rem] text-steel-300 shadow-[0_-12px_40px_rgba(0,0,0,0.55)] backdrop-blur"
    >
      <div className="h-[3px] bg-red" aria-hidden="true" />
      <div className="wrap flex min-h-[72px] flex-wrap items-center gap-x-5 gap-y-3 py-3">
        {email === undefined || (email && !ready && !note) ? (
          <p>Loading the editor…</p>
        ) : (
          <>
            <div className="min-w-0 flex-1 basis-[260px]">
              <p className="label !text-[0.8125rem] text-chrome">
                {preview ? "Preview" : "Editing"}
                {count > 0 && <span className="ml-3 text-red-hot">{plural(count, "unpublished change")}</span>}
              </p>
              <p className="mt-0.5 truncate text-[0.875rem] text-steel-400">
                {preview ? "This is how the page reads. Nothing is editable until you go back." : "Click any outlined text to change it. Enter when you’re done."}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button type="button" onClick={() => setPreview((p) => !p)} className="btn btn-ghost !min-h-[44px] !px-3 !text-[0.875rem] sm:!px-4">
                {preview ? "Back to editing" : "Preview"}
              </button>
              {count > 0 && (
                <>
                  <button type="button" onClick={discard} disabled={busy} className="btn btn-ghost !min-h-[44px] !px-3 !text-[0.875rem] sm:!px-4">
                    Discard
                  </button>
                  <button type="button" onClick={askPublish} disabled={busy} className="btn btn-red !min-h-[44px] !px-4 !text-[0.9375rem] sm:!px-5">
                    {busy ? "Publishing…" : "Publish"}
                  </button>
                </>
              )}
              <button type="button" onClick={() => setConfirm({ kind: "exit" })} className="btn btn-ghost !min-h-[44px] !px-3 !text-[0.875rem] sm:!px-4">
                Exit
              </button>
            </div>
          </>
        )}
        {status && (
          <p
            aria-live="polite"
            className={`basis-full text-[0.875rem] ${status.tone === "bad" ? "text-[#f5b301]" : status.tone === "good" ? "text-chrome" : "text-steel-300"}`}
          >
            {status.text}
            {deploy?.state === "live" && !note && (
              <>
                {" "}
                <a href={`https://www.${PUBLIC_SITE}/?fresh=${deploy.commit.slice(0, 7)}`} target="_blank" rel="noopener" className="underline hover:text-white">
                  See it
                </a>
              </>
            )}
          </p>
        )}
      </div>
    </div>

    {confirm?.kind === "publish" && (
      <Dialog title={`Publish ${plural(confirm.changes.length, "change")}?`}>
        <ul className="mt-5 max-h-[38vh] space-y-4 overflow-y-auto pr-1">
          {confirm.changes.map((c) => (
            <li key={c.key} className="border-l-2 border-red pl-4 text-[0.9375rem] leading-snug">
              <p className="text-steel-400 line-through decoration-steel-600">{clip(c.from)}</p>
              <p className="mt-1 text-chrome">{clip(c.to)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 border border-[#f5b301]/40 bg-[#f5b301]/10 p-4 text-[0.9375rem] leading-relaxed text-chrome">
          <span className="font-semibold">Give it about 2 minutes.</span> The live site rebuilds after you publish. Until it finishes,
          redhawkfab.com — for visitors and for you — still shows the old wording. This bar counts down and tells you when it’s live.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => publish(confirm.changes)} disabled={busy} className="btn btn-red">
            Publish
          </button>
          <button type="button" onClick={() => setConfirm(null)} className="btn btn-ghost">
            Cancel
          </button>
        </div>
      </Dialog>
    )}

    {confirm?.kind === "exit" && (
      <Dialog title="Exit the editor?">
        {count > 0 && (
          <p className="copy mt-4 text-chrome">
            You have {plural(count, "unpublished change")}. Exiting throws {count === 1 ? "it" : "them"} away.
          </p>
        )}
        {deploy?.state === "pending" && (
          <p className="copy mt-4 text-chrome">
            Your last publish is still going live{left ? ` — about ${clock(left)} left` : ""}. If you exit now, the page may show the old wording until
            then; refresh it after that.
          </p>
        )}
        <p className="copy mt-4 text-steel-400">
          Exiting clears the editor from this browser and reloads the page fresh, the way visitors see it. You stay signed in, so /edit brings you
          straight back.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => exit(false)} className="btn btn-red">
            Exit and clear
          </button>
          <button type="button" onClick={() => setConfirm(null)} className="btn btn-ghost">
            Keep editing
          </button>
        </div>
        <button type="button" onClick={() => exit(true)} className="mt-5 text-[0.875rem] text-steel-400 underline hover:text-white">
          Exit and sign out
        </button>
      </Dialog>
    )}
    </>
  );
}
