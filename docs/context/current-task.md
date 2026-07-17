# Current Task

This is the active directive for the current development session. It tells the AI exactly what to build right now.

## Active Phase
**Phase:** Phase 1 — Buyer/Renter Pathway (Bounded Context: Buyer)
**Status:** In Progress (Skeletal structure complete, styling & interactivity pending)

## Current Unit
**Unit ID:** 1.1
**Name:** Landing Page UI (Styling, Localization & Interactivity)

**Description:** 
Transform the existing skeletal `.tsx` structure into the final Primekey Homes marketing surface. Apply the Deep Blue design system and Playfair Display/Inter typography. Refactor raw HTML inputs in `FinalCTA.tsx` to shadcn/ui components. Localize all copy to reflect **Primekey Homes and Properties Ltd.** and the Nigerian market. Integrate GSAP for premium scroll-triggered animations and micro-interactions.

## Acceptance Criteria
- [ ] **Design Tokens:** `globals.css` is updated with the Deep Blue CSS custom properties (e.g., `--primary-deep`, `--gradient-hero`) and Google Fonts (Playfair Display, Inter) are imported in `layout.tsx`.
- [ ] **Component Library Enforcement:** `FinalCTA.tsx` raw HTML `<input>`, `<select>`, and `<button>` tags are refactored to use shadcn/ui components (`Input`, `Select`, `Button`) and `react-hook-form` with `zod` validation.
- [ ] **Localization:** All placeholder copy ("PropNest", "Priya", "Bengaluru", "₹1,200 Cr") is replaced with **Primekey Homes**, Nigerian names (e.g., "Chinedu", "Lagos"), Nigerian locations, and Naira (₦) currency.
- [ ] **Hero Styling:** The Hero section background uses `--gradient-hero` (deep blue gradient), and the primary CTA uses `--gradient-cta`.
- [ ] **Typography:** All headings use `font-[var(--font-heading)]` (Playfair Display) and body text uses `font-[var(--font-body)]` (Inter).
- [ ] **GSAP Integration:** Hero elements (headline, CTAs, floating card) have staggered entrance animations. Benefits and SocialProof sections have scroll-triggered fade-ins using `@gsap/react` and `ScrollTrigger`.
- [ ] **Mobile Responsiveness:** All sections (especially Navbar mobile menu, Benefits grid, and FinalCTA form) are fully responsive and stack correctly on screens < 640px.
- [ ] **No Hardcoded Colors:** Zero hardcoded hex values remain in any `.tsx` file. All colors reference CSS variables.
- [ ] **Reduced Motion:** GSAP animations are disabled if the user's OS prefers reduced motion.

## Files to Modify
| File | Purpose |
| --- | --- |
| `app/globals.css` | Define Deep Blue CSS custom properties, gradients, and base typography. |
| `app/layout.tsx` | Import Google Fonts (Playfair Display, Inter) and apply to root HTML. |
| `components/Navbar.tsx` | Style mobile menu and apply Tailwind + CSS variables. |
| `components/Hero.tsx` | Apply `--gradient-hero`, update copy, style CTAs with `--gradient-cta`, add GSAP staggered entrance. |
| `components/SocialProof.tsx` | Localize copy (Nigerian names/locations, Naira currency), apply typography tokens, add GSAP scroll-triggered fade-ins. |
| `components/Benefits.tsx` | Localize copy, apply typography tokens, style comparison table and split section, add GSAP scroll-triggered fade-ins. |
| `components/FAQ.tsx` | Localize copy, style accordion using shadcn/ui patterns if applicable. |
| `components/FinalCTA.tsx` | **Refactor to shadcn/ui** (`Input`, `Select`, `Button`), localize copy, apply form styling. |
| `components/Footer.tsx` | Verify Primekey Homes branding, apply typography tokens and Tailwind styling. |
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
- **GSAP:** Always use the `useGSAP` hook from `@gsap/react` to prevent memory leaks. Respect `prefers-reduced-motion`.
- **Mobile-First:** Ensure the Navbar collapses correctly and forms are usable on small screens.
- **No Backend Changes:** This is a purely frontend styling and interactivity unit.

## Dependencies
- `ui-context.md` (for design tokens and typography rules)
- `userflow.md` (for correct routing paths and copy context)
- `code-standards.md` (for shadcn/ui, Tailwind, and GSAP rules)
- `dependencies.md` (confirms `gsap` and `@gsap/react` are installed)

## Estimated Time
4-5 hours

## Definition of Done
- All acceptance criteria above are satisfied.
- `npm run build` passes (no TypeScript errors, no linting errors).
- The page is visually coherent, beautifully animated, and responsive on mobile, tablet, and desktop.
- The page uses only the CSS custom properties from `ui-context.md` (no hardcoded hex values).
- `FinalCTA.tsx` successfully uses shadcn/ui components and `react-hook-form`.
- No backend code was modified.

## Notes
- This unit transforms the raw skeletal structure into the actual Primekey Homes marketing surface. 
- Pay special attention to the `FinalCTA.tsx` refactoring, as it currently uses raw HTML inputs which violates our `code-standards.md`.
- Ensure the Deep Blue gradient in the Hero section has sufficient contrast for white text (WCAG AA compliant).
- When adding GSAP, create a `lib/animations.ts` file to store standard durations and easings (e.g., `duration: 0.6`, `ease: "power2.out"`) to ensure consistency across components.

**Ready to begin Unit 1.1 (Styling, Localization & Interactivity).**