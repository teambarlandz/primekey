```markdown
# System Architecture & Technical Specifications

This document defines the high-level architecture, subsystem boundaries, data models, and technical standards for Primekey Homes and Properties Ltd.

---

## 🏛️ 1. High-Level Architecture Overview

Primekey Homes utilizes a **Modular Monolith architecture using Domain-Driven Design (DDD)** principles. The platform separates concerns into distinct bounded contexts while maintaining unified deployment pipelines on a single virtual private server (VPS).

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP ROUTER FRONTEND                      │
│   (Brand Navy #04164a | Lavender #f3f0ff | Poppins/Lora | GSAP Animations) │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  API Layer: Typed Contracts → SWR Data Fetching → React Hooks  │  │
│   └─────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ REST API / JSON (v1)
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                  DJANGO REST FRAMEWORK BACKEND MODULES                   │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │   CRM Context    │  │ Properties Context│  │  Landlord Context    │  │
│  │ (Concierge/Leads)│  │ (Search & Grid)  │  │ (Intake & Bookings)  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────┬───────────┘  │
│           │                     │                       │               │
│  ┌────────┴─────────┐  ┌────────┴─────────┐  ┌──────────┴───────────┐  │
│  │ Compliance Context│  │ Analytics Context│  │  E-Commerce (Ph 3)   │  │
│  │ (NDPR / Consent) │  │  (SLA & Scoring) │  │ (Builder Marketplace)│  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                  POSTGRESQL DATABASE (WITH PG_CRON)                    │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🔄 2. Frontend-Backend Integration Architecture

### API Contract-First Design
- **Single Source of Truth**: `frontend/lib/api/contracts.ts` defines all request/response types
- **Validation Parity**: Frontend Zod schemas mirror backend DRF serializers 1:1
- **Versioned Endpoints**: All APIs under `/api/v1/` for backward compatibility

### Data Fetching Strategy (SWR)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Component  │────▶│  useSWR     │────▶│  ApiClient  │
│  (hooks)    │     │  (cache,    │     │  (fetch,    │
│             │     │   revalidate)     │   retry,    │
└─────────────┘     └─────────────┘     │   intercept)│
       ▲                   │            └──────┬────────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
              mutate() / optimistic updates
```

### Request Flow
1. Component calls typed hook (`useProperties(filters)`)
2. SWR checks cache → returns stale data instantly
3. Background fetch via `ApiClient.searchProperties(filters)`
4. `ApiClient` adds auth headers, handles retries, parses errors
5. Response validated against contract types
6. SWR updates cache → component re-renders with fresh data

### Mutation Flow (Optimistic Updates)
1. Component calls mutation hook (`useConcierge()`)
2. Optimistic UI update (immediate feedback)
3. `ApiClient.submitConciergeLead(payload)` POST to `/api/v1/crm/submit-concierge/`
4. On success: `mutate('/properties/search')` invalidates related queries
5. On error: rollback optimistic state, show toast with field errors

## 📁 3. Backend Application Structure (Django Modular Monolith)

```text
primekey-backend/
├── manage.py                     # Django management script
├── requirements.txt              # Python package dependencies
├── Dockerfile                    # Container definition
├── docker-compose.yml            # Services orchestration (Django, Postgres, Redis)
│
├── core/                         # Project Configuration Core
│   ├── __init__.py
│   ├── settings/
│   │   ├── base.py               # Shared settings (Apps, Middleware, DB Config)
│   │   ├── local.py              # Local development settings
│   │   └── production.py         # Production VPS settings
│   ├── urls.py                   # Master URL Router (v1 + Schema)
│   ├── wsgi.py                   # WSGI application entrypoint
│   └── asgi.py                   # Async entrypoint
│
└── apps/                         # Bounded Domain Modules
    ├── crm/                      # Lead Generation & Concierge Context
    │   ├── models.py             # ConciergeLead, SLAAlert
    │   ├── serializers.py        # Lead submission serializers
    │   ├── views.py              # /api/v1/crm/submit-concierge/ (rate limited: 10/min/IP)
    │   ├── services.py           # LeadScoringService, SLAAlertService
    │   ├── urls.py               # CRM routes
    │   └── tests.py
    │
    ├── properties/               # Property Search & Catalog Context
    │   ├── models.py             # Property, Media, Location
    │   ├── serializers.py        # Property catalog + search parameter serializers
    │   ├── views.py              # /api/v1/properties/search/, /api/v1/properties/<uuid:pk>/
    │   ├── services.py           # SearchEngineService, FilterService
    │   ├── urls.py
    │   └── tests.py
    │
    ├── landlords/                # Landlord & Intake Context
    │   ├── models.py             # LandlordProfile, PropertyIntake, Appointment
    │   ├── serializers.py        # Owner registration & booking serializers
    │   ├── views.py              # Intake & consultation scheduling APIs
    │   ├── services.py           # AppointmentBookingService
    │   ├── urls.py
    │   └── tests.py
    │
    ├── compliance/               # NDPR & Data Privacy Context
    │   ├── models.py             # ConsentLog, AuditTrail
    │   ├── serializers.py        # Privacy & export serializers
    │   ├── views.py              # Data export & erasure endpoints
    │   ├── services.py           # AnonymizationService
    │   ├── management/
    │   │   └── commands/
    │   │       └── anonymize_leads.py  # Retention cleanup cron task
    │   ├── urls.py
    │   └── tests.py
    │
    └── ecommerce/                # Phase 3 Extension Context (Builder Portal)
        ├── models.py             # Supplier, Product, Order, Cart
        ├── serializers.py
        ├── views.py
        ├── services.py           # PaymentService (Flutterwave/Paystack)
        └── urls.py
```

