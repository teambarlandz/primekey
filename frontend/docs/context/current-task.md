# Current Task: Core Project Complete — Docs & Ops Hardening

> **AI INSTRUCTIONS & SCOPE BOUNDARIES**
> - **DO UPDATE**: Only with explicit user approval. Phase 1 & Phase 2 are feature-complete and verified.
> - **DO NOT UPDATE**: Do not modify verified, passing components/endpoints (backend suite = 175 tests, frontend `tsc` + `build` clean) without user direction.

---

## Active Directive
No active implementation task. Core project (Phases 1 & 2) is complete. The engineering doc set lives in `docs/` (ADR, TESTING, RELEASE, PERFORMANCE, DATA_MODEL, ACCESSIBILITY, CONTRIBUTING, PRD) plus root `CHANGELOG.md`; the AI-workflow context files live in `frontend/docs/context/`.

### Candidate Refinements (awaiting user direction)
- [ ] **WhatsApp inbound webhook** — messaging app currently models threads/messages; a Twilio/360dialog inbound webhook would close the loop.
- [ ] **Buyer inquiry dashboard views** — `PropertyInquiry` leads exist; agent dashboard does not yet surface them.
- [ ] **Document vault frontend** — `DocumentVault` model exists (landlord docs); agent review UI is partial.
- [ ] **Production TLS** — docker-compose has 443 commented out; provision certbot + enable.
- [ ] **Uptime monitoring registration** — point UptimeRobot/Better Stack at `/api/health`.
- [ ] **Coverage gates in CI** — backend ≥ 70% line coverage enforced by workflow.

---

### State (as of 2026-08-17)
- Backend suite: **175 tests passing** (CRM, compliance, landlords, dashboard, notifications, messaging, otp_auth, security, users, careers, contact, properties).
- Frontend: `npx tsc --noEmit` clean; `npm run build` passes; vitest unit tests + Cypress e2e suites exist and run in CI.
- CI (`.github/workflows/ci.yml`): frontend lint/typecheck/tests/build; backend tests on Postgres+Redis; bandit/pip-audit/gitleaks security scan; migration drift check; Cypress e2e; SSH deploys for staging (`develop`) and production (`master`).
- Ops: Docker Compose (db/redis/backend/worker/frontend/nginx), Django Q worker, `/api/health`, `scripts/backup.sh`.
- Auth: OTP phone auth (`apps/otp_auth`), JWT (simplejwt, 15 min access / 7 day refresh, rotation + blacklist), axes lockout, session idle timeout (30 min), agent role gates (`IsAgent`/`IsManager`).

### Design Tokens
- Brand Navy: `#04164a`
- Lavender Surface: `#f3f0ff`
- Cards: `bg-white/90 backdrop-blur-sm`