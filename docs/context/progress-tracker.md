# Progress Tracker

Update this file after every meaningful implementation change. This document serves as the project's memory, enabling smooth resumption of work between sessions and providing a clear audit trail of decisions and progress.

---

## Project Scope

### Core Project (Phases 1 & 2)

- **Phase 1**: Buyer/Renter Pathway — Lead generation engine with "2-Week Concierge" service.
- **Phase 2**: Landlord/Owner Pathway — Gated registration, property intake, appointment booking.

### Optional Extension (Phase 3)

- **Builder/Developer Pathway** — Full-blown B2B e-commerce marketplace for building materials.
- **Trigger**: Achieve success metrics from Phases 1 & 2 (e.g., > 15% concierge conversion rate, steady lead flow, positive LTV:CAC ratio).
- **Decision Point**: Re-evaluate after 3-6 months of live operations.

---

## Master Task List (Start to Finish)

### Phase 1: Buyer/Renter Pathway (Core)

| Unit | Name | Status | Description | Files | Est. Time |
|------|------|--------|-------------|-------|-----------|
| 1.1 | Intent Gateway UI | ⬜ Not Started | Build the landing page with two clear options: "Buy/Rent" and "Landlord/Owner." Builder is hidden. | `app/page.tsx`, `components/gateway/IntentCard.tsx`, `components/gateway/GatewayGrid.tsx` | 1-2 hrs |
| 1.2 | Dynamic Property Search (UI & Filters) | ⬜ Not Started | Build the search interface with filters (location, price range, property type, bedrooms). UI only. | `app/search/page.tsx`, `components/search/SearchBar.tsx`, `components/search/FilterDropdown.tsx`, `components/search/PriceRange.tsx` | 2-3 hrs |
| 1.3 | Property Results Grid & Detail View | ⬜ Not Started | Display search results as a grid of property cards. Clicking a card opens a property detail page. | `components/search/PropertyGrid.tsx`, `components/search/PropertyCard.tsx`, `app/property/[id]/page.tsx`, `components/property/PropertyDetail.tsx` | 2-3 hrs |
| 1.4 | "Not Found" → Concierge Conditional Logic | ⬜ Not Started | Implement the critical conditional trigger. When search returns zero results, display the Concierge modal instead of "No results." | `components/search/SearchResults.tsx`, `components/concierge/ConciergeModal.tsx`, `components/concierge/ConciergeOffer.tsx` | 2-3 hrs |
| 1.5 | Concierge Registration Form (Frontend) | ⬜ Not Started | Build the registration form inside the concierge modal. Collects all required data with NDPR consent. | `components/concierge/ConciergeForm.tsx`, `components/concierge/ConciergeModal.tsx`, `lib/validations/conciergeSchema.ts` | 2-3 hrs |
| 1.6 | Backend API — POST /api/submit-concierge | ⬜ Not Started | Build the Django backend endpoint that receives the concierge form data, validates it, creates a lead, and logs consent. | `backend/apps/crm/views.py`, `backend/apps/crm/serializers.py`, `backend/apps/crm/models.py`, `backend/apps/crm/services.py`, `backend/apps/crm/urls.py` | 2-3 hrs |
| 1.7 | Database Schema & Migrations | ⬜ Not Started | Create PostgreSQL tables for `concierge_leads`, `consent_logs`, `lead_scores`, and `properties`. | `backend/apps/crm/models.py`, `backend/apps/properties/models.py`, `backend/apps/crm/migrations/`, `backend/apps/properties/migrations/` | 2-3 hrs |
| 1.8 | Lead Scoring & SLA Alerting (Backend) | ⬜ Not Started | Implement lead scoring logic and the 2-hour SLA alert system. | `backend/apps/crm/services.py` (LeadScoringService, SLAAlertService), `backend/apps/crm/tasks.py`, `backend/apps/crm/models.py`, `backend/apps/dashboard/views.py` | 3-4 hrs |
| 1.9 | Search API — GET /api/search | ⬜ Not Started | Build the backend search endpoint that queries the `properties` table and returns matching results. | `backend/apps/properties/views.py`, `backend/apps/properties/serializers.py`, `backend/apps/properties/services.py` (SearchService), `backend/apps/properties/urls.py` | 2-3 hrs |
| 1.10 | Frontend-Backend Integration (Search + Concierge) | ⬜ Not Started | Connect the frontend search and concierge form to the backend APIs. | `app/search/page.tsx`, `lib/api-client.ts`, `components/search/SearchResults.tsx`, `components/concierge/ConciergeForm.tsx` | 2-3 hrs |
| 1.11 | NDPR Compliance — Data Export & Erasure Endpoints | ⬜ Not Started | Build the backend endpoints for data subject rights (Right of Access, Right to Erasure) and scheduled anonymization. | `backend/apps/compliance/views.py`, `backend/apps/compliance/serializers.py`, `backend/apps/compliance/services.py`, `backend/apps/compliance/management/commands/anonymize_leads.py`, `backend/apps/compliance/urls.py` | 3-4 hrs |
| 1.12 | QA & Testing (Buyer Pathway) | ⬜ Not Started | Write and run tests for all Buyer pathway functionality. | `backend/apps/*/tests.py`, `__tests__/`, `cypress/e2e/` | 3-4 hrs |

