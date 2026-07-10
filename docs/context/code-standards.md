Code Standards: Modular Monolith with DDD architecture and the phased implementation approach.

---

```markdown
# Code Standards

## General

- **Keep modules small and single-purpose**. Each file, component, and function should have one clear responsibility. Avoid "god" objects or utility files that accumulate unrelated helpers.
- **Fix root causes, do not layer workarounds**. When a bug or limitation is encountered, address it at its source. Avoid adding conditional patches that obscure the underlying issue.
- **Do not mix unrelated concerns in one component or route**. Respect Bounded Context boundaries — code from the Buyer Context must not be mixed with code from the Landlord Context in a single file.
- **Fail fast and explicitly**. Validate inputs early, throw descriptive errors, and avoid silent failures. All error messages must be actionable for the developer.
- **Write self-documenting code**. Use clear variable/function names; comments should explain _why_ something is done, not _what_ is done.
- **Business logic belongs in Domain Services, not in Views, Models, or Serializers**. This is a non-negotiable DDD principle enforced across all contexts.

---

## Domain-Driven Design (DDD) Rules

This project strictly follows Domain-Driven Design tactical patterns within a Modular Monolith.

### Core DDD Building Blocks

| Pattern | Definition | Example |
|---------|------------|---------|
| **Entity** | An object with a distinct identity that changes over time. | `ConciergeLead`, `LandlordProfile`, `Order` |
| **Value Object** | An immutable object without identity, defined by its attributes. | `Budget` (amount + currency), `Location` (city + state), `PropertySpecs` (bedrooms, bathrooms, amenities) |
| **Aggregate** | A cluster of Entities and Value Objects treated as a single unit. The Aggregate Root is the entry point. | `ConciergeLead` (with `ConsentLog` and `LeadScore` as child entities) |
| **Repository** | An abstraction that provides a collection-like interface for retrieving and persisting Aggregates. | `LeadRepository`, `PropertyRepository`, `LandlordRepository` |
| **Domain Service** | A stateless class that orchestrates business logic involving multiple Entities or external services. | `ConciergeService`, `LeadScoringService`, `SLAAlertService`, `BookingService` |
| **Application Service** | A thin orchestration layer that handles HTTP requests, validates input (via serializers), calls Domain Services, and returns responses. **No business logic here.** | `SubmitConciergeLead`, `ScheduleConsultation`, `CheckoutOrder` |
| **Domain Event** | A notification that something significant has happened in the domain. | `LeadSubmitted`, `AppointmentBooked`, `OrderConfirmed` |

### Code Organization by Bounded Context

| Bounded Context | Django App(s) | Status |
|-----------------|---------------|--------|
| **Buyer Context** | `crm`, `properties` | Active (Phase 1) |
| **Landlord Context** | `landlords`, `appointments` | Stubbed until Phase 2 |
| **Builder Context** | `ecommerce` | Stubbed until Phase 3 (Optional) |
| **Shared** | `users`, `compliance`, `core` | Active across all phases |

### Folder Structure Per Django App

```

backend/apps/crm/
├── init.py
├── admin.py               # Django admin configuration
├── apps.py                # App configuration
├── models.py              # Entities, Value Objects, Aggregates
├── repositories.py        # Repository classes (database abstraction)
├── services.py            # Domain Services (business logic)
├── serializers.py         # DRF serializers (input/output validation)
├── views.py               # Application Services (HTTP handlers)
├── urls.py                # Route registration
├── events.py              # Domain Events (optional, for async workflows)
├── tasks.py               # Background tasks (Celery/Django-Q)
├── migrations/            # Database migrations
└── tests/
├── test_models.py
├── test_repositories.py
├── test_services.py
└── test_views.py

