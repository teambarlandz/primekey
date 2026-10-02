# PRODUCTION_READY.md

Milestone plan for taking Primekey Homes to production.
**Topology:** Next.js frontend on **Vercel**, Django REST API on **Render**, PostgreSQL + Redis on **Render**, and **Resend as the only outbound transactional service**. SMS OTP via Sendchamp was removed to cut production cost — **all OTP codes are delivered by email**.

Every item below is either ✅ verified working today, 🔧 a change I will make in code, or 👤 an action only you can perform (credentials, accounts, DNS).

---

## 0. Current state (verified 2026-09-30)

| Area | Status | Evidence |
|---|---|---|
| CI pipeline | ✅ green | Run #38: lint, typecheck, unit tests, build, migrations, security scan, **E2E (Cypress)** all pass |
| OTP auth (end-to-end) | ✅ built, 🔑 no key | `backend/apps/otp_auth/`, `frontend/components/auth/OtpAuthCard.tsx` → `lib/api-client.ts` → `/api/v1/auth/otp/*` |
| Email OTP (only channel) | 🔑 awaiting key | `settings.py:153` `RESEND_API_KEY` → `services.py:20` `send_otp_via_resend()` → `https://api.resend.com/emails` |
| SMS OTP (Sendchamp) | ⛔ removed | Code, settings, env vars, DB columns and UI deleted — see Milestone M0a |
| Contact-form email | ✅ wired, 🔑 awaiting creds | `settings.py:138` SMTP backend + `render.yaml` declares Hostinger vars |
| Public endpoints | ✅ wired | `/api/v1/properties/search/`, `/api/v1/crm/submit-concierge/`, `/api/v1/landlords/register|intakes|appointments`, `/api/v1/careers/*`, `/api/v1/contact/` |
| Static assets | ✅ wired | WhiteNoise (already in `MIDDLEWARE`), `collectstatic` in the `render.yaml` build command |
| User uploads | ✅ disk declared | `disk:` block mounts `/var/data`; `MEDIA_ROOT`/`PROTECTED_STORAGE_DIR` are served or gated |
| Background jobs | ✅ wired | Django-Q worker; OTP cleanup schedule auto-created on `post_migrate` (`apps/otp_auth/apps.py`) |
| Deploy automation | ✅ decided (option A) | Render + Vercel deploy from git; CI only gates merges |
| Payments (Paystack/Flutterwave) | ⛔ intentionally deferred | Phase 3; referenced only in legal copy (`terms`, `privacy`) as future intent |
| Maps / geocoding | ⛔ none used | no map SDK or geocoding call anywhere in the codebase |
| WhatsApp | ✅ no API needed | `wa.me` deep links + internal thread log only — see §4 |

The only external services the code contacts are `api.resend.com` (OTP mail) and `smtp.hostinger.com` (contact/concierge mail). Everything else is Postgres, Redis, and the two hosts.

---

## 1. Wiring map — what connects to what

```
                      ┌──────────────────────────────┐
   Browser  ────────▶ │  Vercel  (Next.js 14, SSR)   │
                      │  primekey.vercel.app         │
                      └───────────┬──────────────────┘
                                  │  HTTPS, cross-origin
                                  │  NEXT_PUBLIC_API_URL is INLINED AT BUILD TIME
                                  │  (lib/api-client.ts:234)
                                  ▼
                      ┌──────────────────────────────┐
                      │  Render  (gunicorn, native py) │
                      │  primekey-api.onrender.com   │
                      │  /api/v1/*  ·  /api/health/  │
                      └───┬──────────────┬───────────┘
                          │              │
              ┌───────────▼──────┐  ┌────▼──────────────────┐
              │ Render Postgres   │  │ Render Redis          │
              │ primekey-db       │  │ primekey-redis        │
              │ DATABASE_URL      │  │ REDIS_URL      (db 0) │
              └───────────────────┘  │ REDIS_CACHE_URL (db 1)│
                                     │ DJANGO_Q_REDIS_URL(2) │
                                     └───────────────────────┘

   Outbound from the API (server-side only, keys live in Render):
     api.resend.com     ← RESEND_API_KEY                    (OTP delivery only)
     smtp.hostinger.com ← EMAIL_HOST_USER / EMAIL_HOST_PASSWORD (contact + concierge)

   Outbound from the API (browser-side call, key in Vercel):
     nothing today. No analytics, no maps, no third-party scripts.
```

**Origin allowlists (both must agree or the browser blocks every call):**
- Render: `CORS_ALLOWED_ORIGINS=https://primekey.vercel.app`, `ALLOWED_HOSTS=primekey-api.onrender.com`
- Vercel: `NEXT_PUBLIC_API_URL=https://primekey-api.onrender.com/api/v1`

> If your Vercel project name is not literally `primekey`, the domain will not be `primekey.vercel.app`. You must update `render.yaml` CORS + `ALLOWED_HOSTS` **before** the first frontend deploy, then redeploy the API.

**File storage (✅ resolved):**
- `render.yaml` declares a 10 GB disk on `primekey-api` at `/var/data`, so `MEDIA_ROOT` and `PROTECTED_STORAGE_DIR` survive redeploys on the web service.
- Landlord ID / proof-of-ownership → `PROTECTED_STORAGE_DIR`, delivered only via authenticated `GET /api/v1/landlords/documents/<uuid>/download/`
- Career resumes → `MEDIA_ROOT`, served through `SERVE_MEDIA=True`
- NDPR data exports → **not a file.** They are stored in Postgres on `ExportRequest.export_payload`, because the worker writes them and the web service reads them and a Render disk cannot be mounted on two services. `purge_expired_exports` clears the payload after the 7-day window (scheduled every 6 h via django-q).
- Both disk-backed paths are written by the web service, so a single-instance web service with the disk is sufficient.
- Serving uploads through Django costs a worker process per request. Move `/media/` to a CDN if traffic grows.

