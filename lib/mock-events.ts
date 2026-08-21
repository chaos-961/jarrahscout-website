import { CURATED_EVENTS } from './curated-events';
import { ALL_YEARS } from './eras';
import { photoSeed } from './images';
import type { EventCategory, ScoutEvent } from './types';

/**
 * The placeholder corpus.
 *
 * Hand-written anchors from curated-events.ts, plus a generated set that fills
 * the rest of the timeline so most years hold several records. Generation is
 * seeded, so the same build always produces the same events. That matters:
 * static export prerenders this, and a random corpus would mismatch on hydrate.
 */

/* Real places, weighted toward Mount Lebanon where the group is based. */
const PLACES: [string, number, number][] = [
  ['Beirut', 33.8938, 35.5018],
  ['Zarif, Beirut', 33.8817, 35.4881],
  ['Pine Forest, Beirut', 33.8692, 35.5121],
  ['Beirut Corniche', 33.9008, 35.5192],
  ['Ras Beirut', 33.897, 35.4802],
  ['Baabda', 33.8339, 35.5442],
  ['Aley', 33.8106, 35.5997],
  ['Bhamdoun', 33.7971, 35.6584],
  ['Sofar', 33.8161, 35.7063],
  ['Hammana', 33.8261, 35.7323],
  ['Falougha', 33.8461, 35.7561],
  ['Ras el Metn', 33.8452, 35.6883],
  ['Broummana', 33.8835, 35.6412],
  ['Beit Mery', 33.8541, 35.6068],
  ['Mansourieh', 33.8677, 35.5783],
  ['Antelias', 33.9138, 35.5871],
  ['Dbayeh', 33.9451, 35.5903],
  ['Bikfaya', 33.9192, 35.6861],
  ['Dhour El Choueir', 33.9134, 35.7218],
  ['Baskinta', 33.9301, 35.7822],
  ['Zaarour', 33.9002, 35.7801],
  ['Jounieh', 33.9808, 35.6178],
  ['Harissa', 33.9836, 35.6501],
  ['Nahr el Kalb', 33.9553, 35.6073],
  ['Faraya', 34.0062, 35.8281],
  ['Faqra', 33.9853, 35.7983],
  ['Kfardebian', 34.0002, 35.7752],
  ['Mzaar Kfardebian', 34.0171, 35.8373],
  ['Jbeil (Byblos)', 34.1232, 35.6512],
  ['Amchit', 34.1198, 35.6448],
  ['Laqlouq', 34.1283, 35.8452],
  ['Tannourine', 34.2071, 35.8983],
  ['Batroun', 34.2553, 35.6581],
  ['Ehden', 34.2932, 35.9661],
  ['Bcharre', 34.2512, 36.0102],
  ['Cedars of God, Bcharre', 34.2436, 36.0492],
  ['Qadisha Valley', 34.2441, 35.9503],
  ['Tripoli', 34.4361, 35.8497],
  ['Deir el Qamar', 33.6989, 35.5641],
  ['Beiteddine, Chouf', 33.6942, 35.5811],
  ['Barouk, Chouf', 33.7024, 35.6902],
  ['Maasser el Chouf', 33.6603, 35.6871],
  ['Jezzine', 33.5452, 35.5851],
  ['Saida', 33.5606, 35.3752],
  ['Zahle', 33.8463, 35.9021],
  ['Anjar', 33.7292, 35.9302],
];

const TITLES: Record<EventCategory, string[]> = {
  camp: ['Summer Camp at {p}', 'Winter Camp, {p}', 'Patrol Camp at {p}', 'Troop Camp, {p}', 'Pioneer Camp at {p}'],
  jamboree: ['Regional Jamboree, {p}', 'District Gathering at {p}', 'Troop Rally, {p}', 'Joint Camp at {p}'],
  promise: ['Promise Ceremony at {p}', 'Investiture, {p}', 'New Scouts Invested at {p}', 'Spring Promise, {p}'],
  hike: ['Day Hike to {p}', 'Ridge Walk, {p}', 'Overnight Trek to {p}', 'Valley Traverse, {p}'],
  anniversary: ['Anniversary Gathering, {p}', 'Founders Day at {p}', 'Commemoration, {p}'],
  fundraiser: ['Fundraising Fete, {p}', 'Sponsored Walk from {p}', 'Craft Sale at {p}', 'Benefit Evening, {p}'],
  service: ['Service Day at {p}', 'Clean-up at {p}', 'Tree Planting, {p}', 'Relief Drive, {p}', 'Community Works, {p}'],
};

