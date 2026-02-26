import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const defaultLocale = 'en'
  const pathname = request.nextUrl.pathname
  
  if (pathname.startsWith('/en') || pathname.startsWith('/fr') || pathname.startsWith('/ar')) {
    return NextResponse.next()
  }
  
  return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url))
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}