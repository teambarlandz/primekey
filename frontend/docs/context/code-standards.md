# Code Standards & Guidelines

This document outlines the software engineering standards, structural architecture, design system conventions, and coding patterns for the Primekey Homes codebase. All human developers and AI agents must strictly adhere to these standards to maintain codebase consistency, scalability, and quality.

---

## 🎨 1. Design & Styling System Standards

### 1.1 Color Tokens & CSS Variables
* **Primary Brand Color:** `#04164a` (Brand Navy). Use Tailwind classes: `bg-[#04164a]`, `text-[#04164a]`, `border-[#04164a]`, or CSS variable mappings (`bg-primary`, `text-primary`).
* **Global Page Background:** `#f3f0ff` (Soft Lavender). Applied globally at the root body/layout container level.
* **Surface Containers & Cards:** `bg-white`, `bg-white/90`, or `bg-white/80 backdrop-blur-md` for floating cards, input containers, modals, and dropdown overlays.
* **Text & Neutral Tones:**
  * Primary Headings & Bold Text: `#04164a` or `slate-900`.
  * Secondary Body Text: `slate-700` or `slate-600`.
  * Muted Copy & Placeholders: `slate-500` or `slate-400`.
  * Borders & Dividers: `border-slate-200` or `border-slate-300`.

### 1.2 Typography Rules
* **Headings (`font-heading`):** Use Google Font **Poppins** (weights: 400, 500, 600, 700) for all page headlines, section headings (`h1`, `h2`, `h3`, `h4`), modal titles, badge highlights, and hero copy.
* **Body & Prose (`font-body`):** Use Google Font **Lora** (weights: 400, 500, 600, 700) for body paragraphs, subtitles, feature descriptions, form field labels, accordion text, and footers.
* **Strict Prohibitions:** Never introduce unapproved font classes or hardcoded family strings (e.g., legacy *Playfair Display*, *Inter*, *Roboto*, *Arial*).

### 1.3 Localization & Formatting Standards (Nigeria)
* **Currency Formatting:** Always display prices in Nigerian Naira (`₦`) or ISO code `NGN`. Format all monetary amounts with comma separators (e.g., `₦150,000,000` or `₦250,000/sqm`).
* **Location References:** Default property search inputs and mock data must reflect key Nigerian urban centers (e.g., Lekki Phase 1, Ikoyi, Victoria Island, Ikeja GRA, Maitama, Wuse II, Port Harcourt GRA).
* **Phone Formats:** Validate and accept valid Nigerian telephone formats (+234 country code or local 070, 080, 090, 081 prefixes).

---

## 📁 2. Complete File & Directory Hierarchy

The project follows Next.js App Router conventions combined with Domain-Driven Design (DDD) module grouping. Below is the explicit file map for the codebase:

```text
primekey-homes/
├── .env.local                    # Local environment variables (DB keys, API URLs)
├── .eslintrc.json                # ESLint code linting rules
├── .gitignore                    # Git ignored files & build outputs
├── components.json               # shadcn/ui configuration file
├── next.config.mjs               # Next.js build and configuration settings
├── package.json                  # Dependencies and execution scripts
├── postcss.config.mjs            # PostCSS plugin configurations
├── tailwind.config.ts            # Tailwind theme, color, and plugin settings
├── tsconfig.json                 # TypeScript compiler & alias path configuration
├── types/property.ts             # Property Types Definition
├── app/                          # Next.js App Router Pages & Layouts
│   ├── favicon.ico               # Site favicon icon
│   ├── globals.css               # Global CSS styles & Tailwind variable declarations
│   ├── layout.tsx                # Root layout (App wrapper, Google Fonts loader)
│   ├── page.tsx                  # Homepage / Main Landing Page route
│   │
│   ├── search/                   # Buyer/Renter Property Search Module
│   │   └── page.tsx              # Dynamic property search portal (/search)
│   │
│   ├── property/                 # Individual Property Module
│   │   └── [id]/
│   │       └── page.tsx          # Dynamic property detail view (/property/[id])
│   │
│   ├── landlord/                 # Landlord Pathway Module
│   │   └── page.tsx              # Dedicated landlord acquisition landing page (/landlord)
│   │
│   └── dashboard/                # Agent & Admin CRM Dashboard Module
│       ├── agent/
│       │   └── page.tsx          # Agent lead management interface
│       └── page.tsx              # Main dashboard router
│
├── components/                   # Application React Components
│   ├── ui/                       # Unstyled atomic base primitives (shadcn/ui)
│   │   ├── accordion.tsx         # FAQ Accordion primitive
│   │   ├── badge.tsx             # Status and tag badge UI
│   │   ├── button.tsx            # Button primitive (variants: primary, outline, ghost)
│   │   ├── card.tsx              # Card container primitives
│   │   ├── dialog.tsx            # Accessible modal dialog window
│   │   ├── dropdown-menu.tsx     # Context menu / filter dropdown
│   │   ├── form.tsx              # Radix + react-hook-form wrapper primitives
│   │   ├── input.tsx             # Standard text input control
│   │   ├── select.tsx            # Form select / dropdown primitive
│   │   ├── sheet.tsx             # Mobile drawer / slide-over container
│   │   └── slider.tsx            # Range slider primitive for price filtering
│   │
│   ├── Navbar.tsx                # Global navigation header bar with responsive drawer
│   ├── Hero.tsx                  # Homepage hero section with headline & key search trigger
│   ├── SocialProof.tsx           # Trust badges, statistics counter, & partner logos
│   ├── Benefits.tsx              # Core value proposition grid for buyers & renters
│   ├── FAQ.tsx                   # Frequently Asked Questions interactive section
│   ├── FinalCTA.tsx              # High-converting lead generation form with validation
│   ├── Footer.tsx                # Site footer, quick links, copyright & NDPR notices
│   ├── FloatingContact.tsx       # Sticky floating action button (WhatsApp/Phone trigger)
│   │
│   ├── search/                   # Search Domain Specific Components
│   │   ├── SearchBar.tsx         # Quick location input bar with pill tags
│   │   ├── FilterDropdown.tsx    # Property type & bedroom count filter controls
│   │   ├── PriceRange.tsx        # Min/Max Naira range slider & numeric inputs
│   │   ├── PropertyGrid.tsx      # Results grid container
│   │   ├── PropertyCard.tsx      # Individual property summary card
│   │   └── SearchResults.tsx     # Search state manager (results vs zero-state)
│   │
│   ├── concierge/                # Concierge Pathway Components
│   │   ├── ConciergeModal.tsx    # Triggered modal dialog when search yields zero results
│   │   ├── ConciergeOffer.tsx    # Value prop overview inside modal
│   │   └── ConciergeForm.tsx     # Detailed lead collection form with NDPR consent
│   │
│   └── landlord/                 # Landlord Pathway Components
│       ├── LandlordHero.tsx      # Landlord landing hero component
│       ├── BenefitsGrid.tsx      # Owner benefit cards
│       ├── LandlordForm.tsx      # Multi-step intake form for property owners
│       └── AppointmentBooking.tsx# Agent consultation booking engine
│
└── lib/                          # Core Utilities, Configs, & Validation Schemas
    ├── utils.ts                  # Standard shadcn `cn()` class merging utility
    ├── api/                      # API Layer (contract-first)
    │   ├── contracts.ts          # TypeScript interfaces (single source of truth)
    │   ├── config.ts             # Base URL, auth helpers, retry config
    │   ├── client.ts             # ApiClient class with fetch, retry, interceptors
    │   └── index.ts              # Re-exports
    ├── hooks/                    # SWR Data Fetching Hooks
    │   ├── useProperties.ts      # Property search with caching & revalidation
    │   ├── useProperty.ts        # Property detail fetching
    │   └── useConcierge.ts       # Mutation hook with optimistic updates
    ├── animations.ts             # GSAP animation timeline builders & accessibility checks
    └── validations/              # Zod Schema Definitions
        ├── searchSchema.ts       # Search filter parameter validation schema
        ├── conciergeSchema.ts    # Concierge lead capture validation schema
        └── landlordSchema.ts     # Landlord registration & intake validation schema
```

---

## 💻 3. React & TypeScript Coding Conventions

### 3.1 Strict Client Directive Rules
* Append `'use client';` **only** at the very top of files that utilize browser events, DOM references (`useRef`), React hooks (`useState`, `useEffect`), form controllers, or GSAP animation triggers.
* Keep server components as default wherever possible to preserve SEO performance and reduce initial JavaScript payload size.