const OPENERS = [
  'A full weekend of work and games',
  'Two days on the ground',
  'A short outing arranged at little notice',
  'One of the busier turnouts of the year',
  'A quiet gathering with a small turnout',
  'The section met early and stayed late',
  'A long day that ran past dusk',
  'Planned over the spring and run in a single weekend',
];

const MIDDLES = [
  'with the patrols split across three tasks.',
  'built around pioneering and knot work.',
  'with cooking done entirely over open fires.',
  'that drew families up for the closing afternoon.',
  'with the younger section joining for the first time.',
  'run to the programme the scouts wrote themselves.',
  'with a map and compass exercise across the valley.',
  'and a night of songs around the fire to close it.',
];

const CLOSERS = [
  'Records from the day are thin but the photographs survive.',
  'It became a fixture for several years afterwards.',
  'The logbook entry runs to four pages.',
  'Attendance was the highest the section had managed that year.',
  'Weather cut the last afternoon short.',
  'Several of those present went on to lead the troop.',
  'It is remembered mostly for the food.',
  'The gateway built that weekend stood until the following spring.',
];

const NAMES = [
  'Group Archive',
  'Rami Haddad',
  'Nadia Khoury',
  'Georges Sfeir',
  'Lara Abou Jaoude',
  'Samir Nassar',
  'Maya Chalhoub',
  'Karim Rizk',
];

/* mulberry32: small, fast, and stable across runs. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** How busy a year was, by era. Wartime years are deliberately sparse. */
function yearWeight(year: number): [number, number] {
  if (year <= 1949) return [0, 2];
  if (year <= 1974) return [1, 3];
  if (year <= 1990) return [0, 2];
  if (year <= 2009) return [1, 3];
  return [2, 4];
}

const CATEGORIES: EventCategory[] = [
  'camp', 'camp', 'hike', 'hike', 'promise', 'service', 'service', 'jamboree', 'fundraiser', 'anniversary',
];

function generate(): ScoutEvent[] {
  const out: ScoutEvent[] = [];
  const rand = rng(0x5ca7);

  for (const year of ALL_YEARS) {
    const [lo, hi] = yearWeight(year);
    let count = lo + Math.floor(rand() * (hi - lo + 1));

    // Leave roughly one year in seven blank, so the empty state stays real.
    if (rand() < 0.14) count = 0;

    for (let i = 0; i < count; i++) {
      const place = PLACES[Math.floor(rand() * PLACES.length)];
      const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)];
      const pattern = TITLES[category][Math.floor(rand() * TITLES[category].length)];
      const month = 1 + Math.floor(rand() * 12);
      const day = 1 + Math.floor(rand() * 28);
      const id = `js-g-${year}-${i}`;

      out.push({
        id,
        title: pattern.replace('{p}', place[0]),
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        year,
        // Jitter so repeat visits to one place do not stack into a single pixel.
        lat: place[1] + (rand() - 0.5) * 0.035,
        lng: place[2] + (rand() - 0.5) * 0.035,
        locationName: place[0],
        category,
        description: [
          OPENERS[Math.floor(rand() * OPENERS.length)],
          MIDDLES[Math.floor(rand() * MIDDLES.length)],
          CLOSERS[Math.floor(rand() * CLOSERS.length)],
        ].join(' '),
        photoUrl: photoSeed(id),
        submittedBy: NAMES[Math.floor(rand() * NAMES.length)],
        approved: true,
      });
    }
  }

  return out;
}

export const MOCK_EVENTS: ScoutEvent[] = [...CURATED_EVENTS, ...generate()].sort((a, b) =>
  a.date.localeCompare(b.date),
);
