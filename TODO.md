# Backend Admin UI/UX Makeover Plan

## Design Inspiration: Frontend → Backend Visual Consistency

The frontend uses a premium real-estate aesthetic built on **Navy (`#04164a`)** + **Soft Lavender (`#f3f0ff`)** with **Poppins** headings, **Lora** body text, frosted-glass cards, and pill-shaped CTAs. The backend admin should mirror this identity.

---

## Key Design Tokens (from Frontend)

| Token | Value | Usage |
|-------|-------|-------|
| Primary Navy | `#04164a` | Sidebar, buttons, headings, KPI cards |
| Medium Navy | `#1d326f` | Hover states, gradient endpoints |
| Light Blue Accent | `#8FB3E2` | Focus rings, info badges |
| Lavender Background | `#f3f0ff` | Admin body background |
| Lavender Border | `#e4e0f5` | Card borders, input borders |
| White Surface | `#ffffff` | Cards, modals, elevated surfaces |
| Muted Text | `#4a607a` | Secondary/body text |
| Success Green | `#1b5e20` | Approved/active states |
| Error Red | `#c62828` | Destructive/breached states |
| Warning Orange | `#e65100` | Pending/warning states |
| Info Blue | `#0277bd` | Info/neutral states |
| Hero Gradient | `135deg, #04164a → #1d326f` | Login page, header backgrounds |
| Accent Gradient | `135deg, #FBC2EB → #78A3EB` | Decorative accents |
| Font Heading | Poppins (600, 700) | Admin headings, badges |
| Font Body | Lora (400, 500) | Admin body text, labels |
| Border Radius | `0.5rem` (8px) base | Cards, inputs, buttons |
| Card Pattern | `bg-white/90 backdrop-blur-sm border-purple-100` | Frosted glass cards |
| Hover Lift | `hover:shadow-xl hover:-translate-y-1 transition-all` | Interactive cards |

---

## Current State
- Django Unfold 0.102.0 already installed and configured
- Custom dashboard with KPI cards and Chart.js charts
- Status badges using Unfold's `@display` decorator
- Basic sidebar navigation defined
- No custom CSS/JS files — relying entirely on Unfold defaults
- Login page is Unfold default (no branding)

---

## Phase 1: Enhanced UNFOLD Configuration (`settings.py`)

### 1.1 Color Palette — Match Frontend Navy/Lavender Identity
- [x] Replace current sky-blue palette with navy-to-lavender palette matching frontend
- [x] Map success/warning/danger/info to frontend state colors

### 1.2 Branding & Identity
- [x] Reference the frontend SVG logo as `SITE_ICON`
- [x] Set `SITE_SYMBOL` to `"home"` (Material icon for consistency)
- [x] Configure login page with gradient background matching `--gradient-hero`

### 1.3 Sidebar — Lavender-Tinted with Navy Accents
- [x] Add `show_history: True` for recent action visibility
- [x] Add `show_notifications: True` for in-admin notifications
- [x] Group sections with clear visual hierarchy matching frontend nav
- [ ] Add badge counts to sidebar items (e.g., pending leads, pending intakes)

### 1.4 Footer
- [ ] Add custom footer: "Primekey Homes Backoffice" with copyright
- [x] Set `preload_fonts` for Material Icons

---

## Phase 2: Custom CSS — `core/static/admin/css/custom.css`

### 2.1 Body & Layout — Lavender Background
- [x] Set admin body background to `#f3f0ff` (lavender) matching frontend
- [x] Add custom scrollbar styling (thin, navy-tinted)
- [x] Set base font to Lora for body text via CSS override

### 2.2 KPI Cards — Frosted Glass Pattern
- [x] Apply frontend card pattern: `background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border: 1px solid #e4e0f5;`
- [x] Add `border-radius: 12px` (matching frontend `rounded-xl`)
- [x] Add hover lift: `transition: all 0.2s ease; &:hover { box-shadow: 0 10px 25px rgba(4,22,74,0.08); transform: translateY(-2px); }`
- [x] Add colored left border accent per KPI type (success/warning/danger)
- [x] Add subtle gradient overlay per card color

