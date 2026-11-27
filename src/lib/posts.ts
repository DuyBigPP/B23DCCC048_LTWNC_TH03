import { KINDS, PLACES } from '../data/posts';
import { db } from './db';
import type { Post, PostStatus } from '../types';

export interface PostFilter {
  q?: string;
  kind?: string;
  sort?: string;
  place?: string;
}

const SORTS = ['date-desc', 'date-asc'];
const first = (v: unknown): string => {
  const x = Array.isArray(v) ? v[0] : v;
  return typeof x === 'string' ? x : '';
};
const oneOf = (v: string, list: readonly string[]): string => (list.includes(v) ? v : '');

/** Kiểm tra searchParams trước khi dùng: giá trị rác thì bỏ qua. */
export const parsePostFilter = (sp: Record<string, unknown>): Required<PostFilter> => ({
  q: first(sp.q).trim(),
  kind: oneOf(first(sp.kind), KINDS),
  sort: oneOf(first(sp.sort), SORTS),
  place: oneOf(first(sp.place), PLACES),
});

export const isPublic = (p: Post): boolean => p.status === 'approved' && !p.resolved;

export const getPublicPosts = async (filter: PostFilter = {}): Promise<Post[]> => {
  await new Promise((r) => setTimeout(r, 600));
  const q = filter.q?.trim().toLowerCase() ?? '';
  const list = db.posts.filter(
    (p) =>
      isPublic(p) &&
      (!q || p.title.toLowerCase().includes(q)) &&
      (!filter.kind || p.kind === filter.kind) &&
      (!filter.place || p.place === filter.place),
  );
  if (filter.sort === 'date-desc') return [...list].sort((a, b) => b.date.localeCompare(a.date));
  if (filter.sort === 'date-asc') return [...list].sort((a, b) => a.date.localeCompare(b.date));
  return list;
};

export const getPublicPost = async (id: number): Promise<Post | undefined> => {
  const post = db.posts.find((p) => p.id === id);
  return post && isPublic(post) ? post : undefined;
};

/** Chỉ đổi tin đang chờ duyệt; trả false nếu không đổi gì. */
export const moderatePostInDb = (id: number, status: 'approved' | 'hidden'): boolean => {
  const post = db.posts.find((p) => p.id === id);
  if (!post || post.status !== 'pending') return false;
  post.status = status;
  return true;
};

export const countByStatus = (): Record<PostStatus, number> => {
  const counts: Record<PostStatus, number> = { pending: 0, approved: 0, hidden: 0 };
  for (const p of db.posts) counts[p.status]++;
  return counts;
};

export const listPending = (): Post[] => db.posts.filter((p) => p.status === 'pending');
