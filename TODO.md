# TODO — Contact Form Email Delivery

## Status: COMPLETE (console backend)

All code is wired and working. Emails print to the Django console (terminal) during development.

---

## What was built

### Backend (`apps/contact/`)
- **Model** — `ContactMessage` (persists all submissions to DB)
- **Serializer** — validates `full_name`, `email`, `phone`, `subject`, `message`
- **View** — `POST /api/v1/contact/` — saves to DB + sends email via `django.core.mail.send_mail()`
- **Rate limit** — 5/min per IP
- **Migration** — `0001_initial.py` applied

### Frontend
- `submitContactForm()` in `api-client.ts`
- `/contact` page wired to call the API (replaces simulated delay)

### Settings (`core/settings.py`)
- `EMAIL_BACKEND` defaults to `console.EmailBackend` (prints to terminal)
- `CONTACT_RECIPIENT_EMAIL` defaults to `hello@primekeyhomes.com`

---

## To switch to real Hostinger SMTP

1. Create mailbox `hello@primekeyhomes.com` in Hostinger hPanel
2. Add to `backend/.env`:
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USE_SSL=True
EMAIL_USE_TLS=False
EMAIL_HOST_USER=hello@primekeyhomes.com
EMAIL_HOST_PASSWORD=<your-password>
```
3. Restart Django server

---

## Files created/modified
- `backend/core/settings.py` — EMAIL_* settings
- `backend/apps/contact/__init__.py`
- `backend/apps/contact/apps.py`
- `backend/apps/contact/models.py`
- `backend/apps/contact/serializers.py`
- `backend/apps/contact/views.py`
- `backend/apps/contact/urls.py`
- `backend/apps/contact/migrations/0001_initial.py`
- `backend/core/settings.py` — INSTALLED_APPS
- `backend/core/urls.py` — contact endpoint
- `frontend/lib/api-client.ts` — submitContactForm()
- `frontend/app/contact/page.tsx` — wired onSubmit

---

# TODO — Dark Mode: Complete Theme Overrides

## Status: COMPLETE

The admin panel (django-unfold) has a built-in dark mode toggle, but only a handful of components have dark overrides. This task adds comprehensive dark mode styling for every component.

---

## What exists today

- `.dark body` / `#content-main` → background `#1a1b26`
- `.dark table` → dark header, alternating rows, hover
- `.dark input/select/textarea` → dark bg, light text
- `.dark fieldset` → subtle border
- `.dark .bg-white` → dark card surface
- `.dark .kpi-card` → dark bg, light metric text

## What is missing

1. **Scrollbar** — track/thumb still use lavender palette
2. **Buttons** — primary, secondary, destructive still use light-mode navy/danger
3. **Badges** — success/warning/danger/info/primary/neutral pill badges
4. **Sidebar** — background, section headings, links
5. **Header / Brand Bar** — already dark but may need border/shadow adjustments
6. **Login page** — inline styles in template; gradient bg + frosted glass card + form fields
7. **Pipeline Banner** — gradient hero treatment
8. **Charts** — container surface, title/subtitle text
9. **Quick Actions** — pill button hover states
10. **Footer** — background, border, link colors
11. **Messages / Alerts** — success/warning/error/info background tints
12. **Delete Confirmation** — warning banner bg
13. **Fieldset legends** — text color override
14. **Generic card hover** — `a[href].bg-white` shadow/transform

---

## Files to modify

| File | Change |
|------|--------|
| `backend/core/static/admin/css/custom.css` | Expand dark mode section (lines 712–752) with overrides for all 14 components above |
| `backend/core/templates/admin/login.html` | Add `.dark` scoped inline styles for login page (gradient bg, card, fields, button) |

## Approach

1. Replace the existing thin dark mode block (lines 712–752) with a comprehensive section covering every component
2. Add a `<style>` block inside `login.html` scoped under `.dark` for the login page overrides
3. Follow existing naming conventions (`.dark .class-name` and `[class*="dark"] .class-name` dual selectors)
4. Keep the dark palette consistent: bg `#1a1b26`, surfaces `rgba(26, 27, 38, 0.92)`, borders `rgba(59, 89, 193, 0.12)`, text `rgba(255, 255, 255, 0.9)`, muted `rgba(255, 255, 255, 0.5)`

## Verification

- Toggle dark mode in the admin panel header
- Visually inspect: dashboard, login page, changelist tables, edit forms, sidebar, badges, messages
- Confirm no contrast issues or unreadable text

---

# TODO — Sign-Out: Add Sign-Out to All Authenticated Pages

## Status: COMPLETE

## Current state

| Page | Has sign-out? | Mechanism |
|------|:---:|-----------|
| Agent Dashboard (`/dashboard/agent`) | Yes | `clearAgentSession()` → redirect to agent login |
| Landlord Dashboard (`/landlord/dashboard`) | Yes | Manual localStorage + cookie clear → redirect to `/` |
| `Navbar` (site-wide) | **No** | Always shows "Login", never checks auth |
| `SiteNav` (site-wide drawer) | **No** | Always shows "Login", never checks auth |
| `/account/saved` | **No** | Checks `isUserLoggedIn()`, no sign-out button |
| `/landlord/intake` | **No** | Uses `LandlordGate`, no sign-out |
| `/landlord/inspection-booking` | **No** | Uses `LandlordGate`, no sign-out |

## Auth model

- **Users (buyers/landlords):** `isUserLoggedIn()` / `clearUserSession()` — sessionStorage + optional localStorage persistent token
- **Agents:** `isAgentLoggedIn()` / `clearAgentSession()` — sessionStorage only
- **Landlord sessions:** `getStoredLandlordId()` — localStorage `primekey_landlord_id` + cookie `pk_landlord_session`

## Plan

### 1. `Navbar` (`components/Navbar.tsx`)
- Import `isUserLoggedIn`, `clearUserSession`, `useRouter`
- Add `useState` + `useEffect` to check auth on mount
- Conditionally render "Sign Out" button (with `LogOut` icon) instead of "Login" when authed
- On click: `clearUserSession()` + `router.push('/')`
- Mobile menu: same conditional

### 2. `SiteNav` (`components/SiteNav.tsx`)
- Same pattern: check auth, conditionally show "Sign Out" in the drawer
- On click: `clearUserSession()` + close drawer + `router.push('/')`

### 3. `/account/saved` (`app/account/saved/page.tsx`)
- Add a "Sign Out" button in the page header area (next to the heading)
- On click: `clearUserSession()` + redirect to `/`

### 4. `/landlord/intake` (`app/landlord/intake/page.tsx`)
- Add a small "Sign Out" button in the top-right of the page
- On click: clear `primekey_landlord_id` + `pk_landlord_session` cookie + redirect to `/`

### 5. `/landlord/inspection-booking` (`app/landlord/inspection-booking/page.tsx`)
- Same pattern as intake page

## Files to modify

| File | Change |
|------|--------|
| `frontend/components/Navbar.tsx` | Auth-aware login/sign-out toggle (desktop + mobile) |
| `frontend/components/SiteNav.tsx` | Auth-aware login/sign-out toggle in drawer |
| `frontend/app/account/saved/page.tsx` | Add sign-out button in header |
| `frontend/app/landlord/intake/page.tsx` | Add sign-out button |
| `frontend/app/landlord/inspection-booking/page.tsx` | Add sign-out button |

## Verification

- Visit `/account/saved` while logged in → should see "Sign Out" button
- Click Sign Out → session cleared, redirected to `/`, navbar shows "Login" again
- Visit `/landlord/intake` → sign-out clears landlord session
- Navbar on every page shows "Sign Out" when authenticated, "Login" when not
