import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth';


export async function middleware(req: NextRequest) {
  const session = await getSession();
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === '/';
  const isEmployeePath = pathname.startsWith('/dashboard') || pathname.startsWith('/attendance');
  const isAdminPath = pathname.startsWith('/sk-admin');

  if (session) {
    // If logged in, and trying to access login page, redirect to their dashboard
    if (isLoginPage) {
      const url = session.role === 'admin' ? '/sk-admin/dashboard' : '/dashboard';
      return NextResponse.redirect(new URL(url, req.url));
    }

    // If employee tries to access admin routes, redirect to employee dash
    if (session.role === 'employee' && isAdminPath) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If admin tries to access employee routes, redirect to admin dash
    if (session.role === 'admin' && isEmployeePath) {
      return NextResponse.redirect(new URL('/sk-admin/dashboard', req.url));
    }
  } else {
    // If not logged in and trying to access a protected route, redirect to login
    if (isEmployeePath || isAdminPath) {
        const loginUrl = new URL('/', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except for static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
