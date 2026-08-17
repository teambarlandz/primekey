# Accessibility — Primekey Homes

> Status: draft · Version: 0.1 · Owner: @teambarlandz · Last updated: 2026-08-17
> Baseline: WCAG 2.1 AA for public pages. Audit checklist below is the manual
> gate before go-live.

## 1. What is already in place

- **Reduced motion:** all GSAP animations gate on `prefersReducedMotion()`
  (`lib/animations.ts`) — no scroll-triggered movement for those users.
- **Semantic primitives:** shadcn/ui components wrap Radix UI (accessible
  dialog, select, checkbox, tabs, toast) with proper ARIA roles, focus
  management, and escape-key handling.
- **Forms:** react-hook-form + shadcn `Form` wrappers render real `<label>`s
  and inline error messages (`FormMessage`), announced by screen readers.
  Contact/concierge/landlord forms follow the same pattern.
- **Keyboard:** all modals (Concierge, auth intercept, booking) support Tab /
  Escape navigation via Radix; interactive cards and dropdowns are
  focusable.
- **Color contrast:** brand palette was chosen for contrast on lavender
  (`#f3f0ff`) and white surfaces; admin dark mode overrides were contrast
  checked during the dark-theme pass.

## 2. Standards

- Public routes: WCAG 2.1 AA.
- Admin (django-unfold): best-effort AA; staff-only surface.
- Target devices: mobile-first (tap targets >= 44px on primary CTAs).

## 3. Audit checklist (go-live gate)

- [ ] Screen-reader pass: NVDA (Windows) + TalkBack (Android) on the landing,
      search, concierge modal, landlord intake, booking, dashboard.
- [ ] Keyboard-only pass: full journey without mouse (focus ring visible).
- [ ] 200% font scale: no horizontal scroll or clipped forms.
- [ ] Color check: form errors are not color-only (icon/text redundancy);
      focus states visible in both light and dark modes.
- [ ] GSAP animations disabled under `prefers-reduced-motion` (verified).
- [ ] All images have `alt` or are marked decorative; charts have text
      equivalents in the dashboard stat cards.

## 4. Known gaps (tracked)

- `next/image` alts on some marketing assets need a content pass.
- Dashboard tables (LeadTable etc.) lack sort announcements for screen
  readers; considered low-risk (staff-only) but scheduled.
- Modal focus trap is Radix-default; verify after any dialog customization.