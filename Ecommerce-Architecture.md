# Ecommerce Architecture: PrimeKey Marketplace

## Executive Summary

PrimeKey will operate as a **managed marketplace** for building materials and equipment, following the Amazon model where buyers transact only with PrimeKey. Vendors, logistics partners, and other stakeholders are hidden from buyers. PrimeKey vets all products and vendors, providing a single trust layer.

---

## Business Model

| Aspect | Design |
|--------|--------|
| **Buyer experience** | "Sold by PrimeKey" — buyers never see vendor names |
| **Vendor model** | Vendors list products, PrimeKey approves and manages the catalog |
| **Logistics** | Hybrid: 3PL partners (GIG, Kwik, etc.) + vendor self-ship |
| **Pricing** | Flexible: PrimeKey can set prices, vendors propose with approval, or commission-based |
| **Revenue** | Commission on each sale (configurable per vendor, default 15%) |
| **Product scope** | Everything for buildings: materials, equipment, tools, furniture, appliances |

---

## Architecture Decision: Modular Monolith + DDD

**Verdict: Stick with the existing architecture.**

| Concern | Decision |
|---------|----------|
| **Modular monolith** | Yes. Simpler deployment, debugging, iteration. Jumia started this way. Microservices at 100+ engineers. |
| **DDD bounded contexts** | Yes. Each domain (Catalog, Vendors, Orders, Logistics, Pricing, Reviews) has its own models, services, API. |
| **PostgreSQL** | Required for production. JSONB product attributes, full-text search, row-level locking for inventory, complex analytics. |
| **SQLite for dev** | Acceptable. Write all code PostgreSQL-compatible, test on SQLite locally, switch at deploy. |

---

## Bounded Contexts

```
apps/ecommerce/
├── catalog/        # What buyers see
│   ├── models.py   # Category, Product, ProductImage, ProductVariant, Inventory
│   ├── services.py # SearchService, CatalogService
│   └── views.py    # Public catalog API
│
├── vendors/        # Who supplies (hidden from buyers)
│   ├── models.py   # Vendor, VendorKYC, VendorBankAccount, VendorPayout
│   ├── services.py # VendorOnboarding, VendorPerformance
│   └── views.py    # Vendor portal API
│
├── orders/         # The transaction
│   ├── models.py   # Cart, CartItem, Order, OrderItem, OrderStatusLog
│   ├── services.py # CheckoutService, OrderService
│   └── views.py    # Buyer + Admin order API
│
├── logistics/      # How it gets delivered
│   ├── models.py   # Shipment, DeliverySlot, LogisticsPartner, TrackingEvent
│   ├── services.py # ShippingCalculator, DeliveryTracker
│   └── views.py    # Logistics partner API + buyer tracking
│
├── pricing/        # Money rules
│   ├── models.py   # PricingRule, Commission, PromoCode, VendorPayout
│   ├── services.py # PriceCalculator, CommissionEngine, PayoutService
│   └── views.py    # Admin pricing API
│
└── reviews/        # Trust signals
    ├── models.py   # Review, ReviewModeration, VendorRating
    ├── services.py # ReviewAggregator
    └── views.py    # Buyer review API
```

---

## Database Schema

### Catalog (what buyers see)

