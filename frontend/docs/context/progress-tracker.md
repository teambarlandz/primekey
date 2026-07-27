# Progress Tracker

Update this file after every meaningful implementation change[span_0](start_span)[span_0](end_span). This document serves as the project's memory, enabling smooth resumption of work between sessions and providing a clear audit trail of decisions and progress[span_1](start_span)[span_1](end_span).

## Project Scope

### Core Project (Phases 1 & 2)
- **Phase 1:** Buyer/Renter Pathway — Lead generation engine with "2-Week Concierge" service[span_2](start_span)[span_2](end_span).
- **Phase 2:** Landlord/Owner Pathway — Gated registration, property intake, appointment booking[span_3](start_span)[span_3](end_span).

### Optional Extension (Phase 3)
- **Builder/Developer Pathway** — Full-blown B2B e-commerce marketplace for building materials[span_4](start_span)[span_4](end_span).
- **Trigger:** Achieve success metrics from Phases 1 & 2 (e.g., > 15% concierge conversion rate, steady lead flow, positive LTV:CAC ratio)[span_5](start_span)[span_5](end_span).
- **Decision Point:** Re-evaluate after 3-6 months of live operations[span_6](start_span)[span_6](end_span).

---

## Master Task List (Start to Finish)

### Phase 1: Buyer/Renter Pathway (Core)