---

## 2. Environment variable inventory

Set every `Required` row. Backend vars go in **Render** (repo or the `production` environment); the frontend var goes in **Vercel**.

| Variable | Where set | Consumed at | Required | Notes |
|---|---|---|---|---|
| `SECRET_KEY` | Render (`generateValue: true`) | `settings.py:35` | ✅ | Validated in prod; insecure default raises |
| `DEBUG` | Render `False` | `settings.py:38` | ✅ | `True` in prod breaks the guard at `:43` |
| `ALLOWED_HOSTS` | Render | `settings.py:40` | ✅ | Comma-separated list; `*` raises in prod |
| `DATABASE_URL` | Render ← `primekey-db` | Django DB | ✅ | From the Render Postgres service |
| `REDIS_URL` | Render ← `primekey-redis` db 0 | `core/views.py:28` health ping | ✅ | |
| `REDIS_CACHE_URL` | Render db 1 | `settings.py:256,270` | ✅ | `default`, `sessions`, `axes` caches |
| `DJANGO_Q_REDIS_URL` | Render db 2 | Django-Q worker | ✅ | Worker dies without it |
| `CORS_ALLOWED_ORIGINS` | Render | `settings.py:212` | ✅ | Must equal the Vercel origin exactly |
| `CORS_ALLOW_CREDENTIALS` | Render `True` | `settings.py:213` | ✅ | |
| `SECURE_SSL_REDIRECT` | Render `True` | `settings.py:369` | ✅ | Render terminates TLS; `SECURE_PROXY_SSL_HEADER` already set |
| `SPECTACULAR_RESTRICT_DOCS` | Render `True` | drf-spectacular | ✅ | Keeps `/api/docs/` private |
| `RESEND_API_KEY` | Render (**you**) | `settings.py:153` | ✅ | Email OTP + optionally contact form |
| `EMAIL_BACKEND` | Render (**you**) | `settings.py:134` | 🔧 | **Missing today** — defaults to console |
| `EMAIL_HOST` | Render `smtp.hostinger.com` | `settings.py:138` | 🔧 | |
| `EMAIL_PORT` / `EMAIL_USE_SSL` | Render `465` / `True` | `settings.py:139-141` | 🔧 | |
| `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` | Render (**you**) | `settings.py:142-143` | 🔧 | Hostinger mailbox credentials |
| `DEFAULT_FROM_EMAIL` | Render | `settings.py:144` | ✅ | Resend requires this **domain verified** |
| `CONTACT_RECIPIENT_EMAIL` | Render | `settings.py:147` | ✅ | Where contact leads land |
| `NEXT_PUBLIC_API_URL` | **Vercel** | `lib/api-client.ts:234` | ✅ | Build-time inlined; `https://primekey-api.onrender.com/api/v1` |

---

## 3. Milestones

### M0 — Code readiness ✅ (done)

| # | Change | File | Why |
|---|---|---|---|
| 0.1 | Fail fast when `DEBUG=False` and `RESEND_API_KEY` is empty | `core/config_checks.py`, `core/settings.py` | A missing key used to return **HTTP 200 "OTP sent"** and deliver nothing — silent, undiagnosable failure |
| 0.2 | Return `503` from the OTP send view when the provider is unconfigured | `apps/otp_auth/views.py` | Turns a silent no-op into an observable error |
| 0.3 | Declare the SMTP vars in the blueprint | `render.yaml` | Contact form printed to logs in prod |
| 0.4 | Make storage dirs env-overridable | `core/settings.py` | Required for 0.5; `BASE_DIR / "protected"` is not mountable as-is |
| 0.5 | Serve `/media/` in production and declare a `/var/data` disk | `core/urls.py`, `render.yaml` | `static()` no-ops when `DEBUG=False`; uploads died on every deploy |
| 0.6 | Keep `output: 'standalone'` | `frontend/next.config.mjs` | **Kept, not removed** — the retained local-compose stack copies `.next/standalone`, and Vercel simply ignores the flag |
| 0.7 | Pin Node (`engines`) | `frontend/package.json` | No pin existed; Vercel would pick its own default |
| 0.8 | Add `.gitattributes` | repo root | Hundreds of files show as modified from CRLF/LF noise — real diffs get lost in it |
| 0.9 | Resolve the deploy-path conflict (option A, see M6) | `.github/workflows/ci.yml` | Every `master` push ended red |

### M0b — Render native Python ✅ (done)

Django moved off the Docker runtime, which is what Render documents as the standard path:

| Change | File | Note |
|---|---|---|
| `runtime: python`, `rootDir: backend`, `PYTHON_VERSION=3.13.15` | `render.yaml` | `psycopg2-binary` bundles libpq, so there is no system dependency that needs Docker. See B4 in §7.2 for why this is an env var and not a `pythonVersion` key |
| `buildCommand` = install + `collectstatic` | `render.yaml` | Build artifacts persist into the run phase, which is what WhiteNoise serves from `STATIC_ROOT` |
| `preDeployCommand` = `migrate` | `render.yaml` | Runs once per release instead of racing on every container boot |
| `startCommand` = gunicorn on `0.0.0.0:$PORT`, 3 workers, `--max-requests` | `render.yaml` | 3 workers fits the plan's 512 MB |
| `disk:` block, `numInstances: 1` | `render.yaml` | A Render disk cannot be shared across services nor mounted on multiple instances. It also disables zero-downtime deploys (H3) |
| Deleted `deploy-staging` / `deploy-production` SSH jobs | `.github/workflows/ci.yml` | These ran `docker compose` on a VPS, bypassing `render.yaml` entirely |
| Pinned `Django>=6.1,<6.2`, split runtime from dev | `backend/requirements.txt`, `backend/requirements-dev.txt` | `Django>=4.0.0` let a native build silently pull a future major release; dev tooling no longer ships to production (M1, M2) |
| Aligned Python 3.13 in CI and the Dockerfile | `.github/workflows/ci.yml`, `backend/Dockerfile` | CI, the local-compose image and Render now run one version |

