# Primekey Homes — Project Overview & Vision

## Executive Summary
Primekey Homes and Properties Ltd is a high-converting digital platform designed for the Nigerian real estate ecosystem. By combining dynamic property search, a high-touch 2-Week Concierge service for prospective buyers/renters, an owner intake funnel for landlords, and an optional B2B marketplace for developers, Primekey Homes bridges trust gaps and optimizes real estate transactions across Lagos, Abuja, Port Harcourt, and beyond.

---

## Brand & Design Tokens

### Visual Identity
* **Primary Brand Color:** Exact Brand Navy (`#04164a`) — Conveys authority, security, and luxury real estate elegance.
* **Global Background:** Soft Lavender (`#f3f0ff`) — Creates an airy, modern, premium backdrop across all user views.
* **Surface Containers:** Pure White (`#ffffff` / `bg-white/90`) — Clean, high-contrast cards and form overlays with glassmorphic accents.

### Typography System
* **Headings (`font-heading`):** `Poppins` — Bold, clean, modern typography for hero titles, section headlines, modal headers, and key callouts.
* **Body & Prose (`font-body`):** `Lora` — Elegant serif typography for subheadings, property descriptions, form labels, and explanatory copy.

---

## Product Pathways & Bounded Contexts

### Phase 1: Buyer & Renter Pathway (Lead Generation Engine)
* **Target Audience:** High-intent buyers and renters looking for vetted properties in prime Nigerian locations.
* **Core Mechanisms:**
  * Interactive property search filtering by location, price range (Naira `₦`), property type, and bedroom count.
  * **2-Week Concierge Trigger:** When a search returns zero results, the system activates a specialized concierge registration funnel rather than displaying a dead end.
  * **Strict SLA Engine:** Ingested leads are scored and assigned a 2-hour SLA deadline for agent response.

### Phase 2: Landlord & Owner Pathway (Property Acquisition)
* **Target Audience:** Property owners looking to list, sell, or hand over management of luxury real estate.
* **Core Mechanisms:**
  * Dedicated acquisition landing page highlighting landlord benefits.
  * Multi-step property intake form collecting location, structural details, and pricing expectations.
  * Automated consultation booking engine for agent property inspections.

### Phase 3: Builder & Developer Pathway (Optional Extension)
* **Target Audience:** Construction companies, property developers, and building material suppliers.
* **Core Mechanisms:**
  * B2B procurement portal (`/builder`) for building materials.
  * Supplier-charge monetization model integrated with local payment gateways (Flutterwave / Paystack).

---

## Core System Architecture

* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, `shadcn/ui`, GSAP (`@gsap/react`), `react-hook-form`, `zod`.
* **Backend:** Django REST Framework (Modular Monolith architecture with DDD context boundaries).
* **Database:** PostgreSQL with `pg_cron` for automated NDPR data retention and lead anonymization.
* **Compliance:** Nigeria Data Protection Act (NDPR) compliant by design with immutable consent logging (`consent_logs`).
