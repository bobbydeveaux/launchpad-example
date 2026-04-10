import DocPage, { Code } from '../DocPage.jsx'

export default function Onboarding() {
  return (
    <DocPage slug="onboarding">
      <p>Two files in the app repo. That's it.</p>

      <h2>1. stackramp.yaml (repo root)</h2>
      <p>Describes what your app is. All fields except <code>name</code> are optional.</p>
      <Code>{`name: my-app

frontend:
  framework: react
  dir: frontend

backend:
  language: python
  dir: backend
  port: 8080

domain: my-app.yourdomain.com

database: false`}</Code>

      <h3>Frontend-only example</h3>
      <Code>{`name: guardian

domain: guardian.yourdomain.com

frontend:
  framework: static
  dir: website

database: false`}</Code>

      <h3>Full-stack with SSO and storage</h3>
      <Code>{`name: my-app

domain: my-app.yourdomain.com

frontend:
  framework: react
  sso: true

backend:
  language: go
  sso: true

database: postgres
storage: gcs`}</Code>

      <h2>2. .github/workflows/deploy.yml</h2>
      <Code>{`name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, closed]
  workflow_dispatch:

jobs:
  deploy:
    permissions:
      id-token: write       # required for WIF / GCP auth
      contents: read        # required to checkout code
      pull-requests: write  # required to post PR preview URLs
    uses: bobbydeveaux/stackramp/.github/workflows/platform.yml@main
    secrets: inherit`}</Code>
      <p>
        That's the entire deploy workflow. No further configuration needed in the app repo.
        The <code>closed</code> type is needed so StackRamp can clean up preview environments
        when PRs are merged or closed.
      </p>
    </DocPage>
  )
}
