# User Flow


## The Navbar Global Entry Point: The Landing Page

Every visitor — authenticated or not — lands on the Primekey Homes landing page (/). This is the company's digital storefront.

-- What Guests Can Do (No Auth Required)

View the landing page in full (hero, benefits, testimonials, FAQs, etc.)

See the company's value proposition

View contact information in the footer (phone number, WhatsApp)

Understand the three pathways: Buy/Rent, List a Property, For Builders

-- What Guests Cannot Do (Auth Required)

Search for properties

Submit concierge requests

List a property

Book appointments

Access any business functionality

---

Visitor arrives at primekeyhomes.com
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  Landing Page (/)                                            │
│  • Hero section with value proposition                       │
│  • Benefits / Why Primekey Homes                             │
│  • Social proof (testimonials, stats)                        │
│  • FAQs                                                      │
│  • Final CTA section                                         │
│  • Footer with contact info (phone, WhatsApp)                │
│                                                              │
│  Navbar:                                                     │
│  • Logo                                                      │
│  • Buy/Rent a Property                                       │
│  • List a Property                                           │
│  • For Builders                                              │
│  • Login                                                     │
│  • Sign Up                                                   │
│  • Talk to us (link to contact or WhatsApp)                  │
└─────────────────────────────────────────────────────────────┘
        │
        ├─► Click "Buy/Rent a Property" ──► Auth Gate ──► /search
        ├─► Click "List a Property" ──► Auth Gate ──► /landlord
        ├─► Click "For Builders" ──► /builder (Coming Soon)
        ├─► Click "Login" ──► /login
        ├─► Click "Sign Up" ──► /signup
        └─► Click "Talk to us" ──► Opens WhatsApp or shows contact info

---

## Authentication Gateway

The Authentication Gate is the critical moment where a Guest becomes an authenticated user. It occurs whenever a visitor attempts to access business functionality.

---

Authenticated user clicks a business CTA (e.g., "Buy/Rent a Property")
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  Check authentication status                                 │
└─────────────────────────────────────────────────────────────┘
        │
        ├─► Authenticated ──► Proceed to business functionality
        │
        └─► Not authenticated ──► Redirect to /signup or /login
                                   │
                                   ▼
                          ┌─────────────────────────────────────────────────┐
                          │  Sign Up / Login Page                            │
                          │  • Email, password (or social login)             │
                          │  • Role selection (Buyer, Landlord, Builder)     │
                          │  • NDPR consent checkbox (required)              │
                          │  • "Don't have an account? Sign up" link         │
                          │  • "Already have an account? Login" link         │
                          └─────────────────────────────────────────────────┘
                                   │
                                   ▼
                          Successful authentication
                                   │
                                   ▼
                          Redirect to intended destination
                          (e.g., /search, /landlord, /builder)

---

### Key Rules

No guest access to business functionality. Every form submission, every search, every property listing requires authentication.

Role selection during signup. Users choose their role (Buyer, Landlord, Builder) during registration, which determines their dashboard and permissions.

NDPR consent is mandatory. The consent checkbox must be checked before signup can complete.

Post-login redirect. After authentication, the user is redirected to the page they originally intended to visit.

---

## Buyer/Renter Journey: Phase 1

User clicks "Buy/Rent a Property" on the landing page navbar.

---
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Authentication Gate                                 │
│  User is not authenticated → Redirect to /signup or /login   │
│  User signs up / logs in as "Buyer" role                     │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Search Portal (/search)                             │
│  User enters: location, price range, property type, bedrooms │
│  System queries the properties database                      │
└─────────────────────────────────────────────────────────────┘
        │
        ├─► MATCHES FOUND ──► Continue to Step 3A
        │
        └─► NO MATCHES ──► Continue to Step 3B (Critical Branch)

---

### Branch A: Matches Found

