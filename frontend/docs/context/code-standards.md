# Code Standards

Here is the fully detailed, comprehensive **code-standards.md** file. It covers all directory structures, architecture rules, state management, form standards, typing, animation rules, and UI conventions without omitting any detail, so you can safely overwrite your existing file.
```markdown
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
├──types/property.ts              # Property Types Definition
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
    ├── api-client.ts             # Axios / Fetch client wrapper for backend API calls
    ├── animations.ts             # GSAP animation timeline builders & accessibility checks
    └── validations/              # Zod Schema Definitions
        ├── searchSchema.ts       # Search filter parameter validation schema
        ├── conciergeSchema.ts    # Concierge lead capture validation schema
        └── landlordSchema.ts     # Landlord registration & intake validation schema

```
## 💻 3. React & TypeScript Coding Conventions
### 3.1 Strict Client Directive Rules
 * Append 'use client'; **only** at the very top of files that utilize browser events, DOM references (useRef), React hooks (useState, useEffect), form controllers, or GSAP animation triggers.
 * Keep server components as default wherever possible to preserve SEO performance and reduce initial JavaScript payload size.
### 3.2 Component Declaration & Structure
 * Use named functional components or explicit export standards.
 * Always explicitly type component props using TypeScript interface or type aliases. Never use any.
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
## 📝 4. Form Handling & Zod Validation Standards
### 4.1 Form Principles
 * **State Engine:** All interactive forms must utilize react-hook-form paired with @hookform/resolvers/zod.
 * **Component Rendering:** Forms must strictly render using shadcn/ui wrappers (<Form>, <FormField>, <FormItem>, <FormLabel>, <FormControl>, <FormMessage>).
 * **Validation Schemas:** Every form schema must be located inside lib/validations/ and export a reusable TypeScript type via z.infer.
### 4.2 Standard Validation Schema Example (lib/validations/searchSchema.ts)
```typescript
import * as z from 'zod';

export const nigerianPhoneRegex = /^(\+234|0)[789][01]\d{8}$/;

export const searchFilterSchema = z.object({
  location: z.string().min(2, { message: 'Please select or enter a valid location' }),
  propertyType: z.enum(['apartment', 'duplex', 'terrace', 'penthouse', 'land', 'any']),
  minPrice: z.number().min(0, { message: 'Min price cannot be negative' }),
  maxPrice: z.number().min(0, { message: 'Max price must be greater than zero' }),
  bedrooms: z.string(),
});

export type SearchFilterValues = z.infer<typeof searchFilterSchema>;

```
## 🎬 5. GSAP Animation & Accessibility Rules
### 5.1 GSAP Lifecycle & Cleanup
 * Always execute GSAP animations inside @gsap/react useGSAP() hook to guarantee automatic lifecycle cleanup and prevent memory leaks during page navigation.
 * Always check browser motion preferences before initiating scroll-triggered timelines using prefersReducedMotion().
### 5.2 GSAP Animation Helper Standard (lib/animations.ts)
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
## ⚙️ 6. Code Quality, Imports & Path Aliases
### 6.1 Import Order Conventions
Organize imports in the following strict order, separated by blank lines:
 1. React core and Next.js built-ins (react, next/font, next/image, next/navigation).
 2. Third-party libraries (gsap, lucide-react, react-hook-form, zod).
 3. Internal shadcn/ui primitives (@/components/ui/...).
 4. Internal domain components (@/components/...).
 5. Utility helpers, schemas, and types (@/lib/...).
### 6.2 Path Alias Standard
Always use configured TypeScript path aliases instead of relative imports:
 * @/components/* maps to ./components/*
 * @/lib/* maps to ./lib/*
 * @/app/* maps to ./app/*
*(Example: Import import { Button } from '@/components/ui/button' instead of import { Button } from '../../components/ui/button')*.
```

---

```
