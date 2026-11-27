import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'PTIT Found', template: '%s | PTIT Found' },
  description: 'Tìm đồ thất lạc trong trường PTIT',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="vi">
      <body>
        <nav>
          <Link href="/">Trang chủ</Link>
          <Link href="/posts">Tin đăng</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
