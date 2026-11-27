import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import PostForm from '@/components/PostForm';
import { formatDate } from '@/lib/format';
import { listMine, parseLimit, parseStatus } from '@/lib/my-posts';
import type { Post, PostStatus } from '@/types';
import { createPostAction, resolvePostAction } from './actions';

export const metadata: Metadata = { title: 'Tin đăng của tôi', robots: { index: false } };

const STATUS_LABEL: Record<PostStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đang hiển thị',
  hidden: 'Đã ẩn',
};

const StatusBadge = ({ post }: { post: Post }) =>
  post.resolved ? (
    <span className="badge badge-resolved">Đã nhận lại</span>
  ) : (
    <span className={`badge badge-${post.status === 'approved' ? 'found' : post.status}`}>
      {STATUS_LABEL[post.status]}
    </span>
  );

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
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Tiêu đề</th><th>Ngày</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{formatDate(p.date)}</td>
                <td><StatusBadge post={p} /></td>
                <td>
                  {p.status === 'approved' && !p.resolved && (
                    <form action={resolvePostAction.bind(null, p.id)}>
                      <button type="submit" className="btn btn-sm btn-outline">Đánh dấu đã nhận lại</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
