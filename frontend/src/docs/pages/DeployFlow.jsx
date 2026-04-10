import DocPage, { Code, Table, Callout } from '../DocPage.jsx'

export default function DeployFlow() {
  return (
    <DocPage slug="deploy-flow">
      <p>Here's exactly what happens when you push code or open a PR.</p>

      <h2>Pipeline stages</h2>
      <Code>{`push to main / PR opened
        │
        ▼
  parse-config
  ┌─────────────────────────────────┐
  │ Reads stackramp.yaml            │
  │ Detects frontend/backend changes│
  └─────────────────────────────────┘
        │
        ▼
  provision (Terraform)
  ┌─────────────────────────────────┐
  │ Firebase Hosting site           │
  │ Custom domain + DNS records     │
  │ Cloud Run service shell         │
  │ GCS bucket (if storage: gcs)    │
  │ IAP + HTTPS LB (if sso: true)  │
  └─────────────────────────────────┘
        │
        ▼
  deploy-backend → deploy-frontend
        │
        ▼ (main branch only)
  deploy-backend-prod → deploy-frontend-prod`}</Code>

      <h2>Branch behaviour</h2>
      <Table
        headers={['Trigger', 'Environment', 'Frontend', 'Backend']}
        rows={[
          ['Push to main', 'dev then prod', 'Firebase live channel', 'Cloud Run'],
          ['Pull request', 'pr-{number}', 'Firebase preview channel', 'Cloud Run (app-pr-N)'],
          ['PR closed', '—', 'Preview deleted', 'Preview deleted'],
          ['workflow_dispatch', 'dev + prod', 'Force redeploy', 'Force redeploy'],
        ]}
      />

      <h2>Change detection</h2>
      <p>
        On pushes, <code>dorny/paths-filter</code> checks which directories changed.
        If only the frontend changed, the backend deploy is skipped, and vice versa.
      </p>

      <Callout type="info">
        PRs and <code>workflow_dispatch</code> bypass change detection and deploy everything.
        PRs need a full deploy so Firebase preview channels can wire API rewrites to the
        PR-scoped Cloud Run service.
      </Callout>

      <h2>Cleanup</h2>
      <p>
        When a PR is closed or merged, the <code>cleanup-preview</code> job runs automatically.
        It deletes the PR-scoped Cloud Run service and the Firebase preview channel.
      </p>
    </DocPage>
  )
}
