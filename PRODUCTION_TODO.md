# TODO: Production Readiness Fixes

## P0 — Critical (App non-functional without these)

- [x] **01: Integrate SMS provider for OTP** — Added `apps/otp_auth/services.py` with Termii integration. Console fallback in dev. Env vars: `SMS_PROVIDER`, `TERMII_API_KEY`, `TERMII_SENDER_ID`, `TERMII_CHANNEL`.
- [x] **02: Add structured logging** — Added `LOGGING` dict to `core/settings.py` with verbose formatter, console handler, and loggers for `django`, `django.server`, and `apps`. Configurable via `LOG_LEVEL` env var.
- [x] **03: Add health check endpoint** — Created `GET /health/` at `core/health.py`. Checks app, database (SELECT 1), and Redis. Returns 200 or 503 with per-service status. Fixed Docker Compose healthcheck target.
- [x] **04: Fail on missing SECRET_KEY** — Added `ImproperlyConfigured` check: if `DEBUG=False` and SECRET_KEY is the insecure default, Django refuses to start. Verified: `manage.py check` passes.

## P1 — Security & Reliability

- [x] **05: Add CSRF_TRUSTED_ORIGINS** — Added `CSRF_TRUSTED_ORIGINS` env var, defaults to `CORS_ALLOWED_ORIGINS`. Works behind reverse proxy with HTTPS.
- [x] **06: Fix Q_CLUSTER config conflict** — Removed `"orm": "default"` from `Q_CLUSTER`. Now uses Redis as broker as intended. Worker Docker service will actually use Redis.
- [x] **07: Configure file storage backend** — Conditional: `AWS_STORAGE_BUCKET_NAME` set → uses S3 via `django-storages` + `boto3`. Empty → local `FileSystemStorage`. Added env vars for region, custom domain, ACL.
- [x] **08: Add Sentry for error tracking** — Added `sentry-sdk` with Django integration. Initializes when `SENTRY_DSN` env var is set. Configurable `SENTRY_TRACES_SAMPLE_RATE`. Environment tagged as production/development based on DEBUG.
- [x] **09: Default DEBUG to False** — Changed `DEBUG=(bool, True)` → `DEBUG=(bool, False)`. App refuses to start in debug mode unless explicitly opted in via env.
- [x] **10: Add whitenoise for static files** — Added `whitenoise` to middleware (after SecurityMiddleware) and `STATICFILES_STORAGE`. Gunicorn now serves compressed static files. Added `whitenoise>=6.5.0` to requirements.
- [x] **11: Remove django-allauth** — Removed from `requirements.txt`. Was never in `INSTALLED_APPS` or used anywhere.

## P2 — Operational Improvements

- [ ] **12: Add DRF throttling classes** — Only `django-ratelimit` on a few POST endpoints. Add `DEFAULT_THROTTLE_CLASSES` to REST_FRAMEWORK settings for global rate limiting.
- [ ] **13: Remove ecommerce placeholder** — Empty app with no models/views. Remove from `INSTALLED_APPS` and delete `apps/ecommerce/`.
- [ ] **14: Clean up landlords/services.py** — Empty file. Either implement service layer or remove.
- [ ] **15: Add manage.py check --deploy fixes** — Run `python manage.py check --deploy` and fix all flagged issues (security middleware, HSTS, etc.).
- [ ] **16: Add API response envelope** — Inconsistent response format across views. Standardize on `{ "data": ..., "error": null, "meta": { ... } }` or similar.
