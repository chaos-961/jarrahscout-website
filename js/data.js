/* ------------------------------------------------------------
   Placeholder dataset.

   Nothing here is real. Points are scattered around a fixed set
   of inland anchor coordinates so the spread looks like Lebanon
   rather than a rectangle, and the RNG is seeded by year so the
   same year always renders the same dots across reloads.

   Swap forYear() for a fetch when the real events land. Keep the
   returned shape: { id, year, lat, lng, title }.
   ------------------------------------------------------------ */
window.Data = (function () {

  const CFG = window.JS_CONFIG;

  /* Anchors nudged inland so jitter never drops a dot in the sea. */
  const ANCHORS = [
    [33.865, 35.545], [33.960, 35.640], [34.120, 35.680], [34.255, 35.700],
    [34.430, 35.870], [34.540, 36.080], [34.390, 36.360], [34.250, 36.010],
    [34.400, 35.910], [34.080, 35.870], [34.005, 36.210], [33.846, 35.902],
    [33.920, 35.690], [33.810, 35.600], [33.694, 35.590], [33.660, 35.860],
    [33.560, 35.410], [33.545, 35.585], [33.502, 35.850], [33.379, 35.490],
    [33.285, 35.260], [33.361, 35.592]
  ];

  const SPREAD = 0.035; // degrees of jitter around an anchor, roughly 3.5 km

  /* mulberry32: tiny deterministic PRNG, same seed -> same sequence. */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const cache = new Map();

  function forYear(year) {
    if (cache.has(year)) return cache.get(year);

    const rand = rng(year * 2654435761);
    const span = CFG.eventsPerYear.max - CFG.eventsPerYear.min;
    const count = CFG.eventsPerYear.min + Math.floor(rand() * (span + 1));

    /* Shuffle the anchor pool so consecutive years land in different
       regions instead of always walking the list top to bottom. */
    const pool = ANCHORS.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }

    const out = [];
    for (let i = 0; i < count; i++) {
      const base = pool[i % pool.length];
      out.push({
        id: year + '-' + i,
        year: year,
        lat: base[0] + (rand() - 0.5) * 2 * SPREAD,
        lng: base[1] + (rand() - 0.5) * 2 * SPREAD,
        title: 'Location ' + String(i + 1).padStart(2, '0')
      });
    }

    cache.set(year, out);
    return out;
  }

  /* Bounding box of every point across the whole range, so the map can
     frame the data instead of an arbitrary country rectangle. Padded a
     little so edge dots never sit against the viewport edge. */
  let extentCache = null;
  function extent() {
    if (extentCache) return extentCache;
    let s = 90, w = 180, n = -90, e = -180;
    for (let y = CFG.years.from; y <= CFG.years.to; y++) {
      forYear(y).forEach(function (p) {
        if (p.lat < s) s = p.lat;
        if (p.lat > n) n = p.lat;
        if (p.lng < w) w = p.lng;
        if (p.lng > e) e = p.lng;
      });
    }
    if (n < s) return CFG.bounds;           // no data yet
    const pad = 0.07;
    extentCache = [[s - pad, w - pad], [n + pad, e + pad]];
    return extentCache;
  }

  return { forYear: forYear, extent: extent };
})();
