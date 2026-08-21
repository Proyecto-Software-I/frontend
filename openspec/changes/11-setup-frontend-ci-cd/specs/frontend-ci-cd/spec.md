## Purpose

Defines the frontend repository Continuous Integration behavior required to validate Pull Requests targeting `main`. Continuous Deployment is intentionally deferred and is not part of the configured repository behavior in this change.

## ADDED Requirements

### Requirement: Pull Request CI Validation

The repository SHALL validate every Pull Request targeting `main` through GitHub Actions using explicit steps for dependency installation, OpenSpec validation, lint, and build.

#### Scenario: Pull Request validation succeeds
- **GIVEN** a Pull Request targets `main`
- **WHEN** `npm ci`, `npm run spec:validate`, `npm run lint`, and `npm run build` all pass
- **THEN** the Pull Request SHALL show a successful CI status

#### Scenario: Pull Request validation fails
- **GIVEN** a Pull Request targets `main`
- **WHEN** any required validation exits with a non-zero status
- **THEN** the CI workflow SHALL fail and identify the failed step

#### Scenario: Pull Request targets another branch
- **GIVEN** a Pull Request targets a branch other than `main`
- **WHEN** it is opened or updated
- **THEN** this change SHALL NOT require the frontend CI workflow for that target branch

### Requirement: Reproducible Dependency Installation

The CI workflow SHALL install dependencies using `npm ci`.

#### Scenario: CI installs dependencies
- **GIVEN** the committed npm lockfile exists
- **WHEN** CI prepares the frontend
- **THEN** dependencies SHALL be installed using `npm ci`

### Requirement: OpenSpec Validation

The CI workflow SHALL install the required OpenSpec CLI and execute `npm run spec:validate`.

#### Scenario: OpenSpec validation fails
- **GIVEN** a Pull Request targets `main`
- **WHEN** `npm run spec:validate` fails
- **THEN** CI SHALL fail

### Requirement: Lint Validation

The CI workflow SHALL execute `npm run lint`.

#### Scenario: Lint fails
- **GIVEN** a Pull Request targets `main`
- **WHEN** `npm run lint` fails
- **THEN** CI SHALL fail

### Requirement: Production Build Validation

The CI workflow SHALL execute `npm run build`.

#### Scenario: Build fails
- **GIVEN** a Pull Request targets `main`
- **WHEN** `npm run build` fails
- **THEN** CI SHALL fail

### Requirement: Automated Test Execution When Available

The repository SHALL add its automated test command to CI when an applicable automated test suite and script exist.

#### Scenario: No automated tests are configured
- **GIVEN** the frontend has no applicable automated test suite
- **WHEN** CI validates a Pull Request
- **THEN** CI SHALL complete using install, OpenSpec validation, lint and build without inventing a test command

#### Scenario: Automated tests are introduced later
- **GIVEN** a future change adds an applicable automated test suite and script
- **WHEN** that change is implemented
- **THEN** the responsible change SHALL integrate the applicable test command into CI

### Requirement: Continuous Deployment Is Deferred

The repository SHALL NOT configure Continuous Deployment as part of this change.

#### Scenario: Pull Request CI succeeds
- **GIVEN** a Pull Request passes CI
- **WHEN** the workflow completes
- **THEN** this change SHALL NOT require a Preview Deployment

#### Scenario: Changes are merged into main
- **GIVEN** changes are integrated into `main`
- **WHEN** the merge completes
- **THEN** this change SHALL NOT require a Production Deployment

#### Scenario: Deployment becomes necessary later
- **GIVEN** the project later requires automatic deployment
- **WHEN** the team selects a hosting and deployment strategy
- **THEN** CD SHALL be introduced through a separate issue and OpenSpec change

### Requirement: No Deployment Secrets

The CI-only workflow SHALL NOT require deployment credentials or platform project identifiers.

#### Scenario: CI runs
- **GIVEN** the frontend CI workflow starts
- **WHEN** it validates a Pull Request
- **THEN** it SHALL run without Vercel, Firebase, hosting, or other deployment secrets

### Requirement: CI Documentation

The repository SHALL document the configured CI flow and clearly state that CD is not configured.

#### Scenario: Contributor reads documentation
- **GIVEN** a contributor reads the README
- **WHEN** they inspect the CI section
- **THEN** they SHALL identify the Pull Request validations and that CD is deferred

### Requirement: No Frontend Product Behavior Change

The CI change SHALL NOT alter frontend routes, visible page content, application interactions, or backend HTTP contracts.

#### Scenario: Application behavior remains unchanged
- **GIVEN** the CI configuration and documentation are added
- **WHEN** the application is built and run
- **THEN** existing product behavior SHALL remain unchanged