### Phase 1 Complete ✅

---

### Phase 2: Landlord/Owner Pathway (Core)

| Unit | Name | Status | Description | Files | Est. Time |
|------|------|--------|-------------|-------|-----------|
| 2.1 | Landlord Landing Page (Value Proposition) | ⬜ Not Started | Build the dedicated landing page for landlords/owners, emphasizing the value of outsourcing property management. | `app/landlord/page.tsx`, `components/landlord/LandlordHero.tsx`, `components/landlord/BenefitsGrid.tsx`, `components/landlord/TrustSignals.tsx` | 1-2 hrs |
| 2.2 | Gated Registration Form (Landlord) | ⬜ Not Started | Build the registration form that filters casual inquiries and collects owner details. | `components/landlord/LandlordRegistrationForm.tsx`, `backend/apps/landlords/models.py`, `backend/apps/landlords/views.py`, `backend/apps/landlords/serializers.py` | 2 hrs |
| 2.3 | Property Intake Form (Detailed) | ⬜ Not Started | Build the multi-step property intake form that captures all necessary details. | `components/landlord/PropertyIntakeForm.tsx`, `components/landlord/IntakeStep1.tsx`, `components/landlord/IntakeStep2.tsx`, `components/landlord/IntakeStep3.tsx`, `backend/apps/landlords/models.py`, `backend/apps/landlords/views.py`, `backend/apps/landlords/serializers.py` | 3 hrs |
| 2.4 | Automated Appointment Booking Engine | ⬜ Not Started | Build the system that allows landlords to book consultations with agents. | `components/landlord/AppointmentBooking.tsx`, `backend/apps/landlords/models.py` (Appointment), `backend/apps/landlords/services.py` (BookingService), `backend/apps/landlords/views.py` | 3 hrs |
| 2.5 | Backend APIs for Landlord Pathway | ⬜ Not Started | Build all backend endpoints for landlord registration, property intake, and appointment booking. | `backend/apps/landlords/views.py`, `backend/apps/landlords/serializers.py`, `backend/apps/landlords/services.py`, `backend/apps/landlords/urls.py` | 3-4 hrs |
| 2.6 | Agent Dashboard (Landlord Leads) | ⬜ Not Started | Build the agent dashboard for viewing and managing landlord leads. | `app/dashboard/agent/page.tsx`, `components/dashboard/LeadTable.tsx`, `components/dashboard/LeadDetail.tsx`, `backend/apps/dashboard/views.py`, `backend/apps/dashboard/serializers.py` | 2-3 hrs |
| 2.7 | Frontend-Backend Integration (Landlord) | ⬜ Not Started | Connect all landlord frontend components to their backend APIs. | `components/landlord/LandlordRegistrationForm.tsx`, `components/landlord/PropertyIntakeForm.tsx`, `components/landlord/AppointmentBooking.tsx`, `lib/api-client.ts`, `app/dashboard/agent/page.tsx` | 2-3 hrs |
| 2.8 | QA & Testing (Landlord Pathway) | ⬜ Not Started | Write and run tests for all Landlord pathway functionality. | `backend/apps/landlords/tests.py`, `__tests__/landlord/`, `cypress/e2e/landlord/` | 3-4 hrs |

### Phase 2 Complete ✅ — Core Project Done

---

### Phase 3: Builder/Developer Pathway (Optional Extension)

**Trigger**: Only begin if Phases 1 & 2 are live and profitable.