```

### Prohibited Practices

- ❌ **Do not put business logic in Views, Serializers, or Models** (except basic model validation like `clean()`).
- ❌ **Do not import models from one Bounded Context directly into another**. Use the shared `core` app or Domain Events for cross-context communication.
- ❌ **Do not place raw database queries (e.g., `Lead.objects.filter(...)`) inside Domain Services** without going through a Repository.
- ❌ **Do not use Django's `F` expressions or raw SQL in Views** — these belong in Repositories or Domain Services.

---

## TypeScript (Next.js Frontend)

- **Strict mode is required throughout the project**. `tsconfig.json` must have `"strict": true`. No use of `any` — prefer `unknown` with narrowing, or define explicit interfaces.
- **Define shared types in a dedicated `types/` folder** (e.g., `types/api.ts`, `types/lead.ts`). These should be automatically inferred from the Django API contract where possible (via OpenAPI generation) to maintain consistency.
- **Validate all external input at system boundaries**. Use Zod or similar for runtime validation of API responses and user inputs in forms. Never trust the shape of data from the backend.
- **Prefer functional components with explicit Props interfaces**. Use `React.FC<Props>` with named props.
- **Organize components by Bounded Context**:
  - `components/buyer/` — Buyer Context components (search, concierge)
  - `components/landlord/` — Landlord Context components (registration, intake, booking)
  - `components/builder/` — Builder Context components (catalog, cart, checkout) — Phase 3
  - `components/shared/` — Shared components (buttons, layouts, modals)
  - `components/ui/` — shadcn/ui generated components (do not modify directly)

---

## Python (Django Backend)

- **Follow PEP 8 and use Black for automatic formatting**. Line length should be 88 characters.
- **Use type hints for all function signatures and class attributes**. Leverage `mypy` in CI to enforce type correctness.
- **Organize code by Bounded Context**. Each Django app should be self-contained with its own models, views, serializers, repositories, and services.
- **Use Django REST Framework (DRF) for all APIs**. Create serializers for input validation and output formatting. Do not write raw JSON parsing in views.
- **Repository Pattern for database access**:
  - Repositories must abstract all database queries.
  - Example: `LeadRepository.get_by_email(email: str) -> Optional[ConciergeLead]`
  - Domain Services must use Repositories, not the ORM directly.
- **Domain Services for business logic**:
  - Services must be stateless classes with methods that operate on Aggregates.
  - Example: `ConciergeService.submit_lead(data: dict) -> ConciergeLead`
- **Application Services (Views) must be thin**:
  - Validate input via DRF serializers.
  - Call the appropriate Domain Service.
  - Return an HTTP response.
  - **Do not** put business logic here.
- **Atomic transactions**:
  - Use `transaction.atomic()` when creating an Aggregate and its related records (e.g., `ConciergeLead` + `ConsentLog`).
- **Use Django's built-in signals only for cross-cutting concerns** (e.g., audit logging). Do not use signals for core business logic — this belongs in Domain Services.

---

## Next.js (App Router)

- **Default to server components** (`use server`). Add `'use client'` only when browser interactivity (state, effects, event handlers) is required.
- **Keep API route handlers (`app/api/`) thin**. They should validate the request, call a service from the Django backend (via HTTP client), and return the response. Do not embed business logic.
- **Use Server Actions for mutations** (form submissions) when possible, but always delegate the heavy lifting to the Django backend. Server Actions should be a thin orchestration layer.
- **Maintain a single data-fetching strategy**: Prefer `fetch` with caching hints (`cache: 'force-cache'`, `next: { revalidate }`) for static data, and `useSWR` or `useQuery` for client-side data with revalidation.
- **Route organization**:
  - `app/page.tsx` — Intent Gateway
  - `app/search/` — Buyer Context
  - `app/landlord/` — Landlord Context (Phase 2)
  - `app/builder/` — Builder Context (Phase 3 — Optional)
  - `app/dashboard/` — Agent/Admin dashboard (shared)

---

## Styling (Tailwind + shadcn/ui)

- **Use CSS custom property tokens — no hardcoded hex values**. All colors must be defined in `globals.css` as `--variable-name` and referenced via `bg-[var(--bg-base)]` or via Tailwind's `bg-background` when mapping is configured.
- **Follow the border radius scale defined in `ui-context.md`**. Do not add arbitrary rounded values; use the predefined classes (e.g., `rounded-md`, `rounded-lg`, `rounded-xl`).
- **Use shadcn/ui components from `components/ui/`**; do not re-implement buttons, dialogs, inputs, etc. from scratch. Extend them via className props when needed.
- **Responsive first**: Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) for all layout and spacing.

---

## API Routes (Next.js + Django)

- **Validate and parse request input before any logic runs**. Use DRF serializers on the Django side, and Zod schemas on the Next.js client side before sending the request.
- **Enforce auth and ownership before any mutation**. The Django backend must check the authenticated user's role and permissions (via JWT) before performing any write operation. Do not rely solely on frontend checks.
- **Return consistent, predictable response shapes**. Use a standard envelope like `{ "data": ..., "meta": { "page": 1, "total": 10 } }` for lists, and `{ "data": ... }` for single objects. Error responses should follow a consistent structure: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} } }`.
- **Use HTTP status codes correctly**: 200/201 for success, 400 for client errors, 401/403 for auth issues, 404 for not found, 500 for server errors.

