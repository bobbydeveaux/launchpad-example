import DocPage, { Code, Callout } from '../DocPage.jsx'

export default function ApiRouting() {
  return (
    <DocPage slug="api-routing">
      <p>
        When your app has a backend, Firebase Hosting rewrites all <code>/api/**</code> requests
        to Cloud Run. Frontend and backend share the same origin — no CORS needed.
      </p>

      <h2>How it works</h2>
      <Code>{`https://my-app.yourdomain.com/           → Firebase Hosting (frontend)
https://my-app.yourdomain.com/api/...    → Cloud Run (backend)`}</Code>

      <p>
        The rewrite is configured automatically in <code>firebase.json</code> during deploy.
        Your backend should listen on the port specified in <code>stackramp.yaml</code> (default <code>8080</code>)
        and serve its routes under <code>/api</code>.
      </p>

      <h2>Frontend API calls</h2>
      <p>Use relative paths from your frontend code:</p>
      <Code>{`// Works in dev, prod, and PR previews
fetch('/api/users')
  .then(res => res.json())
  .then(data => console.log(data))`}</Code>

      <Callout type="info">
        <strong>Direct URL:</strong> The <code>VITE_API_URL</code> env var is set at build time
        to the backend's Cloud Run URL if you need direct calls, but relative paths are preferred.
      </Callout>

      <h2>SSO mode</h2>
      <p>
        When <code>sso: true</code>, the same routing applies — the HTTPS Load Balancer
        forwards <code>/api/*</code> to the backend Cloud Run service and everything else
        to the frontend (nginx) Cloud Run service.
      </p>
    </DocPage>
  )
}
