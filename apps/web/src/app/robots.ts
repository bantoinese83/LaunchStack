import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/studio/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://mystichair.co'}/sitemap.xml`,
  };
}
