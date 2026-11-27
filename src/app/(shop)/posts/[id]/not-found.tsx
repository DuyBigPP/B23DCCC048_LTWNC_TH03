import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <div className="card empty-state">
        <h1>Không tìm thấy tin đăng</h1>
        <Link href="/posts">← Quay lại danh sách</Link>
      </div>
    </main>
  );
}
