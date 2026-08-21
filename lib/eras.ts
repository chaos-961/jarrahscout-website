/** Named stretches of the group's history, drawn under the timeline track. */

export interface Era {
  from: number;
  to: number;
  label: string;
}

export const TIMELINE_START = 1937;
export const TIMELINE_END = 2026;

export const ERAS: Era[] = [
  { from: 1937, to: 1949, label: 'Founding Years' },
  { from: 1950, to: 1974, label: 'Golden Era' },
  { from: 1975, to: 1990, label: 'Years of Resilience' },
  { from: 1991, to: 2009, label: 'Rebuilding' },
  { from: 2010, to: 2026, label: 'New Generation' },
];

export function eraForYear(year: number): Era {
  return ERAS.find((e) => year >= e.from && year <= e.to) ?? ERAS[ERAS.length - 1];
}

export const ALL_YEARS: number[] = Array.from(
  { length: TIMELINE_END - TIMELINE_START + 1 },
  (_, i) => TIMELINE_START + i,
);
