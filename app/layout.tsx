import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, Noto_Kufi_Arabic } from 'next/font/google';
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

/* Fraunces and Inter are latin only, so every Arabic string on the site was
   falling back to whatever the reader's OS supplies. The association's own
   name deserves better than that. Loaded only for the arabic subset. */
const kufi = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic',
});

const SITE = 'https://chaos-961.github.io/jarrahscout-website';

/* Absolute, because the export is served from a sub path on Pages and the
   scrapers that read this do not resolve anything relative. */
const OG_IMAGE = {
  url: `${SITE}/og.jpg`,
  width: 1200,
  height: 630,
  alt: 'Jarrah Scouts heritage archive, ninety years of scouting on a single map',
};

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
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jarrah Scouts | Heritage Archive',
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
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
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${kufi.variable}`}>
      <body className="min-h-[100dvh] bg-canvas">
        {/* Off screen until it is tabbed to, which is the first thing a
            keyboard reaches on every page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-plum-600 focus:px-4 focus:py-2 focus:font-body focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
