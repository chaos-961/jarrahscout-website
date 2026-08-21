/* Central knobs. Everything tunable lives here. */
window.JS_CONFIG = {

  /* Paste a Google Maps JavaScript API key to switch the renderer to real
     Google Maps. Left empty, the app runs on Leaflet + CARTO tiles, which
     needs no key and no billing account. Same public API either way. */
  googleMapsApiKey: '',

  /* Country frame. The map always fits this box, so it adapts to any viewport
     instead of relying on a fixed zoom that only looks right on one screen. */
  bounds: [[33.03, 35.08], [34.70, 36.64]],
  fitPadding: 26,

  minZoom: 7,
  maxZoom: 17,

  /* Timeline range, inclusive. */
  years: { from: 2000, to: 2026 },
  startYear: 2000,

  /* Auto-play step, milliseconds per year. */
  playMs: 1300,

  /* Placeholder dataset shape. */
  eventsPerYear: { min: 5, max: 14 }
};
