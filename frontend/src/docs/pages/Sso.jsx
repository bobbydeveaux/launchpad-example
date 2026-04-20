import DocPage, { Code, Table, Callout } from '../DocPage.jsx'

export default function Sso() {
  return (
    <DocPage slug="sso">
      <p>
        Set <code>sso: true</code> on your frontend and/or backend to put the app behind
        Google Identity-Aware Proxy (IAP). Only authenticated users from your domain can access the app.
      </p>

      <h2>Configuration</h2>
      <Code>{`name: my-app

domain: my-app.yourdomain.com

frontend:
  framework: react
  sso: true

backend:
  language: python
  sso: true`}</Code>

      <h2>Architecture</h2>
      <p>
        With SSO enabled, IAP is enabled directly on Cloud Run services — no load balancer required.
        The frontend nginx container reverse-proxies <code>/api/*</code> to the backend, so both
        services share a single origin and IAP session.
      </p>
      <Code>{`User → Cloud Run (IAP) → nginx (frontend)
                          → /api/* → Cloud Run (backend)`}</Code>

      <ul>
        <li>IAP enabled natively on Cloud Run via <code>iap_enabled = true</code></li>
        <li>Custom domains via Cloud Run domain mappings with automatic SSL</li>
        <li>Nginx reverse proxy handles <code>/api/*</code> routing to the backend</li>
        <li>Firebase Hosting is <strong>not</strong> used — frontend is nginx on Cloud Run</li>
        <li>No load balancer — significantly lower cost (~£55/month saved per environment)</li>
      </ul>

      <h2>Access control</h2>
      <Table
        headers={['STACKRAMP_IAP_DOMAIN', 'Who can access']}
        rows={[
          ['yourcompany.com', 'Any Google account @yourcompany.com'],
          ['(unset)', 'Any authenticated Google account'],
        ]}
      />

      <h2>One-time operator setup</h2>
      <ol>
        <li>Verify your domain in <a href="https://search.google.com/search-console">Google Search Console</a> (required for Cloud Run domain mappings)</li>
        <li>Add the CI/CD service account as a verified owner of the domain:<br />
          <code>{'stackramp-cicd-sa@<PROJECT>.iam.gserviceaccount.com'}</code></li>
        <li>Set <code>STACKRAMP_IAP_DOMAIN</code> as a GitHub Variable to restrict access to your domain</li>
      </ol>

      <Callout type="info">
        <strong>Region requirement:</strong> Cloud Run domain mappings are only supported in certain
        regions (e.g. <code>europe-west1</code>, <code>us-central1</code>). The default region
        (<code>europe-west1</code>) is supported. See the{' '}
        <a href="https://cloud.google.com/run/docs/mapping-custom-domains">GCP docs</a> for
        the full list.
      </Callout>

      <Callout type="info">
        <strong>Toggling off:</strong> Set <code>sso: false</code> and the platform destroys
        IAP resources and re-provisions Firebase Hosting automatically on the next push.
      </Callout>
    </DocPage>
  )
}
