## Context

See `proposal.md` for motivation and scope. The current repository already has a GitHub Actions CI workflow that validates Pull Requests targeting `main` with Node.js 24, `npm ci`, OpenSpec CLI setup, `npm run spec:validate`, `npm run lint`, and `npm run build`.

The previously planned CD path used Vercel native Git integration. That path is now blocked because the current Vercel Hobby scope cannot use Git integration for the organization repository. The repository owner instructed that deployments must instead run from GitHub Actions through the official Vercel CLI, using GitHub Secrets. If the assignee cannot create repository secrets with `gh secret set` after approval, the blocker must be documented and the owner must add the secrets.

Vercel CLI documentation supports the intended reproducible flow: `vercel pull` fetches project settings and environment variables for a target environment, `vercel build` creates Build Output API artifacts under `.vercel/output`, and `vercel deploy --prebuilt` deploys those artifacts. The `--prod` flag is used for production deployments; by default `vercel build` uses Preview environment variables and `vercel deploy` without `--prod` creates a Preview deployment after the first-project-deployment caveat noted by Vercel.

The only frontend environment variable currently used by application code is `NEXT_PUBLIC_API_URL`, read by `src/lib/api/api-client.ts`. Because it is prefixed with `NEXT_PUBLIC_`, it is exposed to browser code and must not contain secrets. `.env*` files are ignored, `.env.example` is allowed, and `.vercel` is ignored and must remain uncommitted.

## Goals / Non-Goals

**Goals:**
- Preserve the existing CI validation steps and do not degrade their coverage or diagnostics.
- Deploy Preview builds from Pull Requests targeting `main` through GitHub Actions and Vercel CLI only after CI passes.
- Deploy Production builds through GitHub Actions and Vercel CLI only for `push` events to `main` or an equivalent approved event representing changes already integrated into `main`.
- Use GitHub repository secrets for Vercel CLI authentication and project identification.
- Keep Preview deployments non-production by omitting `--prod` and using Preview environment configuration.
- Use production mode only for the Production workflow from `main`.
- Document how to verify required secrets exist without printing values.
- Document how to obtain or expose the Preview URL from Vercel CLI output when viable without adding an unapproved PR-comment dependency.

**Non-Goals:**
- No native Vercel Git integration requirement for this issue.
- No cloning the organization repository into a personal GitHub account to bypass Vercel scope limits.
- No backend CI/CD or backend repository changes.
- No GitHub ruleset, branch protection, or `main` protection changes.
- No custom domain, observability add-ons, analytics, authentication, Firebase products, Google Cloud resources, or third hosting platform.
- No paid plans, billing activation, or paid external resources.
- No dependency additions or package manager changes unless explicitly approved in a revised plan.
- No `package.json` `engines.node` change by default.
- No committed `.vercel/`, `.env*`, tokens, project identifiers, or credentials.

## Decisions

### Use Vercel CLI From GitHub Actions For CD

GitHub Actions will handle both CI and CD. Pull Request workflows will run CI first and then run a Vercel CLI Preview deployment only if CI succeeds. A separate Production path will run only for `push` to `main` or an approved equivalent event after changes are integrated into `main`.

Alternative considered: Vercel native Git integration. It remains desirable for standard Vercel projects, but it is not usable with the current Hobby scope for this organization repository and was explicitly replaced by the repository owner.

### Use Official Vercel CLI With Prebuilt Deployments

The deployment workflow will install the official Vercel CLI in GitHub Actions, authenticate using `VERCEL_TOKEN`, pull remote project settings for the target environment, build locally with Vercel, and deploy the prebuilt output. The planned command shape is:

```text
Preview PR:
  vercel pull --yes --environment=preview
  vercel build
  vercel deploy --prebuilt

Production main:
  vercel pull --yes --environment=production
  vercel build --prod
  vercel deploy --prebuilt --prod
```

The implementation must verify exact syntax against the current Vercel CLI documentation before editing workflows. If the current CLI requires additional global options for token, scope, or project identification, the workflow should use environment variables or GitHub Secrets in a way that avoids printing secret values.

Alternative considered: deploy source directly with `vercel deploy`. The prebuilt flow is preferred because Vercel documents `vercel build` plus `vercel deploy --prebuilt` for reproducible CI/CD workflows and it separates build failures from upload/deployment failures.

### Use GitHub Repository Secrets For Vercel Credentials

The workflow will require GitHub repository secrets for Vercel access. At minimum, the plan must evaluate:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

`VERCEL_TOKEN` should be exposed to the job or step as an environment variable if compatible with the Vercel CLI, instead of being written literally into command arguments. `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` should also come from repository secrets when needed to link the CI workspace to the Vercel project. No real values may appear in OpenSpec, README, workflow files, logs, issues, or commits.

After the revised plan is approved, `gh secret set` may be attempted. If the assignee lacks permission to create repository secrets, implementation must stop for that part, document the blocker, and request that the owner add the required secrets.

Alternative considered: committing `.vercel/project.json` or passing identifiers directly in workflow YAML. This is rejected because `.vercel/` is local state and project identifiers or tokens must not be committed.

### Keep The Vercel Project Independent From Git Integration

The Vercel Project may exist without being connected to the GitHub repository because deployments will be created by the CLI from GitHub Actions. The repository must not be cloned into a personal GitHub account to work around organization integration limits.

If local `vercel link` creates `.vercel/project.json` to discover `orgId` or `projectId`, those values must be transferred to GitHub Secrets and `.vercel/` must remain ignored and uncommitted.

