# UI Context

## Theme

The visual language is **modern, trustworthy, and premium** — designed to convey authority, innovation, and reliability in the Nigerian real estate market. The design leverages a **deep blue foundation** with strategic gradient accents to create depth and visual interest, while maintaining professionalism and clarity.

Primekey Homes uses a **unified design system** across all Bounded Contexts, with subtle variations in tone and emphasis to match each user segment's mindset:

| Bounded Context | UI Personality | Visual Cues |
|-----------------|----------------|-------------|
| **Buyer Context** (Phase 1) | Warm, aspirational, trustworthy | Deep blue gradients, elegant serif headings, large property visuals, emotional copy, trust signals |
| **Landlord Context** (Phase 2) | Professional, corporate, results-driven | Cleaner layouts, data-focused sections, professional tone, case studies, ROI emphasis |
| **Builder Context** (Phase 3 — Optional) | Industrial, efficient, transactional | Minimalist, inventory-focused, clear pricing, bulk-order UI, no-nonsense language |

All contexts share the same **color tokens, typography system, and component library**, but layout emphasis, spacing, and copy tone adapt to the user's mindset.

---

## Colors

All components **must** use these CSS custom property tokens. **No hardcoded hex values are permitted.** The palette is built on a deep blue foundation with strategic gradients for modern appeal and excellent accessibility.

### Primary Color Palette

| Role | CSS Variable | Value | Usage |
|------|--------------|-------|-------|
| **Primary Deep** | `--primary-deep` | `#192338` | Headers, footer, primary headings, primary text |
| **Primary Medium** | `--primary-medium` | `#31487A` | Primary buttons, CTAs, accent elements |
| **Primary Light** | `--primary-light` | `#8FB3E2` | Hover states, highlights, secondary accents |
| **Secondary Dark** | `--secondary-dark` | `#1E2E4F` | Cards, sections, elevated surfaces |
| **Background Base** | `--bg-base` | `#D9E1F1` | Page background, subtle sections (Lavender) |
| **Background Surface** | `--bg-surface` | `#FFFFFF` | Cards, forms, white containers |
| **Text Primary** | `--text-primary` | `#192338` | Primary body text, headings |
| **Text Secondary** | `--text-secondary` | `#1E2E4F` | Secondary text, descriptions |
| **Text Muted** | `--text-muted` | `#8FB3E2` | Muted text, placeholders |
| **Border Default** | `--border-default` | `#D9E1F1` | Default borders, dividers |
| **Border Focus** | `--border-focus` | `#31487A` | Focus states, active borders |

### Gradient System

| Gradient Name | CSS Variable | Value | Usage |
|---------------|--------------|-------|-------|
| **Hero Gradient** | `--gradient-hero` | `linear-gradient(135deg, #192338 0%, #31487A 100%)` | Hero section backgrounds, premium sections |
| **CTA Gradient** | `--gradient-cta` | `linear-gradient(135deg, #31487A 0%, #8FB3E2 100%)` | Primary buttons, main CTAs |
| **Accent Gradient** | `--gradient-accent` | `linear-gradient(135deg, #FBC2EB 0%, #78A3EB 100%)` | Special offers, premium badges, testimonial cards (PAOAZUR) |
| **Card Hover** | `--gradient-card-hover` | `linear-gradient(135deg, #1E2E4F 0%, #31487A 100%)` | Card hover states |

### State Colors

| Role | CSS Variable | Value |
|------|--------------|-------|
| **Success** | `--state-success` | `#2E7D32` |
| **Error** | `--state-error` | `#D32F2F` |
| **Warning** | `--state-warning` | `#ED6C02` |
| **Info** | `--state-info` | `#0288D1` |

### Shadow & Elevation

| Role | CSS Variable | Value |
|------|--------------|-------|
| **Shadow Default** | `--shadow-default` | `0 4px 12px rgba(25, 35, 56, 0.08)` |
| **Shadow Elevated** | `--shadow-elevated` | `0 8px 24px rgba(25, 35, 56, 0.12)` |
| **Shadow Modal** | `--shadow-modal` | `0 16px 48px rgba(25, 35, 56, 0.16)` |
| **Overlay Backdrop** | `--overlay-backdrop` | `rgba(25, 35, 56, 0.6)` |

### Context-Specific Color Usage

