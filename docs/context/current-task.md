# Current Task: Unit 2.1 - Inspection Tour Booking Flow

> **AI INSTRUCTIONS & SCOPE BOUNDARIES**
> - **DO UPDATE**: Create `components/booking/InspectionBookingModal.tsx`, create `lib/validations/bookingSchema.ts`, and integrate the modal trigger inside `app/property/[id]/page.tsx`.
> - **DO NOT UPDATE**: Do NOT modify completed components such as `PropertyMap.tsx` or `AuthInterceptSheet.tsx` unless adding the callback hooks required for guest authorization. Retain standard design tokens (`#04164a` Brand Navy, `#f3f0ff` Lavender background).

---

## Active Directive
Implement Unit 2.1: Inspection Tour Booking Flow, enabling prospective buyers and tenants to schedule physical or virtual property walkthroughs.

### Deliverables & Task List
- [ ] **1. Form Validation Schema (`lib/validations/bookingSchema.ts`)**
  - Define `zod` schema enforcing inspection date, preferred time slot, tour type (`in_person` | `virtual`), and contact details.
- [ ] **2. Booking Modal Component (`components/booking/InspectionBookingModal.tsx`)**
  - Interactive calendar/date picker and time-slot selection grid.
  - Radio toggle for In-Person vs. Live Video Call tour.
  - Responsive dialog/drawer UI styled with Brand Navy (`#04164a`).
- [ ] **3. Dynamic Property Page Wiring (`app/property/[id]/page.tsx`)**
  - Connect the "Book Physical Inspection" button to trigger the modal.
  - Direct unauthenticated users through `AuthInterceptSheet` before confirming their slot.
- [ ] **4. Confirmation & Toast Feedback**
  - Display booking summary card with success confirmation upon submission.

---

### Context & Dependencies
- **Parent Unit**: Unit 1.4 (Completed)
- **Target Route**: `app/property/[id]/page.tsx`
- **Dependencies**: `react-hook-form`, `zod`, `shadcn/ui` Dialog/Drawer, `lucide-react`
- **Design Tokens**:
  - Brand Navy: `#04164a`
  - Lavender Surface: `#f3f0ff`
  - Cards: `bg-white/90 backdrop-blur-sm`
