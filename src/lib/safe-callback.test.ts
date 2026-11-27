import { describe, expect, it } from 'vitest';
import { safeCallback } from './safe-callback';

describe('safeCallback', () => {
  it('giữ đường dẫn nội bộ', () => {
    expect(safeCallback('/admin')).toBe('/admin');
    expect(safeCallback('/my-posts?status=pending')).toBe('/my-posts?status=pending');
  });

  it('đường dẫn ra ngoài hoặc rỗng thì về /my-posts', () => {
    expect(safeCallback('//evil.com')).toBe('/my-posts');
    expect(safeCallback('http://evil.com')).toBe('/my-posts');
    expect(safeCallback('/\\evil.com')).toBe('/my-posts');
    expect(safeCallback('')).toBe('/my-posts');
    expect(safeCallback(undefined)).toBe('/my-posts');
  });
});
