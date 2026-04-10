import DocPage, { Code, Callout } from '../DocPage.jsx'

export default function Secrets() {
  return (
    <DocPage slug="secrets">
      <p>
        Secrets stored in GCP Secret Manager are automatically injected into Cloud Run
        as environment variables. No config changes needed in <code>stackramp.yaml</code>.
      </p>

      <h2>Naming convention</h2>
      <p>
        Create secrets matching the pattern <code>{'<app>-<env>-<secret-name>'}</code>.
        The prefix is stripped, and the secret name becomes the env var.
      </p>

      <Code>{`# Create a secret
echo -n "my-secret-value" | gcloud secrets create my-app-dev-api-key \\
  --data-file=- --project=YOUR_PROJECT

# Result: API_KEY env var available in Cloud Run`}</Code>

      <h2>Examples</h2>
      <ul>
        <li><code>my-app-dev-brevo-api-key</code> → <code>BREVO_API_KEY</code></li>
        <li><code>my-app-prod-jwt-secret</code> → <code>JWT_SECRET</code></li>
        <li><code>my-app-dev-from-email</code> → <code>FROM_EMAIL</code></li>
      </ul>

      <Callout type="info">
        Secrets are environment-scoped. Create separate secrets for <code>dev</code> and <code>prod</code> environments.
      </Callout>

      <h2>Database secrets</h2>
      <p>
        When <code>database: postgres</code> is set, the <code>DATABASE_SECRET_NAME</code> env var
        is automatically injected pointing to the Secret Manager secret containing the connection URL.
      </p>
    </DocPage>
  )
}
