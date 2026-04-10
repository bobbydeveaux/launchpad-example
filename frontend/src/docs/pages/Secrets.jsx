import DocPage, { Code, Callout } from '../DocPage.jsx'

export default function Secrets() {
  return (
    <DocPage slug="secrets">
      <p>
        Secrets stored in GCP Secret Manager are automatically injected into Cloud Run
        as environment variables. No config changes needed in <code>stackramp.yaml</code>.
      </p>

      <h2>How it works</h2>
      <p>Secrets are a two-step process:</p>
      <ol>
        <li><strong>Platform operator</strong> defines which secrets exist in the bootstrap <code>tfvars</code> file. This creates empty "shell" secrets in Secret Manager.</li>
        <li><strong>App developer</strong> populates the secret values via <code>gcloud</code> or the GCP Console.</li>
      </ol>

      <h2>Step 1: Define secrets (platform operator)</h2>
      <p>
        In the bootstrap <code>tfvars</code>, the operator lists the secret names that should
        be available to all apps:
      </p>
      <Code>{`# providers/gcp/terraform/bootstrap/dev.tfvars
platform_secrets = [
  "BREVO_API_KEY",
  "BREVO_SMTP_KEY",
  "JWT_SECRET",
  "FROM_EMAIL",
  "ADMIN_SECRET",
]`}</Code>
      <p>
        Running <code>terraform apply</code> creates these as empty Secret Manager secrets.
        Each secret is created per app and per environment using the naming convention below.
      </p>

      <h2>Step 2: Set values (app developer)</h2>
      <p>
        Populate the secret with an actual value:
      </p>
      <Code>{`echo -n "my-secret-value" | gcloud secrets versions add my-app-dev-api-key \\
  --data-file=- --project=YOUR_PROJECT`}</Code>

      <h2>Naming convention</h2>
      <p>
        Secrets follow the pattern <code>{'<app>-<env>-<secret-name>'}</code>.
        The prefix is stripped, and the secret name becomes the env var in Cloud Run.
      </p>
      <ul>
        <li><code>my-app-dev-brevo-api-key</code> → <code>BREVO_API_KEY</code></li>
        <li><code>my-app-prod-jwt-secret</code> → <code>JWT_SECRET</code></li>
        <li><code>my-app-dev-from-email</code> → <code>FROM_EMAIL</code></li>
      </ul>

      <Callout type="info">
        Secrets are environment-scoped. Each app gets its own copy per environment
        (<code>dev</code>, <code>prod</code>), so you can have different values in each.
      </Callout>

      <h2>Database secrets</h2>
      <p>
        When <code>database: postgres</code> is set, the <code>DATABASE_SECRET_NAME</code> env var
        is automatically injected pointing to the Secret Manager secret containing the connection URL.
        This secret is created and managed by the platform — no manual setup needed.
      </p>
    </DocPage>
  )
}
