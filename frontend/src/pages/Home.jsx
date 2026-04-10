import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL ?? ''

function LiveTime() {
  const [time, setTime] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/time`)
      .then(r => r.json())
      .then(data => setTime(data.formatted))
      .catch(() => setError('Could not reach backend'))
  }, [])

  return (
    <div className="live-time">
      <span className="live-dot" />
      <span className="live-label">Live from Cloud Run</span>
      <p className="live-value">{error ?? time ?? 'Loading…'}</p>
    </div>
  )
}

function Step({ n, title, code, children }) {
  return (
    <div className="step">
      <div className="step-num">{n}</div>
      <div className="step-body">
        <h3>{title}</h3>
        <p>{children}</p>
        {code && <pre><code>{code}</code></pre>}
      </div>
    </div>
  )
}

function Badge({ children }) {
  return <span className="badge">{children}</span>
}

export default function Home() {
  return (
    <div className="page">

      {/* ── Meta banner ── */}
      <div className="meta-banner">
        ✦ This site is deployed by StackRamp itself —{' '}
        <a href="https://github.com/bobbydeveaux/stackramp-example/blob/main/stackramp.yaml" target="_blank" rel="noreferrer">
          view stackramp.yaml
        </a>
      </div>

      {/* ── Nav ── */}
      <nav className="nav">
        <span className="nav-logo">🚀 StackRamp</span>
        <div className="nav-links">
          <Link className="nav-link" to="/docs">Docs</Link>
          <a className="nav-link" href="https://github.com/bobbydeveaux/stackramp" target="_blank" rel="noreferrer">
            GitHub →
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <p className="hero-eyebrow">Open-source · Zero config · One push · Custom domains · SSO</p>
        <h1 className="hero-title">You commit code.<br />The platform handles the rest.</h1>
        <p className="hero-sub">
          StackRamp is a deployment platform delivered as a single GitHub Action.
          Drop in a <code>stackramp.yaml</code>, add one workflow file, push — and your app
          is live on GCP with Firebase Hosting and Cloud Run. No console. No Terraform. No secrets.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/docs">Read the Docs</Link>
          <a className="btn btn-secondary" href="https://github.com/bobbydeveaux/stackramp" target="_blank" rel="noreferrer">View on GitHub</a>
        </div>
        <LiveTime />
      </section>

      {/* ── How it works ── */}
      <section className="section">
        <h2 className="section-title">How it works</h2>
        <p className="section-sub">Three steps. That's it.</p>

        <div className="steps">
          <Step n="1" title="Describe your app" code={`name: my-app

frontend:
  framework: react
  sso: true         # optional — serve via Cloud Run + IAP instead of Firebase

backend:
  language: go
  sso: true         # optional — restrict to IAP-authenticated users

database: postgres  # optional — omit or set false to skip

storage: gcs        # optional — provisions a GCS bucket`}>
            Drop a <code>stackramp.yaml</code> in your repo root. Declare what you have — frontend, backend, database, storage, SSO. No cloud provider details, no ARNs, no project numbers.
          </Step>

          <Step n="2" title="Add one workflow file" code={`# .github/workflows/deploy.yml
jobs:
  deploy:
    permissions:
      id-token: write
      contents: read
      pull-requests: write
    uses: bobbydeveaux/stackramp/\
.github/workflows/platform.yml@main
    secrets: inherit`}>
            That's your entire CI/CD pipeline. The platform workflow handles everything else — building, provisioning, deploying, PR previews.
          </Step>

          <Step n="3" title="Push">
            StackRamp detects what changed, builds only what's needed, provisions cloud infrastructure idempotently, and deploys. URLs are posted back to your PR as a comment.
          </Step>
        </div>
      </section>

      {/* ── What gets created ── */}
      <section className="section section-alt">
        <h2 className="section-title">What the platform provisions</h2>
        <p className="section-sub">Everything is created automatically and idempotently on every push.</p>
        <div className="cards">
          <div className="card">
            <div className="card-icon">🌐</div>
            <h4>Firebase Hosting</h4>
            <p>Your React / Vue / Next app deployed to a global CDN with a <code>.web.app</code> URL out of the box.</p>
          </div>
          <div className="card">
            <div className="card-icon">⚙️</div>
            <h4>Cloud Run</h4>
            <p>Your Python / Go / Node backend containerised and deployed as a fully managed, auto-scaling service.</p>
          </div>
          <div className="card">
            <div className="card-icon">🔐</div>
            <h4>Workload Identity</h4>
            <p>GitHub Actions authenticates to GCP via OIDC — no service account keys, no secrets to rotate.</p>
          </div>
          <div className="card">
            <div className="card-icon">🗝️</div>
            <h4>Secret Manager</h4>
            <p>Platform-level secrets (API keys, credentials) are stored once in GCP Secret Manager and injected automatically into every Cloud Run deployment — no GitHub secrets required.</p>
          </div>
          <div className="card">
            <div className="card-icon">🐘</div>
            <h4>Cloud SQL (Postgres)</h4>
            <p>Set <code>database: postgres</code> and the platform provisions a per-app database, generates credentials, stores them in Secret Manager, and mounts <code>DATABASE_URL</code> into Cloud Run.</p>
          </div>
          <div className="card">
            <div className="card-icon">🪣</div>
            <h4>GCS Storage</h4>
            <p>Set <code>storage: gcs</code> to get a provisioned Cloud Storage bucket with the bucket name injected as <code>GCS_BUCKET_NAME</code>.</p>
          </div>
          <div className="card">
            <div className="card-icon">🔒</div>
            <h4>SSO via IAP</h4>
            <p>Set <code>sso: true</code> and the platform provisions a Global HTTPS Load Balancer with Google Identity-Aware Proxy. Only authenticated users get in — no app-level auth code needed.</p>
          </div>
          <div className="card">
            <div className="card-icon">👁️</div>
            <h4>PR Previews</h4>
            <p>Every pull request gets its own isolated preview deployment with a unique URL, automatically cleaned up on merge.</p>
          </div>
          <div className="card">
            <div className="card-icon">🌍</div>
            <h4>Custom Domains</h4>
            <p>Set <code>domain: myapp.io</code> or configure a base domain in bootstrap — every app gets <code>appname.yourdomain.io</code> with DNS and SSL handled automatically.</p>
          </div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section className="section">
        <h2 className="section-title">Architecture</h2>
        <p className="section-sub">The operator sets up the platform once. Developers just push.</p>
        <div className="arch">
          <div className="arch-col">
            <h4>Developer repo</h4>
            <div className="arch-items">
              <div className="arch-item">stackramp.yaml</div>
              <div className="arch-item">.github/workflows/deploy.yml</div>
              <div className="arch-item">frontend/</div>
              <div className="arch-item">backend/</div>
            </div>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-col">
            <h4>StackRamp platform</h4>
            <div className="arch-items">
              <div className="arch-item">Parse config</div>
              <div className="arch-item">Detect changes</div>
              <div className="arch-item">Provision infra (Terraform)</div>
              <div className="arch-item">Build &amp; deploy</div>
            </div>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-col">
            <h4>GCP</h4>
            <div className="arch-items">
              <div className="arch-item">Firebase Hosting</div>
              <div className="arch-item">Cloud Run</div>
              <div className="arch-item">HTTPS Load Balancer + IAP</div>
              <div className="arch-item">Cloud SQL (Postgres)</div>
              <div className="arch-item">Secret Manager</div>
              <div className="arch-item">Artifact Registry</div>
              <div className="arch-item">Cloud Storage</div>
              <div className="arch-item">Cloud DNS</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stack ── */}
      <section className="section section-alt">
        <h2 className="section-title">StackRamp deployed itself</h2>
        <p className="section-sub">
          You're looking at <strong>stackramp.io</strong> — the StackRamp marketing site, running on StackRamp.
          No manual Terraform. No console clicks. Just a <code>stackramp.yaml</code> and a push.
        </p>
        <div className="stack">
          <div className="stack-item"><Badge>Frontend</Badge> React + Vite → Firebase Hosting @ stackramp.io</div>
          <div className="stack-item"><Badge>Backend</Badge> Python FastAPI → Cloud Run (powers the live clock above)</div>
          <div className="stack-item"><Badge>DNS</Badge> Cloud DNS zone provisioned by bootstrap, A records by platform Terraform</div>
          <div className="stack-item"><Badge>SSL</Badge> Issued automatically by Firebase / Let's Encrypt</div>
          <div className="stack-item"><Badge>Auth</Badge> Workload Identity Federation — zero secrets stored anywhere</div>
          <div className="stack-item"><Badge>Secrets</Badge> Platform API keys stored once in GCP Secret Manager, auto-injected into Cloud Run</div>
          <div className="stack-item"><Badge>Config</Badge> <a href="https://github.com/bobbydeveaux/stackramp-example/blob/main/stackramp.yaml" target="_blank" rel="noreferrer">stackramp.yaml</a></div>
          <div className="stack-item"><Badge>Pipeline</Badge> <a href="https://github.com/bobbydeveaux/stackramp-example/blob/main/.github/workflows/deploy.yml" target="_blank" rel="noreferrer">deploy.yml</a></div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>
          Built with <a href="https://github.com/bobbydeveaux/stackramp" target="_blank" rel="noreferrer">StackRamp</a>
          {' · '}
          <Link to="/docs">Docs</Link>
          {' · '}
          <a href="https://github.com/bobbydeveaux/stackramp-example" target="_blank" rel="noreferrer">View source</a>
        </p>
      </footer>

    </div>
  )
}