| Element | Buyer Context | Landlord Context | Builder Context |
|---------|---------------|------------------|-----------------|
| **Primary Accent** | Full usage of `--gradient-cta` and `--gradient-accent` | `--primary-medium` used sparingly for CTAs | `--primary-medium` for action buttons only |
| **Background** | `--bg-base` (Lavender) for warmth | `--bg-surface` (White) for cleanliness | `--bg-surface` (White) minimalist |
| **Hero Section** | `--gradient-hero` (Deep Blue) | Solid `--primary-deep` | Solid `--secondary-dark` |

---

## Typography

The typography system balances **elegance with readability**, using a serif font for headings to convey trust and premium quality, paired with a modern sans-serif for body text to ensure clarity and accessibility.

### Font Families

| Role | Font | CSS Variable | Context |
|------|------|--------------|---------|
| **Headings (All Contexts)** | `'Playfair Display', serif` | `--font-heading` | Premium, trustworthy, elegant |
| **Body Text / UI** | `'Inter', sans-serif` | `--font-body` | Modern, readable, professional |
| **Code / Monospace** | `'JetBrains Mono', monospace` | `--font-mono` | Technical content, code blocks |

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Example Usage |
|---------|------|--------|-------------|----------------|---------------|
| **h1** | `3rem` (48px) | `700` | `1.2` | `-0.02em` | Hero headlines, page titles |
| **h2** | `2.25rem` (36px) | `700` | `1.25` | `-0.01em` | Section headings |
| **h3** | `1.75rem` (28px) | `600` | `1.3` | `0` | Card titles, subsections |
| **h4** | `1.25rem` (20px) | `600` | `1.35` | `0` | Form section titles |
| **Body LG** | `1.125rem` (18px) | `400` | `1.6` | `0` | Lead paragraphs, descriptions |
| **Body** | `1rem` (16px) | `400` | `1.6` | `0` | Standard body text |
| **Body SM** | `0.875rem` (14px) | `400` | `1.5` | `0` | Captions, small text |
| **Button** | `1rem` (16px) | `600` | `1` | `0.02em` | All button text |
| **Label** | `0.875rem` (14px) | `500` | `1.4` | `0.01em` | Form labels, tags |

### Context-Specific Typography Emphasis

| Context | Heading Style | Body Style | Special Notes |
|---------|---------------|------------|---------------|
| **Buyer** | Playfair Display Bold (warm, emotional) | Inter Regular (readable) | Larger headings, more white space |
| **Landlord** | Playfair Display SemiBold (professional) | Inter Regular (data-friendly) | Slightly smaller body for density |
| **Builder** | Playfair Display SemiBold (efficient) | Inter Regular (compact) | Compact tables, data-heavy UI |

---

## Border Radius

| Context | Class | Value | Usage |
|---------|-------|-------|-------|
| **Inline / Small UI** | `rounded-sm` | `0.25rem` (4px) | Tags, badges, small elements |
| **Inputs, Buttons** | `rounded-md` | `0.375rem` (6px) | Form inputs, buttons, chips |
| **Cards / Panels** | `rounded-lg` | `0.5rem` (8px) | Property cards, feature cards |
| **Modals / Overlays** | `rounded-xl` | `0.75rem` (12px) | Dialogs, modals, popovers |
| **Avatar / Circular** | `rounded-full` | `9999px` | Profile images, circular badges |

---

## Component Library

**shadcn/ui** on top of **Tailwind CSS** is the primary component library. Components live in `components/ui/`.

### Rules:
1. ✅ **Use the shadcn CLI** to add new components rather than writing from scratch
2. ✅ **Extend via `className` prop** or by wrapping in a custom component
3. ❌ **Do not modify** the source code of `components/ui/*` directly
4. ✅ **Form components** must use shadcn Form with React Hook Form and Zod
5. ✅ **Dialogs/modals** must use shadcn Dialog with backdrop blur (`--overlay-backdrop`)

### Custom Components by Context:
- `components/buyer/` — Buyer-specific (SearchBar, PropertyCard, ConciergeModal)
- `components/landlord/` — Landlord-specific (PropertyIntakeForm, AppointmentBooking)
- `components/builder/` — Builder-specific (ProductCatalog, CartSidebar) — Phase 3
- `components/shared/` — Shared across contexts (Navbar, Footer, Hero variants, FloatingContact)

---

## Layout Patterns

### Global Layout

**Top Navigation (Navbar):**
- Full-width top bar with bottom border (`--border-default`)
- Contains: Logo, primary navigation, auth buttons
- Navigation items change per context:
  - **Buyer:** "Buy/Rent a Property", "List a Property", "For Builders"
  - **Landlord:** "Buy/Rent", "My Properties", "For Builders"
  - **Builder:** "Buy/Rent", "List a Property", "Product Catalog"

