# Data Model — Primekey Homes

> Status: draft · Version: 0.1 · Owner: @teambarlandz · Last updated: 2026-08-17
> Source of truth: `backend/apps/*/models.py` + migrations. UUID PKs everywhere;
> PostgreSQL; NGN monetary fields are `DecimalField(12,2)`. No raw SQL.

## 1. Conventions

- All PKs are UUID (`uuid.uuid4`, `editable=False`).
- `created_at` / `updated_at` timestamps are `TIMESTAMPTZ` (auto-set).
- NDPR: every lead/application record carries a mandatory consent flag; every
  consent interaction is mirrored into a `ConsentLog` row (immutable).
- Sensitive uploads (landlord docs, resumes) use **protected storage** outside
  `MEDIA_ROOT` and are served only via authenticated endpoints.
- Money: `DecimalField(max_digits=12, decimal_places=2)`, currency `NGN`.

## 2. CRM / Concierge (`apps/crm`)

### `concierge_leads` — ConciergeLead
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| full_name | Char(255) | |
| phone | Char(20) | indexed; Nigerian format validated |
| email | Email, null | |
| preferred_location | Char(100) | |
| budget_min / budget_max | Decimal(12,2) | |
| property_type | Char(50) | |
| bedroom_count | Char(20) | |
| lead_score | Int | set by LeadScoringService |
| status | Char | NEW/ASSIGNED/IN_PROGRESS/CLOSED/EXPIRED |
| assigned_agent | FK AgentProfile, null | |
| inquiry_message | Text, null | property inquiry body |
| listing | FK Property, null | buyer inquiry source listing |
| sla_deadline | DateTime | `now() + 2h` at creation |
| created_at / updated_at | DateTime | |

### `lead_scores` — LeadScore
`lead` (FK, unique), `total_score` Int, `breakdown` JSON (per-factor), tier,
`created_at`. Persisted idempotently by `LeadScoringService.persist_score`.

### `sla_alerts` — SLAAlert
`lead` FK, `severity` (warning/breach/critical), `message`, `acknowledged_by`,
`acknowledged_at`, `created_at`. Raised by `SLAAlertService.check_overdue_leads`
(30 min / 2 hr / 3 hr).

### `consent_logs` — crm.ConsentLog
`lead` FK, `consent_given` Bool, `consent_text` Text, `ip_address` INET,
`user_agent`, `timestamp`. Immutable audit row per submission.
*(Separate from the centralized `compliance.ConsentLog` — see §6.)*

## 3. Properties (`apps/properties`)

### `properties` — Property
| Field | Type | Notes |
|-------|------|-------|
| title / description | Char(200) / Text | |
| purpose | Char(20) | sale / rent / short_let, indexed |
| property_type | Char(50) | 15 Nigerian market types (self_contain → mansion, land, commercial) |
| price | Decimal(12,2) | `MinValueValidator(0)` |
| currency | Char(10) | default `NGN` |
| is_negotiable | Bool | |
| address / city / state / area | Char | `state` default Lagos |
| bedrooms / bathrooms / toilets | Int | `MinValueValidator(0)` |
| is_serviced / is_furnished | Bool | |
| status | Char(20) | available / under_contract / rented / sold |
| is_featured | Bool | featured-first ordering in search |

### `property_images` — PropertyImage
`property` FK (CASCADE), `image_url` URL(500), `caption`, `is_primary`
(primary-first ordering).

### `inspection_requests` — InspectionRequest
Buyer tour requests: `property` FK, `user` FK (auth.User, null), `full_name`,
`phone`, `email`, `preferred_date`, `time_slot`, `tour_type`
(in_person/virtual), `notes`, `status` (pending/confirmed/cancelled/completed).

## 4. Landlords (`apps/landlords`)

### `landlord_profiles` — LandlordProfile
`user` FK (auth.User, null — linked via OTP login), `full_name`, `phone`
(indexed), `email` (indexed), `id_type` (nin/passport/driver_license/
voter_card), `id_number`, `property_count`, `ndpr_consent` + `consent_timestamp`,
`verification_status` (pending/approved/rejected, indexed).

### `landlord_property_intakes` — PropertyIntake
`landlord` FK (CASCADE), `title`, `property_type`, `price`, `is_negotiable`,
`address/city/state/area`, `bedrooms/bathrooms/toilets`, `description`, `status`
(draft/submitted/approved/rejected). Serializer hardens `price>0`,
beds/baths/toilets `>=1`.

### `landlord_appointments` — Appointment
`landlord` FK, `preferred_date` (past dates rejected), `time_slot`
(allowlist: 09:00/11:00/14:00/16:00), `tour_type`, `notes`, `status`
(pending/confirmed/completed/cancelled). Duplicate date+slot guarded
(excluding cancelled).

### `landlord_documents` — DocumentVault
`landlord` FK, `intake` FK (null), `doc_type` (title_deed / C-of-O /
proof_of_ownership / government_id / land_receipt / other), `file`
(**protected storage**, randomized filename, signature-checked upload),
`review_status` (pending/approved/rejected), `review_notes`, `reviewed_at`.

## 5. Dashboard / Agents (`apps/dashboard`)

