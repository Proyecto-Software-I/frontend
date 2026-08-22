# Tasks: Frontend Authentication Flow

All tasks remain unchecked until implementation and verification after `PLAN APPROVED`.

## 1. Contract and API Boundary

- [x] 1.1 Define strict DTO, user, organization, membership, full-session, auth-only refresh, and error-envelope types. Model nested `memberships[].organization` and flat `activeMembership` exactly.
- [x] 1.2 Extend the existing API client with opt-in `credentials: include`, Bearer authorization, timeout/network handling, validated error codes, and empty `204` support without changing health behavior.
- [x] 1.3 Add adapters for register, login, refresh, `/me`, select-organization, and logout. Assert exact paths, methods, bodies, statuses, response semantics, cookie use, and memory-only access tokens.
- [ ] 1.4 Add contract tests for `credentials: include` on register/login/refresh/logout, full-session register/login, `Set-Cookie`, auth-only refresh with no refresh token JSON, `/me` without auth in the body, selection with a new access token, and `204` logout.

## 2. Session State and Protection

- [x] 2.1 Create one provider/hook with private in-memory token and `bootstrapping`, `anonymous`, `authenticated`, and `selection-required` states.
- [x] 2.2 Implement one bounded bootstrap: refresh with cookie credentials, then `/me` with Bearer; distinguish first visit from expired/revoked only through observable HTTP signals and never map all failures to `SESSION_EXPIRED`.
- [x] 2.3 Add route gates for dashboard and selector, authenticated-user redirects from login/register, pending-selection redirects, loading boundaries, and no-loop behavior.
- [ ] 2.4 Add state tests for registration, one/multiple/zero active memberships, bootstrap success/first visit/expired/revoked failure, selection replacement, and logout success/error.

## 3. Routes and Accessible UI

- [x] 3.1 Build login and register using existing UI primitives with required validation, loading, disabled, success, duplicate-email, invalid-credentials, inactive-user, and generic error states.
- [x] 3.2 Build organization selection from validated memberships only, showing nested organization names and roles; retain `ORGANIZATION_ACCESS_DENIED` and generic failures for retry.
- [x] 3.3 Build the dashboard placeholder with only user, active organization, roles, logout, and `/health`; handle logout `204`, pending, and failure states.
- [ ] 3.4 Verify labels, associated errors, semantic controls, keyboard operation, visible focus, status announcements, and mobile/tablet/desktop layouts without horizontal scrolling.

## 4. Verification and Closeout

- [ ] 4.1 Execute manual contract cases for every endpoint: register `201` + `Set-Cookie`, login `200` + `Set-Cookie`, `/me` Bearer, selection Bearer/new token, refresh cookie/auth-only, logout `204`, cookie attributes, and response shapes.
- [ ] 4.2 Execute manual behavior cases for first visit, valid reload, expired/revoked session, zero/one/multiple memberships, redirects, retryable selection errors, validation, unknown/network/timeout errors, no token in storage/URL, `/`, and `/health`.
- [x] 4.3 Resolve or record the local browser-cookie prerequisite: backend default port `3001` versus frontend README/env and backend `FRONTEND_URL` references to `3000`/`3001`; do not change the contract or backend in this issue.
- [x] 4.4 Run strict OpenSpec validation, existing applicable tests, `npm run lint`, and `npm run build`; fix only approved-scope failures. Evidence: strict validation, lint, build, and `npx tsc --noEmit` passed in the current remediation run; no frontend test runner is configured.
- [ ] 4.5 After implementation, synchronize artifacts, confirm every task is verified before checking it, and archive only when the plan is complete.

## Scope Guard

No backend changes, source changes before approval, package/dependency changes, dashboard expansion, organization switching, persistence, dashboard features, other out-of-scope auth features, or apply-progress artifacts.

## Remediation Status

The approved `active-membership-guard-remediation` work unit addresses only the confirmed membership guard finding: cardinality and selection decisions use ACTIVE memberships, active tenant context is coherent, inactive activeMembership values are rejected, and membership/organization identifiers are unique. Contract tests, state tests, browser/manual verification, accessibility verification, and archive remain unchecked until their evidence exists.
