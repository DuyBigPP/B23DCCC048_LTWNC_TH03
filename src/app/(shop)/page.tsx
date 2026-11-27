import Link from 'next/link';
import { getPublicPosts } from '@/lib/posts';

export default async function HomePage() {
  const posts = await getPublicPosts();
  return (
    <main>
      <section className="card hero">
        <h1>PTIT Found – Tìm đồ thất lạc</h1>
        <p className="big">{posts.length} tin đang hiển thị</p>
        <Link href="/posts" className="btn btn-primary">Xem tất cả tin</Link>
      </section>
    </main>
  );
}
