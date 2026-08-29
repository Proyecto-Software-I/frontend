# Proposal: Workspace Organization Switcher

**Issue**: `Proyecto-Software-I/frontend#15`

## Intent

Let authenticated users with multiple active memberships change workspace context from the App Shell without duplicate tenant state.

## Scope

### In Scope

- Show a switcher only when `session.memberships` contains at least two `ACTIVE` memberships; otherwise retain static organization context.
- Provide desktop-header and existing mobile-aside access, keyboard operation, focus visibility, active identification, and safe errors.
- Delegate a different selection to the existing Auth operation, redirect to `/dashboard` after confirmed replacement, and reflect returned roles in the App Shell.
- Keep the control open after `ORGANIZATION_ACCESS_DENIED`, preserving the prior tenant, token, and roles for retry.

### Out of Scope

- Backend endpoint, schema, or contract changes; membership administration; organization persistence; tenant cache infrastructure; a second tenant provider; a new mobile navigation model.
- Role labels in each option. Options show organization name and active marker only.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `authenticated-workspace-shell`: replace the deferred switcher exclusion with active-membership switching in the App Shell.
- `frontend-auth-flow`: allow the existing selection contract from the workspace while preserving atomic session adoption and safe retry behavior.

## Approach

Compose a feature-local client switcher in `WorkspaceShell`. Derive active options and, before calling existing `chooseOrganization` for a different option, synchronously acquire a feature-local single-flight guard held through settlement; a caller that cannot acquire it does not start a request. React `pending` state and disabled options provide feedback only and cannot be the mutual-exclusion mechanism. The current organization remains a no-op. Auth remains the confirmed session owner. Use the smallest approved shadcn/Radix menu primitive.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `/dashboard` workspace layout | Modified | Retain route; redirect here after success. |
| `src/features/workspace/components/workspace-shell.tsx` | Modified | Compose responsive switcher. |
| `src/features/auth/hooks/auth-provider.tsx` | Reused | Atomic selection and token/session adoption. |
| `src/features/auth/api/auth-api.ts` | Reused | Existing `POST /api/auth/select-organization`. |
| `tests/` | Modified/New | Cover visibility, selection, retry, roles, and mobile flow. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Overlapping selections | Medium | Acquire a synchronous feature-local single-flight guard before `chooseOrganization` and release it only on settlement; mirror it with `pending`/disabled UI. |
| Inaccessible menu behavior | Medium | Use an approved semantic primitive and verify keyboard/focus. |

## Rollback Plan

Revert the feature-local switcher and its tests; Auth state and backend contract remain unchanged.

## Dependencies

- Existing Auth selection contract and `ACTIVE` membership validation.
- Maintainer plan approval before implementation. PR strategy: ask before delivery slicing; review budget: 800 changed lines.

## Success Criteria

- [ ] Only active memberships determine visibility and selectable options.
- [ ] Successful switching atomically updates App Shell organization and roles, then redirects to `/dashboard`.
- [ ] Access denial retains prior Auth state, presents a safe error, and leaves the switcher open.
- [ ] Desktop and mobile flows remain responsive and keyboard-accessible.