```sql
-- Product categories (tree structure)
categories (
    id UUID PK,
    name VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    parent_id UUID FK -> categories,  -- nullable, for subcategories
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER,
    created_at TIMESTAMPTZ
)

-- The product listing
products (
    id UUID PK,
    vendor_id UUID FK -> vendors,     -- hidden from buyers
    category_id UUID FK -> categories,
    name VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    short_description VARCHAR(500),

    -- Pricing (flexible: PrimeKey or vendor sets)
    base_price NUMERIC(12,2),         -- vendor's cost
    retail_price NUMERIC(12,2),       -- what buyer sees
    currency VARCHAR(3) DEFAULT 'NGN',

    -- Attributes (flexible for building materials)
    attributes JSONB,                 -- {"weight": "50kg", "grade": "42.5R", "brand": "Dangote"}

    -- Status
    status VARCHAR(20) DEFAULT 'draft',  -- draft/pending_review/active/archived
    approved_by_id UUID FK -> auth_user, -- admin who approved
    approved_at TIMESTAMPTZ,

    -- SEO
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),

    -- Stats
    review_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    sales_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)

-- Product images
product_images (
    id UUID PK,
    product_id UUID FK -> products,
    image_url VARCHAR(500),
    alt_text VARCHAR(255),
    sort_order INTEGER,
    is_primary BOOLEAN DEFAULT FALSE
)

-- Inventory tracking (per product, per warehouse/location)
inventory (
    id UUID PK,
    product_id UUID FK -> products,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved INTEGER NOT NULL DEFAULT 0,  -- in carts/orders but not shipped
    location VARCHAR(255),                -- warehouse or vendor location
    reorder_point INTEGER DEFAULT 10,
    last_restocked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

### Vendor Management (hidden from buyers)

```sql
-- Vendor profile (the hidden supplier)
vendors (
    id UUID PK,
    user_id UUID FK -> auth_user,     -- for portal login
    business_name VARCHAR(255),
    business_type VARCHAR(50),        -- manufacturer/distributor/retailer/contractor
    phone VARCHAR(20),
    email VARCHAR(255),

    -- KYC
    id_type VARCHAR(50),              -- CAC/BN/TIN
    id_number VARCHAR(100),
    id_document_url VARCHAR(500),
    cac_document_url VARCHAR(500),

    -- Verification
    verification_status VARCHAR(20) DEFAULT 'pending',  -- pending/verified/rejected/suspended
    verified_by_id UUID FK -> auth_user,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Performance
    rating DECIMAL(3,2) DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    fulfillment_rate DECIMAL(5,2) DEFAULT 100,  -- % orders shipped on time

    -- Commission
    commission_rate DECIMAL(5,2) DEFAULT 15.00, -- % per sale, overridable

    -- Payout
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(20),
    bank_account_name VARCHAR(255),

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)

-- KYC document uploads
vendor_kyc_documents (
    id UUID PK,
    vendor_id UUID FK -> vendors,
    doc_type VARCHAR(50),             -- cac_cert/tin_cert/utility_bill/etc
    file_url VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ
)
```

### Orders & Payments

```sql
-- Shopping cart
carts (
    id UUID PK,
    user_id UUID FK -> auth_user,
    status VARCHAR(20) DEFAULT 'active',  -- active/abandoned/converted
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)

cart_items (
    id UUID PK,
    cart_id UUID FK -> carts,
    product_id UUID FK -> products,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2),         -- locked at time of add
    created_at TIMESTAMPTZ
)

-- Orders
orders (
    id UUID PK,
    user_id UUID FK -> auth_user,
    order_number VARCHAR(50) UNIQUE,  -- PK-ORD-20260804-001

    -- Financials
    subtotal NUMERIC(12,2),
    shipping_cost NUMERIC(12,2) DEFAULT 0,
    commission_total NUMERIC(12,2) DEFAULT 0,  -- PrimeKey's cut
    tax NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2),

    -- Status
    status VARCHAR(30) DEFAULT 'pending',
    -- pending/confirmed/processing/shipped/delivered/cancelled/refunded

    -- Payment
    payment_method VARCHAR(50),       -- flutterwave/paystack/bank_transfer
    payment_reference VARCHAR(255),
    paid_at TIMESTAMPTZ,

    -- Delivery
    shipping_address JSONB,           -- {name, phone, address, city, state, lat, lng}
    delivery_slot_id UUID FK -> delivery_slots,

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)

order_items (
    id UUID PK,
    order_id UUID FK -> orders,
    product_id UUID FK -> products,
    vendor_id UUID FK -> vendors,     -- snapshot at time of order
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2),
    vendor_payout NUMERIC(12,2),      -- what vendor gets after commission
    status VARCHAR(20) DEFAULT 'pending',  -- pending/fulfilled/cancelled
    created_at TIMESTAMPTZ
)

-- Payment transactions (audit trail)
payment_transactions (
    id UUID PK,
    order_id UUID FK -> orders,
    provider VARCHAR(50),             -- flutterwave/paystack
    provider_reference VARCHAR(255),
    amount NUMERIC(12,2),
    currency VARCHAR(3) DEFAULT 'NGN',
    status VARCHAR(20),               -- pending/success/failed/refunded
    provider_response JSONB,
    created_at TIMESTAMPTZ
)
```

### Logistics

```sql
-- Logistics partners (3PL companies)
logistics_partners (
    id UUID PK,
    name VARCHAR(255),
    slug VARCHAR(100) UNIQUE,
    api_key VARCHAR(255),
    api_base_url VARCHAR(500),
    coverage_areas JSONB,             -- ["Lagos", "Abuja", "PH"]
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ
)

