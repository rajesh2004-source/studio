import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'pettyflow_session';

const protectedRoutes = ['/dashboard', '/transactions', '/vendors', '/reports'];
const publicRoutes = ['/', '/login', '/signup'];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isProtectedRoute && !sessionCookie) {
    // Add the original destination to the redirect URL
    const absoluteURL = new URL('/login', request.nextUrl.origin);
    absoluteURL.searchParams.set('next', pathname);
    return NextResponse.redirect(absoluteURL);
  }

  if (sessionCookie && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
