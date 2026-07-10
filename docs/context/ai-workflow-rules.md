# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. The context files (`project-overview.md`, `architecture.md`, `code-standards.md`, `ui-context.md`, `progress-tracker.md`, `deployment-ops.md`) define what to build, how to build it, and the current state of progress. Always implement against these specs — do not infer or invent behavior from scratch. When in doubt, consult the relevant context file or ask for clarification.

Work in small, verifiable increments (units). Each unit is a self-contained piece of functionality that can be independently verified. Do not move to the next unit until the current unit is complete, tested, and documented.

---

## Autonomous Execution Loop (Session Workflow)

When starting a new session, follow this exact loop without deviation.

### Step 1: Read the Active Directive
- Read `current-task.md` from the `context/` folder.
- Understand the **Current Unit** (ID, description, acceptance criteria, and files to modify).
- Also read `progress-tracker.md` to understand the overall phase and what has been completed.
- Do not infer or invent additional work beyond what is specified in the unit.

### Step 2: Execute the Unit
- Implement the unit exactly as described in `current-task.md`.
- Follow all rules in `code-standards.md`, `architecture.md`, and `ui-context.md`.
- Write clean, testable code. **Place business logic in Domain Services** (DDD pattern), not in Views or Models.
- Respect Bounded Context boundaries: do not mix code from different contexts in a single unit.
- **Do not** touch files outside the "Files to Modify" list unless absolutely necessary (and log why).

### Step 3: Self-Verify Against Acceptance Criteria
- Before declaring the unit complete, strictly verify **every** acceptance criterion listed in `current-task.md`.
- If any criterion is not met:
  - **Stop immediately**.
  - Log the failure in `progress-tracker.md` under "Open Questions" or a new "Blockers" section.
  - Report the failure clearly to the user and wait for guidance.
- If all criteria pass, proceed to Step 4.

### Step 4: Update Progress Records
- **Update `progress-tracker.md`**:
  - Move the completed unit from "In Progress" to "Completed" in the Master Task List.
  - Add a brief summary of what was implemented (e.g., "Unit 1.1: Intent Gateway UI built with responsive cards").
  - Update "Next Up" to the next unit ID.
- **Update `current-task.md`**:
  - Replace the contents with the details of the next unit (ID, description, acceptance criteria, files to modify) as listed in the "Next Up" section of `progress-tracker.md`.
  - If there are no more units in the current phase, update `current-task.md` to state that the phase is complete and suggest moving to the next phase.

### Step 5: Stop and Await Confirmation
- After updating the records, **stop** and report to the user:
  - "Unit [ID] is complete. All acceptance criteria passed. I have updated `progress-tracker.md` and `current-task.md` to point to the next unit ([Next Unit ID]). Please review and confirm to proceed."
- **Do not automatically proceed to the next unit** without explicit user confirmation. This is the "human-in-the-loop" checkpoint.

---

## Safety Valves (Preventing Endless Loops)

To prevent the AI from getting caught in infinite retry cycles or endless processing, the following hard limits apply.

### 1. Maximum Retry Limit (3 Strikes Rule)
- If an implementation attempt fails (e.g., a test fails, the build breaks, or the code does not meet criteria):
  - **Attempt 1**: Fix the immediate error.
  - **Attempt 2**: If still failing, try a different approach (e.g., refactor, check dependencies).
  - **Attempt 3**: If still failing, **STOP IMMEDIATELY**.
- Do not attempt a 4th fix. Log the exact error and the attempted solutions in `progress-tracker.md` under a new "Blockers" section.
- Report to the user: *"Unit [ID] failed after 3 attempts. Please review the logs and provide guidance. I cannot proceed without intervention."*

### 2. Time Guard (Estimated Time Box)
- Each unit has an "Estimated Time" in `current-task.md` (e.g., 1-2 hours).
- If the unit exceeds the estimated time by **50%** (e.g., 3 hours for a 2-hour unit), stop immediately.
- Report to the user: *"Unit [ID] is taking longer than estimated. Please check in. Should I continue or adjust the approach?"*

### 3. Compilation/Build Failure Loop Protection
- If you make a change and the `npm run build` (Next.js) or `python manage.py test` (Django) fails:
  - You may attempt to fix it **once**.
  - If the fix fails, **do not make another fix**. Instead, report the error and stop.
  - *Reasoning:* Repeatedly guessing fixes for obscure build errors is dangerous and wastes time. A human should diagnose the root cause.

### 4. Self-Referential Loop Protection (Agentic Awareness)
- You are an AI. You can modify code and update progress files.
- **You are NOT allowed to modify `ai-workflow-rules.md` itself.** This prevents you from overriding your own constraints to "escape" the loop.
- **You are NOT allowed to modify `current-task.md` to skip or remove a unit without user permission.** Skipping must be done manually by the user.

### 5. The "Escape Hatch" (User Intervention)
- If at any point you feel uncertain, confused, or stuck, **stop immediately**.
- Add a comment in the code `// HUMAN: Please review this logic` or update `progress-tracker.md` with a question.
- Do not proceed until the user responds.

---

## Scoping Rules

- **Work on one unit at a time.** A unit is defined in `progress-tracker.md` and `current-task.md`.
- **Prefer small, verifiable increments** over large speculative changes. A unit should take no more than 1-3 hours of AI-driven development.
- **Respect Bounded Contexts**: A single unit must not mix code from different Bounded Contexts (e.g., Buyer and Landlord). Treat each Context as its own development domain.
- **Phase 3 is Out of Scope**: The Builder Context (`ecommerce` module) is stubbed and MUST NOT be modified or extended during Phases 1-2. It is an optional extension that will be activated only after Phases 1-2 are live and profitable.

