import { NextRequest, NextResponse } from 'next/server'
import { ROUTES } from '@/constants/routes'

const PROTECTED_ROUTES = [ROUTES.ACCOUNT.ROOT]
const AUTH_ROUTES = [ROUTES.AUTH.LOGIN, ROUTES.AUTH.VERIFY]

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r))

  if (!token && isProtected) {
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url))
  }
  if (token && isAuth) {
    return NextResponse.redirect(new URL(ROUTES.ACCOUNT.ROOT, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/auth/:path*'],
}
