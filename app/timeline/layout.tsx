import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timeline map',
  description:
    'Drag through ninety years of Jarrah Scouts history. Every camp, hike and ceremony, placed where it happened across Lebanon.',
};

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