### 3.2 Component Declaration & Structure
* Use named functional components or explicit export standards.
* Always explicitly type component props using TypeScript interface or type aliases. Never use `any`.

```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  className?: string;
  onSelect?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  isActive = false,
  className,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-6 rounded-2xl transition-all duration-300 bg-white border border-slate-200 hover:shadow-lg cursor-pointer",
        isActive && "border-[#04164a] ring-2 ring-[#04164a]/20",
        className
      )}
    >
      {icon && <div className="mb-4 text-[#04164a]">{icon}</div>}
      <h3 className="font-heading text-xl font-bold text-[#04164a] mb-2">{title}</h3>
      <p className="font-body text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};
```

---

## 🌐 4. API Layer & Data Fetching Standards

### 4.1 Contract-First API Design
* **Single Source of Truth**: All request/response types defined in `lib/api/contracts.ts`
* **Validation Parity**: Frontend Zod schemas (`lib/validations/`) mirror backend DRF serializers 1:1
* **Versioned Endpoints**: All APIs under `/api/v1/` with 6-month deprecation window for breaking changes

### 4.2 Centralized API Client (`lib/api/client.ts`)
```typescript
// Usage
import { api } from '@/lib/api';

const properties = await api.searchProperties({ location: 'Lekki' });
const lead = await api.submitConciergeLead({ fullName: 'John', phone: '08012345678', ... });
```

**Features:**
- Generic `request<T>()` with typed responses
- Automatic retry with exponential backoff (3 attempts)
- Rate limit handling (429 → retry after `Retry-After` header)
- Auth token interceptor (Bearer token from secure storage)
- Request timing logs in development
- Standardized `ApiError` with `status`, `fieldErrors`, `code`

### 4.3 Data Fetching with SWR (`lib/hooks/`)
```typescript
// Query hooks
const { data, error, isLoading, isValidating } = useProperties(filters);
const { data } = useProperty(id);

// Mutation hooks (optimistic updates)
const { form, submit, state, error, reset } = useConcierge(initialFilters);
await form.handleSubmit(submit);
```

**SWR Configuration Standards:**
- `dedupingInterval: 2000` - prevent duplicate requests
- `revalidateOnFocus: true` - fresh data on window focus
- `revalidateOnReconnect: true` - fresh data on network restore
- `keepPreviousData: true` - smooth pagination transitions
- `mutate(key)` for cache invalidation after mutations

### 4.4 Environment-Aware Base URL
```typescript
// lib/api/config.ts
const isServer = typeof window === 'undefined';
export const API_BASE = isServer 
  ? process.env.NEXT_PUBLIC_INTERNAL_API_URL  // Direct internal URL (Docker network)
  : '/api/backend';                            // Next.js rewrite proxy
```

**Next.js Rewrites** (`next.config.mjs`):
```javascript
async rewrites() {
  return [{
    source: '/api/backend/:path*',
    destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
  }];
}
```

---

## 📝 5. Form Handling & Zod Validation Standards

### 5.1 Form Principles
* **State Engine:** All interactive forms must utilize `react-hook-form` paired with `@hookform/resolvers/zod`.
* **Component Rendering:** Forms must strictly render using shadcn/ui wrappers (`<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`).
* **Validation Schemas:** Every form schema must be located inside `lib/validations/` and export a reusable TypeScript type via `z.infer`.

### 5.2 Validation Parity (Frontend ↔ Backend)
| Frontend (Zod) | Backend (DRF Serializer) |
|----------------|--------------------------|
| `conciergeFormSchema` | `ConciergeLeadSerializer` |
| `searchFilterSchema` | `PropertySearchSerializer` |
| Shared constant: `NIGERIAN_PHONE_REGEX` | Same regex in `validate_phone()` |

**Shared Regex (copy to both):**
```typescript
// Frontend: lib/validations/conciergeSchema.ts
// Backend: apps/crm/serializers.py
export const NIGERIAN_PHONE_REGEX = /^(?:\+?234|0)[789][01]\d{8}$/;
```

