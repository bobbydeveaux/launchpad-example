import DocPage, { Code, Callout } from '../DocPage.jsx'

export default function Database() {
  return (
    <DocPage slug="database">
      <p>
        Set <code>database: postgres</code> in <code>stackramp.yaml</code> to provision
        a Cloud SQL Postgres instance connected to your Cloud Run backend.
      </p>

      <h2>Configuration</h2>
      <Code>{`name: my-app

backend:
  language: python
  dir: backend

database: postgres`}</Code>

      <h2>What gets provisioned</h2>
      <ul>
        <li>Cloud SQL Postgres instance (shared across environments)</li>
        <li>Per-environment database within the instance</li>
        <li>Connection string stored in Secret Manager</li>
        <li>Cloud Run connected via Cloud SQL Auth Proxy (Unix socket)</li>
      </ul>

      <h2>Accessing the database</h2>
      <p>
        The <code>DATABASE_SECRET_NAME</code> env var points to the Secret Manager secret
        containing your connection URL. Read it at startup:
      </p>
      <Code>{`import os
from google.cloud import secretmanager

client = secretmanager.SecretManagerServiceClient()
secret_name = os.environ["DATABASE_SECRET_NAME"]
response = client.access_secret_version(name=f"{secret_name}/versions/latest")
database_url = response.payload.data.decode("utf-8")`}</Code>

      <Callout type="info">
        <strong>Prerequisite:</strong> The <code>STACKRAMP_CLOUDSQL_CONNECTION</code> GitHub Variable
        must be set to the Cloud SQL connection name (format: <code>project:region:instance</code>).
      </Callout>

      <h2>Migrations</h2>
      <p>
        Database migrations are an app-level concern. StackRamp provisions the database
        but does not run migrations automatically. Run them as part of your backend startup
        or as a separate CI step.
      </p>
    </DocPage>
  )
}
