# Code Standards

## General Engineering Principles
*These rules apply to all code written in this project, regardless of the layer (Frontend or Backend).*

- **Keep modules small and single-purpose**. Each file, component, and function should have one clear responsibility. Avoid "god" objects or utility files that accumulate unrelated helpers.
- **Fix root causes, do not layer workarounds**. When a bug or limitation is encountered, address it at its source. Avoid adding conditional patches that obscure the underlying issue.
- **Fail fast and explicitly**. Validate inputs early, throw descriptive errors, and avoid silent failures. All error messages must be actionable for the developer.
- **Write self-documenting code**. Use clear variable/function names; comments should explain _why_ something is done, not _what_ is done.
- **Do not mix unrelated concerns in one file**. Respect Bounded Context boundaries — code from the Buyer Context must not be mixed with code from the Landlord Context in a single file.

---

## Frontend Engineering Principles (Next.js, React & GSAP)
*These rules govern how the frontend code is written, structured, and engineered. (Visual design rules are handled in `ui-context.md`).*

- **Strict TypeScript is mandatory**. `tsconfig.json` must have `"strict": true`. No use of `any` — prefer `unknown` with narrowing, or define explicit interfaces.
- **Define explicit Props interfaces**. Every component must have a named `Props` interface. Never use inline object types for props.
- **Component Granularity**: Keep components small (ideally under 150 lines). If a component handles multiple distinct UI concerns (e.g., a form *and* a data table), extract them into separate sub-components.
- **Server vs. Client Boundary**: Default to Server Components. Push `'use client'` to the absolute leaves of the component tree (e.g., buttons with `onClick`, forms with `useState`, hooks, GSAP animations). Never make a parent component a Client Component just because one child needs interactivity.
- **State Management Philosophy**: 
  - **Colocate state**: Keep state as close to where it is used as possible. 
  - **Lift state only when necessary**: Do not lift state to a global level (like Zustand or Context) prematurely. 
  - **Avoid prop drilling**: If you are passing props through more than 3 layers, use Component Composition (passing components as `children` or props) or Context.
- **Data Fetching Strategy**: 
  - Fetch initial data in Server Components and pass it down as props. 
  - Use `useSWR` or `useQuery` *only* for client-side mutations, polling, or highly dynamic data that requires revalidation.
- **Form Handling**: All forms must use `react-hook-form` with `zod` for schema validation. Never use uncontrolled inputs for complex forms.
- **Animation Strategy (GSAP)**:
  - Use `gsap` and `@gsap/react` for all complex animations (scroll triggers, staggered reveals, micro-interactions).
  - Always wrap GSAP logic in `useEffect` or use the `useGSAP` hook from `@gsap/react` to prevent memory leaks and ensure proper cleanup.
  - Respect `prefers-reduced-motion` media queries; disable GSAP animations if the user prefers reduced motion.
- **Styling Boundary**: Rely on `ui-context.md` for design tokens. Use Tailwind utility classes combined with CSS variables (e.g., `bg-[var(--primary-deep)]`). Do not use inline `style={{}}` objects.

---

## Backend Engineering Principles (Django & DDD)
*These rules govern how the backend code is written, structured, and engineered.*

- **Follow PEP 8 and use Black for automatic formatting**. Line length should be 88 characters.
- **Use type hints for all function signatures and class attributes**. Leverage `mypy` in CI to enforce type correctness.
- **Business logic belongs in Domain Services, not in Views, Models, or Serializers**. This is a non-negotiable DDD principle enforced across all contexts.

### Domain-Driven Design (DDD) Rules
This project strictly follows Domain-Driven Design tactical patterns within a Modular Monolith for **Primekey Homes and Properties Ltd.**

#### Core DDD Building Blocks
| Pattern | Definition | Example |
|---------|------------|---------|
| **Entity** | An object with a distinct identity that changes over time. | `ConciergeLead`, `LandlordProfile`, `Order` |
| **Value Object** | An immutable object without identity, defined by its attributes. | `Budget` (amount + currency), `Location` (city + state) |
| **Aggregate** | A cluster of Entities and Value Objects treated as a single unit. The Aggregate Root is the entry point. | `ConciergeLead` (with `ConsentLog` as child entity) |
| **Repository** | An abstraction that provides a collection-like interface for retrieving and persisting Aggregates. | `LeadRepository`, `PropertyRepository` |
| **Domain Service** | A stateless class that orchestrates business logic involving multiple Entities. | `ConciergeService`, `LeadScoringService` |
| **Application Service** | A thin orchestration layer that handles HTTP requests, validates input, calls Domain Services, and returns responses. **No business logic here.** | `SubmitConciergeLead` View |

#### Code Organization by Bounded Context
| Bounded Context | Django App(s) | Status |
|-----------------|---------------|--------|
| **Buyer Context** | `crm`, `properties` | Active (Phase 1) |
| **Landlord Context** | `landlords`, `appointments` | Stubbed until Phase 2 |
| **Builder Context** | `ecommerce` | Stubbed until Phase 3 (Optional) |
| **Shared** | `users`, `compliance`, `core` | Active across all phases |

