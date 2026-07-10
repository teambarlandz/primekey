# Current Task

This is the active directive for the current development session. It tells the AI exactly what to build right now.

---

## Active Phase
- **Phase**: Phase 1 — Buyer/Renter Pathway (Bounded Context: Buyer)
- **Status**: Ready to begin

---

## Current Unit
- **Unit ID**: 1.1
- **Name**: Intent Gateway UI
- **Description**: Build the landing page with the "Intent Gateway" that allows visitors to select their primary pathway. The gateway must clearly present two options: "Buy/Rent a Property" (Buyer Context) and "I am a Landlord/Owner" (Landlord Context). The Builder/Developer option is hidden (out of scope for Phases 1-2).

---

## Acceptance Criteria
- [ ] **Two clear options**: Two visually distinct cards/buttons: "Buy/Rent" and "Landlord/Owner"
- [ ] **Buyer routing**: Clicking "Buy/Rent" routes the user to `/search`
- [ ] **Landlord routing**: Clicking "Landlord/Owner" routes the user to `/landlord`
- [ ] **Builder is hidden**: No mention or link to Builder/Developer (Phase 3 optional)
- [ ] **Mobile responsive**: Cards stack vertically on small screens (≤ 640px)
- [ ] **Color tokens**: Uses CSS custom properties from `ui-context.md` (no hardcoded hex values)
- [ ] **shadcn/ui**: Uses components from `components/ui/` (Button, Card, etc.)
- [ ] **No backend changes**: This is a purely frontend unit

---

## Files to Modify
| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page with Intent Gateway |
| `components/gateway/IntentCard.tsx` | Reusable card component for each pathway |
| `components/gateway/GatewayGrid.tsx` | Layout container for the two cards |

---

## Out of Scope
- Search functionality (Unit 1.2)
- Concierge flow (Unit 1.3+)
- Landlord portal (Phase 2)
- Builder/Developer (Optional Extension — not planned)
- Backend APIs (all backend work begins in Unit 1.6)
- Database schema (Unit 1.7)
- Authentication (Unit 2.2+)

---

## Context Reminders
- Use shadcn/ui components from `components/ui/` — do not modify their source code
- Use the color tokens from `ui-context.md` (e.g., `--accent-primary`, `--bg-base`)
- Follow the file structure in `code-standards.md`
- Business logic belongs in Domain Services (backend), not in frontend components
- This unit is purely UI — no API calls, no state management beyond navigation
- The Intent Gateway is the entry point for all users — it must be clear, fast, and accessible
- Mobile-first design: ensure the page works on small screens

---

## Dependencies
- None — this is the entry point of the application

---

## Estimated Time
1-2 hours

---

## Definition of Done
1. All acceptance criteria above are satisfied
2. `npm run build` passes (no TypeScript errors, no linting errors)
3. The page is responsive on mobile, tablet, and desktop (per `ui-context.md` breakpoints)
4. The page uses only the color tokens from `ui-context.md` (no hardcoded hex values)
5. No backend code was modified

---

## Notes
- The Intent Gateway is the first impression users have of the platform. It must be visually appealing, clear, and trustworthy.
- The copy should be simple and action-oriented:
  - **Buy/Rent**: "Find your dream home or rental property"
  - **Landlord/Owner**: "Partner with our elite management team"
- Icons: Use Lucide React icons — `Home` for Buyer, `Building` for Landlord.
- The cards should have hover states and clear call-to-action buttons.

---

**Ready to begin Unit 1.1.**