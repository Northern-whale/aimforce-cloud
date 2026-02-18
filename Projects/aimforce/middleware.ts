import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Redirect root to appropriate dashboard
    if (path === '/') {
      if (token?.role === 'OWNER') {
        return NextResponse.redirect(new URL('/owner', req.url))
      } else if (token?.role === 'CLIENT') {
        return NextResponse.redirect(new URL('/portal', req.url))
      }
    }

    // Protect owner routes
    if (path.startsWith('/owner') && token?.role !== 'OWNER') {
      return NextResponse.redirect(new URL('/portal', req.url))
    }

    // Protect client portal routes
    if (path.startsWith('/portal') && token?.role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/owner', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: ['/', '/owner/:path*', '/portal/:path*'],
}