#### Folder Structure Per Django App
```text
backend/apps/crm/
├── __init__.py
├── admin.py               # Django admin configuration
├── apps.py                # App configuration
├── models.py              # Entities, Value Objects, Aggregates
├── repositories.py        # Repository classes (database abstraction)
── services.py            # Domain Services (business logic)
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
#### Folder Structure for Frontend
app/
├── page.tsx                         # Marketing Landing Page (/)
├── layout.tsx                       # Root layout (fonts, metadata, global styles)
├── globals.css                      # CSS variables (colors, gradients, fonts)
├── search/
│   ├── page.tsx                     # Search portal (Auth-Gated)
│   └── components/                  # Buyer Context components (local)
├── property/[id]/
│   └── page.tsx                     # Property detail page
├── landlord/                        # Phase 2 (Auth-Gated)
│   └── page.tsx                     # Landlord landing page
├── builder/                         # Phase 3 (Optional)
│   └── page.tsx                     # Builder portal (Coming Soon)
├── dashboard/                       # Agent/Admin dashboard (shared)
│   ├── page.tsx
│   └── components/
├── login/ & signup/                 # Authentication Gate
├── api/                             # Next.js API routes (thin proxies)
│   ├── search/route.ts
│   ├── submit-concierge/route.ts
│   └── ...
└── middleware.ts                    # Auth Gate & Route Protection

components/
├── ui/                              # shadcn/ui components (DO NOT MODIFY)
├── shared/                          # Shared Marketing & Layout Components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── SocialProof.tsx
│   ├── Benefits.tsx
│   ├── FAQ.tsx
│   ├── FinalCTA.tsx
│   ├── Footer.tsx
│   └── FloatingContact.tsx
── buyer/                           # Buyer Context components
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
├── animations.ts                    # Shared GSAP animation tokens and helpers
├── validations/
│   ├── conciergeSchema.ts           # Zod schemas
│   └── ...
└── utils.ts

types/
├── api.ts                           # API response/request types
├── lead.ts                          # Lead-related types
├── property.ts                      # Property-related types
└── ...

public/                              # Static assets (images, fonts, logo.svg)```

### Prohibited Backend Practices

❌ Do not put business logic in Views, Serializers, or Models (except basic model validation like clean()).

❌ Do not import models from one Bounded Context directly into another. Use the shared core app or Domain Events for cross-context communication.

❌ Do not place raw database queries (e.g., Lead.objects.filter(...)) inside Domain Services without going through a Repository.

❌ Do not use Django's F expressions or raw SQL in Views — these belong in Repositories or Domain Services.

### Next.js (App Router) Specifics

Keep API route handlers (app/api/) thin. They should validate the request, call a service from the Django backend (via HTTP client), and return the response. Do not embed business logic.

Use Server Actions for mutations (form submissions) when possible, but always delegate the heavy lifting to the Django backend. Server Actions should be a thin orchestration layer.

### Route organization:

app/page.tsx — Marketing Landing Page (/) (Public. Hero, social proof, benefits, FAQ, final CTA).

app/search/ — Buyer Context (Auth-Gated).

app/landlord/ — Landlord Context (Auth-Gated, Phase 2).

app/builder/ — Builder Context (Coming Soon / Auth-Gated, Phase 3).

app/dashboard/ — Agent/Admin dashboard (shared).

app/login & app/signup — Authentication Gate.

middleware.ts — Auth Gate enforcement (protects business routes, redirects unauthenticated guests).

Styling (Tailwind + shadcn/ui + CSS Variables + GSAP)

Use CSS custom property tokens — no hardcoded hex values. All colors, gradients, and fonts must be defined in globals.css as --variable-name (per ui-context.md) and referenced via Tailwind's arbitrary value syntax.

Typography: Use font-[var(--font-heading)] (Playfair Display) for all headings and font-[var(--font-body)] (Inter) for body text.

Follow the border radius scale defined in ui-context.md. Do not add arbitrary rounded values.

Use shadcn/ui components from components/ui/; do not re-implement buttons, dialogs, inputs, etc., from scratch. Extend them via className props when needed.

Responsive first: Use Tailwind's responsive prefixes (sm:, md:, lg:) for all layout and spacing.

Gradient Application: Apply bg-[var(--gradient-hero)] for the Hero section, bg-[var(--gradient-cta)] for primary buttons, and bg-[var(--gradient-accent)] for premium badges/testimonials.

Animation Tokens: Define standard GSAP durations and easings in a shared lib/animations.ts file (e.g., duration: 0.6, ease: "power2.out") to ensure consistency across components.

### API Routes (Next.js + Django)
Validate and parse request input before any logic runs. Use DRF serializers on the Django side, and Zod schemas on the Next.js client side before sending the request.

Enforce auth and ownership before any mutation. The Django backend must check the authenticated user's role and permissions (via JWT) before performing any write operation.

Return consistent, predictable response shapes. Use a standard envelope like { "data": ..., "meta": { "page": 1, "total": 10 } } for lists. Error responses should follow: { "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} } }.

Use HTTP status codes correctly: 200/201 for success, 400 for client errors, 401/403 for auth issues, 404 for not found, 500 for server errors.

### Data and Storage
Metadata belongs in the database. All structured information must be stored in PostgreSQL tables.
Large generated content belongs in file or blob storage. Property images and documents must be stored in the file system or object store. The database shall store only the file path or URL.
Do not store large content directly in the database. Avoid BYTEA or BLOB columns for images or files.
All database migrations must be reversible. Ensure that data migrations are idempotent.
Use indexes on frequently queried columns: properties.location, properties.price, concierge_leads.created_at