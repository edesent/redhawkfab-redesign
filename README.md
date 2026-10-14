# RedHawk Fab — website redesign

A ground-up redesign for **RedHawk Fab**, a welding and fabrication shop in **Port Huron,
Michigan**. It replaced their one-page GoDaddy template and is **live at
<https://www.redhawkfab.com>**.

Next.js 16 (App Router, Turbopack) + Tailwind v4. 26 static pages: the home page, a
service-area index and 24 town pages. Two API routes power the quote form.

```
npm install
npm run dev      # http://localhost:3000
npm run build
```

Owner text editor: <https://www.redhawkfab.com/edit> (see below).

---

## Live and indexable (since 2026-10-14)

Production has `NEXT_PUBLIC_SITE_LIVE=true` and `NEXT_PUBLIC_SITE_URL=https://www.redhawkfab.com`
(the apex 308s to `www`, so canonical, sitemap and schema use `www`). Both are inlined at build,
so changing either needs a redeploy. Without the flag, a build is blocked from search:

| Where | What |
| --- | --- |
| `src/app/robots.ts` | `Disallow: /` for every agent |
| `src/app/layout.tsx` | `noindex, nofollow` on every page |

Preview deploys do not set the flag, so they stay blocked. The old demo host
`redhawkfab.elijahdesent.com` and the `.vercel.app` URL redirect to `www.redhawkfab.com`.
`./go-live.sh` only sets `.env.production` for local builds.

---

## The design

Everything comes off their logo: a gunmetal eagle over a steel shield with chrome bevel
highlights, and the one word in the name that is a colour.

- **Palette** (`globals.css` `@theme`): ink `#0b0c0e`, steel panels `#12141a`–`#262a31`,
  chrome `#e9ebee`, red `#d8262c` / hot `#ff4a3d`. Dark because *their brand is dark*.
- **Type:** Barlow Condensed 800/900 uppercase for display, Barlow for reading. Self-hosted
  in `src/fonts/` (next/font/google can fail the Vercel build).
- **Motifs:** `.plate` brushed-steel panels with cut corners and rivets, a red/black
  `.hazard` stripe between bands, a blueprint `.grid-bg` under the process, the `.chrome`
  bevel gradient on headline words, and a capability ticker under the hero.
- **The logo is their PNG, untouched in shape.** `public/logo-lift.png` is a levels-lifted
  copy (their original averages 18% luminance — invisible on a dark ground);
  `logo-mark.png` and `logo-wordmark.png` are crops of it for the nav and footer.
- **Photos.** Their six shop photos are the Work grid (slides 1–6, their order). The six
  welding photographs Eli supplied in `output/imagegen/redhawk-welding/` — used at his
  instruction — are the hero, the mission portrait, the six Industries tiles
  (`public/industries/`), the area-page banners and Work slides 7–9.
- **Copy** is theirs where they had any (mission statement verbatim, typos fixed). Capability
  and process copy is written to describe a welding/fab shop generically — it claims no
  certification, material, tolerance or customer. See "not claimed" below.

## Pages

| Route | What |
| --- | --- |
| `/` | Hero · Capabilities · Work (lightbox) · Mission · Industries · Process · Areas · Quote |
| `/service-areas` | Index of 24 towns grouped by county with approximate miles from the shop |
| `/service-areas/[slug]` | One page per town: hero, capabilities, industries, quote form (tagged with the town), nearby towns |

Towns live in `src/data/areas.ts`. Distances are approximate road miles from Port Huron,
rounded; `note` describes the town, never a job we did there.

## Reviews — none exist yet

Searched 2026-09-07: Brave, Google Places (both APIs), Facebook, Yelp and general web. RedHawk
Fab has **no Google Business listing, no Facebook page and no third-party reviews anywhere**.
Nothing was fabricated. When they get real reviews, add a section — a Google Business profile
is the obvious first step and would also fix their map presence.

## The quote form

RedHawk's customers email a PDF print or a CAD file and ask for a price and a lead time.
The form (`src/components/QuoteForm.tsx`) is built for exactly that:

- Name, Email*, Phone, Company, Quantity, Needed by, project description, **Attach Files**
  (plus a hidden `area` field on town pages, so the email says which page it came from)
  (PDF, DWG, DXF, DWF, STEP/STP, IGES, SolidWorks, Parasolid, SAT, Inventor, CATIA, 3DM,
  STL, OBJ, images, ZIP, Office files — 6 files, 50 MB each).
- Files go **straight from the browser to Vercel Blob** (`/api/quote/upload` issues the
  client token), which is how a 40 MB STEP file gets past the 4.5 MB body cap on a Vercel
  function. They land under `quotes/` with a random suffix, so URLs are unguessable.
  If no Blob store is configured, files under ~3 MB total ride inline instead.
