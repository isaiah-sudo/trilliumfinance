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
      return NextResponse.rewrite(new URL('/news-catalog', request.url));
    }
    if (pathname.startsWith('/article/')) {
      const articleId = pathname.replace('/article/', '');
      return NextResponse.rewrite(new URL(`/news-catalog/${articleId}`, request.url));
    }
  }

  // Protect dashboard and education routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/edu');
  
  // Auth routing: redirect authenticated users away from login/signup
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

  if (isProtectedRoute && !token) {
    // Bypass redirects for client-side prefetching or data routing to prevent navigation layout breakage
    const isNextInternal = 
      pathname.startsWith('/_next') || 
      request.headers.has('x-nextjs-data') || 
      request.headers.get('purpose') === 'prefetch';

    if (isNextInternal) {
      return NextResponse.next();
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, _next resources, and static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
