# RedHawk Fab — website rebuild

A pixel-matched rebuild of <https://redhawkfab.com> (a one-page GoDaddy Website Builder site)
for **RedHawk Fab**, a welding and fabrication shop in **Port Huron, Michigan**.

Next.js 16 (App Router, Turbopack) + Tailwind v4. One static page, two API routes.

```
npm install
npm run dev      # http://localhost:3000
npm run build
```

Live demo: <https://redhawkfab.elijahdesent.com>

---

## This is a DEMO. It must not be indexed.

The site re-hosts RedHawk Fab's own copy and photos. If Google indexed it, it could outrank
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

## What matches the live site, and what deliberately does not

Every dimension was measured off their site in a real browser at 1440, 1024 and 390 wide
(section heights, type sizes, gutters, the 95×68 thumbnails, the 26px hour rows) and the
rebuild lands within a pixel at all three. Fonts are theirs (Lato for the uppercase section
titles, Lusitana for everything else), self-hosted in `src/fonts/`.

Deliberate departures:

- **Photos.** Their six shop photos are the gallery, in their order, at full resolution
  (the phone screenshot is cropped exactly as their site crops it). The hero, the About
  image, the round Contact photo and gallery slides 7–9 are the six welding photographs
  Eli supplied in `output/imagegen/redhawk-welding/` — used at his instruction.
- **The logo is untouched** — their PNG, resized only. It is dark art, so on the dark hero
  it carries a faint white drop-shadow to keep it legible; nothing about the mark changed.
- **Copy fixes:** "percision" → "precision", "products that reflects" → "reflect",
  "a Expectation" → "an Expectation". Everything else is verbatim.
- **Removed:** the GoDaddy "Powered by" badge, the cookie banner (we set no cookies), the
  TrustedSite badge and the GoDaddy chat bubble.
- **"Get Started"** in the hero now scrolls to Contact and opens the quote form (`#quote`).
  On their site it links to the top of the page.
- **Email address** is assembled in the browser after load (`src/components/Email.tsx`) so
  it never sits in the HTML for harvesters. It looks and works exactly like their link.
- **Hours** show "Open today / Closed today" for the real day in Eastern time and unfold
  to the week, bolding today — their widget's behaviour, done honestly.

## The quote form

RedHawk's customers email a PDF print or a CAD file and ask for a price and a lead time.
The form (`src/components/QuoteForm.tsx`) is built for exactly that:

- Name, Email*, Phone, Company, Quantity, Needed by, project description, **Attach Files**
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

See `.env.example`. On the demo project the email goes to Eli; before go-live set
`QUOTE_TO_EMAIL=FabWithRedHawk@gmail.com` (their published address).

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY`, `QUOTE_TO_EMAIL`, `QUOTE_FROM_EMAIL` | the email (from must be on a Resend-verified domain) |
| `BLOB_READ_WRITE_TOKEN` | file uploads (injected when a Blob store is connected to the project) |
| `SLACK_WEBHOOK_URL` | optional second destination |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | optional Turnstile |
| `NEXT_PUBLIC_SITE_URL` | canonical host (demo sub now; `https://redhawkfab.com` at go-live) |

## Go-live checklist

1. Client signs off. 2. `QUOTE_TO_EMAIL` → their address. 3. Attach `redhawkfab.com` +
`www` to the Vercel project and point DNS (they're on GoDaddy). 4. `NEXT_PUBLIC_SITE_URL`
→ `https://redhawkfab.com`. 5. `./go-live.sh --live` + `vercel env add NEXT_PUBLIC_SITE_LIVE production`.
6. Redirect or noindex the demo host so it isn't indexed instead of the real site.

## Files

| Path | Holds |
| --- | --- |
| `src/data/site.ts` | every business fact (phone, hours, address), the gallery order, the industry badges |
| `src/components/*` | one component per section of their page |
| `src/app/api/quote/route.ts` | validation, anti-spam, Resend/Slack delivery |
| `src/app/api/quote/upload/route.ts` | Blob client-upload tokens + file-type gate |
| `public/gallery/01–06` | their photos · `07–09` supplied photos |