### 2.3 Buttons — Pill-Shaped CTAs
- [x] Style primary buttons: `background: #04164a; color: white; border-radius: 9999px; box-shadow: 0 2px 8px rgba(4,22,74,0.15);`
- [x] Add hover: `box-shadow: 0 4px 12px rgba(4,22,74,0.25); opacity: 0.95;`
- [x] Style secondary/outline buttons: `border: 1px solid rgba(4,22,74,0.2); color: #04164a; border-radius: 12px;`

### 2.4 Form Inputs — Rounded with Lavender Tint
- [x] Set input border-radius to `12px` matching frontend
- [x] Add focus ring: `box-shadow: 0 0 0 3px rgba(4,22,74,0.1); border-color: #1d326f;`
- [x] Style input backgrounds: `background: rgba(243,240,255,0.3);` (subtle lavender)

### 2.5 Fieldsets — Clean Section Separators
- [x] Add left border accent (`3px solid #04164a`) to fieldset headers
- [x] Increase fieldset header font weight and size
- [x] Add subtle background to fieldset containers

### 2.6 Tables & Lists — Alternating Rows
- [x] Add alternating row colors: `even: background rgba(243,240,255,0.3);`
- [x] Style table headers with navy background and white text
- [x] Add row hover effect: `background: rgba(143,179,226,0.08);`

### 2.7 Badges — Pill-Shaped Status Indicators
- [x] Override Unfold badge defaults to use `border-radius: 9999px`
- [x] Map badge colors to frontend state colors:
  - Success: `background: rgba(27,94,32,0.1); color: #1b5e20;`
  - Warning: `background: rgba(230,81,0,0.1); color: #e65100;`
  - Danger: `background: rgba(198,40,40,0.1); color: #c62828;`
  - Info: `background: rgba(2,119,189,0.1); color: #0277bd;`

### 2.8 Dark Mode — Navy-Based Dark Theme
- [x] Dark background: `#0a0f1e` (deep navy-black)
- [x] Dark surface: `#111827` (dark card background)
- [x] Dark borders: `rgba(143,179,226,0.15)` (subtle blue tint)
- [x] Ensure all badge colors have dark-mode contrast variants

---

## Phase 3: Custom JavaScript — `core/static/admin/js/custom.js`

### 3.1 Animations — GSAP-Inspired with CSS
- [x] Staggered fade-in for KPI cards on page load (CSS `@keyframes` + `animation-delay`)
- [x] Number count-up animation for KPI metrics using `IntersectionObserver`
- [ ] Smooth hover transitions on all interactive elements

### 3.2 UX Enhancements
- [x] Tooltip popovers on badge hover showing full status text
- [x] Keyboard shortcut: `Ctrl+S` to save forms
- [x] Smooth scroll behavior for in-page anchors
- [x] Auto-dismiss Django messages after 5 seconds with fade-out

---

## Phase 4: Dashboard Template Redesign (`core/templates/admin/index.html`)

### 4.1 KPI Cards — Richer Design
- [x] Add Material Icon per KPI (home_work, support_agent, warning, group, etc.)
- [x] Apply frosted glass pattern from frontend cards
- [x] Add colored top gradient bar per card
- [x] Add trend arrow (↑/↓) next to metric if comparison data available
- [x] Make cards clickable with hover lift effect

### 4.2 Pipeline Value — Hero Treatment
- [x] Apply hero gradient background: `linear-gradient(135deg, #04164a, #1d326f)`
- [x] White text on dark background (matching frontend hero pattern)
- [x] Add a subtle progress bar or visual gauge

### 4.3 Charts — Refined Styling
- [x] Match chart colors to frontend palette (navy, lavender, light blue)
- [x] Add rounded bar corners via Chart.js options
- [x] Improve responsive sizing
- [x] Add subtle grid lines with lavender color

### 4.4 Quick Actions Panel
- [x] Add action buttons matching frontend CTA style (pill-shaped, navy bg)
- [x] "Add Property", "View Leads", "Review Intakes" shortcuts

---

## Phase 5: Admin Class Improvements

### 5.1 Consistency Across All Admin Classes
- [ ] Add `save_on_top = True` to all ModelAdmin classes
- [ ] Ensure `list_filter_submit = True` everywhere
- [ ] Standardize `list_per_page = 50`

