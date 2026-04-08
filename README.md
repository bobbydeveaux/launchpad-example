# stackramp-example

A working example app deployed entirely by [StackRamp](https://github.com/bobbydeveaux/stackramp) — an open-source, zero-config deployment platform delivered as a GitHub Action.

## What this repo demonstrates

- A **React + Vite** frontend deployed to Firebase Hosting
- A **Python FastAPI** backend deployed to Cloud Run
- The frontend fetches live data from the backend at runtime
- The entire deployment is driven by **a single `stackramp.yaml`** and **9 lines of `deploy.yml`**
- No GCP console. No Terraform. No secrets management.

## Live site

https://stackramp.io

## The config

**`stackramp.yaml`** (the only app-level config needed):

```yaml
name: stackramp-example

frontend:
  framework: react
  dir: frontend
  node_version: "20"

backend:
  language: python
  dir: backend
  port: 8080
```

**`.github/workflows/deploy.yml`** (the only CI/CD config needed):

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

jobs:
  deploy:
    permissions:
      id-token: write
      contents: read
      pull-requests: write
    uses: bobbydeveaux/stackramp/.github/workflows/platform.yml@main
    secrets: inherit
```

## What StackRamp does on push

1. Parses `stackramp.yaml`
2. Detects what changed (frontend, backend, or both)
3. Provisions GCP infrastructure idempotently via Terraform
4. Builds and deploys only what changed
5. On PRs: creates a preview deployment and posts the URL as a GitHub comment

## Full `stackramp.yaml` reference

```yaml
# Required — used as the app identifier and resource name prefix
name: my-app

# ── Frontend ────────────────────────────────────────────────────────────────
frontend:
  framework: react        # react | vue | nextjs | static | none
  dir: frontend           # directory containing frontend source
  node_version: "20"      # optional, defaults to 20 (or reads .nvmrc)

# ── Backend ─────────────────────────────────────────────────────────────────
backend:
  language: python        # python | go | node
  dir: backend            # directory containing backend source
  port: 8080              # port your app listens on
  memory: 512Mi           # optional, Cloud Run memory allocation
  cpu: "1"                # optional, Cloud Run CPU allocation

# ── Database ────────────────────────────────────────────────────────────────
# Provisions a database within the platform's shared Cloud SQL Postgres instance.
# DATABASE_URL is auto-generated and injected into the backend — no config needed.
database: postgres        # postgres | false

# ── Storage ─────────────────────────────────────────────────────────────────
# Provisions a GCS bucket. GCS_BUCKET env var is automatically injected.
storage: gcs              # gcs | false

# ── Custom Domain ────────────────────────────────────────────────────────────
# Optional. Leave out to use the default Firebase / Cloud Run URLs.
# If STACKRAMP_BASE_DOMAIN is set, you can use app.base_domain shorthand
# and dev automatically gets app.dev.base_domain.
domain: myapp.io
```

## Features

### Hosting & Compute
- **Firebase Hosting** — static and SPA frontends, with automatic SPA catch-all routing
- **Cloud Run** — containerised backends (Python, Go, Node.js, or bring your own Dockerfile)
- **PR Preview Environments** — every pull request gets a unique preview URL, posted as a GitHub comment

### Storage & Data
- **GCS Buckets** — `storage: gcs` provisions a bucket and injects `GCS_BUCKET` into the backend automatically
- **Shared Postgres** — `database: postgres` creates a database and user within the platform's shared Cloud SQL instance; `DATABASE_URL` is generated, stored in Secret Manager, and mounted into Cloud Run securely

### Secrets
- **Platform-injectable secrets** — the platform team manages secrets in GCP Secret Manager (labelled `platform-inject=true`); they are automatically discovered and mounted into every Cloud Run deployment — no per-app config or workflow changes needed
- **Secrets never touch CI** — all secrets are mounted directly from Secret Manager into Cloud Run at runtime, never read by the GitHub Actions runner

### Domains & Networking
- **Custom domains** — apex and subdomain support, with automatic DNS record management via Cloud DNS
- **Auto-subdomains** — if `STACKRAMP_BASE_DOMAIN` is set, apps get `{app}.{base_domain}` (prod) and `{app}.dev.{base_domain}` (dev) automatically
- **API proxying** — `/api/**` requests from the frontend are automatically proxied to the Cloud Run backend

### CI/CD
- **Workload Identity Federation** — GitHub Actions authenticates to GCP without any long-lived service account keys
- **Smart change detection** — only builds and deploys what actually changed (frontend, backend, or both)
- **Multi-environment** — dev deploys on every push and PR; prod deploys only on merge to `main`

## Repo structure

```
stackramp-example/
├── stackramp.yaml              ← platform config
├── .github/
│   └── workflows/
│       └── deploy.yml          ← CI/CD (9 lines)
├── frontend/                   ← React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── index.html
│   └── package.json
└── backend/                    ← Python FastAPI
    ├── main.py
    └── requirements.txt
```

## Running locally

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

## Platform setup

StackRamp requires a one-time bootstrap of a GCP project by your platform team. See the [operator guide](https://github.com/bobbydeveaux/stackramp) for details. Once bootstrapped, deploying any app is just a `stackramp.yaml` drop-in — no GCP knowledge required.

StackRamp is at [github.com/bobbydeveaux/stackramp](https://github.com/bobbydeveaux/stackramp).
