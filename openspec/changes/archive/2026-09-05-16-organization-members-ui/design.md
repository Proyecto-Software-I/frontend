## Context

See `proposal.md` for motivation and scope. The frontend already has a client-side `AuthProvider` that keeps the access token in module memory, validates session responses, exposes the active organization and membership, and owns login, registration, selection and logout. The authenticated route group wraps `/dashboard` with `WorkspaceBoundary` and `WorkspaceShell`; the shell navigation is currently static and marks Dashboard active unconditionally.

The backend contract is complete in Proyecto-Software-I/backend#10 and the current main specs `openspec/specs/organization-memberships/spec.md` and `openspec/specs/auth/spec.md`. It adds `activeMembership.permissions`, invitation registration, current-organization administration endpoints and public invitation endpoints. Administrative APIs derive the tenant from the authenticated session and do not accept a client organization ID.

The local project uses Next.js 16.2.12 App Router, React 19, strict TypeScript, semantic Tailwind tokens, shadcn/ui, Radix UI and Vitest. Local Next.js documentation was not present at `node_modules/next/dist/docs/` during planning; implementation must resolve and consult the installed-version documentation before using dynamic route or search-parameter APIs.

## Goals / Non-Goals

**Goals:**

- Extend the canonical Auth boundary instead of creating parallel user, membership, permission or token state.
- Keep tenant-scoped API adapters, runtime validation and UI state inside one organizations feature.
- Make sensitive mutations pessimistic and reconcile from backend-confirmed state.
- Support public invitation preview and both existing-user and new-user acceptance without persisting invitation tokens.
- Keep route files and layouts as Server Components while limiting browser state and events to focused Client Components.
- Cover permission, contract, state-transition and responsive behavior with the existing Vitest setup and manual verification.

**Non-Goals:**

- No generic server-state framework, cache library, second Auth provider or global permission provider.
- No client-side authorization claim beyond hiding or disabling UI; backend remains authoritative.
- No role editing, email delivery, organization switcher or changes to backend contracts.
- No optimistic updates for membership or invitation mutations.

## Decisions

### D1. Use the existing route groups for both tenant and public invitation flows

Add `/settings/members` under the existing `(session)/(workspace)` route group so `WorkspaceBoundary` and `WorkspaceShell` protect and frame it. Add `/invite/[token]` under `(session)` but outside `(workspace)` so it receives Auth context without requiring an active tenant or rendering workspace navigation.

Route files remain Server Components that compose feature components. The members screen and invitation experience are small Client Component boundaries because they require Auth context, effects, browser clipboard access, forms and action state.

Alternative considered: create a separate top-level provider for invitations. Rejected because it would duplicate session bootstrap and make account mismatch and acceptance flows inconsistent with Auth.

### D2. Add one organizations feature with separate API, types, state and presentation

Use the existing feature convention with a target shape similar to:

```text
src/features/organizations/
├── api/
├── components/
├── hooks/
└── types/
```

API adapters contain paths, HTTP methods, Bearer usage, expected statuses where the backend publishes them, and runtime response validation. Hooks coordinate initial reads, retries and post-mutation reconciliation. Components receive validated state and render lists, forms and dialogs.

Unknown success bodies or exact statuses for revoke/update/remove/accept are not assumed. Those adapters accept any successful HTTP response allowed by the shared client and the UI refetches authoritative lists after mutation.

Alternative considered: place calls directly in page components. Rejected because it would mix contracts with presentation and weaken contract tests.

### D3. Reuse canonical Auth types and extend only published fields

Extend `ActiveMembership` with `permissions: string[]` and update full-session/context runtime validation. Do not add permissions to `Membership` unless the backend contract publishes them there. Add `hasPermission(permission)` to the existing Auth context, derived only from `session.activeMembership.permissions`.

Add a read-only `getAccessToken()` capability to the existing Auth context so organization hooks can pass the current in-memory token to feature API adapters at request time. The token is never copied into component state, URLs or storage.

`OrganizationMember` and `OrganizationInvitation` are new endpoint-specific contracts. Their nested user projection reuses `AuthUser` through an intersection or derived type for the additional published `avatarUrl` field instead of declaring another User entity.

Alternative considered: a `PermissionProvider` and a second organization/session store. Rejected by the issue and because permissions and tenant identity already belong to Auth.

### D4. Reconcile member and invitation data after confirmed mutations

The members screen maintains explicit loading, success, empty and error state for the two read endpoints. Sensitive actions follow:

```text
user action
  -> local pending state
  -> backend mutation
  -> refetch affected collection
  -> success feedback
```

On failure, the previous confirmed collection remains visible and the action reports a safe mapped error. Controls for the pending resource are disabled to prevent repeats. Creation stores `acceptanceUrl` only in the confirmation component state and clears it when the confirmation closes.

Alternative considered: optimistic removal or status transitions. Rejected because backend can deny last-owner, cross-tenant, stale-status and permission cases.

### D5. Use permissions for presentation and backend errors for authority

`members.read` controls the shell entry and the local members-page gate. `members.manage` controls invite, revoke and membership action affordances. Role keys remain display data only.

Direct access without `members.read` renders a safe denied state and avoids presenting tenant data. Every API request still handles `MEMBER_ACCESS_DENIED`, `TENANT_REQUIRED`, session errors and malformed responses because permissions can change after session construction.

The shell derives active navigation from pathname rather than a hardcoded `active` flag. Only Dashboard and the approved Members route become links; unrelated disabled roadmap items remain unchanged.

### D6. Add only the shared UI primitives required by approved interactions

