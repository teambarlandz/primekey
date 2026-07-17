# Current Task

This is the active directive for the current development session. It tells the AI exactly what to build right now.

## Active Phase
**Phase:** Phase 1 — Buyer/Renter Pathway (Bounded Context: Buyer)
**Status:** In Progress (Skeletal structure complete, styling & interactivity pending)

## Current Unit
**Unit ID:** 1.1
**Name:** Landing Page UI (Styling & Interactivity)

**Description:** 
Apply the Deep Blue design system and Playfair Display/Inter typography to the existing skeletal structure. Refactor raw HTML inputs in `FinalCTA.tsx` to shadcn/ui components. Localize all copy to reflect **Primekey Homes and Properties Ltd.** and the Nigerian market. Fix routing mismatches in `Navbar.tsx` to align with `userflow.md`.

## Acceptance Criteria
- [ ] **Design Tokens:** `globals.css` is updated with the Deep Blue CSS custom properties (e.g., `--primary-deep`, `--gradient-hero`) and Google Fonts (Playfair Display, Inter) are imported in `layout.tsx`.
- [ ] **Component Library Enforcement:** `FinalCTA.tsx` raw HTML `<input>`, `<select>`, and `<button>` tags are refactored to use shadcn/ui components (`Input`, `Select`, `Button`).
- [ ] **Routing Fixes:** `Navbar.tsx` links are updated from `/buy-rent`, `/list`, and `/builders` to `/search`, `/landlord`, and `/builder` respectively.
- [ ] **Localization:** All placeholder copy ("PropNest", "Priya", "Bengaluru", "1,200 Cr") is replaced with **Primekey Homes**, Nigerian names (e.g., "Chinedu", "Lagos"), Nigerian locations, and Naira (₦) currency.
- [ ] **Hero Styling:** The Hero section background uses `--gradient-hero` (deep blue gradient), and the primary CTA uses `--gradient-cta`.
- [ ] **Typography:** All headings use `font-[var(--font-heading)]` (Playfair Display) and body text uses `font-[var(--font-body)]` (Inter).
- [ ] **Mobile Responsiveness:** All sections (especially Navbar mobile menu, Benefits grid, and FinalCTA form) are fully responsive and stack correctly on screens < 640px.
- [ ] **No Hardcoded Colors:** Zero hardcoded hex values remain in any `.tsx` file. All colors reference CSS variables.

## Files to Modify
| File | Purpose |
| --- | --- |
| `app/globals.css` | Define Deep Blue CSS custom properties, gradients, and base typography. |
| `app/layout.tsx` | Import Google Fonts (Playfair Display, Inter) and apply to root HTML. |
| `components/Navbar.tsx` | Fix routing links (`/search`, `/landlord`, `/builder`) and style mobile menu. |
| `components/Hero.tsx` | Apply `--gradient-hero`, update copy, style CTAs with `--gradient-cta`. |
| `components/SocialProof.tsx` | Localize copy (Nigerian names/locations, Naira currency), apply typography tokens. |
| `components/Benefits.tsx` | Localize copy, apply typography tokens, style comparison table and split section. |
| `components/FAQ.tsx` | Localize copy, style accordion using shadcn/ui patterns if applicable. |
| `components/FinalCTA.tsx` | **Refactor to shadcn/ui** (`Input`, `Select`, `Button`), localize copy, apply form styling. |
| `components/Footer.tsx` | Verify Primekey Homes branding, apply typography tokens. |
| `components/FloatingContact.tsx` | Style the WhatsApp sticky button using `--primary-medium` or `--gradient-cta`. |

## Out of Scope
- Authentication Gate implementation (`middleware.ts`) — handled in Unit 1.12.
- Search functionality and filters — handled in Unit 1.2.
- Concierge modal logic — handled in Unit 1.4.
- Backend APIs and database schema — handled in Units 1.6+.

## Context Reminders
- **Use CSS custom properties** from the Colors section in `ui-context.md` — no hardcoded hex values.
- **Use shadcn/ui components** from `components/ui/` — do not modify their source code. Extend via `className`.
- **Typography:** Playfair Display for headings, Inter for body.
- **Company Name:** Always use **Primekey Homes and Properties Ltd.** (or Primekey Homes for short).
- **Mobile-First:** Ensure the Navbar collapses correctly and forms are usable on small screens.
- **No Backend Changes:** This is a purely frontend styling and interactivity unit.

## Dependencies
- `ui-context.md` (for design tokens and typography rules)
- `userflow.md` (for correct routing paths)
- `code-standards.md` (for shadcn/ui and Tailwind rules)

## Estimated Time
3-4 hours

## Definition of Done
- All acceptance criteria above are satisfied.
- `npm run build` passes (no TypeScript errors, no linting errors).
- The page is visually coherent and responsive on mobile, tablet, and desktop.
- The page uses only the CSS custom properties from `ui-context.md` (no hardcoded hex values).
- `FinalCTA.tsx` successfully uses shadcn/ui components.
- No backend code was modified.

## Notes
- This unit transforms the raw skeletal structure into the actual Primekey Homes marketing surface. 
- Pay special attention to the `FinalCTA.tsx` refactoring, as it currently uses raw HTML inputs which violates our `code-standards.md`.
- Ensure the Deep Blue gradient in the Hero section has sufficient contrast for white text (WCAG AA compliant).

**Ready to begin Unit 1.1 (Styling & Interactivity).**