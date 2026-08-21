import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * Custom basemap styling.
 *
 * CARTO's Dark Matter vector style is the base: free, no key, no quota. On load
 * we walk its layers and retint them into the plum palette, then strip the label
 * noise a history map does not need. Classification is by id substring rather
 * than exact id, so a CARTO style update does not silently undo this.
 *
 * The style ships its own OpenStreetMap and CARTO attribution, so nothing here
 * adds a second copy of it.
 */

export const BASEMAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const PALETTE = {
  land: '#190B26',
  water: '#0E0518',
  waterLine: '#22103A',
  green: '#1C0E2C',
  building: '#241238',
  roadMajor: '#33184D',
  roadMinor: '#25123A',
  roadCasing: '#1A0A28',
  boundary: '#5A3191',
  label: '#C6A9EC',
  labelHalo: '#120718',
  labelMinor: '#8B6BB5',
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
        map.setPaintProperty(id, 'text-halo-width', 1.4);
        continue;
      }

      if (layer.type === 'fill') {
        if (has(id, 'water')) {
          map.setPaintProperty(id, 'fill-color', PALETTE.water);
        } else if (has(id, 'park', 'wood', 'forest', 'grass', 'landcover', 'green')) {
          map.setPaintProperty(id, 'fill-color', PALETTE.green);
        } else if (has(id, 'building')) {
          map.setPaintProperty(id, 'fill-color', PALETTE.building);
          map.setPaintProperty(id, 'fill-opacity', 0.5);
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
          map.setPaintProperty(id, 'line-opacity', 0.4);
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