- `/api/quote` then sends **one email via Resend** with the details, every file attached
  (up to ~22 MB per message — Resend's cap is 40) and a download link for each file, so
  oversized files are never lost. Reply-to is the customer. Optionally also posts to Slack.
- **Anti-spam:** honeypot field, a 3-second minimum fill time, a link-count check, a
  per-IP rate limit (5 / 10 min), and optional **Cloudflare Turnstile**
  (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`). Bots get a silent "ok".
- The form **never fakes success.** With nothing configured it returns 503 and shows the
  phone and email instead; if every destination fails it returns 502.

### Environment

See `.env.example`. Quote requests go to their published address,
`QUOTE_TO_EMAIL=FabWithRedHawk@gmail.com`.

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY`, `QUOTE_TO_EMAIL`, `QUOTE_FROM_EMAIL` | the email (from must be on a Resend-verified domain) |
| `BLOB_READ_WRITE_TOKEN` | file uploads (injected when a Blob store is connected to the project) |
| `SLACK_WEBHOOK_URL` | optional second destination |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | optional Turnstile |
| `NEXT_PUBLIC_SITE_URL` | canonical host, `https://www.redhawkfab.com` |

## Editing the text (www.redhawkfab.com/edit)

**Every phrase on the page lives in `src/content/copy.json`.** Change wording there, not in a
component. Components render it with `{...text("hero.lede")}` (`src/content/index.ts`), which
also tags the element `data-edit="hero.lede"`; a tagged element holds that one phrase only.

The owner edits it themselves at **<https://www.redhawkfab.com/edit>**. `/edit` is the home page,
and `src/edit/EditGate.tsx` loads `src/edit/Editor.tsx` there. Editing then stays on for the rest of
that tab (sessionStorage), so other pages can be edited too, until they press Close. Visitors who
never open `/edit` never download the editor:

1. They enter their email, and a sign-in link arrives (Resend, 20 minutes). Only addresses in
   `EDIT_EMAILS` get one, and only from `www.redhawkfab.com` (`src/edit/hosts.ts`). The session
   is a signed HttpOnly cookie scoped to `/api/edit`, good for 30 days, so no database is
   involved.
2. Every editable phrase gets a dashed outline. They click it, type, and press Enter.
   Unpublished changes are kept in localStorage if the tab closes.
3. **Publish** commits `copy.json` to `main` through the GitHub API (`src/edit/github.ts`), and
   Vercel deploys it. The bar watches the commit's `Vercel` status and says when it's live.

Each change carries the text it replaced. If that phrase changed on `main` since the page
loaded (from ChatGPT or a push), nothing is saved, and the newer wording is shown in gold.
`/edit` is noindex (page metadata plus an `X-Robots-Tag` header in `next.config.ts`). Phone, email, hours, the gallery
and the per-town area wording are not editable there; they stay in `src/data/`.

| Env (Production) | |
| --- | --- |
| `EDIT_EMAILS` | who can sign in, comma separated |
| `EDIT_SECRET` | signs links and sessions (32+ chars). Rotating it signs everyone out |
| `EDIT_GITHUB_TOKEN` | contents:write on this repo. A fine-grained token scoped to this repo is best |
| `EDIT_FROM_EMAIL` | optional; defaults to `QUOTE_FROM_EMAIL` |

`edit.redhawkfab.com` is attached to the Vercel project but has no DNS. If a CNAME is ever added,
`next.config.ts` forwards it to `/edit`.

## What we deliberately do NOT claim

Unknown at build time, so absent from the site: year founded, owner or staff names,
certifications (AWS, ASME, ISO), materials and thicknesses, tolerances, machines and
processes (MIG/TIG/laser/press), shop size, a street address, any named customer, and any
review. All worth adding the moment the client supplies them.

## Files

| Path | Holds |
| --- | --- |
| `src/content/copy.json` | every phrase on the page; the owner's text editor commits this file |
| `src/data/site.ts` | every business fact (phone, hours, address) and the gallery order |
| `src/data/areas.ts` | the 24 service-area towns |
| `src/components/*` | one component per section (Nav, Hero, Capabilities, Work, Mission, Industries, Process, Areas, Quote, Footer) |
| `src/app/api/quote/route.ts` | validation, anti-spam, Resend/Slack delivery |
| `src/app/api/quote/upload/route.ts` | Blob client-upload tokens + file-type gate |
| `public/gallery/01–06` | their photos · `07–09` supplied photos · `public/industries/` supplied photos cut 4:3 |
