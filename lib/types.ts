/** Shapes shared by the mock layer and the eventual Firestore collection. */

export type EventCategory =
  | 'camp'
  | 'jamboree'
  | 'promise'
  | 'hike'
  | 'anniversary'
  | 'fundraiser'
  | 'service';

export interface ScoutEvent {
  id: string;
  title: string;
  /** ISO date, yyyy-mm-dd. */
  date: string;
  /** Denormalised from `date` so the timeline can filter without parsing. */
  year: number;
  lat: number;
  lng: number;
  locationName: string;
  category: EventCategory;
  description: string;
  photoUrl: string;
  submittedBy: string;
  /** Public submissions land as false and are moderated before they show. */
  approved: boolean;
}

/** What /submit produces. The server assigns id and approved. */
export type EventDraft = Omit<ScoutEvent, 'id' | 'year' | 'approved'>;

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  camp: 'Camp',
  jamboree: 'Jamboree',
  promise: 'Promise',
  hike: 'Hike',
  anniversary: 'Anniversary',
  fundraiser: 'Fundraiser',
  service: 'Service',
};

export const CATEGORY_ORDER: EventCategory[] = [
  'camp',
  'jamboree',
  'promise',
  'hike',
  'anniversary',
  'fundraiser',
  'service',
];
