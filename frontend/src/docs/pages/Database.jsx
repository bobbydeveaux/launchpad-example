import DocPage, { Code, Callout } from '../DocPage.jsx'

export default function Database() {
  return (
    <DocPage slug="database">
      <p>
        Set <code>database: postgres</code> in <code>stackramp.yaml</code> to provision
        a new database within the platform's Cloud SQL instance, connected to your Cloud Run backend.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The platform operator provisions a shared Cloud SQL Postgres instance during bootstrap
        by setting <code>enable_postgres = true</code> in the bootstrap <code>tfvars</code>:
      </p>
      <Code>{`# providers/gcp/terraform/bootstrap/dev.tfvars
enable_postgres     = true
postgres_tier       = "db-f1-micro"
# postgres_private_ip = true  # only if org policy requires it (~£52/month VPC connector cost)`}</Code>
      <p>
        The <code>STACKRAMP_CLOUDSQL_CONNECTION</code> GitHub Variable must also be set
        (format: <code>project:region:instance</code>).
      </p>

      <h2>App configuration</h2>
      <Code>{`name: my-app

backend:
  language: python
  dir: backend

database: postgres`}</Code>

      <h2>What gets provisioned</h2>
      <ul>
        <li>A new database within the shared Cloud SQL instance (per environment)</li>
        <li>A database user and password stored in Secret Manager</li>
        <li>Cloud Run connected via Cloud SQL Auth Proxy (Unix socket)</li>
        <li>The full DSN injected directly as an env var</li>
      </ul>

      <h2>Accessing the database</h2>
      <p>
        The <code>DATABASE_URL</code> env var is injected directly into your Cloud Run service
        with the full connection string. Just read it from the environment — no need to call
        the Secret Manager API yourself:
      </p>
      <Code>{`import os

database_url = os.environ["DATABASE_URL"]
# e.g. postgresql://user:pass@/dbname?host=/cloudsql/project:region:instance`}</Code>

      <Callout type="info">
        The platform handles secret mounting via Cloud Run's native secret references.
        Your app code only needs to read the <code>DATABASE_URL</code> environment variable.
      </Callout>

      <Callout type="info">
        <strong>Cost tip:</strong> By default, Cloud SQL uses public IP with the Cloud SQL Auth Proxy — no
        VPC connector needed. If your org policy requires private IP, set{' '}
        <code>postgres_private_ip = true</code> in the bootstrap tfvars (adds ~£52/month for the VPC connector).
      </Callout>

      <h2>Migrations</h2>
      <p>
        StackRamp can run database migrations <strong>once per deploy</strong>, before the new
        revision receives traffic. Migrations execute as a Cloud Run Job using the same Docker
        image that's about to be deployed — so your migration tooling and app code are always in sync.
      </p>
      <p>
        Add the <code>migrate</code> field to your <code>stackramp.yaml</code>:
      </p>
      <Code>{`name: my-app

backend:
  language: python

database: postgres
migrate: "alembic upgrade head"   # explicit command`}</Code>
      <p>
        Or use <code>migrate: true</code> to use the language default:
      </p>
      <ul>
        <li><strong>Python:</strong> <code>alembic upgrade head</code></li>
        <li><strong>Node:</strong> <code>npx prisma migrate deploy</code></li>
        <li><strong>Go:</strong> <code>atlas migrate apply --url "$DATABASE_URL"</code></li>
      </ul>

      <Callout type="info">
        <strong>How it works:</strong> The platform creates a Cloud Run Job named{' '}
        <code>{'{app}'}-migrate-{'{env}'}</code> that runs your migration command inside the
        newly built Docker image. It has the same Cloud SQL connectivity and Secret Manager
        access as your backend service. The job runs with <code>--wait</code> — if the migration
        fails, the deploy is aborted and your current revision keeps serving.
      </Callout>

      <Callout type="warning">
        <strong>Write backward-compatible migrations.</strong> If a migration succeeds but the
        subsequent deploy fails (e.g. health check timeout), the database will have advanced but
        the old code will still be serving. Always use additive migrations: new tables, new columns
        with defaults, new indexes. Avoid dropping columns or renaming tables in the same deploy
        as the code that stops using them.
      </Callout>
    </DocPage>
  )
}
