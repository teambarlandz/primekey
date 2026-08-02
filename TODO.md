# TODO: Frontend-Backend Integration & Best Practices

## Phase 1: Foundation & Contracts
- [x] 1.1 Create shared API contracts (`frontend/lib/api/contracts.ts`)
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

### 🔧 Lost-code recovery checklist (verify BEFORE starting work)
- [x] `apps/landlords/` — restored from `caf35883`; models/serializers/views/urls/services/migrations all present
- [x] `apps/compliance/` — restored from `caf35883` (NDPR export/erase, ConsentLog, anonymization tasks, 44 tests passing)
- [x] `apps/ecommerce/` — restored stubs from `caf35883`
- [x] Wired `INSTALLED_APPS` + `/api/v1/*` URLconfs + drf-spectacular (schema/docs) + rate-limit cache
- [x] Fixed pre-existing `properties` blocker: `SerializerMethodGetter` → `SerializerMethodField` (nonexistent DRF API)
- [x] Added missing `__init__.py` for `apps/`, `apps/crm/`, `apps/properties/` (pytest import-mode fix) + `backend/conftest.py`
- [x] Landlord registration: NDPR consent now mandatory (was bypassable) + Nigerian phone validation aligned with crm
- [x] Backend tests: 49 passing (44 compliance + 5 new landlords); migrations applied cleanly