# Backend Admin UI/UX Makeover Plan

## Current State
- Django Unfold 0.102.0 already installed and configured
- Custom dashboard with KPI cards and Chart.js charts
- Status badges using Unfold's `@display` decorator
- Basic sidebar navigation defined
- No custom CSS/JS files — relying entirely on Unfold defaults
- Login page is Unfold default (no branding)

---

## Phase 1: Enhanced UNFOLD Configuration (settings.py)

### 1.1 Upgrade Color Palette
- [ ] Replace the current sky-blue primary palette with a richer, more vibrant palette (e.g., indigo/violet gradient feel)
- [ ] Add accent color for hover states and interactive elements
- [ ] Add dark mode color overrides for better contrast

### 1.2 Branding & Identity
- [ ] Add a custom logo image (SVG recommended) displayed in sidebar and login
- [ ] Set `SITE_ICON` to a meaningful icon (e.g., a building/home icon)
- [ ] Customize the login page background with a branded image or gradient
- [ ] Add a custom favicon via template override

### 1.3 Sidebar Enhancements
- [ ] Add `show_history: True` for recent action visibility
- [ ] Add `show_notifications: True` for in-admin notifications
- [ ] Group apps with color-coded section headers
- [ ] Add badges to sidebar items (e.g., count of pending leads)

### 1.4 Footer & Misc
- [ ] Add a custom footer with copyright / version info
- [ ] Enable `show_full_result_count` globally
- [ ] Set `preload_fonts` for Material Icons

---

## Phase 2: Custom CSS Stylesheet

### 2.1 Create `core/static/admin/css/custom.css`
- [ ] Add smooth transitions and micro-animations on cards and buttons
- [ ] Style KPI cards with subtle gradients and hover lift effects
- [ ] Add custom scrollbar styling for a polished feel
- [ ] Improve typography: line-height, letter-spacing for readability
- [ ] Style action buttons (save, delete) with rounded corners and shadows
- [ ] Add a subtle background pattern or gradient to the admin body
- [ ] Improve fieldset headers with accent border-left
- [ ] Style read-only fields with a muted, clean look
- [ ] Add custom badge styles for status labels beyond Unfold defaults
- [ ] Improve inline editing tables with alternating row colors

### 2.2 Dark Mode Refinements
- [ ] Add dark mode overrides for custom styles
- [ ] Ensure KPI cards, charts, and badges look great in dark mode

---

## Phase 3: Custom JavaScript

### 3.1 Create `core/static/admin/js/custom.js`
- [ ] Add entrance animations for KPI cards (staggered fade-in)
- [ ] Add number count-up animation for KPI metrics on page load
- [ ] Add tooltip popovers on badge hover showing full status details
- [ ] Add keyboard shortcut hints (e.g., Ctrl+S to save)
- [ ] Smooth scroll behavior for in-page anchor links

---

## Phase 4: Dashboard Template Enhancements

### 4.1 Redesign KPI Cards (`core/templates/admin/index.html`)
- [ ] Add gradient backgrounds per card color (not just border)
- [ ] Add icon per KPI (using Material Icons)
- [ ] Add small sparkline or trend arrow per metric
- [ ] Improve pipeline value section with a progress bar or gauge
- [ ] Add a "Quick Actions" panel (e.g., buttons to add property, view leads)

### 4.2 Chart Improvements
- [ ] Add Chart.js plugin for rounded bar corners
- [ ] Add responsive chart sizing improvements
- [ ] Add a legend below charts for better readability
- [ ] Consider adding a line chart for leads-over-time trend

---

## Phase 5: Admin Class Improvements

### 5.1 Consistent Stacking & Ordering
- [ ] Standardize `list_per_page` across all admin classes (50 is good)
- [ ] Ensure all admin classes have `list_filter_submit = True`
- [ ] Add `save_on_top = True` to all ModelAdmin classes for better UX

### 5.2 Better Field Organization
- [ ] Review and improve fieldset groupings — use descriptive headers with icons in titles
- [ ] Add `collapsible` sections where appropriate (Unfold supports this)
- [ ] Ensure all datetime fields use consistent formatting

### 5.3 Enhanced List Displays
- [ ] Add `date_hierarchy` to all models with `created_at` for easy time-based filtering
- [ ] Consider adding colored row highlights for critical items (e.g., breached SLA)
- [ ] Add custom admin actions (e.g., bulk approve landlords, bulk close leads)

### 5.4 Inline Improvements
- [ ] Style PropertyImage inline with thumbnail previews
- [ ] Style WhatsAppMessage inline with direction indicators

---

## Phase 6: Login Page Customization

### 6.1 Create custom login template
- [ ] Override `admin/login.html` with a branded login page
- [ ] Add Primekey Homes logo centered above the form
- [ ] Add a subtle background image or gradient
- [ ] Style the login form with rounded inputs and a prominent submit button
- [ ] Add a tagline or welcome message

---

## Phase 7: Template-Level Polish

### 7.1 Base Template Overrides
- [ ] Override `admin/base_site.html` to add custom favicon
- [ ] Add a custom "Powered by" footer or version badge
- [ ] Add breadcrumbs styling improvements

### 7.2 Change Form Improvements
- [ ] Style the change form with a cleaner layout
- [ ] Add visual separators between fieldset sections
- [ ] Improve the delete confirmation page with a warning banner

---

## Phase 8: Performance & Polish

### 8.1 Static File Setup
- [ ] Register custom CSS/JS in UNFOLD `STYLES` and `SCRIPTS` settings
- [ ] Ensure `collectstatic` works correctly
- [ ] Add cache-busting query params to static files

### 8.2 Final QA
- [ ] Test all admin pages in light mode
- [ ] Test all admin pages in dark mode
- [ ] Verify mobile responsiveness
- [ ] Verify chart rendering
- [ ] Verify KPI card animations
- [ ] Check login page branding
- [ ] Cross-browser check (Chrome, Firefox, Edge)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `backend/core/settings.py` | Enhance UNFOLD config, register CSS/JS |
| `backend/core/static/admin/css/custom.css` | **CREATE** — all custom styles |
| `backend/core/static/admin/js/custom.js` | **CREATE** — animations & interactivity |
| `backend/core/templates/admin/index.html` | Redesign dashboard layout |
| `backend/core/templates/admin/login.html` | **CREATE** — branded login page |
| `backend/core/templates/admin/base_site.html` | **CREATE** — favicon & footer |
| `backend/apps/*/admin.py` | Minor improvements (save_on_top, etc.) |
| `backend/requirements.txt` | No changes needed (Unfold already installed) |

---

## Approach
- **Primary framework:** Django Unfold (already installed — maximize its features)
- **Custom styling:** Tailwind-compatible CSS (Unfold is built on Tailwind)
- **Charts:** Chart.js (already in use via Unfold)
- **Icons:** Material Symbols (Unfold default)
- **No additional packages needed** — everything achievable with Unfold + custom CSS/JS
