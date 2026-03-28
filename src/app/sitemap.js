export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://steps-of-cadillac-f1.vercel.app';

  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