| Unit | Name | Status | Description | Files | Est. Time |
| --- | --- | --- | --- | --- | --- |
| **1.1** | **Landing Page UI (Styling, Localization & Interactivity)** | ✅ Completed | Transformed skeletal `.tsx` files into the production Primekey Homes marketing surface[span_7](start_span)[span_7](end_span). Applied Brand Navy (`#04164a`), Lavender background (`#f3f0ff`), Poppins/Lora typography, refactored `FinalCTA.tsx` using `shadcn/ui` + `react-hook-form` + `zod`, localized copy to Nigeria, and added GSAP scroll animations[span_8](start_span)[span_8](end_span). | `app/globals.css`, `app/layout.tsx`, `components/Navbar.tsx`, `components/Hero.tsx`, `components/SocialProof.tsx`, `components/Benefits.tsx`, `components/FAQ.tsx`, `components/FinalCTA.tsx`, `components/Footer.tsx`, `components/FloatingContact.tsx`, `lib/animations.ts`[span_9](start_span)[span_9](end_span) | 4-5 hrs |
| **1.2** | **Dynamic Property Search (UI & Filters)** | ✅ Completed | Build the search interface with filters (location, price range, property type, bedrooms)[span_10](start_span)[span_10](end_span). UI only[span_11](start_span)[span_11](end_span). | `app/search/page.tsx`, `components/search/SearchBar.tsx`, `components/search/FilterDropdown.tsx`, `components/search/PriceRange.tsx`, `lib/validations/searchSchema.ts`[span_12](start_span)[span_12](end_span) | 2-3 hrs |
| **1.3** | **Property Results Grid & Detail View** | ✅ Completed | Display search results as a grid of property cards[span_13](start_span)[span_13](end_span). Clicking a card opens a property detail page[span_14](start_span)[span_14](end_span). | `components/search/PropertyGrid.tsx`, `components/search/PropertyCard.tsx`, `app/property/[id]/page.tsx`, `components/property/PropertyDetail.tsx`[span_15](start_span)[span_15](end_span) | 2-3 hrs |
| **1.4** | **"Not Found" → Concierge Conditional Logic** | ✅ Completed | Implement the critical conditional trigger[span_16](start_span)[span_16](end_span). When search returns zero results, display the Concierge modal instead of "No results.[span_17](start_span)"[span_17](end_span) | `components/search/SearchResults.tsx`, `components/concierge/ConciergeModal.tsx`, `components/concierge/ConciergeOffer.tsx`[span_18](start_span)[span_18](end_span) | 2-3 hrs |
| **1.5** | **Concierge Registration Form (Frontend)** | ✅ Completed | Build the registration form inside the concierge modal[span_19](start_span)[span_19](end_span). Collects all required data with NDPR consent[span_20](start_span)[span_20](end_span). | `components/concierge/ConciergeForm.tsx`, `components/concierge/ConciergeModal.tsx`, `lib/validations/conciergeSchema.ts`[span_21](start_span)[span_21](end_span) | 2-3 hrs |
| 1.6 | Backend API — POST /api/submit-concierge | ⬜ Not Started | Build the Django backend endpoint that receives the concierge form data, validates it, creates a lead, and logs consent[span_22](start_span)[span_22](end_span). | `backend/apps/crm/views.py`, `backend/apps/crm/serializers.py`, `backend/apps/crm/models.py`, `backend/apps/crm/services.py`, `backend/apps/crm/urls.py`[span_23](start_span)[span_23](end_span) | 2-3 hrs |
| 1.7 | Database Schema & Migrations | ⬜ Not Started | Create PostgreSQL tables for `concierge_leads`, `consent_logs`, `lead_scores`, and `properties`[span_24](start_span)[span_24](end_span). | `backend/apps/crm/models.py`, `backend/apps/properties/models.py`, `backend/apps/crm/migrations/`, `backend/apps/properties/migrations/`[span_25](start_span)[span_25](end_span) | 2-3 hrs |
| 1.8 | Lead Scoring & SLA Alerting (Backend) | ⬜ Not Started | Implement lead scoring logic and the 2-hour SLA alert system[span_26](start_span)[span_26](end_span). | `backend/apps/crm/services.py` (LeadScoringService, SLAAlertService), `backend/apps/crm/tasks.py`, `backend/apps/crm/models.py`, `backend/apps/dashboard/views.py`[span_27](start_span)[span_27](end_span) | 3-4 hrs |
| 1.9 | Search API — GET /api/search | ⬜ Not Started | Build the backend search endpoint that queries the `properties` table and returns matching results[span_28](start_span)[span_28](end_span). | `backend/apps/properties/views.py`, `backend/apps/properties/serializers.py`, `backend/apps/properties/services.py` (SearchService), `backend/apps/properties/urls.py`[span_29](start_span)[span_29](end_span) | 2-3 hrs |
| **1.10** | **Frontend-Backend Integration (Search + Concierge)** | 🟡 In Progress | Connect the frontend search and concierge form to the backend APIs[span_30](start_span)[span_30](end_span). | `app/search/page.tsx`, `lib/api-client.ts`, `components/search/SearchResults.tsx`, `components/concierge/ConciergeForm.tsx`[span_31](start_span)[span_31](end_span) | 2-3 hrs |
| 1.11 | NDPR Compliance — Data Export & Erasure Endpoints | ⬜ Not Started | Build the backend endpoints for data subject rights (Right of Access, Right to Erasure) and scheduled anonymization[span_32](start_span)[span_32](end_span). | `backend/apps/compliance/views.py`, `backend/apps/compliance/serializers.py`, `backend/apps/compliance/services.py`, `backend/apps/compliance/management/commands/anonymize_leads.py`, `backend/apps/compliance/urls.py`[span_33](start_span)[span_33](end_span) | 3-4 hrs |
| 1.12 | QA & Testing (Buyer Pathway) | ⬜ Not Started | Write and run tests for all Buyer pathway functionality[span_34](start_span)[span_34](end_span). | `backend/apps/*/tests.py`, `__tests__/`, `cypress/e2e/`[span_35](start_span)[span_35](end_span) | 3-4 hrs |

**Phase 1 Progress: 5 / 12 Units Complete**[span_36](start_span)[span_36](end_span)

---

### Phase 2: Landlord/Owner Pathway (Core)

