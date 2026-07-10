# UI Context

## Theme

The visual language is professional, trustworthy, and modern — designed to convey authority and reliability in the Nigerian real estate market. The design is clean and content-forward, with a warm, neutral palette accented by a bold primary color for calls-to-action and interactive elements.

While the platform shares a unified brand and a single Intent Gateway, **each Bounded Context has its own UI personality** tailored to its user segment's mindset and expectations:

| Bounded Context | UI Personality | Visual Cues |
|-----------------|----------------|-------------|
| **Buyer Context** (Phase 1) | Consumer, warm, trustworthy | Soft colors, friendly typography, large property visuals, emotional copy, trust signals (testimonials, security badges) |
| **Landlord Context** (Phase 2) | Professional, corporate, trust-signals | Clean layouts, professional colors, trust badges, clear value proposition, formal language, data-heavy forms |
| **Builder Context** (Phase 3 — Optional) | Industrial, efficient, transactional | Minimalist, data-heavy, fast-loading, clear pricing and inventory indicators, no-nonsense language |

All contexts share the same color tokens and component library, but layout, spacing, typography emphasis, and tone of copy may differ to match the user's mindset.

---

## Colors

All components must use these CSS custom property tokens. No hardcoded hex values are permitted. The palette is designed to be warm, trustworthy, and accessible, with clear contrast ratios for text and interactive elements.

| Role                 | CSS Variable            | Value    |
| -------------------- | ----------------------- | -------- |
| Page background      | `--bg-base`             | `#f8f6f2` |
| Surface / Card       | `--bg-surface`          | `#ffffff` |
| Elevated surface     | `--bg-elevated`         | `#f0ede8` |
| Primary text         | `--text-primary`        | `#1a1a1a` |
| Secondary text       | `--text-secondary`      | `#4a4a4a` |
| Muted text           | `--text-muted`          | `#8a8a8a` |
| Primary accent       | `--accent-primary`      | `#c73d2f` |
| Accent hover         | `--accent-hover`        | `#a83226` |
| Accent light         | `--accent-light`        | `#fbe9e6` |
| Border default       | `--border-default`      | `#e0dbd4` |
| Border focus         | `--border-focus`        | `#c73d2f` |
| State error          | `--state-error`         | `#d32f2f` |
| State success        | `--state-success`       | `#2e7d32` |
| State warning        | `--state-warning`       | `#ed6c02` |
| State info           | `--state-info`          | `#0288d1` |
| Link text            | `--link-default`        | `#c73d2f` |
| Link hover           | `--link-hover`          | `#a83226` |
| Shadow               | `--shadow-default`      | `0 4px 12px rgba(0,0,0,0.08)` |
| Shadow elevated      | `--shadow-elevated`     | `0 8px 24px rgba(0,0,0,0.12)` |
| Overlay backdrop     | `--overlay-backdrop`    | `rgba(0,0,0,0.4)` |

### Context-Specific Color Usage

| Element | Buyer Context | Landlord Context | Builder Context |
|---------|---------------|------------------|-----------------|
| **Primary accent** | Full `--accent-primary` usage | Accent used sparingly (professional) | Accent used for CTAs only |
| **Background** | Warm (`#f8f6f2`) | Cooler, cleaner (`#f5f5f5`) | Minimalist, white-heavy (`#ffffff`) |
| **Typography** | Friendly, approachable | Clean, formal | Compact, data-heavy |

---

## Typography

The typography system balances readability with a professional, refined aesthetic. A serif font is used for headings in the Buyer Context to convey trust and elegance, while sans-serif is used for Landlord and Builder contexts for clarity and efficiency.

| Role                | Font                          | Variable      |
| ------------------- | ----------------------------- | ------------- |
| Headings (Buyer)    | Georgia (or Playfair Display) | `--font-serif` |
| Headings (Landlord) | Inter (sans-serif)            | `--font-sans` |
| Body text / UI      | Inter (sans-serif)            | `--font-sans` |
| Code / monospace    | JetBrains Mono                | `--font-mono` |

**Type Scale** (using Inter for body):

| Element | Size  | Weight | Line Height |
| ------- | ----- | ------ | ----------- |
| h1      | 2.5rem | 700    | 1.2         |
| h2      | 2rem   | 600    | 1.25        |
| h3      | 1.5rem | 600    | 1.3         |
| h4      | 1.25rem| 600    | 1.35        |
| body-lg | 1.125rem| 400   | 1.6         |
| body    | 1rem   | 400    | 1.6         |
| body-sm | 0.875rem| 400   | 1.5         |
| caption | 0.75rem | 400    | 1.4         |
| button  | 0.875rem| 500    | 1           |

