# Nigerian Real Estate Platform

## Overview

This application is a **self-hosted digital sales engine** for a Nigerian real estate company. It is designed to acquire, qualify, and convert high-intent leads across multiple user segments within a single, unified platform. The company owns and controls all data, business logic, and infrastructure — with no reliance on external SaaS providers like HubSpot, Salesforce, or Shopify.

The platform operates as a **Modular Monolith using Domain-Driven Design (DDD) principles**, where each user pathway is a **Bounded Context** — a self-contained domain with its own models, services, and business rules, while sharing a common database, authentication layer, and deployment infrastructure.

The core project consists of two Bounded Contexts that complete a closed-loop ecosystem:

| Bounded Context | Purpose | Phase |
|-----------------|---------|-------|
| **Buyer Context** | Generate demand — convert property seekers into qualified leads | Phase 1 |
| **Landlord Context** | Secure supply — acquire properties from owners for management/sale | Phase 2 |

An optional third Bounded Context is planned as a future extension, to be built only if Phases 1 & 2 are successful:

| Bounded Context | Purpose | Phase |
|-----------------|---------|-------|
| **Builder Context** | Full-blown B2B e-commerce marketplace for building materials | Phase 3 (Optional) |

The core strategic mechanism is the **"2-Week Concierge Waitlist"**, which transforms the frustration of unavailable listings into a premium lead-generation opportunity. The entire system is architected with rigorous compliance to the Nigeria Data Protection Act (NDPA) 2023 embedded by design.

---

## Architecture Approach

This project is built as a **Modular Monolith using Domain-Driven Design (DDD) principles**.

- **Monolith**: All code runs in a single Django project, deployed on a single VPS. This ensures simplicity, low operational overhead, and ACID transactions across shared data.
- **Modular**: The monolith is split into **Bounded Contexts** — self-contained domains with clear boundaries. Each context has its own models, services, and business rules.
- **DDD**: Business logic is encapsulated in **Domain Services**, **Entities**, **Value Objects**, and **Repositories**. Views and controllers are kept thin.

### Bounded Contexts

| Context | Django Module(s) | Purpose | Phase |
|---------|------------------|---------|-------|
| **Buyer Context** | `crm`, `properties` | Lead generation engine — captures and qualifies buyer/renter leads | Phase 1 |
| **Landlord Context** | `landlords`, `appointments` | Property management acquisition — gates, intakes, and books consultations | Phase 2 |
| **Builder Context** | `ecommerce` (stubbed) | B2B materials marketplace — built only as an optional extension | Phase 3 |

---

## Goals

1. **Convert Intent into Action**: Capture high-intent buyer/renter leads by converting "not found" search results into registrations for the premium "2-Week Concierge Search" service, achieving a conversion rate > 15%.

2. **Secure a Qualified Supply Pipeline**: Establish a gated, consultative onboarding flow for landlords and owners that filters casual inquiries and schedules qualified appointments, generating a reliable inventory pipeline for the concierge service.

3. **Build a Scalable, Self-Contained Asset**: Develop a fully owned, self-hosted technology stack that eliminates recurring SaaS fees, provides complete data ownership, and serves as a durable competitive advantage in the Nigerian PropTech market.

4. **Achieve and Demonstrate Regulatory Compliance**: Build a system that is fully compliant with the Nigeria Data Protection Act (NDPA) 2023 from day one, with verifiable consent mechanisms, data subject rights fulfillment (access, erasure), and automated data retention enforcement.

5. **Optional: Establish a Profitable B2B Vertical** (Phase 3): Launch a dedicated e-commerce portal for builders and developers to purchase building materials, creating a new, diversified revenue stream through a supplier-charge monetization model.

---

## Core User Flow (Phases 1 & 2)

1. **Intent Gateway**: A visitor arrives on the homepage and selects their primary intent: **"Buy/Rent a Property"** or **"I am a Landlord/Owner."**

