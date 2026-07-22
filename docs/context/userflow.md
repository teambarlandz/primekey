```markdown
# User Flow & Customer Journey Specifications

This document outlines the end-to-end user flows for all three product pathways (Buyer/Renter, Landlord/Owner, and Builder/Developer), including the strategic Authentication Interception layer and NDPR compliance checks.

---

## 🧭 Visual Flow Architecture

```text
                        ┌────────────────────────┐
                        │   Homepage / Landing   │
                        │      (app/page.tsx)    │
                        └───────────┬────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
      ┌───────────▼────────────┐          ┌───────────▼────────────┐
      │  Buyer / Renter Flow   │          │  Landlord / Owner Flow │
      │      (/search)         │          │       (/landlord)      │
      └───────────┬────────────┘          └───────────┬────────────┘
                  │                                   │
      ┌───────────┴───────────┐                       │
      │                       │                       │
┌─────▼──────┐          ┌─────▼──────┐          ┌─────▼──────┐
│ Properties │          │ Zero State │          │ Owner      │
│ Found      │          │ (No Match) │          │ Intake Form│
└─────┬──────┘          └─────┬──────┘          └─────┬──────┘
      │                       │                       │
┌─────▼──────┐          ┌─────▼──────┐          ┌─────▼──────┐
│ Property   │          │ Concierge  │          │ Auth Gate  │
│ Detail     │          │ Modal      │          │ (Intercept)│
└─────┬──────┘          └─────┬──────┘          └─────┬──────┘
      │                       │                       │
┌─────▼──────┐                │                 ┌─────▼──────┐
│ Auth Gate  │                │                 │ Agent      │
│ (Intercept)│                │                 │ Booking    │
└─────┬──────┘                │                 └────────────┘
      │                       │
┌─────▼──────┐          ┌─────▼──────┐
│ Schedule   │          │ 2-Hour SLA │
│ Inspection │          │ Agent CRM  │
└────────────┘          └────────────┘

```
## 1. Buyer & Renter Pathway (Lead Generation Engine)
### Primary Goal
Guide users through public property discovery or capture non-matching criteria via the guest-friendly 2-Week Concierge service.
```text
[Landing Page / Search Bar]
       │
       ▼
[Execute Search Filters] ─── (Location, Price ₦, Type, Beds)
       │
       ├───> [Properties Found] ───> [Property Grid] ───> [View Property Detail Page]
       │                                                         │
       │                                                         ▼
       │                                              [Click "Book Inspection"]
       │                                                         │
       │                                                         ▼
       │                                             [Trigger Auth Intercept Sheet]
       │                                                         │
       │                                                         ▼
       │                                              [Schedule Inspection Tour]
       │
       └───> [0 Properties Found] 
                   │
                   ▼
       [Trigger Concierge Modal (Un-Gated Guest Flow)]
                   │
                   ▼
       [Fill Concierge Registration Form] ─── (Location, Budget ₦, Phone)
                   │
                   ▼
       [Check NDPR Consent Box]
                   │
                   ▼
       [Submit Lead to POST /api/submit-concierge]
                   │
                   ▼
       [2-Hour Agent SLA Countdown Initiated in CRM]

```
### Detailed Steps
 1. **Discovery & Search Entry (Un-Gated Public Access):**
   * User arrives on the homepage (app/page.tsx) featuring Brand Navy #04164a CTAs, #f3f0ff Lavender background, and Poppins/Lora typography.
   * User navigates to /search or submits a query via SearchBar.tsx.
 2. **Filtering & Browsing:**
   * User adjusts search parameters using FilterDropdown.tsx and PriceRange.tsx (Min/Max Naira prices, property types, bedroom count).
 3. **Branch A — Properties Found:**
   * System displays matching property cards in PropertyGrid.tsx.
   * User selects a property card to open the /property/[id] detail view.
   * **Protected Action Trigger:** If the user clicks **"Save Search"**, **"Save Property (Heart Icon)"**, or **"Book Inspection Tour"**, the **Auth Intercept Sheet** slides into view requesting Phone / OTP verification.
 4. **Branch B — Zero Search Results (Un-Gated Concierge Trigger):**
   * Instead of displaying a dead end, SearchResults.tsx triggers ConciergeModal.tsx.
   * Form collects user preferences (Target Areas in Nigeria, Budget Range in Naira, Name, Phone Number).
   * User confirms data processing terms via an explicit NDPR consent checkbox.
 5. **Backend Processing:**
   * Lead data is posted to POST /api/submit-concierge.
   * Backend logs immutable consent in consent_logs table and creates concierge_leads record with a 2-hour SLA deadline.
## 2. Authentication Interception Flow (Protected Action Gate)
When an unauthenticated guest attempts a high-intent protected action across any pathway, the application seamlessly pauses their intent and triggers the Auth Intercept.
```text
[Guest Clicks Protected Action]
  (e.g., "Save Search", "Favorite Property", "Book Inspection", "Submit Intake Step 3")
       │
       ▼
[Trigger Auth Intercept Sheet / Modal]
       │
       ▼
[User Enters Nigerian Phone Number (+234 / 080...)]
       │
       ▼
[Receive & Enter 6-Digit OTP]
       │
       ▼
[Validate OTP -> Create JWT Session Token]
       │
       ▼
[Close Auth Sheet & Auto-Resume Original Action]

```
## 3. Landlord & Owner Pathway (Property Acquisition)
### Primary Goal
Convert property owners into managed clients by capturing property intake details and scheduling inspection consultations.
```text
[Landlord Landing Page (/landlord)]
       │
       ▼
[Click "List Your Property" CTA]
       │
       ▼
[Complete Intake Form Steps 1 & 2] ─── (Owner Info, Property Specs, Asking Price ₦)
       │
       ▼
[Submit Intake Form]
       │
       ▼
[Trigger Auth Intercept Sheet] ─── (Verifies Owner Identity via Phone/OTP)
       │
       ▼
[Select Agent Consultation / Inspection Slot]
       │
       ▼
[Submit Intake to POST /api/landlords/intake]
       │
       ▼
[Confirmation Screen + Agent Notification Sent]

```
## 4. Builder & Developer Pathway (Optional Phase 3 Extension)
### Primary Goal
Provide B2B procurement for building materials and construction equipment.
```text
[Builder Subdirectory Portal (/builder)]
       │
       ▼
[Browse Building Materials Catalog]
       │
       ▼
[Add Items to Cart]
       │
       ▼
[Click "Proceed to Checkout"] ───> [Trigger Auth Intercept Sheet]
       │
       ▼
[Process Local Payment via Flutterwave / Paystack]
       │
       ▼
[Order Confirmation & Supplier Dispatch Notification]

```
## 🛡️ Exception & Error Flows
 1. **Invalid Phone Format:** Client-side Zod validation flags non-Nigerian phone inputs instantly without resetting form state.
 2. **Network Request Failure:** Form displays a retry toaster banner while maintaining filled input fields.
 3. **Failed OTP Validation:** User is prompted with clear error feedback and an "Resend Code" counter timer.
 4. **SLA Timeout Breach:** Backend SLAAlertService escalates assigned lead to management if unhandled after 2 hours.
```

---


```
