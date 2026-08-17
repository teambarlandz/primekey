# Contributing — Primekey Homes

> Status: draft · Version: 0.1 · Last updated: 2026-08-17

## 1. Repository layout

```
primekey/
├── backend/       Django 6 + DRF modular monolith (apps/ per bounded context)
├── frontend/      Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui
├── docs/          Engineering specs: ADR, TESTING, RELEASE, PERFORMANCE,
│                  DATA_MODEL, ACCESSIBILITY, PRD
├── frontend/docs/context/  AI-workflow context files (progress-tracker etc.)
├── scripts/       ops scripts (backup.sh, backup_media.sh)
├── nginx/         edge proxy config
└── .github/workflows/ci.yml  CI/CD
```

## 2. Branch model

| Branch | Purpose | Deploys |
|--------|---------|---------|
| `master` | Production. Protected: CI green + 1 review, no direct pushes | production VPS |
| `develop` | Integration / staging | staging VPS |
| `fix/*` | Hotfix branches off a tag (see RELEASE.md) | via master |

Workflow: branch off `develop` (or `master` for hotfixes) → PR → CI green →
review → merge.

## 3. Definition of Done

1. `frontend`: `tsc --noEmit`, `npm run lint`, `npm run test:run`,
   `npm run build` all pass.
2. `backend`: `python -m pytest -q` (from `backend/`) passes — **full suite**
   (pytest.ini collects `apps/` + `core/`).
3. New endpoints ship serializer + view tests; new zod schemas ship vitest
   tests; permission changes ship 401/403 tests.
4. Migration drift check passes: `python manage.py makemigrations --check
   --dry-run` produces no changes.
5. **Docs in sync**: touch `frontend/docs/context/progress-tracker.md` and
   `current-task.md` for any behavior change (ai-workflow-rules.md mandate);
   update `CHANGELOG.md` under Unreleased.
6. Any new env var is documented in `backend/.env.example` and the root
   `.env.example`.

## 4. Code conventions

- Follow `frontend/docs/context/code-standards.md` (path aliases, forms via
  react-hook-form + zod + shadcn, GSAP via useGSAP + reduced-motion guard,
  Nigerian localization: Naira, +234/0x phone formats).
- Backend: business logic in `services.py` (DDD), thin views, DRF
  serializers for validation; bounded contexts do not import each other's
  internals.
- Never commit secrets; `.env*` values stay in the environment (CI + VPS).
- Do not modify `components/ui/*` (shadcn) internals; extend via className or
  wrappers.
- Phase 3 (`apps/ecommerce`) is out of scope while Phases 1-2 are live.

## 5. Commit messages

Conventional style, one logical change per commit:

```
feat: add /api/health uptime endpoint
fix: align messaging tests with assigned-thread scoping
docs: record ADR-009 agent role gating
ops: add scripts/backup.sh daily dump + retention
```

## 6. CI

`.github/workflows/ci.yml` runs: frontend lint/typecheck/vitest/build; backend
check + migrations + full pytest on Postgres/Redis; security scan (bandit,
pip-audit, gitleaks); Cypress e2e. Deploys: `develop` -> staging, `master` ->
production (SSH, `git pull --ff-only` + compose up). Do not bypass CI to
deploy; if the pipeline is down, record the incident per RELEASE.md §2.