import DocPage, { Code, Table, Callout } from '../DocPage.jsx'

export default function Sso() {
  return (
    <DocPage slug="sso">
      <p>
        Set <code>sso: true</code> on your frontend and/or backend to put the app behind
        Google Identity-Aware Proxy (IAP). Only authenticated users from your domain can access the app.
      </p>

      <Callout type="info">
        <strong>v2:</strong> on backends, <code>sso: true</code> is sugar for{' '}
        <code>access: iap</code> — the explicit form is preferred going forward. See{' '}
        <a href="/docs/access-model">Backends &amp; Access Model</a>.
      </Callout>

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
        With SSO enabled, IAP is enabled directly on the frontend Cloud Run service — no load
        balancer required. The frontend container proxies <code>/api/*</code> to the backend
        with a service-to-service identity token, so both services share a single origin and
        IAP session.
      </p>

      <h3>Permissive GCP orgs</h3>
      <p>
        On GCP orgs that allow <code>allUsers</code> IAM bindings, the frontend uses an nginx
        container that reverse-proxies <code>/api/*</code> to the backend:
      </p>
      <Code>{`User --> Cloud Run (IAP) --> nginx (frontend)
                            --> /api/* --> Cloud Run (backend, authenticated)`}</Code>

      <h3>Restrictive GCP orgs</h3>
      <p>
        On GCP orgs with <code>iam.allowedPolicyMemberDomains</code> constraints (which block
        <code>allUsers</code>), StackRamp uses a Go reverse proxy and VPC connector:
      </p>
      <Code>{`User --> Cloud Run (IAP) --> Go proxy (frontend, VPC egress)
                            --> /api/* --> Cloud Run (backend, internal ingress)`}</Code>

      <ul>
        <li>IAP enabled natively on frontend Cloud Run via <code>iap_enabled = true</code></li>
        <li>Backend uses <code>--ingress=internal</code> (only reachable via VPC)</li>
        <li>Go proxy fetches identity tokens from the metadata server (cached for 50 min)</li>
        <li>Custom domains via Cloud Run domain mappings with automatic SSL</li>
        <li>Firebase Hosting is <strong>not</strong> used — frontend is served from Cloud Run</li>
        <li>No load balancer — significantly lower cost (~£55/month saved per environment)</li>
      </ul>

      <Callout type="warning">
        <strong>IAP header forwarding:</strong> The Go proxy builds a clean HTTP request for each
        <code>/api/*</code> call. This is critical — if browser headers (especially{' '}
        <code>X-Goog-Iap-Jwt-Assertion</code>) are forwarded to the backend, Cloud Run's auth
        layer picks up the IAP JWT instead of the service-to-service identity token, causing 401s.
      </Callout>

      <h2>Identity &amp; proxy headers</h2>
      <p>
        IAP authenticates the user at the frontend and attaches identity headers. What your{' '}
        <strong>backend</strong> receives on <code>/api/*</code> depends on which proxy path
        your org uses:
      </p>

      <h3>Restrictive orgs (Go proxy)</h3>
      <p>
        The Go proxy builds a fresh request per call — browser headers, cookies, and the IAP JWT
        are <strong>not</strong> forwarded. The backend receives:
      </p>
      <Table
        headers={['Header', 'Value']}
        rows={[
          ['Authorization', 'Bearer <service-to-service ID token> (audience = backend URL, minted by the proxy, cached 50 min)'],
          ['X-Stackramp-User-Email', 'The IAP-authenticated user\'s email — from X-Goog-Authenticated-User-Email with the accounts.google.com: prefix stripped'],
          ['X-Stackramp-User-Id', 'The user\'s stable Google account ID — from X-Goog-Authenticated-User-Id, prefix stripped'],
          ['Content-Type / Accept / Accept-Language / Content-Length', 'Forwarded from the browser request — everything else is dropped'],
        ]}
      />
      <p>
        Query strings and request bodies pass through unchanged; response headers come back as-is.
        Because the backend has <code>--ingress=internal</code> and invoker-restricted IAM, the{' '}
        <code>X-Stackramp-*</code> headers can only have been set by the proxy — treat them as the
        authoritative user identity:
      </p>
      <Code>{`# backend (FastAPI example)
@app.get("/api/me")
def me(request: Request):
    return {"email": request.headers.get("X-Stackramp-User-Email")}`}</Code>

      <h3>Permissive orgs (nginx proxy)</h3>
      <p>
        nginx forwards the browser request mostly as-is, so the backend sees IAP's raw headers
        instead:
      </p>
      <Table
        headers={['Header', 'Value']}
        rows={[
          ['X-Goog-Authenticated-User-Email', 'accounts.google.com:user@yourdomain.com — strip the prefix yourself'],
          ['X-Goog-Authenticated-User-Id', 'accounts.google.com:<numeric account id>'],
          ['X-Goog-Iap-Jwt-Assertion', 'The signed IAP JWT — verify this if you need cryptographic proof of identity'],
          ['X-Real-IP / X-Forwarded-For / X-Forwarded-Proto', 'Standard proxy headers added by nginx'],
        ]}
      />

      <Callout type="info">
        <strong>Portable backends</strong> should check <code>X-Stackramp-User-Email</code> first
        and fall back to <code>X-Goog-Authenticated-User-Email</code> (stripping the{' '}
        <code>accounts.google.com:</code> prefix) so the same code runs on either org type.
      </Callout>

      <Callout type="warning">
        <strong>Cookies don't reach the backend</strong> on the Go proxy path — the fresh request
        drops them. Keep session state in the identity headers or tokens your frontend passes
        explicitly in forwarded headers.
      </Callout>

      <h2>Access control</h2>
      <Table
        headers={['STACKRAMP_IAP_DOMAIN', 'Who can access']}
        rows={[
          ['yourcompany.com', 'Any Google account @yourcompany.com'],
          ['(unset)', 'Any authenticated Google account'],
        ]}
      />

      <h2>Restrictive org setup</h2>
      <p>
        If your GCP org has policies that block <code>allUsers</code> IAM bindings, you need
        two additional GitHub Variables:
      </p>
      <Table
        headers={['Variable', 'Description']}
        rows={[
          ['STACKRAMP_VPC_CONNECTOR', 'Serverless VPC connector name (created by bootstrap when postgres_private_ip = true)'],
          ['STACKRAMP_FRONTEND_SA', 'Custom service account email for the frontend Cloud Run service'],
        ]}
      />
      <p>
        <code>STACKRAMP_FRONTEND_SA</code> is needed when the default compute service account
        lacks permissions in restrictive orgs. The platform grants this SA <code>roles/run.invoker</code>{' '}
        on the backend for service-to-service auth.
      </p>

      <h2>One-time operator setup</h2>
      <ol>
        <li>Verify your domain in <a href="https://search.google.com/search-console">Google Search Console</a> (required for Cloud Run domain mappings)</li>
        <li>Add the CI/CD service account as a verified owner of the domain:<br />
          <code>{'stackramp-cicd-sa@<PROJECT>.iam.gserviceaccount.com'}</code></li>
        <li>Set <code>STACKRAMP_IAP_DOMAIN</code> as a GitHub Variable to restrict access to your domain</li>
        <li>(Restrictive orgs) Create a custom frontend SA and set <code>STACKRAMP_FRONTEND_SA</code></li>
        <li>(Restrictive orgs) Bootstrap with <code>postgres_private_ip = true</code> and set <code>STACKRAMP_VPC_CONNECTOR</code></li>
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
