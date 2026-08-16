## Why

Proyecto-Software-I/frontend currently has no GitHub Actions workflow or connected deployment configuration, so Pull Requests are not validated automatically and `main` cannot deploy through a documented production path. Issue https://github.com/Proyecto-Software-I/frontend/issues/11 requires CI/CD for the frontend with an approved platform decision before implementation.

## What Changes

- Add a GitHub Actions CI workflow for Pull Requests targeting `main`.
- Run CI with explicit diagnostic steps for `npm ci`, `npm run spec:validate`, `npm run lint`, and `npm run build`.
- Do not add `npm test` to CI because the current repository has no test script, Jest, Vitest, Playwright, Cypress, or applicable automated test suite.
- Select Vercel as the deployment platform and document the decision against Firebase App Hosting before requesting `PLAN APPROVED`.
- Configure Vercel externally to connect the GitHub repository, use `main` as the production branch, deploy production from `main`, and provide Preview Deployments for Pull Requests and non-production branches.
- Manage deployment environment variables through Vercel project settings, including `NEXT_PUBLIC_API_URL` for Preview and Production environments, without inventing concrete values.
- Document the CI/CD flow, required permissions, environment-variable handling, and external setup steps.
- Preserve existing frontend code, dependencies, backend contracts, branch protections, and repository rulesets.

## Platform Decision

Vercel is selected for CD. The project uses Next.js 16, and Vercel provides direct GitHub integration, Preview Deployments for Pull Requests and branches, a configurable Production Branch using `main`, environment variables scoped outside the repository, and a lower-infrastructure path for this frontend-only issue.

Firebase App Hosting is technically valid for modern full-stack web apps, but it is less suitable for the current constraints. App Hosting requires Firebase Blaze/pay-as-you-go and underlying Google Cloud resources for App Hosting usage, while issue #11 explicitly prohibits activating billing or resources with cost without express authorization. This plan therefore avoids introducing Firebase/Google Cloud into the project for this issue.

## Capabilities

### New Capabilities
- `frontend-ci-cd`: Pull Request validation, production deployment, preview deployment, environment-variable handling, and CI/CD documentation for the frontend repository.

### Modified Capabilities
- None.

## Impact

- Affected repository areas: `.github/workflows/`, `README.md`, and `openspec/changes/11-setup-frontend-ci-cd/`.
- `.env.example` is not expected to change unless a genuinely new variable appears and needs documentation.
- Not expected to change: `src/**`, `package.json`, `package-lock.json`, `next.config.*`, backend files, auth, Firebase configuration, Vercel tokens, or branch protection/ruleset settings.
- Backend impact: no backend code or contract changes are in scope, but the deployed frontend will depend on the backend URL configured in `NEXT_PUBLIC_API_URL`; backend CORS for Vercel production and preview domains may need separate coordination if it is not already allowed.
- Routes and components: no application routes, React components, design-system components, or interface states are expected to change.
- External systems: GitHub Actions and Vercel project settings. No external service will be connected until implementation after `PLAN APPROVED` and only with the required permissions.
