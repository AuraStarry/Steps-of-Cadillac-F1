export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://steps-of-cadillac-f1.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