---
┌─────────────────────────────────────────────────────────────┐
│  STEP 3A: Display property results grid                      │
│  User browses cards, applies additional filters              │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4A: User clicks a property card                        │
│  → Opens Property Detail page (/property/[id])               │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5A: User contacts agent                                │
│  → Form submission or direct call                            │
│  → Lead created in CRM (standard priority)                   │
│  → Consent logged                                            │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
   ✅ CONVERSION: Standard lead generated (authenticated user)

---

### Branch B: No Matches Found (The Strategic Pivot)

---

┌─────────────────────────────────────────────────────────────┐
│  STEP 3B: "Not Found" conditional trigger                    │
│  → System detects zero results                               │
│  → Concierge Offer modal appears                             │
│  → NEVER shows a dead-end "no results" page                  │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4B: Concierge Offer Modal                              │
│  Title: "Unlock Off-Market Concierge Search"                 │
│  Value prop: "We'll find your property in 2 weeks"           │
│  → User accepts (opens form) OR dismisses                    │
└─────────────────────────────────────────────────────────────┘
        │
        ├─► User dismisses ──► User exits or refines search
        │
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5B: Concierge Registration Form                        │
│  Fields: name, email, phone, target location, budget, specs  │
│  (User is already authenticated — pre-fill from profile)     │
│  NDPR consent checkbox (unchecked by default, required)      │
│  Submit button disabled until all fields valid + consent ✓   │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6B: Form Submission (Atomic Transaction)               │
│  → concierge_leads record created (priority = HIGH)          │
│  → consent_logs record created (timestamp, policy, IP)       │
│  → lead_scores calculated                                    │
│  → SLA alert triggered (2-hour response window)              │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 7B: Success Page (/concierge/success)                  │
│  Confirmation message                                        │
│  "Our team will contact you within 2 hours"                  │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
   ✅ CONVERSION: High-priority concierge lead generated (authenticated user)

---

## Landlord/Owner Journey (Phase 2)

Entry:

User clicks "List a Property" on the landing page navbar.

Important Context:

Primekey Homes is a real estate company, not a software company. Landlords do business directly with Primekey Homes. The platform facilitates this relationship — it is not the product itself.

---

┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Authentication Gate                                 │
│  User is not authenticated → Redirect to /signup or /login   │
│  User signs up / logs in as "Landlord" role                  │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Landlord Dashboard (/landlord)                      │
│  Value proposition: stress-free management, guaranteed rent  │
│  Trust signals: testimonials, case studies, awards           │
│  CTA: "List Your Property" or "Book a Consultation"          │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Property Intake Form (Multi-step)                   │
│  Step 1: Property location, type, size                       │
│  Step 2: Condition, current rent, availability               │
│  Step 3: Photos, documents, additional notes                 │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Appointment Booking                                 │
│  Calendar view of Primekey Homes agent availability          │
│  User selects date + time slot                               │
│  Confirmation email sent                                     │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Confirmation Page (/landlord/confirmation)          │
│  "Your consultation is booked for [date/time]"               │
│  "A Primekey Homes agent will review your property details   │
│   beforehand and contact you to confirm."                    │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
   ✅ CONVERSION: Landlord opportunity created + appointment scheduled

---

## Builder/Developer Journey (Phase 3 — Optional)

Entry:

User clicks "For Builders" on the landing page navbar.

---

### Current State (Phase 1-2)

┌─────────────────────────────────────────────────────────────┐
│  Coming Soon Page (/builder)                                 │
│  Message: "Coming Soon, Your wish is our command"            │
│  Optional: Email capture for launch notification             │
│  (No authentication required for this page)                  │
└─────────────────────────────────────────────────────────────┘

---

### Future State (Phase 3 Activated)

┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Authentication Gate                                 │
│  User is not authenticated → Redirect to /signup or /login   │
│  User signs up / logs in as "Builder" role                   │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Builder Portal (/builder)                           │
│  Product catalog with filters, search, pagination            │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Product Detail                                      │
│  Specs, pricing, stock, images, "Add to Cart"                │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Cart Review                                         │
│  Review items, adjust quantities                             │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Checkout                                            │
│  Address → Payment (Flutterwave/Paystack) → Confirmation     │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
   ✅ CONVERSION: Order placed, payment processed (authenticated user)

