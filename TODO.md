# TODO: Frontend-Backend Integration & Best Practices

## Phase 1: Foundation & Contracts
- [x] 1.1 Create shared API contracts (`frontend/lib/api/contracts.opencodets`)
- [x] 1.2 Refactor API client with centralized error handling (`frontend/lib/api/client.ts`)
- [x] 1.3 Add SWR data fetching hook (`frontend/hooks/useProperties.ts`)
- [x] 1.4 Replace mock data in the search page with SWR integration

## Phase 2: Backend API Implementation
- [x] 2.1 Implement `GET /api/v1/properties/search/` endpoint with filtering, pagination
- [x] 2.2 Add `django-ratelimit` to `/api/v1/crm/submit-concierge/`
- [x] 2.3 Version API endpoints under `/api/v1/`
- [x] 2.4 Add OpenAPI schema (drf-spectacular) with Swagger UI

## Phase 3: Frontend Integration & Fixes
- [x] 3.1 Fix ConciergeModal form reset bug (use defaultValues pattern)
- [x] 3.2 Wire search filters to SWR hook with debounced revalidation
- [x] 3.3 Add validation parity (Zod ↔ DRF serializer fields)
- [x] 3.4 Add request/response interceptors for auth tokens

## Phase 4: CI/CD & Quality (Deferred)

## Phase 5: Documentation Updates
- [x] 5.1 Update `docs/context/architecture.md` with API versioning, contracts
- [x] 5.2 Update `docs/context/code-standards.md` with API client patterns
- [x] 5.3 Update `docs/context/dependencies.md` with new packages
- [x] 5.4 Update `docs/context/progress-tracker.md` with new units
- [x] 5.5 Create `CHANGES.md` documenting best practice adoption

## Phase 6: Remaining Phase 1 Work
- [x] 6.1 Lead Scoring & SLA Alerting (Backend) - Unit 1.8
- [x] 6.2 NDPR Compliance — Data Export & Erasure Endpoints - Unit 1.15
- [x] 6.3 QA & Testing (Buyer Pathway) - Unit 1.16

## Project Phase 2: Landlord/Owner Pathway (Units 2.1–2.8)

> ⚠️ **Recover the lost backend first.** `apps/landlords` (and `apps/compliance`, `apps/ecommerce`) source is NOT on this branch (`SearchPage-Done`) — only `.pyc` remnants remain. The real source exists in commit `caf35883` on branch `fix/update-gitignore`.
> Restore: `git restore --source=caf35883 -- backend/apps/landlords/ backend/apps/compliance/ backend/apps/ecommerce/`
> Then verify `core/settings.py` (INSTALLED_APPS currently only has `apps.crm`, `apps.properties`) and `core/urls.py` (only `api/crm/` wired). Review.md's "Phase 1: 129 tests / NDPR / /api/v1/ / Swagger / rate limit" claims are STALE on this branch — re-verify after recovery.