| Unit | Name | Status | Description | Files | Est. Time |
|------|------|--------|-------------|-------|-----------|
| 3.1 | Builder Portal (Subdomain Setup) | ⬜ Not Started | Set up a dedicated subdomain (e.g., `shop.yourcompany.com`) with a separate frontend application or route. | `app/builder/page.tsx`, `middleware.ts`, DNS configuration | 1 hr |
| 3.2 | Product Catalog (Backend) | ⬜ Not Started | Build the Django models and APIs for the B2B product catalog. | `backend/apps/ecommerce/models.py` (Product, Category), `backend/apps/ecommerce/serializers.py`, `backend/apps/ecommerce/views.py`, `backend/apps/ecommerce/urls.py` | 2-3 hrs |
| 3.3 | Shopping Cart & Checkout (Backend) | ⬜ Not Started | Build the cart management and checkout APIs. | `backend/apps/ecommerce/models.py` (Cart, Order, OrderItem), `backend/apps/ecommerce/services.py` (CartService, CheckoutService), `backend/apps/ecommerce/views.py`, `backend/apps/ecommerce/serializers.py` | 3-4 hrs |
| 3.4 | Payment Gateway Integration | ⬜ Not Started | Integrate with a Nigerian payment gateway (Flutterwave or Paystack). | `backend/apps/ecommerce/services.py` (PaymentService), `backend/apps/ecommerce/views.py`, `backend/apps/ecommerce/webhooks.py`, `.env` | 3-4 hrs |
| 3.5 | Builder Frontend (Catalog, Cart, Checkout) | ⬜ Not Started | Build the frontend for the B2B e-commerce portal. | `app/builder/products/page.tsx`, `app/builder/product/[id]/page.tsx`, `app/builder/cart/page.tsx`, `app/builder/checkout/page.tsx`, `app/builder/orders/page.tsx`, `components/builder/` | 3-4 hrs |
| 3.6 | Supplier-Charge Monetization | ⬜ Not Started | Implement the B2B monetization model (charge suppliers, not buyers). | `backend/apps/ecommerce/models.py` (Supplier), `backend/apps/ecommerce/services.py` (SupplierService, AnalyticsService), `app/builder/supplier/`, `app/admin/analytics/` | 3-4 hrs |
| 3.7 | QA & Testing (Builder Pathway) | ⬜ Not Started | Write and run tests for all Builder pathway functionality. | `backend/apps/ecommerce/tests.py`, `__tests__/builder/`, `cypress/e2e/builder/` | 3-4 hrs |

### Phase 3 Complete ✅

---

## Current Phase

- **Phase**: Phase 0 — Discovery & Planning — **Complete**.
- **Next Phase**: Phase 1 — Buyer/Renter Pathway.
- **Status**: Ready to begin implementation.

---

## Current Goal

- Complete **Unit 1.1: Intent Gateway UI**.

---

## Completed

- None yet (Phase 0 artifacts are complete, but no development units have been started).

---

## In Progress

- None yet.

---

## Next Up

- **Unit 1.1: Intent Gateway UI**
  - Build the landing page with two clear options: "Buy/Rent" and "Landlord/Owner."
  - Builder is hidden (Phase 3 optional).
  - Files: `app/page.tsx`, `components/gateway/IntentCard.tsx`, `components/gateway/GatewayGrid.tsx`.

---

## Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Frontend framework: Next.js with App Router (recommended) or plain React SPA? | Open |
| 2 | Hosting provider: Which Nigerian VPS provider (e.g., Fimgohost, SmartWeb)? | Open |
| 3 | Payment gateway: Flutterwave vs. Paystack (needed for Phase 3) | Open |
| 4 | Appointment booking: Build custom booking engine or integrate with Calendly Enterprise? | Open |
| 5 | Lead scoring algorithm: What specific weighting rules should be applied? | Open |
| 6 | Data retention period: 6 months or 12 months for inactive leads? | Open |
| 7 | Agent notification: Email, SMS (Twilio/Africastalking), or both? | Open |
| 8 | Builder portal identity: Subdomain (`shop.yourcompany.com`) or subdirectory (`yourcompany.com/builder`)? | Open |

---

