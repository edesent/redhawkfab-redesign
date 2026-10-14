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
type Deploy = { commit: string; state: "pending" | "live" | "failed" };
type Draft = Record<string, { from: string; to: string }>;

const DRAFT_KEY = "rh-edit-draft";
const tidy = (s: string) => s.replace(/\s+/g, " ").trim();
const tagged = (key?: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(key ? `[data-edit="${CSS.escape(key)}"]` : "[data-edit]"));
const editableOf = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLElement>("[data-edit]") : null);
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

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

export function Editor() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(false);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const [deploy, setDeploy] = useState<Deploy | null>(null);
  const [addr, setAddr] = useState("");
  const [sent, setSent] = useState<string | null>(null);

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

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (pending.current.size) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  // After a publish, watch for Vercel to finish the deploy (about a minute).
  useEffect(() => {
    if (deploy?.state !== "pending") return;
    let tries = 0;
    const t = setInterval(async () => {
      if (++tries > 72) return clearInterval(t);
      const j = (await fetch(`/api/edit/status?commit=${deploy.commit}`, { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null)) as { state?: Deploy["state"] } | null;
      if (j?.state && j.state !== "pending") setDeploy({ commit: deploy.commit, state: j.state });
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

  async function publish() {
    if (!pending.current.size || busy) return;
    (document.activeElement as HTMLElement | null)?.blur();
    setBusy(true);
    setDeploy(null);
    setNote({ tone: "info", text: "Publishing…" });
    const changes = [...pending.current].map(([key, to]) => ({ key, from: readPath(base.current, key) ?? "", to }));
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
        setDeploy({ commit: j.commit, state: "pending" });
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

  async function signOut() {
    await fetch("/api/edit/session", { method: "DELETE" }).catch(() => null);
    setReady(false);
    setEmail(null);
    setNote(null);
  }

  const status: Note | null =
    note ??
    (deploy?.state === "pending"
      ? { tone: "info", text: `Published. ${PUBLIC_SITE} updates in about a minute…` }
      : deploy?.state === "live"
        ? { tone: "good", text: `Your changes are live on ${PUBLIC_SITE}.` }
        : deploy?.state === "failed"
          ? { tone: "bad", text: "Your text is saved, but the live site didn’t rebuild. Let Eli know." }
          : null);

  return (
    <div
      role="region"
      aria-label="Website text editor"
      className="fixed inset-x-0 bottom-0 z-[90] bg-steel-900/95 text-[0.9375rem] text-steel-300 shadow-[0_-12px_40px_rgba(0,0,0,0.55)] backdrop-blur"
    >
      <div className="h-[3px] bg-red" aria-hidden="true" />
      <div className="wrap flex min-h-[72px] flex-wrap items-center gap-x-5 gap-y-3 py-3">
        {email === undefined || (email && !ready && !note) ? (
          <p>Loading the editor…</p>
        ) : !email ? (
          sent ? (
            <>
              <p className="flex-1">
                <span className="font-semibold text-chrome">Check your email.</span> A sign-in link is on its way to {sent}. It works for 20 minutes.
              </p>
              <button type="button" onClick={() => setSent(null)} className="text-steel-400 underline hover:text-white">
                Use a different email
              </button>
            </>
          ) : (
            <form onSubmit={requestLink} className="flex flex-1 flex-wrap items-center gap-3">
              <p className="label !text-[0.8125rem] text-chrome">Edit this website</p>
              <label htmlFor="edit-email" className="sr-only">
                Your email address
              </label>
              <input
                id="edit-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Your email address"
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                className="min-h-[46px] min-w-0 flex-1 basis-[220px] border border-steel-600 bg-ink px-4 text-chrome placeholder:text-steel-400 focus:border-red sm:max-w-[340px]"
              />
              <button type="submit" disabled={busy} className="btn btn-red !min-h-[46px] !px-5 !text-[0.9375rem]">
                {busy ? "Sending…" : "Email me a sign-in link"}
              </button>
            </form>
          )
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
              <button type="button" onClick={() => setPreview((p) => !p)} className="btn btn-ghost !min-h-[44px] !px-4 !text-[0.875rem]">
                {preview ? "Back to editing" : "Preview"}
              </button>
              {count > 0 ? (
                <>
                  <button type="button" onClick={discard} disabled={busy} className="btn btn-ghost !min-h-[44px] !px-4 !text-[0.875rem]">
                    Discard
                  </button>
                  <button type="button" onClick={publish} disabled={busy} className="btn btn-red !min-h-[44px] !px-5 !text-[0.9375rem]">
                    {busy ? "Publishing…" : "Publish"}
                  </button>
                </>
              ) : (
                <button type="button" onClick={signOut} className="px-1 text-[0.875rem] text-steel-400 underline hover:text-white" title={email}>
                  Sign out
                </button>
              )}
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
                <a href={`https://${PUBLIC_SITE}/`} target="_blank" rel="noopener" className="underline hover:text-white">
                  Open it
                </a>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
