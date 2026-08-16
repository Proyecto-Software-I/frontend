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

## 2. Vercel CLI Deployment Design

- [ ] 2.1 Update GitHub Actions design so CD runs through Vercel CLI instead of native Vercel Git integration.
- [ ] 2.2 Preserve the existing CI steps and ensure deployment steps depend on successful CI.
- [ ] 2.3 Plan a Pull Request Preview deployment path for PRs targeting `main` that uses Preview environment configuration and never passes `--prod`.
- [ ] 2.4 Plan a Production deployment path that runs only for `push` to `main` or an approved equivalent integrated-main event and uses production mode.
- [ ] 2.5 Validate the final Vercel CLI command syntax against current Vercel documentation before workflow implementation.
- [ ] 2.6 Use a reproducible Vercel CLI flow equivalent to installing Vercel CLI, running `vercel pull`, running `vercel build`, and running `vercel deploy --prebuilt`.
- [ ] 2.7 Ensure `.vercel/` and any local `.vercel/project.json` remain uncommitted.
- [ ] 2.8 Stop and request a new decision if Vercel CLI requires billing, paid team features, unsupported workflow changes, `package.json` changes, `vercel.json`, or another repository configuration change not covered by the revised approved plan.

## 3. GitHub Secrets And Permissions

- [ ] 3.1 Confirm permission to access the GitHub repository `Proyecto-Software-I/frontend`.
- [ ] 3.2 Confirm access to the appropriate Vercel account, team, or project.
- [ ] 3.3 Confirm permission to create GitHub repository secrets or document that the owner must add them.
- [ ] 3.4 Configure or request `VERCEL_TOKEN` as a GitHub repository secret without exposing its value.
- [ ] 3.5 Configure or request `VERCEL_ORG_ID` as a GitHub repository secret without exposing its value.
- [ ] 3.6 Configure or request `VERCEL_PROJECT_ID` as a GitHub repository secret without exposing its value.
- [ ] 3.7 Attempt `gh secret set` only after the revised plan is approved; if permissions are missing, document the blocker and ask the owner to add the secrets.
- [ ] 3.8 Confirm the required secrets exist without printing their values.
- [ ] 3.9 Confirm no secrets, tokens, API keys, `.env` files, Vercel local state, Firebase configuration, or credentials are committed.

## 4. Environment Configuration

- [ ] 4.1 Confirm how Preview `NEXT_PUBLIC_API_URL` will be provided: Vercel environment configuration or approved GitHub Secrets/Variables.
- [ ] 4.2 Confirm how Production `NEXT_PUBLIC_API_URL` will be provided: Vercel environment configuration or approved GitHub Secrets/Variables.
- [ ] 4.3 Do not invent concrete `NEXT_PUBLIC_API_URL` values; use only values provided or confirmed by the responsible maintainer.
- [ ] 4.4 Confirm `NEXT_PUBLIC_API_URL` is treated as public browser-exposed configuration and not as a secret, while still keeping real environment values out of Git.
- [ ] 4.5 Document backend CORS as a coordination risk if deployed Vercel URLs cannot reach the backend.

## 5. Documentation

- [x] 5.1 Update `README.md` with a concise CI/CD section describing `PR -> main -> GitHub Actions -> npm ci -> OpenSpec validation -> lint -> build`.
- [ ] 5.2 Update `README.md` so Preview deployment is documented as `PR -> GitHub Actions -> Vercel CLI -> Vercel Preview`.
- [ ] 5.3 Update `README.md` so Production deployment is documented as `push main -> GitHub Actions -> Vercel CLI -> Vercel Production`.
- [ ] 5.4 Document that native Vercel Git integration is not used because the current Hobby scope cannot use it for the organization repository.
- [ ] 5.5 Document required GitHub repository secrets and permissions without including values.
- [x] 5.6 Document that `NEXT_PUBLIC_API_URL` is public browser-exposed configuration, should be configured for Preview and Production, and must not contain secrets.
- [x] 5.7 Document that `.env.example` only changes if a new variable is introduced; do not change it just for Vercel setup.
- [x] 5.8 Document backend CORS as a coordination risk if deployed Vercel URLs cannot reach the backend.
- [x] 5.9 Document that GitHub rulesets, branch protections, backend CI/CD, custom domains, and paid services are outside this issue's scope.
- [ ] 5.10 Document that cloning the repository into a personal GitHub account is out of scope and not required by the CLI deployment strategy.
- [ ] 5.11 Document how to find the Preview URL from GitHub Actions output, logs, or job summary if viable without adding an unapproved dependency.

## 6. Verification

- [x] 6.1 Run `openspec validate 11-setup-frontend-ci-cd --strict --no-interactive` after planning changes and after implementation changes that affect OpenSpec.
- [x] 6.2 Run `git diff --check`.
- [x] 6.3 Run `npm run spec:validate`.
- [x] 6.4 Run `npm run lint`.
- [x] 6.5 Run `npm run build`.
- [x] 6.6 Run `npm run check`.
- [x] 6.7 Verify from the Pull Request for this issue that the GitHub Actions workflow runs automatically for a PR targeting `main`.
- [x] 6.8 Verify the workflow shows separate successful steps for `npm ci`, OpenSpec validation, lint, and build.
  - First real GitHub Actions run failed at `npm run spec:validate` with `openspec: not found` because the clean runner did not have the OpenSpec CLI installed globally. The workflow now installs `@fission-ai/openspec@1.9.0` before OpenSpec validation.
- [x] 6.9 Perform a controlled failure check showing CI fails when a required validation fails, then revert or correct the intentional failure before finalizing so no broken code remains in the final history.
- [x] 6.10 Verify the workflow is scoped as intended for Pull Requests targeting `main`.
- [ ] 6.11 Run `openspec validate 11-setup-frontend-ci-cd --strict --no-interactive` after this revised CD plan update.
- [ ] 6.12 Obtain a new `PLAN APPROVED` before modifying workflows, adding secrets, or implementing Vercel CLI deployment.
- [ ] 6.13 Verify `gh secret set` works for the required repository secrets or document that the assignee lacks permission and the owner must add them.
- [ ] 6.14 Verify the required Vercel secrets exist in GitHub without showing their values.
- [ ] 6.15 Verify CI remains green before any Preview deployment runs.
- [ ] 6.16 Verify a real Preview Deployment is created from the Pull Request and a Preview URL is available.
- [ ] 6.17 Verify the Preview deployment does not use `--prod` and does not replace Production.
- [ ] 6.18 Verify Production Deployment runs exclusively from `main` and not from feature branches, chore branches, or `pull_request`.
- [ ] 6.19 Verify a merge or push to `main` creates a Vercel Production Deployment only when that step is allowed by the project flow and maintainer authorization.
- [x] 6.20 Confirm no frontend routes, components, responsive behavior, accessibility behavior, loading states, error states, backend files, or backend HTTP contracts changed.