| Unit | Name | Status | Description | Files | Est. Time |
| --- | --- | --- | --- | --- | --- |
| 2.1 | Landlord Landing Page (Value Proposition) | ⬜ Not Started | Build the dedicated landing page for landlords/owners, emphasizing the value of outsourcing property management[span_37](start_span)[span_37](end_span). | `app/landlord/page.tsx`, `components/landlord/LandlordHero.tsx`, `components/landlord/BenefitsGrid.tsx`, `components/landlord/TrustSignals.tsx`[span_38](start_span)[span_38](end_span) | 1-2 hrs |
| 2.2 | Gated Registration Form (Landlord) | ⬜ Not Started | Build the registration form that filters casual inquiries and collects owner details[span_39](start_span)[span_39](end_span). | `components/landlord/LandlordRegistrationForm.tsx`, `backend/apps/landlords/models.py`, `backend/apps/landlords/views.py`, `backend/apps/landlords/serializers.py`[span_40](start_span)[span_40](end_span) | 2 hrs |
| 2.3 | Property Intake Form (Detailed) | ⬜ Not Started | Build the multi-step property intake form that captures all necessary details[span_41](start_span)[span_41](end_span). | `components/landlord/PropertyIntakeForm.tsx`, `components/landlord/IntakeStep1.tsx`, `components/landlord/IntakeStep2.tsx`, `components/landlord/IntakeStep3.tsx`, `backend/apps/landlords/models.py`, `backend/apps/landlords/views.py`, `backend/apps/landlords/serializers.py`[span_42](start_span)[span_42](end_span) | 3 hrs |
| 2.4 | Automated Appointment Booking Engine | ⬜ Not Started | Build the system that allows landlords to book consultations with agents[span_43](start_span)[span_43](end_span). | `components/landlord/AppointmentBooking.tsx`, `backend/apps/landlords/models.py` (Appointment), `backend/apps/landlords/services.py` (BookingService), `backend/apps/landlords/views.py`[span_44](start_span)[span_44](end_span) | 3 hrs |
| 2.5 | Backend APIs for Landlord Pathway | ⬜ Not Started | Build all backend endpoints for landlord registration, property intake, and appointment booking[span_45](start_span)[span_45](end_span). | `backend/apps/landlords/views.py`, `backend/apps/landlords/serializers.py`, `backend/apps/landlords/services.py`, `backend/apps/landlords/urls.py`[span_46](start_span)[span_46](end_span) | 3-4 hrs |
| 2.6 | Agent Dashboard (Landlord Leads) | ⬜ Not Started | Build the agent dashboard for viewing and managing landlord leads[span_47](start_span)[span_47](end_span). | `app/dashboard/agent/page.tsx`, `components/dashboard/LeadTable.tsx`, `components/dashboard/LeadDetail.tsx`, `backend/apps/dashboard/views.py`, `backend/apps/dashboard/serializers.py`[span_48](start_span)[span_48](end_span) | 2-3 hrs |
| 2.7 | Frontend-Backend Integration (Landlord) | ⬜ Not Started | Connect all landlord frontend components to their backend APIs[span_49](start_span)[span_49](end_span). | `components/landlord/LandlordRegistrationForm.tsx`, `components/landlord/PropertyIntakeForm.tsx`, `components/landlord/AppointmentBooking.tsx`, `lib/api-client.ts`, `app/dashboard/agent/page.tsx`[span_50](start_span)[span_50](end_span) | 2-3 hrs |
| 2.8 | QA & Testing (Landlord Pathway) | ⬜ Not Started | Write and run tests for all Landlord pathway functionality[span_51](start_span)[span_51](end_span). | `backend/apps/landlords/tests.py`, `__tests__/landlord/`, `cypress/e2e/landlord/`[span_52](start_span)[span_52](end_span) | 3-4 hrs |

**Phase 2 Complete ✅ — Core Project Done**

---

### Phase 3: Builder/Developer Pathway (Optional Extension)
*Trigger: Only begin if Phases 1 & 2 are live and profitable.*[span_53](start_span)[span_53](end_span)

