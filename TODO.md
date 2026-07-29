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