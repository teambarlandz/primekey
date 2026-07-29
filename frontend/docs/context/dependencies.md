# Dependencies Reference

This document lists all dependencies required for the self-hosted real estate platform project for **Primekey Homes and Properties Ltd.** Use this as a checklist to install everything manually before starting development.

## System Requirements

| Tool | Version | Purpose |
| --- | --- | --- |
| Node.js | v18.x or v20.x | Next.js frontend runtime |
| Python | 3.11.x or 3.12.x | Django backend runtime |
| PostgreSQL | 15.x | Primary database |
| Docker | Latest | Containerization (optional for local dev) |
| Git | Latest | Version control |
| npm or pnpm | Latest | Node package manager |

## Frontend Dependencies (Next.js)

### Core Dependencies

| Package | Version | Purpose |
| --- | --- | --- |
| react | ^18.2.0 | React library |
| react-dom | ^18.2.0 | React DOM rendering |
| next | ^14.0.0 | Next.js framework |
| typescript | ^5.0.0 | TypeScript support |
| tailwindcss | ^3.3.0 | Utility-first CSS framework |
| postcss | ^8.4.0 | CSS processing |
| autoprefixer | ^10.4.0 | CSS vendor prefixing |
| **gsap** | **^3.12.5** | **Professional-grade animation library (Core - 100% Free)** |
| **@gsap/react** | **^2.1.1** | **Official React hooks and utilities for GSAP** |
| **swr** | **^2.2.0** | **Stale-while-revalidate data fetching** |

### UI Components (shadcn/ui)

| Package | Version | Purpose |
| --- | --- | --- |
| @radix-ui/react-dialog | ^1.0.5 | Accessible modal/dialog |
| @radix-ui/react-checkbox | ^1.0.4 | Accessible checkbox |
| @radix-ui/react-label | ^2.0.2 | Accessible label |
| @radix-ui/react-select | ^2.0.0 | Accessible dropdown |
| @radix-ui/react-slot | ^1.0.2 | Slot composition |
| @radix-ui/react-avatar | ^1.0.4 | Avatar component |
| @radix-ui/react-alert-dialog | ^1.0.5 | Alert modal |
| @radix-ui/react-tabs | ^1.0.4 | Tabs component |
| @radix-ui/react-toast | ^1.1.5 | Toast notifications |
| lucide-react | ^0.300.0 | Icon library |

### Form Handling & Validation

| Package | Version | Purpose |
| --- | --- | --- |
| react-hook-form | ^7.45.0 | Form state management |
| @hookform/resolvers | ^3.3.0 | Zod integration for React Hook Form |
| zod | ^3.22.0 | Schema validation |

### Development Dependencies

| Package | Version | Purpose |
| --- | --- | --- |
| @types/node | ^20.0.0 | Node.js TypeScript types |
| @types/react | ^18.2.0 | React TypeScript types |
| @types/react-dom | ^18.2.0 | React DOM TypeScript types |
| eslint | ^8.0.0 | Linting |
| eslint-config-next | ^14.0.0 | Next.js ESLint config |
| prettier | ^3.0.0 | Code formatting |
| @typescript-eslint/eslint-plugin | ^6.0.0 | TypeScript ESLint plugin |
| @typescript-eslint/parser | ^6.0.0 | TypeScript ESLint parser |
| **husky** | **^8.0.0** | **Git hooks** |
| **lint-staged** | **^15.0.0** | **Pre-commit linting** |

## Backend Dependencies (Django)

| Package | Version | Purpose |
| --- | --- | --- |
| Django | >=4.0.0 | Web framework |
| djangorestframework | latest | REST API framework |
| django-cors-headers | ==4.3.0 | CORS handling |
| psycopg2-binary | ==2.9.9 | PostgreSQL adapter |
| python-dotenv | ==1.0.0 | Environment variables |
| django-environ | latest | Settings management |
| gunicorn | ==21.2.0 | WSGI server |
| djangorestframework-simplejwt | ==5.3.0 | JWT authentication |
| django-allauth | ==0.60.0 | Social auth |
| django-csp | latest | Content Security Policy |
| django-q2 | latest | Task queue |
| **django-ratelimit** | **==4.1.0** | **Rate limiting** |
| **drf-spectacular** | **==0.27.0** | **OpenAPI schema generation** |
| pytest | ==8.0.0 | Testing |
| pytest-django | ==4.8.0 | Django test integration |
| factory-boy | ==3.3.0 | Test fixtures |
| Faker | >=22.0.0 | Fake data generation |
| black | >=24.0.0 | Code formatting |
| flake8 | ==7.0.0 | Linting |
| mypy | ==1.8.0 | Type checking |
| isort | ==5.13.0 | Import sorting |

## Frontend Installation Command

```bash
# Using npm - Core dependencies (including GSAP, SWR)
npm install react@^18.2.0 react-dom@^18.2.0 next@^14.0.0 typescript@^5.0.0 tailwindcss@^3.3.0 postcss@^8.4.0 autoprefixer@^10.4.0 gsap@^3.12.5 @gsap/react@^2.1.1 @radix-ui/react-dialog@^1.0.5 @radix-ui/react-checkbox@^1.0.4 @radix-ui/react-label@^2.0.2 @radix-ui/react-select@^2.0.0 @radix-ui/react-slot@^1.0.2 @radix-ui/react-avatar@^1.0.4 @radix-ui/react-alert-dialog@^1.0.5 @radix-ui/react-tabs@^1.0.4 @radix-ui/react-toast@^1.1.5 lucide-react@^0.300.0 react-hook-form@^7.45.0 @hookform/resolvers@^3.3.0 zod@^3.22.0 swr@^2.2.0

# Dev dependencies
npm install -D @types/node@^20.0.0 @types/react@^18.2.0 @types/react-dom@^18.2.0 eslint@^8.0.0 eslint-config-next@^14.0.0 prettier@^3.0.0 @typescript-eslint/eslint-plugin@^6.0.0 @typescript-eslint/parser@^6.0.0 husky@^8.0.0 lint-staged@^15.0.0

# Initialize husky
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

## Backend Installation Command

```bash
pip install -r requirements.txt
```