| Unit | Name | Status | Description | Files | Est. Time |
| --- | --- | --- | --- | --- | --- |
| 3.1 | Builder Portal (Subdirectory Setup) | ⬜ Not Started | Set up a dedicated subdirectory route (`/builder`) with a Coming Soon page initially[span_54](start_span)[span_54](end_span). | `app/builder/page.tsx`, `middleware.ts`[span_55](start_span)[span_55](end_span) | 1 hr |
| 3.2 | Product Catalog (Backend) | ⬜ Not Started | Build the Django models and APIs for the B2B product catalog[span_56](start_span)[span_56](end_span). | `backend/apps/ecommerce/models.py` (Product, Category), `backend/apps/ecommerce/serializers.py`, `backend/apps/ecommerce/views.py`, `backend/apps/ecommerce/urls.py`[span_57](start_span)[span_57](end_span) | 2-3 hrs |
| 3.3 | Shopping Cart & Checkout (Backend) | ⬜ Not Started | Build the cart management and checkout APIs[span_58](start_span)[span_58](end_span). | `backend/apps/ecommerce/models.py` (Cart, Order, OrderItem), `backend/apps/ecommerce/services.py` (CartService, CheckoutService), `backend/apps/ecommerce/views.py`, `backend/apps/ecommerce/serializers.py`[span_59](start_span)[span_59](end_span) | 3-4 hrs |
| 3.4 | Payment Gateway Integration | ⬜ Not Started | Integrate with a Nigerian payment gateway (Flutterwave or Paystack)[span_60](start_span)[span_60](end_span). | `backend/apps/ecommerce/services.py` (PaymentService), `backend/apps/ecommerce/views.py`, `backend/apps/ecommerce/webhooks.py`, `.env`[span_61](start_span)[span_61](end_span) | 3-4 hrs |
| 3.5 | Builder Frontend (Catalog, Cart, Checkout) | ⬜ Not Started | Build the frontend for the B2B e-commerce portal[span_62](start_span)[span_62](end_span). | `app/builder/products/page.tsx`, `app/builder/product/[id]/page.tsx`, `app/builder/cart/page.tsx`, `app/builder/checkout/page.tsx`, `app/builder/orders/page.tsx`, `components/builder/`[span_63](start_span)[span_63](end_span) | 3-4 hrs |
| 3.6 | Supplier-Charge Monetization | ⬜ Not Started | Implement the B2B monetization model (charge suppliers, not buyers)[span_64](start_span)[span_64](end_span). | `backend/apps/ecommerce/models.py` (Supplier), `backend/apps/ecommerce/services.py` (SupplierService, AnalyticsService), `app/builder/supplier/`, `app/admin/analytics/`[span_65](start_span)[span_65](end_span) | 3-4 hrs |
| 3.7 | QA & Testing (Builder Pathway) | ⬜ Not Started | Write and run tests for all Builder pathway functionality[span_66](start_span)[span_66](end_span). | `backend/apps/ecommerce/tests.py`, `__tests__/builder/`, `cypress/e2e/builder/`[span_67](start_span)[span_67](end_span) | 3-4 hrs |

---

## Current Phase
- **Phase:** Phase 1 — Buyer/Renter Pathway[span_68](start_span)[span_68](end_span).
- **Status:** Units 1.1 through 1.5 (Frontend UI components) are complete[span_69](start_span)[span_69](end_span).
- **Current Goal:** Progressing Unit 1.10 (Frontend-Backend Integration) and initializing backend services[span_70](start_span)[span_70](end_span).