### Context-Specific Typography Emphasis

| Context | Emphasis |
|---------|----------|
| **Buyer** | Serif for headings (warmth, trust), larger body text for readability |
| **Landlord** | Sans-serif throughout (professional), body text slightly smaller (data-heavy) |
| **Builder** | Sans-serif throughout (efficient), compact typography for data tables |

---

## Border Radius

| Context                     | Class         |
| --------------------------- | ------------- |
| Inline / small UI elements  | `rounded-sm`  |
| Inputs, buttons, tags       | `rounded-md`  |
| Cards / panels / containers | `rounded-lg`  |
| Modals / overlays / dialogs | `rounded-xl`  |
| Avatar / circular elements  | `rounded-full` |

---

## Component Library

- **shadcn/ui** on top of Tailwind CSS is the primary component library. Components live in `components/ui/`.
- Use the shadcn CLI to add new components rather than writing from scratch. This ensures consistency and accessibility compliance.
- Extend components via `className` prop or by wrapping in a custom component. **Do not modify the source code of `components/ui/*` directly.**
- Form components (inputs, selects, checkboxes, textareas) must use the shadcn Form component with React Hook Form and Zod for validation.
- Dialogs/modals must use the shadcn Dialog component with a backdrop blur overlay.

---

## Layout Patterns

### Global Layout

- **Top Navigation**: Full-width top bar with bottom border, containing the brand logo and primary navigation links. Navigation items dynamically change based on the active Bounded Context:
  - **Buyer Context**: "Search Properties"
  - **Landlord Context**: "List Your Property"
  - **Builder Context**: "Shop Materials" (Phase 3)
- **Main Content Area**: Centered with a max-width of `1280px` and horizontal padding.

### Intent Gateway (Landing Page)

- **Hero Section**: Full-width with the question: "What are you looking for?"
- **Two Clear Cards**: "Buy/Rent a Property" (Buyer Context) and "I am a Landlord/Owner" (Landlord Context). Builder is hidden (Phase 3 optional).
- **Cards**: Visually distinct, with icons, short descriptions, and clear CTAs.
- **Mobile Responsive**: Cards stack vertically on small screens.

### Buyer Context (Phase 1)

- **Search Portal**: Full-viewport layout with a prominent search bar (location, price range, property type, bedrooms) above the results grid.
- **Search Bar**: Sticky on scroll.
- **Results Grid**: Responsive property cards (1 column mobile, 2 columns tablet, 3 columns desktop).
- **"Not Found" → Concierge Modal**: Centered modal dialog with backdrop blur overlay. Modal has a clear title ("Unlock Off-Market Concierge Search"), a brief description of the service, and a multi-field registration form. A "No thanks" link is visible but de-emphasized. The modal blocks navigation until dismissed or submitted.
- **Concierge Form**: All fields validated. NDPR consent checkbox (unchecked by default). Submit button disabled until all required fields are valid.

### Landlord Context (Phase 2)

- **Landing Page**: Centered single-column layout with a hero section showcasing the value proposition (benefits icons, trust signals), followed by a gated registration form.
- **Property Intake Form**: Multi-step form with progress indicators, capturing detailed property data.
- **Appointment Booking**: Calendar view showing agent availability, time slot selection, and confirmation.

### Builder Context (Phase 3 — Optional)

- **Product Catalog**: Full-width grid with filters, search, and pagination.
- **Product Detail**: Specs, pricing, images, "Add to Cart" button.
- **Cart Sidebar**: Sticky on desktop, accessible from any page.
- **Checkout Flow**: Multi-step (Address → Payment → Confirmation).
- **Order History**: List of past orders with status tracking.

### Agent/Admin Dashboard (Shared)

- **Sidebar Navigation**: Leads (Concierge), Landlord Opportunities, Orders (Builder — Phase 3), Analytics.
- **Main Content Area**: Tables and summary cards.
- **Lead Detail View**: All data, status updates, SLA timer.

---

## Modals

- Centered overlay with backdrop blur (`--overlay-backdrop`).
- Max-width: `max-w-lg` for forms, `max-w-2xl` for larger content.
- Close button (X) in the top-right corner.
- **Concierge Modal**: Blocks navigation until dismissed or submitted.

---

## Forms

