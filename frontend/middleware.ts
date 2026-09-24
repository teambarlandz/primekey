import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require agent authentication
const AGENT_PROTECTED = ['/dashboard/agent'];

// Routes that require landlord authentication
const LANDLORD_PROTECTED = ['/landlord/dashboard', '/landlord/intake', '/landlord/inspection-booking'];

/**
 * UX-only route guard — NOT a security boundary.
 * Real authorization is enforced on the API by DRF permissions
 * (IsAuthenticated + IsAgent / IsManager, see backend/apps/dashboard/permissions.py).
 * Tokens live in sessionStorage; these cookies are just lightweight hints set by
 * client JS after OTP login so the edge can redirect unauthenticated navigations.
 * Forging the cookie grants no API access without a valid Bearer JWT.
 */
function hasSessionCookie(request: NextRequest, cookieName: string): boolean {
  const cookie = request.cookies.get(cookieName);
  if (!cookie?.value) return false;
  // If the cookie ever holds a JWT (future HttpOnly migration), validate expiry.
  // Current value is "1" set by client JS — accept any non-empty string.
  const value = cookie.value;
  if (value.includes('.') && value.split('.').length === 3) {
    try {
      const payload = JSON.parse(
        atob(value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
      if (typeof payload.exp === 'number' && Date.now() / 1000 >= payload.exp) {
        return false;
      }
    } catch {
      // Not a valid JWT — fall through to existence check
    }
  }
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check agent-protected routes (exempt the login page itself)
  if (pathname !== '/dashboard/agent/login' && AGENT_PROTECTED.some((route) => pathname.startsWith(route))) {
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