---

## Agent Journey (Backend Only)

Entry:

Agents and Admins do not use the Next.js frontend. They access the system through the Django admin panel at /admin/.

---


Agent navigates to primekeyhomes.com/admin/
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  Django Admin Login                                          │
│  Username + password authentication                          │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  Django Admin Dashboard                                      │
│  Sections:                                                   │
│  • Concierge Leads (with SLA timers)                         │
│  • Landlord Opportunities                                    │
│  • Appointments                                              │
│  • Properties                                                │
│  • Users                                                     │
│  • Consent Logs                                              │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  Lead Detail View                                            │
│  View full lead data, update status, add notes               │
│  SLA timer visible (2-hour countdown for concierge leads)    │
└─────────────────────────────────────────────────────────────┘

---

## Admin Flow

### Entry Point

---

Admin navigates to primekeyhomes.com/admin/
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  Django Admin Login                                          │
│  • Username + password authentication                        │
│  • 2FA (if enabled)                                          │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  Django Admin Dashboard                                      │
│  Full access to all models, logs, and system tools           │
└─────────────────────────────────────────────────────────────┘

---

### Admin Dashboard Overview

The Django admin dashboard is organized by Bounded Context and shared modules:

---

┌─────────────────────────────────────────────────────────────┐
│  DJANGO ADMIN DASHBOARD                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 SHARED / CROSS-CUTTING                                   │
│  ├── Users (user accounts, roles, status)                    │
│  ├── Consent Logs (NDPR audit trail)                         │
│  ├── Audit Logs (system-wide activity)                       │
│  ├── Properties (master property listings)                   │
│  │                                                           │
│  🏠 BUYER CONTEXT (Phase 1)                                  │
│  ├── Concierge Leads (with SLA timers)                       │
│  ├── Lead Scores                                             │
│  │                                                           │
│  🏢 LANDLORD CONTEXT (Phase 2)                               │
│  ├── Landlord Profiles                                       │
│  ├── Property Listings (landlord-submitted)                  │
│  ├── Appointments                                            │
│  │                                                           │
│  🏗️ BUILDER CONTEXT (Phase 3 — Optional)                     │
│  ├── Products                                                │
│  ├── Categories                                              │
│  ├── Orders                                                  │
│  ├── Suppliers                                               │
│  │                                                           │
│  🛡️ COMPLIANCE & OPERATIONS                                  │
│  ├── Data Export Requests                                    │
│  ├── Data Erasure Requests                                   │
│  ├── Retention Jobs (pg_cron status)                         │
│  ├── System Health (/api/health)                             │
│  └── Backup Logs                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

---

### Core Admin Workflows

#### Workflow 1: User Management

---

┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Navigate to Users section                           │
│  View all registered users (Buyers, Landlords, Builders,     │
│  Agents, other Admins)                                       │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Select a user                                       │
│  View: name, email, role, registration date, last login,     │
│  consent status, associated leads/orders                     │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Perform action                                      │
│  • Edit role (e.g., promote Agent to Admin)                  │
│  • Deactivate account (soft delete)                          │
│  • Reset password                                            │
│  • Export user data (NDPR Right of Access)                   │
│  • Hard-delete user (NDPR Right to Erasure)                  │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
   Action logged to audit_logs

---

#### Workflow 2: Concierge Lead Oversight (Buyer Context)

---

┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Navigate to Concierge Leads                         │
│  View all leads with: status, priority, created_at,          │
│  assigned agent, SLA timer                                   │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Filter & sort                                       │
│  • Filter by status: new, contacted, qualified, converted    │
│  • Filter by priority: HIGH (concierge), STANDARD            │
│  • Sort by SLA urgency (time remaining)                      │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Monitor SLA compliance                              │
│  • Identify leads approaching 2-hour SLA breach              │
│  • Escalate unacknowledged leads to senior agent             │
│  • Reassign leads if agent is unavailable                    │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Review lead details                                 │
│  • View full lead data (budget, specs, consent log)          │
│  • View lead score breakdown                                 │
│  • Add admin notes                                           │
│  • Update status                                             │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
   Lead status updated, audit logged

