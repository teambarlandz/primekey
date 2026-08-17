# Architecture Decision Records — Primekey Homes

> Status: active · Each entry: **Status** (Accepted / Superseded / Rejected) ·
> **Context** · **Decision** · **Consequences**. Append-only; supersede, never
> edit history. New entries require a brief rationale in the PR.

---

## ADR-001 · Modular Monolith with DDD bounded contexts (Django apps)

- **Status:** Accepted (2026-07)
- **Context:** One small team must ship three product pathways (Buyer, Landlord,
  Builder) fast while keeping domain boundaries clean enough to split later.
  Microservices were rejected: no team or traffic justifying distributed ops.
- **Decision:** A single Django project (`backend/core`) containing one Django
  app per bounded context (`crm`, `properties`, `landlords`, `compliance`,
  `dashboard`, `ecommerce`, `messaging`, `notifications`, `otp_auth`, `users`,
  `contact`, `careers`). Business logic lives in `services.py` per app; views
  stay thin; models never contain cross-context logic.
- **Consequences:** One deployable artifact, shared migrations, trivial
  transactions across contexts. The `ecommerce` context is stubbed and dormant
  (Phase 3 gate) but already isolated in `INSTALLED_APPS`.

## ADR-002 · Next.js 14 App Router + TypeScript + Tailwind for the frontend

- **Status:** Accepted (2026-07)
- **Context:** Need a marketing-grade, SEO-friendly site with rich interactivity
  (GSAP, forms, modals) against a Django API, maintained by one team.
- **Decision:** Next.js 14 (App Router), TypeScript strict, Tailwind CSS,
  shadcn/ui primitives, GSAP (via `@gsap/react` + `useGSAP` with
  `prefersReducedMotion`), `react-hook-form` + `zod` for all forms.
- **Consequences:** Server components by default (SEO), `'use client'` only
  where browser APIs are needed. Path aliases (`@/components`, `@/lib`, `@/app`)
  enforced. Fonts: Poppins (headings) + Lora (body).

## ADR-003 · Django REST Framework + SimpleJWT (Bearer tokens) for the API

- **Status:** Accepted (2026-07)
- **Context:** The frontend and any future mobile client need a versioned,
  token-authenticated JSON API.
- **Decision:** DRF with `drf-spectacular` OpenAPI (`/api/schema/`, `/api/docs/`),
  versioned routes under `/api/v1/`, SimpleJWT (15 min access, 7 day refresh,
  rotation + blacklist, HS256). Default DRF permission is `IsAuthenticated`;
  public endpoints opt out explicitly with `AllowAny`.
- **Consequences:** Swagger UI in dev only (admin-gated in production). API
  surface is documented and machine-checkable. All write endpoints must declare
  permissions deliberately.

## ADR-004 · PostgreSQL + Redis (cache, sessions, django-q broker)

- **Status:** Accepted (2026-07)
- **Context:** Relational integrity for leads/properties/compliance records,
  plus fast cache and background job infra.
- **Decision:** PostgreSQL (UUID PKs, indexed search columns) as the only source
  of truth. Redis backs the Django cache (`django-redis`), the session engine,
  and the django-q2 broker (DB `2`). `DATABASE_URL`/`REDIS_URL` via
  `django-environ`; never hardcoded.
- **Consequences:** Sessions and rate-limit counters are fast and share
  infrastructure with the worker queue. Redis becomes a hard runtime dependency
  (compose + CI both provision it).

## ADR-005 · django-q2 for background tasks (not Celery)

- **Status:** Accepted (2026-07)
- **Context:** Need scheduled + async work: SLA breach checks (30 min / 2 hr /
  3 hr), OTP cleanup, NDPR anonymization. Celery is heavier (extra broker
  config, beat) than needed.
- **Decision:** `django-q2` with Redis broker, a dedicated `worker` container
  (`python manage.py qcluster`), `async_task` for fire-and-forget, and the
  cron-schedule API for recurring jobs.
- **Consequences:** One fewer moving part than Celery/beat; `sync: False` in
  production so tasks run only via the worker. Migration path to Celery exists
  but is not planned.

## ADR-006 · Phone-first OTP authentication (no consumer passwords)

- **Status:** Accepted (2026-08)
- **Context:** Nigerian market reality: phone numbers are the primary identity
  (userflow.md Auth Interception). Passwords create friction and support load.
- **Decision:** `apps/otp_auth` issues 6-digit OTPs (validated against a
  Nigerian-phone regex), with expiry, rate limits, resend counter, and a JWT
  issued on success. Frontend `AuthInterceptSheet` intercepts high-intent
  actions (save search, favorite, booking, intake submit) and resumes them
  after verification. Admin/staff still use password auth (Django admin +
  axes).
- **Consequences:** Two auth models coexist: JWT for consumers, session-based
  Django admin for staff. `users.Favorite` and landlord gates depend on the
  JWT identity.

## ADR-007 · NDPR compliance by design

- **Status:** Accepted (2026-07)
- **Context:** Nigeria Data Protection Act/NDPR requires explicit consent,
  auditability, retention limits, and data-subject rights.
- **Decision:** Every lead-writing endpoint requires an explicit consent
  checkbox; consent rows are immutable (`consent_logs` with IP + user-agent +
  consent text + timestamp). Inactive leads are anonymized after 180 days via
  the `anonymize_leads` management command scheduled on django-q. Data-subject
  rights are self-serve endpoints with 6-digit verification
  (`/api/v1/compliance/export|erase`). Export files live in `EXPORT_STORAGE_DIR`
  (outside `MEDIA_ROOT`); landlord documents live in `PROTECTED_STORAGE_DIR`
  and are served only through the authenticated download endpoint.
