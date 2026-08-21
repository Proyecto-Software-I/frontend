# Proposal: Multi-Tenant Frontend Authentication Flow

## Intent

Implement the initial authenticated journey requested by [Proyecto-Software-I/frontend#7](https://github.com/Proyecto-Software-I/frontend/issues/7): registration, login, session restoration, exceptional organization selection, logout, and a minimal authenticated dashboard. The backend remains the authority for tenant membership and active-organization authorization.

## Scope

### In Scope
- Add `/auth/login`, `/auth/register`, `/auth/select-organization`, and `/dashboard`.
- Centralize in-memory auth state and bootstrap via `POST /api/auth/refresh`, then `GET /api/auth/me`; send Bearer tokens and include refresh-cookie credentials.
- Redirect authenticated visitors away from login/register to `/dashboard`; route failed refreshes to login with session-expired feedback.
- Redirect registration and single-organization login to `/dashboard`; show the selector only when `requiresOrganizationSelection` is true, with organization names and roles from `memberships[]`.
- Keep selection errors on the selector, and keep the dashboard placeholder limited to user, active organization, roles, logout, and `/health`.

### Out of Scope
- Real dashboard/app shell, organization switching, persistent last-organization state, or access-token storage outside memory.
- Backend changes, a second HTTP client/BFF, new dependencies, or new test infrastructure.
- Projects, legacy systems, settings, invitations, password recovery, email verification, OAuth, MFA, billing, or role administration.

## Capabilities

### New Capabilities
- `frontend-auth-flow`: authenticated routes, session lifecycle, tenant selection, and dashboard placeholder.

### Modified Capabilities
- None. Existing `public-landing-page` requirements remain unchanged; `/` and `/health` must continue working.

## Approach

Use a feature-owned provider/hook with API adapters under `src/features/auth`, extending `src/lib/api/api-client.ts` and reusing `ApiError`. Keep access tokens in memory and preserve Server Components by default. Implement loading, success, validation, error, and empty/selection states with semantic controls, keyboard access, visible focus, readable errors, and usable mobile/tablet/desktop layouts.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/auth/*`, `src/app/dashboard` | New | Auth forms, selector, and protected placeholder routes. |
| `src/features/auth/*` | New | Contract types, API adapters, state, and presentations. |
| `src/lib/api/*` | Modified | Credentials, Bearer authorization, and error-code mapping. |
| `/`, `/health` | Preserved | Existing landing and health behavior remain available. |

## Dependencies and Ambiguity

Consume the exact contract from [Proyecto-Software-I/backend#5](https://github.com/Proyecto-Software-I/backend/issues/5): `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`, `/api/auth/select-organization`, and `/api/auth/logout`. The local backend emits `UNAUTHORIZED`/`SESSION_REVOKED` rather than the issue's `SESSION_EXPIRED`; map observed codes safely and coordinate any required contract change before implementation. Do not infer authorization from client organization IDs.

## Risks and Rollback

| Risk | Mitigation |
|------|------------|
| Cookie/CORS or bootstrap timing causes loops or protected-content flicker | One bounded bootstrap path, explicit loading boundary, and manual reload scenarios. |
| Contract/error-code mismatch | Validate against backend implementation/tests; stop for contract changes. |

Rollback is a single-file OpenSpec revert before implementation; implementation rollback removes only the approved auth feature changes while preserving `/` and `/health`.

## Validation and Success Criteria

Run strict OpenSpec validation and `npm run check`; manually verify registration, single/multi-tenant login, invalid credentials, selection failure, valid refresh/reload, logout, redirects, responsive keyboard use, and `/health`. Success means all four routes satisfy the stated transitions, tokens never reach browser storage, errors remain user-safe, and existing landing/health behavior is preserved.
