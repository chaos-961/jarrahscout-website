import type { Metadata } from 'next';
import HomeView from '@/components/home/HomeView';

/* The brief asked for /home explicitly. It renders the same view as / so both
   URLs work, and trailingSlash keeps it as /home/ rather than /home.html. */
export const metadata: Metadata = {
  title: 'Home',
};

export default function Page() {
  return <HomeView />;
}
