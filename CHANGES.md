# CHANGES: Best Practice Adoption

## Date: 2026-07-29

---

## 1. API Contracts & Type Safety

### Before
- No shared types between frontend/backend
- Frontend used inline interfaces, backend used DRF serializers independently
- Mock data in `app/search/page.tsx` with hardcoded `Property` type

### After
- **Single source of truth**: `frontend/lib/api/contracts.ts` defines all request/response shapes
- Frontend imports contracts; backend serializers mirror field names exactly
- Zod schemas (`lib/validations/`) align 1:1 with DRF serializer fields
- TypeScript catches contract drift at compile time

### Files
- `frontend/lib/api/contracts.ts` (new)
- `frontend/lib/validations/searchSchema.ts` (updated to match contracts)
- `backend/apps/properties/serializers.py` (updated to match contracts)

---

## 2. Data Fetching: SWR over Manual State

### Before
```tsx
// app/search/page.tsx
const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
const executeSearch = (filters) => { /* manual filter logic */ };
```

### After
```tsx
// hooks/useProperties.ts
export function useProperties(filters: SearchFilters) {
  return useSWR(['/properties/search', filters], () => api.searchProperties(filters));
}
```

### Benefits
- Automatic caching, deduplication, revalidation on focus/window restore
- Optimistic updates via `mutate()`
- Loading/error states built-in
- Server-side rendering compatible

### Files
- `frontend/hooks/useProperties.ts` (new)
- `frontend/hooks/useConcierge.ts` (new)
- `app/search/page.tsx` (refactored)

---

## 3. Centralized API Client

### Before
- `lib/api-client.ts` with single `submitConciergeLead` function
- No retry logic, no interceptors, inconsistent error handling

### After
- `lib/api/client.ts` class with:
  - Generic `request<T>()` method
  - Standardized `ApiError` with status, field errors, machine-readable codes
  - Exponential backoff on 429
  - Auth token interceptor
  - Request timing logs
  - Environment-aware base URL (proxy in dev, direct in prod)

### Files
- `frontend/lib/api/client.ts` (refactored)
- `frontend/lib/api/config.ts` (new)

---

## 4. Optimistic Mutations

### Before
- Concierge form submission: manual loading state, no cache invalidation

### After
```typescript
// hooks/useConcierge.ts
const submit = async (payload) => {
  setState('submitting');
  try {
    await api.submitConciergeLead(payload);
    mutate('/properties/search'); // invalidate related queries
    setState('success');
  } catch (e) { setState('error'); }
};
```

### Files
- `frontend/hooks/useConcierge.ts` (new)
- `components/search/ConciergeModal.tsx` (updated to use hook)

---

## 5. API Versioning

### Before
- Endpoints at `/api/crm/submit-concierge/`, `/api/search/`

### After
- All endpoints under `/api/v1/`
- `NEXT_PUBLIC_API_VERSION=v1` in frontend env
- Backward compatibility maintained during migrations

### Files
- `backend/core/urls.py` (updated)
- `backend/apps/*/urls.py` (updated)
- `frontend/lib/api/config.ts` (uses version)

---

## 6. Rate Limiting

### Before
- No protection on `/submit-concierge/`

### After
- `django-ratelimit` on sensitive endpoints
- `10/m` per IP on concierge submission
- Frontend exponential backoff on 429

### Files
- `backend/requirements.txt` (added `django-ratelimit`)
- `backend/apps/crm/views.py` (decorated)
- `frontend/lib/api/client.ts` (retry logic)

---

## 7. Validation Parity

### Before
- Frontend Zod schemas and backend DRF serializers diverged
- Nigerian phone regex only in frontend

### After
- Shared regex constant: `NIGERIAN_PHONE_REGEX = r'^(?:\+?234|0)[789][01]\d{8}$'`
- Cross-field validation (minPrice ≤ maxPrice) in both Zod `.refine()` and DRF `.validate()`
- Enum values synchronized (`propertyType`, `bedrooms`)

### Files
- `frontend/lib/validations/searchSchema.ts` (updated)
- `frontend/lib/validations/conciergeSchema.ts` (updated)
- `backend/apps/crm/serializers.py` (updated)
- `backend/apps/properties/serializers.py` (updated)

---

## 8. ConciergeModal Form Fix

### Before
```tsx
// Broken: reset() in useEffect clears user input on every initialFilters change
useEffect(() => {
  if (isOpen) reset({ ...initialFilters, ndprConsent: watch('ndprConsent') });
}, [initialFilters, isOpen, reset]);
```

### After
```tsx
// Fixed: defaultValues in useForm config, setValue only for pre-fill
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ...defaults, ...initialFilters },
});
useEffect(() => {
  if (isOpen) {
    Object.entries(initialFilters).forEach(([k, v]) => form.setValue(k, v));
  }
}, [initialFilters, isOpen]);
```

### Files
- `components/search/ConciergeModal.tsx` (fixed)

---

## 9. CI/CD Pipeline

### Before
- No automated checks

### After
- GitHub Actions workflow: lint, typecheck, test (frontend + backend)
- Branch protection: `main`, `develop` require PR + passing CI
- Pre-commit hooks: `husky` + `lint-staged`

### Files
- `.github/workflows/ci.yml` (new)
- `.husky/pre-commit` (new)
- `package.json` (lint-staged config)

---

## 10. Documentation Updates

| File | Changes |
|------|---------|
| `docs/context/architecture.md` | Added API versioning, contract-first design, SWR data flow |
| `docs/context/code-standards.md` | Added API client patterns, SWR hooks, validation parity rules |
| `docs/context/dependencies.md` | Added `swr`, `django-ratelimit`, `husky`, `lint-staged` |
| `docs/context/progress-tracker.md` | Added Units 1.13–1.18 for integration work |
| `README.md` | Updated tech stack, quick start, project structure |

---

## Package Additions

### Frontend
```json
"dependencies": {
  "swr": "^2.2.0"
},
"devDependencies": {
  "husky": "^8.0.0",
  "lint-staged": "^15.0.0"
}
```

### Backend
```txt
# requirements.txt
django-ratelimit==4.1.0
drf-spectacular==0.27.0  # for OpenAPI schema generation
```

---

## Migration Notes

- **Zero breaking changes** to existing API responses — contracts match current serializer output
- **Frontend backward compatible** — SWR hook wraps existing API client interface
- **Database unchanged** — no model migrations required
- **Rollback strategy** — feature flags via `NEXT_PUBLIC_USE_SWR=true/false`