---

#### Workflow 3: Landlord Opportunity Oversight (Landlord Context)

┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Navigate to Landlord Profiles / Appointments        │
│  View all landlord registrations and booked consultations    │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Review appointments                                 │
│  • View upcoming consultations                               │
│  • Confirm agent assignment                                  │
│  • Reschedule if needed                                      │
│  • Mark as completed / no-show                               │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Review property intake data                         │
│  • View landlord-submitted property details                  │
│  • Verify completeness                                       │
│  • Flag incomplete submissions for follow-up                 │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
   Opportunity status updated, agent notified

---

#### Workflow 4: NDPR Compliance Management

---

┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Navigate to Compliance section                      │
│  Access: consent_logs, data export requests, erasure requests│
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Monitor consent logs                                │
│  • Verify all leads have corresponding consent_logs entries  │
│  • Check timestamp, policy version, IP address               │
│  • Identify any gaps (leads without consent)                 │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Handle data subject requests                        │
│  • Right of Access: Export user data as JSON                 │
│  • Right to Erasure: Hard-delete user + all associated data  │
│  • Log all actions to audit_logs                             │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Verify automated retention jobs                     │
│  • Check pg_cron job status (daily anonymization)            │
│  • Review retention logs                                     │
│  • Manually trigger if job failed                            │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
   Compliance status verified, audit logged

---
#### Workflow 5: System Health & Monitoring

---

┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Check system health endpoint                        │
│  Navigate to /api/health (or view in Django admin dashboard) │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Review health status                                │
│  • Database connectivity: healthy / degraded                 │
│  • API response time                                         │
│  • Error logs                                                │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Investigate issues (if any)                         │
│  • Check Docker container logs                               │
│  • Review Nginx error logs                                   │
│  • Verify PostgreSQL performance                             │
│  • Check disk usage (media files, backups)                   │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Verify backup integrity                             │
│  • Check latest backup timestamp                             │
│  • Verify remote storage upload                              │
│  • Test restore (monthly)                                    │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
   System health confirmed, issues escalated if needed

---

#### Workflow 6: Agent Management

---

┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Navigate to Users → filter by role = Agent          │
│  View all agents                                             │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Review agent performance                            │
│  • View assigned leads                                       │
│  • Check SLA adherence rate                                  │
│  • Review conversion rates                                   │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Manage agent workload                               │
│  • Reassign leads from overloaded agents                     │
│  • Activate / deactivate agent accounts                      │
│  • Update agent permissions                                  │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
   Agent workload balanced, performance tracked

---


## Footer

┌─────────────────────────────────────────────────────────────┐
│  COLUMN 1: BRAND + CONTACT          COLUMN 2: QUICK NAV     │
│  [Primekey Homes Logo]              • Buy/Rent a Property   │
│  Your trusted partner in            • List a Property       │
│  Nigerian real estate.              • About Us              │
│                                     • FAQ                   │
│  📞 +234 XXX XXX XXXX               • Contact Us            │
│  💬 WhatsApp Us                                                │
│  ✉️ hello@primekeyhomes.com                                    │
│                                                                 │
│  [FB] [TW] [IG] [IN]                                           │
│                                                                 │
│  COLUMN 3: LEGAL & TRUST                                       │
│  • Privacy Policy                                              │
│  • Terms & Conditions                                          │
│  • NDPR Compliance Notice                                      │
│  • Cookie Policy                                               │
│                                                                 │
├─────────────────────────────────────────────────────────────┤
│  © 2026 Primekey Homes and Properties Ltd. All rights reserved. │
└─────────────────────────────────────────────────────────────┘