### 5.3 Cross-Field Validation
```typescript
// Frontend (Zod)
.refine(data => data.budgetMin <= data.budgetMax, {
  message: 'Minimum budget cannot exceed maximum budget',
  path: ['budgetMin'],
})

# Backend (DRF)
def validate(self, attrs):
    if attrs.get('budget_min', 0) > attrs.get('budget_max', 500_000_000):
        raise serializers.ValidationError({'budget_min': 'Min cannot exceed max.'})
    return attrs
```

### 5.4 Standard Validation Schema Example (`lib/validations/searchSchema.ts`)
```typescript
import * as z from 'zod';

export const propertyTypes = [
  'any', 'self_contain', 'room_and_parlour', 'single_room', 'bq', 'short_let',
  'flat', 'maisonette', 'bungalow', 'terrace_duplex', 'semi_detached_duplex',
  'fully_detached_duplex', 'penthouse', 'mansion', 'land', 'commercial',
] as const;

export const searchFilterSchema = z.object({
  location: z.string().optional(),
  propertyType: z.enum(propertyTypes).default('any'),
  minPrice: z.number().min(0, 'Min price cannot be negative').default(0),
  maxPrice: z.number().min(0, 'Max price must be positive').default(500_000_000),
  bedrooms: z.string().default('any'),
}).refine(d => d.minPrice <= d.maxPrice, {
  message: 'Min price cannot exceed max price',
  path: ['minPrice'],
});

export type SearchFilterValues = z.infer<typeof searchFilterSchema>;
```

---

## 🎬 6. GSAP Animation & Accessibility Rules

### 6.1 GSAP Lifecycle & Cleanup
* Always execute GSAP animations inside `@gsap/react` `useGSAP()` hook to guarantee automatic lifecycle cleanup and prevent memory leaks during page navigation.
* Always check browser motion preferences before initiating scroll-triggered timelines using `prefersReducedMotion()`.

### 6.2 GSAP Animation Helper Standard (`lib/animations.ts`)
```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const animateFadeUp = (element: Element | string, delay: number = 0) => {
  if (prefersReducedMotion()) return;

  gsap.from(element, {
    y: 35,
    opacity: 0,
    duration: 0.8,
    delay,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });
};
```

---

## ⚙️ 7. Code Quality, Imports & Path Aliases

### 7.1 Import Order Conventions
Organize imports in the following strict order, separated by blank lines:
1. React core and Next.js built-ins (`react`, `next/font`, `next/image`, `next/navigation`).
2. Third-party libraries (`gsap`, `lucide-react`, `react-hook-form`, `zod`, `swr`).
3. Internal shadcn/ui primitives (`@/components/ui/...`).
4. Internal domain components (`@/components/...`).
5. Utility helpers, schemas, and types (`@/lib/...`).

### 7.2 Path Alias Standard
Always use configured TypeScript path aliases instead of relative imports:
* `@/components/*` maps to `./components/*`
* `@/lib/*` maps to `./lib/*`
* `@/app/*` maps to `./app/*`
* `@/hooks/*` maps to `./hooks/*`
* `@/components/ui/*` maps to `./components/ui/*`

*(Example: `import { Button } from '@/components/ui/button'` instead of `import { Button } from '../../components/ui/button'`)*

### 7.3 Linting & Formatting
```bash
# Frontend
npm run lint      # ESLint with Next.js config
npm run typecheck # tsc --noEmit

# Backend
black .           # Format
isort .           # Sort imports
flake8 .          # Lint
mypy .            # Type check
pytest            # Test
```

### 7.4 Pre-Commit Hooks (Husky + lint-staged)
```json
// package.json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.py": ["black", "isort"]
}
```

---

## 🧪 8. Testing Standards

### 8.1 Frontend
- **Unit**: Vitest + React Testing Library (`__tests__/`)
- **Integration**: SWR cache behavior, form validation flows
- **E2E**: Cypress/Playwright for critical paths (search → concierge)

### 8.2 Backend
- **Unit**: pytest + factory-boy for models/serializers/services
- **API**: DRF test client for view endpoints
- **Contract**: Schema validation against `drf-spectacular` generated OpenAPI

### 8.3 Coverage Targets
| Layer | Minimum |
|-------|---------|
| Serializers/Validators | 90% |
| Services/Business Logic | 80% |
| Views/Endpoints | 70% |
| Hooks/Utilities | 80% |

---

```
```