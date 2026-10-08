import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/admin/login', '/admin/forgot-password', '/admin/forgot-password/verify', '/admin/reset-password']

// Optimistic check only: the panel layout validates the session itself.
// Public pages are never redirected from here, to avoid loops with stale cookies.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()
  if (!request.cookies.has('tc_admin_session')) {
    const url = new URL('/admin/login', request.url)
    if (pathname !== '/' && pathname !== '/admin/dashboard' && pathname !== '/admin') {
      url.searchParams.set('next', pathname)
    }
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*'],
}
