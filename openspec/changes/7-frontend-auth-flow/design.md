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

Map `EMAIL_ALREADY_REGISTERED`, `INVALID_CREDENTIALS`, `USER_NOT_ACTIVE`, `NO_ACTIVE_MEMBERSHIP`, `ORGANIZATION_ACCESS_DENIED`, `SESSION_EXPIRED`, `SESSION_REVOKED`, and `UNAUTHORIZED` to safe contextual feedback. Treat malformed, network, timeout, and other unrecognized failures generically. Do not convert every bootstrap failure to `SESSION_EXPIRED`; browser code cannot inspect an `HttpOnly` cookie, so first-visit versus expired/revoked status depends on an observable HTTP signal. When the initial refresh fails on `/auth/login` or `/auth/register`, leave the user anonymous without a session notice; preserve specific session notices when the same failure begins on `/dashboard` or `/auth/select-organization`. The current backend returns `SESSION_REVOKED` without a refresh cookie instead of `UNAUTHORIZED`; this route-aware mitigation does not resolve the backend contract blocker.

The documented port/origin mismatch remains recorded: backend default `3001`, frontend README/scripts and `FRONTEND_URL` references to `3000`/`3001`. Maintainer cookie/CORS verification passed against the configured environment; this remains a testing note, not a proposed contract change.

## Verification Strategy

- Vitest contract tests mock every endpoint and assert method, path, body, expected status, credentials, Bearer requirements, response guards, nested membership organization, auth-only refresh response, observed `Set-Cookie` headers, and `204` empty logout. Frontend JavaScript does not claim visibility into HttpOnly cookie attributes.
- Vitest state tests mount the real provider with mocked adapters and cover registration, one/multiple/zero membership outcomes, bootstrap success/first visit/expired failure, selection replacement, and logout success/error. The zero-ACTIVE case uses a structurally valid session-shaped fixture and asserts the provider's runtime guard rejects it. Each test resets mocks and unmounts roots in async-safe `beforeEach`/`afterEach` cleanup. The suite uses the approved `vitest.config.ts` jsdom setup and `npm test -- --run`.
- Maintainer manual verification is complete for desktop/mobile UI, keyboard/focus, responsive layout, auth endpoint contract cases, cookie/CORS behavior, first visit/reload, expired/revoked session, zero/one/multiple memberships, redirects, retry/error states, no token in storage/URL, `/`, and `/health`.
- Automated evidence: 13 Vitest tests pass, strict OpenSpec validation, lint, TypeScript, build, git diff check, and lockfile dry-run pass. The automated suite covers mocked frontend HTTP and provider boundaries; manual verification supplies the browser and cookie/CORS evidence.

## Rollout and Rollback

No migration, dependency, package, backend, or persisted frontend data change. Do not implement before `PLAN APPROVED`. Roll back only the approved auth implementation while preserving `/` and `/health`.
