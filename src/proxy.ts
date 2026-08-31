import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude static assets, icons, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  const sessionCookie = request.cookies.get('mun_session');
  let session = null;
  
  if (sessionCookie) {
    session = await verifySession(sessionCookie.value);
  }
  
  // Protected path checklist
  const isProtectedPath =
    pathname === '/' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/resolutions') ||
    pathname.startsWith('/resolution') ||
    pathname.startsWith('/committee') ||
    pathname.startsWith('/chair') ||
    pathname.startsWith('/admin');
    
  // 1. Redirection if user is NOT authenticated
  if (isProtectedPath && !session) {
    // Treat root URL as dashboard redirection or login page
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 2. Redirection if user IS authenticated and tries to visit login or root
  if ((pathname === '/login' || pathname === '/') && session) {
    if (session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (session.role === 'CHAIR') {
      return NextResponse.redirect(new URL('/chair', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // 3. Role-Based Access Control Restrictions
  if (session) {
    // Only ADMIN can access /admin
    if (pathname.startsWith('/admin') && session.role !== 'ADMIN') {
      const destination = session.role === 'CHAIR' ? '/chair' : '/dashboard';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    
    // Only CHAIR or ADMIN can access /chair
    if (pathname.startsWith('/chair') && !['CHAIR', 'ADMIN'].includes(session.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
