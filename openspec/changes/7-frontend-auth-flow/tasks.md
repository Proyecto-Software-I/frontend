# Tasks: Multi-Tenant Frontend Authentication Flow

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 650-800 |
| Review budget | 800 changed lines |
| 400-line budget risk | High |
| Chained PRs recommended | No; chain not applicable |
| Delivery strategy | ask-always |
| Suggested split | Single PR, explicit maintainer review; no chain |

Decision needed before apply: Yes (confirm error-code mapping + cookie topology)
Chained PRs recommended: No
400-line budget risk: High

### Work Units and Dependencies

| Unit | Deliverable | Dependency |
|------|-------------|------------|
| 1 | API contracts and shared request boundary | None |
| 2 | In-memory provider and bootstrap gates | Unit 1 |
| 3 | Route presentations and navigation | Unit 2 |
| 4 | Verification and OpenSpec closeout | Units 1-3 |

## Phase 1: Contracts and API Boundary

- [ ] 1.1 Define strict auth DTOs, session/membership models, response guards, and backend error-envelope/code mapping under `src/features/auth/types` and `src/features/auth/api`, using backend #5 paths and fields without contract changes.
- [ ] 1.2 Extend `src/lib/api/api-client.ts` and `src/lib/api/api-error.ts` with opt-in `credentials`, Bearer authorization, typed error data, timeout/network handling, and empty-body `204` support; preserve `/api/health` behavior.
- [ ] 1.3 Add adapters for register, login, refresh, `/me`, select-organization, and logout under `src/features/auth/api`; validate external responses and keep access tokens memory-only.

## Phase 2: Auth State and Protection

- [ ] 2.1 Create one `AuthProvider` and auth hook under `src/features/auth` owning token, session, `bootstrapping`, `anonymous`, `authenticated`, and `selection-required` states.
- [ ] 2.2 Implement one bounded bootstrap in `src/features/auth/provider.tsx`: `POST /refresh` with cookie credentials, then authenticated `GET /me`; clear memory and redirect once on failure without recursive refresh.
- [ ] 2.3 Add session route-group layout/gates under `src/app/(session)` to protect dashboard and selector, redirect pending selection, and redirect authenticated users from login/register while showing bootstrap loading.

## Phase 3: Routes and UI

- [ ] 3.1 Build `/auth/login` and `/auth/register` using feature components and existing UI primitives; cover validation, loading, error, success, disabled submit, and single-organization/dashboard transitions.
- [ ] 3.2 Build `/auth/select-organization` from validated `memberships[]` names/roles only; submit listed IDs, retain selection errors, and allow retry.
- [ ] 3.3 Build `/dashboard` placeholder with user, active organization, roles, logout, and `/health`; handle logout loading/error/success and preserve `/` and `/health` regression behavior.
- [ ] 3.4 Verify semantic labels, associated errors, keyboard/focus behavior, safe messages, and responsive mobile/tablet/desktop layouts without horizontal scrolling; add no dependencies.

## Phase 4: Verification and Closeout

- [ ] 4.1 Add focused existing-tool tests for guards, error mapping, adapter headers/credentials, malformed responses, provider transitions, bounded bootstrap, multi-membership selection, and `204` logout.
- [ ] 4.2 Run issue manual scenarios: register, single/multi-tenant login, invalid credentials, failed selection/retry, reload/refresh failure, route protection, logout, keyboard/responsive states, no token in storage/URL, and `/health`.
- [ ] 4.3 Run `npm run check`, strict OpenSpec validation, lint, and build; fix only approved-scope failures.
- [ ] 4.4 Sync OpenSpec after implementation, confirm all tasks complete and specs match behavior, then archive `7-frontend-auth-flow` with `openspec archive`.
