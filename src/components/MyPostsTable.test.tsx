import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { generatePosts } from '@/data/posts';
import type { Post } from '@/types';
import MyPostsTable from './MyPostsTable';

const posts = generatePosts(3).map((p) => ({ ...p, status: 'approved' as const }));
// Giống page.tsx: mỗi dòng nhận action đã bind sẵn id (resolvePostAction.bind(null, id)).
const bindAll = (list: Post[], action: (id: number) => Promise<void>) =>
  Object.fromEntries(list.map((p) => [p.id, action.bind(null, p.id)]));
const row = (title: string) => screen.getByRole('cell', { name: title }).closest('tr') as HTMLElement;

describe('MyPostsTable – useOptimistic', () => {
  it('bấm Đánh dấu đã nhận lại thì dòng đổi ngay, trước khi server trả lời', async () => {
    const user = userEvent.setup();
    let finish: () => void = () => {};
    const action = vi.fn(() => new Promise<void>((r) => { finish = r; }));
    render(<MyPostsTable posts={posts} resolveActions={bindAll(posts, action)} />);

    await user.click(within(row(posts[0].title)).getByRole('button', { name: 'Đánh dấu đã nhận lại' }));

    expect(action).toHaveBeenCalledWith(posts[0].id);
    expect(within(row(posts[0].title)).getByText('Đã nhận lại')).toBeInTheDocument();
    expect(within(row(posts[0].title)).queryByRole('button')).not.toBeInTheDocument();
    finish();
  });

  it('server báo lỗi thì dòng tự quay lại và hiện thông báo lỗi', async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockRejectedValue(new Error('Không có quyền'));
    render(<MyPostsTable posts={posts} resolveActions={bindAll(posts, action)} />);

    await user.click(within(row(posts[1].title)).getByRole('button', { name: 'Đánh dấu đã nhận lại' }));

    expect(await screen.findByText('Không thể đánh dấu: Không có quyền')).toBeInTheDocument();
    expect(within(row(posts[1].title)).getByText('Đang hiển thị')).toBeInTheDocument();
    expect(within(row(posts[1].title)).getByRole('button', { name: 'Đánh dấu đã nhận lại' })).toBeInTheDocument();
  });

  it('hiện trạng thái tiếng Việt, tin đã nhận lại không có nút', () => {
    const list = [
      { ...posts[0], status: 'pending' as const },
      { ...posts[1], status: 'hidden' as const },
      { ...posts[2], resolved: true },
    ];
    render(<MyPostsTable posts={list} resolveActions={bindAll(list, vi.fn())} />);
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
    expect(screen.getByText('Đã ẩn')).toBeInTheDocument();
    expect(screen.getByText('Đã nhận lại')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
