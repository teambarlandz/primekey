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
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                             REST API / JSON
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
## 📁 2. Backend Application Structure (Django Modular Monolith)
The backend is structured into domain-isolated Django apps within a unified repository layout:
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
│   ├── urls.py                   # Master URL Router
│   ├── wsgi.py                   # WSGI application entrypoint
│   └── asgi.py                   # Async entrypoint
│
└── apps/                         # Bounded Domain Modules
    ├── crm/                      # Lead Generation & Concierge Context
    │   ├── models.py             # ConciergeLead, SLAAlert
    │   ├── serializers.py        # Lead submission serializers
    │   ├── views.py              # /api/submit-concierge endpoint
    │   ├── services.py           # LeadScoringService, SLAAlertService
    │   ├── urls.py               # CRM routes
    │   └── tests.py
    │
    ├── properties/               # Property Search & Catalog Context
    │   ├── models.py             # Property, Media, Location
    │   ├── serializers.py        # Property catalog serializers
    │   ├── views.py              # /api/search, /api/property/[id]
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
## 💾 3. Database Schema Specification (PostgreSQL)
### 3.1 Core Relational Tables
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
## ⚡ 4. Domain Contexts & Key Workflows
### 4.1 Concierge Pathway (Buyer/Renter)
 1. User visits /search and executes search filters.
 2. If properties are returned, user browses property details.
 3. If search returns 0 results, frontend triggers ConciergeModal.
 4. User submits requirements & contact details with explicit NDPR consent checkbox.
 5. POST /api/submit-concierge creates concierge_leads record and logs consent in consent_logs.
 6. Backend calculates lead_score and sets sla_deadline (2-hour timer).
 7. If unhandled within 2 hours, background worker logs SLA breach alert for management review.
### 4.2 Landlord Pathway (Owner)
 1. Owner visits /landlord landing page.
 2. Fills out multi-step intake form detailing property features and asking price.
 3. Selects available time slot for agent consultation inspection.
 4. Record saved in landlords context; notification dispatched to field agent.
### 4.3 Authentication Gate Policy & Boundary Enforcement
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
## 🔒 5. NDPR Compliance & Data Retention Rules
 * **Consent Requirement:** All forms submitting personal information must explicitly require checkbox agreement to data processing terms under the Nigeria Data Protection Act / NDPR.
 * **Consent Audit Log:** Every lead submission generates an immutable row in consent_logs recording time, IP address, and consent agreement copy.
 * **Retention Period:** Inactive leads with no activity for 6 months are automatically scrubbed/anonymized via Django management command anonymize_leads scheduled in pg_cron.
 * **Data Subject Rights:** API provides endpoints for Data Export (GET /api/compliance/export-data) and Right to Erasure (DELETE /api/compliance/forget-me).
## 🛠️ 6. Technology Stack Summary
 * **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, GSAP (@gsap/react), react-hook-form, zod.
 * **Backend:** Python 3.11+, Django, Django REST Framework (DRF), PostgreSQL, Redis (caching/queues).
 * **Typography:** Poppins (Headings) + Lora (Body).
 * **Colors:** Brand Navy (#04164a), Lavender (#f3f0ff), Pure White (#ffffff).
```

---

```
