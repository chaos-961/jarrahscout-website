import { MOCK_EVENTS } from './mock-events';
import { ALL_YEARS } from './eras';
import type { EventDraft, ScoutEvent } from './types';

/**
 * The only module that knows where events come from.
 *
 * Every function is async and returns the same shapes a Firestore query would,
 * so switching to real Firebase means rewriting the bodies here and nothing
 * else. Each function carries the equivalent Firestore call in a comment.
 *
 * Firestore shape this mirrors:
 *   collection('events')
 *     doc: { title, date, year, lat, lng, locationName, category,
 *            description, photoUrl, submittedBy, approved }
 */

/** Simulated network latency, so skeleton states are real rather than theatre. */
const LATENCY_MS = 260;

function settle<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Only approved records are ever public. Mirrors the security rule. */
function published(): ScoutEvent[] {
  return MOCK_EVENTS.filter((e) => e.approved);
}

/**
 * Every approved event, oldest first.
 *
 * Firestore:
 *   const q = query(
 *     collection(db, 'events'),
 *     where('approved', '==', true),
 *     orderBy('date', 'asc'),
 *   );
 *   const snap = await getDocs(q);
 *   return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ScoutEvent);
 */
export async function getEvents(): Promise<ScoutEvent[]> {
  const rows = published().slice().sort((a, b) => a.date.localeCompare(b.date));
  return settle(rows);
}

/**
 * Approved events for a single year, oldest first.
 *
 * Firestore:
 *   const q = query(
 *     collection(db, 'events'),
 *     where('approved', '==', true),
 *     where('year', '==', year),
 *     orderBy('date', 'asc'),
 *   );
 */
export async function getEventsByYear(year: number): Promise<ScoutEvent[]> {
  const rows = published()
    .filter((e) => e.year === year)
    .sort((a, b) => a.date.localeCompare(b.date));
  return settle(rows);
}

/**
 * One event by id.
 *
 * Firestore:
 *   const snap = await getDoc(doc(db, 'events', id));
 *   return snap.exists() ? ({ id: snap.id, ...snap.data() } as ScoutEvent) : null;
 */
export async function getEventById(id: string): Promise<ScoutEvent | null> {
  return settle(published().find((e) => e.id === id) ?? null);
}

/**
 * Event count per year across the whole timeline, including zeroes. Drives the
 * density dots on the slider track.
 *
 * Firestore: read the whole approved collection once and reduce client side, or
 * keep a `yearCounts` aggregate doc updated by a Cloud Function and read that.
 */
export async function getYearDensity(): Promise<Record<number, number>> {
  const counts: Record<number, number> = {};
  for (const year of ALL_YEARS) counts[year] = 0;
  for (const e of published()) counts[e.year] = (counts[e.year] ?? 0) + 1;
  return settle(counts);
}

/**
 * Public submission. Lands unapproved and waits for moderation.
 *
 * Firestore:
 *   const ref = await addDoc(collection(db, 'events'), {
 *     ...draft,
 *     year: new Date(draft.date).getFullYear(),
 *     approved: false,
 *     createdAt: serverTimestamp(),
 *   });
 *   return ref.id;
 *
 * The photo would upload to Storage first and the resulting download URL is
 * what gets written to photoUrl.
 */
export async function submitEvent(draft: EventDraft): Promise<string> {
  const record: Omit<ScoutEvent, 'id'> = {
    ...draft,
    year: Number(draft.date.slice(0, 4)),
    approved: false,
  };

  // Stands in for the write. Replace with addDoc when Firebase is wired up.
  console.log('[submitEvent] would write to Firestore collection "events":', record);

  return settle(`mock-${Date.now()}`, 900);
}
