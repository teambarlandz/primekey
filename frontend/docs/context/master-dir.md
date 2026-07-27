# Master Directory


## Master Progress Tracker
primekey-homes/
├── frontend/                     # Next.js App Router (Frontend)
│   ├── app/
│   │   ├── globals.css           # Unit 1.1 [COMPLETED] (Brand Navy #04164a, Lavender #f3f0ff)
│   │   ├── layout.tsx            # Unit 1.1 [COMPLETED] (Google Fonts Poppins & Lora)
│   │   ├── page.tsx              # Unit 1.1 [COMPLETED] (Public Landing Page)
│   │   ├── search/
│   │   │   └── page.tsx          # Unit 1.2 [COMPLETED] & Unit 1.10 (Property Search Page)
│   │   ├── property/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Unit 1.3 [COMPLETED] (Property Detail Page)
│   │   ├── landlord/
│   │   │   └── page.tsx          # Unit 2.1 (Landlord/Owner Landing Page)
│   │   ├── dashboard/
│   │   │   └── agent/
│   │   │       └── page.tsx      # Unit 2.6 & Unit 2.7 (Agent Dashboard)
│   │   └── builder/              # Phase 3 Extension (Optional B2B Marketplace)
│   │       ├── page.tsx          # Unit 3.1 (Builder Portal Setup / Coming Soon)
│   │       ├── products/
│   │       │   └── page.tsx      # Unit 3.5 (B2B Product Catalog View)
│   │       ├── product/[id]/
│   │       │   └── page.tsx      # Unit 3.5 (Product Detail View)
│   │       ├── cart/
│   │       │   └── page.tsx      # Unit 3.5 (Shopping Cart View)
│   │       ├── checkout/
│   │       │   └── page.tsx      # Unit 3.5 (Checkout View)
│   │       ├── orders/
│   │       │   └── page.tsx      # Unit 3.5 (Order Tracking View)
│   │       └── supplier/
│   │           └── page.tsx      # Unit 3.6 (Supplier Management Area)
│   ├── components/
│   │   ├── Benefits.tsx          # Unit 1.1 [COMPLETED] (Landing Page Benefits)
│   │   ├── FAQ.tsx               # Unit 1.1 [COMPLETED] (Landing Page FAQ)
│   │   ├── FinalCTA.tsx          # Unit 1.1 [COMPLETED] (Form using shadcn/ui + zod)
│   │   ├── FloatingContact.tsx   # Unit 1.1 [COMPLETED] (Persistent contact widget)
│   │   ├── Footer.tsx            # Unit 1.1 [COMPLETED] (Site Footer)
│   │   ├── Hero.tsx              # Unit 1.1 [COMPLETED] (Main Hero Section)
│   │   ├── Navbar.tsx            # Unit 1.1 [COMPLETED] (Primary Navigation Bar)
│   │   ├── SocialProof.tsx       # Unit 1.1 [COMPLETED] (Trust Signals)
│   │   ├── search/               # Search & Filtering Components
│   │   │   ├── SearchBar.tsx     # Unit 1.2 [COMPLETED] (Location & query input)
│   │   │   ├── FilterDropdown.tsx# Unit 1.2 [COMPLETED] (Dropdown filters)
│   │   │   ├── PriceRange.tsx    # Unit 1.2 [COMPLETED] (Price range selector)
│   │   │   ├── PropertyGrid.tsx  # Unit 1.3 [COMPLETED] (Search results grid layout)
│   │   │   ├── PropertyCard.tsx  # Unit 1.3 [COMPLETED] (Individual property card)
│   │   │   └── SearchResults.tsx # Unit 1.4 [COMPLETED] & Unit 1.10 [IN PROGRESS] (Results & zero-results logic)
│   │   ├── concierge/            # 2-Week Concierge Service Components
│   │   │   ├── ConciergeModal.tsx# Unit 1.4 & Unit 1.5 [COMPLETED] (Triggered modal container)
│   │   │   ├── ConciergeOffer.tsx# Unit 1.4 [COMPLETED] (Zero-results value pitch)
│   │   │   └── ConciergeForm.tsx # Unit 1.5 & Unit 1.10 [COMPLETED] (Registration form with NDPR)
│   │   ├── property/
│   │   │   └── PropertyDetail.tsx# Unit 1.3 (Property detail view container)
│   │   ├── landlord/             # Landlord Pathway Components
│   │   │   ├── LandlordHero.tsx  # Unit 2.1 (Landlord page hero)
│   │   │   ├── BenefitsGrid.tsx  # Unit 2.1 (Value comparison matrix)
│   │   │   ├── TrustSignals.tsx  # Unit 2.1 (Owner safety & verification stats)
│   │   │   ├── LandlordRegistrationForm.tsx # Unit 2.2 & Unit 2.7 (Gated registration)
│   │   │   ├── PropertyIntakeForm.tsx       # Unit 2.3 & Unit 2.7 (Multi-step intake)
│   │   │   ├── IntakeStep1.tsx   # Unit 2.3 (Basic intake details)
│   │   │   ├── IntakeStep2.tsx   # Unit 2.3 (Media & pricing details)
│   │   │   ├── IntakeStep3.tsx   # Unit 2.3 (Legal/Verification docs)
│   │   │   └── AppointmentBooking.tsx       # Unit 2.4 & Unit 2.7 (Calendar engine)
│   │   ├── dashboard/
│   │   │   ├── LeadTable.tsx     # Unit 2.6 (Agent dashboard lead list)
│   │   │   └── LeadDetail.tsx    # Unit 2.6 (Agent lead inspector modal)
│   │   ├── builder/              # Phase 3 Components
│   │   │   └── ...               # Unit 3.5 (Catalog, Cart, and Checkout components)
│   │   └── ui/                   # Shared UI primitives (shadcn/ui)
│   ├── lib/
│   │   ├── animations.ts         # Unit 1.1 [COMPLETED] (GSAP ScrollTrigger hooks)
│   │   ├── api-client.ts         # Unit 1.10 & Unit 2.7 (Axios/Fetch client)
│   │   └── validations/
│   │       ├── conciergeSchema.ts# Unit 1.5 [COMPLETED] (Zod schema for Concierge form)
│   │       └── searchSchema.ts   # Unit 1.2 [COMPLETED] (Zod schema for filters)
│   ├── middleware.ts             # Unit 3.1 (Subpath routing & access control)
│   └── __tests__/                # Testing Suites
│       ├── (buyer tests)         # Unit 1.12 (QA & Testing for Buyer pathway)
│       └── landlord/             # Unit 2.8 (QA & Testing for Landlord pathway)
│
└── backend/                      # Django REST Framework (Backend Monolith)
    ├── core/                     # Project Configuration & Settings
    │   ├── settings.py           # Core settings (DB, Auth, SLA rules)
    │   ├── urls.py               # Root API routing
    │   └── wsgi.py               # WSGI server entrypoint
    ├── apps/
    │   ├── crm/                  # Customer Relationship & Concierge Bounded Context
    │   │   ├── models.py         # Unit 1.6, Unit 1.7 & Unit 1.8 (ConciergeLead, ConsentLog, LeadScore)
    │   │   ├── serializers.py    # Unit 1.6 (Concierge form serialization)
    │   │   ├── views.py          # Unit 1.6 (POST /api/submit-concierge)
    │   │   ├── services.py       # Unit 1.6 & Unit 1.8 (LeadScoringService, SLAAlertService)
    │   │   ├── tasks.py          # Unit 1.8 (Celery/SLA background alerts)
    │   │   └── urls.py           # Unit 1.6 (CRM route mapping)
    │   ├── properties/           # Property Listings Bounded Context
    │   │   ├── models.py         # Unit 1.7 (Property, Media, Location models)
    │   │   ├── serializers.py    # Unit 1.9 (Property serialization)
    │   │   ├── views.py          # Unit 1.9 (GET /api/search)
    │   │   ├── services.py       # Unit 1.9 (SearchService engine)
    │   │   └── urls.py           # Unit 1.9 (Search route mapping)
    │   ├── landlords/            # Landlord Onboarding Bounded Context
    │   │   ├── models.py         # Unit 2.2, Unit 2.3 & Unit 2.4 (LandlordProfile, PropertyIntake, Appointment)
    │   │   ├── serializers.py    # Unit 2.2, Unit 2.3 & Unit 2.5 (Landlord API serializers)
    │   │   ├── views.py          # Unit 2.2, Unit 2.3 & Unit 2.5 (Registration, intake & booking views)
    │   │   ├── services.py       # Unit 2.4 & Unit 2.5 (BookingService)
    │   │   └── urls.py           # Unit 2.5 (Landlord API route mapping)
    │   ├── dashboard/            # Agent/Admin Portal Backend Context
    │   │   ├── views.py          # Unit 1.8 & Unit 2.6 (Lead scoring & Agent dashboard APIs)
    │   │   └── serializers.py    # Unit 2.6 (Dashboard stats serializers)
    │   ├── compliance/           # NDPR Data Privacy & Governance Context
    │   │   ├── models.py         # Unit 1.11 (Audit Logs & Privacy requests)
    │   │   ├── serializers.py    # Unit 1.11 (Right to Access/Erasure serializers)
    │   │   ├── views.py          # Unit 1.11 (NDPR Export & Erasure endpoints)
    │   │   ├── services.py       # Unit 1.11 (Data retention & anonymization logic)
    │   │   ├── management/
    │   │   │   └── commands/
    │   │   │       └── anonymize_leads.py # Unit 1.11 (Automated pg_cron script)
    │   │   └── urls.py           # Unit 1.11 (Compliance route mapping)
    │   └── ecommerce/            # Phase 3: Builder Pathway Context (Optional)
    │       ├── models.py         # Unit 3.2, Unit 3.3 & Unit 3.6 (Product, Cart, Order, Supplier)
    │       ├── serializers.py    # Unit 3.2 & Unit 3.3 (E-commerce serializers)
    │       ├── views.py          # Unit 3.2 & Unit 3.3 (Catalog, Cart, and Checkout views)
    │       ├── services.py       # Unit 3.3, Unit 3.4 & Unit 3.6 (Checkout, Payment, Supplier services)
    │       ├── webhooks.py       # Unit 3.4 (Flutterwave/Paystack webhooks)
    │       └── urls.py           # Unit 3.2 (Ecommerce route mapping)
    ├── tests/                    # Backend Unit/Integration Testing
    │   └── ...                   # Unit 1.12 (Phase 1 QA), Unit 2.8 (Phase 2 QA), Unit 3.7 (Phase 3 QA)
    └── manage.py


