import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * Custom basemap styling.
 *
 * CARTO's Positron vector style is the base (free, no key, no quota). On load
 * we walk its layers and retint them into the heritage palette, then strip the
 * label noise a history map does not need. Classification is by id substring
 * rather than exact id, so a CARTO style update does not silently undo this.
 */

export const BASEMAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export const MAP_ATTRIBUTION =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &middot; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>';

/** Slightly deeper than the page paper, so the map reads as an inset object. */
const PALETTE = {
  land: '#F1EADB',
  water: '#C3D3CB',
  waterLine: '#AFC3B9',
  green: '#DCE6D8',
  building: '#E6DDCA',
  roadMajor: '#E2D7C0',
  roadMinor: '#EAE2D0',
  roadCasing: '#D7C9AC',
  boundary: '#BFB299',
  label: '#413D34',
  labelHalo: '#FAF6EE',
  labelMinor: '#6A6458',
};

const has = (id: string, ...needles: string[]) =>
  needles.some((n) => id.toLowerCase().includes(n));

/** Label layers worth keeping. Everything else symbol-shaped gets dropped. */
const KEEP_LABELS = ['place', 'country', 'state', 'water_name', 'watername'];

export function applyHeritageStyle(map: MapLibreMap): void {
  const style = map.getStyle();
  if (!style?.layers) return;

  for (const layer of style.layers) {
    const id = layer.id;

    try {
      if (layer.type === 'background') {
        map.setPaintProperty(id, 'background-color', PALETTE.land);
        continue;
      }

      if (layer.type === 'symbol') {
        // Drop POI pins, house numbers and road shields: pure clutter here.
        if (!has(id, ...KEEP_LABELS)) {
          map.removeLayer(id);
          continue;
        }
        map.setPaintProperty(id, 'text-color', has(id, 'water') ? PALETTE.labelMinor : PALETTE.label);
        map.setPaintProperty(id, 'text-halo-color', PALETTE.labelHalo);
        map.setPaintProperty(id, 'text-halo-width', 1.6);
        continue;
      }

      if (layer.type === 'fill') {
        if (has(id, 'water')) {
          map.setPaintProperty(id, 'fill-color', PALETTE.water);
        } else if (has(id, 'park', 'wood', 'forest', 'grass', 'landcover', 'green')) {
          map.setPaintProperty(id, 'fill-color', PALETTE.green);
        } else if (has(id, 'building')) {
          map.setPaintProperty(id, 'fill-color', PALETTE.building);
          map.setPaintProperty(id, 'fill-opacity', 0.55);
        } else {
          map.setPaintProperty(id, 'fill-color', PALETTE.land);
        }
        continue;
      }

      if (layer.type === 'line') {
        if (has(id, 'water')) {
          map.setPaintProperty(id, 'line-color', PALETTE.waterLine);
        } else if (has(id, 'boundary', 'admin')) {
          map.setPaintProperty(id, 'line-color', PALETTE.boundary);
          map.setPaintProperty(id, 'line-opacity', 0.5);
        } else if (has(id, 'casing')) {
          map.setPaintProperty(id, 'line-color', PALETTE.roadCasing);
        } else if (has(id, 'motorway', 'trunk', 'primary')) {
          map.setPaintProperty(id, 'line-color', PALETTE.roadMajor);
        } else {
          map.setPaintProperty(id, 'line-color', PALETTE.roadMinor);
        }
      }
    } catch {
      // A layer that lacks the property is fine to skip; the rest still retint.
    }
  }
}
