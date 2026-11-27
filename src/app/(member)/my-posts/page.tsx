import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tin đăng của tôi', robots: { index: false } };

// Phần 3 sẽ thêm form đăng tin và danh sách tin.
export default function MyPostsPage() {
  return (
    <main>
      <h1>Tin đăng của tôi</h1>
    </main>
  );
}