---

## When to Split Work

Split an implementation step if it combines:

- **UI changes and backend changes** that are not a simple API contract update (e.g., adding a new field to a form AND implementing a new database column AND updating the API logic — split into: 1) database migration, 2) backend API update, 3) frontend UI update).
- **Multiple unrelated API routes** (e.g., implementing both `/api/search` and `/api/submit-concierge` in one step — split into separate units).
- **Behavior not clearly defined in the context files** (e.g., "Add lead scoring logic" — first clarify the scoring rules in `architecture.md` or `progress-tracker.md` before implementing).
- **Multiple Bounded Contexts** (e.g., work on the Buyer Context first, then Landlord Context, then Builder Context — do not interleave them).
- **Core logic and compliance wiring** (e.g., implementing the concierge submission AND the NDPR consent logging — these are separate concerns and should be split).
- **Frontend styling and backend logic** (e.g., styling the concierge modal AND building the form submission handler — split into: 1) UI component with static content, 2) form validation logic, 3) API integration).

If a change cannot be verified end to end quickly (e.g., requires a full database migration + backend deployment + frontend deployment to test), the scope is too broad — split it.

---

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files. If the PRD does not specify a behavior, do not implement it.
- If a requirement is ambiguous (e.g., "Lead scoring should be dynamic" but no scoring rules are defined), resolve it in the relevant context file before implementing. Add the clarification to `architecture.md` or `progress-tracker.md` and get sign-off.
- If a requirement is missing (e.g., "How long should the 2-hour SLA timer start from?"), add it as an open question in `progress-tracker.md` before continuing. Do not assume a default value.
- For NDPR compliance requirements, always consult the NDPR Compliance Specification in the PRD. If a specific compliance rule is not documented, flag it as an open question — do not guess.

---

## Protected Files

Do not modify the following unless explicitly instructed:

- `components/ui/*` — shadcn/ui generated components. Do not modify their source code. Extend via className or wrap in custom components.
- `backend/settings/*` — Django settings files. Only modify when adding new environment variables or approved dependencies.
- `backend/apps/*/migrations/*` — Auto-generated Django migration files. Do not edit manually unless absolutely necessary (and document why).
- `package.json` / `pnpm-lock.yaml` / `requirements.txt` — Dependency files. Only modify when adding or updating an approved package.
- `.env.example` / `.env` — Environment variables. Do not commit secrets; use `.env.example` as a template.
- **Any third-party library internals** — Do not patch or modify node_modules or site-packages. Use the public API.
- **`ai-workflow-rules.md` itself** — You are not allowed to modify this file.

---

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes the system design:

- **System architecture or boundaries**: If you add a new service, module, or change how components communicate, update `architecture.md`.
- **Storage model decisions**: If you add a new table, modify the schema, or change data persistence strategy, update `architecture.md` (the Storage Model section) and record the decision in `progress-tracker.md`.
- **Code conventions or standards**: If you establish a new pattern (e.g., a new way of handling forms, a new validation approach), update `code-standards.md`.
- **Feature scope**: If a feature is added, removed, or significantly altered, update `project-overview.md` (Features and Scope sections).
- **UI changes**: If you change a color token, layout pattern, or component usage, update `ui-context.md`.

Always record the rationale for significant decisions in the "Architecture Decisions" section of `progress-tracker.md`.

---

## Before Moving to the Next Unit

1. **The current unit works end to end within its defined scope.** The feature passes manual testing (and automated tests if applicable) and behaves as specified in the PRD.
2. **No invariant defined in `architecture.md` was violated.** For example, no external CRM data is stored, all new leads have a corresponding `consent_logs` entry, and no business logic is in database triggers.
3. **`progress-tracker.md` reflects the completed work.** The "Completed" section is updated with the unit name, a brief description, and any relevant decisions or learnings.
4. **`npm run build` passes** (for the Next.js frontend) and **`python manage.py test` passes** (for the Django backend). If the unit does not include changes to both sides, at least the affected side's build/test must pass.
5. **The code passes linting and formatting checks** (e.g., `npm run lint`, `black`, `eslint`).
6. **Any new environment variables or configuration changes are documented** in `.env.example` and `progress-tracker.md`.
7. **If the unit added or modified a user-facing feature, the UI is responsive** and works on mobile, tablet, and desktop (per `ui-context.md` breakpoints).

---

## Summary of Key Rules

| Rule | Enforcement |
|------|-------------|
| Read `current-task.md` at start of every session | ✅ Step 1 of Autonomous Loop |
| Implement unit exactly as described | ✅ Step 2 |
| Verify all acceptance criteria before proceeding | ✅ Step 3 |
| Update `progress-tracker.md` and `current-task.md` after completion | ✅ Step 4 |
| Stop and await confirmation before next unit | ✅ Step 5 (human-in-the-loop) |
| Maximum 3 retry attempts per failure | ✅ Safety Valve 1 |
| Stop if unit exceeds estimated time by 50% | ✅ Safety Valve 2 |
| One fix attempt for build failures | ✅ Safety Valve 3 |
| Do not modify `ai-workflow-rules.md` or skip units | ✅ Safety Valve 4 |
| Stop if uncertain or stuck | ✅ Safety Valve 5 |
| Respect Bounded Context boundaries | ✅ Scoping Rules |
| Phase 3 (Builder) out of scope for Phases 1-2 | ✅ Scoping Rules |
| Protected files: `components/ui/`, settings, migrations, dependencies | ✅ Protected Files |