## 💾 4. Database Schema Specification (PostgreSQL)

### 4.1 Core Relational Tables

#### concierge_leads
* id (UUID, Primary Key)
* full_name (VARCHAR(255))
* phone (VARCHAR(20), Indexed)
* email (VARCHAR(255), Nullable)
* preferred_location (VARCHAR(100))
* budget_min (NUMERIC(12, 2))
* budget_max (NUMERIC(12, 2))
* property_type (VARCHAR(50))
* bedroom_count (VARCHAR(20))
* lead_score (INTEGER, Default 0)
* status (ENUM: 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'CLOSED', 'EXPIRED')
* assigned_agent_id (UUID, Nullable, FK → auth_user)
* created_at (TIMESTAMPTZ, Default NOW())
* sla_deadline (TIMESTAMPTZ, Default NOW() + 2 Hours)

#### properties
* id (UUID, Primary Key)
* title (VARCHAR(255))
* slug (VARCHAR(255), Unique Index)
* description (TEXT)
* price (NUMERIC(12, 2), Indexed)
* location_city (VARCHAR(100), Indexed)
* location_state (VARCHAR(100))
* property_type (VARCHAR(50), Indexed)
* bedrooms (INTEGER)
* bathrooms (INTEGER)
* is_available (BOOLEAN, Default True)
* created_at (TIMESTAMPTZ, Default NOW())

#### consent_logs
* id (UUID, Primary Key)
* lead_id (UUID, FK → concierge_leads)
* consent_given (BOOLEAN, Default True)
* consent_text (TEXT)
* ip_address (INET)
* timestamp (TIMESTAMPTZ, Default NOW())

## 🔌 5. API Specification

### Versioning
All endpoints prefixed with `/api/v1/`. Breaking changes introduced in `/api/v2/` with 6-month deprecation window.

### Rate Limiting
| Endpoint | Limit | Scope |
|----------|-------|-------|
| `POST /api/v1/crm/submit-concierge/` | 10 req/min | Per IP |
| `GET /api/v1/properties/search/` | 60 req/min | Per IP |

Exceeding limits returns `429 Too Many Requests` with `Retry-After` header.

### Endpoints

#### CRM Context
```
POST   /api/v1/crm/submit-concierge/     # Submit concierge lead (rate limited)
GET    /api/v1/crm/leads/                # List leads (auth required)
GET    /api/v1/crm/leads/<uuid:pk>/      # Retrieve lead (auth required)
PATCH  /api/v1/crm/leads/<uuid:pk>/      # Update lead status (auth required)
```

#### Properties Context
```
GET    /api/v1/properties/search/        # Search with filters + pagination
GET    /api/v1/properties/<uuid:pk>/     # Property detail
```

**Search Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `location` | string | "" | Searches address, city, state, area |
| `property_type` | enum | "any" | One of 17 property types |
| `min_price` | integer | 0 | Minimum price in NGN |
| `max_price` | integer | 500000000 | Maximum price in NGN |
| `bedrooms` | string | "any" | "1".."5" or "any" |
| `page` | integer | 1 | Page number |
| `page_size` | integer | 12 | Results per page (max 50) |
| `ordering` | enum | "-is_featured" | Sort: ±created_at, ±price, -is_featured |

**Response Format:**
```json
{
  "success": true,
  "count": 42,
  "next": "/api/v1/properties/search/?page=2",
  "previous": null,
  "data": [...]
}
```

