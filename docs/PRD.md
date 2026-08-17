# Product Requirements Document — Primekey Homes

> Status: draft · Version: 0.2 · Owner: @teambarlandz · Last updated: 2026-08-17
> Live implementation detail: `frontend/docs/context/*` (userflow, ui-context,
> architecture, progress-tracker).

## 1. Overview

Primekey Homes and Properties Ltd is a Nigerian real estate platform:
dynamic property search, a high-touch 2-Week Concierge service for buyers and
renters, a landlord acquisition funnel (intake + inspection booking), an agent
dashboard, and an optional Phase 3 B2B builder marketplace. Localized for the
Nigerian market: Naira pricing, Nigerian hubs, Nigerian phone validation,
NDPR-compliant by design.

### 1.1 Goals (non-negotiable)

- G1: Buyer/renter lead engine with zero-result → Concierge conversion funnel.
- G2: 2-hour SLA on every concierge lead (score, deadline, breach alerts).
- G3: Landlord acquisition: gated registration → 3-step intake → appointment.
- G4: NDPR compliance by design (consent logs, retention, data-subject rights).
- G5: Agent back-office to action leads, intakes, appointments, documents.

### 1.2 Non-goals (v1)

- NG1: Phase 3 builder marketplace (gated on Phase 1/2 success metrics).
- NG2: Consumer passwords (phone OTP only; staff keep password auth).
- NG3: Multi-region / scale-out (single VPS monolith until metrics justify).
- NG4: Native mobile apps (responsive web is the v1 client).

## 2. Pathways

| Pathway | Audience | Core mechanism |
|---------|----------|----------------|
| Buyer/Renter (Phase 1) | High-intent buyers/renters | Search → zero-result → Concierge modal → lead + SLA |
| Landlord/Owner (Phase 2) | Property owners | Landing → registration → intake → appointment → agent review |
| Builder/Developer (Phase 3, optional) | Developers/suppliers | B2B catalog → cart → checkout → supplier charge |

## 3. Priority backlog (product)

| ID | Item | Priority | Status |
|----|------|----------|--------|
| P-01 | WhatsApp inbound webhook (threads close the loop) | P1 | Open |
| P-02 | Buyer inquiry dashboard views (PropertyInquiry leads) | P1 | Open |
| P-03 | Document vault agent review UI polish | P2 | Partial |
| P-04 | Saved-search alerts (trigger on new matching listings) | P2 | Open |
| P-05 | Listing moderation queue for intakes → published properties | P1 | Open |
| P-06 | Phase 3 builder portal | P2 (gated) | Stubbed |
| P-07 | Consumer password-less account management (data export in-app) | P2 | Open |

## 4. Risks register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| 4GB VPS memory exhaustion (Next + Django + Postgres + Redis + worker) | Medium | High | Compose memory limits; 8GB recommended tier documented |
| SMTP (Hostinger) deliverability for contact/concierge emails | Medium | Medium | Console backend in dev; SMTP env-documented; keep email off request path |
| OTP abuse / SMS cost at scale | Medium | Medium | Per-phone lockout (3 strikes / 5 min), expiry, rate limits, IP binding |
| Lead quality decay (no-show appointments) | Medium | Medium | Gated registration, verification status, agent approval workflow |
| NDPR audit failure (missing consent or retention evidence) | Low | High | Immutable consent logs, anonymization audit hashes, dedicated compliance app |
| Redis outage degrading sessions/queue | Low | Medium | Cache IGNORE_EXCEPTIONS; DB-backed sessions as fallback path in tests |
| Django/Next dependency vulnerabilities | Medium | Medium | pip-audit/npm audit in CI; quarterly patch cadence (RELEASE.md) |
| Search performance at scale | Low (now) | Medium | Indexed columns; revisit FTS above 50k rows (PERFORMANCE.md) |
| Key-person dependency (single maintainer) | High | Medium | Doc set + handoff protocol in deployment-ops.md |

## 5. Metrics (post-launch)

Phase 3 gate metrics (from progress-tracker):

- Concierge conversion rate > 15% (zero-result → lead).
- Steady lead flow: >= 5 qualified concierge leads/week sustained.
- Positive LTV:CAC (re-evaluate at 3-6 months live).

Operational dashboards (agent/admin):

- SLA breach rate (breached / total leads, weekly).
- Time-to-first-touch on leads (target < 2 h).
- Appointment confirmation rate (confirmed / booked).
- Intake → published listing conversion.
- Consent withdrawal rate (NDPR signal).

## 6. Acceptance criteria (v1 core)

1. A buyer can search, get zero results, submit the Concierge form with NDPR
   consent, and see the lead appear in the agent dashboard with a score and a
   2-hour SLA deadline.
2. A landlord can register, complete the 3-step intake, book an appointment,
   and the agent can approve/reject each stage with the landlord notified.
3. Any personal-data record is traceable to an immutable consent log row and
   is anonymized after 180 days of inactivity.
4. Unauthenticated access to dashboard/messaging endpoints returns 401/403.
5. `/api/health` returns healthy for DB + Redis; backups run daily and restore
   monthly (drill).