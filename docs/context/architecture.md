# Architecture Context: Primekey Homes and Properties Ltd.

## Architecture Method
This project follows a Modular Monolith with Domain-Driven Design (DDD) approach.

- **Monolith:** All code runs in a single Django project, deployed on a single VPS. This ensures simplicity, low operational overhead, and ACID transactions across shared data.
- **Modular:** The monolith is split into Bounded Contexts — self-contained domains with clear boundaries. Each context has its own models, services, and business rules.
- **DDD:** Business logic is encapsulated in Domain Services, Entities, Value Objects, and Repositories. Views and controllers are kept thin.

## Bounded Contexts

| Context | Django Module(s) | Purpose | Status |
| --- | --- | --- | --- |
| Buyer Context | `crm`, `properties` | Lead generation engine — captures and qualifies buyer/renter leads | Phase 1 (Active) |
| Landlord Context | `landlords`, `appointments` | Property management acquisition — gates, intakes, and books consultations | Phase 2 (Stubbed until Phase 2) |
| Builder Context | `ecommerce` | B2B materials marketplace — product catalog, cart, checkout, supplier monetization | Phase 3 (Stubbed — Optional Extension) |

*Implementation Note:* The `landlords` and `ecommerce` modules are stubbed (empty models/views) during Phase 1. The `ecommerce` module remains stubbed during Phase 2. Each module is activated when its corresponding phase begins.

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js + TypeScript (App Router) | Full-stack framework for server-rendered pages, API routes, and optimized frontend performance/SEO |
| UI | Tailwind CSS + shadcn/ui | Utility-first styling and accessible, pre-built UI components |
| Backend API | Python + Django (REST Framework) | "Batteries-included" backend for ORM, admin panel, and custom CRM integration |
| Database | PostgreSQL + pg_cron extension | Primary relational database for all structured data; pg_cron for automated compliance jobs |
| File Storage | Local filesystem / S3-compatible object store | Storage for property images, landlord documents, and other large binary assets |
| Authentication | Custom JWT-based authentication | Self-hosted authentication using secure HTTP-only cookies, with role-based access control (RBAC) |
| Payment Gateway | Flutterwave / Paystack API | External integration for processing e-commerce transactions (Phase 3 only) |
| Hosting | Nigerian VPS provider (e.g., Fimgohost) | Self-hosted virtual private server with full control over the environment |

## System Boundaries

### `app/` (Next.js Frontend)
Owns the server-rendered frontend UI for all active phases. Routes are strictly organized by Bounded Context and Authentication status:
- `/` — **Marketing Landing Page** (Public). Hero, social proof, benefits, FAQ, final CTA. Routes to functional contexts via Navbar/CTAs.
- `/search` — Buyer Context (Phase 1). **Auth-Gated.** Property search with filters and results grid.
- `/landlord` — Landlord Context (Phase 2). **Auth-Gated.** Value proposition, intake, booking.
- `/builder` — Builder Context (Phase 3). **Auth-Gated** (when active). Coming Soon page during Phases 1-2.
- `/dashboard` — Agent/Admin dashboard (shared). **Auth-Gated (Admin/Agent roles only).**
- `/login`, `/signup` — Authentication Gate.

### `backend/` (Django Backend)
Owns all core business logic. Split into modular Django apps:
- `crm/` — Buyer Context (Concierge leads, lead scoring, SLA alerts)
- `properties/` — Shared property data (used by Buyer and Landlord contexts)
- `landlords/` — Landlord Context (Registration, intake, appointments) — stubbed until Phase 2
- `appointments/` — Shared appointment engine (used by Landlord and potentially Builder)
- `ecommerce/` — Builder Context (Products, cart, orders, payments) — stubbed until Phase 3
- `users/` — User accounts and authentication (shared across all contexts)
- `compliance/` — NDPR compliance (consent logging, data export, erasure, retention)