2. **Buyer/Renter Journey** (Phase 1):
   - User applies search filters (location, price, bedrooms, etc.) against the internal `properties` database.
   - **IF** matching properties are found, the user views listings, clicks for details, and can contact an agent (generating a standard lead).
   - **IF** no properties match the search criteria, the system conditionally triggers the **"2-Week Concierge Search"** offer modal instead of a dead-end "no results" page.
   - User registers for the concierge service by submitting a detailed form (name, contact, target location, budget, property specs) with **explicit NDPR consent**.
   - Submission creates a **HIGH priority** lead in the custom CRM, triggers an internal SLA alert for agent follow-up within **2 hours**, and logs a timestamped consent record.

3. **Landlord/Owner Journey** (Phase 2):
   - User is directed to a dedicated landing page emphasizing the value proposition of outsourcing property management (stress-free management, guaranteed rent, expert valuation).
   - User registers interest via a **gated form** (no free uploads allowed) and completes a detailed property intake form.
   - Upon completion, the system integrates with an **automated appointment booking engine**, allowing the user to schedule a consultation with an agent.
   - The landlord's details and property information are created as a new **Opportunity** record in the CRM, tagged for the landlord acquisition team.

---

## Features

### Phase 1: Buyer/Renter Pathway (Lead Generation Engine)

- **Intent Gateway**: Instant segmentation of users into their specific journey path upon landing.
- **Dynamic Property Search**: Advanced filtering system with real-time querying against the PostgreSQL `properties` table.
- **Conditional "Not Found" Fallback**: Core strategic logic that intercepts empty search results to present the premium "2-Week Concierge Search" offer.
- **2-Week Concierge Waitlist**: White-glove service registration form capturing high-intent lead data (budget, location, specifications) with mandatory consent.
- **Lead Scoring & SLA Enforcement**: Automated lead scoring on submission and a hard-coded 2-hour Service Level Agreement trigger for immediate agent notification.
- **NDPR Compliance**: Verifiable consent capture, audit trail logging, and data subject rights fulfillment (access, erasure).
- **Agent Dashboard**: Custom admin view for agents to manage and prioritize concierge leads.

### Phase 2: Landlord/Owner Pathway (Supply-Side Acquisition)

- **Gated Value Proposition Landing Page**: High-conversion landing page that filters casual visitors and communicates key benefits (e.g., "Guaranteed Rent Collection," "Stress-Free Management").
- **Structured Property Intake Form**: Detailed, multi-step form to capture structured property data for efficient qualification and CRM population.
- **Automated Appointment Booking**: Integration with an internal calendar engine (or Calendly Enterprise) to schedule consultations without back-and-forth emails.
- **Agent Dashboard**: Custom admin view for agents to view and manage scheduled appointments and new landlord leads.

### Phase 3: Builder/Developer Pathway (Optional Extension)

- **Dedicated Subdomain Portal**: Separate digital storefront for a distinct B2B user experience.
- **Product Catalog & Inventory Management**: Custom backend system to manage building materials, pricing, and stock levels.
- **Secure Checkout**: PCI-DSS compliant payment processing via a Nigerian gateway.
- **Order Management**: Automated order confirmation, tracking, and inventory deduction.
- **Supplier-Charge Monetization**: Revenue model that charges suppliers (listing fees, transaction fees), not buyers.

### Administration & Compliance (Self-Hosted CRM)

- **Custom PostgreSQL Database Schema**: Self-hosted tables for `concierge_leads`, `landlord_properties`, `orders`, `users`, and `consent_logs`.
- **Verifiable Consent Management**: Mandatory, unchecked consent checkboxes on all forms, with immutable audit trails stored in `consent_logs` (timestamp, policy version, IP address).
- **Data Subject Rights Fulfillment**: Dedicated backend endpoints for Right of Access (`/api/user/data-export`) and Right to Erasure (`/api/admin/user/hard-delete/{id}`).
- **Automated Data Retention**: PostgreSQL `pg_cron` scheduled jobs to automatically anonymize or delete stale/inactive leads after a defined period (e.g., 6 months).

---

## Scope

### In Scope (Core Project — Phases 1 & 2)