- **Consequences:** No feature may collect personal data without a consent-log
  path. Retention/anonymization is a hard scheduled job, not a nice-to-have.

## ADR-008 · Lead scoring and SLA as service-layer logic

- **Status:** Accepted (2026-08)
- **Context:** Review.md planned a scoring engine; scoring rules were not
  product-defined (ai-workflow-rules "do not invent").
- **Decision:** `LeadScoringService` implements a documented 6-factor model
  (budget, location, property type, bedrooms, completeness, urgency → 0-100,
  persisted breakdown). `SLAAlertService` flags warning at 30 min, breach at
  2 hr, critical at 3 hr; `check_sla_alerts` command runs on a django-q
  schedule; `SLAAlert` rows feed the admin + notifications.
- **Consequences:** Scoring rules are now explicit and testable; changing the
  formula is a service-layer edit with existing test coverage.

## ADR-009 · Agent/manager role gating on internal APIs

- **Status:** Accepted (2026-08)
- **Context:** Dashboard endpoints were initially `AllowAny` (progress-tracker
  2026-08-02). Lead/PII data must not be publicly readable.
- **Decision:** `apps/dashboard` defines `IsAgent`/`IsManager` permission
  classes; agent-only endpoints require `IsAuthenticated + IsAgent`, admin
  actions require `IsManager`. WhatsApp threads are visible only to the
  assigned agent (or managers), enforced in the view layer.
- **Consequences:** 401/403 on unauthenticated/unauthorized access; messaging
  tests were updated (2026-08-17) to reflect assigned-thread scoping.

## ADR-010 · Native fetch API client (no SWR; axios unused)

- **Status:** Accepted (2026-08)
- **Context:** A single type-safe client wrapper was needed for all API calls.
  SWR was removed during the 1.11 refactor; axios remains a declared but unused
  dependency.
- **Decision:** `lib/api-client.ts` uses native `fetch`, trailing-slash-safe
  base URL, typed `ApiClientError` (status + DRF field-error map), exponential
  backoff retry on network failure, and one function per endpoint.
- **Consequences:** One import point for all API access; error surfaces are
  consistent (banner/toast). Axios should be pruned from `package.json` in a
  housekeeping pass.

## ADR-011 · django-axes brute-force lockout + Redis sessions

- **Status:** Accepted (2026-08)
- **Context:** Admin/staff login is password-based; brute force is a real
  threat on a public IP.
- **Decision:** `django-axes` (5 failures → 15 min lockout, per IP) with
  `axes.backends.AxesStandaloneBackend`; sessions stored in Redis cache with
  1 h absolute lifetime, 30 min idle timeout, HTTP-only + SameSite=Lax cookies.
- **Consequences:** Session/login hardening is config-driven; lockouts are
  visible in the axes admin.

## ADR-012 · GitHub Actions CI/CD with SSH deploy

- **Status:** Accepted (2026-08)
- **Context:** deployment-ops.md specified a "simple" pipeline; the repo needed
  real gates before reaching production.
- **Decision:** `.github/workflows/ci.yml` runs: frontend lint/typecheck/vitest/
  build, backend `manage.py check` + migration-drift check + pytest against
  Postgres/Redis services, bandit/pip-audit/gitleaks security scan, Cypress e2e
  against live dev servers, and SSH deploys (`appleboy/ssh-action`) for
  `develop` → staging and `master` → production. Secrets via GitHub Actions
  environments.
- **Consequences:** Nothing reaches `master` un-gated; deploy is
  pull-and-compose-up (reproducible). The workflow is the single source of
  truth for what "green" means.

## ADR-013 · Vitest (unit) + Cypress (e2e) for frontend verification

- **Status:** Accepted (2026-08)
- **Context:** Review.md flagged zero frontend tests and no e2e.
- **Decision:** Vitest + Testing Library for schema/component unit tests
  (`lib/validations/*.test.ts`, `vitest.config.ts`); Cypress for critical-path
  e2e (`cypress/e2e/critical-paths.cy.ts`, `refinements.cy.ts`) with base URL
  against the dev stack in CI.
- **Consequences:** Frontend regressions are caught pre-merge; e2e is slower,
  so it runs once per push/PR after unit gates pass.

## ADR-014 · django-unfold admin (Tokyo Night Moon theme)

- **Status:** Accepted (2026-08)
- **Context:** Stock Django admin clashed with the Primekey brand; staff use
  the admin daily.
- **Decision:** `django-unfold` with a custom palette (Moon blues), full dark
  mode overrides in `core/static/admin/css/custom.css`, branded login page,
  custom `setup_roles` command, and unregistered default `User`/`LogEntry`
  admins replaced with hardened custom admins.
- **Consequences:** Admin styling lives in `core/static` + `core/templates`
  (not app code); dark-mode toggles are CSS-scoped and verified manually.

---

## Open questions

- OQ-1: WhatsApp inbound webhook provider (Twilio vs 360dialog vs BSP-agnostic)
  — required before inbound messaging is real.
- OQ-2: Crash/error reporting vendor (Sentry vs Rollbar vs self-hosted) —
  privacy posture must stay NDPR-clean.
- OQ-3: Semver + release tags — first tagged release still pending (see
  RELEASE.md).