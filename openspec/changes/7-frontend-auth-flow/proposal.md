# Proposal: Frontend Authentication Flow

## Intent

Implement the authenticated journey requested by [Proyecto-Software-I/frontend#7](https://github.com/Proyecto-Software-I/frontend/issues/7): registration, login, session restoration, exceptional organization selection, logout, and the minimal authenticated dashboard. The backend remains authoritative for sessions, memberships, organization selection, and tenant authorization.

## Scope

### In Scope

- Add `/auth/login`, `/auth/register`, `/auth/select-organization`, and `/dashboard`.
- Use the existing API client with in-memory access-token state, cookie credentials, and the exact backend auth contract.
- Restore a session with `POST /api/auth/refresh`, then authenticated `GET /api/auth/me`; distinguish a first visit without a refresh cookie from an expired or revoked session when the HTTP response makes that distinction observable.
- Redirect authenticated users away from login/register, route one active membership and registration to `/dashboard`, and route multiple active memberships to organization selection.
- Keep the dashboard limited to user, active organization, roles, logout, and `/health`; preserve `/` and `/health`.
- Add contract and manual verification coverage for every endpoint, response status, cookie rule, state transition, error, and accessibility/responsive state listed in the spec.

### Out of Scope

- Backend implementation or contract changes, a second HTTP client/BFF, new dependencies, persistent access-token storage, or apply-progress artifacts.
- A full dashboard/app shell, organization switching after entry, last-organization persistence, projects, legacy systems, settings, invitations, password recovery, email verification, OAuth, MFA, billing, or role administration.
- Dashboard features beyond the issue #7 placeholder, or changes to `/` and `/health` behavior.

## Backend Contract Dependency

This frontend consumes the implemented contract from [Proyecto-Software-I/backend#5](https://github.com/Proyecto-Software-I/backend/issues/5). Register is `201` and login is `200`; both require `credentials: include`, return a full session, and set the `legacylift_refresh` cookie. `/me` is `GET`, Bearer-authenticated, and returns session context without `auth`. Select-organization is Bearer-authenticated and returns a full session with a new access token. Refresh is cookie-only with `credentials: include`, returns auth metadata only, and never returns the refresh token in JSON. Logout is Bearer-authenticated with `credentials: include` and returns `204`.

The cookie is `legacylift_refresh; HttpOnly; SameSite=Lax; Secure` only in production; `Path=/api/auth`. Local browser-cookie testing is blocked until the topology is aligned: the backend defaults to port `3001`, while frontend README/scripts and `FRONTEND_URL` documentation currently reference `3000` and `3001` inconsistently. This is a testing prerequisite, not a contract change.

## Capability Status

`frontend-auth-flow` is a new capability. The delta spec therefore retains `## ADDED Requirements`; this is valid under strict OpenSpec validation and avoids weakening the requirements.

## Risks

- Browser JavaScript cannot inspect an `HttpOnly` cookie. If the backend does not provide an observable distinction between no cookie and an expired/revoked cookie, the frontend must use a safe generic unauthenticated state and document that limitation rather than claim certainty or map every bootstrap failure to `SESSION_EXPIRED`.
- CORS, origin, port, and cookie-path mismatches can make a valid session appear absent locally.
- Access tokens must never be written to browser storage, URLs, logs, or client authorization decisions.

## Success Criteria

Strict OpenSpec validation passes; implementation remains absent until `PLAN APPROVED`; all tasks remain unchecked in this planning update; and the manual/contract cases in `spec.md` and `tasks.md` cover registration, login, zero/one/multiple memberships, bootstrap, selection, refresh, logout, errors, cookie/CORS prerequisites, responsive behavior, accessibility, `/`, and `/health`.
