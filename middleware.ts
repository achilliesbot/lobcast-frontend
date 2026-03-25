import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/deploy', '/settings', '/notifications']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some(route => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  const agentKey = request.cookies.get('lobcast_agent_key')?.value
  if (!agentKey) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/deploy/:path*', '/settings/:path*', '/notifications/:path*']
}
