# Current Task: Phase 2 Complete — Optional Refinements

> **AI INSTRUCTIONS & SCOPE BOUNDARIES**
> - **DO UPDATE**: Only with explicit user approval. Phase 1 & Phase 2 are feature-complete and verified.
> - **DO NOT UPDATE**: Do not modify verified, passing components/endpoints (backend suite = 80 tests, frontend `tsc` + `build` clean) without user direction.

---

## Active Directive
No active implementation task. Core project (Phases 1 & 2) is complete. Optional refinements available for user selection:

### Candidate Refinements (awaiting user direction)
- [ ] **Unit 1.8** — Lead Scoring & 2-hour SLA alerting (backend service + task).
- [ ] **Agent authentication/roles** — Dashboard endpoints currently `AllowAny`; add auth + JWT gating + role guards.
- [ ] **WhatsApp-first messaging** — Flowing contact / lead → WhatsApp links; chat history.
- [ ] **Document vault** — Landlord upload of title docs / proof of ownership per intake.
- [ ] **Buyer inquiries per listing** — Property detail page → inquiry form creating a lead tied to a listing.
- [ ] **Frontend e2e** — Cypress suites for buyer + landlord pathways (backend QA done).

---

### State (as of 2026-08-02)
- Backend suite: **80 tests passing** (44 compliance + 19 landlords + 11 dashboard + 6 notifications), sqlite local DB (`backend/db.sqlite3`).
- Frontend: `npx tsc --noEmit` clean; `npm run build` passes, 20 routes.
- Work since `59bdc553` is **uncommitted** — commit + push when user approves.
- Venv is WSL-style: `backend/venv/bin/` (`python`, `python3`, `python3.12`, `Activate.ps1`). Run tests from `backend/` via `python -m pytest apps/<app>/tests.py -q`.
- Nav: dropdown group menus (List a Property, Company) + "Agent Login" footer pill → `/dashboard/agent`.

### Design Tokens
- Brand Navy: `#04164a`
- Lavender Surface: `#f3f0ff`
- Cards: `bg-white/90 backdrop-blur-sm`