---

## Data and Storage

- **Metadata belongs in the database**. All structured information (user profiles, lead data, property details, order records) must be stored in PostgreSQL tables.
- **Large generated content belongs in file or blob storage**. Property images, landlord-submitted photos, and PDF documents must be stored in the file system or object store. The database shall store only the file path or URL.
- **Do not store large content directly in the database**. Avoid `BYTEA` or `BLOB` columns for images or files; they degrade performance and backup/restore.
- **All database migrations must be reversible**. Use Django migrations (`makemigrations` and `migrate`) with proper `--fake` handling. Ensure that data migrations (for data cleanup) are idempotent.
- **Use indexes on frequently queried columns**: `properties.location`, `properties.price`, `properties.status`, `concierge_leads.created_at`, `concierge_leads.status`.

---

## File Organization

### Frontend (Next.js)

```

app/
├── page.tsx                         # Intent Gateway (landing page)
├── search/
│   ├── page.tsx                     # Search portal
│   └── components/                  # Buyer Context components (local)
├── property/[id]/
│   └── page.tsx                     # Property detail page
├── landlord/                        # Phase 2
│   └── page.tsx                     # Landlord landing page
├── builder/                         # Phase 3 (Optional)
│   └── page.tsx                     # Builder portal
├── dashboard/                       # Agent/Admin dashboard
│   ├── page.tsx
│   └── components/
├── api/                             # Next.js API routes (thin proxies)
│   ├── search/route.ts
│   ├── submit-concierge/route.ts
│   └── ...
└── layout.tsx

components/
├── ui/                              # shadcn/ui components (DO NOT MODIFY)
├── shared/                          # Shared components (buttons, layouts, modals)
├── buyer/                           # Buyer Context components
│   ├── IntentGateway.tsx
│   ├── SearchBar.tsx
│   ├── PropertyGrid.tsx
│   ├── PropertyCard.tsx
│   └── ConciergeModal.tsx
├── landlord/                        # Phase 2
│   ├── LandlordHero.tsx
│   ├── LandlordRegistrationForm.tsx
│   ├── PropertyIntakeForm.tsx
│   └── AppointmentBooking.tsx
├── builder/                         # Phase 3 (Optional)
│   ├── ProductCatalog.tsx
│   ├── CartSidebar.tsx
│   └── CheckoutForm.tsx
└── dashboard/
├── LeadTable.tsx
└── LeadDetail.tsx

lib/
├── api-client.ts                    # API client functions
├── validations/
│   ├── conciergeSchema.ts           # Zod schemas
│   └── ...
└── utils.ts

types/
├── api.ts                           # API response/request types
├── lead.ts                          # Lead-related types
├── property.ts                      # Property-related types
└── ...

public/                              # Static assets (images, fonts)

```