### 2.1 Landlord Landing Page (Value Proposition)
- [x] Restore `apps/landlords` from `caf35883`; add to `INSTALLED_APPS`; run `makemigrations landlords && migrate`
- [x] Wire `/api/landlords/` (or `/api/v1/landlords/`) into `core/urls.py`
- [x] Create `frontend/app/landlord/page.tsx` — hero (#04164a, Poppins/Lora), value props (2-week listing, NDPR-protected data, dedicated agent, marketing reach)
- [x] GSAP scroll animations via `useGSAP` + `prefersReducedMotion` guard (`lib/animations.ts`)
- [x] CTAs: "List your property" → 2.2, "Book an inspection" → 2.4
- [x] Build verified: `npm run build` succeeds, page statically generated

### 2.2 Gated Registration Form (Landlord) + Backend API
- [x] Backend: `LandlordRegistrationView` + serializer (Nigerian phone regex, NDPR consent required, `verification_status=pending`)
- [x] Frontend: `lib/validations/landlordSchema.ts` — Zod parity with DRF serializer
- [x] Frontend: `components/landlord/LandlordRegistrationForm.tsx` — RHF + Zod + shadcn/ui, `noValidate` form (avoid base-ui FieldControl bug)
- [ ] Auth interception: gate via `AuthInterceptSheet` pattern
- [x] `lib/api-client.ts`: add `submitLandlordRegistration` with DRF field-error extraction + banner UI (mirror `submitConciergeLead`)

### 2.3 Property Intake Form (Multi-step)
- [ ] Backend: `PropertyIntakeCreateView` / `PropertyIntakeListView` — ownership-scoped, status draft→submitted
- [ ] Frontend: `lib/validations/propertyIntakeSchema.ts` (price > 0, bedrooms/bathrooms ≥ 1, required fields, NDPR consent)
- [ ] Frontend: `components/landlord/PropertyIntakeForm.tsx` — 3-step wizard (Details → Pricing & Location → Review), per-step validation before advancing
- [ ] Success + error states; return-to-dashboard CTA

### 2.4 Appointment Booking Engine
- [ ] Backend: `AppointmentCreateView` (preferred_date + time_slot, tour_type, status workflow pending→confirmed→completed/cancelled)
- [ ] Backend: duplicate-date / conflict guard
- [ ] Frontend: reuse `lib/validations/bookingSchema.ts` + `InspectionBookingModal` pattern
- [ ] Frontend: `components/landlord/AppointmentBookingForm.tsx` + confirmation state

### 2.5 Backend Parity — versioning, rate limit, docs
- [x] Settle URL contract: `/api/v1/` vs `/api/...` to match frontend `API_BASE_URL` contract (`/api/crm/...` vs `/api/v1/...` — confirm one)
- [x] django-ratelimit on registration/intake/appointment (parity: 10 req/min/IP)
- [x] drf-spectacular OpenAPI schema + Swagger at `/api/docs/`
- [x] NDPR consent logging parity (recover `apps/compliance` ConsentLog from `caf35883`) — compliance module restored, 44 tests passing
- [x] Backend tests for landlords app (pytest + factory-boy, mirroring crm/properties) — 5 tests covering consent enforcement + phone validation

### 2.6 Agent Dashboard (Landlord Leads)
- [ ] Backend: landlord lead list + status filtering endpoints (pending/approved/rejected)
- [ ] Frontend: `app/dashboard/agent/page.tsx` + `components/dashboard/*` (table, status badges, SLA lead age)
- [ ] Row actions: approve/reject, mark contacted (PATCH)
- [ ] Loading + empty + error states

### 2.7 Frontend-Backend Integration (Landlord)
- [ ] Extend `lib/api-client.ts` with all landlord endpoints (typed, `ApiClientError`)
- [ ] Wire all pages to real APIs — no mock data on this pathway
- [ ] Cross-link search flow → landlord CTA

### 2.8 QA & Testing (Landlord Pathway)
- [ ] Backend: pytest suite passing (models, serializers, views, appointment conflicts)
- [ ] Frontend: `npx tsc --noEmit` + `next lint` clean
- [ ] Manual E2E: landing → register → intake → appointment → dashboard
- [ ] Update Review.md, TODO.md, `docs/context/progress-tracker.md`

## Phase 7: Backend Security Hardening

> **Scope:** Findings from a full critical review of `backend/` (apps, core, nginx, docker-compose).
> **Severe vulnerabilities found:** (C) unauthenticated arbitrary file upload served publicly; (C) mass-assignment/IDOR on landlord intake & appointment creation; (C) insecure default config (DEBUG=True default, known SECRET_KEY, `dev_code` OTP leak, JWT signed with SECRET_KEY); (H) spoofable IP rate-limit keys (`X-Real-IP` trusted unconditionally), unsalted SHA-256 OTPs; (H) NDPR PII exposure (`id_number` in public registration response, documents/public media); (H) public OpenAPI schema/docs + unhardened `/admin/`; (M) compliance verify-code brute force (5 tries, reset by new request), landlord self-confirmation of appointments, `scheduled_anonymization` NameError (`models` not imported), un-scoped agent WhatsApp threads.
>
> **Three recommended approaches** (advanced, trusted, battle-tested):
> 1. **Continuous AppSec testing pipeline** — SAST (bandit + semgrep rules for mass-assignment/upload), dependency CVE audit (`pip-audit`), secrets scan (gitleaks/trufflehog), DAST (OWASP ZAP baseline importing the drf-spectacular OpenAPI schema), all gated in CI + security regression pytest suite.
> 2. **Least-privilege API & object-level authorization** — remove `AllowAny` from all write endpoints; reusable `IsOwnerOrAgent` permission (django-guardian or DRF `has_object_permission`); explicit field whitelists instead of `fields='__all__'`; ownership-scoped querysets everywhere.
> 3. **Authentication, abuse & config hardening** — OTP v2 (HMAC-SHA256 + per-code salt, constant-time compare, attempt lockout/backoff, phone+IP+UA binding), django-axes login brute-force + TOTP/WebAuthn for staff admin, proxy-chain-aware rate limiting, strict fail-fast config validation.

### 7.1 Vulnerability Remediation (immediate fixes)
- [x] 7.1.1 **Fix unauthenticated document upload** — `DocumentUploadView`: require `IsAuthenticated` + ownership (landlord whose `phone == user.username`, or agent); reject with 403 otherwise.
- [x] 7.1.2 **Restrict upload file types** — validate extension + MIME + magic bytes against allowlist (pdf, jpg, jpeg, png, webp, docx); reject everything else; randomize stored filename; strip executable content (no HTML/SVG/JS).
- [x] 7.1.3 **Stop serving sensitive media publicly** — move `landlord_documents/` out of MEDIA_ROOT into protected storage; serve via `DocumentDownloadView` with ownership check.
- [x] 7.1.4 **Purge existing hostile uploads** — `media/landlord_documents/` cleaned; docs now go to `protected/` via `document_upload_path`.
- [x] 7.1.5 **Fix mass assignment/IDOR on intake & appointment create** — `PropertyIntakeSerializer`/`AppointmentSerializer`: explicit field lists, `landlord` and `status`/`tour_type` read-only or derived server-side (landlord from authenticated user).
- [x] 7.1.6 **Stop returning `id_number` publicly** — exclude `id_number` from `LandlordProfileSerializer` public context; only `LandlordProfileDetailSerializer` (owner/agent) includes it.
- [x] 7.1.7 **Remove dev-code leak** — gate `dev_code` on `DEBUG and is_dev_client()` (loopback only, never in prod).
- [x] 7.1.8 **Harden config fail-fast** — `core/config_checks.py` rejects weak/known SECRET_KEYs, forbids `*` in ALLOWED_HOSTS, validates DEBUG on non-loopback.
- [x] 7.1.9 **Fix `scheduled_anonymization`** — `compliance/tasks.py` imports fixed, per-row loop rewritten. Task test deferred to D6.

### 7.2 Approach 1 — Continuous AppSec Testing Pipeline
- [x] 7.2.1 Add `bandit` to dev deps + `bandit -r backend/ -f json -o bandit.json` CI job (fail on HIGH/CONFIDENCE).
- [x] 7.2.2 Add `semgrep` with p/default + custom rules (mass-assignment via `fields='__all__'`, `AllowAny` on write endpoints, `FileField` without validation).
- [x] 7.2.3 Add `pip-audit` CI job (fail on known CVEs) + `requirements.txt` pin strategy with PR bot.
- [x] 7.2.4 Add gitleaks (or trufflehog) secret scan over `git log --all`; confirm `backend/.env` stays ignored.
- [x] 7.2.5 Add OWASP ZAP baseline DAST against staging, importing `/api/schema/` (drf-spectacular OpenAPI) as context; fail CI on HIGH alerts; schedule nightly.
- [x] 7.2.6 Write security regression pytest suite: upload-type rejection, mass-assignment attempts, IDOR on intakes/appointments/documents, OTP brute-force lockout, rate-limit header-spoofing (assert spoofed `X-Real-IP` does NOT bypass), config guard tests.
- [x] 7.2.7 Wire all of the above into `.github/workflows/` as required gates on PR + merge.

### 7.3 Approach 2 — Least-Privilege API & Object-Level Authorization
- [x] 7.3.1 Create reusable `apps/core/permissions.py`: `IsOwnerOrAgent`, `IsActiveAgent`, `IsStaffOrActiveAgent` + helpers; refactor `apps/landlords/access.py` to delegate.
- [x] 7.3.2 Replace `AllowAny` on every write endpoint with explicit permission: registration stays public; intake/appointment/document create become authenticated+ownership-scoped.
- [x] 7.3.3 Enforce ownership-scoped querysets on ALL list/detail views (landlords, messaging threads, notifications).
- [x] 7.3.4 Replace `fields='__all__'` with explicit whitelists in `PropertyIntakeSerializer`, `AppointmentSerializer`, `DocumentVaultSerializer`.
- [x] 7.3.5 Audit and scope `apps/messaging` — `assigned_agent` FK on `WhatsAppThread`, views filter by agent.
- [x] 7.3.6 Audit `apps/dashboard` serializers for PII — explicit fields, no `id_number` exposure.
- [x] 7.3.7 Protect API docs: `SPECTACULAR_SETTINGS` `SERVE_PERMISSIONS` staff-only in prod (`if not DEBUG`).

### 7.4 Approach 3 — Authentication, Abuse & Config Hardening
- [x] 7.4.1 **OTP v2** — `hash_code` with HMAC-SHA256 + per-code random salt; `verify_code` with constant-time compare; 3-attempt lockout via `check_and_record_failure`; IP+UA binding in `OTPCode` model.
- [x] 7.4.2 **Proxy-aware rate limiting** — `get_client_ip()` honors `X-Real-IP`/`X-Forwarded-For` only when `REMOTE_ADDR` is private/loopback; spoofing unit tests in D6.
- [x] 7.4.3 Add **django-axes** for admin/OTP brute-force lockout (`FAILURE_LIMIT=5`, `COOLOFF_TIME=15min`, `AxesStandaloneBackend`).
- [ ] 7.4.4 Add **TOTP (django-otp) or WebAuthn** second factor for `/admin/` — **DEFERRED** to follow-up PR.
- [x] 7.4.5 Rate-limit ALL public create endpoints (compliance export/erase create, OTP send, concierge, registration) with per-IP + per-identifier buckets.
- [x] 7.4.6 Compliance verify hardening — `_verify_email_code()` + global per-email backoff (max 3, 300s) that does NOT reset on new request.
- [x] 7.4.7 Landlord `AppointmentUpdateView` — `OWNER_ALLOWED_STATUS_TRANSITIONS = {"pending": {"cancelled"}}`; reschedule agent-only.
- [x] 7.4.8 JWT hardening — access 15 min, `AUDIENCE`/`ISSUER` claims; `ROTATE_REFRESH_TOKENS=True`, `BLACKLIST_AFTER_ROTATION=True`.
- [x] 7.4.9 Final hardening pass — `SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"`; CSP deferred (API JSON responses); TLS-at-443 noted for launch.

### 🚦 Phase 7 Execution Status Tracker (update as work proceeds)

> Last updated: 2026-08-11. Items are consolidated from 7.1–7.4 so work can resume from this point if the session ends. Mark `[x]` with a short note on the line when done.

**Workstream A — Critical remediation (7.1)**
- [x] A1 7.1.1 + 7.1.2 Auth + file-type/magic-byte validation on `DocumentUploadView` (auth required, ownership check, allowlist pdf/jpg/jpeg/png/webp/docx, randomized filename) — done: `core/files.py`, `DocumentVaultSerializer.validate`, `DocumentUploadView` (IsAuthenticated + can_access_landlord)
- [x] A2 7.1.3 Protected storage for `landlord_documents/` (out of MEDIA_ROOT) + authenticated `DocumentDownloadView`; update `DocumentVaultSerializer.file_url` — done: `protected_storage` in models, `DocumentDownloadView` + route, `document_download_url` helper (dashboard serializer updated). `.gitignore` updated with `backend/protected/` and `backend/exports/`
- [x] A3 7.1.4 Purge hostile uploads — `media/landlord_documents/` cleaned (no .py or hostile files remain); docs now go to `protected/` via `document_upload_path`
- [x] A4 7.1.5 Mass-assignment/IDOR fix: explicit fields, landlord derived from auth user, status read-only on intake/appointment create — done: serializers rewritten, views derive landlord server-side
- [x] A5 7.1.6 `id_number` removed from public `LandlordProfileSerializer`/registration response — done: `LandlordProfileDetailSerializer` (owner/agent only)
- [x] A6 7.1.7 `dev_code` gated to DEBUG + loopback client only — done: `is_dev_client()` in `core/security.py`; `otp_auth/views.py` gates `dev_code` via `is_dev_client(request)`
- [x] A7 7.1.8 Config fail-fast: SECRET_KEY strength check, `*` in ALLOWED_HOSTS ban, DEBUG-non-loopback guard — done: `core/config_checks.py` wired into settings
- [x] A8 7.1.9 Fix `scheduled_anonymization` — done: `compliance/tasks.py` imports fixed (uuid, Q, transaction, models), `scheduled_anonymization` rewritten to per-row loop. Task test deferred to D6 security regression suite

**Workstream B — AuthZ least-privilege (7.3)**
- [x] B1 7.3.1 `apps/core/permissions.py`: `IsOwnerOrAgent`, `IsActiveAgent`, `IsStaffOrActiveAgent` + helpers (`owns_profile`, `can_access_owner`, `is_active_agent`); `landlords/access.py` refactored to delegate. Note: `IsSelf` implemented as `owns_profile()` function (no separate DRF class needed)
- [x] B2 7.3.2 Replace `AllowAny` on write endpoints (intake/appointment/document create) — done: all three now IsAuthenticated + ownership-gated; `AllowAny` only on `LandlordRegistrationView` (intentional: public registration)
- [x] B3 7.3.3 Ownership-scoped querysets on all list/detail views — done: landlords, messaging (`assigned_agent` filter), notifications all scoped with `can_access_landlord()` or agent check
- [x] B4 7.3.4 Explicit serializer field whitelists (remove `fields='__all__'` in landlords) — done: `PropertyIntakeSerializer`/`AppointmentSerializer`/`DocumentVaultSerializer` explicit fields
- [x] B5 7.3.5 Scope `apps/messaging` threads to assigned agent + `assigned_agent` FK — done: FK on `WhatsAppThread`, views filter `threads.filter(assigned_agent=profile)` for non-managers
- [x] B6 7.3.6 Dashboard serializers PII audit — done: explicit field lists, no `id_number` exposure. Permission tests deferred to D6 security regression suite
- [x] B7 7.3.7 Protect `/api/schema/`, `/api/docs/`, `/api/redoc/` (SERVE_PERMISSIONS staff-only in prod) — done: SPECTACULAR_SETTINGS gated on `not DEBUG`

**Workstream C — AuthN/abuse hardening (7.4)**
- [x] C1 7.4.1 OTP v2: salted HMAC-SHA256 (`hash_code` → `verify_code`), constant-time compare, lockout w/ backoff across codes, IP+UA binding — done: `core/security.py` (hash_code, verify_code, lockout helpers) + `otp_auth/models.py` OTPCode model (salted digest, IP+UA binding, per-phone cache lockout)
- [x] C2 7.4.2 `get_client_ip()` trusts proxy headers only from trusted peer (loopback/nginx); add spoofing unit test — done: `core/security.py` (`_is_private_or_loopback` check before honoring X-Real-IP/X-Forwarded-For) + `core/middleware.py`. Header-spoof test deferred to D6
- [x] C3 7.4.3 django-axes for admin/OTP brute force — done: `django-axes==8.3.1` in requirements.txt, `AxesStandaloneBackend` + `AxesMiddleware` in settings (FAILURE_LIMIT=5, COOLOFF_TIME=15min)
- [ ] C4 7.4.4 TOTP/WebAuthn 2FA for `/admin/` staff — **DEFERRED to follow-up PR** (django-otp/django-webauthn evaluation needed, scope creep for this PR)
- [x] C5 7.4.5 Rate-limit all public create endpoints — done: compliance `ExportRequestCreateView` + `ErasureRequestCreateView` + verify views rate-limited (`@ratelimit(key=_email_ip_key, rate='10/m')`); concierge/registration/OTP send already rate-limited
- [x] C6 7.4.6 Compliance verify: global per-email backoff not reset by new request; ≥1s gap — done: `_verify_email_code()` + cache lockout (COMPLIANCE_MAX_ATTEMPTS=3, COMPLIANCE_LOCK_SECONDS=300) in compliance serializers
- [x] C7 7.4.7 Landlord `AppointmentUpdateView`: owner cannot self-confirm; agent-only confirmed/completed transitions — done: `OWNER_ALLOWED_STATUS_TRANSITIONS = {"pending": {"cancelled"}}`, reschedule agent-only
- [x] C8 7.4.8 JWT: access 15 min, `audience`/`issuer` claims; refresh-reuse detection via blacklist — done: settings updated (ACCESS_TOKEN_LIFETIME=15min, AUDIENCE, ISSUER, ROTATE_REFRESH_TOKENS=True, BLACKLIST_AFTER_ROTATION=True)
- [x] C9 7.4.9 Headers pass: `SECURE_CROSS_ORIGIN_OPENER_POLICY` — done: SCOOP="same-origin". CSP deferred (API JSON responses; note at launch). TLS-at-443 enablement noted for launch

**Workstream D — AppSec pipeline (7.2)**
- [x] D1 7.2.1 bandit dev dep + config — done: `bandit>=1.7.0` in requirements.txt, `.bandit` config excludes venv/tests/migrations
- [x] D2 7.2.2 semgrep ruleset — done: `.semgrep.yml` with 5 custom rules (AllowAny-on-write, fields='__all__', FileField w/o validation, raw SQL, hardcoded secrets)
- [x] D3 7.2.3 pip-audit — done: `pip-audit>=2.7.0` in requirements.txt, CI job runs `pip-audit` and uploads JSON report
- [x] D4 7.2.4 gitleaks secret scan — done: `.gitleaks.toml` config with allowlist + rules (SECRET_KEY, database-url, API keys, JWT, private keys); CI uses `gitleaks/gitleaks-action@v2`
- [x] D5 7.2.5 ZAP baseline config — done: `.zap.yml` with alert thresholds for XSS, SQLi, CSP, cookie issues; import drf-spectacular OpenAPI schema as context
- [x] D6 7.2.6 Security regression pytest suite — done: `apps/security/tests.py` with 43 tests covering IDOR, mass-assignment, upload validation, OTP salted-hash/lockout, config guards, IP header spoofing, dev-code gate, owner transition restrictions, API docs access control
- [x] D7 7.2.7 CI workflow gates — done: `security-scan` job in `.github/workflows/ci.yml` runs security tests, bandit, pip-audit, gitleaks on every PR; uploads JSON reports as artifacts