Alternative considered: using a personal GitHub clone connected to Vercel. This is rejected because it would diverge from the organization repository and weaken deployment traceability.

### Preserve CI Before CD

The existing CI validation remains required. Preview deployment must be dependent on successful CI in the Pull Request workflow. Production deployment from `main` must also run the required validations before deploying, unless GitHub Actions already guarantees the same checked commit passed the same workflow in an approved way.

Alternative considered: deploy first and rely on Vercel build failures. This is rejected because issue #11 requires explicit diagnosable CI and the existing CI must not be degraded.

### Handle Preview URLs Without New Dependencies By Default

Vercel CLI prints the deployment URL to standard output when deployment succeeds. The workflow can capture that output and expose it in GitHub Actions logs or job summary, provided secrets are not printed. Commenting directly on the PR should not introduce an additional action or dependency unless explicitly approved.

Alternative considered: add a PR comment action by default. This is deferred because it would introduce an extra dependency solely for presentation convenience.

### Keep `NEXT_PUBLIC_API_URL` Values Out Of Git

`NEXT_PUBLIC_API_URL` is public client configuration, not a secret, but the real Preview and Production values must still be provided or confirmed by the responsible maintainer. The final workflow may rely on Vercel environment configuration pulled by `vercel pull`, or on GitHub Secrets/Variables passed into the Vercel build if that is the approved design. No concrete values will be invented or committed.

Alternative considered: hard-code deployment backend URLs in workflow or README. This is rejected because environment-specific values must remain externally configured and maintainer-confirmed.

## Proposed CI/CD Shape

```text
Pull Request -> main
  -> GitHub Actions
     -> checkout
     -> setup Node.js 24 with npm cache
     -> npm ci
     -> install OpenSpec CLI
     -> npm run spec:validate
     -> npm run lint
     -> npm run build
     -> install Vercel CLI
     -> vercel pull --environment=preview
     -> vercel build
     -> vercel deploy --prebuilt
     -> expose Preview URL without printing secrets

push -> main
  -> GitHub Actions
     -> checkout
     -> setup Node.js 24 with npm cache
     -> npm ci
     -> install OpenSpec CLI
     -> npm run spec:validate
     -> npm run lint
     -> npm run build
     -> install Vercel CLI
     -> vercel pull --environment=production
     -> vercel build --prod
     -> vercel deploy --prebuilt --prod
```

Feature, chore, and other development branches must never deploy with `--prod`. Pull Request events must never run the Production deployment path.

## Risks / Trade-offs

- [Risk] The assignee may not have permission to create GitHub repository secrets. -> Mitigation: after approval, attempt `gh secret set` only if authorized; otherwise document the blocker and request owner action.
- [Risk] Secret values could be leaked through workflow arguments or logs. -> Mitigation: use GitHub Secrets masking, prefer environment variables for tokens, avoid echoing values, and verify logs do not expose credentials.
- [Risk] Missing `VERCEL_ORG_ID` or `VERCEL_PROJECT_ID` may prevent non-interactive CLI linking in CI. -> Mitigation: obtain identifiers from the Vercel project or local `.vercel/project.json`, store them as GitHub Secrets, and keep `.vercel/` uncommitted.
- [Risk] Vercel notes the first deployment of a new project is always production even when `--prod` is omitted. -> Mitigation: confirm project state before relying on PR Preview behavior and document any required owner-provided initial setup if necessary.
- [Risk] `NEXT_PUBLIC_API_URL` values for Preview and Production may be unknown. -> Mitigation: require maintainer-provided values in Vercel environment configuration or approved GitHub Secrets/Variables.
- [Risk] Backend CORS may reject Vercel production or preview domains. -> Mitigation: document as backend coordination risk; do not change backend behavior in this frontend issue.
- [Trade-off] Deployments become more explicit in repository workflows but require secret management and CLI maintenance. -> Mitigation: keep workflows minimal, use official CLI commands, and validate with real GitHub Actions runs.

## Migration Plan

1. Update OpenSpec and request a new `PLAN APPROVED` because the CD architecture changed materially.
2. After approval, update GitHub Actions without degrading existing CI validation.
3. Configure or request required repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`; configure `NEXT_PUBLIC_API_URL` through the approved environment mechanism.
4. Add a Pull Request Preview deployment path that runs only after CI passes and never uses `--prod`.
5. Add a Production deployment path that runs only from `push` to `main` or an approved equivalent integrated-main event and uses production mode.
6. Verify the Preview URL is generated and available from GitHub Actions without printing secrets.
7. Verify Production deployment from `main` when allowed by project flow and maintainer authorization.
8. If secret creation, Vercel project configuration, paid plan requirements, or CLI behavior blocks implementation, stop and request a decision before changing scope.

Rollback strategy: revert workflow and documentation changes through a Pull Request if CLI deployment must be removed. In GitHub, remove or rotate repository secrets if they are no longer needed. In Vercel, disable or delete the CLI-created project/deployments according to maintainer direction; do not commit or remove secrets through Git history because no secrets should be committed.

## Open Questions

- Which Vercel account/team owns the project that will receive CLI deployments?
- Will the owner create `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`, or does the assignee have permission to create them with `gh secret set` after approval?
- Should `NEXT_PUBLIC_API_URL` be sourced from Vercel environment configuration via `vercel pull`, or from GitHub Secrets/Variables passed into the build?
- Does the Vercel project already have an initial production deployment, avoiding the first-deployment Preview caveat for PR deployments without `--prod`?
- Does the backend already allow requests from the final Vercel Preview and Production domains, or will a separate backend issue be needed?
