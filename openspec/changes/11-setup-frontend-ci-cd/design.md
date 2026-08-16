## Context

See `proposal.md` for motivation and scope. The current repository has no `.github/workflows/` directory, no existing GitHub Actions workflows, no Vercel/Firebase configuration files, and no automated test script. The project uses npm with `package-lock.json`, Next.js `16.2.12`, and repository documentation requires Node.js 24 LTS.

The only frontend environment variable currently used by application code is `NEXT_PUBLIC_API_URL`, read by `src/lib/api/api-client.ts`. Because it is prefixed with `NEXT_PUBLIC_`, it is exposed to browser code and must not contain secrets. `.env*` files are ignored, `.env.example` is allowed, and `.vercel` is ignored.

## Goals / Non-Goals

**Goals:**
- Add a focused CI workflow for Pull Requests targeting `main`.
- Use Node.js 24, npm cache when appropriate, and explicit CI steps for `npm ci`, `npm run spec:validate`, `npm run lint`, and `npm run build`.
- Keep deployment managed by Vercel's GitHub integration instead of custom deploy commands in GitHub Actions.
- Document Vercel setup, `main` production behavior, Preview Deployments, environment variables, and required external permissions.
- Preserve existing frontend application behavior.

**Non-Goals:**
- No backend CI/CD or backend repository changes.
- No GitHub ruleset, branch protection, or `main` protection changes.
- No custom domain, observability add-ons, analytics, authentication, Firebase products, or third hosting platform.
- No paid plans, billing activation, or paid external resources.
- No dependency additions or package manager changes.
- No `package.json` `engines.node` change by default.
- No `vercel.json` unless implementation discovers a concrete need and OpenSpec is updated before changing scope.

## Decisions

### Use Vercel For CD

Vercel will be the selected deployment platform. Vercel has first-party support for Next.js, supports Node.js `24.x`, integrates directly with GitHub, creates Preview Deployments for Pull Requests and branch pushes, and deploys production from the configured Production Branch, which will be `main`. Vercel also supports project-level environment variables scoped to Production, Preview, and Development.

Alternative considered: Firebase App Hosting. Firebase App Hosting is technically valid for modern full-stack web apps, but it is less appropriate for this issue's constraints. Firebase pricing documentation lists App Hosting under paid-tier usage and marks it not applicable on Spark. Using App Hosting requires a Firebase project on Blaze/pay-as-you-go and underlying Google Cloud resources such as Cloud Run, Cloud Build, Artifact Registry, Cloud Logging, and Secret Manager. Issue #11 explicitly forbids activating billing, paid plans, or resources with cost without authorization, so Firebase App Hosting is not selected.

### Keep CI In GitHub Actions And CD In Vercel

GitHub Actions will validate Pull Requests with repository scripts. Vercel's GitHub integration will handle deployments after the repository is connected externally. This avoids adding Vercel CLI, Vercel tokens, or custom deployment workflows to the repository.

Alternative considered: Deploying to Vercel from GitHub Actions with Vercel CLI. That approach would require approved deployment secrets such as `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`, plus workflow complexity for preview and production deploys. It is unnecessary while the standard Vercel Git integration satisfies the issue.

### Use Current Repository Scripts

The CI workflow will install dependencies with `npm ci` and run `npm run spec:validate`, `npm run lint`, and `npm run build` as separate named steps. Separate steps make failures easier to diagnose in GitHub Actions. The workflow will not use only `npm run check`, even though `npm run check` remains useful as a local/final validation command.

Alternative considered: Use only `npm run check` in CI. That would run the right validation set today, but it would hide which required phase failed behind a single command. Issue #11 asks for diagnosable CI, so the workflow will expose OpenSpec validation, lint, and build separately.

### Do Not Add A Test Command Yet

No test framework, test config, test files, or `test` script currently exists. The workflow will not include `npm test` by default and will not invent a test command. If an applicable test suite appears before this issue is completed, it must be incorporated only if it remains within the approved scope or OpenSpec is updated before the change.

Alternative considered: Add a test script or testing dependency as part of CI/CD. That would be outside issue #11's scope and would require separate approval for dependencies and test strategy.

### Set Node.js 24 In CI And Vercel Settings

The GitHub Actions workflow will explicitly use Node.js 24. Vercel should be configured to use Node.js 24 in project settings. No `package.json` `engines.node` field is planned by default because changing package metadata is not required to satisfy the issue and `package.json` is a protected file unless explicitly needed.

