import PageQualifyingBenchmark from '@/components/pages/PageQualifyingBenchmark';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://steps-of-cadillac-f1.vercel.app';
const pageTitle = 'Cadillac F1 Qualifying Benchmark Dashboard';
const pageDescription =
  'Race-by-race Cadillac F1 qualifying benchmarks with team score trends, driver score deltas, and key historical context.';

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
  },
  twitter: {
    title: pageTitle,
    description: pageDescription,
  },
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Steps of Cadillac F1',
    url: siteUrl,
    inLanguage: 'zh-Hant',
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
