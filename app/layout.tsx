import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import Navbar from '@/components/ui/Navbar';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const SITE = 'https://chaos-961.github.io/jarrahscout-website';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Jarrah Scouts | Heritage Archive',
    template: '%s | Jarrah Scouts',
  },
  description:
    'Ninety years of scouting in Lebanon, plotted year by year. Drag the timeline to watch camps, jamborees and promises appear across Mount Lebanon.',
  keywords: ['scouts', 'Lebanon', 'Mount Lebanon', 'heritage', 'archive', 'timeline', 'history'],
  openGraph: {
    type: 'website',
    siteName: 'Jarrah Scouts',
    title: 'Jarrah Scouts | Heritage Archive',
    description:
      'Ninety years of scouting in Lebanon, plotted year by year on an interactive timeline map.',
    url: SITE,
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jarrah Scouts | Heritage Archive',
    description:
      'Ninety years of scouting in Lebanon, plotted year by year on an interactive timeline map.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#FAF6EE',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-[100dvh] bg-paper">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
