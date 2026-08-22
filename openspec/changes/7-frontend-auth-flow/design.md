# Design: Frontend Authentication Flow

## Decisions

| Area | Decision | Reason |
|---|---|---|
| State | One feature-owned provider/hook owns the in-memory access token, session, bootstrap status, and actions | Prevents duplicated tenant truth and persistent token exposure |
| Protection | Client gates in an App Router session layout; Server Components remain the default | Interactivity and navigation require client state; no middleware or BFF is justified |
| Bootstrap | One `POST /refresh`, then `GET /me`; no recursive refresh/retry loop | Bounded restoration prevents loops and flicker |
| HTTP | Extend the existing API client with opt-in credentials, Bearer headers, typed error data, and empty `204` handling | Avoids a second client and preserves health behavior |
| Validation | Runtime guards for session, membership, and error envelopes | Backend data is external and no new schema dependency is approved |
| Capability header | Keep proposal `New Capabilities: frontend-auth-flow` and spec `## ADDED Requirements` | Strict validator accepts this new capability form |

## Data Flow

```text
session layout -> provider -> POST /api/auth/refresh (credentials: include)
                         -> GET /api/auth/me (Authorization: Bearer)
login/register -> full session + Set-Cookie -> dashboard or selector
selector -> POST /api/auth/select-organization (Bearer) -> full session -> dashboard
refresh -> auth metadata only; never refresh token JSON
logout -> POST /api/auth/logout (Bearer, credentials) -> 204 -> clear memory -> login
```

The session model follows the backend exactly: `memberships[]` has nested `organization` and roles; `activeMembership` has membership fields and roles without nested organization. Registration always creates/selects one organization. One active membership auto-selects. Multiple active memberships set both active fields to `null` and require selection. Zero active memberships is `NO_ACTIVE_MEMBERSHIP`.

## Components and Boundaries

- API adapters under `src/features/auth/api` own HTTP calls, credentials, Bearer headers, response guards, and safe error mapping.
- The provider owns the token privately and atomically replaces the validated full session after register, login, or selection.
- Route pages compose small Client Components only for state, effects, events, and navigation; visual components remain presentational.
- Existing `Button`, `Card`, `Badge`, and `Separator` primitives and semantic tokens are reused. No dependency or global style change is planned.
- `/`, `/health`, and unrelated backend files remain unchanged.

## Contract and Error Boundary

Use `/api/auth/register` (`201`, `credentials: include`), `/login` (`200`, `credentials: include`), `/me` (`200`, Bearer), `/select-organization` (`200`, Bearer, new access token), `/refresh` (`200`, cookie-only with `credentials: include`, auth metadata), and `/logout` (`204`, Bearer plus `credentials: include`). Use the `legacylift_refresh` cookie with `HttpOnly`, `SameSite=Lax`, production-only `Secure`, and `Path=/api/auth`.

Map `EMAIL_ALREADY_REGISTERED`, `INVALID_CREDENTIALS`, `USER_NOT_ACTIVE`, `NO_ACTIVE_MEMBERSHIP`, `ORGANIZATION_ACCESS_DENIED`, `SESSION_EXPIRED`, and `SESSION_REVOKED` to safe contextual feedback. Treat `UNAUTHORIZED`, malformed, network, timeout, and other unrecognized failures generically. Do not convert every bootstrap failure to `SESSION_EXPIRED`; browser code cannot inspect an `HttpOnly` cookie, so first-visit versus expired/revoked status depends on an observable HTTP signal. The current backend may return `SESSION_REVOKED` for an expired refresh.

Local browser-cookie verification is blocked until the documented port/origin mismatch is aligned: backend default `3001`, frontend README/scripts and `FRONTEND_URL` references to `3000`/`3001`. This is a prerequisite for testing, not a proposed contract change.

## Verification Strategy

- Contract tests mock every endpoint and assert method, path, body, status, credentials, Bearer requirements, response shape, nested membership organization, new selection token, auth-only refresh response, no refresh token JSON, cookie attributes, and `204` empty logout.
- State tests cover registration, one/multiple/zero memberships, bootstrap first visit, valid reload, expired/revoked failure, bounded no-loop behavior, selector retry, redirects, and logout.
- Manual tests cover invalid credentials, duplicate email, inactive user, no active membership, foreign organization, validation, unknown/network/timeout failures, no token in storage or URL, keyboard focus/errors, mobile/tablet/desktop layout, `/`, and `/health`.
- Run strict OpenSpec validation, existing tests if present, `npm run lint`, and `npm run build` after implementation and only mark tasks then.

## Rollout and Rollback

No migration, dependency, package, backend, or persisted frontend data change. Do not implement before `PLAN APPROVED`. Roll back only the approved auth implementation while preserving `/` and `/health`.
