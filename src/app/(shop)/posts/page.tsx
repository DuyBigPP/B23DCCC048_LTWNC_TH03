import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { getPublicPosts } from '@/lib/posts';

export const metadata: Metadata = { title: 'Tin đăng' };

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function PostsPage({ searchParams }: PageProps<'/posts'>) {
  const sp = await searchParams;
  const q = one(sp.q);
  const kind = one(sp.kind);
  const sort = one(sp.sort);
  const posts = await getPublicPosts({ q, kind, sort });

  return (
    <main>
      <h1>Tin đang hiển thị</h1>
      <form method="get" className="card filters">
        <div className="field">
          <label htmlFor="q">Tìm kiếm</label>
          <input id="q" name="q" defaultValue={q} />
        </div>
        <div className="field">
          <label htmlFor="kind">Loại tin</label>
          <select id="kind" name="kind" defaultValue={kind}>
            <option value="">Tất cả</option>
            <option value="Thất lạc">Thất lạc</option>
            <option value="Nhặt được">Nhặt được</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="sort">Sắp xếp</label>
          <select id="sort" name="sort" defaultValue={sort}>
            <option value="">Mặc định</option>
            <option value="date-desc">Mới nhất</option>
            <option value="date-asc">Cũ nhất</option>
          </select>
        </div>
        <button type="submit">Lọc</button>
      </form>
      <p className="stats">Có {posts.length} tin đang hiển thị</p>
      <p className="meta">Render lúc: {new Date().toLocaleTimeString('vi-VN', { hour12: false })}</p>
      {posts.length === 0 ? (
        <p className="card empty-state">Không có tin nào phù hợp</p>
      ) : (
        <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Tiêu đề</th><th>Loại tin</th><th>Địa điểm</th><th>Ngày</th></tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/posts/${p.id}`}>{p.title}</Link></td>
                <td><span className={p.kind === 'Thất lạc' ? 'badge badge-lost' : 'badge badge-found'}>{p.kind}</span></td>
                <td>{p.place}</td>
                <td>{formatDate(p.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </main>
  );
}
