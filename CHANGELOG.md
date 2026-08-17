# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning follows [SemVer](https://semver.org/) (see [RELEASE.md](docs/RELEASE.md)).

## [Unreleased]

### Added

- **Ops:** `GET /api/health` uptime endpoint (DB + Redis state) per
  deployment-ops.md; `scripts/backup.sh` (daily pg_dump → rclone → 30-day
  retention) and `scripts/backup_media.sh` (weekly media volume sync).
- **Docs:** Root `docs/` engineering set — ADR, TESTING, RELEASE, PERFORMANCE,
  DATA_MODEL, ACCESSIBILITY, CONTRIBUTING, PRD — plus this changelog, following
  the spec-first convention of the planning docs.
- **Admin:** django-unfold theme (Tokyo Night Moon palette), branded login
  page, custom CSS/JS, dashboard redesign, badges/filters, dark mode overrides.
- **Auth:** phone OTP flow (`apps/otp_auth`), Auth Intercept Sheet gating
  high-intent actions, sign-out everywhere (Navbar, SiteNav, account, landlord
  gate), remember-device, session idle warning, JWT with rotation + blacklist.
- **Careers:** job openings + applications app with data-rights compliance and
  ownership-gated access.
- **Security:** proxy-trust + idle-session middleware, axes brute-force
  lockout, role-permission hardening (custom UserAdmin/LogEntryAdmin,
  `setup_roles` for CEO/CTO/COO), CI security scans (bandit, pip-audit,
  gitleaks).
- **CI/CD:** GitHub Actions pipeline — lint, typecheck, vitest, build, backend
  tests on Postgres/Redis, migration-drift check, Cypress e2e, security scan,
  staging (`develop`) and production (`master`) SSH deploys.
- **Infra:** Docker Compose (db, redis, backend, django-q worker, frontend,
  nginx), Dockerfiles, nginx edge proxy, Postgres 16 + Redis 7.

### Changed

- **Search:** real backend `GET /api/v1/properties/search/` replaces mocks;
  purpose tabs, sort, pagination, demo listings seeded, Property admin.
- **Frontend:** shared font vars (dedupe), SiteNav + breadcrumbs on secondary
  pages, premium split-screen login, company phone number.
- **Tests:** messaging suite aligned with assigned-thread scoping (3 stale
  tests fixed); health-endpoint tests added.
- **Deps:** psycopg2 fix; package `allowScripts`; axios remains declared but
  unused (see ADR-010).

### Fixed

- Gated flows: auth intercept actions, middleware, logout, toasts, session
  warning, remember device.
- CI unblock: branches (`master`/`develop`), Python/services versions, docker
  builds, edge proxy config.
- Build-blocking bugs in contact/login/register pages; dedupe font setup.
- `setup_roles` ALL_MODELS format; staticfiles sync; LogEntryAdmin
  registration; header logo color; OTP cleanup task cadence.

## [0.1.0] — 2026-08-17 (pre-release baseline)

### Added

- **Phase 1 (Buyer/Renter):** landing page (Brand Navy `#04164a` / Lavender
  `#f3f0ff`, Poppins/Lora, GSAP), search + filters (zod), property grid and
  detail, zero-results → 2-Week Concierge modal, `POST /api/v1/crm/
  submit-concierge/` (rate-limited), lead scoring + 2-hour SLA alerting,
  NDPR consent logging, data export/erasure endpoints with 6-digit
  verification, versioned API + OpenAPI docs, validation parity (Zod ↔ DRF).
- **Phase 2 (Landlord/Owner):** landlord landing page, gated registration,
  3-step property intake wizard, appointment booking engine (slot allowlist,
  conflict guard), agent dashboard (stat cards, lead/intake/appointment
  tables, search/filter, CSV export, actions), landlord portal
  (`/landlord/dashboard`, reschedule/cancel), notifications app.
- **Frontend tooling:** Vitest unit tests (validation schemas), Cypress e2e
  (critical paths + refinements).
- **Backend tooling:** 175 pytest tests across 12 apps; factory-boy fixtures;
  drf-spectacular schema.

### Fixed

- Frontend form handling (@base-ui/react `FieldControl` breaking
  react-hook-form → plain `<input>` + `noValidate`).
- DRF serializer/URL mismatches found during Phase 1 QA.

[Unreleased]: https://github.com/teambarlandz/primekey
[0.1.0]: https://github.com/teambarlandz/primekey/releases/tag/v0.1.0