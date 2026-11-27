'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useEffectEvent } from 'react';

export default function Header() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const syncSession = useEffectEvent(() => {
    void update();
  });

  // Đăng nhập bằng Server Action không làm SessionProvider tự tải lại phiên,
  // nên mỗi lần đổi trang thì đồng bộ lại.
  useEffect(() => {
    syncSession();
  }, [pathname]);

  const user = session?.user;

  return (
    <header className="site-header">
      <nav>
        <Link href="/" className="brand">PTIT Found</Link>
        <Link href="/">Trang chủ</Link>
        <Link href="/posts">Tin đăng</Link>
        {user && <Link href="/my-posts">Tin của tôi</Link>}
        {user?.role === 'admin' && <Link href="/admin">Quản trị</Link>}
        <span className="spacer" />
        {status === 'loading' ? null : user ? (
          <>
            <span className="greeting">Xin chào, {user.name} ({user.role})</span>
            <button type="button" className="btn btn-light" onClick={() => signOut({ redirectTo: '/' })}>
              Đăng xuất
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-light">Đăng nhập</Link>
        )}
      </nav>
    </header>
  );
}
