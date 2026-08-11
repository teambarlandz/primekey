# Admin Role & Permission Hardening Plan

## Requirements Summary

| # | Rule | Enforcement |
|---|------|-------------|
| R1 | Admin (superuser) has full superuser access — can do and undo everything | `is_superuser=True` |
| R2 | CEO, CTO, COO have the same CRUD permissions as admin on all models | Group permissions (full CRUD) |
| R3 | CEO, CTO, COO must NEVER be able to edit/remove the admin account | Custom `UserAdmin` object-level check |
| R4 | Only Admin and CEO can view audit logs (LogEntry) | Custom `LogEntryAdmin` with permission gate |
| R5 | Admin is invisible to other users in the user list | Custom `UserAdmin` queryset filters out superusers for non-superusers |
| R6 | When admin logs in, full unrestricted access is restored | Superuser bypasses all Django permission checks natively |

---

## Current State

- **No superuser exists.** CEO/CTO/COO are all `is_staff=True` only.
- CEO and CTO have full CRUD on `auth.user` + `auth.group` (can create/delete users).
- COO has NO `auth.user` or `auth.group` access.
- No custom `UserAdmin` — using Unfold's default.
- No `LogEntry` admin registered.
- Django's default `LogEntry` model tracks all admin actions but is not exposed in the admin UI.

---

## Implementation Plan

### Step 1: Create Superuser Account

**File:** `backend/apps/dashboard/management/commands/setup_roles.py`

Add a new `ADMIN` account to `ROLE_ACCOUNTS`:
```python
{
    "role": "admin",
    "username": "admin",
    "email": "admin@primekeyhomes.ng",
    "name": "Administrator",
    "is_superuser": True,  # <-- key difference
}
```

- `is_staff=True`, `is_active=True`, `is_superuser=True`
- Not assigned to any group (superuser bypasses groups)
- Password resolution: same CLI/env/debug/production pattern as CEO/CTO/COO
- Idempotent: re-running syncs the account

---

### Step 2: Upgrade CEO/CTO/COO Group Permissions to Full CRUD

**File:** `backend/apps/dashboard/management/commands/setup_roles.py`

Change `ROLE_PERMISSIONS` so CEO, CTO, and COO each get **full CRUD (add, change, delete, view)** on every model:

```python
ROLE_PERMISSIONS = {
    "ceo": {
        "all": [model for models in list(PERMISSION_TARGETS.values()) for model in models],
        "exclude": [],
    },
    "cto": {
        "all": [model for models in list(PERMISSION_TARGETS.values()) for model in models],
        "exclude": [],
    },
    "coo": {
        "all": [model for models in list(PERMISSION_TARGETS.values()) for model in models],
        "exclude": [],
    },
}
```

**Why this works:** CEO/CTO/COO get every `add_`, `change_`, `delete_`, `view_` permission on every registered model. They can manage all data — except the superuser account (enforced in Step 3).

---

### Step 3: Custom UserAdmin — Hide Superuser + Block Non-Superuser Edits

**File:** `backend/apps/dashboard/admin.py` (new `UserAdmin` class)

Create a custom `UserAdmin` that replaces Unfold's default for `auth.User`:

```python
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth import get_user_model
from unfold.admin import ModelAdmin

User = get_user_model()

@admin.register(User)
class UserAdmin(ModelAdmin, DjangoUserAdmin):
    # ... fieldsets, list_display, etc.

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            # R5: Hide admin from user list for non-superusers
            qs = qs.filter(is_superuser=False)
        return qs

    def has_change_permission(self, request, obj=None):
        if obj and obj.is_superuser and not request.user.is_superuser:
            # R3: Non-superusers cannot edit the admin account
            return False
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        if obj and obj.is_superuser and not request.user.is_superuser:
            # R3: Non-superusers cannot delete the admin account
            return False
        return super().has_delete_permission(request, obj)

    def has_view_permission(self, request, obj=None):
        if obj and obj.is_superuser and not request.user.is_superuser:
            # R5: Non-superusers cannot even view the admin account
            return False
        return super().has_view_permission(request, obj)
```

**Protection layers:**
1. **Queryset filter** (R5): Non-superusers never see admin in the user list at all.
2. **Object-level checks** (R3): Even if someone crafts a direct URL to `/admin/auth/user/{admin_id}/change/`, the permission check blocks them.
3. **Django built-in** (R6): `is_superuser=True` automatically bypasses all permission checks — admin can always do everything.

---

### Step 4: LogEntry Admin — Admin + CEO Only