**nginx is not used on Render.** Render's edge terminates TLS and proxies to `$PORT`; there is no port to bind a second listener on. Static files go through WhiteNoise, which is already in `MIDDLEWARE`. `nginx/nginx.conf` now only serves the local compose stack.

### M0c — Docker scope ✅ (decided)

Docker remains **only** for local development:

| Kept, local-only | Removed, production-only |
|---|---|
| `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `nginx/nginx.conf`, `.dockerignore` | `runtime: docker` + `dockerfilePath` + `dockerCommand` in `render.yaml`; the two CI SSH deploy jobs |

GitHub Actions' `postgres:16-alpine` / `redis:7-alpine` service containers are test fixtures, not deployment assumptions, and stay.

### M0a — Sendchamp removal ✅ (done)

SMS was cut to reduce production cost. Everything Sendchamp-related was deleted, not just disabled:

| Removed | Where |
|---|---|
| `send_otp_via_sendchamp()`, `_normalize_phone_for_sendchamp()` | `apps/otp_auth/services.py` |
| `SENDCHAMP_API_KEY`, `SENDCHAMP_SENDER_ID`, `SENDCHAMP_ROUTE` | `core/settings.py`, `render.yaml` (web + worker) |
| Sendchamp clauses in the production guard | `core/config_checks.py` |
| `OTPCode.phone`, `OTPCode.channel` columns + the `sms` choice | `apps/otp_auth/models.py` + migration `0005_email_only_otp` |
| `phone`/`channel` request fields, Nigerian phone validation | `apps/otp_auth/serializers.py` |
| SMS branch, SMS rate-limit bucket, phone-matching agent lookup | `apps/otp_auth/views.py` |
| Phone-or-email input, SMS channel detection, `phoneLabel` config | `frontend/components/auth/OtpAuthCard.tsx`, `AuthInterceptSheet.tsx`, `app/login/page.tsx`, `app/dashboard/agent/login/page.tsx` |
| `isEmailIdentifier()` channel sniffing | `frontend/lib/api-client.ts` |

Consequences to be aware of:
- **`POST /auth/otp/send/` now requires `email`.** A client still sending `{phone, channel: "sms"}` and no email gets `400`; a stale `channel: "sms"` alongside an email is ignored (still email delivery).
- **Agent logins must use the email on their user account.** `AgentProfile` still stores a phone (contact data), but the OTP lookup is `AgentProfile.user__email`. Any agent account without an email cannot sign in.
- **Phone numbers are still collected where they matter** — concierge, landlord registration, inspection booking, job applications, WhatsApp threads. Only the *OTP channel* is email.

### M1 — Accounts & credentials 👤 (you)

- [ ] **Resend** — create account, verify sending domain for `primekeyhomesandpropertiesltd.com`, create API key. DNS records: SPF + DKIM for the domain. Without verification, `from` is rejected at send time.
- [ ] **Render** — create account, connect the GitHub repo. Do **not** create services by hand; the blueprint does it.
- [ ] **Vercel** — create account, import the repo. Note the project name you choose; it determines the CORS origin.
- [ ] **Domain** — decide whether to use `primekey.vercel.app` or a custom domain. If custom: add it to `CORS_ALLOWED_ORIGINS` (comma-separated) **and** re-deploy the API.
- [ ] **Hostinger mailbox** — create/confirm the sending mailbox for SMTP.

### M2 — Backend to Render 👤

1. [ ] In Render: `New → Blueprint` → select the repo. `render.yaml` creates `primekey-db`, `primekey-redis`, `primekey-api` (web + 10 GB disk) and `primekey-worker`.
2. [ ] Render prompts for the `sync: false` values → paste `RESEND_API_KEY`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` **for both** the web and worker services.
3. [ ] Confirm `CORS_ALLOWED_ORIGINS` matches your actual Vercel domain (M1).
4. [ ] Deploy. `preDeployCommand` runs `migrate` once per release, `buildCommand` runs `collectstatic`, then gunicorn binds `$PORT`. Expect the first native build to take ~5–8 minutes because it compiles from source.
5. [ ] Verify:
   ```bash
   curl -s https://primekey-api.onrender.com/api/health/
   # {"status":"healthy","database":"healthy","redis":"healthy",...}
   curl -s -o /dev/null -w '%{http_code}\n' https://primekey-api.onrender.com/api/docs/   # expect 401/403 when restricted
   ```
   > ⚠️ `/api/health/` returns **HTTP 200 even when degraded** (`core/views.py:43-49`). Point uptime monitoring at the JSON `status` field, not just the status code.
6. [ ] Confirm the worker is running — otherwise OTP rows accumulate (the cleanup schedule is created on `post_migrate` and needs `qcluster` alive).
7. [ ] Confirm the disk shows as **Attached** on the web service. Without it, uploads and documents are deleted on every deploy.

### M3 — Frontend to Vercel 👤

1. [ ] Import the repo in Vercel (framework auto-detected as Next.js).
2. [ ] Set `NEXT_PUBLIC_API_URL=https://primekey-api.onrender.com/api/v1` in **Production** env (it is compiled into the client bundle — changing it later requires a redeploy).
3. [ ] Deploy. No API is needed at build time: there are no `generateStaticParams`/`revalidate` exports anywhere, so `next build` never calls the backend.
4. [ ] Verify: load `/`, run a search, open the concierge modal, submit the landlord registration form. Open DevTools → Network: every `/api/v1/*` call must be `200`, not a CORS error.

### M4 — Integration wiring (verify each one end-to-end)

