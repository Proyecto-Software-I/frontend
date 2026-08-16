## Why

Proyecto-Software-I/frontend needs CI/CD for issue https://github.com/Proyecto-Software-I/frontend/issues/11, but the previously approved Vercel native Git integration path is blocked because the current Vercel Hobby scope cannot use Git integration for the organization repository. The repository owner explicitly requested deployment through Vercel CLI from GitHub Actions using GitHub Secrets, so the CD design must be updated before implementation and a new `PLAN APPROVED` must be requested.

## What Changes

- Keep the existing GitHub Actions CI validation for Pull Requests targeting `main`: `npm ci`, OpenSpec CLI setup, `npm run spec:validate`, `npm run lint`, and `npm run build`.
- Replace the planned native Vercel Git integration deployment path with GitHub Actions jobs that invoke the official Vercel CLI.
- Plan Preview Deployments for Pull Requests targeting `main` after CI succeeds, without using `--prod`.
- Plan Production Deployments only for changes already integrated into `main`, using Vercel production mode.
- Use GitHub repository secrets for Vercel credentials and project identifiers, evaluating at minimum `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
- Document that `gh secret set` may be used only after the revised plan is approved; if permissions are missing, request that the repository owner add the secrets.
- Keep `.vercel/` and any local `.vercel/project.json` values out of Git; if local linking is used to obtain org/project identifiers, transfer those values to GitHub Secrets without committing them.
- Continue managing `NEXT_PUBLIC_API_URL` without inventing values or committing private configuration; Preview and Production values must be provided or confirmed by the responsible maintainer through the approved environment configuration.
- Update CI/CD documentation, specs, and tasks to reflect the Vercel CLI strategy, required secrets, permission checks, Preview URL handling, and Production isolation.
- Preserve existing frontend product code, dependencies, backend contracts, branch protections, rulesets, and repository settings outside the approved workflow/documentation scope.

## Capabilities

### New Capabilities
- `frontend-ci-cd`: Pull Request validation, Vercel CLI Preview Deployments, Vercel CLI Production Deployments from `main`, environment-variable handling, secret handling, and CI/CD documentation for the frontend repository.

### Modified Capabilities
- None.

## Impact

- Affected repository areas: `.github/workflows/`, `README.md`, and `openspec/changes/11-setup-frontend-ci-cd/`.
- Expected workflow impact: the existing CI workflow must not be degraded; deployment steps or workflows will be added or revised only after the new `PLAN APPROVED`.
- Expected secrets: GitHub repository secrets for `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`; `NEXT_PUBLIC_API_URL` may be configured through Vercel environment configuration or GitHub Secrets/Variables according to the final approved workflow design.
- `.env.example` is not expected to change unless a genuinely new variable appears and needs documentation.
- Not expected to change: `src/**`, `package.json`, `package-lock.json`, `next.config.*`, backend files, auth, Firebase configuration, committed Vercel local state, branch protection/ruleset settings, or deployment secrets in Git.
- Backend impact: no backend code or contract changes are in scope, but deployed Preview and Production frontends depend on backend URL configuration and may require separate backend CORS coordination.
- Routes and components: no application routes, React components, design-system components, visible interface behavior, mobile behavior, or accessibility behavior are expected to change.
- External systems: GitHub Actions, GitHub repository secrets, Vercel project settings, and Vercel CLI deployments. No external secret creation or deployment workflow changes will be implemented until the revised plan receives a new `PLAN APPROVED`.
