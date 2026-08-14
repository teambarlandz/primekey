# TODO — Contact Form Email Delivery

## Status: COMPLETE (console backend)

All code is wired and working. Emails print to the Django console (terminal) during development.

---

## What was built

### Backend (`apps/contact/`)
- **Model** — `ContactMessage` (persists all submissions to DB)
- **Serializer** — validates `full_name`, `email`, `phone`, `subject`, `message`
- **View** — `POST /api/v1/contact/` — saves to DB + sends email via `django.core.mail.send_mail()`
- **Rate limit** — 5/min per IP
- **Migration** — `0001_initial.py` applied

### Frontend
- `submitContactForm()` in `api-client.ts`
- `/contact` page wired to call the API (replaces simulated delay)

### Settings (`core/settings.py`)
- `EMAIL_BACKEND` defaults to `console.EmailBackend` (prints to terminal)
- `CONTACT_RECIPIENT_EMAIL` defaults to `hello@primekeyhomes.com`

---

## To switch to real Hostinger SMTP

1. Create mailbox `hello@primekeyhomes.com` in Hostinger hPanel
2. Add to `backend/.env`:
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USE_SSL=True
EMAIL_USE_TLS=False
EMAIL_HOST_USER=hello@primekeyhomes.com
EMAIL_HOST_PASSWORD=<your-password>
```
3. Restart Django server

---

## Files created/modified
- `backend/core/settings.py` — EMAIL_* settings
- `backend/apps/contact/__init__.py`
- `backend/apps/contact/apps.py`
- `backend/apps/contact/models.py`
- `backend/apps/contact/serializers.py`
- `backend/apps/contact/views.py`
- `backend/apps/contact/urls.py`
- `backend/apps/contact/migrations/0001_initial.py`
- `backend/core/settings.py` — INSTALLED_APPS
- `backend/core/urls.py` — contact endpoint
- `frontend/lib/api-client.ts` — submitContactForm()
- `frontend/app/contact/page.tsx` — wired onSubmit