| Integration | Wired at | Verify by |
|---|---|---|
| Email OTP | `RESEND_API_KEY` → `services.py:20` → Resend | `POST /api/v1/auth/otp/send/` `{"email":"...","purpose":"login"}` → inbox receives code |
| OTP verify | `POST /api/v1/auth/otp/verify/` → JWT | log in at `/login` with the received code |
| Agent login | `/dashboard/agent/login` → `auth/otp/send|verify` (`purpose: agent_login`) | agent signs in **with their account email**; `/api/v1/dashboard/*` unlocks |
| Contact form | `EMAIL_BACKEND` → SMTP → `CONTACT_RECIPIENT_EMAIL` | submit the form, confirm the mailbox receives it |
| Landlord registration | `/landlord/register` → `landlords/register/` → `landlord/intake` | submit; row appears in Django admin |
| Document vault | `documents/` upload → `PROTECTED_STORAGE_DIR` → authenticated `download/` | upload an ID, download it back, then redeploy and download again (**this is the persistence test**) |
| Careers applications | `careers/applications/` → `MEDIA_ROOT` | apply with a resume, then fetch the file from admin |
| Concierge leads | `crm/submit-concierge/` | submit modal, confirm the CRM row + email |
| Background cleanup | Django-Q → `cleanup_expired_otps` | after 15 min, expired rows are gone |

### M5 — Pre-launch hardening 🔧

- [ ] Confirm HSTS/Secure-cookie settings are safe behind Render's proxy (`settings.py:367-379`).
- [ ] Verify `RATELIMIT_USE_CACHE="axes"` + `AXES_CACHE="axes"` point at Redis. The comment at `settings.py:243-248` warns these **fail closed with HTTP 500** if the cache is down — a Redis blip becomes a site-wide 500 on rate-limited endpoints.
- [ ] Create the first Django superuser (via a Render shell, not a public route).
- [ ] Seed or clear demo data deliberately: `python manage.py seed_properties` inserts 6 demo listings — decide whether prod should show them.
- [ ] Confirm `axes` lockouts and OTP rate limits behave under real traffic.

### M6 — Deploy automation ✅ (option A chosen and applied)

- **A — Render Blueprint + Render's GitHub integration.** Applied: `render.yaml` sets `autoDeploy: true` / `autoDeployTrigger: commit`, so Render deploys the API on push and Vercel redeploys the frontend. `deploy-production` and `deploy-staging` were deleted from `.github/workflows/ci.yml`. CI is now purely a merge gate.
- **B — SSH + `docker compose` on a VPS.** Removed. Keeping it would require `PROD_HOST`/`PROD_USER`/`PROD_SSH_KEY`/`PROD_APP_DIR` secrets plus a maintained VPS, and it would bypass `render.yaml` entirely.

`STAGING_HOST`, `STAGING_USER`, `STAGING_SSH_KEY`, `STAGING_APP_DIR`, `PROD_HOST`, `PROD_USER`, `PROD_SSH_KEY` and `PROD_APP_DIR` are now unused and can be deleted from GitHub.

### M7 — After launch

- [ ] Uptime monitor on `/api/health/` checking the JSON `status` field.
- [ ] Postgres backups: Render managed backups, and confirm a restore path.
- [ ] Redis: `plan: free` — free instances are evicted under memory pressure. Since cache/ratelimit/axes fail closed, budget for a paid Redis or accept rate-limit outages.
- [ ] Watch the first real OTP failure logs; confirm provider errors surface (0.1/0.2 make this visible).
- [ ] Confirm `purge_expired_exports` runs in the worker, otherwise export payloads sit in Postgres (and in every DB backup) indefinitely.
- [ ] Revisit the deferred items deliberately: payments (Phase 3), and the "Phase 3" wording in `terms`/`privacy` should be reviewed by whoever owns legal copy before real money changes hands.

---

## 4. WhatsApp — do you need the API?

**No. Do not add it yet. It costs money and you already have a working channel.**

How WhatsApp works in the codebase today:

| Piece | What it does | Cost |
|---|---|---|
| `wa.me/234…?text=…` deep links in `contact/page.tsx`, `LegalPage.tsx`, the footer | Opens the visitor's own WhatsApp with a pre-filled message | **Free** — pure `href`, no API, no keys, no backend |
| `buildWhatsAppLink()` in `lib/api-client.ts:105` | Builds that link from a phone + message | Free |
| `apps/messaging` (`WhatsAppThread`, `WhatsAppMessage`) + `WhatsAppPanel.tsx` | Agents log conversations in the dashboard, then click **Open WhatsApp** to actually send | Free — internal Postgres records only |
| Meta WhatsApp Business Cloud API | **Not integrated** | Requires business verification, a phone number, per-message pricing outside the 24h customer-service window, and a webhook to receive replies |

The current design is agent-in-the-loop on purpose: an agent reads the thread, then sends from their own WhatsApp. That is the cheapest possible setup and it needs zero configuration.

Only consider the Cloud API if you later need **automated replies** (e.g. "reply YES to book a viewing") or **inbound message webhooks** that write straight to `WhatsAppThread`. Until then, adding it would add cost, a Meta business-verification dependency, and a webhook service — for no gain.

## 5. Rollback

- **Frontend**: Vercel → Deployments → promote a previous build, or revert the commit and redeploy.
- **Backend**: Render → roll back to the previous image. ⚠️ `migrate` runs on every boot and is **not** auto-reverted, so only roll back across a commit with no new migrations.
- **Database**: point `primekey-db` at a pre-deploy snapshot for a true restore.

---

## 6. Open risks

