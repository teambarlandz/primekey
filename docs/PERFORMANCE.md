# Performance Specification — Primekey Homes

> Status: draft · Version: 0.1 · Owner: @teambarlandz · Last updated: 2026-09-30
> Budgets are gate criteria for go-live. Measured against the production profile
> in `render.yaml` (Render `starter` web service = 0.5 GB RAM / 0.5 CPU, Vercel
> for the frontend) over a Nigerian 4G network profile unless stated otherwise.
> The `docker stats` rows below are now local-compose numbers only.

## 1. Budgets (summary)

| Metric | Budget | Where measured |
|--------|--------|----------------|
| Landing page LCP | < 2.5 s (p75, 4G) | Lighthouse (mobile) |
| First load TTFB | < 1.0 s (p95) | curl / devtools |
| Search API (`GET /api/v1/properties/search/`) | < 500 ms p95 | API probe, fresh cache |
| Property detail API | < 200 ms p95 | API probe |
| Concierge submit (`POST /api/v1/crm/submit-concierge/`) | < 1.0 s p95 | API probe |
| Health check (`GET /api/health`) | < 500 ms p95 | uptime monitor |
| OTP send / verify | < 1.5 s / < 500 ms p95 | API probe |
| Agent dashboard aggregates | < 1.0 s p95 (1k+ leads) | API probe |
| Indexed search query (DB) | < 200 ms @ 10k properties | `EXPLAIN ANALYZE` |
| SLA breach sweep cadence | <= 5 min (django-q schedule) | job logs |
| Backend memory (local compose) | <= 1 GB (compose limit) | `docker stats` |
| Frontend memory (local compose) | <= 512 MB (compose limit) | `docker stats` |
| Gunicorn worker memory (production) | stay under the plan's 512 MB across 3 workers | Render metrics |
| CI pipeline wall time (green) | < 20 min | GitHub Actions |

## 2. Frontend

- Public routes are server-rendered (SEO); `'use client'` only where
  interactive. Fonts load via `next/font` (no render-blocking external fetch).
- Static assets cached `1y, immutable` at the nginx edge; JS/CSS chunks are
  hashed by the Next build.
- Images use `next/image` with explicit sizes, decoded at display size x DPR.
- GSAP animations honor `prefersReducedMotion`; ScrollTrigger cleans up via
  `useGSAP` (no leaks on navigation).
- Search filters validate client-side (zod) before hitting the API; the
  zero-result path triggers the Concierge modal without extra round trips.

## 3. Backend / API

- DRF pagination (page_size 50, max 50) bounds payloads; search filters map to
  indexed columns (purpose, property_type, price, city, area, bedrooms).
- Featured-first ordering is a boolean column, not a per-query computation.
- Redis backs sessions, rate-limit counters, and the django-q broker;
  `IGNORE_EXCEPTIONS: True` means a Redis outage degrades, never 500s.
- Contact-form email is synchronous today; move to a django-q `async_task` if
  volume grows.
- The 2-hour SLA clock is set at lead creation; the `check_sla_alerts` sweep
  runs on a django-q schedule (target <= 5 min) so breach detection latency is
  bounded by cadence, not by traffic.

## 4. Database

- UUID PKs + targeted indexes (see DATA_MODEL.md section 14).
- Retention command (`anonymize_leads`) batches by `created_at` window to
  avoid long locks during the 180-day scrub.
- Scheduled jobs (SLA sweep, OTP cleanup) run as django-q cron tasks, not as
  page-request work.

## 5. Tooling & measurement

- Backend: `EXPLAIN ANALYZE` on hot queries; `pg_stat_statements` for slow
  queries post-launch.
- Frontend: Lighthouse CI budget check (LCP, CLS < 0.1) as a manual gate
  before go-live; not yet wired into CI.
- Ops: `/api/health` pinged every 5 min by the uptime monitor; response time
  is visible in the monitor's history.
- Docker: `docker stats` drift check weekly (post-launch ops rhythm).

## 6. Known risks

- Render `starter` (0.5 GB) is the tightest resource in production: gunicorn runs
  3 workers plus `--max-requests 1200 --max-requests-jitter 100` to recycle them,
  so watch for OOM restarts and move to a larger plan before tuning elsewhere.
- Redis is on the `free` plan and can be evicted, which fails closed for cache,
  rate limits and axes — plan for a paid instance.
- Slow search as properties grow: mitigated by the indexes above; revisit
  with materialized filtering or Postgres FTS if > 50k rows.
- Email latency on concierge/contact submissions depends on SMTP (Hostinger);
  keep email out of the measured request path.