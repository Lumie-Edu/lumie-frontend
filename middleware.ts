import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected route patterns
const DASHBOARD_ROUTES = /^\/dashboard(\/.*)?$/;
const ADMIN_ROUTES = /^\/admin(\/.*)?$/;
const AUTH_ROUTES = /^\/(login|register)$/;

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/api/health',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/api/');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for session in cookies (set by Zustand persist)
  const sessionCookie = request.cookies.get('lumie-session');
  let session: { user?: { role?: string } } | null = null;

  if (sessionCookie?.value) {
    try {
      const decoded = decodeURIComponent(sessionCookie.value);
      const parsed = JSON.parse(decoded);
      session = parsed?.state ?? null;
    } catch {
      // Invalid session cookie
    }
  }

  // Also check localStorage via custom header (client-side redirect handles this)
  // For middleware, we primarily rely on the cookie

  const isAuthenticated = session?.user != null;
  const userRole = session?.user?.role;

  // Not authenticated - redirect to home with login modal
  if (!isAuthenticated) {
    // Don't redirect if already on auth routes or home
    if (AUTH_ROUTES.test(pathname) || pathname === '/') {
      return NextResponse.next();
    }
    const homeUrl = new URL('/', request.url);
    homeUrl.searchParams.set('auth', 'login');
    homeUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(homeUrl);
  }

  // Already authenticated - redirect away from auth pages
  if (AUTH_ROUTES.test(pathname)) {
    const redirectUrl = userRole === 'STUDENT' ? '/dashboard' : '/admin';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Role-based route protection
  if (DASHBOARD_ROUTES.test(pathname)) {
    // Dashboard is for STUDENT only
    if (userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  if (ADMIN_ROUTES.test(pathname)) {
    // Admin is for ADMIN and DEVELOPER only
    if (userRole === 'STUDENT') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
