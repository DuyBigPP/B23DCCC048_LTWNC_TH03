import { beforeEach, describe, expect, it } from 'vitest';
import { generatePosts } from '../data/posts';
import { db } from './db';
import { listMine, parseLimit, parseStatus, resolvePost, submitPost } from './my-posts';
import type { PostInput } from './post-validate';

const SV01 = 'sv01@ptit.edu.vn';
const SV02 = 'sv02@ptit.edu.vn';

beforeEach(() => {
  db.posts.splice(0, db.posts.length, ...generatePosts(36));
  db.nextPostId = 37;
});

describe('listMine', () => {
  it('sv01 có 27 tin, lần đầu lấy 8 tin và nextCursor là 8', () => {
    const page = listMine(SV01, '');
    expect(page.total).toBe(27);
    expect(page.items).toHaveLength(8);
    expect(page.nextCursor).toBe(8);
    expect(page.items.every((p) => p.authorEmail === SV01)).toBe(true);
  });

  it('trang cuối (cursor 24) có 3 tin và nextCursor là null', () => {
    const page = listMine(SV01, '', 24);
    expect(page.items).toHaveLength(3);
    expect(page.nextCursor).toBeNull();
  });

  it('lọc pending còn 3 tin', () => {
    const page = listMine(SV01, 'pending');
    expect(page.total).toBe(3);
    expect(page.items.every((p) => p.status === 'pending')).toBe(true);
    expect(page.nextCursor).toBeNull();
  });

  it('sv02 có 9 tin, không thấy tin của sv01', () => {
    const page = listMine(SV02, '', 0, 100);
    expect(page.total).toBe(9);
    expect(page.items.every((p) => p.authorEmail === SV02)).toBe(true);
  });
});

describe('parseStatus và parseLimit', () => {
  it('parseStatus chỉ nhận pending, approved, hidden', () => {
    expect(parseStatus('pending')).toBe('pending');
    expect(parseStatus('hidden')).toBe('hidden');
    expect(parseStatus('xyz')).toBe('');
    expect(parseStatus(undefined)).toBe('');
  });

  it('parseLimit nhận số nguyên dương, giá trị rác thì về 8', () => {
    expect(parseLimit('16')).toBe(16);
    expect(parseLimit('abc')).toBe(8);
    expect(parseLimit('-5')).toBe(8);
    expect(parseLimit('0')).toBe(8);
    expect(parseLimit(undefined)).toBe(8);
  });
});

describe('submitPost', () => {
  const input: PostInput = {
    title: '  Mất tai nghe không dây  ',
    kind: 'Thất lạc',
    category: 'Khác',
    place: 'Thư viện',
    date: '2026-11-10',
    description: 'Tai nghe màu trắng, để quên ở bàn tầng 2.',
    contactType: 'Zalo',
    contact: '0912345678',
  };

  it('tạo tin pending, ghép liên hệ vào mô tả và nằm đầu mảng', () => {
    const post = submitPost(SV01, input);
    expect(post).toMatchObject({
      id: 37,
      title: 'Mất tai nghe không dây',
      status: 'pending',
      resolved: false,
      authorEmail: SV01,
    });
    expect(post.description).toBe('Tai nghe màu trắng, để quên ở bàn tầng 2.\nLiên hệ: Zalo 0912345678');
    expect(db.posts[0]).toBe(post);
    expect(db.nextPostId).toBe(38);
    expect(listMine(SV01, '').total).toBe(28);
  });
});

describe('resolvePost', () => {
  it('trả forbidden khi không phải tin của mình', () => {
    expect(resolvePost(SV02, 2)).toBe('forbidden');
  });

  it('trả not-found khi không có id', () => {
    expect(resolvePost(SV01, 999)).toBe('not-found');
  });

  it('trả not-approved khi tin chưa được duyệt', () => {
    expect(resolvePost(SV02, 5)).toBe('not-approved');
  });

  it('trả ok và đặt resolved = true cho tin đang hiển thị của mình', () => {
    expect(resolvePost(SV01, 2)).toBe('ok');
    expect(db.posts.find((p) => p.id === 2)?.resolved).toBe(true);
  });
});
