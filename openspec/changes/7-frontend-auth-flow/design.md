# Design: Multi-Tenant Frontend Authentication Flow

## Technical Approach

Implement the four requested routes with a feature-owned auth provider under a route-group layout. API adapters remain in `src/features/auth/api`; pages compose small Client Components for state, effects, events, and navigation, while visual components stay presentational. The existing `apiRequest` and `ApiError` boundaries are extended rather than replaced. `/` and `/health` remain outside the auth route group and unchanged.

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|---|---|---|---|
| Auth state | `AuthProvider` owns one in-memory `accessToken`, session context, bootstrap status, and actions | Per-page state; local/session storage | Prevents duplicated tenant/session truth and keeps tokens out of browser storage. |
| Protection | Client `AuthGate`/`PublicOnlyGate` in a `(session)` layout; Server Components compose pages | Middleware; BFF/server session | Matches the current App Router and avoids inventing a second HTTP boundary. Loading gates prevent protected-content flicker. |
| Bootstrap | One `POST /refresh` with `credentials: "include"`, then authenticated `GET /me`; no recursive automatic retry | Unbounded 401 refresh interceptor | A single bounded attempt cannot loop; a later 401 clears memory and routes to login. |
| External data | Explicit type guards validate auth responses and error envelopes before state updates | Unsafe casts; new schema dependency | Follows strict TypeScript and the existing health response-validation pattern without dependencies. |

## Data Flow

```text
session layout -> AuthProvider -> POST /refresh (cookie)
                                  -> GET /me (Bearer token)
login/register -> adapter -> provider session -> dashboard or selector
selector -> POST /select-organization (Bearer) -> provider session -> dashboard
logout -> POST /logout (Bearer, credentials) -> clear memory -> /auth/login
```

`AuthProvider` exposes `status: bootstrapping | anonymous | authenticated | selection-required`, session data, and `login`, `register`, `selectOrganization`, and `logout` actions. It keeps `accessToken` internal to the provider and never serializes it. Registration/login/select responses replace the whole validated session atomically. `memberships[]` supplies selector options; authorization remains backend-owned.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/lib/api/api-client.ts`, `src/lib/api/api-error.ts` | Modify | Add opt-in credentials and Authorization header support; preserve empty `204`; expose validated error code data. |
| `src/features/auth/types/*`, `api/*` | Create | Backend DTO/response types, guards, endpoint adapters, and safe error-code mapping. |
| `src/features/auth/provider.tsx`, `components/*`, `hooks/*` | Create | In-memory state machine, bounded bootstrap, gates, forms, selector, dashboard composition, and accessible feedback. |
| `src/app/(session)/layout.tsx`, `src/app/auth/*`, `src/app/dashboard/page.tsx` | Create | Route-group provider boundary and the four route compositions. |
| `src/app/page.tsx`, `src/app/health/page.tsx` | Preserve | Existing landing links become valid; health behavior and API call remain intact. |

Use existing `Button`, `Card`, `Badge`, and `Separator` primitives. Feature classes use semantic tokens (`background`, `foreground`, `card`, `muted`, `destructive`, `ring`) and responsive constrained layouts; no new dependency or global token change is required.

## Interfaces / Contracts

```ts
type AuthSession = {
  user: UserView;
  activeOrganization: OrganizationView | null;
  activeMembership: MembershipView | null;
  memberships: MembershipView[];
  requiresOrganizationSelection: boolean;
};
type AuthState = { status: AuthStatus; session: AuthSession | null };
```

Adapters use the unchanged backend paths: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`, `/api/auth/select-organization`, `/api/auth/logout`. Register/login DTOs match backend validation; selection sends only a listed membership’s `organization.id`. Map `EMAIL_ALREADY_REGISTERED`, `INVALID_CREDENTIALS`, `USER_NOT_ACTIVE`, `NO_ACTIVE_MEMBERSHIP`, `ORGANIZATION_ACCESS_DENIED`, `UNAUTHORIZED`, `SESSION_REVOKED`, and `SESSION_EXPIRED` to safe copy; unknown/network/validation failures stay generic and never expose raw bodies.

## Testing Strategy

| Layer | What to test | Approach |
|---|---|---|
| Unit | Guards, error mapping, state transitions, bounded bootstrap, `204` logout | Focused tests with mocked `fetch`; no new test framework. |
| Integration | Adapter headers/credentials and validated response shapes | Mock backend responses, including malformed and multi-membership payloads. |
| Manual | Register, single/multi-tenant login, reload, failed refresh, selection retry, logout, redirects, keyboard/responsive states, `/` and `/health` | Run `npm run check`; verify mobile/tablet/desktop and no token in storage/URL. |

## Migration / Rollout

No migration, feature flag, dependency, package, lockfile, backend, or persisted frontend data change. Release only after the planning review approval required by `AGENTS.md`.

## Open Questions

- [ ] Backend#5 contract must confirm whether `SESSION_EXPIRED` is emitted anywhere; local code currently emits `UNAUTHORIZED` or `SESSION_REVOKED` for the relevant 401 paths. This design maps all safely without changing the backend.
- [ ] Confirm development browser behavior for the `legacylift_refresh` HttpOnly cookie (`SameSite=Lax`, path `/api/auth`) across the configured frontend/backend origins.
- [ ] Verify the proposal/spec match the acceptance criteria in frontend issue #7 (routes, redirects, token handling, and error-code mapping).
- [ ] If backend changes response fields, status codes, or error semantics, pause implementation and update this OpenSpec change first.
