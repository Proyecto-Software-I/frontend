# Proposal: Frontend Authentication Flow

## Intent

Implement and document the authenticated journey requested by [Proyecto-Software-I/frontend#7](https://github.com/Proyecto-Software-I/frontend/issues/7): registration, login, session restoration, exceptional organization selection, logout, and the minimal authenticated dashboard. The implementation and requested manual verification now exist; final artifact synchronization and archive remain incomplete. The backend remains authoritative for sessions, memberships, organization selection, and tenant authorization.

## Scope

### In Scope

- Provide `/auth/login`, `/auth/register`, `/auth/select-organization`, and `/dashboard` through the session route group; preserve `/` and `/health`.
- Use the existing API client with in-memory access-token state, cookie credentials, and the exact backend auth contract.
- Restore a session with one bounded `POST /api/auth/refresh`, then authenticated `GET /api/auth/me`; keep the access token in memory and map observable `SESSION_EXPIRED`, `SESSION_REVOKED`, and `UNAUTHORIZED` responses safely.
- Redirect authenticated users away from login/register, route one active membership and registration to `/dashboard`, and route multiple active memberships to organization selection.
- Keep the dashboard limited to user, active organization, roles, logout, and `/health`; preserve `/` and `/health`.
- Record the maintainer's completed manual verification for the browser, accessibility, responsive, endpoint, session, routing, storage, and public-route cases listed in the spec; approved Vitest contract/state tests provide automated evidence for endpoint and provider scenarios.

### Out of Scope

- Backend implementation or contract changes, a second HTTP client/BFF, new dependencies, persistent access-token storage, or apply-progress artifacts.
- A full dashboard/app shell, organization switching after entry, last-organization persistence, projects, legacy systems, settings, invitations, password recovery, email verification, OAuth, MFA, billing, or role administration.
- Dashboard features beyond the issue #7 placeholder, or changes to `/` and `/health` behavior.

## Backend Contract Dependency

This frontend consumes the implemented contract from [Proyecto-Software-I/backend#5](https://github.com/Proyecto-Software-I/backend/issues/5). Register is `201` and login is `200`; both require `credentials: include`, return a full session, and set the `legacylift_refresh` cookie. `/me` is `GET`, Bearer-authenticated, and returns session context without `auth`. Select-organization is Bearer-authenticated and returns a full session with a new access token. Refresh is cookie-only with `credentials: include`, returns auth metadata only, and never returns the refresh token in JSON. Logout is Bearer-authenticated with `credentials: include` and returns `204`.

**Known backend contract issue:** in the current backend, `POST /api/auth/refresh` without a `legacylift_refresh` cookie returns `SESSION_REVOKED` rather than `UNAUTHORIZED`. The frontend now treats that failed initial refresh as anonymous without a session notice on `/auth/login` and `/auth/register`, while preserving `SESSION_EXPIRED`/`SESSION_REVOKED` notices when bootstrap starts on protected routes. This is a frontend route-aware mitigation, not a backend contract discrepancy fix or a frontend contract change.

The cookie is `legacylift_refresh; HttpOnly; SameSite=Lax; Secure` only in production; `Path=/api/auth`. The local topology discrepancy remains recorded: the backend defaults to port `3001`, while frontend README/scripts and `FRONTEND_URL` documentation reference `3000` and `3001` inconsistently. Maintainer cookie/CORS verification passed against the configured environment; this remains a testing note, not a contract change.

## Capability Status

`frontend-auth-flow` is a new capability. The delta spec therefore retains `## ADDED Requirements`; this is valid under strict OpenSpec validation and avoids weakening the requirements.

## Risks

- Browser JavaScript cannot inspect an `HttpOnly` cookie. If the backend does not provide an observable distinction between no cookie and an expired/revoked cookie, the frontend must use a safe generic unauthenticated state and document that limitation rather than claim certainty or map every bootstrap failure to `SESSION_EXPIRED`.
- CORS, origin, port, and cookie-path mismatches can make a valid session appear absent locally.
- Access tokens must never be written to browser storage, URLs, logs, or client authorization decisions.

## Success Criteria

Strict OpenSpec validation, lint, build, TypeScript validation, git diff checking, lockfile dry-run, and the focused Vitest suite have passed: 13 Vitest tests pass. The implementation covers registration, login, zero/one/multiple membership decisions, bounded bootstrap, selection, refresh, logout, protected navigation, known error mapping, and the approved visual/accessibility remediation. The maintainer manually verified desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`. The local no-cookie refresh behavior remains a backend discrepancy, mitigated route-aware by the frontend.
