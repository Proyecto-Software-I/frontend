## 1. CI Workflow

- [x] 1.1 Create `.github/workflows/ci.yml` for Pull Requests targeting `main`.
- [x] 1.2 Configure repository checkout.
- [x] 1.3 Configure Node.js 24 with npm cache.
- [x] 1.4 Configure an explicit `npm ci` step.
- [x] 1.5 Configure an explicit OpenSpec CLI installation step.
- [x] 1.6 Configure an explicit `npm run spec:validate` step.
- [x] 1.7 Configure an explicit `npm run lint` step.
- [x] 1.8 Configure an explicit `npm run build` step.
- [x] 1.9 Verify that a controlled validation failure makes CI fail.
- [x] 1.10 Restore the repository after the controlled failure test.
- [x] 1.11 Keep deployment tokens, deploy commands and production triggers out of the workflow.
- [x] 1.12 Use current official checkout and Node setup actions.

## 2. Documentation

- [x] 2.1 Document the Pull Request CI flow in `README.md`.
- [x] 2.2 Document that there is currently no applicable automated test suite in CI.
- [x] 2.3 Align proposal, design and spec with the CI-only implementation.
- [x] 2.4 Explicitly document that Continuous Deployment is deferred.

## 3. Verification

- [x] 3.1 Validate that CI runs only for Pull Requests targeting `main`.
- [x] 3.2 Validate that failures are visible in independent workflow steps.
- [x] 3.3 Confirm no deployment secrets or credentials are required.
- [x] 3.4 Confirm no application behavior is changed by this work.

## Deferred

Continuous Deployment, hosting selection, Preview Deployments, Production Deployments, deployment secrets and environment-specific deployment configuration are intentionally deferred to a future issue and OpenSpec change.