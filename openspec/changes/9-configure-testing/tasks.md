## 1. Test harness and scripts

- [ ] 1.1 Add only the missing development dependencies for React Testing Library, jest-dom, and user-event with npm, and verify `package.json` and `package-lock.json` contain no unrelated dependency changes.
- [ ] 1.2 Extend the existing Vitest setup and configuration for shared DOM matchers, jsdom, TypeScript/JSX, and the `@/*` alias, and verify the existing test files still resolve and pass.
- [ ] 1.3 Configure `npm test` for one non-interactive run, add `npm run test:watch`, and include the test command once in `npm run check`; verify each script's intended mode and exit behavior.

## 2. Landing behavior coverage

- [ ] 2.1 Add a behavior-focused Landing test that verifies the visible proposition and accessible CTAs to `/auth/login` and `/auth/register`, without snapshots or Tailwind class assertions.
- [ ] 2.2 Add Landing coverage for the ordered Discover-to-Verify flow and the six defined main capabilities, and verify the test queries semantic or visible content.
- [ ] 2.3 If direct rendering of the Server Component is incompatible with the test environment, extract only the minimum static presentation unit and verify routes, content, and layout composition remain unchanged.

## 3. Auth form and selection coverage

- [ ] 3.1 Add reusable Auth test helpers that mock `src/features/auth/api/auth-api.ts`, `next/navigation`, and existing session fixtures, and verify no component test sends a real backend request.
- [ ] 3.2 Add Login interaction tests for one active organization, multiple organizations, invalid credentials, pending controls, and retryable error feedback; verify destinations `/dashboard` or `/auth/select-organization` and no selector for the one-organization case.
- [ ] 3.3 Add a Register interaction test that fills email, password, firstName, lastName, and organizationName; verify the exact API-boundary input and successful navigation to `/dashboard` without selection.
- [ ] 3.4 Add an OrganizationSelector interaction test that renders active memberships, submits the selected `organizationId`, prevents duplicate submit while pending, and navigates to `/dashboard` after success.

## 4. Auth restoration and logout coverage

- [ ] 4.1 Add restoration tests through the Auth provider and route boundary for successful refresh plus `/api/auth/me` and failed refresh; verify restored protected state or anonymous fallback without real requests.
- [ ] 4.2 Add a workspace logout test that verifies successful logout clears the session, disables repeated interaction while pending, and navigates to `/auth/login`.

## 5. Documentation and full validation

- [ ] 5.1 Update README with only `npm test` and `npm run test:watch`, and remove the outdated claim that no automated suite exists.
- [ ] 5.2 Run `npm test`, `npm run lint`, `npm run build`, `npm run check`, and `openspec validate 9-configure-testing --strict --no-interactive`; verify all pass and the check command includes tests exactly once.
- [ ] 5.3 Manually verify Landing and Auth test coverage remains responsive and keyboard-oriented where the existing components expose those behaviors, without adding E2E tooling.
- [ ] 5.4 Archive the completed OpenSpec change only after all tasks and validations pass, then verify `openspec/specs/frontend-testing/spec.md` is current and `openspec validate --all --strict --no-interactive` passes.