‐--------‐

## Master Project Tracker (Further Details)

primekey-homes/
├── frontend/                     # Next.js App Router (Frontend)
│   ├── app/
│   │   ├── globals.css           # Global CSS (Brand Navy #04164a, Lavender #f3f0ff)[span_1](start_span)[span_1](end_span)
│   │   ├── layout.tsx            # Root layout (Google Fonts Poppins & Lora)[span_2](start_span)[span_2](end_span)
│   │   ├── page.tsx              # Public Landing Page (Unit 1.1)[span_3](start_span)[span_3](end_span)
│   │   ├── search/
│   │   │   └── page.tsx          # Property Search Interface (Unit 1.2)[span_4](start_span)[span_4](end_span)
│   │   ├── property/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Property Detail Page (Unit 1.3)[span_5](start_span)[span_5](end_span)
│   │   ├── landlord/
│   │   │   └── page.tsx          # Landlord/Owner Landing Page (Unit 2.1)[span_6](start_span)[span_6](end_span)
│   │   ├── dashboard/
│   │   │   └── agent/
│   │   │       └── page.tsx      # Agent Lead Management Dashboard (Unit 2.6)[span_7](start_span)[span_7](end_span)
│   │   └── builder/              # Phase 3 Extension (Optional B2B Marketplace)[span_8](start_span)[span_8](end_span)
│   │       ├── page.tsx          # Builder Portal Coming Soon/Landing (Unit 3.1)[span_9](start_span)[span_9](end_span)
│   │       ├── products/
│   │       │   └── page.tsx      # B2B Product Catalog[span_10](start_span)[span_10](end_span)
│   │       ├── product/[id]/
│   │       │   └── page.tsx      # Product Detail View[span_11](start_span)[span_11](end_span)
│   │       ├── cart/
│   │       │   └── page.tsx      # Shopping Cart View[span_12](start_span)[span_12](end_span)
│   │       ├── checkout/
│   │       │   └── page.tsx      # Payment Checkout View[span_13](start_span)[span_13](end_span)
│   │       ├── orders/
│   │       │   └── page.tsx      # Order Tracking View[span_14](start_span)[span_14](end_span)
│   │       └── supplier/
│   │           └── page.tsx      # Supplier Management Area[span_15](start_span)[span_15](end_span)
│   ├── components/
│   │   ├── Benefits.tsx          # Landing page benefits section[span_16](start_span)[span_16](end_span)
│   │   ├── FAQ.tsx               # Landing page FAQ accordion[span_17](start_span)[span_17](end_span)
│   │   ├── FinalCTA.tsx          # Lead conversion form (shadcn/ui + zod)[span_18](start_span)[span_18](end_span)
│   │   ├── FloatingContact.tsx   # Persistent contact widget[span_19](start_span)[span_19](end_span)
│   │   ├── Footer.tsx            # Site footer[span_20](start_span)[span_20](end_span)
│   │   ├── Hero.tsx              # Main hero section[span_21](start_span)[span_21](end_span)
│   │   ├── Navbar.tsx            # Primary navigation bar[span_22](start_span)[span_22](end_span)
│   │   ├── SocialProof.tsx       # Trust markers section[span_23](start_span)[span_23](end_span)
│   │   ├── search/               # Search & Filtering Components
│   │   │   ├── SearchBar.tsx     # Location & general query input[span_24](start_span)[span_24](end_span)
│   │   │   ├── FilterDropdown.tsx# Property type, beds, options[span_25](start_span)[span_25](end_span)
│   │   │   ├── PriceRange.tsx    # Price range slider/inputs[span_26](start_span)[span_26](end_span)
│   │   │   ├── PropertyGrid.tsx  # Search results layout container[span_27](start_span)[span_27](end_span)
│   │   │   ├── PropertyCard.tsx  # Individual listing preview card[span_28](start_span)[span_28](end_span)
│   │   │   └── SearchResults.tsx # Results container + zero-result trigger logic[span_29](start_span)[span_29](end_span)
│   │   ├── concierge/            # 2-Week Concierge Service Components
│   │   │   ├── ConciergeModal.tsx# Triggered when search returns empty[span_30](start_span)[span_30](end_span)
│   │   │   ├── ConciergeOffer.tsx# Value proposition banner[span_31](start_span)[span_31](end_span)
│   │   │   └── ConciergeForm.tsx # Registration form with NDPR consent[span_32](start_span)[span_32](end_span)
│   │   ├── property/
│   │   │   └── PropertyDetail.tsx# Full detailed view component[span_33](start_span)[span_33](end_span)
│   │   ├── landlord/             # Landlord Pathway Components
│   │   │   ├── LandlordHero.tsx  # Landlord landing hero[span_34](start_span)[span_34](end_span)
│   │   │   ├── BenefitsGrid.tsx  # Value prop comparison matrix[span_35](start_span)[span_35](end_span)
│   │   │   ├── TrustSignals.tsx  # Verification & safety stats[span_36](start_span)[span_36](end_span)
│   │   │   ├── LandlordRegistrationForm.tsx # Owner intake filter form[span_37](start_span)[span_37](end_span)
│   │   │   ├── PropertyIntakeForm.tsx       # Multi-step intake wizard[span_38](start_span)[span_38](end_span)
│   │   │   ├── IntakeStep1.tsx   # Basic info step[span_39](start_span)[span_39](end_span)
│   │   │   ├── IntakeStep2.tsx   # Media & pricing step[span_40](start_span)[span_40](end_span)
│   │   │   ├── IntakeStep3.tsx   # Verification documents step[span_41](start_span)[span_41](end_span)
│   │   │   └── AppointmentBooking.tsx       # Custom internal booking calendar[span_42](start_span)[span_42](end_span)
│   │   ├── dashboard/
│   │   │   ├── LeadTable.tsx     # Agent view of leads and statuses[span_43](start_span)[span_43](end_span)
│   │   │   └── LeadDetail.tsx    # Expanded lead/intake file inspection[span_44](start_span)[span_44](end_span)
│   │   ├── builder/              # B2B E-commerce Components[span_45](start_span)[span_45](end_span)
│   │   └── ui/                   # Reusable UI primitives (shadcn/ui)[span_46](start_span)[span_46](end_span)
│   ├── lib/
│   │   ├── animations.ts         # GSAP ScrollTrigger helpers[span_47](start_span)[span_47](end_span)
│   │   ├── api-client.ts         # Axios/Fetch client wrapper for DRF Backend[span_48](start_span)[span_48](end_span)
│   │   └── validations/
│   │       ├── conciergeSchema.ts# Zod validation for Concierge form[span_49](start_span)[span_49](end_span)
│   │       └── searchSchema.ts   # Zod validation for search filters[span_50](start_span)[span_50](end_span)
│   ├── middleware.ts             # Route protection & subpath routing[span_51](start_span)[span_51](end_span)
│   └── __tests__/                # Frontend unit/integration test suites[span_52](start_span)[span_52](end_span)
│
└── backend/                      # Django REST Framework (Backend Monolith)[span_53](start_span)[span_53](end_span)
    ├── core/                     # Project Configuration & Settings
    │   ├── settings.py           # DB, installed apps, CORS, SLA rules[span_54](start_span)[span_54](end_span)
    │   ├── urls.py               # Main URL routing[span_55](start_span)[span_55](end_span)
    │   └── wsgi.py               # WSGI entrypoint for VPS deployment[span_56](start_span)[span_56](end_span)
    ├── apps/
    │   ├── crm/                  # Customer Relationship & Concierge Bounded Context
    │   │   ├── models.py         # ConciergeLead, ConsentLog, LeadScore models[span_57](start_span)[span_57](end_span)
    │   │   ├── serializers.py    # Serializers for API conversion[span_58](start_span)[span_58](end_span)
    │   │   ├── views.py          # API ViewSets (e.g., submit-concierge)[span_59](start_span)[span_59](end_span)
    │   │   ├── services.py       # LeadScoringService, SLAAlertService[span_60](start_span)[span_60](end_span)
    │   │   ├── tasks.py          # Background processing (2-hr SLA timers)[span_61](start_span)[span_61](end_span)
    │   │   └── urls.py           # /api/crm/ routing[span_62](start_span)[span_62](end_span)
    │   ├── properties/           # Property Listings Bounded Context
    │   │   ├── models.py         # Property, Media, Location models[span_63](start_span)[span_63](end_span)
    │   │   ├── serializers.py    # Property serialization[span_64](start_span)[span_64](end_span)
    │   │   ├── views.py          # Search views and detail endpoints[span_65](start_span)[span_65](end_span)
    │   │   ├── services.py       # SearchService logic[span_66](start_span)[span_66](end_span)
    │   │   └── urls.py           # /api/search/ & /api/properties/ routing[span_67](start_span)[span_67](end_span)
    │   ├── landlords/            # Landlord Onboarding Bounded Context
    │   │   ├── models.py         # LandlordProfile, PropertyIntake, Appointment[span_68](start_span)[span_68](end_span)
    │   │   ├── serializers.py    # Intake and booking serializers[span_69](start_span)[span_69](end_span)
    │   │   ├── views.py          # Owner intake & appointment endpoints[span_70](start_span)[span_70](end_span)
    │   │   ├── services.py       # BookingService logic[span_71](start_span)[span_71](end_span)
    │   │   └── urls.py           # /api/landlords/ routing[span_72](start_span)[span_72](end_span)
    │   ├── dashboard/            # Agent/Admin Portal Backend Context
    │   │   ├── views.py          # Internal dashboard data aggregated endpoints[span_73](start_span)[span_73](end_span)
    │   │   └── serializers.py    # Admin data formatters[span_74](start_span)[span_74](end_span)
    │   ├── compliance/           # NDPR Data Privacy & Governance Context[span_75](start_span)[span_75](end_span)
    │   │   ├── models.py         # Audit Log and Anonymization records[span_76](start_span)[span_76](end_span)
    │   │   ├── serializers.py    # Data Subject Rights serializers[span_77](start_span)[span_77](end_span)
    │   │   ├── views.py          # Data export & erasure API endpoints[span_78](start_span)[span_78](end_span)
    │   │   ├── services.py       # Retention & Anonymization handlers[span_79](start_span)[span_79](end_span)
    │   │   ├── management/
    │   │   │   └── commands/
    │   │   │       └── anonymize_leads.py # Cron/pg_cron job for inactive data[span_80](start_span)[span_80](end_span)
    │   │   └── urls.py           # /api/compliance/ routing[span_81](start_span)[span_81](end_span)
    │   └── ecommerce/            # Phase 3: Builder Pathway Context (Optional)[span_82](start_span)[span_82](end_span)
    │       ├── models.py         # Product, Category, Cart, Order, Supplier[span_83](start_span)[span_83](end_span)
    │       ├── serializers.py    # B2B E-commerce serializers[span_84](start_span)[span_84](end_span)
    │       ├── views.py          # Catalog & Order endpoints[span_85](start_span)[span_85](end_span)
    │       ├── services.py       # CartService, PaymentService, SupplierService[span_86](start_span)[span_86](end_span)
    │       ├── webhooks.py       # Paystack/Flutterwave webhook listeners[span_87](start_span)[span_87](end_span)
    │       └── urls.py           # /api/builder/ routing[span_88](start_span)[span_88](end_span)
    └── manage.py
