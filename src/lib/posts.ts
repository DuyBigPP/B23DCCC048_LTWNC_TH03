import { db } from './db';
import type { Post } from '../types';

export interface PostFilter {
  q?: string;
  kind?: string;
  sort?: string;
}

export const isPublic = (p: Post): boolean => p.status === 'approved' && !p.resolved;

export const getPublicPosts = async (filter: PostFilter = {}): Promise<Post[]> => {
  await new Promise((r) => setTimeout(r, 600));
  const q = filter.q?.trim().toLowerCase() ?? '';
  const list = db.posts.filter(
    (p) =>
      isPublic(p) &&
      (!q || p.title.toLowerCase().includes(q)) &&
      (!filter.kind || p.kind === filter.kind),
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
