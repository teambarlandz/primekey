# Architecture Context

## Architecture Method

This project follows a **Modular Monolith with Domain-Driven Design (DDD)** approach.

- **Monolith**: All code runs in a single Django project, deployed on a single VPS. This ensures simplicity, low operational overhead, and ACID transactions across shared data.
- **Modular**: The monolith is split into **Bounded Contexts** — self-contained domains with clear boundaries. Each context has its own models, services, and business rules.
- **DDD**: Business logic is encapsulated in **Domain Services**, **Entities**, **Value Objects**, and **Repositories**. Views and controllers are kept thin.

### Bounded Contexts

| Context | Django Module(s) | Purpose | Status |
|---------|------------------|---------|--------|
| **Buyer Context** | `crm`, `properties` | Lead generation engine — captures and qualifies buyer/renter leads | **Phase 1 (Active)** |
| **Landlord Context** | `landlords`, `appointments` | Property management acquisition — gates, intakes, and books consultations | **Phase 2 (Stubbed until Phase 2)** |
| **Builder Context** | `ecommerce` | B2B materials marketplace — product catalog, cart, checkout, supplier monetization | **Phase 3 (Stubbed — Optional Extension)** |

**Implementation Note**: The `landlords` and `ecommerce` modules are stubbed (empty models/views) during Phase 1. The `ecommerce` module remains stubbed during Phase 2. Each module is activated when its corresponding phase begins.

---

## Stack

| Layer | Technology | Role |
|-------|------------|------|
| **Framework** | Next.js + TypeScript (App Router) | Full-stack framework for server-rendered pages, API routes, and optimized frontend performance/SEO |
| **UI** | Tailwind CSS + shadcn/ui | Utility-first styling and accessible, pre-built UI components |
| **Backend API** | Python + Django (REST Framework) | "Batteries-included" backend for ORM, admin panel, and custom CRM integration |
| **Database** | PostgreSQL + pg_cron extension | Primary relational database for all structured data; pg_cron for automated compliance jobs |
| **File Storage** | Local filesystem / S3-compatible object store | Storage for property images, landlord documents, and other large binary assets |
| **Authentication** | Custom JWT-based authentication | Self-hosted authentication using secure HTTP-only cookies, with role-based access control (RBAC) |
| **Payment Gateway** | Flutterwave / Paystack API | External integration for processing e-commerce transactions (Phase 3 only) |
| **Hosting** | Nigerian VPS provider (e.g., Fimgohost) | Self-hosted virtual private server with full control over the environment |

---

## System Boundaries

- **`app/` (Next.js)** — Owns the server-rendered frontend UI for all active phases. Routes are organized by Bounded Context:
  - `/search` — Buyer Context (Phase 1)
  - `/landlord` — Landlord Context (Phase 2)
  - `/builder` — Builder Context (Phase 3 — optional)
  - `/dashboard` — Agent/Admin dashboard (all phases)

- **`backend/` (Django)** — Owns all core business logic. Split into modular Django apps:
  - `crm/` — Buyer Context (Concierge leads, lead scoring, SLA alerts)
  - `properties/` — Shared property data (used by Buyer and Landlord contexts)
  - `landlords/` — Landlord Context (Registration, intake, appointments) — **stubbed until Phase 2**
  - `appointments/` — Shared appointment engine (used by Landlord and potentially Builder)
  - `ecommerce/` — Builder Context (Products, cart, orders, payments) — **stubbed until Phase 3**
  - `users/` — User accounts and authentication (shared across all contexts)
  - `compliance/` — NDPR compliance (consent logging, data export, erasure, retention)

- **`database/` (PostgreSQL)** — Owns the persistent storage of all application data, including relational integrity, indexes, and scheduled jobs for data retention. Acts as the single source of truth.

- **`storage/` (File System / Object Store)** — Owns the storage and retrieval of unstructured binary assets (property photos, landlord documents, etc.). Metadata references are stored in the database.

- **`auth/` (JWT + RBAC)** — Owns user identity, session management, and authorization rules for different roles (Admin, Agent, Landlord, Builder). Shared across all contexts.

---

## Storage Model

- **PostgreSQL Database**: All structured data lives here:
  - **Buyer Context**: `concierge_leads`, `lead_scores`, `properties`
  - **Landlord Context**: `landlord_profiles`, `property_listings`, `appointments`
  - **Builder Context**: `products`, `categories`, `carts`, `orders`, `order_items`, `suppliers` (Phase 3)
  - **Shared**: `users`, `consent_logs`, `audit_logs`

- **File/Object Storage**: All large binary content — property images, landlord-submitted property photos, legal documents, and any other non-tabular data — is stored in a separate file system or S3-compatible blob storage. The database stores only the file path or URL reference.

---

## Auth and Access Model

- **Authentication**: Users authenticate via a custom JWT-based system. Credentials are validated against the `users` table in PostgreSQL, and a secure HTTP-only cookie is issued upon successful login. Entirely self-hosted.

- **Authorization**: Role-based access control (RBAC) is enforced at both the UI and API levels. Predefined roles include:
  - **Admin**: Full system access, including user management and compliance tools.
  - **Agent**: Can view and manage assigned leads (concierge and landlord), update lead statuses, and view their own dashboard.
  - **Landlord**: Can access their own property intake forms and appointment history.
  - **Builder**: Can access the B2B e-commerce portal and view their order history (Phase 3).
  - **Guest**: Can search properties and submit concierge forms (no login required).

- **Ownership Model**: Every lead (concierge request, landlord opportunity, builder order) is associated with a creator (`created_by`) and, where applicable, a primary contact. Agents are assigned to leads for follow-up. Mutations are restricted to the owner or assigned agent, except for admin override.