## Completed
- **Phase 0:** Discovery & Planning — Complete[span_71](start_span)[span_71](end_span). All context files aligned with Modular Monolith + DDD architecture[span_72](start_span)[span_72](end_span).
- **Unit 1.1:** Landing Page UI (Styling, Localization & Interactivity) — **COMPLETE**[span_73](start_span)[span_73](end_span).
- **Unit 1.2:** Dynamic Property Search (UI & Filters) — **COMPLETE**[span_74](start_span)[span_74](end_span).
  - Created `/search/page.tsx` search page layout[span_75](start_span)[span_75](end_span).
  - Built `SearchBar.tsx`, `FilterDropdown.tsx`, and `PriceRange.tsx`[span_76](start_span)[span_76](end_span).
  - Connected search and filter fields using `react-hook-form` and `zod` (`searchSchema.ts`)[span_77](start_span)[span_77](end_span).
- **Unit 1.3:** Property Results Grid & Detail View — **COMPLETE**[span_78](start_span)[span_78](end_span).
  - Built `PropertyGrid.tsx` and `PropertyCard.tsx` for displaying search listings[span_79](start_span)[span_79](end_span).
  - Implemented detail page view route at `/property/[id]/page.tsx` with `PropertyDetail.tsx`[span_80](start_span)[span_80](end_span).
- **Unit 1.4:** "Not Found" → Concierge Conditional Logic — **COMPLETE**[span_81](start_span)[span_81](end_span).
  - Created `SearchResults.tsx` to handle conditional rendering[span_82](start_span)[span_82](end_span).
  - Integrated `ConciergeModal.tsx` and `ConciergeOffer.tsx` to automatically trigger when search returns zero matching results[span_83](start_span)[span_83](end_span).
- **Unit 1.5:** Concierge Registration Form (Frontend) — **COMPLETE**[span_84](start_span)[span_84](end_span).
  - Built `ConciergeForm.tsx` inside the modal with NDPR consent compliance toggles[span_85](start_span)[span_85](end_span).
  - Enforced schema validation using `conciergeSchema.ts`[span_86](start_span)[span_86](end_span).

## In Progress
- **Unit 1.10:** Frontend-Backend Integration (Search + Concierge)[span_87](start_span)[span_87](end_span).

## Next Up
**Unit 1.6 & Unit 1.7:** Begin Backend API and Database Schema implementation[span_88](start_span)[span_88](end_span)
- Create `ConciergeLead`, `ConsentLog`, and `Property` models in Django ORM[span_89](start_span)[span_89](end_span).
- Generate PostgreSQL migrations[span_90](start_span)[span_90](end_span).
- Implement `POST /api/submit-concierge` endpoint with serialization and consent verification logic[span_91](start_span)[span_91](end_span).
- Hook up `lib/api-client.ts` in Next.js to transmit search parameters and form submissions[span_92](start_span)[span_92](end_span).

---

## Master Dir

Here is the master Dir:

primekey-homes/
├── frontend/                     # Next.js App Router (Frontend)
│   ├── app/
│   │   ├── globals.css           # Global CSS (Brand Navy #04164a, Lavender #f3f0ff)[span_1](start_span)[span_1](end_span)
│   │   ├── layout.tsx            # Root layout (Google Fonts Poppins & Lora)[span_2](start_span)[span_2](end_span)
│   │   ├── page.tsx              # Public Landing Page (Unit 1.1)[span_3](start_span)[span_3](end_span)
│   │   ├── search/
│   │   │   └── page.tsx          # Property Search Interface (Unit 1.2)[span_4](start_span)[span_4](end_span)
│   │   ├── property/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Property Detail Page (Unit 1.3)[span_5](start_span)[span_5](end_span)
│   │   ├── landlord/
│   │   │   └── page.tsx          # Landlord/Owner Landing Page (Unit 2.1)[span_6](start_span)[span_6](end_span)
│   │   ├── dashboard/
│   │   │   └── agent/
│   │   │       └── page.tsx      # Agent Lead Management Dashboard (Unit 2.6)[span_7](start_span)[span_7](end_span)
│   │   └── builder/              # Phase 3 Extension (Optional B2B Marketplace)[span_8](start_span)[span_8](end_span)
│   │       ├── page.tsx          # Builder Portal Coming Soon/Landing (Unit 3.1)[span_9](start_span)[span_9](end_span)
│   │       ├── products/
│   │       │   └── page.tsx      # B2B Product Catalog[span_10](start_span)[span_10](end_span)
│   │       ├── product/[id]/
│   │       │   └── page.tsx      # Product Detail View[span_11](start_span)[span_11](end_span)
│   │       ├── cart/
│   │       │   └── page.tsx      # Shopping Cart View[span_12](start_span)[span_12](end_span)
│   │       ├── checkout/
│   │       │   └── page.tsx      # Payment Checkout View[span_13](start_span)[span_13](end_span)
│   │       ├── orders/
│   │       │   └── page.tsx      # Order Tracking View[span_14](start_span)[span_14](end_span)
│   │       └── supplier/
│   │           └── page.tsx      # Supplier Management Area[span_15](start_span)[span_15](end_span)
│   ├── components/
│   │   ├── Benefits.tsx          # Landing page benefits section[span_16](start_span)[span_16](end_span)
│   │   ├── FAQ.tsx               # Landing page FAQ accordion[span_17](start_span)[span_17](end_span)
│   │   ├── FinalCTA.tsx          # Lead conversion form (shadcn/ui + zod)[span_18](start_span)[span_18](end_span)
│   │   ├── FloatingContact.tsx   # Persistent contact widget[span_19](start_span)[span_19](end_span)
│   │   ├── Footer.tsx            # Site footer[span_20](start_span)[span_20](end_span)
│   │   ├── Hero.tsx              # Main hero section[span_21](start_span)[span_21](end_span)
│   │   ├── Navbar.tsx            # Primary navigation bar[span_22](start_span)[span_22](end_span)
│   │   ├── SocialProof.tsx       # Trust markers section[span_23](start_span)[span_23](end_span)
│   │   ├── search/               # Search & Filtering Components
│   │   │   ├── SearchBar.tsx     # Location & general query input[span_24](start_span)[span_24](end_span)
│   │   │   ├── FilterDropdown.tsx# Property type, beds, options[span_25](start_span)[span_25](end_span)
│   │   │   ├── PriceRange.tsx    # Price range slider/inputs[span_26](start_span)[span_26](end_span)
│   │   │   ├── PropertyGrid.tsx  # Search results layout container[span_27](start_span)[span_27](end_span)
│   │   │   ├── PropertyCard.tsx  # Individual listing preview card[span_28](start_span)[span_28](end_span)
│   │   │   └── SearchResults.tsx # Results container + zero-result trigger logic[span_29](start_span)[span_29](end_span)
│   │   ├── concierge/            # 2-Week Concierge Service Components
│   │   │   ├── ConciergeModal.tsx# Triggered when search returns empty[span_30](start_span)[span_30](end_span)
│   │   │   ├── ConciergeOffer.tsx# Value proposition banner[span_31](start_span)[span_31](end_span)
│   │   │   └── ConciergeForm.tsx # Registration form with NDPR consent[span_32](start_span)[span_32](end_span)
│   │   ├── property/
│   │   │   └── PropertyDetail.tsx# Full detailed view component[span_33](start_span)[span_33](end_span)
│   │   ├── landlord/             # Landlord Pathway Components
│   │   │   ├── LandlordHero.tsx  # Landlord landing hero[span_34](start_span)[span_34](end_span)
│   │   │   ├── BenefitsGrid.tsx  # Value prop comparison matrix[span_35](start_span)[span_35](end_span)
│   │   │   ├── TrustSignals.tsx  # Verification & safety stats[span_36](start_span)[span_36](end_span)
│   │   │   ├── LandlordRegistrationForm.tsx # Owner intake filter form[span_37](start_span)[span_37](end_span)
│   │   │   ├── PropertyIntakeForm.tsx       # Multi-step intake wizard[span_38](start_span)[span_38](end_span)
│   │   │   ├── IntakeStep1.tsx   # Basic info step[span_39](start_span)[span_39](end_span)
│   │   │   ├── IntakeStep2.tsx   # Media & pricing step[span_40](start_span)[span_40](end_span)
│   │   │   ├── IntakeStep3.tsx   # Verification documents step[span_41](start_span)[span_41](end_span)
│   │   │   └── AppointmentBooking.tsx       # Custom internal booking calendar[span_42](start_span)[span_42](end_span)
│   │   ├── dashboard/
│   │   │   ├── LeadTable.tsx     # Agent view of leads and statuses[span_43](start_span)[span_43](end_span)
│   │   │   └── LeadDetail.tsx    # Expanded lead/intake file inspection[span_44](start_span)[span_44](end_span)
│   │   ├── builder/              # B2B E-commerce Components[span_45](start_span)[span_45](end_span)
│   │   └── ui/                   # Reusable UI primitives (shadcn/ui)[span_46](start_span)[span_46](end_span)
│   ├── lib/
│   │   ├── animations.ts         # GSAP ScrollTrigger helpers[span_47](start_span)[span_47](end_span)
│   │   ├── api-client.ts         # Axios/Fetch client wrapper for DRF Backend[span_48](start_span)[span_48](end_span)
│   │   └── validations/
│   │       ├── conciergeSchema.ts# Zod validation for Concierge form[span_49](start_span)[span_49](end_span)
│   │       └── searchSchema.ts   # Zod validation for search filters[span_50](start_span)[span_50](end_span)
│   ├── middleware.ts             # Route protection & subpath routing[span_51](start_span)[span_51](end_span)
│   └── __tests__/                # Frontend unit/integration test suites[span_52](start_span)[span_52](end_span)
│
└── backend/                      # Django REST Framework (Backend Monolith)[span_53](start_span)[span_53](end_span)
    ├── core/                     # Project Configuration & Settings
    │   ├── settings.py           # DB, installed apps, CORS, SLA rules[span_54](start_span)[span_54](end_span)
    │   ├── urls.py               # Main URL routing[span_55](start_span)[span_55](end_span)
    │   └── wsgi.py               # WSGI entrypoint for VPS deployment[span_56](start_span)[span_56](end_span)
    ├── apps/
    │   ├── crm/                  # Customer Relationship & Concierge Bounded Context
    │   │   ├── models.py         # ConciergeLead, ConsentLog, LeadScore models[span_57](start_span)[span_57](end_span)
    │   │   ├── serializers.py    # Serializers for API conversion[span_58](start_span)[span_58](end_span)
    │   │   ├── views.py          # API ViewSets (e.g., submit-concierge)[span_59](start_span)[span_59](end_span)
    │   │   ├── services.py       # LeadScoringService, SLAAlertService[span_60](start_span)[span_60](end_span)
    │   │   ├── tasks.py          # Background processing (2-hr SLA timers)[span_61](start_span)[span_61](end_span)
    │   │   └── urls.py           # /api/crm/ routing[span_62](start_span)[span_62](end_span)
    │   ├── properties/           # Property Listings Bounded Context
    │   │   ├── models.py         # Property, Media, Location models[span_63](start_span)[span_63](end_span)
    │   │   ├── serializers.py    # Property serialization[span_64](start_span)[span_64](end_span)
    │   │   ├── views.py          # Search views and detail endpoints[span_65](start_span)[span_65](end_span)
    │   │   ├── services.py       # SearchService logic[span_66](start_span)[span_66](end_span)
    │   │   └── urls.py           # /api/search/ & /api/properties/ routing[span_67](start_span)[span_67](end_span)
    │   ├── landlords/            # Landlord Onboarding Bounded Context
    │   │   ├── models.py         # LandlordProfile, PropertyIntake, Appointment[span_68](start_span)[span_68](end_span)
    │   │   ├── serializers.py    # Intake and booking serializers[span_69](start_span)[span_69](end_span)
    │   │   ├── views.py          # Owner intake & appointment endpoints[span_70](start_span)[span_70](end_span)
    │   │   ├── services.py       # BookingService logic[span_71](start_span)[span_71](end_span)
    │   │   └── urls.py           # /api/landlords/ routing[span_72](start_span)[span_72](end_span)
    │   ├── dashboard/            # Agent/Admin Portal Backend Context
    │   │   ├── views.py          # Internal dashboard data aggregated endpoints[span_73](start_span)[span_73](end_span)
    │   │   └── serializers.py    # Admin data formatters[span_74](start_span)[span_74](end_span)
    │   ├── compliance/           # NDPR Data Privacy & Governance Context[span_75](start_span)[span_75](end_span)
    │   │   ├── models.py         # Audit Log and Anonymization records[span_76](start_span)[span_76](end_span)
    │   │   ├── serializers.py    # Data Subject Rights serializers[span_77](start_span)[span_77](end_span)
    │   │   ├── views.py          # Data export & erasure API endpoints[span_78](start_span)[span_78](end_span)
    │   │   ├── services.py       # Retention & Anonymization handlers[span_79](start_span)[span_79](end_span)
    │   │   ├── management/
    │   │   │   └── commands/
    │   │   │       └── anonymize_leads.py # Cron/pg_cron job for inactive data[span_80](start_span)[span_80](end_span)
    │   │   └── urls.py           # /api/compliance/ routing[span_81](start_span)[span_81](end_span)
    │   └── ecommerce/            # Phase 3: Builder Pathway Context (Optional)[span_82](start_span)[span_82](end_span)
    │       ├── models.py         # Product, Category, Cart, Order, Supplier[span_83](start_span)[span_83](end_span)
    │       ├── serializers.py    # B2B E-commerce serializers[span_84](start_span)[span_84](end_span)
    │       ├── views.py          # Catalog & Order endpoints[span_85](start_span)[span_85](end_span)
    │       ├── services.py       # CartService, PaymentService, SupplierService[span_86](start_span)[span_86](end_span)
    │       ├── webhooks.py       # Paystack/Flutterwave webhook listeners[span_87](start_span)[span_87](end_span)
    │       └── urls.py           # /api/builder/ routing[span_88](start_span)[span_88](end_span)
    └── manage.py