## Architecture Decisions

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | Use PostgreSQL as the primary database with `pg_cron` for automated data retention. | PostgreSQL is robust, scalable, and supports the structured data model required. `pg_cron` enables automated compliance jobs without external schedulers. | 2026-07-10 |
| 2 | Use Python/Django for the backend with Django REST Framework. | Django's "batteries-included" approach provides ORM, admin panel, authentication, and migrations out of the box, reducing development time for a complex, custom system. | 2026-07-10 |
| 3 | Use Next.js for the frontend with Tailwind CSS and shadcn/ui. | Next.js provides server-side rendering for SEO and performance, while shadcn/ui accelerates UI development with accessible, customizable components. | 2026-07-10 |
| 4 | Build a self-hosted custom CRM in PostgreSQL, not using HubSpot/Salesforce. | Complete data ownership, no recurring SaaS fees, full control over data model, and compliance with NDPR (data residency, audit trails). | 2026-07-10 |
| 5 | Implement NDPR compliance by design with `consent_logs` table and dedicated data subject rights endpoints. | Proactive compliance reduces legal risk and builds user trust. Embedding compliance in the database schema ensures auditability. | 2026-07-10 |
| 6 | Adopt Modular Monolith with Domain-Driven Design (DDD) architecture. | Monolith simplifies deployment on a single VPS; modularity isolates Bounded Contexts (Buyer, Landlord, Builder); DDD manages complex business logic (concierge, SLA, scoring) without muddying the codebase. | 2026-07-10 |
| 7 | Phase 3 (Builder/Developer) is an optional extension, not part of the core project. | The Builder pathway is a separate B2B venture; building it only after Phases 1 & 2 are profitable de-risks the project and conserves capital. | 2026-07-10 |

---

## Session Notes

- **Session Date**: 2026-07-10
- **Context**: All context files (`project-overview.md`, `architecture.md`, `code-standards.md`, `ui-context.md`, `ai-workflow-rules.md`, `progress-tracker.md`, `deployment-ops.md`) have been created and aligned with the Modular Monolith + DDD architecture. The project is now ready for Phase 1 implementation.
- **Next Session**: Begin Unit 1.1 — Intent Gateway UI.
- **Before Starting**:
  - Confirm the frontend framework (Next.js vs. plain React).
  - Ensure the development environment is set up (Next.js project, Django project, PostgreSQL locally).
  - Set up Git repository.
  - Install dependencies.
- **Stakeholders**: Product Owner (you), Backend Lead, Frontend Lead, QA Engineer, Legal/Compliance (for NDPR sign-off).
- **Handoff Protocol**: Phase 0 artifacts (PRD, ERD, NDPR Compliance Spec) are complete and signed off. Ready for Phase 1 handoff meeting before development begins.

---

## Glossary

| Term | Definition |
|------|------------|
| **Intent Gateway** | The initial screen on the homepage where visitors select their user pathway (Buy/Rent, Landlord/Owner, Builder — hidden for now). |
| **Bounded Context** | A self-contained domain within the modular monolith (e.g., Buyer Context, Landlord Context, Builder Context). Each has its own models, services, and business rules. |
| **2-Week Concierge Search** | A premium service offered to buyers/renters when a search yields no results. The user registers their property requirements, and an agent personally sources a property within 2 weeks. |
| **NDPR / NDPA** | Nigeria Data Protection Regulation / Nigeria Data Protection Act 2023. The primary legal framework for data protection in Nigeria. |
| **SLA** | Service Level Agreement. For this project, a 2-hour response time for concierge leads. |
| **DDD** | Domain-Driven Design. An architectural approach that models complex business domains using tactical patterns like Entities, Value Objects, Aggregates, Repositories, and Domain Services. |
| **Module Stubbing** | An empty Django module (models/views exist but no business logic) that is a placeholder for a future phase. The `landlords` module is stubbed in Phase 1; the `ecommerce` module is stubbed in Phases 1-2. |
| **RBAC** | Role-Based Access Control. Defines permissions for Admin, Agent, Landlord, and Builder roles. |
| **ERD** | Entity-Relationship Diagram. Visual representation of the database schema. |
| **PRD** | Product Requirements Document. The authoritative specification for the project (contained in the PDFs). |

---

## Summary of Phases and Units

| Phase | Units | Total Est. Time |
|-------|-------|-----------------|
| **Phase 1** (Buyer) | 12 | ~28 hours |
| **Phase 2** (Landlord) | 8 | ~20 hours |
| **Phase 3** (Builder — Optional) | 7 | ~21 hours |
| **Total (Core)** | 20 | ~48 hours |
| **Total (All)** | 27 | ~69 hours |