- **API Access**: All API endpoints (except public search and intent gateway) require a valid JWT. Role-based middleware verifies permissions before executing any mutation.

---

## Invariants

1. **No External CRM Dependency**: The system must never rely on third-party SaaS CRMs (HubSpot, Salesforce) for lead storage or routing. All lead management logic and data must reside in the self-hosted PostgreSQL database.

2. **Consent Before Data Storage**: The system must never persist a user's Personally Identifiable Information (PII) without first obtaining and logging explicit, verifiable consent. The `consent_logs` table must contain a valid, timestamped, policy-versioned record for every lead.

3. **2-Hour SLA for Concierge Leads**: Any lead submitted via the "2-Week Concierge Search" workflow must have its `priority` set to `'HIGH'` and must immediately trigger an internal notification (dashboard alert, email, or SMS) to the assigned agent. The system must track the time elapsed since creation to enforce the 2-hour SLA.

4. **Search-First, Not Found Fallback**: The buyer/renter search functionality must always return a successful response (empty array on no results) rather than an error. An empty result set is the explicit trigger for the conditional "Concierge Offer" modal — the system must never show a generic "no results found" page that does not offer the concierge service.

5. **Atomic Lead Creation**: The creation of a new concierge lead must be an atomic database transaction: either both the `concierge_leads` record and the corresponding `consent_logs` record are committed, or neither is. Partial persistence is prohibited.

6. **Automated Data Retention**: PostgreSQL `pg_cron` must be used to schedule daily jobs that anonymize or delete inactive leads exceeding the defined retention period (e.g., leads with `status` not 'converted' and `updated_at` > 6 months). No manual intervention is allowed for routine data purging.

7. **No Stored Procedures or Triggers for Business Logic**: All business logic (lead scoring, SLA enforcement, conditional routing) must reside in the application code (Django), not in database triggers or stored procedures. The database is for storage and integrity only.

8. **Bounded Context Isolation**: Models from one Bounded Context must not be imported directly into another. Cross-context communication must occur via:
   - The Django ORM with clear interfaces (e.g., through a shared `core` app)
   - Domain Events (for async workflows)
   - API calls (if contexts are later extracted into microservices)

---

## Key Data Models (Summary)

### Buyer Context

| Model | Purpose |
|-------|---------|
| `ConciergeLead` | Stores concierge request data (name, email, phone, budget, specs, status, priority) |
| `ConsentLog` | Immutable audit trail of user consent (timestamp, policy version, IP address) |
| `LeadScore` | Dynamic score (0-100) for lead prioritization, with scoring breakdown |
| `Property` | Property listings (title, description, location, price, type, bedrooms, status, images) |

### Landlord Context (Phase 2)

| Model | Purpose |
|-------|---------|
| `LandlordProfile` | Landlord account details (name, email, phone, company) |
| `PropertyListing` | Detailed property data submitted by landlords (address, size, condition, rent, availability, images) |
| `Appointment` | Consultation bookings (landlord, agent, datetime, status) |

### Builder Context (Phase 3 — Optional)

| Model | Purpose |
|-------|---------|
| `Product` | Building material details (name, description, category, price, stock, images) |
| `Category` | Product categorization (Cement, Steel, Roofing, Plumbing, etc.) |
| `Cart` | Shopping cart stored per user session |
| `Order` | Completed order (user, items, total, status, shipping address, tracking) |
| `OrderItem` | Individual line items within an order (product, quantity, price) |
| `Supplier` | Supplier profile (name, contact, products, listing fees) |

---

## Communication Between Bounded Contexts

| Contexts | Communication Method | Purpose |
|----------|----------------------|---------|
| **Buyer ↔ Landlord** | Shared `properties` table | Landlord properties feed into Buyer search results |
| **Buyer ↔ Shared** | `users`, `consent_logs` | Lead data linked to user accounts and consent records |
| **Landlord ↔ Shared** | `users`, `appointments` | Landlord accounts and appointment scheduling |
| **Builder ↔ Shared** | `users`, `orders` | Builder accounts and order history |

**Rule**: No direct imports between Bounded Contexts. All cross-context data access must go through a shared `core` app or use Domain Events.

---

## Supporting Architecture (Phase-Agnostic)

- **Headless Architecture**: Next.js frontend decoupled from Django backend. Communication via REST APIs.
- **BFF (Backend for Frontend)**: Next.js serves the UI and proxies API calls to Django, handling session management and simple orchestration.
- **Self-Hosted**: All services run on a single VPS inside Docker containers. No reliance on big cloud providers.
- **Database Isolation**: PostgreSQL binds to localhost only — never exposed to the public internet.
- **Automated Backups**: Daily `pg_dump` to remote storage with 30-day retention.
- **Monitoring**: Health check endpoint (`/api/health`) and uptime monitoring.

---

## How This Architecture Supports Phased Implementation

| Phase | What Gets Activated | Architecture Impact |
|-------|---------------------|---------------------|
| **Phase 1** | Buyer Context (`crm`, `properties`) | Landlord and Builder modules exist but are **stubbed** (empty models/views). No business logic runs in them. |
| **Phase 2** | Landlord Context (`landlords`, `appointments`) | Landlord module is **activated**. Builder remains stubbed. |
| **Phase 3** | Builder Context (`ecommerce`) | Builder module is **activated**. The architecture is unchanged — it simply adds functionality to an existing module. |

This approach ensures that the architecture remains **stable and consistent** throughout the project lifecycle, while allowing incremental implementation.