#### Error Response Format (All Endpoints)
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  },
  "code": "VALIDATION_ERROR"
}
```

### API Documentation
- **OpenAPI Schema**: `GET /api/schema/`
- **Swagger UI**: `GET /api/docs/`
- **ReDoc**: `GET /api/redoc/`

## ⚡ 6. Domain Contexts & Key Workflows

### 6.1 Concierge Pathway (Buyer/Renter)
1. User visits `/search` and executes search filters.
2. If properties are returned, user browses property details.
3. If search returns 0 results, frontend triggers `ConciergeModal`.
4. User submits requirements & contact details with explicit NDPR consent checkbox.
5. `POST /api/v1/crm/submit-concierge/` creates `concierge_leads` record and logs consent in `consent_logs`.
6. Backend calculates `lead_score` and sets `sla_deadline` (2-hour timer).
7. If unhandled within 2 hours, background worker logs SLA breach alert for management review.

### 6.2 Landlord Pathway (Owner)
1. Owner visits `/landlord` landing page.
2. Fills out multi-step intake form detailing property features and asking price.
3. Selects available time slot for agent consultation inspection.
4. Record saved in landlords context; notification dispatched to field agent.

### 6.3 Authentication Gate Policy & Boundary Enforcement
To maximize marketing reach, initial discovery and low-barrier lead capture remain un-gated, while high-intent personal actions are protected by lightweight Auth Interception.

#### Un-Gated Public Routes (No Auth Required)
* **Marketing Landing Page (/):** Public access for search engines and guest visitors.
* **Property Search Portal (/search):** Open filter controls, search bars, and property result grids to encourage uninhibited browsing and SEO indexing.
* **Property Detail View (/property/[id]):** Fully public property spec sheets, photo galleries, and location summaries.
* **2-Week Concierge Lead Submission (ConciergeModal):** Guest-friendly submission collecting phone/email with explicit NDPR consent checkbox. Acting as direct lead capture without forcing up-front password creation.

#### Auth-Gated Action Boundaries (Triggers Login/OTP Modal)
When an unauthenticated guest attempts any of the following high-intent actions, an **Auth Modal Sheet** intercepts the user, verifies their identity (via Phone/OTP or Social Sign-In), and seamlessly resumes their intended action upon successful token generation:
1. **Saved Searches & Instant Alerts:** Clicking "Save Search Criteria" or "Alert Me for New Listings" on /search.
2. **Favorite/Saved Properties:** Clicking the "Heart / Save Property" button on property cards or detail pages.
3. **Physical Tour & Agent Booking:** Clicking "Book Inspection Tour" or "Contact Agent Directly" on /property/[id].
4. **Landlord Intake Finalization:** Submitting Step 3 of the property intake form on /landlord.
5. **Builder B2B Checkout (Phase 3):** Clicking "Proceed to Checkout" in the /builder portal.

## 🔒 7. NDPR Compliance & Data Retention Rules
* **Consent Requirement:** All forms submitting personal information must explicitly require checkbox agreement to data processing terms under the Nigeria Data Protection Act / NDPR.
* **Consent Audit Log:** Every lead submission generates an immutable row in `consent_logs` recording time, IP address, and consent agreement copy.
* **Retention Period:** Inactive leads with no activity for 6 months are automatically scrubbed/anonymized via Django management command `anonymize_leads` scheduled in `pg_cron`.
* **Data Subject Rights:** API provides endpoints for Data Export (`GET /api/v1/compliance/export-data`) and Right to Erasure (`DELETE /api/v1/compliance/forget-me`).

## 🛠️ 8. Technology Stack Summary
* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, GSAP (@gsap/react), react-hook-form, zod, SWR.
* **Backend:** Python 3.11+, Django, Django REST Framework (DRF), PostgreSQL, Redis (caching/queues), django-ratelimit, drf-spectacular.
* **Typography:** Poppins (Headings) + Lora (Body).
* **Colors:** Brand Navy (#04164a), Lavender (#f3f0ff), Pure White (#ffffff).

## 📐 9. Code Standards & Patterns

### Frontend API Layer
```
lib/api/
├── contracts.ts     # TypeScript interfaces (single source of truth)
├── config.ts        # Base URL, auth token helpers, retry config
├── client.ts        # ApiClient class with fetch, retry, interceptors
└── index.ts         # Re-exports
```

### Data Fetching Hooks
```
hooks/
├── useProperties.ts     # SWR wrapper for property search
├── useProperty.ts       # SWR wrapper for property detail
└── useConcierge.ts      # Mutation hook with optimistic updates
```

### Validation Parity
| Frontend (Zod) | Backend (DRF) |
|----------------|---------------|
| `conciergeFormSchema` | `ConciergeLeadSerializer` |
| `searchFilterSchema` | `PropertySearchSerializer` |
| Shared regex: `NIGERIAN_PHONE_REGEX` | Same regex in serializer `validate_phone` |

### Environment-Aware API Base
```typescript
// config.ts
const isServer = typeof window === 'undefined';
export const API_BASE = isServer 
  ? process.env.NEXT_PUBLIC_INTERNAL_API_URL  // Direct internal URL
  : '/api/backend';                            // Next.js rewrite proxy
```
Next.js `rewrites()` in `next.config.mjs` proxies `/api/backend/*` to external API URL.

---

```
```