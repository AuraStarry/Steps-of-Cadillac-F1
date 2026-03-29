import './globals.css';
import { Barlow_Condensed, Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-heading',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://steps-of-cadillac-f1.vercel.app';
const siteName = 'STEPS OF CADILLAC F1';
const defaultTitle = 'STEPS OF CADILLAC F1';
const defaultDescription =
  'Track Cadillac Formula 1 progress through race-by-race benchmark scores, driver deltas, and concise narrative context.';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  referrer: 'origin-when-cross-origin',
  keywords: [
    'Cadillac F1',
    'Cadillac Formula 1',
    'Formula 1',
    'qualifying benchmark',
    'race benchmark',
    'F1 analytics',
    'Cadillac race performance',
  ],
  authors: [{ name: 'Aura / Gore' }],
  creator: 'Aura',
  publisher: siteName,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: '/social-share.jpg',
        alt: 'STEPS OF CADILLAC F1 social share image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: ['/social-share.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'sports analytics',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${barlowCondensed.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