### `database/` (PostgreSQL)
Owns the persistent storage of all application data, including relational integrity, indexes, and scheduled jobs for data retention. Acts as the single source of truth.

### `storage/` (File System / Object Store)
Owns the storage and retrieval of unstructured binary assets (property photos, landlord documents, etc.). Metadata references are stored in the database.

### `auth/` (JWT + RBAC)
Owns user identity, session management, and authorization rules for different roles (Admin, Agent, Landlord, Builder, Buyer). Shared across all contexts.

---

## Data Flow, Types, and API Contracts

This section explicitly details every data point fetched from the user, sent back to the user, expected data types, and how the data is handled.

### 1. Authentication & User Management (Shared)

**Inbound Data (User → System):**
| Field | Data Type | Validation Rules | Handling |
| --- | --- | --- | --- |
| `email` | `String` (Email) | Valid email format, unique in DB | Sanitized, stored lowercase |
| `password` | `String` | Min 8 chars, 1 uppercase, 1 number | Hashed using Argon2 or PBKDF2 before storage |
| `role` | `Enum` | `BUYER`, `LANDLORD`, `BUILDER` | Stored as integer/enum in DB |
| `ndpr_consent` | `Boolean` | Must be `true` | Logged immutably in `consent_logs` |

**Outbound Data (System → User):**
| Field | Data Type | Description |
| --- | --- | --- |
| `access_token` | `String` (JWT) | Short-lived token for API access |
| `refresh_token` | `String` (JWT) | Long-lived token for session renewal |
| `user_profile` | `Object` | `{ id: UUID, email: String, role: Enum, created_at: DateTime }` |

### 2. Buyer Context (Phase 1)

#### A. Property Search
**Inbound Data (User → System - Query Params):**
| Field | Data Type | Validation Rules | Handling |
| --- | --- | --- | --- |
| `location` | `String` | Max 100 chars | Used for `icontains` DB query |
| `min_price` | `Decimal` | >= 0 | Used for `gte` DB query |
| `max_price` | `Decimal` | >= `min_price` | Used for `lte` DB query |
| `property_type` | `Enum` | `APARTMENT`, `HOUSE`, `LAND`, etc. | Exact match DB query |
| `bedrooms` | `Integer` | >= 0 | Exact match DB query |

**Outbound Data (System → User):**
| Field | Data Type | Description |
| --- | --- | --- |
| `results` | `Array<Object>` | List of matching properties |
| `results[].id` | `UUID` | Property identifier |
| `results[].title` | `String` | Property headline |
| `results[].location` | `String` | City/Area |
| `results[].price` | `Decimal` | Formatted price |
| `results[].image_url` | `String` (URL) | Primary image URL from object storage |

#### B. Concierge Lead Submission
**Inbound Data (User → System - JSON Body):**
| Field | Data Type | Validation Rules | Handling |
| --- | --- | --- | --- |
| `full_name` | `String` | Max 150 chars | Sanitized, stored in `concierge_leads` |
| `phone` | `String` | Nigerian format (+234...) | Sanitized, stored |
| `target_location` | `String` | Max 100 chars | Stored |
| `budget` | `Decimal` | > 0 | Stored |
| `property_specs` | `Text` | Max 1000 chars | Sanitized (strip HTML tags) |
| `ndpr_consent` | `Boolean` | Must be `true` | Creates atomic `consent_logs` record |

**Outbound Data (System → User):**
| Field | Data Type | Description |
| --- | --- | --- |
| `status` | `String` | `"success"` |
| `lead_id` | `UUID` | Internal reference ID |
| `message` | `String` | "Our team will contact you within 2 hours" |

### 3. Landlord Context (Phase 2)