-- Shipments
shipments (
    id UUID PK,
    order_id UUID FK -> orders,
    vendor_id UUID FK -> vendors,     -- who ships
    logistics_partner_id UUID FK -> logistics_partners,  -- nullable (vendor may self-ship)

    tracking_number VARCHAR(255),
    status VARCHAR(30) DEFAULT 'pending',
    -- pending/picked_up/in_transit/out_for_delivery/delivered/failed

    shipped_at TIMESTAMPTZ,
    estimated_delivery TIMESTAMPTZ,
    actual_delivery TIMESTAMPTZ,

    shipping_address JSONB,
    weight_kg DECIMAL(8,2),
    dimensions JSONB,                 -- {length, width, height}

    cost NUMERIC(12,2),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)

-- Tracking events (audit trail)
tracking_events (
    id UUID PK,
    shipment_id UUID FK -> shipments,
    status VARCHAR(30),
    location VARCHAR(255),
    description TEXT,
    event_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ
)

-- Delivery slots (available time windows)
delivery_slots (
    id UUID PK,
    date DATE,
    start_time TIME,
    end_time TIME,
    max_orders INTEGER DEFAULT 50,
    current_orders INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
)
```

---

## Django Admin Design

### Three Interfaces

| Interface | Audience | Tech | Access |
|-----------|----------|------|--------|
| **Django Admin** (existing, django-unfold) | PrimeKey staff only | Django | Full system access |
| **Vendor Portal** (Next.js `/vendor/*`) | Registered vendors | Next.js | Scoped to their own data |
| **Buyer Frontend** (existing `/`) | Buyers | Next.js | Public catalog + auth actions |

**Key principle:** Django admin is for PrimeKey operations only. Vendors never see Django admin. They get a polished Next.js experience matching the buyer frontend quality.

### Admin Role Hierarchy (PrimeKey Staff)

```
Super Admin (CEO/CTO)
├── Product Manager
│   ├── Approve/reject products
│   ├── Manage categories
│   └── Set pricing rules
├── Vendor Manager
│   ├── Approve/reject vendors
│   ├── Review KYC documents
│   ├── Set commission rates
│   └── Suspend vendors
├── Order Manager
│   ├── Process orders
│   ├── Handle refunds
│   └── Manage cancellations
├── Logistics Manager
│   ├── Assign logistics partners
│   ├── Track shipments
│   └── Handle delivery issues
└── Finance
    ├── Process vendor payouts
    ├── View revenue reports
    └── Manage commission structures
```

---

## Access Control

| Role | Can Do |
|------|--------|
| **Buyer (anon)** | Browse catalog, search, view products |
| **Buyer (auth)** | + Cart, checkout, track orders, leave reviews, request refunds |
| **Vendor (verified)** | + Manage their products, view their orders, update inventory, track payouts |
| **Admin (staff)** | + Approve vendors/products, process all orders, manage logistics, handle payouts |

---

## API Endpoints

```
# Public catalog (buyer frontend)
GET    /api/v1/catalog/categories/
GET    /api/v1/catalog/products/
GET    /api/v1/catalog/products/{slug}/

# Buyer (authenticated, buyer frontend)
POST   /api/v1/cart/items/
GET    /api/v1/cart/
POST   /api/v1/orders/checkout/
GET    /api/v1/orders/
GET    /api/v1/orders/{id}/
POST   /api/v1/reviews/

# Vendor portal (Next.js /vendor/* frontend)
POST   /api/v1/vendor/auth/login/          # OTP-based vendor login
GET    /api/v1/vendor/dashboard/            # Summary stats
GET    /api/v1/vendor/products/             # List vendor's products
POST   /api/v1/vendor/products/             # Create product (goes to draft)
PATCH  /api/v1/vendor/products/{id}/        # Update product
GET    /api/v1/vendor/orders/               # List vendor's orders
PATCH  /api/v1/vendor/orders/{id}/fulfill/  # Mark order as shipped
GET    /api/v1/vendor/payouts/              # View payout history
GET    /api/v1/vendor/profile/              # Vendor profile
PATCH  /api/v1/vendor/profile/              # Update profile

# Admin (Django admin only — PrimeKey staff)
GET    /api/v1/admin/vendors/
PATCH  /api/v1/admin/vendors/{id}/approve/
GET    /api/v1/admin/products/
PATCH  /api/v1/admin/products/{id}/approve/
GET    /api/v1/admin/orders/
POST   /api/v1/admin/orders/{id}/refund/
GET    /api/v1/admin/logistics/shipments/
```

---

## Key Design Decisions

### 1. Product Approval: Manual Admin Approval
Every product goes to `status=draft` on creation. Admin must approve before it goes live. This ensures quality control for building materials where wrong products can cause structural failures.

### 2. Vendor Portal: Separate Next.js Frontend (`/vendor/*`)
Vendors get a dedicated Next.js portal at `/vendor/*` with their own layout, auth, and dashboard. This provides a polished experience matching the buyer frontend. Django admin remains PrimeKey-only. Vendor API endpoints are scoped — vendors can only access their own data via authenticated + role-checked views.

### 3. Pricing: Flexible
- **PrimeKey sets price**: Vendor submits cost, PrimeKey sets retail price (highest control)
- **Vendor proposes, PrimeKey approves**: Vendor suggests price, admin can override
- **Commission-based**: Vendor sets price, PrimeKey takes configurable % per sale
- All three modes can coexist, configured per vendor or per product category

### 4. Logistics: Hybrid
- **3PL integration**: GIG Logistics, Kwik Delivery, etc. via API
- **Vendor self-ship**: Vendors can ship directly, PrimeKey tracks
- **PrimeKey warehouse**: Future phase — PrimeKey receives goods, ships to buyers
- Logistics partner assigned per order based on location, weight, and SLA

### 5. Product Attributes: JSONB
Building materials have wildly different attributes (cement has grade/weight/bag-size, tiles have dimensions/material/finish, tools have brand/warranty/power-source). JSONB allows flexible attributes without schema changes.

---

## PostgreSQL Requirements (Production)

| Feature | Why PostgreSQL |
|---------|---------------|
| JSONB product attributes | Indexed flexible schema for product variants |
| Full-text search | `tsvector`/`tsquery` for product search without Elasticsearch |
| Row-level locking | `SELECT ... FOR UPDATE` for inventory during checkout |
| UUID PKs | Native `gen_random_uuid()` |
| Complex analytics | Window functions, CTEs for vendor/revenue reporting |
| JSONB indexing | GIN index on attributes for filtered search |

**For local dev**: SQLite is fine. All models use standard Django ORM (no raw SQL). JSONB fields work as JSON text in SQLite. Switch to PostgreSQL at deploy.

---

## Migration Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Create `apps/ecommerce/catalog/` — Category, Product, ProductImage, Inventory models
- [ ] Create `apps/ecommerce/vendors/` — Vendor, VendorKYC models
- [ ] Django admin configuration for product and vendor management
- [ ] Public catalog API (categories, products, search)

### Phase 2: Orders (Week 3-4)
- [ ] Create `apps/ecommerce/orders/` — Cart, Order, OrderItem models
- [ ] Create `apps/ecommerce/pricing/` — Commission, PricingRule models
- [ ] Checkout flow and order management
- [ ] Payment integration (Flutterwave/Paystack)

### Phase 3: Logistics (Week 5-6)
- [ ] Create `apps/ecommerce/logistics/` — Shipment, LogisticsPartner models
- [ ] 3PL API integration (GIG, Kwik)
- [ ] Delivery tracking and status updates

### Phase 4: Vendor Portal (Week 7-8)
- [ ] Next.js `/vendor/*` pages — login, dashboard, products, orders, payouts
- [ ] Vendor API endpoints (scoped to authenticated vendor)
- [ ] Vendor product management (create, edit, update stock)
- [ ] Vendor order fulfillment (mark as shipped)
- [ ] Vendor payout tracking

### Phase 5: Reviews & Polish (Week 9-10)
- [ ] Create `apps/ecommerce/reviews/` — Review, ReviewModeration models
- [ ] Review aggregation and vendor ratings
- [ ] Admin analytics dashboard
- [ ] Load testing and optimization

---

## Commission Structure

```
Default commission: 15% per sale

Per-vendor override:
  - High-volume vendors: 10%
  - New vendors: 20%
  - Exclusive vendors: 8%

Per-category override:
  - Heavy materials (cement, blocks): 12%
  - Fixtures (tiles, pipes): 18%
  - Equipment/tools: 15%
  - Furniture/appliances: 20%

Payout schedule:
  - Weekly payouts (every Monday)
  - Minimum payout: ₦50,000
  - Payment: Bank transfer via Flutterwave/Paystack
```

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| **Vendor data isolation** | Vendors can only see their own products/orders via scoped querysets |
| **Payment security** | Never store card details. Use Flutterwave/Paystack tokenization. |
| **Inventory race conditions** | `SELECT ... FOR UPDATE` during checkout. Atomic stock decrement. |
| **Admin access** | django-unfold role-based. Staff accounts with MFA. |
| **File uploads** | S3 with signed URLs. Validate file types. Scan for malware. |
| **API rate limiting** | DRF throttling on all endpoints. Stricter on checkout/payment. |
| **NDPR compliance** | Consent logging for vendor data. Right to erasure for vendor accounts. |
