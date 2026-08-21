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

const DESCRIPTION =
  'Ninety years of Jarrah Scouts, plotted year by year across Lebanon. Drag the timeline to watch camps, jamborees and promises appear on the map.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Jarrah Scouts | Heritage Archive',
    template: '%s | Jarrah Scouts',
  },
  description: DESCRIPTION,
  applicationName: 'Jarrah Scouts Heritage Archive',
  keywords: ['Jarrah Scouts', 'كشافة الجراح', 'Lebanon', 'scouts', 'heritage', 'archive', 'timeline'],
  openGraph: {
    type: 'website',
    siteName: 'Jarrah Scouts',
    title: 'Jarrah Scouts | Heritage Archive',
    description: DESCRIPTION,
    url: SITE,
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jarrah Scouts | Heritage Archive',
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#150920',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-[100dvh] bg-canvas">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