#### A. Landlord Registration & Property Intake
**Inbound Data (User → System - JSON Body):**
| Field | Data Type | Validation Rules | Handling |
| --- | --- | --- | --- |
| `company_name` | `String` | Max 150 chars (Optional) | Sanitized |
| `property_address` | `String` | Max 250 chars | Stored in `property_listings` |
| `size_sqm` | `Decimal` | > 0 | Stored |
| `condition` | `Enum` | `EXCELLENT`, `GOOD`, `NEEDS_RENOVATION` | Stored |
| `current_rent` | `Decimal` | >= 0 | Stored |
| `availability_date` | `Date` | Future date | Stored |
| `photos` | `File[]` | Max 5MB per file, JPG/PNG | Uploaded to Object Storage, URL stored in DB |
| `notes` | `Text` | Max 2000 chars | Sanitized |

**Outbound Data (System → User):**
| Field | Data Type | Description |
| --- | --- | --- |
| `status` | `String` | `"success"` |
| `property_id` | `UUID` | Internal reference ID |
| `message` | `String` | "Property details saved successfully" |

#### B. Appointment Booking
**Inbound Data (User → System - JSON Body):**
| Field | Data Type | Validation Rules | Handling |
| --- | --- | --- | --- |
| `preferred_date` | `Date` | Future date, not weekend (configurable) | Checked against agent availability |
| `preferred_time` | `Time` | Business hours (e.g., 09:00 - 17:00) | Checked against agent availability |
| `notes` | `Text` | Max 500 chars | Sanitized |

**Outbound Data (System → User):**
| Field | Data Type | Description |
| --- | --- | --- |
| `status` | `String` | `"confirmed"` |
| `appointment_id` | `UUID` | Internal reference ID |
| `agent_name` | `String` | Assigned agent's name |
| `confirmation_message` | `String` | "Your consultation is booked for [date/time]" |

---

## Data Handling & Processing Rules

1. **Validation:** All inbound data is validated at the system boundary. Frontend uses **Zod** schemas; Backend uses **Django REST Framework (DRF) Serializers**.
2. **Sanitization:** All text inputs are sanitized to prevent XSS and injection attacks. HTML tags are stripped from `notes` and `property_specs` fields.
3. **File Handling:** Binary files (images, documents) are never stored in the database. They are uploaded to the Object Storage, and only the secure URL is stored in PostgreSQL.
4. **PII Protection:** Personally Identifiable Information (email, phone, name) is strictly access-controlled. Database columns containing PII are not exposed in public API responses.
5. **Atomic Transactions:** Lead creation and consent logging are wrapped in a single database transaction (`transaction.atomic()`). If one fails, both roll back.

## Auth and Access Model

**Authentication:** Users authenticate via a custom JWT-based system. Credentials are validated against the `users` table in PostgreSQL, and a secure HTTP-only cookie is issued upon successful login. Entirely self-hosted.

**Authorization (RBAC):** Role-based access control is enforced at both the UI and API levels. Predefined roles include:
- **Admin:** Full system access, including user management and compliance tools.
- **Agent:** Can view and manage assigned leads (concierge and landlord), update lead statuses, and view their own dashboard.
- **Landlord:** Can access their own property intake forms and appointment history.
- **Builder:** Can access the B2B e-commerce portal and view their order history (Phase 3).
- **Buyer:** Can search properties, submit concierge forms, and view property details.
- **Guest:** **STRICTLY LIMITED.** Guests can ONLY view the Marketing Landing Page (`/`), static assets (images, fonts), and public legal pages (Privacy Policy). Guests **cannot** search properties, submit forms, or access any business functionality.

**API Access:** All API endpoints (except public marketing assets and legal pages) require a valid JWT. Role-based middleware verifies permissions before executing any mutation or returning sensitive data.

**Ownership Model:** Every lead (concierge request, landlord opportunity, builder order) is associated with a creator (`created_by`) and, where applicable, a primary contact. Agents are assigned to leads for follow-up. Mutations are restricted to the owner or assigned agent, except for admin override.

## Invariants

