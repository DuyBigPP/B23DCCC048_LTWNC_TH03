import { NextResponse } from 'next/server';
import { auth } from './auth';

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const user = req.auth?.user;

  if (!user) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/forbidden', req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/my-posts/:path*', '/admin/:path*'],
};
