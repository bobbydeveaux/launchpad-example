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
      <p>With SSO enabled, the traffic flow changes:</p>
      <Code>{`User → HTTPS LB (IAP) → /api/* → Cloud Run (backend)
                      → /*     → Cloud Run (nginx, frontend)`}</Code>

      <ul>
        <li>Global HTTPS Load Balancer with managed SSL certificate</li>
        <li>Identity-Aware Proxy enforcing authentication on both services</li>
        <li>Serverless NEGs routing LB traffic to Cloud Run</li>
        <li>Cloud Run restricted to <code>internal-and-cloud-load-balancing</code> ingress</li>
        <li>Firebase Hosting is <strong>not</strong> used — frontend is nginx on Cloud Run</li>
      </ul>

      <h2>Access control</h2>
      <Table
        headers={['STACKRAMP_IAP_DOMAIN', 'Who can access']}
        rows={[
          ['bobbyjason.co.uk', 'Any Google account @bobbyjason.co.uk'],
          ['(unset)', 'Any authenticated Google account'],
        ]}
      />

      <h2>One-time operator setup</h2>
      <ol>
        <li>Create an OAuth 2.0 Web Client in GCP Console (APIs & Services → Credentials)</li>
        <li>Add the IAP redirect URI as an authorised redirect URI</li>
        <li>Store client ID and secret in Secret Manager: <code>stackramp-iap-client-id</code> and <code>stackramp-iap-client-secret</code></li>
        <li>Optionally set <code>STACKRAMP_IAP_DOMAIN</code> as a GitHub Variable</li>
      </ol>

      <Callout type="info">
        <strong>Toggling off:</strong> Set <code>sso: false</code> and the platform destroys
        LB/IAP resources and re-provisions Firebase Hosting automatically on the next push.
      </Callout>
    </DocPage>
  )
}
