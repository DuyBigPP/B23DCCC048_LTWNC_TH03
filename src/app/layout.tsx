import type { Metadata } from 'next';
import Header from '@/components/Header';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'PTIT Found', template: '%s | PTIT Found' },
  description: 'Tìm đồ thất lạc trong trường PTIT',
};

// Không gọi auth() ở đây: sẽ biến mọi trang thành dynamic, mất SSG.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
        <footer className="site-footer">PTIT Found · Tìm đồ thất lạc trong trường PTIT</footer>
      </body>
    </html>
  );
}