---

## Session Notes

**Session Date:** 2026-07-27
**Context:** 
Verified and completed the entire frontend surface for the Buyer pathway (Units 1.2–1.5)[span_126](start_span)[span_126](end_span). Confirmed structure and implementation of `/search/page.tsx`[span_127](start_span)[span_127](end_span), `SearchBar.tsx`[span_128](start_span)[span_128](end_span), `FilterDropdown.tsx`[span_129](start_span)[span_129](end_span), `PriceRange.tsx`[span_130](start_span)[span_130](end_span), `PropertyGrid.tsx`[span_131](start_span)[span_131](end_span), `PropertyCard.tsx`[span_132](start_span)[span_132](end_span), `/property/[id]/page.tsx`[span_133](start_span)[span_133](end_span), `PropertyDetail.tsx`[span_134](start_span)[span_134](end_span), `SearchResults.tsx`[span_135](start_span)[span_135](end_span), `ConciergeModal.tsx`[span_136](start_span)[span_136](end_span), `ConciergeOffer.tsx`[span_137](start_span)[span_137](end_span), and `ConciergeForm.tsx`[span_138](start_span)[span_138](end_span). Validated zero-results conditional triggering and client-side Zod schemas (`searchSchema.ts` & `conciergeSchema.ts`)[span_139](start_span)[span_139](end_span). Updated overall Phase 1 completion to 5 / 12 units complete[span_140](start_span)[span_140](end_span).

**Next Session:** 
Begin Unit 1.6 (Backend API setup) and Unit 1.10 (Frontend-Backend integration)[span_141](start_span)[span_141](end_span).
