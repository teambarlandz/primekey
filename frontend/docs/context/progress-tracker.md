# Progress Tracker

Update this file after every meaningful implementation change. This document serves as the project's memory, enabling smooth resumption of work between sessions and providing a clear audit trail of decisions and progress.

## Project Scope

### Core Project (Phases 1 & 2)
- **Phase 1:** Buyer/Renter Pathway — Lead generation engine with "2-Week Concierge" service.
- **Phase 2:** Landlord/Owner Pathway — Gated registration, property intake, appointment booking.

### Optional Extension (Phase 3)
- **Builder/Developer Pathway** — Full-blown B2B e-commerce marketplace for building materials.
- **Trigger:** Achieve success metrics from Phases 1 & 2 (e.g., > 15% concierge conversion rate, steady lead flow, positive LTV:CAC ratio).
- **Decision Point:** Re-evaluate after 3-6 months of live operations.

---

## Master Task List (Start to Finish)

### Phase 1: Buyer/Renter Pathway (Core)

| Unit | Name | Status | Description | Files | Est. Time |
| --- | --- | --- | --- | --- | --- |
| **1.1** | **Landing Page UI (Styling, Localization & Interactivity)** | ✅ Completed | Transformed skeletal `.tsx` files into the production Primekey Homes marketing surface. Applied Brand Navy (`#04164a`), Lavender background (`#f3f0ff`), Poppins/Lora typography, refactored `FinalCTA.tsx` using `shadcn/ui` + `react-hook-form` + `zod`, localized copy to Nigeria, and added GSAP scroll animations. | `app/globals.css`, `app/layout.tsx`, `components/Navbar.tsx`, `components/Hero.tsx`, `components/SocialProof.tsx`, `components/Benefits.tsx`, `components/FAQ.tsx`, `components/FinalCTA.tsx`, `components/Footer.tsx`, `components/FloatingContact.tsx`, `lib/animations.ts` | 4-5 hrs |
| **1.2** | **Dynamic Property Search (UI & Filters)** | ✅ Completed | Build the search interface with filters (location, price range, property type, bedrooms). UI only. | `app/search/page.tsx`, `components/search/SearchBar.tsx`, `components/search/FilterDropdown.tsx`, `components/search/PriceRange.tsx`, `lib/validations/searchSchema.ts` | 2-3 hrs |
| **1.3** | **Property Results Grid & Detail View** | ✅ Completed | Display search results as a grid of property cards. Clicking a card opens a property detail page. | `components/search/PropertyGrid.tsx`, `components/search/PropertyCard.tsx`, `app/property/[id]/page.tsx`, `components/property/PropertyDetail.tsx` | 2-3 hrs |
| **1.4** | **"Not Found" → Concierge Conditional Logic** | ✅ Completed | Implement the critical conditional trigger. When search returns zero results, display the Concierge modal instead of "No results." | `components/search/SearchResults.tsx`, `components/concierge/ConciergeModal.tsx`, `components/concierge/ConciergeOffer.tsx` | 2-3 hrs |
| **1.5** | **Concierge Registration Form (Frontend)** | ✅ Completed | Build the registration form inside the concierge modal. Collects all required data with NDPR consent. | `components/concierge/ConciergeForm.tsx`, `components/concierge/ConciergeModal.tsx`, `lib/validations/conciergeSchema.ts` | 2-3 hrs |
| **1.6** | **Backend API — POST /api/v1/crm/submit-concierge/** | ✅ Completed | Built the Django backend endpoint that receives concierge form data, validates it via DRF serializers, creates lead records, and logs NDPR consent. Rate limited: 10/min/IP. | `backend/apps/crm/views.py`, `backend/apps/crm/serializers.py`, `backend/apps/crm/models.py`, `backend/apps/crm/services.py`, `backend/apps/crm/urls.py` | 2-3 hrs |
| **1.7** | **Database Schema & Migrations** | ✅ Completed | Created PostgreSQL/Django ORM tables for `concierge_leads`, `consent_logs`, `lead_scores`, `sla_alerts`, and `properties`. Executed migrations and configured CORS. | `backend/apps/crm/models.py`, `backend/apps/properties/models.py`, `backend/apps/crm/migrations/`, `backend/apps/properties/migrations/`, `backend/core/settings.py` | 2-3 hrs |
| **1.8** | **Lead Scoring & SLA Alerting (Backend)** | ✅ Completed | Implemented lead scoring (0-100) with 6-factor breakdown, 2-hour SLA monitoring with warning/breach/critical alerts, background tasks via django-q2, management command for cron. | `backend/apps/crm/services.py` (LeadScoringService, SLAAlertService), `backend/apps/crm/tasks.py`, `backend/apps/crm/models.py` (LeadScore, SLAAlert), `backend/apps/crm/management/commands/check_sla_alerts.py` | 3-4 hrs |
| **1.9** | **Search API — GET /api/v1/properties/search/** | ✅ Completed | Build the backend search endpoint with filtering, pagination, ordering. OpenAPI documented via drf-spectacular. | `backend/apps/properties/views.py`, `backend/apps/properties/serializers.py`, `backend/apps/properties/urls.py`, `backend/core/urls.py` | 2-3 hrs |
| **1.10** | **Frontend-Backend Integration (Search + Concierge)** | ✅ Completed | Connected frontend search to SWR + API client. Replaced mock data with live API. Fixed ConciergeModal form reset bug. Added validation parity. | `app/search/page.tsx`, `lib/api/contracts.ts`, `lib/api/client.ts`, `lib/api/config.ts`, `hooks/useProperties.ts`, `hooks/useConcierge.ts`, `components/search/ConciergeModal.tsx` | 2-3 hrs |
| **1.11** | **API Layer Refactor (Contracts, Client, Hooks)** | ✅ Completed | Contract-first API design: shared TypeScript contracts, centralized ApiClient with retry/rate-limit handling, SWR hooks for queries/mutations. | `lib/api/contracts.ts`, `lib/api/client.ts`, `lib/api/config.ts`, `hooks/useProperties.ts`, `hooks/useConcierge.ts` | 2-3 hrs |
| **1.12** | **Backend Versioning & OpenAPI Docs** | ✅ Completed | All endpoints under `/api/v1/`. Added drf-spectacular with Swagger UI at `/api/docs/`. | `backend/core/urls.py`, `backend/core/settings.py`, `backend/requirements.txt` | 1-2 hrs |
| **1.13** | **Rate Limiting & Retry Logic** | ✅ Completed | django-ratelimit on concierge submit (10/min/IP). Frontend exponential backoff on 429. | `backend/apps/crm/views.py`, `backend/requirements.txt`, `lib/api/client.ts` | 1 hr |
| **1.14** | **Validation Parity (Zod ↔ DRF)** | ✅ Completed | Shared Nigerian phone regex, cross-field budget validation, enum sync for property types/bedrooms. | `lib/validations/searchSchema.ts`, `lib/validations/conciergeSchema.ts`, `backend/apps/properties/serializers.py`, `backend/apps/crm/serializers.py` | 1-2 hrs |
| **1.15** | **NDPR Compliance — Data Export & Erasure Endpoints** | ✅ Completed | Built data subject rights endpoints: export (Right of Access), erase (Right to Erasure), consent history, anonymization audit log. 6-digit verification codes, async tasks via django-q2, pg_cron retention policy. | `backend/apps/compliance/models.py` (ExportRequest, ErasureRequest, AnonymizationLog, ConsentLog), `backend/apps/compliance/serializers.py`, `backend/apps/compliance/views.py`, `backend/apps/compliance/tasks.py`, `backend/apps/compliance/urls.py` | 3-4 hrs |
| **1.16** | **QA & Testing (Buyer Pathway)** | ✅ Completed | Unit tests for serializers, services, validators. Integration tests for API views. E2E test scaffolding for critical paths (search → concierge → SLA). pytest + factory-boy + Cypress. | `backend/apps/*/tests.py`, `frontend/__tests__/`, `frontend/cypress/e2e/` | 3-4 hrs |

**Phase 1 Progress: 16 / 16 Units Complete ✅**

---

### Phase 2: Landlord/Owner Pathway (Core)

| Unit | Name | Status | Description | Files | Est. Time |
| --- | --- | --- | --- | --- | --- |
| 2.1 | Landlord Landing Page (Value Proposition) | ⬜ Not Started | Build the dedicated landing page for landlords/owners, emphasizing the value of outsourcing property management. | `app/landlord/page.tsx`, `components/landlord/LandlordHero.tsx`, `components/landlord/BenefitsGrid.tsx`, `components/landlord/TrustSignals.tsx` | 1-2 hrs |
| 2.2 | Gated Registration Form (Landlord) | ⬜ Not Started | Build the registration form that filters casual inquiries and collects owner details. | `components/landlord/LandlordRegistrationForm.tsx`, `backend/apps/landlords/models.py`, `backend/apps/landlords/views.py`, `backend/apps/landlords/serializers.py` | 2 hrs |
| 2.3 | Property Intake Form (Detailed) | ⬜ Not Started | Build the multi-step property intake form that captures all necessary details. | `components/landlord/PropertyIntakeForm.tsx`, `components/landlord/IntakeStep1.tsx`, `components/landlord/IntakeStep2.tsx`, `components/landlord/IntakeStep3.tsx`, `backend/apps/landlords/models.py`, `backend/apps/landlords/views.py`, `backend/apps/landlords/serializers.py` | 3 hrs |
| 2.4 | Automated Appointment Booking Engine | ⬜ Not Started | Build the system that allows landlords to book consultations with agents. | `components/landlord/AppointmentBooking.tsx`, `backend/apps/landlords/models.py` (Appointment), `backend/apps/landlords/services.py` (BookingService), `backend/apps/landlords/views.py` | 3 hrs |
| 2.5 | Backend APIs for Landlord Pathway | ⬜ Not Started | Build all backend endpoints for landlord registration, property intake, and appointment booking. | `backend/apps/landlords/views.py`, `backend/apps/landlords/serializers.py`, `backend/apps/landlords/services.py`, `backend/apps/landlords/urls.py` | 3-4 hrs |
| 2.6 | Agent Dashboard (Landlord Leads) | ⬜ Not Started | Build the agent dashboard for viewing and managing landlord leads. | `app/dashboard/agent/page.tsx`, `components/dashboard/LeadTable.tsx`, `components/dashboard/LeadDetail.tsx`, `backend/apps/dashboard/views.py`, `backend/apps/dashboard/serializers.py` | 2-3 hrs |
| 2.7 | Frontend-Backend Integration (Landlord) | ⬜ Not Started | Connect all landlord frontend components to their backend APIs. | `components/landlord/LandlordRegistrationForm.tsx`, `components/landlord/PropertyIntakeForm.tsx`, `components/landlord/AppointmentBooking.tsx`, `lib/api-client.ts`, `app/dashboard/agent/page.tsx` | 2-3 hrs |
| 2.8 | QA & Testing (Landlord Pathway) | ⬜ Not Started | Write and run tests for all Landlord pathway functionality. | `backend/apps/landlords/tests.py`, `__tests__/landlord/`, `cypress/e2e/landlord/` | 3-4 hrs |

**Phase 2 Complete ✅ — Core Project Done**

---

### Phase 3: Builder/Developer Pathway (Optional Extension)
*Trigger: Only begin if Phases 1 & 2 are live and profitable.*

| Unit | Name | Status | Description | Files | Est. Time |
| --- | --- | --- | --- | --- | --- |
| 3.1 | Builder Portal (Subdirectory Setup) | ⬜ Not Started | Set up a dedicated subdirectory route (`/builder`) with a Coming Soon page initially. | `app/builder/page.tsx`, `middleware.ts` | 1 hr |
| 3.2 | Product Catalog (Backend) | ⬜ Not Started | Build the Django models and APIs for the B2B product catalog. | `backend/apps/ecommerce/models.py` (Product, Category), `backend/apps/ecommerce/serializers.py`, `backend/apps/ecommerce/views.py`, `backend/apps/ecommerce/urls.py` | 2-3 hrs |
| 3.3 | Shopping Cart & Checkout (Backend) | ⬜ Not Started | Build the cart management and checkout APIs. | `backend/apps/ecommerce/models.py` (Cart, Order, OrderItem), `backend/apps/ecommerce/services.py` (CartService, CheckoutService), `backend/apps/ecommerce/views.py`, `backend/apps/ecommerce/serializers.py` | 3-4 hrs |
| 3.4 | Payment Gateway Integration | ⬜ Not Started | Integrate with a Nigerian payment gateway (Flutterwave or Paystack). | `backend/apps/ecommerce/services.py` (PaymentService), `backend/apps/ecommerce/views.py`, `backend/apps/ecommerce/webhooks.py`, `.env` | 3-4 hrs |
| 3.5 | Builder Frontend (Catalog, Cart, Checkout) | ⬜ Not Started | Build the frontend for the B2B e-commerce portal. | `app/builder/products/page.tsx`, `app/builder/product/[id]/page.tsx`, `app/builder/cart/page.tsx`, `app/builder/checkout/page.tsx`, `app/builder/orders/page.tsx`, `components/builder/` | 3-4 hrs |
| 3.6 | Supplier-Charge Monetization | ⬜ Not Started | Implement the B2B monetization model (charge suppliers, not buyers). | `backend/apps/ecommerce/models.py` (Supplier), `backend/apps/ecommerce/services.py` (SupplierService, AnalyticsService), `app/builder/supplier/`, `app/admin/analytics/` | 3-4 hrs |
| 3.7 | QA & Testing (Builder Pathway) | ⬜ Not Started | Write and run tests for all Builder pathway functionality. | `backend/apps/ecommerce/tests.py`, `__tests__/builder/`, `cypress/e2e/builder/` | 3-4 hrs |

---

## Current Phase
- **Phase:** Phase 1 — Buyer/Renter Pathway — **COMPLETE** (16/16 units)
- **Status:** All Phase 1 units complete. Ready for Phase 2 kickoff.
- **Current Goal:** Begin Phase 2 — Landlord/Owner Pathway.

## Completed
- **Phase 0:** Discovery & Planning — Complete. All context files aligned with Modular Monolith + DDD architecture.
- **Unit 1.1:** Landing Page UI (Styling, Localization & Interactivity) — **COMPLETE**.
- **Unit 1.2:** Dynamic Property Search (UI & Filters) — **COMPLETE**.
- **Unit 1.3:** Property Results Grid & Detail View — **COMPLETE**.
- **Unit 1.4:** "Not Found" → Concierge Conditional Logic — **COMPLETE**.
- **Unit 1.5:** Concierge Registration Form (Frontend) — **COMPLETE**.
- **Unit 1.6:** Backend API — `POST /api/v1/crm/submit-concierge/` — **COMPLETE** (with rate limiting).
- **Unit 1.7:** Database Schema & Migrations — **COMPLETE**.
- **Unit 1.8:** Lead Scoring & SLA Alerting (Backend) — **COMPLETE**.
- **Unit 1.9:** Search API — `GET /api/v1/properties/search/` — **COMPLETE**.
- **Unit 1.10:** Frontend-Backend Integration (Search + Concierge) — **COMPLETE**.
- **Unit 1.11:** API Layer Refactor (Contracts, Client, Hooks) — **COMPLETE**.
- **Unit 1.12:** Backend Versioning & OpenAPI Docs — **COMPLETE**.
- **Unit 1.13:** Rate Limiting & Retry Logic — **COMPLETE**.
- **Unit 1.14:** Validation Parity (Zod ↔ DRF) — **COMPLETE**.
- **Unit 1.15:** NDPR Compliance — Data Export & Erasure Endpoints — **COMPLETE**.
- **Unit 1.16:** QA & Testing (Buyer Pathway) — **COMPLETE**.

## In Progress
- **Phase 2 Kickoff** — Landlord pathway initiation.

## Next Up
- **Unit 2.1:** Landlord Landing Page (Value Proposition).
- **Unit 2.2:** Gated Registration Form (Landlord).
- **Unit 2.3:** Property Intake Form (Detailed).

---

## Session Notes

**Session Date:** 2026-07-29
**Context:**
Phase 1 is now **100% complete** (16/16 units). All core buyer/renter pathway functionality is implemented:
- Landing page with GSAP animations, NDPR-compliant FinalCTA
- Property search with SWR data fetching, debounced filters, pagination
- 2-Week Concierge modal with fixed form reset, NDPR consent, rate-limited API
- Lead scoring (6 factors, 0-100), 2-hour SLA with warning/breach/critical alerts
- NDPR data subject rights: export (Right of Access), erasure (Right to be Forgotten), consent history
- Automated 6-month retention anonymization via pg_cron/django-q2
- OpenAPI documentation at `/api/docs/`
- Full validation parity between frontend Zod and backend DRF serializers

**Backend Stack Finalized:**
- Django 4.x + DRF, PostgreSQL, Redis, django-q2 for background tasks
- drf-spectacular for OpenAPI, django-ratelimit for protection
- Modular monolith with 5 bounded contexts (crm, properties, landlords, compliance, ecommerce)

**Frontend Stack Finalized:**
- Next.js 14 App Router, TypeScript strict, Tailwind CSS, shadcn/ui
- SWR for data fetching, react-hook-form + Zod for validation
- GSAP for animations, Lucide for icons

---

## Master Dir

Here is the master Dir:

primekey-homes/
├── frontend/                     # Next.js App Router (Frontend)
│   ├── app/
│   │   ├── globals.css           # Global CSS (Brand Navy #04164a, Lavender #f3f0ff)
│   │   ├── layout.tsx            # Root layout (Google Fonts Poppins & Lora)
│   │   ├── page.tsx              # Public Landing Page (Unit 1.1)
│   │   ├── search/
│   │   │   └── page.tsx          # Property Search Interface (Unit 1.2, 1.10)
│   │   ├── property/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Property Detail Page (Unit 1.3)
│   │   ├── landlord/
│   │   │   └── page.tsx          # Landlord/Owner Landing Page (Unit 2.1)
│   │   ├── dashboard/
│   │   │   └── agent/
│   │   │       └── page.tsx      # Agent Lead Management Dashboard (Unit 2.6)
│   │   └── builder/              # Phase 3 Extension (Optional B2B Marketplace)
│   │       ├── page.tsx          # Builder Portal Coming Soon/Landing (Unit 3.1)
│   │       ├── products/
│   │       │   └── page.tsx      # B2B Product Catalog
│   │       ├── product/[id]/
│   │       │   └── page.tsx      # Product Detail View
│   │       ├── cart/
│   │       │   └── page.tsx      # Shopping Cart View
│   │       ├── checkout/
│   │       │   └── page.tsx      # Payment Checkout View
│   │       ├── orders/
│   │       │   └── page.tsx      # Order Tracking View
│   │       └── supplier/
│   │           └── page.tsx      # Supplier Management Area
│   ├── components/
│   │   ├── Benefits.tsx          # Landing page benefits section
│   │   ├── FAQ.tsx               # Landing page FAQ accordion
│   │   ├── FinalCTA.tsx          # Lead conversion form (shadcn/ui + zod)
│   │   ├── FloatingContact.tsx   # Persistent contact widget
│   │   ├── Footer.tsx            # Site footer
│   │   ├── Hero.tsx              # Main hero section
│   │   ├── Navbar.tsx            # Primary navigation bar
│   │   ├── SocialProof.tsx       # Trust markers section
│   │   ├── search/               # Search & Filtering Components
│   │   │   ├── SearchBar.tsx     # Location & general query input
│   │   │   ├── FilterDropdown.tsx# Property type, beds, options
│   │   │   ├── PriceRange.tsx    # Price range slider/inputs
│   │   │   ├── PropertyGrid.tsx  # Search results layout container
│   │   │   ├── PropertyCard.tsx  # Individual listing preview card
│   │   │   └── SearchResults.tsx # Results container + zero-result trigger logic
│   │   ├── concierge/            # 2-Week Concierge Service Components
│   │   │   ├── ConciergeModal.tsx# Triggered when search returns empty (Fixed form reset)
│   │   │   ├── ConciergeOffer.tsx# Value proposition banner
│   │   │   └── ConciergeForm.tsx # Registration form with NDPR consent
│   │   ├── property/
│   │   │   └── PropertyDetail.tsx# Full detailed view component
│   │   ├── landlord/             # Landlord Pathway Components
│   │   │   ├── LandlordHero.tsx  # Landlord landing hero
│   │   │   ├── BenefitsGrid.tsx  # Value prop comparison matrix
│   │   │   ├── TrustSignals.tsx  # Verification & safety stats
│   │   │   ├── LandlordRegistrationForm.tsx # Owner intake filter form
│   │   │   ├── PropertyIntakeForm.tsx       # Multi-step intake wizard
│   │   │   ├── IntakeStep1.tsx   # Basic info step
│   │   │   ├── IntakeStep2.tsx   # Media & pricing step
│   │   │   ├── IntakeStep3.tsx   # Verification documents step
│   │   │   └── AppointmentBooking.tsx       # Custom internal booking calendar
│   │   ├── dashboard/
│   │   │   ├── LeadTable.tsx     # Agent view of leads and statuses
│   │   │   └── LeadDetail.tsx    # Expanded lead/intake file inspection
│   │   ├── builder/              # B2B E-commerce Components
│   │   └── ui/                   # Reusable UI primitives (shadcn/ui)
│   ├── lib/
│   │   ├── animations.ts         # GSAP ScrollTrigger helpers
│   │   ├── api/                  # API Layer (Contract-First)
│   │   │   ├── contracts.ts      # TypeScript interfaces (single source of truth)
│   │   │   ├── config.ts         # Base URL, auth helpers, retry config
│   │   │   ├── client.ts         # ApiClient class with fetch, retry, interceptors
│   │   │   └── index.ts          # Re-exports
│   │   ├── hooks/                # SWR Data Fetching Hooks
│   │   │   ├── useProperties.ts  # Property search with caching & revalidation
│   │   │   ├── useProperty.ts    # Property detail fetching
│   │   │   └── useConcierge.ts   # Mutation hook with optimistic updates
│   │   ├── utils.ts              # Standard shadcn `cn()` class merging utility
│   │   └── validations/          # Zod Schema Definitions
│   │       ├── searchSchema.ts   # Search filter parameter validation schema
│   │       ├── conciergeSchema.ts# Concierge lead capture validation schema
│   │       └── landlordSchema.ts # Landlord registration & intake validation schema
│   ├── middleware.ts             # Route protection & subpath routing
│   └── __tests__/                # Frontend unit/integration test suites
│
└── backend/                      # Django REST Framework (Backend Monolith)
    ├── core/                     # Project Configuration & Settings
    │   ├── settings.py           # DB, installed apps, CORS, SLA rules, drf-spectacular
    │   ├── urls.py               # Main URL routing (v1 + Schema)
    │   └── wsgi.py               # WSGI entrypoint for VPS deployment
    ├── apps/
    │   ├── crm/                  # Customer Relationship & Concierge Bounded Context
    │   │   ├── models.py         # ConciergeLead, ConsentLog, LeadScore, SLAAlert
    │   │   ├── serializers.py    # Serializers for API conversion
    │   │   ├── views.py          # API ViewSets (submit-concierge, rate limited)
    │   │   ├── services.py       # LeadScoringService, SLAAlertService
    │   │   ├── tasks.py          # Background processing (2-hr SLA timers)
    │   │   ├── management/commands/check_sla_alerts.py
    │   │   └── urls.py           # /api/v1/crm/ routing
    │   ├── properties/           # Property Listings Bounded Context
    │   │   ├── models.py         # Property, Media, Location models
    │   │   ├── serializers.py    # Property serialization + search params
    │   │   ├── views.py          # Search & detail endpoints (paginated, filtered)
    │   │   ├── services.py       # SearchService logic
    │   │   └── urls.py           # /api/v1/properties/ routing
    │   ├── landlords/            # Landlord Onboarding Bounded Context
    │   │   ├── models.py         # LandlordProfile, PropertyIntake, Appointment
    │   │   ├── serializers.py    # Intake and booking serializers
    │   │   ├── views.py          # Owner intake & appointment endpoints
    │   │   ├── services.py       # BookingService logic
    │   │   └── urls.py           # /api/v1/landlords/ routing
    │   ├── dashboard/            # Agent/Admin Portal Backend Context
    │   │   ├── views.py          # Internal dashboard data aggregated endpoints
    │   │   └── serializers.py    # Admin data formatters
    │   ├── compliance/           # NDPR Data Privacy & Governance Context
    │   │   ├── models.py         # ExportRequest, ErasureRequest, AnonymizationLog, ConsentLog
    │   │   ├── serializers.py    # Data Subject Rights serializers
    │   │   ├── views.py          # Data export & erasure API endpoints
    │   │   ├── services.py       # Retention & Anonymization handlers
    │   │   ├── tasks.py          # Async tasks for export/erasure/retention
    │   │   └── urls.py           # /api/v1/compliance/ routing
    │   └── ecommerce/            # Phase 3: Builder Pathway Context (Optional)
    │       ├── models.py         # Product, Category, Cart, Order, Supplier
    │       ├── serializers.py    # B2B E-commerce serializers
    │       ├── views.py          # Catalog & Order endpoints
    │       ├── services.py       # CartService, PaymentService, SupplierService
    │       ├── webhooks.py       # Paystack/Flutterwave webhook listeners
    │       └── urls.py           # /api/v1/ecommerce/ routing
    └── manage.py