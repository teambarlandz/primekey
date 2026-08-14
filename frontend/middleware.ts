import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require agent authentication
const AGENT_PROTECTED = ['/dashboard/agent'];

// Routes that require landlord authentication
const LANDLORD_PROTECTED = ['/landlord/dashboard', '/landlord/intake', '/landlord/inspection-booking'];

function hasSessionCookie(request: NextRequest, cookieName: string): boolean {
  const cookie = request.cookies.get(cookieName);
  return !!cookie && cookie.value === '1';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check agent-protected routes
  if (AGENT_PROTECTED.some((route) => pathname.startsWith(route))) {
    if (!hasSessionCookie(request, 'pk_agent_session')) {
      const loginUrl = new URL('/dashboard/agent/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check landlord-protected routes
  if (LANDLORD_PROTECTED.some((route) => pathname.startsWith(route))) {
    if (!hasSessionCookie(request, 'pk_landlord_session')) {
      const loginUrl = new URL('/landlord/register', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/agent/:path*',
    '/landlord/dashboard/:path*',
    '/landlord/intake/:path*',
    '/landlord/inspection-booking/:path*',
  ],
};
