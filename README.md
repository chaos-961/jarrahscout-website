# Jarrah Scouts, heritage archive

Interactive timeline map of the group's history, 1937 to 2026. Drag the year
slider and the map reframes itself around that year's events.

Next.js (App Router) + TypeScript + Tailwind + Framer Motion, exported as a
static site and served from GitHub Pages.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npm run build   # static export into out/
```

## The map

MapLibre GL with CARTO's Positron vector basemap. No API key, no billing, no
quota. `lib/map-style.ts` walks the style on load and retints every layer into
the heritage palette, then strips POI and road-shield labels.

Google Maps was the original plan but needs a billing-enabled key, and without
one it renders a watermarked error map. Vector tiles also restyle far better
than Google's styler allows.

## Data

Everything lives behind `lib/events.ts`. It serves the mock corpus in
`lib/mock-events.ts` today, and each function carries the Firestore query it
replaces in a comment above it:

| Function | Firestore equivalent |
| --- | --- |
| `getEvents()` | `where('approved','==',true)`, `orderBy('date')` |
| `getEventsByYear(year)` | the above plus `where('year','==',year)` |
| `getEventById(id)` | `getDoc(doc(db,'events',id))` |
| `getYearDensity()` | reduce the collection, or read a `yearCounts` aggregate |
| `submitEvent(draft)` | `addDoc` with `approved: false` |

To go live: copy `.env.local.example` to `.env.local`, fill in the Firebase
console values, then swap the bodies in `lib/events.ts`. `lib/firebase.ts` is
already wired and stays dormant until those env vars exist. Nothing else in the
app touches the data source.

Submissions carry `approved: false` so they can be moderated before appearing.

## Design tokens

All brand colour lives in `tailwind.config.ts`. Swap `forest` and `gold` for the
real scout colours there and the whole site follows. Fonts are Fraunces
(display) and Inter (body), loaded through `next/font`.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
static export and publishes it to Pages. Set the repository's Pages source to
**GitHub Actions**.

The site is served from `/jarrahscout-website/`, so the workflow sets
`NEXT_PUBLIC_BASE_PATH` to match. If a custom domain is pointed at Pages later,
set that env var to an empty string and update `SITE` in `app/layout.tsx`.

## Notes

- `legacy/` holds the original vanilla Leaflet prototype, kept for reference.
- All event records are invented placeholders. Coordinates are real places.