Reuse existing `Button`, `Card`, `Badge` and `Separator`. Add official shadcn/ui `Input`, `Dialog` and `AlertDialog` primitives only if they are still absent at implementation time, using the repository's shadcn command. `Dialog` supports invite creation and one-time link confirmation; `AlertDialog` supports revoke, suspend and remove confirmation. The desktop member list uses semantic table markup in the feature, while mobile uses cards/list items rather than forcing a horizontal table.

No new npm dependency or UI library is required. Shared primitives are added only because the issue explicitly requires forms and destructive confirmations across this feature.

Alternative considered: custom modal state and focus handling. Rejected because Radix/shadcn already provides the required keyboard and focus semantics.

### D7. Keep invitation tokens in the route and validated internal return target

The token remains in `/invite/[token]`. Anonymous actions navigate to the existing login or register with an encoded internal return or invitation token. A return helper accepts only the local `/invite/<non-empty-token>` shape and rejects external URLs, protocol-relative paths and unrelated destinations.

No token is written to localStorage, sessionStorage, custom cookies or long-lived application state. Closing the one-time creation confirmation also clears the newly created acceptance URL.

Alternative considered: persist the token across Auth in storage. Rejected by the issue and because the URL already provides bounded navigation continuity.

### D8. Extend Auth navigation and registration with an explicit invitation mode

Model registration input as mutually exclusive normal and invitation variants. Normal mode keeps email and organization name. Invitation mode receives the validated preview context, displays the invitation email read-only, omits organization name and sends only first name, last name, password and `invitationToken`.

`SessionBoundary` recognizes a sanitized invitation return. Successful login returns to the invitation even if the resulting Auth status is `selection-required`, because invitation acceptance needs authentication but not an already active tenant. Without a valid invitation return, current dashboard/selector behavior remains unchanged.

Alternative considered: create invitation-specific login and registration routes. Rejected because the issue requires reuse of the existing Auth flow.

### D9. Refresh Auth context before selecting an accepted organization

The public preview returns organization name and slug, not ID, and the acceptance contract does not promise a membership response. Existing-user acceptance therefore uses this sequence:

```text
POST /api/invitations/:token/accept
  -> GET /api/auth/me
  -> find ACTIVE membership by preview organization.slug
  -> POST /api/auth/select-organization with membership.organization.id
  -> /dashboard
```

Add an Auth operation that reloads `/me` with the current access token and atomically replaces only the session context when the operation is current. Selection continues through the existing `chooseOrganization` operation and adopts its new access token.

If the refreshed context does not contain a matching active organization, stop and show a safe synchronization error rather than guessing an ID.

Alternative considered: derive an ID from slug or assume the accept response contains it. Rejected because neither is in the published contract.

### D10. Validate all external response shapes and map functional errors centrally

Organization endpoint types include explicit runtime guards for response envelopes, member projections, invitation metadata, preview data and creation results. Date fields remain transport strings at the API boundary and are formatted for display only after validation as strings representing valid dates.

Feature error mapping handles the published functional codes:

```text
TENANT_REQUIRED
MEMBER_ALREADY_EXISTS
INVITATION_ALREADY_PENDING
INVITATION_NOT_FOUND
INVITATION_EXPIRED
INVITATION_REVOKED
INVITATION_ALREADY_ACCEPTED
INVITATION_EMAIL_MISMATCH
MEMBERSHIP_NOT_FOUND
LAST_OWNER_REQUIRED
MEMBER_ACCESS_DENIED
```

Raw response bodies, tokens, stack traces and backend implementation details never reach visible messages. Auth invitation errors extend the existing Auth error mapper rather than creating a second envelope format.

### D11. Test at contract, state and component boundaries

Extend existing Auth contract and provider tests for permissions, invitation registration payload exclusivity, reload-after-accept coordination and safe return behavior. Add organization adapter tests for every endpoint's method, path, credentials and runtime validation. Add behavior tests for read-only versus manage permissions, one-time link state, confirmations, pessimistic mutations, invitation validity states, account mismatch and existing/new-user paths.

Manual checks cover desktop/mobile rendering, keyboard focus, dialogs, clipboard success/failure where available, network/error states, tenant changes, console errors and hydration.

## Risks / Trade-offs

- [Risk] Auth session permissions become stale after backend role changes -> Mitigation: backend remains authoritative and every operation maps `MEMBER_ACCESS_DENIED`; no permission is placed in JWT or persistent storage.
- [Risk] Exposing an access-token accessor broadens in-memory access -> Mitigation: expose a function, not token state; call it only inside feature action/data hooks and never log, serialize or persist its value.
- [Risk] Login boundary redirects can race the invitation return -> Mitigation: centralize sanitized return resolution in the existing boundary and test authenticated plus selection-required outcomes.
- [Risk] Accepted membership is not immediately present in `/me` -> Mitigation: stop before selection, retain safe feedback and offer retry; never derive organization IDs from untrusted values.
- [Risk] Parallel list requests can produce partial state -> Mitigation: track each collection explicitly and keep successful confirmed data while exposing a scoped retry for the failed section.
- [Risk] Clipboard access can fail outside secure contexts -> Mitigation: show failure feedback and keep the link visible only while the creation confirmation is open.
- [Risk] A self-suspend or self-remove invalidates the active tenant -> Mitigation: after confirmed mutation/refetch, allow Auth/backend session handling to redirect or require selection; never keep showing private data after an authorization failure.
- [Risk] Local Next.js documentation is absent from the installed package -> Mitigation: resolve the repository's required documentation source before implementation and verify dynamic `params`/`searchParams` APIs against Next.js 16.2.12.

## Migration Plan

No data migration, environment variable or backend deployment change is required in this repository. Deploy only after backend #10 is available, contract tests pass, and the planning PR has `PLAN APPROVED`.

Rollback is frontend-only: remove the Members route/navigation and invitation UI while preserving the existing Auth and workspace behavior. The backend data and contracts remain compatible because this frontend creates no local persistent schema.
