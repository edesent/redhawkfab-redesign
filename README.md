# RedHawk Fab — website redesign

A ground-up redesign for **RedHawk Fab**, a welding and fabrication shop in **Port Huron,
Michigan** (their current site is a one-page GoDaddy template at <https://redhawkfab.com>).

Next.js 16 (App Router, Turbopack) + Tailwind v4. 26 static pages: the home page, a
service-area index and 24 town pages. Two API routes power the quote form.

```
npm install
npm run dev      # http://localhost:3000
npm run build
```

Live demo: <https://redhawkfab.elijahdesent.com>

---

## This is a DEMO. It must not be indexed.

The site re-hosts RedHawk Fab's own photos and copy. If Google indexed it, it could outrank
their real site. Two things block it and they move together:

| Where | What |
| --- | --- |
| `src/app/robots.ts` | `Disallow: /` for every agent |
| `src/app/layout.tsx` | `noindex, nofollow` on every page |

Both read `NEXT_PUBLIC_SITE_LIVE`. It lives in `.env.production`, which is gitignored, so **a
deploy with the variable unset stays blocked** (the safe default). **Flip with
`./go-live.sh --live`** and also `vercel env add NEXT_PUBLIC_SITE_LIVE production` (value
`true`). Do not flip until the client has signed off and `redhawkfab.com` points here.

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
| `NEXT_PUBLIC_SITE_URL` | canonical host (demo sub now; `https://redhawkfab.com` at go-live) |

## Go-live checklist

1. Client signs off. 2. Attach `redhawkfab.com` +
`www` to the Vercel project and point DNS (they're on GoDaddy). 4. `NEXT_PUBLIC_SITE_URL`
→ `https://redhawkfab.com`. 5. `./go-live.sh --live` + `vercel env add NEXT_PUBLIC_SITE_LIVE production`.
6. Redirect or noindex the demo host so it isn't indexed instead of the real site.

## What we deliberately do NOT claim

Unknown at build time, so absent from the site: year founded, owner or staff names,
certifications (AWS, ASME, ISO), materials and thicknesses, tolerances, machines and
processes (MIG/TIG/laser/press), shop size, a street address, any named customer, and any
review. All worth adding the moment the client supplies them.

## Files

| Path | Holds |
| --- | --- |
| `src/data/site.ts` | every business fact (phone, hours, address), the gallery order, the industry badges |
| `src/data/areas.ts` | the 24 service-area towns |
| `src/components/*` | one component per section (Nav, Hero, Capabilities, Work, Mission, Industries, Process, Areas, Quote, Footer) |
| `src/app/api/quote/route.ts` | validation, anti-spam, Resend/Slack delivery |
| `src/app/api/quote/upload/route.ts` | Blob client-upload tokens + file-type gate |
| `public/gallery/01–06` | their photos · `07–09` supplied photos · `public/industries/` supplied photos cut 4:3 |
