# Testing Strategy — Primekey Homes

> Status: draft · Version: 0.1 · Owner: @teambarlandz · Last updated: 2026-08-17
> Principle: **backend logic is the engine — test it hard; the frontend is
> verified with unit tests + critical-path e2e.** NDPR/security behavior has
> dedicated suites because it is non-negotiable.

## 1. Test pyramid

| Layer | What | Where | Runs |
|-------|------|-------|------|
| Unit (backend) | models, serializers, services, views, permissions, SLA/scoring math, compliance rules | `backend/apps/*/tests.py` | CI `backend-lint-tests` |
| Unit (frontend) | zod validation schemas, api-client behavior | `frontend/lib/validations/*.test.ts` | CI `frontend-tests` (vitest) |
| Security regression | auth gates, rate limits, session hardening, proxy trust, axes lockout | `backend/apps/security/tests.py`, `backend/core/tests.py` | CI `security-scan` |
| Integration | full-stack: real Postgres + Redis + Django + Next.js dev servers | — | CI `e2e-tests` |
| E2E (Cypress) | critical user paths: search → concierge → SLA flow; landlord intake → dashboard; auth gates | `frontend/cypress/e2e/*.cy.ts` | CI `e2e-tests` |

## 2. Backend suite (pytest + factory-boy)

- Runner: `python -m pytest apps/<app>/tests.py -q` from `backend/` (SQLite in
  tests; CI runs the same suite against a real Postgres 16 service).
- **Full suite: 187 tests passing** (2026-08-17) across 12 apps + core:

| App | Focus |
|-----|-------|
| `crm` | lead creation, consent validation, lead scoring (6-factor), SLA breach detection, property inquiries |
| `compliance` | export/erasure flows, anonymization, consent logs, retention command (44 tests) |
| `landlords` | registration consent gating, intake validation (price/beds/baths), appointment slot rules + conflicts (19 tests) |
| `dashboard` | agent/manager permission gates, action endpoints, stats (11 tests) |
| `otp_auth` | OTP issue/verify/expiry/rate-limit, JWT issuance |
| `messaging` | WhatsApp thread/message lifecycle, assigned-agent scoping (7 tests) |
| `notifications` | notification creation, scoping, mark-read (6 tests) |
| `security` | auth gates, middleware hardening, session controls |
| `users` | favorites/saved properties |
| `careers` | job openings + applications ownership gating |
| `contact` | contact form persistence, rate limit |
| `core` | health endpoint, idle-session middleware, trusted-proxy middleware (12 tests) |

- Conventions: `pytestmark = pytest.mark.django_db`; `factory-boy` + Faker
  fixtures; serializer/service/view coverage per endpoint; no raw SQL in tests.

## 3. Frontend suite (Vitest)

- Runner: `npm run test:run` from `frontend/`.
- Covers: zod schemas (Nigerian phone regex, budget bounds, enum alignment
  with DRF serializers), API client error mapping.
- Golden rule: every schema in `lib/validations/` has a matching
  `*.test.ts`; parity with the DRF serializer is the acceptance bar
  (validation parity was Unit 1.14).

## 4. E2E (Cypress)

- Specs: `critical-paths.cy.ts` (search, concierge, landlord intake,
  appointment) and `refinements.cy.ts`.
- CI runs them against live dev servers (`runserver` + `next dev`) backed by
  Postgres + Redis; screenshots/videos uploaded as artifacts on failure.
- Base URL: `http://localhost:3000`; API through the dev proxy.

## 5. Security checks (CI)

- `bandit` SAST over `apps/` + `core/` (config in `backend/.bandit`).
- `pip-audit` dependency vulnerability scan.
- `gitleaks` secret scan on the repo.
- `security-scan` job also re-runs the security regression suite on real
  Postgres/Redis.
- Reports uploaded as CI artifacts; failures are advisory until triaged
  (`|| true` guards), but the regression suite is a hard gate.

## 6. Coverage goals

- Backend: ≥ 70% line coverage across `apps/` (target; not yet enforced in
  CI — planned gate, see current-task.md).
- Frontend: coverage not a gate; schema/unit + e2e substitute.
- CI already enforces: migration drift (`makemigrations --check --dry-run`),
  Django system checks, and the full test suite — the "no silent drift" gate.

## 7. Definition of Done (testing terms)

A PR is mergeable when:

1. `backend`: full pytest suite green locally **and** in CI against Postgres.
2. `frontend`: `tsc --noEmit`, `npm run lint`, `npm run test:run`, `npm run build` green.
3. Any new endpoint ships with serializer + view tests; any new schema ships
   with a vitest suite.
4. Any permission change ships with a 401/403 test (security suite).
5. Cypress e2e passes for any touched critical path.