### `agent_profiles` — AgentProfile
`user` FK (OneToOne, auth.User), `role` (agent/manager/admin), `phone`
(unique, indexed), `full_name`, `is_active`. `can_manage` property = role in
(manager, admin). Gates: `IsAgent` / `IsManager` permissions.

## 6. Compliance / NDPR (`apps/compliance`)

### `consent_logs` — compliance.ConsentLog (centralized)
Subject identified by `email` **or** `phone` (at least one). `purpose`
(concierge_sourcing, marketing_emails, sms_notifications, property_alerts,
data_analytics, third_party_sharing), `consent_given`, `consent_text`,
`version` (default `1.0`), `legal_basis` (Art 6(1) a–f, default consent),
`ip_address`, `user_agent`, `referrer`, withdrawal fields
(`withdrawn`, `withdrawn_at`, `withdrawal_method`). Composite indexes on
(email, purpose) and (phone, purpose).

### `compliance_export_requests` — ExportRequest (Right of Access)
`email`/`phone`, `status` (pending → verified → processing → completed /
failed / expired), `include_metadata`, `reason`, `verification_code`
(**salted HMAC-SHA256** of 6-digit code), `verification_sent_at`,
`verified_at`, `verification_attempts`, `download_url`, `records_count`,
`expires_at`, `completed_at`, `errors` JSON.

### `compliance_erasure_requests` — ErasureRequest (Right to Erasure)
Same verification fields as ExportRequest; `records_erased` JSON,
`rejected` + `rejection_reason` (legal_obligation / legal_claims /
public_interest / freedom_expression), `completed_at`.

### `compliance_anonymization_logs` — AnonymizationLog (immutable)
`lead_id` (indexed), `lead_phone`, `lead_email`, `fields_anonymized` JSON,
`original_data_hash` (**SHA-256 of original PII** — verifiable via
`verify_original_data`), `trigger` (erasure_request / retention_policy /
admin_action / sla_breach), `triggered_by` FK, `related_request_id`,
`created_at`. Index (trigger, created_at).

## 7. Auth (`apps/otp_auth`)

### `otp_codes` — OTPCode
`phone` (indexed), `code` (**salted HMAC-SHA256 digest only** — plaintext
never stored), `purpose` (login/register/password_reset/agent_login),
`expires_at` (5 min), `used`, `used_at`, `attempts` (max 3),
`ip_address`, `user_agent`. Per-phone brute-force lockout: 3 failures → 300 s
(Redis key, shared across codes for the phone). Verification binds to the
send-time IP + user-agent when recorded.

## 8. Users (`apps/users`)

### `user_favorites` — Favorite
`user` FK (CASCADE), `property` FK (CASCADE), `created_at`.
Unique constraint `(user, property)`.

## 9. Messaging (`apps/messaging`)

### `messaging_whatsappthreads` — WhatsAppThread
`phone` (indexed), `display_name`, `assigned_agent` FK AgentProfile (null;
**scoping rule**: threads visible to assigned agent or managers only),
`concierge_lead` FK (OneToOne, null), `landlord` FK (OneToOne, null),
`last_message`, `last_message_at`, `created_at`, `updated_at`.
Ordering: `-last_message_at, -updated_at`.

### `messaging_whatsappmessages` — WhatsAppMessage
`thread` FK (CASCADE), `direction` (outbound/inbound), `body` Text,
`created_at`. Ordering: `created_at`.

## 10. Notifications (`apps/notifications`)

### `notifications` — Notification
`recipient_type` (landlord/agent, indexed), `recipient_id` UUID (indexed),
`title`, `message`, `is_read` (indexed), `created_at`. Polymorphic recipient
by `(recipient_type, recipient_id)`.

## 11. Careers (`apps/careers`)

### `careers_job_openings` — JobOpening
`title`, `team`, `location`, `employment_type`, `summary`,
`application_email` (default careers@primekeyhomesandpropertiesltd.com), `is_active`
(public API exposes active only), `order`.

### `careers_job_applications` — JobApplication
`job_opening` FK, `first_name`/`middle_name`/`last_name`, `email`, `phone`,
`cover_letter`, `resume` FileField (protected storage — never served
publicly), `ndpr_consent` (mandatory), `status`
(pending/reviewed/shortlisted/rejected).

## 12. Contact (`apps/contact`)

### `contact_messages` — ContactMessage
`full_name`, `email`, `phone`, `subject` (general/sales/support/landlord/
partnership/legal/other), `message`, `is_read`, `created_at`. Persisted by
`POST /api/v1/contact/` (rate-limited 5/min/IP) + email via console/SMTP.

## 13. E-commerce (`apps/ecommerce`)

Stubbed — no models yet (Phase 3 gate, ADR-001). Do not extend during Phases 1–2.

## 14. Indexing & retention notes

- Search-critical indexed columns: `properties` (purpose, property_type,
  price, city, area), `concierge_leads.phone`, consent subject columns,
  OTP (phone, purpose, used).
- NDPR retention: leads inactive 180 days are anonymized by
  `anonymize_leads` management command (scheduled on django-q); every
  anonymization appends an `AnonymizationLog` row with the PII hash.
- Migrations: committed per-app; drift-checked in CI
  (`makemigrations --check --dry-run`).