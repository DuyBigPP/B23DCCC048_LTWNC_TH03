import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import MyPostsTable from '@/components/MyPostsTable';
import PostForm from '@/components/PostForm';
import { listMine, parseLimit, parseStatus } from '@/lib/my-posts';
import { createPostAction, resolvePostAction } from './actions';

export const metadata: Metadata = { title: 'Tin đăng của tôi', robots: { index: false } };

export default async function MyPostsPage({ searchParams }: PageProps<'/my-posts'>) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect('/login?callbackUrl=%2Fmy-posts');

  const sp = await searchParams;
  const status = parseStatus(sp.status);
  const limit = parseLimit(sp.limit);
  const { items, total, nextCursor } = listMine(email, status, 0, limit);
  const more = new URLSearchParams({ status, limit: String(limit + 8) });

  return (
    <main>
      <h1>Tin đăng của tôi</h1>

      <section className="card">
        <h2>Đăng tin mới</h2>
        <PostForm action={createPostAction} />
      </section>

      <form method="get" className="filters" style={{ marginTop: '1.5rem' }}>
        <div className="field">
          <label htmlFor="status">Trạng thái</label>
          <select id="status" name="status" defaultValue={status}>
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đang hiển thị</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>
        <button type="submit">Lọc</button>
      </form>

      <p className="stats">Hiển thị {items.length} / {total} tin</p>
      <MyPostsTable
        posts={items}
        resolveActions={Object.fromEntries(items.map((p) => [p.id, resolvePostAction.bind(null, p.id)]))}
      />
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        {nextCursor === null ? (
          <span className="meta">Đã hiển thị hết tin</span>
        ) : (
          <Link href={`/my-posts?${more}`} className="btn">Xem thêm</Link>
        )}
      </p>
    </main>
  );
}
