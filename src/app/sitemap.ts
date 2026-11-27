import type { MetadataRoute } from 'next';
import { getPublicPosts } from '@/lib/posts';

const SITE = 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublicPosts();
  return [
    { url: SITE, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/posts`, changeFrequency: 'hourly', priority: 0.8 },
    ...posts.map((p) => ({
      url: `${SITE}/posts/${p.id}`,
      lastModified: p.date,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
