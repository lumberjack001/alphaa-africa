import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/profile', '/hotels/callback'],
    },
    sitemap: 'https://alphaaafrica.com/sitemap.xml',
  };
}