Alternative considered: Add `engines.node` with `24.x` to `package.json`. This would make runtime intent portable, but it is an additional protected-file change. It can be revisited only if maintainers prefer pinning Node through package metadata.

### Use Vercel Environment Variables For Deployment Configuration

Development can continue using local environment files based on `.env.example`. Preview and Production deployments will use Vercel Environment Variables for `NEXT_PUBLIC_API_URL`. The plan will not invent concrete Production or Preview values; they must be provided or confirmed by the responsible maintainer. `.env.example` will not change unless a new variable is introduced.

Alternative considered: Store deployment values in GitHub Actions secrets and pass them into a deployment workflow. That is unnecessary with native Vercel Git integration and would add secret-management complexity to the repository.

### Document External Setup Instead Of Committing Platform State

Vercel project connection, production branch selection, and deployment environment variables are configured in Vercel, not represented fully by committed repository files. The repository documentation will describe the required setup and verification steps.

Alternative considered: Add `vercel.json`. No repository-level Vercel configuration is currently needed for this project because Vercel can detect Next.js and use the default build command. Adding `vercel.json` without a concrete need would increase configuration surface.

## Proposed CI Shape

The workflow will be planned for Pull Requests targeting `main` only:

```text
PR -> main
  -> GitHub Actions
     -> checkout
     -> setup Node.js 24 with npm cache
     -> npm ci
     -> npm run spec:validate
     -> npm run lint
     -> npm run build
```

The job will fail automatically when any command exits non-zero. The workflow will not include `npm test` unless a valid test suite appears within the approved scope before completion.

## Proposed CD Shape

CD will use Vercel's native Git integration:

```text
GitHub repository: Proyecto-Software-I/frontend
  |
  +-- Pull Request / branch
  |     -> Vercel Preview Deployment
  |
  +-- main
        -> Vercel Production Deployment
```

Vercel will be configured externally with `main` as the Production Branch. Development branches must not replace Production. No Vercel token, Vercel CLI deployment workflow, Firebase configuration, or `vercel.json` is planned by default.

## Risks / Trade-offs

- [Risk] The assigned contributor may not have permission to install or configure the Vercel GitHub integration for `Proyecto-Software-I/frontend`. → Mitigation: document required permissions and request them in the issue before implementation/testing.
- [Risk] `NEXT_PUBLIC_API_URL` values for production and previews may be unknown. → Mitigation: document the variable and require maintainers to provide non-secret backend URLs for each Vercel environment.
- [Risk] Backend CORS may reject Vercel production or preview domains. → Mitigation: document as a backend coordination risk; do not change backend behavior in this frontend issue and coordinate through issue #11 or the backend repository if blocked.
- [Risk] Vercel Hobby plan may not be appropriate if the project usage or ownership requires a paid plan. → Mitigation: keep the plan on no-cost setup only and stop if Vercel requires billing or a paid team configuration.
- [Risk] Vercel Git integration creates deployment checks/comments that are external to repository files. → Mitigation: document how to verify deployment status from the Pull Request and Vercel dashboard.
- [Trade-off] GitHub Actions CI and Vercel deployment checks are separate systems. → Mitigation: keep CI simple and deterministic, and use Vercel for deployment-specific feedback.

## Migration Plan

1. Add the GitHub Actions CI workflow for Pull Requests targeting `main` with explicit steps for checkout, Node.js 24, npm cache, `npm ci`, `npm run spec:validate`, `npm run lint`, and `npm run build`.
2. Configure the Vercel project externally by importing the GitHub repository, selecting `main` as the Production Branch, confirming Node.js 24, and adding `NEXT_PUBLIC_API_URL` for Production and Preview using maintainer-provided values.
3. Open or update the Pull Request for this issue and confirm GitHub Actions CI runs.
4. Confirm Vercel creates a Preview Deployment for the issue branch or PR.
5. After merge, confirm `main` creates a production deployment.
6. If deployment setup fails without code changes, adjust Vercel project settings and documentation; if repository configuration must materially change, update OpenSpec and request approval again.

Rollback strategy: revert the CI workflow and documentation changes through a Pull Request if CI/CD must be removed. In Vercel, disconnect the Git repository or disable deployments from the Vercel project settings; do not remove repository history or secrets from Git because no secrets should be committed.

## Open Questions

- What exact `NEXT_PUBLIC_API_URL` values should be configured in Vercel for Production and Preview?
- Which GitHub/Vercel account or team will own the Vercel project and perform the external connection?
- Does the backend already allow requests from Vercel production and preview domains, or will a separate backend issue be needed?
