## 1. CI Workflow

- [x] 1.1 Create `.github/workflows/ci.yml` for Pull Requests targeting `main`.
- [x] 1.2 Configure the workflow to check out the repository.
- [x] 1.3 Configure Node.js 24 with npm cache when appropriate.
- [x] 1.4 Configure an explicit `npm ci` step.
- [x] 1.5 Configure an explicit `npm run spec:validate` step.
- [x] 1.6 Configure an explicit `npm run lint` step.
- [x] 1.7 Configure an explicit `npm run build` step.
- [x] 1.8 Confirm there is still no applicable automated test script at implementation time; do not add `npm test` unless an applicable suite appears within the approved scope.
- [x] 1.9 Keep the workflow limited to validation and do not add deployment tokens, deployment commands, branch protection changes, ruleset changes, or personal-token workarounds.

## 2. Vercel External Configuration

- [ ] 2.1 Confirm permission to access the GitHub repository `Proyecto-Software-I/frontend`.
- [ ] 2.2 Confirm permission to authorize or connect Vercel to the GitHub repository.
- [ ] 2.3 Confirm access to the appropriate Vercel account, team, or project.
- [ ] 2.4 Confirm permission to configure the Vercel Production Branch.
- [ ] 2.5 Confirm permission to configure Vercel Environment Variables.
- [ ] 2.6 Request missing permissions in issue #11 if any required access is unavailable.
- [ ] 2.7 Import or connect the GitHub repository in Vercel without enabling paid plans, billing, analytics add-ons, observability add-ons, custom domains, Firebase, Google Cloud resources, or unrelated services.
- [ ] 2.8 Configure `main` as the Vercel Production Branch and confirm non-`main` branches create Preview Deployments instead of replacing production.
- [ ] 2.9 Confirm Vercel uses Node.js 24 through project settings.
- [ ] 2.10 Configure `NEXT_PUBLIC_API_URL` in Vercel for Production and Preview using non-secret values provided or confirmed by the responsible maintainer.
- [ ] 2.11 Stop and request a decision in the issue if Vercel requires billing, paid team features, unavailable permissions, `package.json` changes, `vercel.json`, or another repository configuration change not covered by the approved plan.

## 3. Documentation

- [x] 3.1 Update `README.md` with a concise CI/CD section describing `PR -> main -> GitHub Actions -> npm ci -> OpenSpec validation -> lint -> build`.
- [x] 3.2 Document `PR/branch -> Vercel Preview` and `main -> Vercel Production`.
- [x] 3.3 Document the Vercel decision and summarize why Firebase App Hosting is technically valid but not selected under the issue constraints.
- [x] 3.4 Document required external permissions for connecting Vercel to the GitHub repository and configuring Production Branch and Environment Variables.
- [x] 3.5 Document that `NEXT_PUBLIC_API_URL` is public browser-exposed configuration, should be configured in Vercel for Preview and Production, and must not contain secrets.
- [x] 3.6 Document that `.env.example` only changes if a new variable is introduced; do not change it just for Vercel setup.
- [x] 3.7 Document backend CORS as a coordination risk if deployed Vercel URLs cannot reach the backend.
- [x] 3.8 Document that GitHub rulesets, branch protections, backend CI/CD, custom domains, and paid services are outside this issue's scope.

## 4. Verification

- [x] 4.1 Run `openspec validate 11-setup-frontend-ci-cd --strict --no-interactive` after planning changes and after implementation changes that affect OpenSpec.
- [x] 4.2 Run `git diff --check`.
- [x] 4.3 Run `npm run spec:validate`.
- [x] 4.4 Run `npm run lint`.
- [x] 4.5 Run `npm run build`.
- [x] 4.6 Run `npm run check`.
- [ ] 4.7 Verify from the Pull Request for this issue that the GitHub Actions workflow runs automatically for a PR targeting `main`.
- [ ] 4.8 Verify the workflow shows separate successful steps for `npm ci`, OpenSpec validation, lint, and build.
  - First real GitHub Actions run failed at `npm run spec:validate` with `openspec: not found` because the clean runner did not have the OpenSpec CLI installed globally. The workflow now installs `@fission-ai/openspec@1.9.0` before OpenSpec validation; CI success still requires a new real PR run.
- [ ] 4.9 Perform a controlled failure check showing CI fails when a required validation fails, then revert or correct the intentional failure before finalizing so no broken code remains in the final history.
- [ ] 4.10 Verify the workflow is scoped as intended for Pull Requests targeting `main`.
- [ ] 4.11 Verify the GitHub repository is connected to Vercel when the required external permissions are available.
- [ ] 4.12 Verify Vercel has `main` configured as the Production Branch.
- [ ] 4.13 Verify the Pull Request or issue branch creates a Vercel Preview Deployment and the preview can be opened.
- [ ] 4.14 Verify a development branch does not replace Production.
- [ ] 4.15 Verify a merge to `main` creates a Vercel Production Deployment only when that step is allowed by the project flow and maintainer authorization.
- [x] 4.16 Confirm no secrets, tokens, API keys, `.env` files, Vercel local state, Firebase configuration, or credentials are committed.
- [x] 4.17 Confirm no frontend routes, components, responsive behavior, accessibility behavior, loading states, error states, backend files, or backend HTTP contracts changed.
