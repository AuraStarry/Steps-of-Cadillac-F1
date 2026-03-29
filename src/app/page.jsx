import PageQualifyingBenchmark from '@/components/pages/PageQualifyingBenchmark';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://steps-of-cadillac-f1.vercel.app';
const pageTitle = 'STEPS OF CADILLAC F1';
const pageDescription =
  'A Cadillac Formula 1 benchmark site with qualifying and race views, team trendlines, driver deltas, and concise historical context.';

export const metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: '/',
    type: 'website',
    images: [
      {
        url: '/social-share.jpg',
        alt: 'STEPS OF CADILLAC F1 social share image',
      },
    ],
  },
  twitter: {
    title: pageTitle,
    description: pageDescription,
    images: ['/social-share.jpg'],
  },
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'STEPS OF CADILLAC F1',
    url: siteUrl,
    inLanguage: 'en',
    description: pageDescription,
    about: {
      '@type': 'SportsTeam',
      name: 'Cadillac Formula 1 Team',
      sport: 'Formula 1',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageQualifyingBenchmark />
    </>
  );
}
