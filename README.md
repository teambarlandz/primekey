# Primekey Homes & Properties Ltd

> A high-converting digital platform for the Nigerian real estate ecosystem — combining dynamic property search, a 2-Week Concierge service, landlord acquisition funnel, and an optional B2B builder marketplace.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Django-4.x-092E20?logo=django)](https://www.djangoproject.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Dev-003B57?logo=sqlite)](https://www.sqlite.org/)
[![NDPR Compliant](https://img.shields.io/badge/NDPR-Compliant-green)](https://ndpr.gov.ng/)

---

## Project Overview

Primekey Homes bridges trust gaps in Nigerian real estate through three pathways:

| Pathway | Status | Description |
|---------|--------|-------------|
| **Buyer & Renter** | 🟡 Phase 1 — In Progress | Property search with 2-Week Concierge fallback + 2-hour agent SLA |
| **Landlord & Owner** | ⬜ Phase 2 — Planned | Property intake, valuation, agent inspection booking |
| **Builder & Developer** | ⏸ Phase 3 — Optional | B2B procurement portal for building materials (Flutterwave/Paystack) |

### Key Differentiators

- **2-Week Concierge**: When search returns zero results, users get a dedicated sourcing service — not a dead end
- **2-Hour SLA**: Every concierge lead gets a 2-hour response commitment from agents
- **NDPR by Design**: Immutable consent logs, 6-month auto-anonymization, data export/erasure endpoints
- **Auth Interception**: Ungated discovery → OTP gate only on high-intent actions (save, book, favorite)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS APP ROUTER FRONTEND                │
│   Brand Navy #04164a · Lavender #f3f0ff · Poppins/Lora      │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API / JSON
┌────────────────────────────▼────────────────────────────────┐
│              DJANGO REST FRAMEWORK BACKEND                   │
│  ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌────────────┐   │
│  │   CRM    │ │ Properties│ │ Landlords │ │ Compliance │   │
│  └────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬──────┘   │
│       │             │             │             │            │
│  ┌────┴─────────────┴─────────────┴─────────────┴──────┐   │
│  │                SQLite (dev) / PostgreSQL (prod)      │   │
│  └──────────────────────────────────────────────────────┘   │
```

**Backend Bounded Contexts** (Django apps):
- `apps/crm` — Concierge leads, SLA tracking, lead scoring
- `apps/properties` — Property catalog, search, media
- `apps/landlords` — Owner intake, appointments, profiles
- `apps/compliance` — NDPR consent logs, anonymization, data rights
- `apps/ecommerce` — Phase 3: B2B catalog, cart, payments

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, GSAP, React Hook Form, Zod, Axios |
| **Backend** | Python 3.10+, Django 4.x, Django REST Framework, SQLite (dev) / PostgreSQL (prod) |
| **DevOps** | Docker, docker-compose, GitHub Actions (planned), VPS deployment |
| **Compliance** | NDPR consent logging, automated retention, data subject rights APIs |

---

## Quick Start

### Prerequisites

- Node.js 18+ / 20+
- Python 3.10+
- Git

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd primekey

# Frontend
cd frontend
npm install
cp .env.example .env.local   # configure NEXT_PUBLIC_API_URL if needed
cd ..

# Backend
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 2. Run Migrations

```bash
cd backend
python manage.py migrate
cd ..
```

### 3. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate    # Windows
python manage.py runserver
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The backend API runs on [http://localhost:8000](http://localhost:8000).

> **Note:** The project uses SQLite for local development — no external database server needed. For production, switch to PostgreSQL by updating `core/settings.py`.

---

## Project Structure

```
primekey-homes/
├── frontend/                     # Next.js App Router
│   ├── app/                      # Pages & layouts
│   │   ├── page.tsx              # Landing page
│   │   ├── search/page.tsx       # Property search portal
│   │   ├── property/[id]/page.tsx # Property detail
│   │   └── landlord/page.tsx     # Landlord acquisition
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── search/               # Search & filter components
│   │   ├── concierge/            # 2-Week Concierge modal/form
│   │   ├── landlord/             # Landlord pathway components
│   │   └── auth/                 # Auth Intercept Sheet
│   ├── lib/
│   │   ├── api-client.ts         # Backend API wrapper
│   │   ├── animations.ts         # GSAP helpers
│   │   ├── utils.ts              # cn() class merger
│   │   └── validations/          # Zod schemas
│   └── docs/context/             # Project documentation
│
└── backend/                      # Django Modular Monolith
    ├── core/                     # Settings, URLs, WSGI/ASGI
    └── apps/
        ├── crm/                  # Concierge leads & SLA
        ├── properties/           # Property catalog & search
        ├── landlords/            # Owner intake & bookings
        ├── compliance/           # NDPR & data rights
        └── ecommerce/            # Phase 3: Builder marketplace
```

---

## Key Features Implemented

### Phase 1 — Buyer/Renter Pathway (Units 1.1–1.7 Complete)

- **Landing Page** — Hero, Social Proof, Benefits, FAQ, Final CTA, Floating Contact
- **Property Search** — Location, price range (dual slider), property type, bedrooms
- **Results Grid** — Property cards with image, price, specs, verification badge
- **Zero-Results → Concierge** — Automatic modal trigger with pre-filled filters
- **Concierge Form** — RHF + Zod validation, Nigerian phone regex, NDPR consent checkbox
- **Backend API** — `POST /api/crm/submit-concierge/` with DRF serializer, consent logging
- **Database** — `ConciergeLead` (UUID, SLA deadline, lead score), `ConsentLog` (immutable audit)

### In Progress (Unit 1.10)

- Frontend-backend search integration (replace mock data with `/api/search`)
- ConciergeModal form reset bug fix
- OTP authentication flow for Auth Intercept Sheet

---

## NDPR Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Explicit Consent** | Mandatory checkbox on all personal data forms |
| **Consent Audit Log** | `ConsentLog` model — IP, user-agent, timestamp, consent text |
| **Retention (6 months)** | `anonymize_leads` management command (scheduled via cron) |
| **Right of Access** | `GET /api/compliance/export-data/` |
| **Right to Erasure** | `DELETE /api/compliance/forget-me/` |

---

## Development Workflow

### Code Standards

- **TypeScript strict** — No `any`, explicit interfaces, `z.infer` for forms
- **Path aliases** — `@/components/*`, `@/lib/*`, `@/app/*`
- **Component discipline** — `'use client'` only when needed
- **Forms** — React Hook Form + Zod + shadcn/ui `<Form>` wrapper
- **Animations** — GSAP via `useGSAP()` hook, `prefers-reduced-motion` guard

### Commands

```bash
# Frontend
cd frontend
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
npm run typecheck # tsc --noEmit

# Backend
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py test
python manage.py anonymize_leads  # NDPR retention
```

---

## Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Backend (`.env`)

```env
DEBUG=True
SECRET_KEY=your-secret-key
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

## Deployment

### VPS (Production)

1. **Provision** — Ubuntu 22.04, Docker, Nginx, Certbot (SSL)
2. **Configure** — Production `.env` files, `ALLOWED_HOSTS`, `SECURE_SSL_REDIRECT=True`
3. **Deploy** — `docker-compose -f docker-compose.prod.yml up -d --build`
4. **Cron** — Schedule `python manage.py anonymize_leads` via system cron
5. **Monitor** — Health checks, log aggregation, uptime alerts

### CI/CD (Planned)

```yaml
# .github/workflows/ci.yml
- Lint (ESLint + Ruff)
- Typecheck (tsc + mypy)
- Test (Vitest + pytest)
- Build (Next.js + Docker)
- Deploy (SSH to VPS on main branch)
```

---

## Documentation

All project context lives in `frontend/docs/context/`:

| File | Purpose |
|------|---------|
| `project-overview.md` | Vision, brand, pathways, stack |
| `architecture.md` | System diagram, Django apps, DB schema, workflows |
| `userflow.md` | Mermaid diagrams, step-by-step flows, auth interception |
| `progress-tracker.md` | Living task board with status & session notes |
| `code-standards.md` | Coding conventions, component patterns, GSAP rules |
| `ui-context.md` | Design tokens, component inventory, localization guide |
| `dependencies.md` | Exact versions & install commands |
| `deployment-ops.md` | VPS deployment, Docker, SSL, pg_cron |
| `ai-workflow-rules.md` | Agent collaboration rules |

---

## Contributing

1. Read `frontend/docs/context/code-standards.md` and `architecture.md`
2. Check `progress-tracker.md` for current phase & unit
3. Create feature branch: `git checkout -b feat/unit-1.10-search-integration`
4. Follow commit convention: `feat:`, `fix:`, `docs:`, `refactor:`
5. Run `npm run lint && npm run typecheck` (frontend) / `pytest` (backend)
6. Open PR with description linking to progress-tracker unit

---

## License

Proprietary — Primekey Homes & Properties Ltd. All rights reserved.

---

## Contact

- **Website**: [primekeyhomes.com](https://primekeyhomes.com) (placeholder)
- **Email**: hello@primekeyhomes.com
- **Phone**: +234 800 PRIMEKEY
- **Address**: 12 Adeola Odeku Street, Victoria Island, Lagos, Nigeria