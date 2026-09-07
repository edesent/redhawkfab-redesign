#!/usr/bin/env bash
# Flip the site between demo (blocked from search) and live (indexable).
# Both robots.txt and the per-page noindex read NEXT_PUBLIC_SITE_LIVE, so this
# script only has to set one thing — and it sets it in .env.production, which is
# what `next build` reads.
set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE=".env.production"

usage() { echo "usage: ./go-live.sh --live | --preview | --status"; exit 1; }
[ $# -eq 1 ] || usage

current() {
  if [ -f "$ENV_FILE" ] && grep -q '^NEXT_PUBLIC_SITE_LIVE=true$' "$ENV_FILE"; then
    echo live
  else
    echo preview
  fi
}

case "$1" in
  --status)
    echo "state: $(current)"
    ;;
  --live)
    printf 'NEXT_PUBLIC_SITE_LIVE=true\n' > "$ENV_FILE"
    echo "state: live — pages are indexable and robots.txt allows crawling."
    echo
    echo "Before you push, confirm ALL of these:"
    echo "  1. The client has signed off on the redesign."
    echo "  2. SITE.url in src/data/site.ts is the real domain, not the demo host."
    echo "  3. That domain is attached to this Vercel project and resolving."
    echo "  4. The demo host is redirected or noindexed, so it cannot be indexed"
    echo "     instead of the real site."
    echo
    echo "NOTE: .env.production is gitignored, so this file does NOT travel to"
    echo "Vercel. A deploy with the variable unset stays blocked from search,"
    echo "which is the safe default. To go live on Vercel you must also run:"
    echo "  vercel env add NEXT_PUBLIC_SITE_LIVE production   # value: true"
    echo "and redeploy."
    ;;
  --preview)
    printf 'NEXT_PUBLIC_SITE_LIVE=false\n' > "$ENV_FILE"
    echo "state: preview — noindex on every page, robots.txt disallows everything."
    ;;
  *) usage ;;
esac
