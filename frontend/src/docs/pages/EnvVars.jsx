import DocPage, { Table, Callout, Code } from '../DocPage.jsx'

export default function EnvVars() {
  return (
    <DocPage slug="env-vars">
      <p>
        StackRamp injects environment variables into every Cloud Run service at deploy time.
        There are three sources: platform env vars, secret refs, and app-level <code>.env</code> files.
      </p>

      <h2>Platform env vars</h2>
      <p>Always injected into every Cloud Run service:</p>
      <Table
        headers={['Variable', 'Example', 'Description']}
        rows={[
          ['ENVIRONMENT', 'dev / prod / pr-21', 'Current deployment environment'],
          ['APP_NAME', 'my-app', 'Value of name in stackramp.yaml'],
          ['FRONTEND_URL', 'https://my-app.yourdomain.com', 'Firebase Hosting URL for the same environment'],
        ]}
      />

      <h2>Conditional env vars</h2>
      <Table
        headers={['Variable', 'When', 'Description']}
        rows={[
          ['GCS_BUCKET', 'storage: gcs', 'GCS bucket name for the environment'],
          ['DATABASE_URL', 'database: postgres', 'Full DSN connection string (mounted from Secret Manager)'],
        ]}
      />

      <h2>Platform secrets (auto-discovered)</h2>
      <p>
        Secrets labelled <code>platform-inject=true</code> in Secret Manager are automatically
        discovered and mounted into every Cloud Run service. The platform operator defines these
        in the bootstrap terraform:
      </p>
      <Code>{`# bootstrap terraform creates secrets with this label:
resource "google_secret_manager_secret" "platform" {
  for_each  = toset(var.platform_secrets)
  secret_id = each.value

  labels = {
    platform-inject = "true"
  }
}`}</Code>
      <p>
        At deploy time, StackRamp runs <code>gcloud secrets list --filter="labels.platform-inject=true"</code> and
        mounts every matching secret into Cloud Run. No workflow changes are needed when the platform
        team adds a new secret — just add it to the bootstrap <code>platform_secrets</code> list and
        populate its value.
      </p>

      <h2>App-level .env files</h2>
      <p>
        For non-sensitive, per-environment config, commit a <code>.env.dev</code> or <code>.env.prod</code> file
        in your backend directory. These are loaded automatically at deploy time:
      </p>
      <Code>{`# backend/.env.dev
LOG_LEVEL=debug
FEATURE_FLAG_NEW_UI=true`}</Code>

      <Callout type="info">
        <strong>Build-time:</strong> The <code>VITE_API_URL</code> variable is set during frontend
        build to the backend's Cloud Run URL for direct API access if needed.
      </Callout>
    </DocPage>
  )
}
