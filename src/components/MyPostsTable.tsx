'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { formatDate } from '@/lib/format';
import type { Post, PostStatus } from '@/types';

interface Props {
  posts: Post[];
  /** Server Action đã bind sẵn id ở server: resolvePostAction.bind(null, id). */
  resolveActions: Record<number, () => Promise<void>>;
}

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

export default function MyPostsTable({ posts, resolveActions }: Props) {
  // Dòng đổi sang "Đã nhận lại" ngay khi bấm; lỗi thì useOptimistic tự quay về `posts`.
  const [optimistic, markResolved] = useOptimistic(posts, (list: Post[], id: number) =>
    list.map((p) => (p.id === id ? { ...p, resolved: true } : p)),
  );
  const [error, setError] = useState('');
  const [, startTransition] = useTransition();

  const resolve = (id: number) =>
    startTransition(async () => {
      setError('');
      markResolved(id);
      try {
        await resolveActions[id]();
      } catch (e) {
        setError(`Không thể đánh dấu: ${e instanceof Error ? e.message : 'lỗi không xác định'}`);
      }
    });

  return (
    <>
      {error && <p className="message">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Tiêu đề</th><th>Ngày</th><th>Trạng thái</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {optimistic.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{formatDate(p.date)}</td>
                <td><StatusBadge post={p} /></td>
                <td>
                  {p.status === 'approved' && !p.resolved && (
                    <form action={() => resolve(p.id)}>
                      <button type="submit" className="btn btn-sm btn-outline">Đánh dấu đã nhận lại</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
