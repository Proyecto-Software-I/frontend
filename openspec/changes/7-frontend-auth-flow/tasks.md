# Tasks: Frontend Authentication Flow

Implementation, automated tests, fresh review, manual verification, and artifact synchronization are complete. Final native verification is next; archive follows only after a passing verify report.

## 1. Contract and API Boundary

- [x] 1.1 Define strict DTO, user, organization, membership, full-session, auth-only refresh, and error-envelope types. Model nested `memberships[].organization` and flat `activeMembership` exactly.
- [x] 1.2 Extend the existing API client with opt-in `credentials: include`, Bearer authorization, timeout/network handling, validated error codes, and empty `204` support without changing health behavior.
- [x] 1.3 Add adapters for register, login, refresh, `/me`, select-organization, and logout. Assert exact paths, methods, bodies, statuses, response semantics, cookie use, and memory-only access tokens.
- [x] 1.4 Add contract tests for `credentials: include` on register/login/refresh/logout, full-session register/login, observed `Set-Cookie`, auth-only refresh with no refresh token JSON, `/me` without auth in the body, selection with a new access token, and `204` logout. Evidence: `tests/auth-api.contract.test.ts` passes 6 tests under `npm test -- --run`; endpoint URLs, statuses, cookie boundaries, and token headers are asserted. HttpOnly cookie attributes are not claimed as frontend-JS evidence.

## 2. Session State and Protection

- [x] 2.1 Create one provider/hook with private in-memory token and `bootstrapping`, `anonymous`, `authenticated`, and `selection-required` states.
- [x] 2.2 Implement one bounded, single-flight bootstrap that skips refresh when a token exists and generation-gates stale results while preserving route-aware notices.
- [x] 2.3 Add route gates for dashboard and selector, authenticated-user redirects from login/register, pending-selection redirects, loading boundaries, and no-loop behavior.
- [x] 2.4 Add state tests for membership outcomes, bootstrap, selection, and logout, including deterministic Strict Mode duplicate-bootstrap and late-bootstrap-versus-selection races. Evidence: nine mocked-adapter state tests plus one production-API provider integration test pass without act warnings; stale bootstrap does not call `/me` after generation invalidation.
- [x] 2.5 Coordinate login, registration, organization selection, logout, and bootstrap through one monotonic in-memory generation so selected token/session adoption is atomic and stale work cannot publish.

## 3. Routes and Accessible UI

