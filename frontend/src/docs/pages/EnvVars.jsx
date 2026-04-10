import DocPage, { Table, Callout } from '../DocPage.jsx'

export default function EnvVars() {
  return (
    <DocPage slug="env-vars">
      <p>
        StackRamp injects environment variables into every Cloud Run service at deploy time.
        These are available to your backend code automatically.
      </p>

      <h2>Always injected</h2>
      <Table
        headers={['Variable', 'Example', 'Description']}
        rows={[
          ['ENVIRONMENT', 'dev / prod / pr-21', 'Current deployment environment'],
          ['APP_NAME', 'my-app', 'Value of name in stackramp.yaml'],
          ['FRONTEND_URL', 'https://my-app.yourdomain.com', 'Firebase Hosting URL for the same environment'],
        ]}
      />

      <h2>Conditional</h2>
      <Table
        headers={['Variable', 'When', 'Description']}
        rows={[
          ['STORAGE_BUCKET', 'storage: gcs', 'GCS bucket name for the environment'],
          ['DATABASE_SECRET_NAME', 'database: postgres', 'Secret Manager secret name for DB connection URL'],
        ]}
      />

      <h2>Secrets</h2>
      <p>
        Any secrets in Secret Manager matching the pattern <code>{'<app>-<env>-<name>'}</code> are
        injected as env vars with the prefix stripped. See the <a href="/docs/secrets">Secrets</a> page
        for details.
      </p>

      <Callout type="info">
        <strong>Build-time:</strong> The <code>VITE_API_URL</code> variable is set during frontend
        build to the backend Cloud Run URL for direct API access if needed.
      </Callout>
    </DocPage>
  )
}
