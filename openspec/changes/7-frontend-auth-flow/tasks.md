# Tasks: Frontend Authentication Flow

Implementation, automated tests, and maintainer manual verification are checked below. Final artifact synchronization and archive remain unchecked.

## 1. Contract and API Boundary

- [x] 1.1 Define strict DTO, user, organization, membership, full-session, auth-only refresh, and error-envelope types. Model nested `memberships[].organization` and flat `activeMembership` exactly.
- [x] 1.2 Extend the existing API client with opt-in `credentials: include`, Bearer authorization, timeout/network handling, validated error codes, and empty `204` support without changing health behavior.
- [x] 1.3 Add adapters for register, login, refresh, `/me`, select-organization, and logout. Assert exact paths, methods, bodies, statuses, response semantics, cookie use, and memory-only access tokens.
- [x] 1.4 Add contract tests for `credentials: include` on register/login/refresh/logout, full-session register/login, observed `Set-Cookie`, auth-only refresh with no refresh token JSON, `/me` without auth in the body, selection with a new access token, and `204` logout. Evidence: `tests/auth-api.contract.test.ts` passes 6 tests under `npm test -- --run`; endpoint URLs, statuses, cookie boundaries, and token headers are asserted. HttpOnly cookie attributes are not claimed as frontend-JS evidence.

## 2. Session State and Protection

- [x] 2.1 Create one provider/hook with private in-memory token and `bootstrapping`, `anonymous`, `authenticated`, and `selection-required` states.
- [x] 2.2 Implement one bounded bootstrap: refresh with cookie credentials, then `/me` with Bearer; distinguish first visit from expired/revoked only through observable HTTP signals, suppress initial-refresh session notices on public login/register routes, preserve them on protected routes, and never map all failures to `SESSION_EXPIRED`.
- [x] 2.3 Add route gates for dashboard and selector, authenticated-user redirects from login/register, pending-selection redirects, loading boundaries, and no-loop behavior.
- [x] 2.4 Add state tests for registration, one/multiple/zero active memberships, bootstrap success/no-session/revoked failure, selection replacement, and logout success/error. Evidence: `tests/auth-provider.state.test.tsx` passes 7 tests under `npm test -- --run` using mocked adapters and the real provider, including a structurally valid zero-ACTIVE session-shaped fixture rejected by the production guard, isolated public `UNAUTHORIZED` and protected `SESSION_REVOKED` bootstrap cases, fresh per-test mocks, async-safe cleanup, and no act warnings.

## 3. Routes and Accessible UI

- [x] 3.1 Build login and register using existing UI primitives with required validation, loading, disabled, success, duplicate-email, invalid-credentials, inactive-user, and generic error states.
- [x] 3.2 Build organization selection from validated memberships only, showing nested organization names and roles; retain `ORGANIZATION_ACCESS_DENIED` and generic failures for retry.
- [x] 3.3 Build the dashboard placeholder with only user, active organization, roles, logout, and `/health`; handle logout `204`, pending, and failure states.
- [x] 3.4 Verify labels, associated errors, semantic controls, keyboard operation, visible focus, status announcements, and mobile/tablet/desktop layouts without horizontal scrolling. Evidence: maintainer manually verified desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`.

## 4. Verification and Closeout

- [x] 4.1 Execute manual contract cases for every endpoint: register `201` + `Set-Cookie`, login `200` + `Set-Cookie`, `/me` Bearer, selection Bearer/new token, refresh cookie/auth-only, logout `204`, cookie attributes, and response shapes. Evidence: maintainer manually verified desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`.
- [x] 4.2 Execute manual behavior cases for first visit, valid reload, expired/revoked session, zero/one/multiple memberships, redirects, retryable selection errors, validation, unknown/network/timeout errors, no token in storage/URL, `/`, and `/health`. Evidence: maintainer manually verified desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`.
- [x] 4.3 Resolve or record the local browser-cookie prerequisite: backend default port `3001` versus frontend README/env and backend `FRONTEND_URL` references to `3000`/`3001`; do not change the contract or backend in this issue.
- [x] 4.4 Run strict OpenSpec validation, existing applicable tests, `npm run lint`, and `npm run build`; fix only approved-scope failures. Evidence: current 13 passing Vitest tests, strict OpenSpec validation, lint, TypeScript, build, git diff check, and lockfile dry-run passed.
- [ ] 4.5 After implementation, synchronize artifacts, confirm every task is verified before checking it, and archive only when the plan is complete.

## Scope Guard

No backend changes, production auth behavior changes, dashboard expansion, organization switching, persistence, dashboard features, other out-of-scope auth features, or apply-progress artifacts. Vitest infrastructure and its development dependencies are approved only for tasks 1.4 and 2.4.

## Remediation Status

The approved `active-membership-guard-remediation` work unit addresses only the confirmed membership guard finding: cardinality and selection decisions use ACTIVE memberships, active tenant context is coherent, inactive activeMembership values are rejected, and membership/organization identifiers are unique. Browser/manual and accessibility verification are complete; archive remains unchecked.

## Current Implementation Evidence

- Routes and behavior are present in `src/app/(session)/auth/login/page.tsx`, `register/page.tsx`, `select-organization/page.tsx`, and `dashboard/page.tsx`; `/` and `/health` remain available.
- `AuthProvider` owns a private in-memory access token, performs one refresh followed by `/me`, exposes `bootstrapping`, `anonymous`, `authenticated`, and `selection-required`, and clears memory on logout or failed bootstrap. `SessionBoundary` protects dashboard/selector routes and redirects entry routes without loops.
- Runtime session validation filters decisions to `ACTIVE` memberships, requires unique membership and organization IDs, preserves nested membership organizations versus flat active membership, and rejects incoherent or zero-active sessions.
- `auth-error.ts` maps `SESSION_EXPIRED`, `SESSION_REVOKED`, `UNAUTHORIZED`, and other known codes to safe messages. `AuthProvider` applies those session messages route-aware during failed initial refresh: public login/register remains quietly anonymous, while protected routes retain the notice. The current backend still returns `SESSION_REVOKED` for refresh without `legacylift_refresh`, so the frontend mitigation does not remove the backend contract blocker.
- Visual/auth remediation is implemented. The maintainer manually verified desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`.

## Evidence Boundaries

- `1.4`: `tests/auth-api.contract.test.ts` executes six mocked-fetch contract tests for the approved endpoint paths, methods, expected statuses, credentials, Bearer headers, response validation, observed `Set-Cookie` boundaries, auth-only refresh, and `204` handling. HttpOnly cookie attributes remain outside frontend-JS visibility.
- `2.4`: `tests/auth-provider.state.test.tsx` executes seven mocked-adapter tests against the real provider for bounded bootstrap, distinct no-session and `SESSION_REVOKED` notices, one/multiple/zero ACTIVE membership outcomes, selection token replacement, registration, and logout handling without act warnings. The zero-ACTIVE test uses a structurally valid session-shaped fixture and asserts the provider runtime guard leaves the state anonymous; each test gets reset mocks and async-safe root cleanup.
- `3.4`, `4.1`, and `4.2`: Maintainer manually verified desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`. The backend still returns `SESSION_REVOKED` when refresh has no `legacylift_refresh` cookie; the frontend route-aware mitigation remains documented and verified.
- `4.5`: Proposal, exploration, spec, design, and tasks are synchronized with the current implementation and evidence, but this final synchronization/archive task remains unchecked by request; no archive is performed.