**File:** `backend/core/admin.py` (add `LogEntryAdmin`)

Register Django's built-in `LogEntry` model with a restricted admin:

```python
from django.contrib.admin.models import LogEntry

@admin.register(LogEntry)
class LogEntryAdmin(ModelAdmin):
    # Read-only — logs should never be edited or deleted
    readonly_fields = (
        "action_time", "user", "content_type", "object_id",
        "object_repr", "action_flag", "action_message",
    )
    list_display = ("action_time", "user", "content_type", "object_repr", "action_flag_display")
    list_filter = ("action_flag", "content_type", "user")
    search_fields = ("object_repr", "action_message")
    list_filter_submit = True
    save_on_top = True

    def action_flag_display(self, obj):
        flags = {1: "Add", 2: "Change", 3: "Delete"}
        return flags.get(obj.action_flag, "Unknown")
    action_flag_display.short_description = "Action"

    def has_module_permission(self, request, obj=None):
        # R4: Only superuser (admin) and CEO group can see this module
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name="CEO").exists()

    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name="CEO").exists()

    def has_add_permission(self, request):
        return False  # Logs are system-generated, never created manually

    def has_change_permission(self, request, obj=None):
        return False  # Logs are immutable

    def has_delete_permission(self, request, obj=None):
        return False  # Logs are never deleted
```

**Sidebar visibility:** Add `LogEntry` to the UNFOLD sidebar under a new "Audit" section (only visible to admin/CEO — other users won't have `view_logentry` permission, so Unfold auto-hides it).

---

### Step 5: Sidebar Updates

**File:** `backend/core/settings.py` — `UNFOLD["SIDEBAR"]`

Add a new "Audit" section after "Compliance":

```python
{
    "title": "Audit",
    "items": [
        {"title": "Admin Logs", "icon": "history", "link": reverse_lazy("admin:admin_logentry_changelist")},
    ],
},
```

Only users with `view_logentry` permission (admin + CEO) will see this link. Other users won't see it because Unfold auto-hides items the user lacks permission for.

---

### Step 6: Verification Checklist

| Test | Expected Result |
|------|-----------------|
| Admin logs in → full access to everything | All models visible, all actions available |
| CEO logs in → full CRUD on all models | Can add/edit/delete properties, leads, users, etc. |
| CEO logs in → cannot see admin in user list | User list shows CEO/CTO/COO but not admin |
| CEO logs in → direct URL to admin user edit returns 403 | `has_change_permission` blocks it |
| CEO logs in → can see Admin Logs | `LogEntry` visible in sidebar and accessible |
| CTO logs in → full CRUD on all models | Same as CEO minus LogEntry access |
| CTO logs in → cannot see admin in user list | Filtered out |
| CTO logs in → cannot see Admin Logs | `has_module_permission` returns False |
| COO logs in → full CRUD on all models | Same as CTO |
| COO logs in → cannot see admin in user list | Filtered out |
| COO logs in → cannot see Admin Logs | `has_module_permission` returns False |
| Landlord/Agent logs in → cannot access /admin/ | `is_staff=False`, redirected to login |

---

## Files to Create/Modify

| File | Action | Priority |
|------|--------|----------|
| `backend/apps/dashboard/management/commands/setup_roles.py` | Add admin superuser, upgrade CEO/CTO/COO to full CRUD | **HIGH** |
| `backend/apps/dashboard/admin.py` | Add custom `UserAdmin` with queryset filter + object-level guards | **HIGH** |
| `backend/core/admin.py` | Add `LogEntryAdmin` (read-only, admin+CEO only) | **HIGH** |
| `backend/core/settings.py` | Add "Audit" sidebar section | **MEDIUM** |

---

## Design Principles

1. **Defense in depth** — Queryset filtering + object-level permission checks + Django's built-in superuser bypass
2. **Least privilege** — CEO/CTO/COO get model-level CRUD but are blocked at the object level from touching the superuser
3. **Immutability** — Audit logs are read-only; no one can edit or delete them
4. **Visibility control** — Admin is ghost-invisible to non-superusers; LogEntry is only visible to admin+CEO
5. **Idempotent setup** — `setup_roles` can be re-run safely to sync permissions

---

## Execution Order

1. Update `setup_roles.py` (Step 1 + Step 2)
2. Create `UserAdmin` in `dashboard/admin.py` (Step 3)
3. Create `LogEntryAdmin` in `core/admin.py` (Step 4)
4. Update sidebar in `settings.py` (Step 5)
5. Run `python manage.py setup_roles` to apply
6. Run verification checklist (Step 6)