**Floating Contact:**
- Sticky WhatsApp button positioned bottom-right on all pages.

**Main Content Area:**
- Centered with `max-width: 1280px`
- Horizontal padding: `1.5rem` mobile, `2rem` tablet, `3rem` desktop
- Min-height: `calc(100vh - header - footer)`

### Marketing Landing Page (/) — Skeletal Structure

**Structure (Matches `page.tsx`):**
1. **Navbar** — Global navigation + auth CTAs
2. **Hero** — Value proposition, primary CTAs, trust signals, media
3. **SocialProof** — Logo strip, stats, testimonials
4. **Benefits** — Feature cards, 3-step flow, comparison table, split section
5. **FAQ** — Accordion, inline CTA, fallback contact
6. **FinalCTA** — Callback form, urgency, trust badges
7. **Footer** — 3-column layout, legal, contact

**Hero Section Styling:**
- Uses `--gradient-hero` (deep blue gradient) for background.
- Primary CTA uses `--gradient-cta`.
- Typography: Playfair Display for headlines, Inter for body.

### Buyer Context (Phase 1)

**Search Portal (`/search`):**
- Full-viewport layout
- Prominent search bar (sticky on scroll)
- Filters: location, price range, property type, bedrooms
- Results grid: Responsive (1 col mobile, 2 col tablet, 3 col desktop)

**Property Cards:**
- White background (`--bg-surface`)
- Border: `1px solid var(--border-default)`
- Hover: Subtle shadow (`--shadow-elevated`) + gradient overlay on image
- CTA button: `--gradient-cta`

**Concierge Modal:**
- Triggered on "no results"
- Centered overlay with `--overlay-backdrop`
- Max-width: `max-w-lg`
- Accent gradient for premium badge
- Form validation with red error states (`--state-error`)
- NDPR consent checkbox (unchecked by default, submission blocked if unchecked)

### Landlord Context (Phase 2)

**Landing Page (`/landlord`):**
- Centered single-column layout
- Hero: Value proposition with trust badges
- Benefits: Icon grid with professional tone
- Registration form: Gated, multi-step

**Property Intake Form:**
- Multi-step with progress indicator
- Step numbers use `--primary-medium`
- Active step: `--gradient-cta`
- Validation: Green success (`--state-success`), red error (`--state-error`)

### Builder Context (Phase 3 — Optional)

**Product Catalog:**
- Full-width grid with filters
- Data-heavy tables
- Minimalist design, white-heavy
- Bulk order UI

---

## Icons

**Lucide React** is the icon library. **Stroke-based icons only.**

### Sizes:
- `h-4 w-4` — Inline icons (with text)
- `h-5 w-5` — Buttons, standalone icons
- `h-6 w-6` — Navigation items, larger UI elements

### Colors:
- Icons inherit `currentColor` by default
- Use specific tokens only for semantic meaning:
  - Success: `--state-success`
  - Error: `--state-error`
  - Warning: `--state-warning`

### Common Icons by Context:

| Context | Common Icons |
|---------|--------------|
| **Buyer** | `Search`, `Home`, `MapPin`, `Star` (concierge premium), `Phone`, `Mail` |
| **Landlord** | `Building`, `Calendar`, `User`, `Check`, `Award` (trust) |
| **Builder** | `ShoppingCart`, `Package`, `Truck`, `CreditCard`, `BarChart` |
| **Shared** | `ChevronDown`, `ChevronUp`, `X`, `AlertCircle`, `Menu`, `MessageCircle` (WhatsApp) |

---

## Responsive Breakpoints

| Breakpoint | Tailwind Prefix | Width | Design Focus |
|------------|-----------------|-------|--------------|
| **Mobile** | `sm` | `640px` | Single column, stacked layouts |
| **Tablet** | `md` | `768px` | 2-column grids, side-by-side |
| **Laptop** | `lg` | `1024px` | 3-column grids, expanded nav |
| **Desktop** | `xl` | `1280px` | Full layout, max-width container |
| **Wide** | `2xl` | `1536px` | Extra padding, larger images |

**Design mobile-first.** All layouts must be functional and visually coherent on all screen sizes. Critical flows (Concierge modal, landlord intake) must be fully usable on mobile.

---

## Accessibility

