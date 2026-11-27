import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PostInput } from './post-validate';
import { today, toPostInput, validateImage, validatePost } from './post-validate';

const NOW = '2026-11-27';
const valid: PostInput = {
  title: 'Mất tai nghe không dây',
  kind: 'Thất lạc',
  category: 'Khác',
  place: 'Thư viện',
  date: '2026-11-10',
  description: 'Tai nghe màu trắng, để quên ở bàn tầng 2.',
  contactType: 'Zalo',
  contact: '0912345678',
};
const check = (patch: Partial<PostInput>) => validatePost({ ...valid, ...patch }, NOW);

describe('validatePost', () => {
  it('tin hợp lệ trả object rỗng', () => {
    expect(validatePost(valid, NOW)).toEqual({});
  });

  it('form trống báo đủ lỗi cho từng ô', () => {
    expect(validatePost(toPostInput({}), NOW)).toEqual({
      title: 'Tiêu đề tối thiểu 5 ký tự',
      kind: 'Hãy chọn loại tin',
      category: 'Hãy chọn danh mục',
      place: 'Hãy chọn địa điểm',
      date: 'Hãy chọn ngày',
      description: 'Mô tả tối thiểu 20 ký tự',
      contact: 'Số Zalo gồm 10 chữ số, bắt đầu bằng 0',
    });
  });

  it('ngày ở tương lai bị từ chối, hôm nay thì hợp lệ', () => {
    expect(check({ date: '2026-11-28' })).toEqual({ date: 'Ngày không được ở tương lai' });
    expect(check({ date: NOW })).toEqual({});
  });

  it('ngày sai định dạng thì báo hãy chọn ngày', () => {
    expect(check({ date: '10/11/2026' }).date).toBe('Hãy chọn ngày');
    expect(check({ date: '2026-13-45' }).date).toBe('Hãy chọn ngày');
  });

  it('tiêu đề dưới 5 ký tự sau khi trim và trên 80 ký tự', () => {
    expect(check({ title: '   abc   ' }).title).toBe('Tiêu đề tối thiểu 5 ký tự');
    expect(check({ title: 'a'.repeat(81) }).title).toBe('Tiêu đề tối đa 80 ký tự');
    expect(check({ title: 'a'.repeat(80) })).toEqual({});
  });

  it('loại tin, danh mục, địa điểm không tồn tại', () => {
    expect(check({ kind: 'Bán đồ' })).toEqual({ kind: 'Hãy chọn loại tin' });
    expect(check({ category: 'Laptop' })).toEqual({ category: 'Hãy chọn danh mục' });
    expect(check({ place: 'Tòa Z9' })).toEqual({ place: 'Hãy chọn địa điểm' });
  });

  it('mô tả dưới 20 ký tự sau khi trim', () => {
    expect(check({ description: '   ngắn quá   ' }).description).toBe('Mô tả tối thiểu 20 ký tự');
  });

  it('liên hệ Email sai định dạng báo lỗi, đúng định dạng thì hợp lệ', () => {
    expect(check({ contactType: 'Email', contact: 'abc' })).toEqual({ contact: 'Email không hợp lệ' });
    expect(check({ contactType: 'Email', contact: 'a@b.c' })).toEqual({});
  });

  it('liên hệ SĐT thiếu số báo lỗi', () => {
    expect(check({ contactType: 'SĐT', contact: '091234567' })).toEqual({
      contact: 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0',
    });
    expect(check({ contactType: 'SĐT', contact: '1912345678' }).contact).toBeDefined();
  });

  it('loại liên hệ lạ báo hãy chọn loại liên hệ', () => {
    expect(check({ contactType: 'Fax' })).toEqual({ contact: 'Hãy chọn loại liên hệ' });
  });
});

describe('toPostInput', () => {
  it('đổi FormData thành PostInput, thiếu trường thành chuỗi rỗng, contactType mặc định Zalo', () => {
    const fd = new FormData();
    fd.set('title', 'Mất ví');
    expect(toPostInput(fd)).toEqual({
      title: 'Mất ví', kind: '', category: '', place: '', date: '',
      description: '', contactType: 'Zalo', contact: '',
    });
  });
});

describe('today', () => {
  afterEach(() => vi.useRealTimers());

  it('trả ngày theo giờ máy dạng YYYY-MM-DD', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 27, 0, 30)); // 00:30 giờ địa phương
    expect(today()).toBe('2026-11-27');
  });
});

describe('validateImage', () => {
  const file = (size: number, type: string) => new File([new Uint8Array(size)], 'anh', { type });

  it('không chọn ảnh thì hợp lệ (ảnh là tùy chọn)', () => {
    expect(validateImage(null)).toBeUndefined();
    expect(validateImage(file(0, 'application/octet-stream'))).toBeUndefined();
  });

  it('ảnh JPG, PNG, WEBP, GIF dưới 800 KB thì hợp lệ', () => {
    expect(validateImage(file(1000, 'image/png'))).toBeUndefined();
    expect(validateImage(file(800 * 1024, 'image/jpeg'))).toBeUndefined();
  });

  it('sai định dạng hoặc quá 800 KB thì báo lỗi', () => {
    expect(validateImage(file(10, 'text/plain'))).toBe('Ảnh phải là JPG, PNG, WEBP hoặc GIF');
    expect(validateImage(file(800 * 1024 + 1, 'image/png'))).toBe('Ảnh tối đa 800 KB');
  });
});