- **No External CRM Dependency:** The system must never rely on third-party SaaS CRMs (HubSpot, Salesforce) for lead storage or routing.
- **Consent Before Data Storage:** The system must never persist a user's PII without first obtaining and logging explicit, verifiable consent.
- **2-Hour SLA for Concierge Leads:** Any lead submitted via the "2-Week Concierge Search" workflow must have its `priority` set to `'HIGH'` and must immediately trigger an internal notification.
- **Search-First, Not Found Fallback:** An empty search result is the explicit trigger for the conditional "Concierge Offer" modal.
- **Atomic Lead Creation:** The creation of a new concierge lead and its corresponding `consent_logs` record must be an atomic database transaction.
- **No Guest Business Access:** The system must never process business logic (search, forms, bookings) for unauthenticated users. The Auth Gate is absolute.

## Key Data Models (Summary)

### Buyer Context
| Model | Purpose |
| --- | --- |
| ConciergeLead | Stores concierge request data (name, email, phone, budget, specs, status, priority) |
| ConsentLog | Immutable audit trail of user consent (timestamp, policy version, IP address) |
| LeadScore | Dynamic score (0-100) for lead prioritization, with scoring breakdown |
| Property | Property listings (title, description, location, price, type, bedrooms, status, images) |

### Landlord Context (Phase 2)
| Model | Purpose |
| --- | --- |
| LandlordProfile | Landlord account details (name, email, phone, company) |
| PropertyListing | Detailed property data submitted by landlords (address, size, condition, rent, availability, images) |
| Appointment | Consultation bookings (landlord, agent, datetime, status) |

### Builder Context (Phase 3 — Optional)
| Model | Purpose |
| --- | --- |
| Product | Building material details (name, description, category, price, stock, images) |
| Category | Product categorization (Cement, Steel, Roofing, Plumbing, etc.) |
| Cart | Shopping cart stored per user session |
| Order | Completed order (user, items, total, status, shipping address, tracking) |
| OrderItem | Individual line items within an order (product, quantity, price) |
| Supplier | Supplier profile (name, contact, products, listing fees) |

## Communication Between Bounded Contexts

| Contexts | Communication Method | Purpose |
| --- | --- | --- |
| Buyer ↔ Landlord | Shared `properties` table | Landlord properties feed into Buyer search results |
| Buyer ↔ Shared | `users`, `consent_logs` | Lead data linked to user accounts and consent records |
| Landlord ↔ Shared | `users`, `appointments` | Landlord accounts and appointment scheduling |
| Builder ↔ Shared | `users`, `orders` | Builder accounts and order history |

*Rule:* No direct imports between Bounded Contexts. All cross-context data access must go through a shared `core` app or use Domain Events.

## Supporting Architecture (Phase-Agnostic)

- **Headless Architecture:** Next.js frontend decoupled from Django backend. Communication via REST APIs.
- **BFF (Backend for Frontend):** Next.js serves the UI and proxies API calls to Django, handling session management and simple orchestration.
- **Self-Hosted:** All services run on a single VPS inside Docker containers. No reliance on big cloud providers.
- **Database Isolation:** PostgreSQL binds to localhost only — never exposed to the public internet.
- **Automated Backups:** Daily `pg_dump` to remote storage with 30-day retention.
- **Monitoring:** Health check endpoint (`/api/health`) and uptime monitoring.

## How This Architecture Supports Phased Implementation

| Phase | What Gets Activated | Architecture Impact |
| --- | --- | --- |
| Phase 1 | Buyer Context (`crm`, `properties`) | Landlord and Builder modules exist but are **stubbed** (empty models/views). No business logic runs in them. |
| Phase 2 | Landlord Context (`landlords`, `appointments`) | Landlord module is **activated**. Builder remains stubbed. |
| Phase 3 | Builder Context (`ecommerce`) | Builder module is **activated**. The architecture is unchanged — it simply adds functionality to an existing module. |

This approach ensures that the architecture remains stable and consistent throughout the project lifecycle, while allowing incremental implementation.