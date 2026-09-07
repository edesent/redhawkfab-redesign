"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { SITE } from "@/data/site";

/** Kept in lock-step with src/app/api/quote/upload/route.ts */
export const ACCEPTED_EXT = [
  "pdf", "dwg", "dxf", "dwf", "step", "stp", "igs", "iges", "sldprt", "sldasm", "slddrw",
  "x_t", "x_b", "sat", "ipt", "iam", "prt", "catpart", "3dm", "stl", "obj",
  "png", "jpg", "jpeg", "heic", "tif", "tiff", "zip", "xlsx", "xls", "csv", "doc", "docx",
];
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_FILES = 6;
/** Vercel caps a function request at 4.5 MB; inline fallback stays well under it. */
const INLINE_LIMIT = 3 * 1024 * 1024;

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; done: number; total: number; pct: number }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

const fmt = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const ext = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

export function QuoteForm({ area }: { area?: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fileError, setFileError] = useState<string | null>(null);
  const mounted = useRef(Date.now());
  const fileInput = useRef<HTMLInputElement>(null);
  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const tsRef = useRef<HTMLDivElement>(null);
  const tsToken = useRef<string>("");

  // Optional Cloudflare Turnstile — only when a site key is configured.
  useEffect(() => {
    if (!turnstileKey || !tsRef.current) return;
    const render = () => {
      if (!window.turnstile || !tsRef.current) return;
      window.turnstile.render(tsRef.current, {
        sitekey: turnstileKey,
        theme: "light",
        callback: (t: string) => (tsToken.current = t),
        "expired-callback": () => (tsToken.current = ""),
      });
    };
    if (window.turnstile) render();
    else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = render;
      document.head.appendChild(s);
    }
  }, [turnstileKey]);

  const totalBytes = useMemo(() => files.reduce((a, f) => a + f.size, 0), [files]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    const problems: string[] = [];
    for (const f of Array.from(list)) {
      if (!ACCEPTED_EXT.includes(ext(f.name))) { problems.push(`${f.name}: file type not accepted`); continue; }
      if (f.size > MAX_FILE_BYTES) { problems.push(`${f.name}: over 50 MB`); continue; }
      if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
      if (next.length >= MAX_FILES) { problems.push(`Up to ${MAX_FILES} files per request`); break; }
      next.push(f);
    }
    setFiles(next);
    setFileError(problems.length ? problems.join(" · ") : null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const email = get("email");
    if (!email) { setStatus({ kind: "error", message: "Please enter your email so we can send the quote back." }); return; }
    if (!get("message") && files.length === 0) {
      setStatus({ kind: "error", message: "Tell us a little about the project, or attach a print." });
      return;
    }

    // 1) Files: straight to Blob storage from the browser (no 4.5 MB ceiling).
    //    If uploads aren't configured yet, small files ride along inline.
    const refs: { name: string; size: number; type: string; url?: string; data?: string }[] = [];
    try {
      let done = 0;
      for (const f of files) {
        setStatus({ kind: "uploading", done, total: files.length, pct: 0 });
        try {
          const blob = await upload(`quotes/${f.name.replace(/[^\w.\-() ]+/g, "_")}`, f, {
            access: "public",
            handleUploadUrl: "/api/quote/upload",
            multipart: f.size > 8 * 1024 * 1024,
            onUploadProgress: (p) => setStatus({ kind: "uploading", done, total: files.length, pct: p.percentage }),
          });
          refs.push({ name: f.name, size: f.size, type: f.type || "application/octet-stream", url: blob.url });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!/uploads-not-configured|503/.test(msg) || totalBytes > INLINE_LIMIT) throw err;
          const buf = await f.arrayBuffer();
          let bin = "";
          const bytes = new Uint8Array(buf);
          for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
          refs.push({ name: f.name, size: f.size, type: f.type || "application/octet-stream", data: btoa(bin) });
        }
        done += 1;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setStatus({
        kind: "error",
        message: /not accepted|type/i.test(msg)
          ? "One of those files isn't a type we can accept. PDF, DWG, DXF, STEP or a ZIP works best."
          : `We couldn't upload that file. Please email it to ${SITE.emailUser}@${SITE.emailDomain} instead.`,
      });
      return;
    }

    // 2) The request itself.
    setStatus({ kind: "sending" });
    try {
      const r = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: get("name"),
          email,
          phone: get("phone"),
          company: get("company"),
          quantity: get("quantity"),
          neededBy: get("neededBy"),
          message: get("message"),
          area: get("area"),
          website: get("website"), // honeypot
          elapsed: Date.now() - mounted.current,
          turnstile: tsToken.current || undefined,
          files: refs,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) throw new Error(j.error || "send-failed");
      setStatus({ kind: "sent" });
      form.reset();
      setFiles([]);
    } catch (err) {
      const msg = err instanceof Error && err.message !== "send-failed" ? err.message : null;
      setStatus({
        kind: "error",
        message: msg ?? `We couldn't send that just now. Please call ${SITE.phoneDisplay} or email ${SITE.emailUser}@${SITE.emailDomain}.`,
      });
      if (window.turnstile) window.turnstile.reset();
    }
  }

  const busy = status.kind === "uploading" || status.kind === "sending";

  if (status.kind === "sent") {
    return (
      <div role="status" className="py-6">
        <p className="label text-red">Received</p>
        <h3 className="display display-md mt-3">Thank you.</h3>
        <p className="lede mt-5 max-w-[48ch]">
          We have your request and your files. We&rsquo;ll look it over and get back to you with a quote and a lead time.
          Need it sooner? Call{" "}
          <a href={`tel:${SITE.phoneE164}`} className="text-chrome underline decoration-red underline-offset-4">{SITE.phoneDisplay}</a>.
        </p>
        <button type="button" onClick={() => setStatus({ kind: "idle" })} className="btn btn-ghost mt-8">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={busy}>
      <h3 className="display display-sm">Quote request</h3>
      <p className="copy mt-2 mb-8 text-steel-400">
        Attach the print (PDF) or CAD file and tell us when you need it. Email is the only required field.
      </p>
      {area && <input type="hidden" name="area" value={area} />}

      <div className="flex flex-col gap-5">
        <div className="field">
          <input id="q-name" name="name" type="text" autoComplete="name" placeholder=" " className="field-input" />
          <label htmlFor="q-name" className="field-label">Name</label>
        </div>
        <div className="field">
          <input id="q-email" name="email" type="email" autoComplete="email" required placeholder=" " className="field-input" />
          <label htmlFor="q-email" className="field-label">Email*</label>
        </div>
        <div className="field">
          <input id="q-phone" name="phone" type="tel" autoComplete="tel" placeholder=" " className="field-input" />
          <label htmlFor="q-phone" className="field-label">Phone</label>
        </div>
        <div className="field">
          <input id="q-company" name="company" type="text" autoComplete="organization" placeholder=" " className="field-input" />
          <label htmlFor="q-company" className="field-label">Company</label>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="field">
            <input id="q-qty" name="quantity" type="text" inputMode="numeric" placeholder=" " className="field-input" />
            <label htmlFor="q-qty" className="field-label">Quantity</label>
          </div>
          <div className="field">
            <input id="q-need" name="neededBy" type="text" placeholder=" " className="field-input" />
            <label htmlFor="q-need" className="field-label">Needed by</label>
          </div>
        </div>
        <textarea id="q-msg" name="message" rows={4} placeholder="Tell us about your project." aria-label="Tell us about your project" className="field-area" />

        {/* Honeypot — real people never see or fill this. */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="q-website">Website</label>
          <input id="q-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex items-center gap-2 text-[1rem] font-medium text-chrome hover:text-red-hot"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            Attach Files
          </button>
          <span className="label">Attachments ({files.length})</span>
          <input
            ref={fileInput}
            type="file"
            multiple
            className="sr-only"
            accept={ACCEPTED_EXT.map((e) => `.${e}`).join(",")}
            onChange={(e) => addFiles(e.target.files)}
            aria-label="Attach prints or CAD files"
          />
        </div>

        {files.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {files.map((f) => (
              <li key={`${f.name}-${f.size}`} className="flex items-center justify-between gap-3 border-b border-steel-700 pb-2 text-[0.9375rem] leading-5 text-steel-300">
                <span className="truncate">
                  {f.name} <span className="text-steel-400">({fmt(f.size)})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((x) => x !== f))}
                  aria-label={`Remove ${f.name}`}
                  className="label shrink-0 !text-[0.6875rem] text-steel-400 hover:text-red-hot"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        {fileError && <p className="mt-3 text-[0.9375rem] text-red-hot" role="alert">{fileError}</p>}
      </div>

      <p className="mt-8 text-[0.875rem] leading-relaxed text-steel-400">
        Prints and CAD files up to 50 MB each — PDF, DWG, DXF, STEP, IGES, SolidWorks, or a ZIP.
      </p>

      {turnstileKey && <div ref={tsRef} className="mt-6" />}

      {status.kind === "error" && (
        <p className="mt-6 border border-red/60 bg-red/10 px-4 py-3 text-[0.9375rem] leading-6 text-chrome" role="alert">
          {status.message}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <button type="submit" className="btn btn-red" disabled={busy}>
          {status.kind === "uploading"
            ? `Uploading ${status.done + 1}/${status.total}… ${status.pct}%`
            : status.kind === "sending"
              ? "Sending…"
              : "Send for a quote"}
        </button>
        <p className="text-[0.875rem] text-steel-400">We reply with a price and a lead time.</p>
      </div>
    </form>
  );
}