### 5.2 Fieldset Enhancements
- [ ] Review all fieldset groupings for clarity
- [ ] Add `classes = ("collapse",)` to metadata sections
- [ ] Use descriptive section headers matching frontend section titles

### 5.3 Enhanced List Displays
- [ ] Add `date_hierarchy = "created_at"` to all time-aware models
- [ ] Add custom admin actions:
  - ConciergeLead: bulk close, bulk assign
  - LandlordProfile: bulk approve, bulk reject
  - PropertyIntake: bulk approve

### 5.4 Inline Improvements
- [ ] PropertyImage inline: show thumbnail preview in list
- [ ] WhatsAppMessage inline: style direction badges inline

---

## Phase 6: Login Page — Branded Experience

### 6.1 Create `core/templates/admin/login.html`
- [ ] Full-page gradient background: `linear-gradient(135deg, #04164a, #1d326f)`
- [ ] Centered card with frosted glass effect: `bg-white/90 backdrop-blur-sm rounded-2xl`
- [ ] Primekey Homes SVG logo centered above form
- [ ] Tagline: "Backoffice Management Portal"
- [ ] Rounded inputs matching frontend style (`rounded-xl`, lavender focus ring)
- [ ] Pill-shaped submit button: `bg-[#04164a] text-white rounded-full`
- [ ] Subtle decorative elements (matching frontend hero glow pattern)

---

## Phase 7: Template-Level Polish

### 7.1 Base Template (`core/templates/admin/base_site.html`)
- [ ] Add custom favicon (from frontend public assets)
- [ ] Inject Google Fonts: Poppins (headings) + Lora (body)
- [ ] Add custom footer bar

### 7.2 Change Form
- [ ] Cleaner fieldset spacing
- [ ] Visual separators between sections

### 7.3 Delete Confirmation
- [ ] Warning banner with red accent
- [ ] Clearer messaging

---

## Phase 8: Performance & QA

### 8.1 Static File Setup
- [ ] Create directory structure: `core/static/admin/css/`, `core/static/admin/js/`
- [ ] Register in UNFOLD settings:
  ```python
  "STYLES": ["/static/admin/css/custom.css"],
  "SCRIPTS": ["/static/admin/js/custom.js"],
  ```
- [ ] Run `collectstatic` and verify
- [ ] Add cache-busting via file hash or query param

### 8.2 Final QA Checklist
- [ ] Light mode: all pages render correctly
- [ ] Dark mode: all pages render correctly
- [ ] Mobile responsive: sidebar collapses, cards stack
- [ ] Charts render with correct colors
- [ ] KPI card animations fire on load
- [ ] Login page shows branded gradient + logo
- [ ] All badges display correct colors
- [ ] Hover effects work on cards and buttons
- [ ] Custom fonts load (Poppins headings, Lora body)
- [ ] Cross-browser: Chrome, Firefox, Edge

---

## Files to Create/Modify

| File | Action | Priority |
|------|--------|----------|
| `backend/core/settings.py` | Enhance UNFOLD config, register CSS/JS | **HIGH** |
| `backend/core/static/admin/css/custom.css` | **CREATE** — all custom styles | **HIGH** |
| `backend/core/static/admin/js/custom.js` | **CREATE** — animations & interactivity | **MEDIUM** |
| `backend/core/templates/admin/index.html` | Redesign dashboard layout | **HIGH** |
| `backend/core/templates/admin/login.html` | **CREATE** — branded login page | **HIGH** |
| `backend/core/templates/admin/base_site.html` | **CREATE** — favicon & fonts | **MEDIUM** |
| `backend/apps/*/admin.py` | Minor improvements (save_on_top, actions) | **LOW** |

---

## Design Principles

1. **Visual Consistency** — Backend should feel like the same product as the frontend
2. **Navy Authority** — `#04164a` is the anchor color everywhere
3. **Lavender Softness** — `#f3f0ff` backgrounds reduce visual fatigue
4. **Frosted Glass** — `backdrop-blur` + transparency for modern elevation
5. **Pill Shapes** — Rounded-full buttons and badges for a friendly feel
6. **Subtle Motion** — Gentle animations, not overwhelming
7. **Dark Mode First** — Both themes must look polished
