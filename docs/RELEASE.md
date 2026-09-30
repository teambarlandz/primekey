# Release & Publishing — Primekey Homes

> Status: draft · Version: 0.1 · Owner: @teambarlandz · Last updated: 2026-09-30
> From "merge to master" to "live in production".
>
> Production topology is Vercel (frontend) + Render (API, worker, Postgres,
> Redis). `PRODUCTION_READY.md` is the authoritative runbook; the
> `docker-compose` stack and nginx are local-development only.

## 1. Versioning

- **SemVer** (`X.Y.Z`): major = breaking UX/API contract; minor = features;
  patch = fixes. Pre-release: `-rc.N`.
- Source of truth: git tag `vX.Y.Z` + `CHANGELOG.md`; the tagged commit must
  match what shipped. Render and Vercel both record the deployed commit on the
  release, so verify the tag against those dashboards rather than CI.
- Changelog: [CHANGELOG.md](../CHANGELOG.md) — Unreleased section merged into
  the release section at tagging (keep-a-changelog style).

## 2. Branch & environment model

| Branch | Environment | Deployed by | Notes |
|--------|-------------|-------------|-------|
| `develop` | Staging VPS | CI `deploy-staging` (on push) | Integration + e2e checkpoint |
| `master` | Production VPS | CI `deploy-production` (on push) | All gates must be green first |
| `fix/x.y.z` | — | — | Hotfix branch cut from tag (see §4) |

Rules:

- `master` is protected: PRs require green CI + 1 review; no direct pushes.
- Production is deployed **only** via the CI workflow — never by hand SSH
  unless the pipeline is down (then: record it in the incident log).
- All secrets live in GitHub Environments (`staging`, `production`); never in
  the repo.

## 3. Release checklist (every release)

1. `master` green: CI pipeline passes end-to-end (lint, typecheck, vitest,
   build, backend tests, security scan, migration check, Cypress e2e).
2. Manual smoke on staging (`develop` deployed):
   - Search returns results + zero-result concierge modal fires.
   - Concierge form submits → lead in admin with score + SLA deadline.
   - Landlord intake → agent dashboard shows it; appointment books.
   - `/api/health` returns `"status": "healthy"`.
   - Admin login (axes lockout off), dark mode toggle, dashboard charts.
3. `CHANGELOG.md` Unreleased → released section; TODO statuses refreshed;
   `docs/` in sync (progress-tracker).
4. Tag `vX.Y.Z` (annotated) on the tested `master` commit → GitHub Release
   with changelog excerpt. (No binary artifacts — self-hosted deployment.)
5. Watch production 48 h: backup logs, /api/health pings, Django error logs,
   axes lockout attempts.

## 4. Hotfix procedure

1. Cut `fix/x.y.z` from the offending tag.
2. Fix, bump patch version, update CHANGELOG (`Fixed` section).
3. PR → `master` with 1 review; CI gates run.
4. Tag `vX.Y.Z+1` → production deploys on push to `master`.
5. Cherry-pick the fix onto `develop` so staging stays current.

## 5. Rollback

- Production deploys from git: Render (`render.yaml`, `autoDeployTrigger: commit`)
  builds the API on push to `master` and Vercel rebuilds the frontend. Rollback is
  therefore: revert or `git revert` the bad commit on `master`, or promote the
  previous tag — Render and Vercel both redeploy from the resulting commit. No
  server-side build step and no SSH.
- Database migrations are **not** automatically rolled back. If a release
  shipped a migration that must be reverted, restore from Render's managed
  backups (or the off-site copy from `scripts/backup.sh`, restore drill monthly)
  or apply the reverse migration manually — never silently drop data.
- Decision gate: if the failure is data-affecting, prefer restore-from-backup
  over schema reversal.

## 6. Post-release duties

- Weekly: confirm Render's scheduled Postgres backups completed, check
  `/api/health`, review logs, check `/var/data` disk usage.
- Monthly: restore drill — restore the latest backup to a scratch database and
  verify counts (NDPR retention logs, leads).
- Quarterly: security patches (`pip-audit`/`npm audit` output in CI artifacts),
  dependency bumps on Render and Vercel.
- Yearly: NDPR compliance audit logs review; update privacy policy version.

## 7. Operational contacts

- Backend/API hosting: Render (services, Postgres, Redis — created from
  `render.yaml`). Frontend hosting: Vercel. DNS: the domain registrar.
- OTP delivery: Resend (`RESEND_API_KEY`, verified sender domain required).
- Email delivery: Hostinger SMTP (`hello@primekeyhomesandpropertiesltd.com`).
- Monitoring: UptimeRobot/Better Stack pinging `https://<domain>/api/health`
  every 5 minutes (register at go-live).