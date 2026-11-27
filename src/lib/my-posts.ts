// Hàm thuần TypeScript, không import gì của Next.js để test được.
import { db } from './db';
import type { PostInput } from './post-validate';
import type { Category, Kind, Place, Post, PostStatus } from '../types';

export interface MyPostsPage {
  items: Post[];
  nextCursor: number | null;
  total: number;
}

const STATUSES: PostStatus[] = ['pending', 'approved', 'hidden'];

export const parseStatus = (v: unknown): PostStatus | '' =>
  STATUSES.find((s) => s === v) ?? '';

export const parseLimit = (v: unknown): number => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : 8;
};

export const listMine = (
  email: string,
  status: PostStatus | '',
  cursor = 0,
  size = 8,
): MyPostsPage => {
  const mine = db.posts.filter((p) => p.authorEmail === email && (!status || p.status === status));
  const end = cursor + size;
  return {
    items: mine.slice(cursor, end),
    nextCursor: end < mine.length ? end : null,
    total: mine.length,
  };
};

/** input phải đã qua validatePost. */
export const submitPost = (email: string, input: PostInput): Post => {
  const post: Post = {
    id: db.nextPostId++,
    title: input.title.trim(),
    kind: input.kind as Kind,
    category: input.category as Category,
    place: input.place as Place,
    date: input.date,
    description: `${input.description.trim()}\nLiên hệ: ${input.contactType} ${input.contact.trim()}`,
    authorEmail: email,
    status: 'pending',
    resolved: false,
  };
  db.posts.unshift(post);
  return post;
};

export type ResolveResult = 'ok' | 'not-found' | 'forbidden' | 'not-approved';

export const resolvePost = (email: string, id: number): ResolveResult => {
  const post = db.posts.find((p) => p.id === id);
  if (!post) return 'not-found';
  if (post.authorEmail !== email) return 'forbidden';
  if (post.status !== 'approved') return 'not-approved';
  post.resolved = true;
  return 'ok';
};