- All forms use shadcn's Form component.
- Clear labels, validation errors below each field.
- Primary action button (e.g., "Submit", "Register", "Complete Checkout") at the bottom.
- **NDPR Consent Checkbox**: Unchecked by default. Blocked submission if unchecked. Link to Privacy Policy.

---

## Icons

- **Lucide React** is the icon library. Stroke-based icons only.
- **Sizes**: `h-4 w-4` for inline icons (with text), `h-5 w-5` for buttons and standalone icons, `h-6 w-6` for navigation items and larger UI elements.
- **Colors**: Icons should inherit the current text color via `currentColor`. Use specific color tokens only when the icon has a semantic meaning (e.g., error, success).

### Common Icons by Context

| Context | Common Icons |
|---------|--------------|
| **Buyer** | `Search`, `Home`, `MapPin`, `Star` (concierge premium), `Phone`, `Mail` |
| **Landlord** | `Building`, `Calendar`, `User`, `Check`, `Award` (trust) |
| **Builder** | `ShoppingCart`, `Package`, `Truck`, `CreditCard`, `BarChart` |
| **Shared** | `ChevronDown`, `ChevronUp`, `X`, `AlertCircle`, `Menu` |

---

## Responsive Breakpoints

| Breakpoint | Tailwind Prefix | Width     |
| ---------- | --------------- | --------- |
| Mobile     | `sm`            | `640px`   |
| Tablet     | `md`            | `768px`   |
| Laptop     | `lg`            | `1024px`  |
| Desktop    | `xl`            | `1280px`  |
| Wide       | `2xl`           | `1536px`  |

**Design mobile-first.** All layouts must be functional and visually coherent on mobile, tablet, and desktop screens. The "2-Week Concierge" modal and the landlord intake form are critical flows that must be fully usable on mobile devices.

---

## Accessibility

- All interactive elements must be keyboard-navigable (tab order, focus indicators).
- Use `aria-label` and `role` attributes where semantic HTML is insufficient.
- Ensure color contrast ratios meet WCAG AA standards for all text and interactive elements.
- Provide clear, descriptive error messages for form validation.
- Use `prefers-reduced-motion` to respect user settings.

---

## UI Screens Mapping (By Bounded Context)

### Buyer Context (Phase 1)

| Screen | Path | Purpose |
|--------|------|---------|
| Intent Gateway | `/` | Landing page with pathway selection |
| Search Portal | `/search` | Search with filters and results grid |
| Property Detail | `/property/[id]` | Full property details, contact agent |
| Concierge Modal | (Modal overlay) | "2-Week Concierge" registration form |
| Concierge Success | `/concierge/success` | Confirmation page after submission |

### Landlord Context (Phase 2)

| Screen | Path | Purpose |
|--------|------|---------|
| Landlord Landing | `/landlord` | Value proposition, benefits, CTA |
| Registration | `/landlord/register` | Gated registration form |
| Property Intake | `/landlord/property` | Multi-step property intake form |
| Appointment Booking | `/landlord/appointment` | Schedule consultation with agent |
| Confirmation | `/landlord/confirmation` | Booking confirmation |

### Builder Context (Phase 3 — Optional)

| Screen | Path | Purpose |
|--------|------|---------|
| Builder Portal | `/builder` or `shop.yourcompany.com` | Product catalog |
| Product Detail | `/builder/product/[id]` | Product specs, add to cart |
| Cart | `/builder/cart` | Review cart, proceed to checkout |
| Checkout | `/builder/checkout` | Address, payment, confirmation |
| Order History | `/builder/orders` | Past orders with status |

### Shared (Agent/Admin)

| Screen | Path | Purpose |
|--------|------|---------|
| Login | `/login` | Agent/admin authentication |
| Dashboard | `/dashboard` | Overview of leads, appointments, orders |
| Lead Detail | `/dashboard/lead/[id]` | Full lead data, status updates |
| Landlord Opportunities | `/dashboard/landlords` | All landlord leads |
| Analytics | `/dashboard/analytics` | KPIs, conversion rates |

---

## Implementation Notes for Aider

- Always use the CSS custom properties from the Colors section. No hardcoded hex values.
- Use shadcn/ui components from `components/ui/`. Do not modify them directly.
- Organize components by Bounded Context (`components/buyer/`, `components/landlord/`, `components/builder/`).
- The Intent Gateway must clearly distinguish between Buyer and Landlord. Builder is hidden (Phase 3 optional).
- The Concierge Modal must block navigation until dismissed or submitted.
- All forms must have NDPR consent checkboxes (unchecked by default, submission blocked if unchecked).
- Mobile-first design — test on small screens before desktop.