1. **Silent OTP failure** is now guarded: a missing `RESEND_API_KEY` stops the deploy at boot, and the send endpoint returns `503` instead of a false success.
2. **File loss on deploy** until 0.4/0.5 land — landlord IDs and resumes vanish silently.
3. **CORS is domain-pinned** — a Vercel project rename breaks every API call with a browser-side error that is easy to misread as a backend outage.
4. **`NEXT_PUBLIC_API_URL` is build-time** — forgetting it ships a frontend hardcoded to `http://localhost:8000/api/v1`.
5. **Redis eviction = 500s** on rate-limited endpoints, not a soft degradation.
6. **Health check lies by omission** — HTTP 200 while `redis: unhealthy`.

---

## 7. Render deployment-readiness audit (2026-09-30)

Scope: the backend only (`backend/`, `render.yaml`, `.github/workflows/ci.yml`),
audited line-by-line against Render's live documentation. Every finding below is
either a **documented hard requirement** Render enforces, or a silent failure
mode that only appears after the service is live.

Sources read for this audit:
[blueprint-spec](https://render.com/docs/blueprint-spec) |
[native-runtimes](https://render.com/docs/native-runtimes) |
[python-version](https://render.com/docs/python-version) |
[deploys](https://render.com/docs/deploys) |
[web-services](https://render.com/docs/web-services) |
[health-checks](https://render.com/docs/health-checks) |
[disks](https://render.com/docs/disks) |
[key-value](https://render.com/docs/key-value) |
[background-workers](https://render.com/docs/background-workers) |
[postgresql-creating-connecting](https://render.com/docs/postgresql-creating-connecting) |
[postgresql-connection-pooling](https://render.com/docs/postgresql-connection-pooling) |
[environment-variables](https://render.com/docs/environment-variables) |
[deploy-django](https://render.com/docs/deploy-django)

### 7.1 Summary

| # | Sev | Finding | Where |
|---|---|---|---|
| B1 | **Blocker** | `plan: starter` is not a valid plan ID. Blueprint sync fails. | `render.yaml` x3 |
| B2 | **Blocker** | Key Value has no `ipAllowList`; the field is **required**. Blueprint sync fails. | `render.yaml:196` |
| B3 | **Blocker** | `type: redis` is a deprecated alias; `fromService.type` must be `keyvalue`. | `render.yaml` x7 |
| B4 | **Blocker** | `pythonVersion:` is not a blueprint field, so the service runs Python **3.14.3**, not 3.13. | `render.yaml:27`, `:157` |
| B5 | **Blocker** | `STATICFILES_STORAGE` was removed in Django 5.1, silently a no-op. | `core/settings.py:200` |
| B6 | **Blocker** | No `LOGGING` config: every `logger.info()` is dropped. | `core/settings.py` |
| H1 | High | All three Redis URLs collapse onto **db 0**; cache eviction can delete queued jobs. | `render.yaml:73-79` |
| H2 | High | `allkeys-lru` on a **job broker**; Render requires `noeviction` for queues. | `render.yaml:200` |
| H3 | High | The disk **disables zero-downtime deploys**, causing a brief outage every deploy. | `render.yaml:53` |
| H4 | High | Free Key Value is 25 MB / 50 connections and in-memory only. | `render.yaml:196` |
| H5 | High | `django-allauth` and `django-csp` are installed but **not in `INSTALLED_APPS`**. | `requirements.txt` |
| H6 | High | `ipAllowList: []` on Postgres makes `scripts/backup.sh` unreachable off-platform. | `render.yaml:193` |
| M1 | Medium | 9 dev/test packages ship into the production build. | `requirements.txt` |
| M2 | Medium | Loose pins make native builds non-reproducible. | `requirements.txt` |
| M3 | Medium | `whitenoise` installed without the `[brotli]` extra Render recommends. | `requirements.txt` |
| M4 | Medium | No `PYTHONUNBUFFERED`; no `CSRF_TRUSTED_ORIGINS` for cookie flows. | `render.yaml`, `settings.py` |
| M5 | Medium | Postgres version defaults to 18 while CI verifies 16. | `render.yaml:191` |
| M6 | Medium | `maxShutdownDelaySeconds` left at the 30s default. | `render.yaml` |
| M7 | Medium | Region unpinned; private-network URLs break if one resource moves. | `render.yaml` |
| L1 | Low | `autoDeploy` is deprecated next to `autoDeployTrigger`. | `render.yaml:49` |
| L2 | Low | `WEB_CONCURRENCY` self-populates but is ignored (hardcoded `--workers 3`). | `render.yaml:41` |

---

### 7.2 Blockers

#### B1 - `plan: starter` does not exist

Render's plan IDs were renamed to `<cpu>c-<ram>` form. `starter` appears
**nowhere** in the blueprint reference, so `render blueprints validate render.yaml`
rejects it.

| Resource | Current | Valid |
|---|---|---|
| `primekey-api` (web) | `starter` | `0.5c-512mb` |
| `primekey-worker` (worker) | `starter` | `0.5c-512mb` (workers have **no** free plan) |
| `primekey-db` (postgres) | `starter` | `0.5c-1g` (100 connections) |

The `free` plan is valid for `web`, `keyvalue` and `postgres`, but **not** for
workers, and a free Postgres **expires after 30 days**, so it must not be used here.

#### B2 - Key Value `ipAllowList` is required

> `ipAllowList` - **Required.** A list of the IP address ranges allowed to connect
> to your Key Value instance over the public internet. - *blueprint-spec*

Internal-only is expressed as an empty list, so `primekey-redis` needs
`ipAllowList: []`. Without it the blueprint will not sync.

#### B3 - `type: redis` is a deprecated alias

> `keyvalue` for a Render Key Value instance - `redis` is a deprecated alias for
> `keyvalue`. - *blueprint-spec*

The alias is tolerated for the resource definition, but `fromService.type` is
documented as `keyvalue`, and our three `fromService` blocks still say `redis`.
Change all occurrences (1 service declaration plus 3 references in each of the 2
services).

#### B4 - The Python version is not actually pinned

`pythonVersion` is **not** in the blueprint spec. Render selects the interpreter
from, in descending precedence:

1. `PYTHON_VERSION` env var - "You *must* specify a fully qualified version (e.g. `3.13.5`)"
2. `.python-version` file at the repo root - patch optional
3. the platform default - **currently `3.14.3`** for services created after 2026-02-11

So today the API would build and run on Python 3.14 while CI verifies 3.13 and
`requirements.txt` is pinned to `Django>=6.1,<6.2`. That drift is invisible until
a wheel is missing or a C-level dependency breaks.

Use the env var (unambiguous with `rootDir: backend`, unlike a root-level
`.python-version` file):

```yaml
      - key: PYTHON_VERSION
        value: "3.13.15"   # fully qualified; must exist on Render's image
```

#### B5 - `STATICFILES_STORAGE` is dead configuration

Verified locally, not inferred:

```
global_settings has STATICFILES_STORAGE: False
global_settings has STORAGES:             True
effective STORAGES: {'staticfiles': {'BACKEND':
    'django.contrib.staticfiles.storage.StaticFilesStorage'}}
```

`STATICFILES_STORAGE` was removed in Django 5.1, so `core/settings.py:200` is
read by nobody. The app runs plain `StaticFilesStorage`: no content hashes, no
gzip/Brotli, no immutable long-cache filenames, which is exactly what Render's
Django guide is built around. Note the guide itself still prints the deprecated
setting; for Django 6 the supported spelling is `STORAGES`:

```python
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
```

> **Caution:** Manifest storage is strict. A template referencing a missing static
> file now raises instead of silently 404-ing. After switching, `curl`
> `/admin/login/` plus one authenticated page per app on the deployed service
> before declaring success.

#### B6 - Application logs are discarded

There is no `LOGGING` setting anywhere. Verified at runtime:

```
LOGGING defined in project: False
effective level for apps.otp_auth.services: 30   (WARNING; INFO would be 20)
handlers on root: []
```

Python's `lastResort` handler only emits `WARNING`+, and the root logger has no
handlers. So every `logger.info(...)` is dropped, including
`apps/otp_auth/services.py:64` (`"Resend OTP sent to %s (purpose=%s) id=%s"`),
the exact audit trail the launch checklist tells you to watch. `ERROR` and
`exception` do reach Render's log stream via stderr, which is why this went
unnoticed.

Minimum viable `LOGGING`: a `django` INFO handler and a `django.utils.log`
`ServerLog` handler, both on stdout, gated on `DEBUG`.

---

### 7.3 High severity

#### H1 / H2 - Redis keyspace collapse and eviction of queued jobs

Render's Key Value `connectionString` has **no database index**:

> For Render Key Value, has the format `redis://red-xxxxxxxxxxxxxxxxxxxx:6379`
> - *blueprint-spec*

`render.yaml` wires `REDIS_URL`, `REDIS_CACHE_URL` and `DJANGO_Q_REDIS_URL` to
that identical string. `core/settings.py:25-27` only supplies `/0`, `/1`, `/2` as
*local* defaults, which Render overrides. Consequence: cache, sessions, axes and
the **django-q task broker all share db 0**.

Combined with H2, `maxmemoryPolicy: allkeys-lru` is a *cache* policy applied to a
*queue*. Render's own Celery guidance:

> `noeviction` to ensure that queued jobs are not lost ... `allkeys-lru` would allow
> the creation of new tasks by discarding the oldest potentially incomplete tasks
> - *deploy-celery*

A full Redis therefore silently drops `cleanup_expired_otps` and
`purge_expired_exports`, the OTP-expiry and NDPR-retention jobs that M0a depends
on for compliance.

Fix: stop taking the index from the URL and derive it in settings from one host.
Wire `REDIS_CONNECTION_STRING` once in `render.yaml` and build
`f"{REDIS_CONNECTION_STRING}/0"`, `/1`, `/2` in `settings.py`, then set
`maxmemoryPolicy` deliberately for the dominant workload.

#### H3 - The disk trades zero-downtime deploys for persistence

> Adding a disk to a service prevents zero-downtime deploys ... Render stops the
> existing instance *before* bringing up the new instance ... **your service is
> unavailable** - *disks*

Also documented: the disk is **not mounted during `buildCommand` or
`preDeployCommand`** ("these commands run on separate compute"), size can be
increased but never decreased, and one disk cannot be shared between services.

This is a genuine trade-off, not a bug. The disk is what keeps landlord IDs and
resumes from being deleted on every deploy, and the diskless decision was already
made in M0. It must be an explicit, recorded decision plus a post-deploy smoke
test, because every deploy now has a few seconds of downtime.

#### H4 - The free Key Value plan is undersized

`free` = **25 MB, 50 connections**, in-memory only, data lost on restart, one per
workspace, and `persistenceMode` resolves to `off`. This instance carries the
cache, the session store, the axes brute-force counters **and** the job broker.
The smallest paid tier `256mb` (250 connections) is the realistic floor.

#### H5 - Two installed packages are doing nothing

| Package | In `requirements.txt` | In `INSTALLED_APPS` | Effect |
|---|---|---|---|
| `django-allauth` | yes | **no** | dead dependency; no allauth middleware or `SITE_ID` configured |
| `django-csp` | yes | **no** | **no Content-Security-Policy is enforced at all** |

The second row is a security finding, not just packaging. `SECURE_CROSS_ORIGIN_OPENER_POLICY`
and `django-csp` are both present, so CSP was clearly intended. Decide: wire
`csp.middleware.CSPMiddleware` (and confirm the `django-csp` v4 config style), or
drop the dependency. `django-unfold` also ships `unfold.contrib.forms`, which is
in the app list, so verify the admin renders after any CSP change.

#### H6 - The off-site backup cannot reach a private database

`ipAllowList: []` on `primekey-db` is correct and should stay; it is the security
default. The consequence is that `scripts/backup.sh`, which now runs
`pg_dump "$DATABASE_URL"` from whatever machine you launch it on, only works from
inside Render's network. Use the Render **Shell**, a **one-off job**, or
temporarily add your own IP. Do not "fix" this by opening the database to the world.

---

### 7.4 Medium and low severity

- **M1 - dev tooling in the production image.** `pytest`, `pytest-django`,
  `factory-boy`, `Faker`, `black`, `flake8`, `mypy`, `isort`, `bandit`,
  `pip-audit` are installed by `buildCommand` on every Render build. That is extra
  compile time, extra transitive packages in the runtime venv, and `pip-audit`
  noise from libraries the app never imports. Split into `requirements.txt`
  (runtime) plus `requirements-dev.txt` (`-r requirements.txt` and the tools), and
  add a CI-only install step.
- **M2 - loose pins.** `djangorestframework`, `django-environ`, `requests`,
  `redis`, `psycopg2-binary`, `django-ratelimit` are unbounded, so a native
  Render build can pull a new major at any time and differ from the tested commit.
  Render's own guide ends with `pip freeze > requirements.txt`. At minimum use
  `~=` or upper bounds on the unpinned runtime packages.
- **M3 - Brotli.** Render's guide installs `whitenoise[brotli]`; we pin bare
  `whitenoise==6.6.0`.
- **M4 - missing runtime env.** Add `PYTHONUNBUFFERED=1` (not in Render's
  documented defaults, but the standard guard against buffered stdout once logging
  is configured) and `CSRF_TRUSTED_ORIGINS=https://<vercel-domain>`. The API is
  JWT-only so this only affects admin and HTML-form paths, but
  `CORS_ALLOW_CREDENTIALS=True` plus `SESSION_COOKIE_SAMESITE="Lax"`
  (`settings.py:320`) will break any cookie flow from the Vercel origin silently.
- **M5 - Postgres version.** Unspecified means **18** today, while CI verifies
  against `postgres:16-alpine`. It cannot be changed after creation, so pin
  `postgresMajorVersion: '16'` to match the tested path.
- **M6 - shutdown grace.** Render's default is 30s and it equals gunicorn's
  default `--graceful-timeout 30`, leaving no margin for in-flight requests. Raise
  `maxShutdownDelaySeconds` (max 300) and gunicorn's `--graceful-timeout` together.
- **M7 - region.** Nothing pins `region`, so all three resources default to
  `oregon` and the private network works by luck of the default. Set it explicitly
  everywhere; `region` is immutable after creation.
- **L1** - drop the deprecated `autoDeploy: true`; `autoDeployTrigger: commit` is
  the supported key. **L2** - `WEB_CONCURRENCY` self-populates for services created
  after 2025-12-08, but the explicit `--workers 3` overrides it, which is the
  correct choice for a 512 MB plan. Just be aware the var is there.

---

### 7.5 Confirmed-correct, no action

Checked so they are not re-litigated at launch:

| Check | Result |
|---|---|
| Port binding | `--bind 0.0.0.0:$PORT` (Render requires `0.0.0.0`; default port 10000) |
| WhiteNoise middleware position | Immediately after `SecurityMiddleware`, matches the guide |
| `SECURE_PROXY_SSL_HEADER` | Already trusts `X-Forwarded-Proto`, so `SECURE_SSL_REDIRECT=True` will not loop |
| Health check | `/api/health/` returns 200 within the 5s probe budget |
| Worker `healthCheckPath` | Not set (web services only) |
| Worker `buildCommand`/`startCommand` | Both present (`python manage.py qcluster`) |
| `STATICFILES_DIRS` target | `backend/core/static` exists (3 files); `collectstatic` dry-run succeeds |
| Disk mount path | `/var/data` is not a reserved path |
| Migrations | `preDeployCommand`, not `buildCommand`. Render's Django guide puts `migrate` in the build, which races old and new code; avoided here |
| `STATIC_ROOT` | Inside the build directory, so artifacts survive into the run phase |
| Disk absence during build | `settings.py` wraps `os.makedirs` in `try/except OSError` |
| DB connection count | 3 gunicorn workers with short-lived connections, well under the 100-connection limit |

### 7.6 Validation commands

```bash
pip install render-cli   # or: brew install render
render blueprints validate render.yaml

# effective runtime facts, after the fixes land
python -c "import django;django.setup();from django.conf import settings;print(settings.STORAGES)"
python manage.py collectstatic --noinput --dry-run   # expect hashed names + compressed variants
```

### 7.7 Decisions needed before the first deploy

1. **Redis plan** - stay on free (25 MB, at risk of evicting queued jobs) or move to
   `256mb`, and whether to split broker from cache.
2. **Disk vs zero-downtime** - accept a few seconds of downtime per deploy to keep
   uploads, or drop the disk and move media to object storage for instant deploys.
3. **Postgres major version** - pin `16` to match CI, or accept `18`.
4. **CSP** - enforce `django-csp`, or remove it as an unused dependency.
5. **Python pin** - confirm `3.13.15` is acceptable, or pick another fully qualified
   version that exists on Render's image.
---

### 7.8 Remediation applied

Everything in the "unambiguous fixes" tier was applied on 2026-09-30 and verified
locally. **§7.1-7.7 above is preserved as the pre-fix audit** so the reasoning and
the doc citations stay auditable; this table is the current state.

| # | Status | Change | Verified by |
|---|---|---|---|
| B1 | **Fixed** | `plan: starter` → `0.5c-512mb` (web, worker), `0.5c-1g` (postgres) | YAML parse; every plan id now appears in the blueprint reference |
| B2 | **Fixed** | `ipAllowList: []` added to `primekey-redis` | parsed; field present |
| B3 | **Fixed** | `primekey-redis` moved out of `databases` (Postgres-only) into `services` as `type: keyvalue`; all 6 `fromService.type: redis` → `keyvalue` | parsed; `services` = web, worker, keyvalue |
| B4 | **Fixed** | `pythonVersion` key removed from both services; `PYTHON_VERSION=3.13.15` env var added | parsed; matches local venv `3.13.15` and CI `3.13` |
| B5 | **Fixed** | `STATICFILES_STORAGE` → `STORAGES` with `CompressedManifestStaticFilesStorage` | `STORAGES['staticfiles']` now resolves to whitenoise; `collectstatic` emits 926 post-processed files, hashed names, `.gz` **and** `.br`, plus `staticfiles.json` |
| B6 | **Fixed** | `LOGGING` added (console handler, `apps` at `LOG_LEVEL`, `django` at INFO/WARNING) | effective level for `apps.otp_auth.services` is now DEBUG locally / INFO in production, with handlers attached; live `DisallowedHost` error rendered during testing |
| M1 | **Fixed** | Dev tooling split into `backend/requirements-dev.txt`; all 4 CI backend jobs install it | only `tests.py` modules import dev packages; `requirements.txt` resolves with no conflicts |
| M2 | **Fixed** | Loose pins bounded with `~=`; `django-q2` corrected to the pinned `1.11.1` | local venv realigned from the drifted `1.11.0` |
| M3 | **Fixed** | `whitenoise[brotli]==6.6.0` | `.br` assets present after `collectstatic` |
| M4 | **Fixed** | `PYTHONUNBUFFERED=1` on both services; `CSRF_TRUSTED_ORIGINS` derived from `CORS_ALLOWED_ORIGINS` in settings | parsed; resolves to the CORS list |
| M5 | **Fixed** | `postgresMajorVersion: "16"` on `primekey-db` | matches the `postgres:16-alpine` CI fixture |
| M6 | **Fixed** | `maxShutdownDelaySeconds: 120` + gunicorn `--graceful-timeout 120` | both present and equal |
| M7 | **Fixed** | `region: oregon` pinned on all three resources | matches Render's default, so no behaviour change |
| L1 | **Fixed** | Deprecated `autoDeploy: true` removed; `autoDeployTrigger: commit` kept | no `autoDeploy` key remains |
| L2 | No action | `--workers 3` intentionally overrides `WEB_CONCURRENCY` | documented, not changed |

Regression checks after the changes: `manage.py check` clean,
`makemigrations --check` no changes, **205 passed** on the full suite, and
`/admin/login/`, `/admin/`, `/admin/properties/property/`,
`/admin/compliance/exportrequest/` and `/admin/compliance/consentlog/` all render
200 with the now-strict manifest storage.

#### Still open (deliberately, pending the decisions in 7.7)

- **H1/H2 - Redis keyspace.** All three URLs still come from the same
  `connectionString` (`redis://red-xxx:6379`, no DB index), so they resolve to db
  0 in production, and `maxmemoryPolicy` is still `allkeys-lru`. Fixing this
  correctly means deciding whether to split the broker from the cache.
- **H5** - `django-allauth` and `django-csp` are still installed but unused, so
  **no CSP is enforced**. Note that `django-allauth` drags in `cryptography`,
  `oauthlib`, `python3-openid` and `requests-oauthlib` for nothing.
- **H6** - `scripts/backup.sh` still needs to run from inside Render's network.

### 7.9 Free-plan constraints applied (2026-10-02)

`render blueprints validate` rejected the Blueprint, and the free compute plan
forced three further changes. Sources: [deploys](https://render.com/docs/deploys)
and [free](https://render.com/docs/free).

| # | Render's error / rule | Fix | Consequence |
|---|---|---|---|
| V1 | `max shutdown delay is not supported for services with a disk` | Removed the `disk:` block from `primekey-api` | Uploads are now **ephemeral**; see 6.2. Zero-downtime deploys are **restored** as a side effect |
| V2 | `cannot refer to SECRET_KEY against service primekey-api of type web` | `sync: false` on the worker's `SECRET_KEY` | The same value must be pasted into both services by hand |
| V3 | Pre-deploy command is **paid-only** (web services, private services, background workers) | `migrate` moved from `preDeployCommand` into `buildCommand` | Migrations now run per deploy against the live schema; revert to `preDeployCommand` when paid |

| V4 | `max shutdown delay is not supported for free tier services` | `maxShutdownDelaySeconds` removed from `primekey-api` | Render's fixed 30s shutdown delay applies; gunicorn `--graceful-timeout` lowered to 20s and `--timeout` to 25s to stay inside it |

Also changed for free: gunicorn `--workers 3` → `1` (free is 0.1 CPU). When the
web service goes paid, restore `maxShutdownDelaySeconds: 120` and raise
`--graceful-timeout` back to 60; on a real disk, restore the `disk:` block too.

#### Free-plan limits that are NOT fixed in code

- Service **spins down after 15 min idle**; the first request afterwards takes
  roughly a minute and Render shows a loading page. The first curl will look
  like a timeout.
- **Uploads are lost** on every deploy, restart, *and* spin-down. This is
  broader than the earlier disk-based data loss.
- Free Postgres **expires 30 days after creation** (14-day grace period, then
  Render deletes the data). `primekey-db` is currently `0.5c-1g`, i.e. paid.
- Free services **cannot send outbound traffic on ports 25/465/587**, so the
  Hostinger SMTP contact form cannot work from a free web service. OTP via
  Resend uses HTTPS 443 and is unaffected.
- Free web services have **no shell access**, which also blocks
  `python manage.py createsuperuser` from the Render dashboard. Use a one-off
  job on a paid plan, or a temporary management command.
- No persistent disk, no scaling beyond one instance, no edge caching, no
  managed backups on free Postgres.

Verification still owed once credentials exist: `render blueprints validate
render.yaml` against Render's own API, a first real deploy, and a `curl` of
`/admin/login/` on the live host.