- [x] 3.1 Build login and register using existing UI primitives with required validation, loading, disabled, success, duplicate-email, invalid-credentials, inactive-user, and generic error states.
- [x] 3.2 Build organization selection from validated memberships only, showing nested organization names and roles; retain `ORGANIZATION_ACCESS_DENIED` and generic failures for retry.
- [x] 3.3 Build the dashboard placeholder with only user, active organization, roles, logout, and `/health`; handle logout `204`, pending, and failure states.
- [x] 3.4 Verify labels, associated errors, semantic controls, keyboard operation, visible focus, status announcements, and mobile/tablet/desktop layouts without horizontal scrolling. Evidence: maintainer manually verified desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`.

## 4. Verification and Closeout

- [x] 4.1 Execute manual contract cases for every endpoint: register `201` + `Set-Cookie`, login `200` + `Set-Cookie`, `/me` Bearer, selection Bearer/new token, refresh cookie/auth-only, logout `204`, cookie attributes, and response shapes. Evidence: maintainer manually verified desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`.
- [x] 4.2 Execute manual behavior cases for first visit, valid reload, expired/revoked session, zero/one/multiple memberships, redirects, retryable selection errors, validation, unknown/network/timeout errors, no token in storage/URL, `/`, and `/health`. Evidence: maintainer manually verified desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`.
- [x] 4.3 Resolve or record the local browser-cookie prerequisite: backend default port `3001` versus frontend README/env and backend `FRONTEND_URL` references to `3000`/`3001`; do not change the contract or backend in this issue.
- [x] 4.4 Run strict OpenSpec validation, existing applicable tests, `npm run lint`, and `npm run build`; fix only approved-scope failures. Evidence: 16 Vitest tests across three files, strict OpenSpec validation, lint, TypeScript, build, git diff check, and lockfile dry-run passed; no act warnings were emitted.
- [x] 4.4a Manually re-test the exact remediated multi-organization flow. Evidence: after a full frontend dev-server restart and an incognito login as the real multi-organization user, selecting `org321` once loaded its dashboard; `POST /api/auth/select-organization` returned `200`, with no follow-up `401` or `SESSION_REVOKED`.
- [x] 4.5 Confirm final implementation and evidence readiness for native verification. All implementation, 16 automated tests on clean commit `a8a2f4b`, fresh review, and manual evidence are complete; archive follows only after a passing verify report.

## Scope Guard

No backend changes, dashboard expansion, organization switching, persistence, dashboard features, other out-of-scope auth features, or apply-progress files. Production auth changes are limited to the approved race and selected-session contract remediations.

## Remediation Status

The race remediation remains intact, and the selected-session contract accepts all retained ACTIVE memberships when one matches the selected context. Automated and exact browser evidence are complete; final verification is next, and archive remains pending its passing report.

## Current Implementation Evidence

- Routes and behavior are present in `src/app/(session)/auth/login/page.tsx`, `register/page.tsx`, `select-organization/page.tsx`, and `dashboard/page.tsx`; `/` and `/health` remain available.
- `AuthProvider` owns a module-memory token/session snapshot and generation, shares bootstrap across duplicate effects, skips it when a token exists, and atomically publishes only the newest auth operation. `SessionBoundary` behavior is unchanged.
- Runtime session validation filters pre-selection decisions to `ACTIVE` memberships, requires unique membership and organization IDs, preserves nested membership organizations versus flat active membership, accepts selected context while all ACTIVE memberships remain, and rejects incoherent or zero-active sessions.
- `auth-error.ts` maps `SESSION_EXPIRED`, `SESSION_REVOKED`, `UNAUTHORIZED`, and other known codes to safe messages. `AuthProvider` applies those session messages route-aware during failed initial refresh: public login/register remains quietly anonymous, while protected routes retain the notice. The current backend still returns `SESSION_REVOKED` for refresh without `legacylift_refresh`, so the frontend mitigation does not remove the backend contract blocker.
- Visual/auth remediation is implemented. The maintainer manually verified desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`.

## Evidence Boundaries

- `1.4`: `tests/auth-api.contract.test.ts` executes six mocked-fetch contract tests for the approved endpoint paths, methods, expected statuses, credentials, Bearer headers, response validation, observed `Set-Cookie` boundaries, auth-only refresh, and `204` handling. HttpOnly cookie attributes remain outside frontend-JS visibility.
- `2.4`: `tests/auth-provider.state.test.tsx` executes nine mocked-adapter tests, including Strict Mode single-flight and the dangerous race order where selection publishes before stale refresh settles; it asserts stale `getMe` is never called. `tests/auth-provider.api-integration.test.tsx` leaves `auth-api.ts` real and mocks `fetch` plus `next/navigation` to exercise `requireResponse(..., isFullSession)` before provider adoption.
- Selected-session evidence uses two ACTIVE memberships (`org123`, `org321`), selects `org321` with empty roles, and proves the provider atomically adopts the complete session and `selected-access-token` by observing logout Bearer auth. Role equality remains order-sensitive; set-equivalence behavior was not required or added.
- `3.4`, `4.1`, and `4.2`: Maintainer manually verified desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`. The backend still returns `SESSION_REVOKED` when refresh has no `legacylift_refresh` cookie; the frontend route-aware mitigation remains documented and verified.
- `4.5`: Proposal, exploration, spec, design, and tasks are synchronized with complete implementation and evidence. Native final verification is next; no verify report or archive is claimed, and archive follows only after a passing report.
