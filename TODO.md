# TODO — Gated Flows Fix

## HIGH PRIORITY (Security & Core Functionality)

- [x] Fix AuthInterceptSheet: Execute gated actions (save, favorite, book) after successful OTP verification instead of console.log
- [x] Add server-side middleware.ts to protect /dashboard/agent and /landlord/* routes (redirect to login if no valid session)
- [x] Add landlord logout button to landlord dashboard UI (clear localStorage primekey_landlord_id and redirect to /)
- [ ] Fix landlord auth: Add JWT-based auth for landlord routes instead of relying on localStorage UUID alone

## MEDIUM PRIORITY (UX Polish)

- [x] Add loading/spinner state to AuthInterceptSheet during OTP verification to prevent double-submit
- [x] Add success toast/notification after gated action completes (e.g. 'Property saved!', 'Inspection booked!')
- [x] Add error handling in AuthInterceptSheet for failed OTP or network errors
- [x] Close AuthInterceptSheet automatically after successful action and show confirmation
- [x] Add session expiry warning modal for agent dashboard before 30-min idle timeout kicks in
- [x] Audit all gated routes to ensure deep-link callbackUrl works correctly after login (e.g. /property/123?save=true)

## LOW PRIORITY (Enhancement)

- [x] Add rate limiting feedback to users on OTP requests (show countdown timer instead of just disabling button)
- [x] Add 'Remember this device' option to reduce OTP friction for repeat logins
