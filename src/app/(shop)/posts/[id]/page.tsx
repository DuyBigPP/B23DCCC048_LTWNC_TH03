import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/format';
import { getPublicPost, getPublicPosts } from '@/lib/posts';

const SITE = 'http://localhost:3000';

export const revalidate = 30;

export async function generateStaticParams() {
  const posts = await getPublicPosts();
  return posts.slice(0, 10).map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: PageProps<'/posts/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublicPost(Number(id));
  if (!post) return {};
  const title = `${post.title} – ${post.place}`;
  return {
    title,
    description: post.description,
    openGraph: { title, description: post.description },
  };
}

export default async function PostDetailPage({ params }: PageProps<'/posts/[id]'>) {
  const { id } = await params;
  const post = await getPublicPost(Number(id));
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Tin đăng', item: `${SITE}/posts` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE}/posts/${post.id}` },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\u003c') }}
      />
      <h1>{post.title}</h1>
      <p>Loại tin: {post.kind}</p>
      <p>Danh mục: {post.category}</p>
      <p>Địa điểm: {post.place}</p>
      <p>Ngày: {formatDate(post.date)}</p>
      <p>Người đăng: {post.authorEmail}</p>
      <p style={{ whiteSpace: 'pre-line' }}>{post.description}</p>
      <p>Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN', { hour12: false })}</p>
    </main>
  );
}
