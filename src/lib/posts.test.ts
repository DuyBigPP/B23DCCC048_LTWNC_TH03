import { describe, expect, it } from 'vitest';
import { db } from './db';
import { getPublicPost, getPublicPosts } from './posts';

describe('getPublicPosts', () => {
  it('không lọc thì trả 24 tin công khai', async () => {
    expect(await getPublicPosts()).toHaveLength(24);
  });

  it('lọc theo loại tin: Thất lạc 12, Nhặt được 12', async () => {
    expect(await getPublicPosts({ kind: 'Thất lạc' })).toHaveLength(12);
    expect(await getPublicPosts({ kind: 'Nhặt được' })).toHaveLength(12);
  });

  it('tìm theo tiêu đề không phân biệt hoa thường', async () => {
    expect(await getPublicPosts({ q: 'thẻ' })).toHaveLength(5);
    expect(await getPublicPosts({ q: 'ĐIỆN THOẠI', kind: 'Thất lạc' })).toHaveLength(3);
    expect(await getPublicPosts({ q: 'xyz' })).toHaveLength(0);
  });

  it('sắp xếp mới nhất và cũ nhất, không làm đổi db.posts', async () => {
    const before = db.posts.map((p) => p.id);
    const desc = await getPublicPosts({ sort: 'date-desc' });
    expect(desc[0]).toMatchObject({ id: 16, title: 'Nhặt được thẻ ngân hàng', date: '2026-11-16' });
    const asc = await getPublicPosts({ sort: 'date-asc' });
    expect(asc[0]).toMatchObject({ title: 'Mất thẻ sinh viên', date: '2026-11-01' });
    expect(db.posts.map((p) => p.id)).toEqual(before);
  });
});

describe('getPublicPost', () => {
  it('trả tin công khai theo id', async () => {
    expect((await getPublicPost(2))?.title).toBe('Nhặt được ví da màu nâu');
  });

  it('tin chờ duyệt, đã ẩn hoặc không tồn tại trả undefined', async () => {
    expect(await getPublicPost(5)).toBeUndefined();
    expect(await getPublicPost(6)).toBeUndefined();
    expect(await getPublicPost(999)).toBeUndefined();
  });
});
