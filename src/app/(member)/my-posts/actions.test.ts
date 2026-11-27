import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generatePosts } from '@/data/posts';
import { db } from '@/lib/db';
import { getImage } from '@/lib/images';
import type { PostFormState } from '@/lib/post-validate';
import { createPostAction, resolvePostAction } from './actions';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const { auth } = await import('@/auth');
const { revalidatePath } = await import('next/cache');

type Role = 'member' | 'admin';
const loginAs = (role: Role | null) => {
  const session = role
    ? { user: { name: 'Test', email: role === 'admin' ? 'admin@ptit.edu.vn' : 'sv01@ptit.edu.vn', role }, expires: '' }
    : null;
  // auth() có nhiều overload (cả dạng bọc middleware), chỉ cần dạng trả về session.
  (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(session);
};

const INITIAL: PostFormState = { errors: {}, values: {} };
const validForm = () => {
  const fd = new FormData();
  Object.entries({
    title: 'Mất tai nghe không dây',
    kind: 'Thất lạc',
    category: 'Khác',
    place: 'Thư viện',
    date: '2026-11-10',
    description: 'Tai nghe màu trắng, để quên ở bàn tầng 2.',
    contactType: 'Zalo',
    contact: '0912345678',
  }).forEach(([k, v]) => fd.set(k, v));
  return fd;
};

beforeEach(() => {
  db.posts.splice(0, db.posts.length, ...generatePosts(36));
  db.nextPostId = 37;
  vi.mocked(revalidatePath).mockClear();
});

describe('createPostAction', () => {
  it('thành viên gửi hợp lệ thì thành công, tin mới nằm đầu và form được xóa trắng', async () => {
    loginAs('member');
    const res = await createPostAction(INITIAL, validForm());
    expect(res).toEqual({ errors: {}, values: {}, message: 'Đã gửi tin, chờ kiểm duyệt', ok: true });
    expect(db.posts[0]).toMatchObject({ id: 37, title: 'Mất tai nghe không dây', status: 'pending' });
    expect(revalidatePath).toHaveBeenCalledWith('/my-posts');
  });

  it('admin gửi thì nhận Không có quyền, giữ lại dữ liệu đã nhập, không tạo tin', async () => {
    loginAs('admin');
    const res = await createPostAction(INITIAL, validForm());
    expect(res.message).toBe('Không có quyền');
    expect(res.ok).toBeUndefined();
    expect(res.values.title).toBe('Mất tai nghe không dây');
    expect(db.posts).toHaveLength(36);
  });

  it('khách gửi thì nhận Không có quyền', async () => {
    loginAs(null);
    expect((await createPostAction(INITIAL, validForm())).message).toBe('Không có quyền');
  });

  it('dữ liệu sai thì trả errors và values, không tạo tin', async () => {
    loginAs('member');
    const fd = validForm();
    fd.set('title', 'abc');
    const res = await createPostAction(INITIAL, fd);
    expect(res.errors).toEqual({ title: 'Tiêu đề tối thiểu 5 ký tự' });
    expect(res.values.title).toBe('abc');
    expect(db.posts).toHaveLength(36);
  });

  it('đính kèm ảnh hợp lệ thì lưu ảnh theo id tin', async () => {
    loginAs('member');
    const fd = validForm();
    fd.set('image', new File([new Uint8Array([1, 2, 3])], 'tai-nghe.png', { type: 'image/png' }));
    await createPostAction(INITIAL, fd);
    expect(getImage(37)).toMatchObject({ type: 'image/png' });
  });

  it('ảnh sai định dạng thì báo lỗi, không tạo tin', async () => {
    loginAs('member');
    const fd = validForm();
    fd.set('image', new File(['abc'], 'note.txt', { type: 'text/plain' }));
    const res = await createPostAction(INITIAL, fd);
    expect(res.message).toBe('Ảnh phải là JPG, PNG, WEBP hoặc GIF');
    expect(db.posts).toHaveLength(36);
  });
});

describe('resolvePostAction', () => {
  it('khách hoặc admin bị ném lỗi Không có quyền', async () => {
    loginAs(null);
    await expect(resolvePostAction(2)).rejects.toThrow('Không có quyền');
    loginAs('admin');
    await expect(resolvePostAction(2)).rejects.toThrow('Không có quyền');
  });

  it('thành viên đánh dấu tin của mình thì làm mới các trang liên quan', async () => {
    loginAs('member');
    await resolvePostAction(2);
    expect(db.posts.find((p) => p.id === 2)?.resolved).toBe(true);
    expect(vi.mocked(revalidatePath).mock.calls.map((c) => c[0])).toEqual(
      expect.arrayContaining(['/my-posts', '/posts', '/', '/posts/2']),
    );
  });
});
