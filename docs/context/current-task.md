# Current Task

This is the active directive for the current development session. It tells the AI exactly what to build right now.

## Active Phase
**Phase:** Phase 1 — Buyer/Renter Pathway (Bounded Context: Buyer)
**Status:** In Progress (Unit 1.1 Marketing Landing Page Complete; Moving to Search Interface)

## Current Unit
**Unit ID:** 1.2
**Name:** Dynamic Property Search (UI & Filters)

**Description:** 
Build the primary property search page (`/search`) for authenticated buyers and renters. The page will feature interactive search filters (location input, price range sliders/inputs, property type dropdown, and bedroom count selectors) and layout slots for the property results grid. Connect form states using `react-hook-form` and `zod` for client-side query validation. Apply the established Deep Blue design system (`#04164a` Brand Navy, `#f3f0ff` Lavender background) and Google Fonts (`Poppins` headings, `Lora` body).

## Acceptance Criteria
- [ ] **Route Setup:** `/search/page.tsx` exists and is accessible behind the Auth Gate layout wrapper.
- [ ] **Design Tokens & Theme:** Page uses the `#f3f0ff` Lavender background, `#04164a` Brand Navy text/buttons, and card surfaces (`bg-white/90 backdrop-blur-sm`).
- [ ] **Typography:** All page/section headings use `font-heading` (`Poppins`), and descriptions/filter labels use `font-body` (`Lora`).
- [ ] **Filter Components:**
  - Location input with autocomplete or quick-select pills (e.g., Lekki, Ikoyi, Victoria Island, Maitama, Wuse II).
  - Price Range selector (Min/Max in Naira ₦).
  - Property Type dropdown (e.g., Apartment, Duplex, Terrace, Penthouse, Fully Detached).
  - Bedroom count filter (e.g., 1, 2, 3, 4+ Bedrooms).
- [ ] **Form Validation:** Search filters managed via `react-hook-form` with `zod` schema parsing.
- [ ] **Component Enforcement:** All form controls utilize `shadcn/ui` components (`Input`, `Select`, `Button`, `Slider`, `Badge`) extended via Tailwind.
- [ ] **GSAP Entrance:** Filter panel and search headers animate into view using `@gsap/react` `useGSAP` hooks respecting `prefersReducedMotion()`.
- [ ] **Responsive Design:** Filters collapse gracefully into an accordion or mobile drawer on screens < 768px (`md:` breakpoint).

## Files to Modify / Create
| File | Purpose |
| --- | --- |
| `app/search/page.tsx` | Main property search portal route and layout container. |
| `components/search/SearchBar.tsx` | Main top-level search input with quick location filters. |
| `components/search/FilterDropdown.tsx` | Filter controls for property type, price range, and bedrooms. |
| `components/search/PriceRange.tsx` | Min/Max Naira price range slider and input controls. |
| `lib/validations/searchSchema.ts` | Zod validation schema for search filter parameters. |

## Out of Scope
- Backend API integration (`GET /api/search`) — handled in Unit 1.9.
- Results grid and individual property cards — handled in Unit 1.3.
- Conditional "Not Found" Concierge Modal trigger logic — handled in Unit 1.4.

## Context Reminders
- **Brand Colors:** Exact Brand Navy (`#04164a`)[span_0](start_span)[span_0](end_span)[span_1](start_span)[span_1](end_span)[span_2](start_span)[span_2](end_span)[span_3](start_span)[span_3](end_span)[span_4](start_span)[span_4](end_span)[span_5](start_span)[span_5](end_span)[span_6](start_span)[span_6](end_span) and Lavender background (`#f3f0ff`)[span_7](start_span)[span_7](end_span)[span_8](start_span)[span_8](end_span)[span_9](start_span)[span_9](end_span)[span_10](start_span)[span_10](end_span)[span_11](start_span)[span_11](end_span)[span_12](start_span)[span_12](end_span).
- **Typography:** `Poppins` for Headings (`font-heading`)[span_13](start_span)[span_13](end_span) and `Lora` for Body/Text (`font-body`)[span_14](start_span)[span_14](end_span).
- **Component Library:** Use `shadcn/ui` components in `components/ui/*`. Do not modify source code[span_15](start_span)[span_15](end_span).
- **Animations:** Use `@gsap/react` `useGSAP` hook[span_16](start_span)[span_16](end_span)[span_17](start_span)[span_17](end_span)[span_18](start_span)[span_18](end_span)[span_19](start_span)[span_19](end_span)[span_20](start_span)[span_20](end_span) with helpers from `lib/animations.ts`[span_21](start_span)[span_21](end_span)[span_22](start_span)[span_22](end_span)[span_23](start_span)[span_23](end_span)[span_24](start_span)[span_24](end_span)[span_25](start_span)[span_25](end_span).
- **Currency:** Always format prices in Naira (`₦`).

## Dependencies
- `ui-context.md` (for color tokens and component styling)
- `code-standards.md` (for react-hook-form + zod standards)
- `architecture.md` (for Buyer Context query data structures)

## Estimated Time
2-3 hours

## Definition of Done
- All acceptance criteria above are satisfied.
- `npm run build` passes with zero TypeScript or ESLint errors.
- Filter UI is fully responsive and interactive on mobile, tablet, and desktop viewports.
- Search state updates correctly without triggering unhandled full-page re-renders.
