import DocPage, { Code } from '../DocPage.jsx'
import { Link } from 'react-router-dom'

export default function Overview() {
  return (
    <DocPage slug="">
      <p>
        StackRamp is a zero-config deployment platform for GCP. Add one config file and one
        workflow file to any repo and get Firebase Hosting (frontend) + Cloud Run (backend) with
        custom domains, preview URLs on PRs, and fully automated infra provisioning.
      </p>

      <h2>What StackRamp does</h2>
      <div className="doc-grid">
        <div className="doc-grid-item">✓ Provisions Firebase Hosting, Cloud Run, DNS, SSL</div>
        <div className="doc-grid-item">✓ Builds and deploys frontend + backend</div>
        <div className="doc-grid-item">✓ Isolated PR preview environments</div>
        <div className="doc-grid-item">✓ SSO via Google IAP (opt-in)</div>
        <div className="doc-grid-item">✓ GCS storage buckets</div>
        <div className="doc-grid-item">✓ Cloud SQL (Postgres) with Secret Manager</div>
        <div className="doc-grid-item">✓ Secret injection from GCP Secret Manager</div>
        <div className="doc-grid-item">✓ Custom domains with automatic SSL</div>
        <div className="doc-grid-item">✓ Change detection — only deploys what changed</div>
      </div>

      <h2>Quick start</h2>
      <p>Two files in your repo. That's it.</p>

      <h3>1. stackramp.yaml</h3>
      <Code>{`name: my-app

frontend:
  framework: react

backend:
  language: python

database: false`}</Code>

      <h3>2. .github/workflows/deploy.yml</h3>
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
      id-token: write
      contents: read
      pull-requests: write
    uses: bobbydeveaux/stackramp/.github/workflows/platform.yml@main
    secrets: inherit`}</Code>

      <h2>Next steps</h2>
      <div className="doc-cards">
        <Link to="/docs/bootstrap" className="doc-link-card">
          <h4>Platform Bootstrap</h4>
          <p>One-time operator setup for your GCP project</p>
        </Link>
        <Link to="/docs/onboarding" className="doc-link-card">
          <h4>Onboarding an App</h4>
          <p>Add StackRamp to any existing repo</p>
        </Link>
        <Link to="/docs/stackramp-yaml" className="doc-link-card">
          <h4>stackramp.yaml Reference</h4>
          <p>All configuration options</p>
        </Link>
        <Link to="/docs/deploy-flow" className="doc-link-card">
          <h4>Deploy Flow</h4>
          <p>What happens when you push</p>
        </Link>
      </div>
    </DocPage>
  )
}
