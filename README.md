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

## Routes

| Path | What it is |
| --- | --- |
| `/` and `/home` | Landing page: drifting photo wall, stats, eras |
| `/timeline` | The timeline map |
| `/submit` | Event submission with a map location picker |
| `/about` | About the archive |

## The map

MapLibre GL with CARTO's Dark Matter vector basemap. No API key, no billing, no
quota. `lib/map-style.ts` walks the style on load and retints every layer into
the plum palette, then strips POI and road-shield labels. The style carries its
own OpenStreetMap and CARTO credit, so nothing adds a second copy.

Pins are the photographs themselves. `lib/images.ts` picks a thumbnail size from
the current zoom: below z8.5 a pin is a dot and loads no image at all, then 80,
128, 176 and 240px as you come in. Only an opened event requests the full frame.
Off-screen pins are never rendered, because supercluster is queried by the
current viewport bounds.

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

All brand colour lives in `tailwind.config.ts` as the `plum` ramp plus the named
roles `canvas`, `surface`, `raised` and `hairline`. Nothing outside that file
hardcodes a hex. Fonts are Fraunces (display) and Inter (body), through
`next/font`.

The emblem keeps its own green and red, which is why the ramp stays out of those
hues. The source PNG had a solid white background; it was flood filled from the
edges to alpha so the interior whites of the ribbon survive, then downsampled to
`public/jarrah-logo.png`, `public/jarrah-logo-sm.png` and `app/icon.png`.

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
