/**
 * Photo sizing.
 *
 * Markers must never pull a full resolution photo: at 200 pins that is hundreds
 * of megabytes. Everything on the map requests a thumbnail sized to how big it
 * actually renders, and only the opened event asks for the full image.
 */

const PICSUM = /^https:\/\/picsum\.photos\/seed\/([^/]+)\/\d+\/\d+$/;

/** Placeholder source. Swapping to real Storage URLs needs no change here. */
export const photoSeed = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/1600/1100`;

/**
 * Re-request a photo at a different size.
 *
 * Picsum encodes dimensions in the path, so a thumbnail is a URL rewrite. A URL
 * from anywhere else is returned untouched, which is what will happen once
 * these are real Firebase Storage links.
 */
export function lodUrl(photoUrl: string, w: number, h: number): string {
  const m = photoUrl.match(PICSUM);
  return m ? `https://picsum.photos/seed/${m[1]}/${w}/${h}` : photoUrl;
}

/** Marker detail tiers. Below `minZoom` the map draws a dot and loads nothing. */
export interface Lod {
  /** Rendered tile edge in CSS pixels. */
  size: number;
  /** Pixels actually fetched, at roughly 2x for retina. */
  fetch: number;
  showTitle: boolean;
}

export function lodForZoom(zoom: number): Lod | null {
  if (zoom < 8.5) return null;
  if (zoom < 10.5) return { size: 34, fetch: 80, showTitle: false };
  if (zoom < 12.5) return { size: 52, fetch: 128, showTitle: false };
  if (zoom < 14) return { size: 72, fetch: 176, showTitle: true };
  return { size: 96, fetch: 240, showTitle: true };
}
