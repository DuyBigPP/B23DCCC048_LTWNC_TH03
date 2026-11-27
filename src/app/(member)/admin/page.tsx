import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { can } from '@/lib/permissions';
import { moderatePost } from './actions';

export const metadata: Metadata = { title: 'Kiểm duyệt tin đăng', robots: { index: false } };

export default async function AdminPage() {
  const session = await auth();
  if (!can(session?.user?.role, 'post:moderate')) redirect('/forbidden');

  const count = (s: string) => db.posts.filter((p) => p.status === s).length;
  const pending = db.posts.filter((p) => p.status === 'pending');

  return (
    <main>
      <h1>Kiểm duyệt tin đăng</h1>
      <p className="stats">
        Chờ duyệt: {count('pending')} | Đang hiển thị: {count('approved')} | Đã ẩn: {count('hidden')}
      </p>
      {pending.length === 0 ? (
        <p className="card empty-state">Không còn tin nào chờ duyệt</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Tiêu đề</th><th>Ngày</th><th>Người đăng</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {pending.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{formatDate(p.date)}</td>
                  <td>{p.authorEmail}</td>
                  <td className="actions">
                    <form action={moderatePost.bind(null, p.id, 'approved')}>
                      <button type="submit" className="btn btn-primary btn-sm">Duyệt</button>
                    </form>
                    <form action={moderatePost.bind(null, p.id, 'hidden')}>
                      <button type="submit" className="btn btn-danger btn-sm">Ẩn</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
