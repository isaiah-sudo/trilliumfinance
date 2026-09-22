import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('__session')?.value;
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Detect news subdomain (e.g. news.trilliumfinance.net or news.localhost:3000 or news.127.0.0.1.nip.io)
  const isNewsSubdomain = host.startsWith('news.') || host.includes('news.trilliumfinance.net') || host.includes('news.localhost');

  if (isNewsSubdomain) {
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/dashboard/news/catalog', request.url));
    }
    if (pathname.startsWith('/article/')) {
      const articleId = pathname.replace('/article/', '');
      return NextResponse.rewrite(new URL(`/dashboard/news/${articleId}`, request.url));
    }
  }

  // Seamlessly redirect legacy news catalog paths to dashboard news catalog
  if (pathname === '/news-catalog') {
    return NextResponse.redirect(new URL('/dashboard/news/catalog', request.url));
  }
  if (pathname.startsWith('/news-catalog/')) {
    const articleId = pathname.replace('/news-catalog/', '');
    return NextResponse.redirect(new URL(`/dashboard/news/${articleId}`, request.url));
  }

  // Protect dashboard, teacher, and education routes (excluding /edu/auth onboarding)
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/teacher') || 
    (pathname.startsWith('/edu') && !pathname.startsWith('/edu/auth'));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, _next resources, and static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon.*\\.png|icon.svg).*)'],
};
