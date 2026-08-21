import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add an event',
  description:
    'Submit a camp, hike, ceremony or anniversary to the Jarrah Scouts heritage archive. Every submission is reviewed before it appears on the map.',
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