### Backend (Django)

```

backend/
├── manage.py
├── backend/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py                       # Root URL configuration
│   └── wsgi.py
├── apps/
│   ├── core/                         # Shared utilities, base models, mixins
│   │   ├── models.py
│   │   └── ...
│   ├── users/                        # User accounts, authentication, RBAC
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── ...
│   ├── compliance/                   # NDPR compliance (consent, data export, erasure)
│   │   ├── models.py
│   │   ├── services.py
│   │   ├── views.py
│   │   └── management/commands/
│   │       └── anonymize_leads.py    # pg_cron scheduled job
│   ├── crm/                          # Buyer Context (Phase 1)
│   │   ├── models.py                 # ConciergeLead, ConsentLog, LeadScore
│   │   ├── repositories.py           # LeadRepository
│   │   ├── services.py               # ConciergeService, LeadScoringService, SLAAlertService
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── tests/
│   ├── properties/                   # Shared property data
│   │   ├── models.py                 # Property
│   │   ├── repositories.py
│   │   ├── services.py               # SearchService
│   │   └── views.py
│   ├── landlords/                    # Landlord Context (Phase 2 — stubbed until Phase 2)
│   │   ├── models.py
│   │   ├── repositories.py
│   │   ├── services.py
│   │   ├── serializers.py
│   │   └── views.py
│   ├── appointments/                 # Shared appointment engine
│   │   ├── models.py
│   │   ├── services.py
│   │   └── views.py
│   ├── ecommerce/                    # Builder Context (Phase 3 — stubbed until Phase 3)
│   │   ├── models.py
│   │   ├── repositories.py
│   │   ├── services.py
│   │   ├── serializers.py
│   │   └── views.py
│   └── dashboard/                    # Agent/Admin dashboard
│       ├── views.py
│       └── serializers.py
├── scripts/                          # Utility scripts (seed data, health checks)
├── static/                           # Collected static files (served by Nginx)
└── media/                            # Uploaded files (images, documents)

```

### Infrastructure (Deployment)

```

infra/
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
├── nginx/
│   ├── nginx.conf
│   └── conf.d/
│       └── app.conf
├── scripts/
│   ├── backup.sh                     # Automated database backup
│   └── deploy.sh                     # Deployment script
└── ssl/                              # SSL certificates (generated by Certbot)

```

---

## Phase-Agnostic Code Organization

| Phase | What's Active | Code Location |
|-------|---------------|---------------|
| **Phase 1** | Buyer Context | `app/search/`, `components/buyer/`, `backend/apps/crm/`, `backend/apps/properties/` |
| **Phase 2** | Landlord Context | `app/landlord/`, `components/landlord/`, `backend/apps/landlords/`, `backend/apps/appointments/` |
| **Phase 3** | Builder Context | `app/builder/`, `components/builder/`, `backend/apps/ecommerce/` |

**Important**: Code for inactive contexts (e.g., `landlords/` during Phase 1) exists but is **stubbed** — models may exist, but no business logic or active endpoints are implemented. The stubs are placeholders for future implementation.

---

## Summary of Key Rules

| Rule | Enforcement |
|------|-------------|
| Business logic in Domain Services | ✅ Mandatory — enforce in code review and AI instructions |
| Repository pattern for database access | ✅ Mandatory — no ORM queries in Domain Services |
| No imports between Bounded Contexts | ✅ Mandatory — use shared `core` or Domain Events |
| Thin Views (Application Services) | ✅ Mandatory — no business logic in Views or Serializers |
| Atomic transactions for Aggregates | ✅ Mandatory — use `transaction.atomic()` |
| Type hints on all functions | ✅ Mandatory — enforced by `mypy` |
| `strict: true` in TypeScript | ✅ Mandatory — enforced by `tsconfig.json` |
| No hardcoded hex values in CSS | ✅ Mandatory — use CSS custom properties |
| No direct modification of `components/ui/*` | ✅ Mandatory — protected files |
```

---