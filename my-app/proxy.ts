import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = ['en', 'fr', 'ar'] as const;
const PUBLIC_AUTH_PAGES = ['/login', '/signup', '/forgot', '/reset-password','/books'];

function decodeRoleFromToken(token: string | undefined): 'admin' | 'public' | null {
  if (!token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const payloadBase64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = payloadBase64 + '='.repeat((4 - (payloadBase64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { role?: string };

    if (payload.role === 'admin' || payload.role === 'public') {
      return payload.role;
    }

    return null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const defaultLocale = 'en'
  const pathname = request.nextUrl.pathname

  const hasLocale = LOCALES.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (!hasLocale) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url))
  }

  const [, locale, ...segments] = pathname.split('/');
  const localPath = `/${segments.join('/')}`;
  const isAdminPage = localPath === '/admin' || localPath.startsWith('/admin/');

  const token = request.cookies.get('authToken')?.value;
  const role = decodeRoleFromToken(token);

  if (isAdminPage) {
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
    if (role !== 'admin') {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
    return NextResponse.next();
  }

  if (localPath === '/login' || localPath === '/signup') {
    if (token && role) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}