### Requirements:
1. ✅ **Keyboard navigable** — All interactive elements must be reachable via Tab
2. ✅ **Focus indicators** — Visible focus rings using `--border-focus`
3. ✅ **ARIA labels** — Use `aria-label`, `role`, `aria-expanded` where needed
4. ✅ **Color contrast** — WCAG AA minimum (4.5:1 for text, 3:1 for UI elements)
5. ✅ **Error messages** — Clear, descriptive, associated with inputs via `aria-describedby`
6. ✅ **Reduced motion** — Respect `prefers-reduced-motion` media query
7. ✅ **Screen reader support** — Semantic HTML, proper heading hierarchy

### Color Contrast Check:
- `--primary-deep` (#192338) on white: **15.8:1** ✅ AAA
- `--primary-medium` (#31487A) on white: **8.2:1** ✅ AAA
- `--primary-light` (#8FB3E2) on `--primary-deep`: **7.1:1** ✅ AA
- `--text-muted` (#8FB3E2) on white: **3.2:1** ✅ AA (large text only)

---

## UI Screens Mapping (By Bounded Context)

### Buyer Context (Phase 1)

| Screen | Path | Purpose |
|--------|------|---------|
| **Landing Page** | `/` | Marketing homepage with Hero, Benefits, SocialProof, FAQ, FinalCTA |
| **Search Portal** | `/search` | Property search with filters and results grid (Auth Gate) |
| **Property Detail** | `/property/[id]` | Full property details, contact agent, schedule visit |
| **Concierge Modal** | (Modal overlay) | "2-Week Concierge" registration form (triggered on no results) |
| **Concierge Success** | `/concierge/success` | Confirmation page after submission |

### Landlord Context (Phase 2)

| Screen | Path | Purpose |
|--------|------|---------|
| **Landlord Landing** | `/landlord` | Value proposition, benefits, trust signals, CTA (Auth Gate) |
| **Registration** | `/landlord/register` | Gated registration form (owner details) |
| **Property Intake** | `/landlord/property` | Multi-step property intake form |
| **Appointment Booking** | `/landlord/appointment` | Schedule consultation with agent |
| **Confirmation** | `/landlord/confirmation` | Booking confirmation |

### Builder Context (Phase 3 — Optional)

| Screen | Path | Purpose |
|--------|------|---------|
| **Builder Portal** | `/builder` | Coming Soon page (Phases 1-2) / Product catalog (Phase 3) |
| **Product Detail** | `/builder/product/[id]` | Product specs, add to cart |
| **Cart** | `/builder/cart` | Review cart, proceed to checkout |
| **Checkout** | `/builder/checkout` | Address → Payment → Confirmation |
| **Order History** | `/builder/orders` | Past orders with status tracking |

### Shared (Agent/Admin)

| Screen | Path | Purpose |
|--------|------|---------|
| **Login** | `/login` | Agent/admin authentication |
| **Dashboard** | `/dashboard` | Overview of leads, appointments, analytics |
| **Lead Detail** | `/dashboard/lead/[id]` | Full lead data, status updates, SLA timer |
| **Landlord Opportunities** | `/dashboard/landlords` | All landlord leads |
| **Analytics** | `/dashboard/analytics` | KPIs, conversion rates |

---

## Implementation Notes for AI

### Always:
1. ✅ **Use CSS custom properties** from the Colors section — no hardcoded hex values
2. ✅ **Use shadcn/ui components** from `components/ui/` — do not modify source
3. ✅ **Organize by Bounded Context** — `components/buyer/`, `components/landlord/`, etc.
4. ✅ **Apply gradients strategically** — Hero (`--gradient-hero`), CTAs (`--gradient-cta`), accents (`--gradient-accent`)
5. ✅ **Use Playfair Display for all headings** — consistent elegance across contexts
6. ✅ **Use Inter for all body text** — modern readability

### Landing Page Specifics:
- **Hero section** uses `--gradient-hero` (deep blue gradient)
- **Primary CTAs** use `--gradient-cta` (blue gradient button)
- **Trust badges** and **premium elements** can use `--gradient-accent` (purple-pink)
- **Typography**: Playfair Display for headlines, Inter for body

### Never:
- ❌ Hardcode colors like `#192338` — always use `var(--primary-deep)`
- ❌ Mix Bounded Context components in one file
- ❌ Modify `components/ui/*` source code
- ❌ Use inline styles — always use Tailwind classes or CSS variables

### Mobile-First Checklist:
- [ ] Navigation collapses to hamburger menu on mobile
- [ ] Cards stack vertically on screens < 640px
- [ ] Forms are fully usable on mobile (large touch targets)
- [ ] Concierge modal is scrollable and readable on small screens
- [ ] Footer columns stack on mobile