- **Buyer/Renter Pathway** (Phase 1): Intent Gateway, dynamic property search, "Not Found" conditional logic, "2-Week Concierge" registration with SLA enforcement, lead scoring, agent dashboard.
- **Landlord/Owner Pathway** (Phase 2): Gated landing page, registration, property intake form, automated appointment booking, landlord lead management.
- **Self-hosted PostgreSQL database** with custom CRM tables (`concierge_leads`, `landlord_properties`, `consent_logs`, `lead_scores`).
- **NDPR compliance**: Consent logging, data export endpoints, data erasure endpoints, automated data retention via `pg_cron`.
- **Unified frontend** with Intent Gateway for both pathways.
- **Agent dashboard** for managing leads from both Buyer and Landlord contexts.
- **Self-hosted infrastructure**: Docker containerization, Nginx reverse proxy, SSL, automated backups, monitoring.

### Out of Scope (Core Project)

- **Builder/Developer e-commerce portal** (see Optional Extension below).
- Mobile applications (iOS/Android) in the initial launch phase.
- AI-powered recommendation engines or predictive analytics in the MVP phase.
- Complex third-party integrations beyond payment gateways and essential notification services.

### Optional Extension (Phase 3)

- **Builder/Developer Pathway**: Full-blown B2B e-commerce website for building materials, including product catalog, inventory management, shopping cart, secure checkout, order management, and supplier-charge monetization.

- **Trigger to Start**: Success metrics from Phases 1 & 2 are achieved:
  - > 15% concierge conversion rate
  - Steady flow of qualified leads (e.g., > 50 concierge leads per month)
  - Positive unit economics (LTV:CAC > 3:1) for both buyer and landlord segments
  - At least 3-6 months of live operations with validated business model

- **Decision Point**: Re-evaluate after 3-6 months of live operations. Build Phase 3 only if the core project demonstrates sustainable profitability and market fit.

---

## Success Criteria

1. **Concierge Lead Conversion Rate**: At least 15% of users who encounter a "no results" search successfully register for the "2-Week Concierge Search" service.

2. **SLA Adherence**: 95% of concierge leads trigger an internal alert and are acknowledged by an agent within 2 hours of submission.

3. **Landlord Qualification Rate**: 70% of completed landlord intake forms successfully convert into a scheduled consultation appointment.

4. **NDPR Audit Readiness**: A mock regulatory audit of the system confirms that consent logs are immutable, complete (timestamp, policy version), and that data export and hard-delete endpoints function as specified.

5. **Performance Benchmark**: The core search and concierge submission APIs maintain a p95 latency of under 200ms under expected load.

6. **Agent Productivity**: Agents report a measurable increase in lead response time and conversion efficiency using the dashboard.

---

## Technology Stack (Summary)

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js + TypeScript (App Router) |
| **UI** | Tailwind CSS + shadcn/ui |
| **Backend API** | Python + Django (REST Framework) |
| **Database** | PostgreSQL + pg_cron extension |
| **File Storage** | Local filesystem / S3-compatible object store |
| **Authentication** | Custom JWT-based authentication |
| **Payment Gateway** | Flutterwave / Paystack (Phase 3 only) |
| **Hosting** | Nigerian VPS provider (e.g., Fimgohost) |

---

## Key Invariants

1. **No External CRM Dependency**: The system must never rely on third-party SaaS CRMs (HubSpot, Salesforce) for lead storage or routing.

2. **Consent Before Data Storage**: The system must never persist a user's PII without first obtaining and logging explicit, verifiable consent.

3. **2-Hour SLA for Concierge Leads**: Any lead submitted via the "2-Week Concierge Search" must have `priority='HIGH'` and trigger an internal notification immediately.

4. **Search-First, Not Found Fallback**: An empty search result is the explicit trigger for the "Concierge Offer" modal — the system must never show a generic "no results found" page.

5. **Atomic Lead Creation**: The creation of a new concierge lead and its corresponding `consent_logs` record must be an atomic database transaction.