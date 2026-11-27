/** Chỉ chấp nhận đường dẫn nội bộ để tránh open redirect qua callbackUrl. */
export const safeCallback = (v: unknown): string =>
  typeof v === 'string' && /^\/(?![/\\])/.test(v) ? v : '/my-posts';
